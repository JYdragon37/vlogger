import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Animated,
  Alert,
  TextInput,
} from "react-native";
import RAnimated, {
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  useAnimatedProps,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";

// 숫자 카운터용 — re-render 없이 UI 스레드에서 직접 처리
const AnimatedTextInput = RAnimated.createAnimatedComponent(TextInput);
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AudioModule, createAudioPlayer, setAudioModeAsync, RecordingPresets, IOSOutputFormat, AudioQuality, requestRecordingPermissionsAsync, type RecordingOptions } from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { useAppStore, type LessonReward } from "@/store/useAppStore";
import { saveUserData } from "@/lib/firestore";
import { generateVlogScript, generateLessonFeedback, type ScriptResult, type ExpressionWithExplanation } from "@/lib/openai";
import {
  EmmaSession,
  buildEmmaPrompt,
  pcm16DeltasToWavBase64,
  wavBase64ToPcm16Base64,
} from "@/lib/realtime";

const C = {
  bg: "#0F0F0F",
  card: "#1A1A1A",
  card2: "#222",
  red: "#FF0000",
  white: "#FFF",
  gray1: "#AAA",
  gray2: "#888",
  gray4: "#555",
  green: "#4CAF50",
  blue: "#4A90E2",
};

// ─── Script bold parser ──────────────────────────────────

function ScriptText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <Text style={s.scriptBody}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={s.scriptBold}>{part}</Text>
        ) : (
          <Text key={i}>{part}</Text>
        )
      )}
    </Text>
  );
}

// OpenAI Realtime이 요구하는 PCM16 24kHz mono WAV 포맷
const PCM16_RECORDING: RecordingOptions = {
  extension: ".wav",
  sampleRate: 24000,
  numberOfChannels: 1,
  bitRate: 384000,
  android: { outputFormat: "default", audioEncoder: "default" },
  ios: {
    outputFormat: IOSOutputFormat.LINEARPCM,
    audioQuality: AudioQuality.MAX,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {},
};

// ─── Emma Call Screen (Modal) ────────────────────────────

interface ChatMessage { role: "emma" | "user"; text: string; partial?: boolean; }

interface EmmaCallProps {
  visible: boolean;
  script: { script: string; expressions: string[] };
  userName: string;
  englishLevel: string;
  onEnd: (callSeconds: number, conversation: ChatMessage[]) => void;
}

function EmmaCallModal({ visible, script, userName, englishLevel, onEnd }: EmmaCallProps) {
  const [callStatus, setCallStatus] = useState<
    "connecting" | "active" | "processing" | "emma_speaking" | "user_speaking" | "ended"
  >("connecting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const sessionRef = useRef<EmmaSession | null>(null);
  const recordingRef = useRef<any>(null);
  const soundRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callSecondsRef = useRef(0);
  const audioDeltasRef = useRef<string[]>([]);
  const pendingTranscriptRef = useRef("");  // audio_done 전까지 텍스트 버퍼
  const endedRef = useRef(false);           // endCall 중복 방지
  const messagesRef = useRef<ChatMessage[]>([]);
  const chatScrollRef = useRef<ScrollView>(null);

  // 타이머
  useEffect(() => {
    if (["active", "processing", "emma_speaking", "user_speaking"].includes(callStatus)) {
      timerRef.current = setInterval(() => {
        setCallSeconds((s) => { callSecondsRef.current = s + 1; return s + 1; });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  // 연결 시작
  useEffect(() => {
    if (!visible) return;
    // 상태 초기화
    setCallStatus("connecting");
    setMessages([]);
    setCallSeconds(0);
    setIsRecording(false);
    callSecondsRef.current = 0;
    audioDeltasRef.current = [];
    pendingTranscriptRef.current = "";
    startCall();
    return () => { endCall(); };
  }, [visible]);

  // 새 메시지 오면 스크롤 하단 + ref 동기화
  useEffect(() => {
    messagesRef.current = messages;
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages]);

  const startCall = async () => {
    endedRef.current = false;
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "";
    if (!apiKey) { Alert.alert("오류", "API 키가 없습니다."); onEnd(0); return; }

    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

    const session = new EmmaSession();
    sessionRef.current = session;

    session.onEvent(async (event) => {
      switch (event.type) {
        case "session_ready":
          setCallStatus("active");
          session.triggerGreeting();
          break;

        case "audio_delta":
          audioDeltasRef.current.push(event.delta);
          setCallStatus("emma_speaking");
          break;

        case "audio_done": {
          // 오디오 재생 시작과 함께 버퍼된 텍스트를 표시
          const buffered = pendingTranscriptRef.current;
          pendingTranscriptRef.current = "";
          if (buffered) {
            setMessages((prev) => [...prev, { role: "emma", text: buffered, partial: true }]);
          }
          await playEmmaAudio(audioDeltasRef.current);
          audioDeltasRef.current = [];
          setCallStatus("active");
          break;
        }

        case "transcript_delta":
          // 텍스트를 버퍼에 쌓고, 오디오 재생 시점에 한꺼번에 표시
          if (event.delta) {
            pendingTranscriptRef.current += event.delta;
          }
          break;

        case "transcript":
          if (event.text) {
            // 최종 텍스트로 확정 (audio_done 이후에 오므로 바로 표시)
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "emma" && last.partial) {
                return [...prev.slice(0, -1), { role: "emma", text: event.text }];
              }
              return [...prev, { role: "emma", text: event.text }];
            });
          }
          break;

        case "input_transcript":
          if (event.text) {
            setMessages((prev) => [...prev, { role: "user", text: event.text }]);
          }
          break;

        case "error":
          Alert.alert("연결 오류", event.message);
          endCall();
          break;
      }
    });

    try {
      await session.connect(apiKey, buildEmmaPrompt({ userName, script: script.script, expressions: script.expressions, englishLevel }));
    } catch (err: any) {
      Alert.alert("연결 실패", err.message);
      onEnd(0);
    }
  };

  const playEmmaAudio = async (deltas: string[]) => {
    if (deltas.length === 0) return;
    try {
      const wavBase64 = pcm16DeltasToWavBase64(deltas);
      const path = FileSystem.cacheDirectory + "emma_response.wav";
      await FileSystem.writeAsStringAsync(path, wavBase64, { encoding: FileSystem.EncodingType.Base64 });
      if (soundRef.current) { soundRef.current.remove(); }
      const player = createAudioPlayer({ uri: path });
      soundRef.current = player;
      player.play();
    } catch (err) { console.error("Emma 음성 재생 실패:", err); }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // 녹음 중지
      setIsRecording(false);
      setCallStatus("processing");
      try {
        await recordingRef.current?.stop();
        const uri = recordingRef.current?.uri;
        recordingRef.current = null;
        if (!uri) return;
        const wavBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        const pcm16 = wavBase64ToPcm16Base64(wavBase64);
        sessionRef.current?.sendAudio(pcm16);
        sessionRef.current?.commitAudio();  // 버퍼 확정 + 응답 요청
        await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
      } catch (err) {
        console.error("녹음 처리 실패:", err);
        setCallStatus("active");
      }
    } else {
      // 녹음 시작
      setIsRecording(true);
      setCallStatus("user_speaking");
      try {
        if (soundRef.current) { soundRef.current.remove(); soundRef.current = null; }
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        const recorder = new AudioModule.AudioRecorder(PCM16_RECORDING);
        recordingRef.current = recorder;
        await recorder.prepareToRecordAsync();
        recorder.record();
      } catch (err: any) {
        setIsRecording(false);
        setCallStatus("active");
        Alert.alert("녹음 오류", err.message ?? "녹음을 시작할 수 없습니다.");
      }
    }
  };

  const endCall = async () => {
    if (endedRef.current) return;  // 중복 호출 방지 (useEffect cleanup)
    endedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    const finalSeconds = callSecondsRef.current;
    if (recordingRef.current) { await recordingRef.current.stop().catch(() => {}); recordingRef.current = null; }
    if (soundRef.current) { soundRef.current.remove(); soundRef.current = null; }
    sessionRef.current?.disconnect();
    sessionRef.current = null;
    setCallStatus("ended");
    onEnd(finalSeconds, messagesRef.current.filter((m) => !m.partial && m.text));
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const statusLabel = callStatus === "connecting" ? "연결 중..."
    : callStatus === "processing" ? "생각하는 중..."
    : callStatus === "emma_speaking" ? "Emma 말하는 중"
    : callStatus === "user_speaking" ? "듣는 중..."
    : "";

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={s.callBg}>
        {/* Header */}
        <View style={s.callHeader}>
          <View style={s.callHeaderLeft}>
            <View style={s.callAvatar}><Text style={{ fontSize: 18 }}>👩‍🏫</Text></View>
            <View>
              <Text style={s.callHeaderText}>Emma</Text>
              {statusLabel ? <Text style={s.callStatusLabel}>{statusLabel}</Text> : null}
            </View>
          </View>
          <Text style={s.callTimer}>{formatTime(callSeconds)}</Text>
        </View>

        {/* 오늘의 표현 고정 박스 */}
        <View style={s.exprStickyBox}>
          <Text style={s.exprStickyLabel}>오늘의 표현</Text>
          <View style={s.exprStickyList}>
            {script.expressions.map((expr, i) => (
              <Text key={i} style={s.exprStickyItem} numberOfLines={1}>
                {i + 1}. {expr}
              </Text>
            ))}
          </View>
        </View>

        {/* Chat messages */}
        <ScrollView
          ref={chatScrollRef}
          style={s.chatScroll}
          contentContainerStyle={s.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {callStatus === "connecting" && (
            <View style={s.connectingRow}>
              <Text style={s.connectingText}>Emma 연결 중...</Text>
            </View>
          )}
          {messages.map((msg, i) => (
            <View key={i} style={[s.msgRow, msg.role === "user" ? s.msgRowUser : s.msgRowEmma]}>
              {msg.role === "emma" && (
                <View style={s.msgAvatar}><Text style={{ fontSize: 14 }}>👩‍🏫</Text></View>
              )}
              <View style={[s.msgBubble, msg.role === "user" ? s.msgBubbleUser : s.msgBubbleEmma]}>
                <Text style={[s.msgText, msg.role === "user" && s.msgTextUser]}>
                  {msg.text}{msg.partial ? "▍" : ""}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Controls */}
        <View style={s.callControls}>
          <Pressable
            style={[s.talkBtn, isRecording && s.talkBtnActive, !isRecording && !["active"].includes(callStatus) && s.talkBtnDisabled]}
            onPress={toggleRecording}
            disabled={!isRecording && callStatus !== "active"}
          >
            <Ionicons name={isRecording ? "stop-circle" : "mic"} size={28} color={isRecording ? C.white : C.gray1} />
            <Text style={[s.talkBtnText, isRecording && { color: C.white }]}>
              {isRecording ? "탭해서 전송" : "탭해서 말하기"}
            </Text>
          </Pressable>
          <Pressable style={s.endCallBtn} onPress={endCall}>
            <Ionicons name="call" size={24} color={C.white} />
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Lesson Reward Modal ─────────────────────────────────

// UI 스레드 worklet — 숫자를 한국어 구독자 포맷으로 변환
function formatCountWorklet(n: number): string {
  "worklet";
  const v = Math.round(n);
  if (v >= 10000) return `${(v / 10000).toFixed(1)}만명`;
  if (v >= 1000) {
    const t = Math.floor(v / 1000);
    const rem = v % 1000;
    return rem > 0 ? `${t},${rem.toString().padStart(3, "0")}명` : `${t},000명`;
  }
  return `${v}명`;
}

function LessonRewardModal({
  visible,
  reward,
  onClose,
}: {
  visible: boolean;
  reward: LessonReward;
  onClose: () => void;
}) {
  // ─── 카드 등장 애니메이션 (기존 RN Animated 유지) ────
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // ─── 구독자 카운터 (Reanimated — UI 스레드 직접 처리) ─
  const startCount = reward.newSubscriberCount - reward.totalGained;
  const counter = useSharedValue(startCount);

  // ─── 배지 펄스 (Game-3) ──────────────────────────────
  const badgeScale = useSharedValue(1);
  const badgeOpacity = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      // 카드 등장
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      // 카운터: 400ms 딜레이 후 1.2초 동안 롤링
      counter.value = startCount;
      counter.value = withTiming(reward.newSubscriberCount, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });

      // 배지 획득 시 펄스 루프
      if (reward.unlockedBadge) {
        badgeScale.value = withRepeat(
          withSequence(
            withTiming(1.25, { duration: 400, easing: Easing.out(Easing.quad) }),
            withTiming(1.0, { duration: 400, easing: Easing.in(Easing.quad) }),
          ),
          -1,
          false,
        );
        badgeOpacity.value = withRepeat(
          withSequence(withTiming(0.7, { duration: 400 }), withTiming(1, { duration: 400 })),
          -1,
          false,
        );
      }
    } else {
      scaleAnim.setValue(0.6);
      opacityAnim.setValue(0);
      counter.value = startCount;
      badgeScale.value = 1;
      badgeOpacity.value = 1;
    }
  }, [visible]);

  const animatedCounterProps = useAnimatedProps(() => ({
    text: formatCountWorklet(counter.value),
    defaultValue: formatCountWorklet(counter.value),
  } as any));

  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeOpacity.value,
  }));

  const badgeLabel = reward.unlockedBadge === "bronze" ? "브론즈 버튼"
    : reward.unlockedBadge === "silver" ? "실버 버튼"
    : reward.unlockedBadge === "gold" ? "골드 버튼"
    : null;

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={r.overlay}>
        <Animated.View style={[r.card, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <Text style={r.emoji}>🎉</Text>
          <Text style={r.title}>수업 완료!</Text>
          <Text style={r.gained}>+{reward.totalGained.toLocaleString()}명</Text>

          <View style={r.breakdown}>
            <View style={r.breakdownRow}>
              <Text style={r.breakdownLabel}>기본 수업 완료</Text>
              <Text style={r.breakdownAmt}>+{reward.base}명</Text>
            </View>
            {reward.bonusItems.map((item, i) => (
              <View key={i} style={r.breakdownRow}>
                <Text style={[r.breakdownLabel, { color: "#FF9800" }]}>🔥 {item.reason}</Text>
                <Text style={[r.breakdownAmt, { color: "#FF9800" }]}>+{item.amount.toLocaleString()}명</Text>
              </View>
            ))}
          </View>

          {badgeLabel && (
            <RAnimated.View style={[r.badgeBox, badgeAnimStyle]}>
              <Text style={r.badgeEmoji}>
                {reward.unlockedBadge === "bronze" ? "🥉" : reward.unlockedBadge === "silver" ? "🥈" : "🥇"}
              </Text>
              <Text style={r.badgeText}>{badgeLabel} 달성!</Text>
            </RAnimated.View>
          )}

          <View style={r.totalRow}>
            <Text style={r.totalLabel}>현재 구독자</Text>
            <AnimatedTextInput
              style={r.totalCount}
              editable={false}
              animatedProps={animatedCounterProps}
            />
          </View>

          <View style={r.streakRow}>
            <Text style={r.streakText}>🔥 {reward.newStreakDays}일 연속 출석 중</Text>
          </View>

          <Pressable style={r.closeBtn} onPress={onClose}>
            <Text style={r.closeBtnText}>계속하기</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Cultural Note Component ────────────────────────────

function BoldText({ text, style }: { text: string; style: any }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        i % 2 === 1 ? <Text key={i} style={[style, { fontWeight: "700", color: "#D4F0D4" }]}>{part}</Text>
                    : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
}

function CulturalNoteCard({ culturalTitle, culturalNote, userName }: { culturalTitle?: string; culturalNote: string; userName: string }) {
  const termBlocks = culturalNote.split(/\n\n/).filter(Boolean);

  return (
    <View style={s.culturalCard}>
      <Text style={s.culturalHeader}>
        🇺🇸 {userName}의 미국 지식 한 스푼{culturalTitle ? `: ${culturalTitle}` : ""}
      </Text>
      {termBlocks.map((block, i) => {
        const colonIdx = block.indexOf(":");
        if (colonIdx > 0 && colonIdx < 30) {
          const term = block.slice(0, colonIdx).trim();
          const desc = block.slice(colonIdx + 1).trim();
          return (
            <View key={i} style={i > 0 ? { marginTop: 14 } : { marginTop: 10 }}>
              <Text style={s.culturalTerm}>{term}</Text>
              <BoldText text={desc} style={s.culturalText} />
            </View>
          );
        }
        return <BoldText key={i} text={block} style={[s.culturalText, i > 0 && { marginTop: 10 }]} />;
      })}
    </View>
  );
}

// ─── Expression Flip Card ───────────────────────────────

function ExpressionFlipCard({ expr, index }: { expr: ExpressionWithExplanation; index: number }) {
  const [flipped, setFlipped] = useState(false);

  // Highlight the phrase within the example sentence
  const renderExample = () => {
    if (!expr.example) return null;
    const phrase = expr.phrase.replace(/\s*\+\s*\w+/g, "").replace(/\s*~\s*/g, "").trim(); // clean pattern markers
    const lowerEx = expr.example.toLowerCase();
    const lowerPh = phrase.toLowerCase();
    const idx = lowerEx.indexOf(lowerPh);
    if (idx >= 0) {
      const before = expr.example.slice(0, idx);
      const match = expr.example.slice(idx, idx + phrase.length);
      const after = expr.example.slice(idx + phrase.length);
      return (
        <Text style={s.flipExampleText}>
          {before}<Text style={s.flipExampleHighlight}>{match}</Text>{after}
        </Text>
      );
    }
    return <Text style={s.flipExampleText}>{expr.example}</Text>;
  };

  return (
    <Pressable onPress={() => setFlipped(!flipped)} style={s.flipCard}>
      <View style={s.flipCardInner}>
        <View style={s.exprNum}>
          <Text style={s.exprNumText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {!flipped ? (
            <>
              <View style={[s.row, { alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }]}>
                <Text style={s.exprPhrase}>{expr.phrase}</Text>
                {expr.label ? <Text style={s.exprLabel}>{expr.label}</Text> : null}
              </View>
              {renderExample()}
              <Text style={s.flipHint}>탭하여 뒤집기</Text>
            </>
          ) : (
            <>
              <Text style={s.flipMeaning}>{expr.meaning}</Text>
              <Text style={s.exprExplanation}>{expr.explanation}</Text>
              <Text style={s.flipHint}>탭하여 앞면 보기</Text>
            </>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Flashcard Quiz ─────────────────────────────────────

function FlashcardQuiz({ expressions, onFinish }: { expressions: ExpressionWithExplanation[]; onFinish?: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const expr = expressions[currentIdx];

  const makeHint = (phrase: string): string => {
    return phrase.split(" ")
      .map((word) => word[0] + "_".repeat(Math.max(word.length - 1, 1)))
      .join("  ");
  };

  // 영어 문장에서 핵심 표현을 ____ 로 치환
  const makeBlank = (example: string, phrase: string) => {
    const cleanExample = example.replace(/\*\*/g, "");
    const clean = phrase.replace(/\s*\+\s*\w+/g, "").replace(/\s*~\s*/g, "").trim();
    const lowerEx = cleanExample.toLowerCase();
    const lowerPh = clean.toLowerCase();
    const idx = lowerEx.indexOf(lowerPh);
    if (idx >= 0) {
      const before = cleanExample.slice(0, idx);
      const after = cleanExample.slice(idx + clean.length);
      return { before, blank: makeHint(clean), after, clean };
    }
    return { before: cleanExample, blank: "", after: "", clean };
  };

  const handleSubmit = () => {
    const normalize = (s: string) => s.toLowerCase().trim().replace(/[.,!?]/g, "");
    const correct = normalize(userInput) === normalize(blanked.clean);
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
    setSubmitted(true);
  };

  const advance = () => {
    setSubmitted(false);
    setUserInput("");
    if (currentIdx < expressions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setFinished(true);
      onFinish?.();
    }
  };

  const restart = () => {
    setCurrentIdx(0);
    setSubmitted(false);
    setUserInput("");
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <View style={s.quizCard}>
        <View style={[s.row, { alignItems: "center", marginBottom: 14 }]}>
          <Ionicons name="flash" size={18} color="#FF9800" />
          <Text style={s.quizTitle}>플래시카드 퀴즈</Text>
        </View>
        <View style={s.quizFinished}>
          <Text style={s.quizScoreEmoji}>{score >= 4 ? "🎉" : score >= 2 ? "👍" : "💪"}</Text>
          <Text style={s.quizScoreText}>{score}/{expressions.length} 정답</Text>
          <Text style={s.quizScoreSub}>
            {score >= 4 ? "훌륭해요! 표현을 잘 알고 있어요!" : score >= 2 ? "좋아요! 조금만 더 복습하면 완벽!" : "괜찮아요! 복습하면 금방 익숙해질 거예요!"}
          </Text>
          <Pressable style={s.quizRestartBtn} onPress={restart}>
            <Ionicons name="refresh" size={16} color={C.white} />
            <Text style={s.quizRestartText}>다시 풀기</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const blanked = makeBlank(expr.example || "", expr.phrase);

  return (
    <View style={s.quizCard}>
      <View style={[s.row, { alignItems: "center", justifyContent: "space-between", marginBottom: 14 }]}>
        <View style={[s.row, { alignItems: "center" }]}>
          <Ionicons name="flash" size={18} color="#FF9800" />
          <Text style={s.quizTitle}>플래시카드 퀴즈</Text>
        </View>
        <Text style={s.quizProgress}>{currentIdx + 1}/{expressions.length}</Text>
      </View>

      {/* 상황 (한국어 해석) */}
      <Text style={s.quizSituation}>{expr.meaning}</Text>

      {/* 영어 문장 + 빈칸 */}
      <View style={s.quizQuestion}>
        <Text style={s.quizSentence}>
          {blanked.before}<Text style={s.quizBlank}>{blanked.blank}</Text>{blanked.after}
        </Text>
        <Text style={s.quizPrompt}>빈칸에 들어갈 표현은?</Text>
      </View>

      {!submitted ? (
        <View>
          <TextInput
            style={s.quizInput}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="여기에 입력하세요"
            placeholderTextColor={C.gray4}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleSubmit}
            returnKeyType="done"
          />
          <Pressable style={s.quizSubmitBtn} onPress={handleSubmit}>
            <Text style={s.quizShowBtnText}>제출</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <Text style={isCorrect ? s.quizCorrect : s.quizWrong}>
            {isCorrect ? "✓ 정답!" : "✗ 오답"}
          </Text>
          <View style={s.quizAnswer}>
            <Text style={s.quizAnswerPhrase}>{expr.phrase}</Text>
            <Text style={s.quizAnswerExplanation}>{expr.explanation}</Text>
          </View>
          <Pressable style={[s.quizBtn, s.quizBtnRight, { justifyContent: "center" }]} onPress={advance}>
            <Text style={[s.quizBtnText, { color: C.green }]}>다음</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Lesson Content (script loaded) ─────────────────────

function LessonContent({ script, onCallStart, onRegen, onQuizFinish }: {
  script: ScriptResult;
  onCallStart: () => void;
  onRegen: () => void;
  onQuizFinish?: () => void;
}) {
  const { userProfile } = useAppStore();
  const userName = userProfile.name || "학습자";

  return (
    <View>
      {/* Topic Badge */}
      <View style={s.topicBadge}>
        <Ionicons name="videocam" size={14} color={C.red} />
        <Text style={s.topicText}>{script.topic}</Text>
      </View>

      {/* Cultural Note Card */}
      {script.culturalNote ? (
        <CulturalNoteCard
          culturalTitle={script.culturalTitle}
          culturalNote={script.culturalNote}
          userName={userName}
        />
      ) : null}

      {/* Script Card */}
      <View style={s.scriptCard}>
        <View style={[s.row, { alignItems: "center", marginBottom: 14 }]}>
          <Ionicons name="document-text" size={18} color={C.red} />
          <Text style={s.scriptTitle}>오늘의 스크립트</Text>
        </View>
        <ScriptText text={script.script} />
      </View>

      {/* Expressions — Flip Cards */}
      <View style={s.exprCard}>
        <View style={[s.row, { alignItems: "center", marginBottom: 14 }]}>
          <Ionicons name="school" size={18} color={C.green} />
          <Text style={s.exprTitle}>핵심 표현 5개</Text>
        </View>
        {script.expressions.map((expr, i) => (
          <ExpressionFlipCard key={i} expr={expr} index={i} />
        ))}
      </View>

      {/* Flashcard Quiz */}
      <FlashcardQuiz expressions={script.expressions} onFinish={onQuizFinish} />

      {/* Emma Call Button */}
      <Pressable style={s.callBtn} onPress={onCallStart}>
        <View style={s.callBtnIcon}>
          <Ionicons name="call" size={22} color={C.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.callBtnTitle}>Emma에게 전화받기</Text>
          <Text style={s.callBtnSub}>스크립트를 읽고 나서 시작하세요</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={C.gray2} />
      </Pressable>

      {/* Regen */}
      <Pressable style={s.regenBtn} onPress={onRegen}>
        <Ionicons name="refresh" size={16} color={C.gray2} />
        <Text style={s.regenText}>다른 주제로 다시 생성</Text>
      </Pressable>
    </View>
  );
}

// ─── Main Lesson Screen ──────────────────────────────────

export default function LessonScreen() {
  const { lessonSchedule, userProfile, completeLesson, addEpisode, updateEpisode, user } = useAppStore();
  const router = useRouter();
  const days = lessonSchedule.days.join(" · ");
  const time = lessonSchedule.timeSlots[0] || "07:00";

  const scrollRef = useRef<import("react-native").ScrollView>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [script, setScript] = useState<ScriptResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [callVisible, setCallVisible] = useState(false);
  const [reward, setReward] = useState<LessonReward | null>(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(null);

  const steps = [
    { icon: "document-text-outline" as const, label: "스크립트 읽기", time: "2분" },
    { icon: "school-outline" as const, label: "핵심 표현 5개 학습", time: "2분" },
    { icon: "flash-outline" as const, label: "플래시카드 퀴즈", time: "1분" },
    { icon: "call-outline" as const, label: "Emma 전화영어", time: "5~10분" },
    { icon: "stats-chart-outline" as const, label: "피드백 리포트", time: "-" },
  ];

  const fetchScript = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const result = await generateVlogScript({
        name: userProfile.name,
        gender: userProfile.gender ?? "prefer_not_to_say",
        job: userProfile.job,
        location: userProfile.location,
        hobbies: userProfile.hobbies,
        englishLevel: userProfile.englishLevel,
      });
      setScript(result);
      setStatus("done");
    } catch (err: any) {
      setErrorMsg(err.message ?? "스크립트 생성에 실패했습니다.");
      setStatus("error");
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>수업</Text>

        {/* ─── Next Lesson Card ─── */}
        <View style={s.card}>
          <View style={s.row}>
            <View style={s.iconCircle}>
              <Ionicons name="call" size={20} color={C.white} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>다음 수업 예정</Text>
              <Text style={s.cardSub}>Emma와 전화영어</Text>
            </View>
          </View>
          <View style={s.schedBox}>
            <View style={[s.row, { alignItems: "center", marginBottom: 8 }]}>
              <Ionicons name="calendar-outline" size={16} color={C.gray1} />
              <Text style={s.schedText}>{days}</Text>
            </View>
            <View style={[s.row, { alignItems: "center" }]}>
              <Ionicons name="time-outline" size={16} color={C.gray1} />
              <Text style={s.schedText}>1순위 {time}</Text>
            </View>
          </View>
        </View>

        {/* ─── Steps Card ─── */}
        <View style={s.card}>
          <Text style={s.stepsTitle}>학습 루프</Text>
          {steps.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <View style={s.stepNum}>
                <Text style={s.stepNumText}>{i + 1}</Text>
              </View>
              <Ionicons name={step.icon} size={18} color={C.gray1} />
              <Text style={s.stepLabel}>{step.label}</Text>
              <Text style={s.stepTime}>{step.time}</Text>
            </View>
          ))}
        </View>

        {/* ─── Script / Call Section ─── */}
        {status === "idle" && (
          <Pressable style={s.startBtn} onPress={fetchScript}>
            <Ionicons name="play-circle" size={22} color={C.white} />
            <Text style={s.startBtnText}>오늘의 수업 시작하기</Text>
          </Pressable>
        )}

        {status === "loading" && (
          <View style={s.loadingCard}>
            <ActivityIndicator color={C.red} size="large" />
            <Text style={s.loadingText}>AI가 오늘의 스크립트를 만들고 있어요...</Text>
          </View>
        )}

        {status === "error" && (
          <View style={s.errorCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF6B6B" />
            <Text style={s.errorText}>{errorMsg}</Text>
            <Pressable style={s.retryBtn} onPress={fetchScript}>
              <Text style={s.retryText}>다시 시도</Text>
            </Pressable>
          </View>
        )}

        {status === "done" && script && (
          <LessonContent
            script={script}
            onQuizFinish={() => {
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
            }}
            onCallStart={async () => {
              const { granted } = await requestRecordingPermissionsAsync();
              if (!granted) {
                Alert.alert(
                  "마이크 권한 필요",
                  "Emma와 통화하려면 마이크 접근이 필요합니다.\n설정 → Vlogger → 마이크를 허용해주세요."
                );
                return;
              }
              setCallVisible(true);
            }}
            onRegen={fetchScript}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Emma Call Modal */}
      {script && (
        <EmmaCallModal
          visible={callVisible}
          script={{
            script: script.script,
            expressions: script.expressions.map((e) => e.phrase),
          }}
          userName={userProfile.name || "학습자"}
          englishLevel={userProfile.englishLevel}
          onEnd={(callSeconds, conversation) => {
            setCallVisible(false);
            if (callSeconds < 3) {
              Alert.alert(
                "통화 종료",
                "대화가 너무 짧아 수업이 기록되지 않았어요.\n최소 3초 이상 대화해야 합니다.",
                [{ text: "확인" }]
              );
              return;
            }
            {
              // 에피소드 추가 (학습 표현 + 스크립트 포함)
              const episodeId = Date.now().toString();
              setCurrentEpisodeId(episodeId);
              addEpisode({
                id: episodeId,
                title: script.topic,
                thumbnailUrl: null,
                date: new Date().toISOString().slice(0, 10),
                expressionsUsed: script.expressions.length,
                expressionsTotal: script.expressions.length,
                wpm: 0,
                seriesName: null,
                seriesOrder: null,
                seriesTotal: null,
                durationMinutes: Math.max(1, Math.round(callSeconds / 60)),
                emoji: "🎬",
                script: script.script,
                expressions: script.expressions.map((e) => ({
                  phrase: e.phrase,
                  meaning: e.meaning || e.explanation,
                  nuance: e.explanation,
                })),
              });

              // AI 피드백 생성 (백그라운드)
              if (conversation.length > 0) {
                generateLessonFeedback({
                  userName: userProfile.name || "학습자",
                  topic: script.topic,
                  expressions: script.expressions,
                  conversation,
                  callDurationSeconds: callSeconds,
                }).then((fb) => {
                  const usedCount = fb.expressionTracking.filter((e) => e.used).length;
                  updateEpisode(episodeId, {
                    feedback: fb,
                    expressionsUsed: usedCount,
                  });
                  // 피드백 포함한 최신 상태로 Firestore 재저장
                  const s = useAppStore.getState();
                  if (s.user?.uid) {
                    saveUserData(s.user.uid, {
                      profile: s.userProfile,
                      channelMeta: {
                        channelName: s.channelInfo.channelName,
                        subscriberCount: s.channelInfo.subscriberCount,
                        badge: s.channelInfo.badge,
                        streakDays: s.channelInfo.streakDays,
                        totalTalkTimeMinutes: s.channelInfo.totalTalkTimeMinutes,
                      },
                      episodes: s.channelInfo.episodes,
                      lessonSchedule: s.lessonSchedule,
                      isOnboarded: s.isOnboarded,
                    }).catch((err) => console.error("Firestore 피드백 저장 실패:", err));
                  }
                }).catch((err) => {
                  console.error("피드백 생성 실패:", err);
                  // 영구 null 방지 — fallback feedback 저장
                  updateEpisode(episodeId, {
                    feedback: {
                      summary: "피드백 생성에 실패했습니다. 수업 기록은 저장되었습니다.",
                      corrections: [],
                      expressionTracking: script.expressions.map((e) => ({
                        phrase: e.phrase,
                        used: false,
                        note: "분석 실패",
                      })),
                      vocabularyTips: [],
                      patternTips: [],
                    },
                  });
                });
              }

              // 구독자 증가
              const r = completeLesson();

              // Firestore에 에피소드 + 채널 상태 저장
              const s = useAppStore.getState();
              if (s.user?.uid) {
                saveUserData(s.user.uid, {
                  profile: s.userProfile,
                  channelMeta: {
                    channelName: s.channelInfo.channelName,
                    subscriberCount: s.channelInfo.subscriberCount,
                    badge: s.channelInfo.badge,
                    streakDays: s.channelInfo.streakDays,
                    totalTalkTimeMinutes: s.channelInfo.totalTalkTimeMinutes,
                  },
                  episodes: s.channelInfo.episodes,
                  lessonSchedule: s.lessonSchedule,
                  isOnboarded: s.isOnboarded,
                }).catch((err) => console.error("Firestore 레슨 저장 실패:", err));
              }

              if (r) {
                setReward(r);
              } else {
                router.navigate({ pathname: "/(tabs)/feedback", params: { episodeId } } as any);
              }
            }
          }}
        />
      )}

      {/* Lesson Reward Modal */}
      {reward && (
        <LessonRewardModal
          visible={!!reward}
          reward={reward}
          onClose={() => {
            setReward(null);
            router.navigate({ pathname: "/(tabs)/feedback", params: { episodeId: currentEpisodeId ?? "" } } as any);
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },
  title: { color: C.white, fontSize: 22, fontWeight: "800", marginBottom: 24 },
  row: { flexDirection: "row" },

  card: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 16 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.red, alignItems: "center",
    justifyContent: "center", marginRight: 12,
  },
  cardTitle: { color: C.white, fontSize: 16, fontWeight: "600" },
  cardSub: { color: C.gray2, fontSize: 14, marginTop: 2 },
  schedBox: { backgroundColor: C.bg, borderRadius: 12, padding: 16, marginTop: 12 },
  schedText: { color: C.gray1, fontSize: 14, marginLeft: 8 },

  stepsTitle: { color: C.white, fontSize: 14, fontWeight: "600", marginBottom: 12 },
  stepRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.bg,
  },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.bg, alignItems: "center",
    justifyContent: "center", marginRight: 10,
  },
  stepNumText: { color: C.red, fontSize: 12, fontWeight: "700" },
  stepLabel: { color: C.white, fontSize: 14, flex: 1, marginLeft: 8 },
  stepTime: { color: C.gray2, fontSize: 12 },

  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, backgroundColor: C.red, borderRadius: 16,
    paddingVertical: 18, marginBottom: 16,
  },
  startBtnText: { color: C.white, fontSize: 16, fontWeight: "700" },

  loadingCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 32,
    alignItems: "center", gap: 16, marginBottom: 16,
  },
  loadingText: { color: C.gray2, fontSize: 14, textAlign: "center" },

  errorCard: {
    backgroundColor: C.card, borderRadius: 16, padding: 24,
    alignItems: "center", gap: 12, marginBottom: 16,
  },
  errorText: { color: "#FF6B6B", fontSize: 13, textAlign: "center", lineHeight: 20 },
  retryBtn: {
    backgroundColor: C.card2, borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  retryText: { color: C.white, fontSize: 14, fontWeight: "600" },

  topicBadge: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.card, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, marginBottom: 12,
  },
  topicText: { color: C.white, fontSize: 14, fontWeight: "700", flex: 1 },
  dayBadge: {
    backgroundColor: C.red + "22", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: C.red + "55",
  },
  dayBadgeText: { color: C.red, fontSize: 12, fontWeight: "700" },

  scriptCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 12 },
  scriptTitle: { color: C.white, fontSize: 15, fontWeight: "700", marginLeft: 8 },
  dayTitle: { color: C.gray2, fontSize: 13, marginBottom: 12, marginTop: 4 },
  scriptBody: { color: C.gray1, fontSize: 15, lineHeight: 26 },
  scriptBold: { color: C.white, fontWeight: "700" },

  culturalCard: {
    backgroundColor: "#0D1A0D", borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: "#1A3A1A",
  },
  culturalHeader: { color: "#4CAF50", fontSize: 14, fontWeight: "700" },
  culturalTerm: { color: "#7FD17F", fontSize: 14, fontWeight: "700", marginBottom: 4 },
  culturalText: { color: "#AAC8AA", fontSize: 13, lineHeight: 22 },

  exprCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 12 },
  exprTitle: { color: C.white, fontSize: 15, fontWeight: "700", marginLeft: 8 },
  flipCard: {
    marginBottom: 8, borderRadius: 12,
    backgroundColor: C.bg, overflow: "hidden",
  },
  flipCardInner: {
    flexDirection: "row", alignItems: "flex-start",
    padding: 14,
  },
  flipExampleText: { color: C.gray1, fontSize: 13, lineHeight: 20 },
  flipExampleHighlight: { color: "#FF9800", fontWeight: "700" },
  flipMeaning: { color: C.white, fontSize: 14, fontWeight: "600", lineHeight: 22, marginBottom: 4 },
  flipHint: { color: C.gray4, fontSize: 11, marginTop: 6 },
  exprNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.green + "20", alignItems: "center",
    justifyContent: "center", marginRight: 12, marginTop: 2,
  },
  exprNumText: { color: C.green, fontSize: 12, fontWeight: "700" },
  exprPhrase: { color: C.white, fontSize: 14, fontWeight: "700" },
  exprLabel: {
    color: C.blue, fontSize: 11, fontWeight: "600",
    backgroundColor: C.blue + "18", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  exprExplanation: { color: C.gray2, fontSize: 12, lineHeight: 18, marginTop: 3 },

  // Quiz
  quizCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 12 },
  quizTitle: { color: C.white, fontSize: 15, fontWeight: "700", marginLeft: 8 },
  quizProgress: { color: C.gray2, fontSize: 13, fontWeight: "600" },
  quizSituation: { color: C.white, fontSize: 14, fontWeight: "700", lineHeight: 22, marginBottom: 10, textAlign: "center" },
  quizQuestion: {
    backgroundColor: C.bg, borderRadius: 12, padding: 16, marginBottom: 14, alignItems: "center",
  },
  quizSentence: { color: C.white, fontSize: 15, fontWeight: "500", textAlign: "center", lineHeight: 24 },
  quizBlank: { color: "#FF9800", fontWeight: "800", fontSize: 16 },
  quizHint: { color: "#FF9800", fontSize: 13, letterSpacing: 1, marginTop: 6, textAlign: "center" },
  quizPrompt: { color: C.gray4, fontSize: 12, marginTop: 8 },
  quizInput: {
    backgroundColor: C.bg, borderRadius: 10, padding: 12, color: C.white,
    fontSize: 15, borderWidth: 1, borderColor: C.gray4, marginBottom: 0,
  },
  quizSubmitBtn: {
    backgroundColor: "#FF980020", borderRadius: 12, paddingVertical: 14, alignItems: "center",
    borderWidth: 1, borderColor: "#FF980040", marginTop: 10,
  },
  quizCorrect: { color: C.green, fontSize: 14, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  quizWrong: { color: "#FF6B6B", fontSize: 14, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  quizShowBtn: {
    backgroundColor: "#FF980020", borderRadius: 12, paddingVertical: 14, alignItems: "center",
    borderWidth: 1, borderColor: "#FF980040",
  },
  quizShowBtnText: { color: "#FF9800", fontSize: 14, fontWeight: "700" },
  quizAnswer: {
    backgroundColor: C.bg, borderRadius: 12, padding: 14, marginBottom: 12, alignItems: "center",
  },
  quizAnswerPhrase: { color: "#FF9800", fontSize: 18, fontWeight: "800", marginBottom: 4 },
  quizAnswerExplanation: { color: C.gray2, fontSize: 13, textAlign: "center", lineHeight: 20 },
  quizBtnRow: { flexDirection: "row", gap: 10 },
  quizBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 14, borderWidth: 1 },
  quizBtnWrong: { backgroundColor: "#FF6B6B10", borderColor: "#FF6B6B30" },
  quizBtnRight: { backgroundColor: "#4CAF5010", borderColor: "#4CAF5030" },
  quizBtnText: { fontSize: 13, fontWeight: "600" },
  quizFinished: { alignItems: "center", paddingVertical: 12 },
  quizScoreEmoji: { fontSize: 40, marginBottom: 8 },
  quizScoreText: { color: C.white, fontSize: 24, fontWeight: "800", marginBottom: 4 },
  quizScoreSub: { color: C.gray2, fontSize: 13, textAlign: "center", marginBottom: 16 },
  quizRestartBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
  },
  quizRestartText: { color: C.white, fontSize: 13, fontWeight: "600" },

  callBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderRadius: 16,
    padding: 20, marginBottom: 12, gap: 14,
    borderWidth: 1, borderColor: C.green + "40",
  },
  callBtnIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.green, alignItems: "center", justifyContent: "center",
  },
  callBtnUnavailable: { opacity: 0.5 },
  callBtnTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
  callBtnSub: { color: C.gray2, fontSize: 12, marginTop: 2 },

  regenBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, marginBottom: 16,
  },
  regenText: { color: C.gray2, fontSize: 13 },

  // ─── Call Modal ───────────────────────────────────────
  // ─── Call Modal ───────────────────────────────────────
  callBg: { flex: 1, backgroundColor: "#0A0A0F" },
  callHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#1A1A2A",
  },
  callHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  callAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#1E1E2E", alignItems: "center", justifyContent: "center",
  },
  callHeaderText: { color: C.white, fontSize: 15, fontWeight: "700" },
  callStatusLabel: { color: C.green, fontSize: 12, marginTop: 1 },
  callTimer: { color: C.gray2, fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },

  // 오늘의 표현 고정 박스
  exprStickyBox: {
    backgroundColor: "#111118", paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: "#1A1A2A",
  },
  exprStickyLabel: { color: "#FF9800", fontSize: 11, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
  exprStickyList: { gap: 2 },
  exprStickyItem: { color: "#CCCCCC", fontSize: 14, fontWeight: "700", lineHeight: 22 },

  // 채팅 영역
  chatScroll: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  connectingRow: { alignItems: "center", paddingVertical: 24 },
  connectingText: { color: C.gray4, fontSize: 14 },

  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  msgRowEmma: { justifyContent: "flex-start" },
  msgRowUser: { justifyContent: "flex-end" },
  msgAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#1E1E2E", alignItems: "center", justifyContent: "center",
    marginBottom: 2,
  },
  msgBubble: {
    maxWidth: "72%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
  },
  msgBubbleEmma: {
    backgroundColor: "#1E1E2E", borderBottomLeftRadius: 4,
  },
  msgBubbleUser: {
    backgroundColor: "#2B4DCC", borderBottomRightRadius: 4,
  },
  msgText: { color: C.gray1, fontSize: 14, lineHeight: 22 },
  msgTextUser: { color: C.white },

  callControls: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: "#1A1A2A", gap: 16,
  },
  talkBtn: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: "#1A1A2A", borderRadius: 18,
    paddingVertical: 18, gap: 6,
    borderWidth: 1.5, borderColor: "#2A2A3A",
  },
  talkBtnActive: { backgroundColor: C.green + "25", borderColor: C.green },
  talkBtnDisabled: { opacity: 0.35 },
  talkBtnText: { color: C.gray2, fontSize: 13, fontWeight: "600" },
  endCallBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#E53935", alignItems: "center", justifyContent: "center",
    transform: [{ rotate: "135deg" }],
  },
});

// ─── Reward Modal Styles ──────────────────────────────────

const r = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center", justifyContent: "center", paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#1A1A1A", borderRadius: 24,
    padding: 28, width: "100%", alignItems: "center",
    borderWidth: 1, borderColor: "#333",
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { color: "#AAA", fontSize: 14, fontWeight: "600", marginBottom: 4 },
  gained: { color: "#FFF", fontSize: 40, fontWeight: "900", marginBottom: 20 },

  breakdown: {
    width: "100%", backgroundColor: "#111", borderRadius: 14,
    padding: 16, gap: 10, marginBottom: 16,
  },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  breakdownLabel: { color: "#888", fontSize: 13 },
  breakdownAmt: { color: "#FFF", fontSize: 14, fontWeight: "700" },

  badgeBox: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FF980015", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, marginBottom: 16,
    borderWidth: 1, borderColor: "#FF980040",
  },
  badgeEmoji: { fontSize: 24 },
  badgeText: { color: "#FF9800", fontSize: 14, fontWeight: "700" },

  totalRow: {
    flexDirection: "row", justifyContent: "space-between",
    width: "100%", paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: "#222",
  },
  totalLabel: { color: "#666", fontSize: 13 },
  totalCount: { color: "#FFF", fontSize: 16, fontWeight: "800" },

  streakRow: { paddingBottom: 20 },
  streakText: { color: "#FF9800", fontSize: 13, fontWeight: "600" },

  closeBtn: {
    width: "100%", backgroundColor: "#FF0000",
    borderRadius: 14, paddingVertical: 16, alignItems: "center",
  },
  closeBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
