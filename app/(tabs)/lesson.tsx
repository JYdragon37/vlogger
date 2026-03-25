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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import { useAppStore } from "@/store/useAppStore";
import { generateVlogScript, type ScriptResult } from "@/lib/openai";
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

// ─── Emma Call Screen (Modal) ────────────────────────────

function EmmaCallModal({
  visible,
  script,
  userName,
  englishLevel,
  onEnd,
}: {
  visible: boolean;
  script: ScriptResult;
  userName: string;
  englishLevel: string;
  onEnd: () => void;
}) {
  const [callStatus, setCallStatus] = useState<
    "connecting" | "active" | "emma_speaking" | "user_speaking" | "ended"
  >("connecting");
  const [transcript, setTranscript] = useState<
    { role: "emma" | "user"; text: string }[]
  >([]);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [emmaText, setEmmaText] = useState("연결 중...");

  const sessionRef = useRef<EmmaSession | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioDeltasRef = useRef<string[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 통화 시간 타이머
  useEffect(() => {
    if (callStatus === "active" || callStatus === "emma_speaking" || callStatus === "user_speaking") {
      timerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // 맥박 애니메이션 (Emma 말하는 중)
  useEffect(() => {
    if (callStatus === "emma_speaking") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [callStatus]);

  // 연결 시작
  useEffect(() => {
    if (!visible) return;
    startCall();
    return () => { endCall(); };  // cleanup은 동기적으로 호출 (내부는 async)
  }, [visible]);

  const startCall = async () => {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? "";
    if (!apiKey) {
      Alert.alert("오류", "EXPO_PUBLIC_OPENAI_API_KEY가 설정되지 않았습니다.");
      onEnd();
      return;
    }

    // 마이크 권한
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert("마이크 권한 필요", "Emma와 통화하려면 마이크 접근이 필요합니다.");
      onEnd();
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    const session = new EmmaSession();
    sessionRef.current = session;

    const systemPrompt = buildEmmaPrompt({
      userName,
      script: script.script,
      expressions: script.expressions,
      englishLevel,
    });

    session.onEvent(async (event) => {
      switch (event.type) {
        case "session_ready":
          setCallStatus("active");
          setEmmaText("Emma가 연결됐어요!");
          session.triggerGreeting();
          break;

        case "audio_delta":
          audioDeltasRef.current.push(event.delta);
          setCallStatus("emma_speaking");
          break;

        case "audio_done":
          await playEmmaAudio(audioDeltasRef.current);
          audioDeltasRef.current = [];
          setCallStatus("active");
          break;

        case "transcript":
          if (event.text) {
            setEmmaText(event.text);
            setTranscript((prev) => [...prev, { role: "emma", text: event.text }]);
          }
          break;

        case "input_transcript":
          if (event.text) {
            setTranscript((prev) => [...prev, { role: "user", text: event.text }]);
          }
          break;

        case "error":
          Alert.alert("연결 오류", event.message);
          endCall();
          break;
      }
    });

    try {
      await session.connect(apiKey, systemPrompt);
    } catch (err: any) {
      Alert.alert("연결 실패", err.message);
      onEnd();
    }
  };

  const playEmmaAudio = async (deltas: string[]) => {
    if (deltas.length === 0) return;
    try {
      const wavBase64 = pcm16DeltasToWavBase64(deltas);
      const path = FileSystem.cacheDirectory + "emma_response.wav";
      await FileSystem.writeAsStringAsync(path, wavBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: path });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (err) {
      console.error("Emma 음성 재생 실패:", err);
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true });
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 24000,
          numberOfChannels: 1,
          bitRate: 384000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 24000,
          numberOfChannels: 1,
          bitRate: 384000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      });
      recordingRef.current = recording;
      setIsRecording(true);
      setCallStatus("user_speaking");
    } catch (err) {
      console.error("녹음 시작 실패:", err);
    }
  };

  const stopRecording = async () => {
    if (!isRecording || !recordingRef.current) return;
    setIsRecording(false);
    setCallStatus("emma_speaking");

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) return;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      // WAV 파일 읽어서 PCM16 base64로 변환 (헤더 제거)
      const wavBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const pcm16 = wavBase64ToPcm16Base64(wavBase64);
      sessionRef.current?.sendAudio(pcm16);
    } catch (err) {
      console.error("녹음 처리 실패:", err);
      setCallStatus("active");
    }
  };

  const endCall = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isRecording && recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync().catch(() => {});
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => {});
    }
    sessionRef.current?.disconnect();
    sessionRef.current = null;
    setCallStatus("ended");
    onEnd();
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={s.callBg}>
        {/* Header */}
        <View style={s.callHeader}>
          <Text style={s.callHeaderText}>Emma · 전화영어</Text>
          <Text style={s.callTimer}>{formatTime(callSeconds)}</Text>
        </View>

        {/* Emma Avatar */}
        <View style={s.callCenter}>
          <Animated.View
            style={[s.emmaAvatarOuter, { transform: [{ scale: pulseAnim }] }]}
          >
            <View style={s.emmaAvatarInner}>
              <Text style={s.emmaAvatarEmoji}>👩‍🏫</Text>
            </View>
          </Animated.View>
          <Text style={s.emmaName}>Emma</Text>
          <Text style={s.emmaStatusText}>
            {callStatus === "connecting" && "연결 중..."}
            {callStatus === "active" && "대기 중"}
            {callStatus === "emma_speaking" && "말하는 중..."}
            {callStatus === "user_speaking" && "듣는 중..."}
          </Text>

          {/* Last Emma message */}
          {emmaText && callStatus !== "connecting" && (
            <View style={s.emmaTextBubble}>
              <Text style={s.emmaTextContent} numberOfLines={3}>{emmaText}</Text>
            </View>
          )}
        </View>

        {/* Transcript scroll */}
        {transcript.length > 0 && (
          <ScrollView style={s.transcriptScroll} showsVerticalScrollIndicator={false}>
            {transcript.slice(-6).map((t, i) => (
              <View
                key={i}
                style={[
                  s.transcriptBubble,
                  t.role === "user" ? s.transcriptUser : s.transcriptEmma,
                ]}
              >
                <Text style={s.transcriptText}>{t.text}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Controls */}
        <View style={s.callControls}>
          {/* Push-to-talk */}
          <Pressable
            style={[
              s.talkBtn,
              isRecording && s.talkBtnActive,
              callStatus === "emma_speaking" && s.talkBtnDisabled,
            ]}
            onPressIn={startRecording}
            onPressOut={stopRecording}
            disabled={callStatus === "emma_speaking" || callStatus === "connecting"}
          >
            <Ionicons
              name={isRecording ? "mic" : "mic-outline"}
              size={32}
              color={isRecording ? C.white : C.gray1}
            />
            <Text style={[s.talkBtnText, isRecording && { color: C.white }]}>
              {isRecording ? "말하는 중..." : "누르고 말하기"}
            </Text>
          </Pressable>

          {/* End call */}
          <Pressable style={s.endCallBtn} onPress={endCall}>
            <Ionicons name="call" size={24} color={C.white} />
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Lesson Screen ──────────────────────────────────

export default function LessonScreen() {
  const { lessonSchedule, userProfile } = useAppStore();
  const days = lessonSchedule.days.join(" · ");
  const time = lessonSchedule.timeSlots[0] || "07:00";

  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [script, setScript] = useState<ScriptResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [callVisible, setCallVisible] = useState(false);

  const steps = [
    { icon: "document-text-outline" as const, label: "스크립트 읽기", time: "2분" },
    { icon: "school-outline" as const, label: "핵심 표현 5개 학습", time: "2분" },
    { icon: "flash-outline" as const, label: "플래시카드 퀴즈", time: "1분" },
    { icon: "call-outline" as const, label: "Emma 전화영어", time: "5~10분" },
    { icon: "stats-chart-outline" as const, label: "피드백 리포트", time: "-" },
  ];

  const handleStart = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      const result = await generateVlogScript({
        name: userProfile.name,
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
          <Pressable style={s.startBtn} onPress={handleStart}>
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
            <Pressable style={s.retryBtn} onPress={handleStart}>
              <Text style={s.retryText}>다시 시도</Text>
            </Pressable>
          </View>
        )}

        {status === "done" && script && (
          <View>
            {/* Topic Badge */}
            <View style={s.topicBadge}>
              <Ionicons name="videocam" size={14} color={C.red} />
              <Text style={s.topicText} numberOfLines={1}>{script.topic}</Text>
            </View>

            {/* Script Card */}
            <View style={s.scriptCard}>
              <View style={[s.row, { alignItems: "center", marginBottom: 14 }]}>
                <Ionicons name="document-text" size={18} color={C.red} />
                <Text style={s.scriptTitle}>오늘의 스크립트</Text>
              </View>
              <ScriptText text={script.script} />
            </View>

            {/* Expressions Card */}
            <View style={s.exprCard}>
              <View style={[s.row, { alignItems: "center", marginBottom: 14 }]}>
                <Ionicons name="school" size={18} color={C.green} />
                <Text style={s.exprTitle}>핵심 표현 5개</Text>
              </View>
              {script.expressions.map((expr, i) => (
                <View key={i} style={s.exprRow}>
                  <View style={s.exprNum}>
                    <Text style={s.exprNumText}>{i + 1}</Text>
                  </View>
                  <Text style={s.exprText}>{expr}</Text>
                </View>
              ))}
            </View>

            {/* Emma Call Button */}
            <Pressable style={s.callBtn} onPress={() => setCallVisible(true)}>
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
            <Pressable style={s.regenBtn} onPress={handleStart}>
              <Ionicons name="refresh" size={16} color={C.gray2} />
              <Text style={s.regenText}>다른 주제로 다시 생성</Text>
            </Pressable>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Emma Call Modal */}
      {script && (
        <EmmaCallModal
          visible={callVisible}
          script={script}
          userName={userProfile.name || "학습자"}
          englishLevel={userProfile.englishLevel}
          onEnd={() => setCallVisible(false)}
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

  scriptCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 12 },
  scriptTitle: { color: C.white, fontSize: 15, fontWeight: "700", marginLeft: 8 },
  scriptBody: { color: C.gray1, fontSize: 15, lineHeight: 26 },
  scriptBold: { color: C.white, fontWeight: "700" },

  exprCard: { backgroundColor: C.card, borderRadius: 16, padding: 20, marginBottom: 12 },
  exprTitle: { color: C.white, fontSize: 15, fontWeight: "700", marginLeft: 8 },
  exprRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.bg,
  },
  exprNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.green + "20", alignItems: "center",
    justifyContent: "center", marginRight: 12,
  },
  exprNumText: { color: C.green, fontSize: 12, fontWeight: "700" },
  exprText: { color: C.white, fontSize: 14, flex: 1, lineHeight: 20 },

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
  callBtnTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
  callBtnSub: { color: C.gray2, fontSize: 12, marginTop: 2 },

  regenBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 14, marginBottom: 16,
  },
  regenText: { color: C.gray2, fontSize: 13 },

  // ─── Call Modal ───────────────────────────────────────
  callBg: { flex: 1, backgroundColor: "#050505" },
  callHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, paddingVertical: 16,
  },
  callHeaderText: { color: C.gray2, fontSize: 14, fontWeight: "600" },
  callTimer: { color: C.white, fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"] },

  callCenter: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  emmaAvatarOuter: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: C.green + "20",
    borderWidth: 2, borderColor: C.green + "60",
    alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  emmaAvatarInner: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: C.card, alignItems: "center", justifyContent: "center",
  },
  emmaAvatarEmoji: { fontSize: 52 },
  emmaName: { color: C.white, fontSize: 22, fontWeight: "800", marginBottom: 4 },
  emmaStatusText: { color: C.gray2, fontSize: 14, marginBottom: 24 },
  emmaTextBubble: {
    backgroundColor: C.card, borderRadius: 16,
    padding: 16, width: "100%",
    borderWidth: 1, borderColor: C.card2,
  },
  emmaTextContent: { color: C.gray1, fontSize: 14, lineHeight: 22, textAlign: "center" },

  transcriptScroll: { maxHeight: 140, paddingHorizontal: 16, marginBottom: 8 },
  transcriptBubble: {
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 6, maxWidth: "80%",
  },
  transcriptEmma: { backgroundColor: C.card, alignSelf: "flex-start" },
  transcriptUser: { backgroundColor: C.blue + "30", alignSelf: "flex-end" },
  transcriptText: { color: C.gray1, fontSize: 13, lineHeight: 18 },

  callControls: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 32, paddingBottom: 24, gap: 20,
  },
  talkBtn: {
    flex: 1, alignItems: "center", justifyContent: "center",
    backgroundColor: C.card, borderRadius: 20,
    paddingVertical: 20, gap: 8,
    borderWidth: 1.5, borderColor: C.card2,
  },
  talkBtnActive: { backgroundColor: C.green + "30", borderColor: C.green },
  talkBtnDisabled: { opacity: 0.4 },
  talkBtnText: { color: C.gray2, fontSize: 13, fontWeight: "600" },
  endCallBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: "#E53935", alignItems: "center", justifyContent: "center",
    transform: [{ rotate: "135deg" }],
  },
});
