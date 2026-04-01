import { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAppStore, type ExpressionItem } from "@/store/useAppStore";
import { saveUserData } from "@/lib/firestore";
import { AudioModule, setAudioModeAsync, RecordingPresets } from "expo-audio";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const C = {
  bg: "#0F0F0F",
  card: "#1A1A1A",
  card2: "#222",
  border: "#2A2A2A",
  red: "#FF0000",
  white: "#FFF",
  gray1: "#AAA",
  gray2: "#888",
  gray3: "#666",
  green: "#4CAF50",
  orange: "#FF9800",
  gold: "#FFD700",
};

const THUMB_COLORS = ["#1A0D0D", "#0D1A0D", "#0D0D1A", "#1A1A0D", "#0D1A1A", "#1A0D1A"];

const PLACEHOLDER_EXPRESSION: ExpressionItem = {
  phrase: "표현이 기록되지 않았습니다.",
  meaning: "",
  nuance: "",
};

function thumbColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return THUMB_COLORS[hash % THUMB_COLORS.length];
}

// 스크립트 단어수 기반 예상 낭독 시간(초) — 100 WPM 기준
function expectedSpeechSeconds(script: string): number {
  const wordCount = script.trim().split(/\s+/).length;
  return (wordCount / 100) * 60;
}

// scenes 또는 legacy script에서 전체 텍스트 추출
function getFullScript(episode: { scenes?: { script: string }[]; script?: string }): string {
  if (episode.scenes && episode.scenes.length > 0) {
    return episode.scenes.map((s) => s.script).join(" ");
  }
  return episode.script ?? "";
}

type RecordState = "idle" | "recording" | "done";

export default function EpisodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { channelInfo, markEpisodeHit } = useAppStore();

  const episode = channelInfo.episodes.find((e) => e.id === id);

  // 씬 탭 선택
  const [selectedScene, setSelectedScene] = useState(0);

  // 녹음 상태
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const recordingRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stop().catch(() => {});
      }
    };
  }, []);

  if (!episode) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={C.gray2} />
          <Text style={s.notFoundText}>에피소드를 찾을 수 없습니다</Text>
          <Pressable style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backBtnText}>돌아가기</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // 현재 씬 (씬별 표현 우선, 없으면 에피소드 레벨 표현)
  const currentScene = episode.scenes?.[selectedScene];
  const sceneExpressions: ExpressionItem[] = Array.from({ length: 5 }, (_, i) =>
    currentScene?.expressions?.[i] ?? episode.expressions?.[i] ?? PLACEHOLDER_EXPRESSION
  );

  const isPlaceholder = (expr: ExpressionItem) => expr.phrase === PLACEHOLDER_EXPRESSION.phrase;

  // ─── 녹음 핸들러 ───────────────────────────────────────

  const handleRecord = async () => {
    if (recordState === "recording") {
      // 녹음 중지
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      try {
        await recordingRef.current?.stop();
        assessHit(elapsed);
      } catch {
        setRecordState("idle");
      }
      setRecordState("done");
      return;
    }

    if (recordState === "done") {
      // 재녹음
      setRecordState("idle");
      setElapsed(0);
      return;
    }

    // 녹음 시작
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert("마이크 권한 필요", "설정에서 마이크 권한을 허용해주세요.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      const recorder = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      recorder.prepareToRecordAsync().then(() => recorder.record());
      recordingRef.current = recorder;
      setElapsed(0);
      setRecordState("recording");
      timerRef.current = setInterval(() => setElapsed((v) => v + 1), 1000);
    } catch {
      Alert.alert("녹음 오류", "녹음을 시작할 수 없습니다.");
    }
  };

  const assessHit = (seconds: number) => {
    const fullScript = getFullScript(episode);
    if (!fullScript) return;
    const expected = expectedSpeechSeconds(fullScript);
    const ratio = seconds / expected;
    if (seconds >= 3 && ratio >= 0.8) {
      markEpisodeHit(episode.id);
      // HIT 달성 후 Firestore 동기화
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
        }).catch((err) => console.error("Firestore HIT 저장 실패:", err));
      }
    }
  };

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ─── Render ──────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* 헤더 */}
      <View style={s.header}>
        <Pressable style={s.headerBack} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.white} />
        </Pressable>
        <Text style={s.headerDate}>{episode.date}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 썸네일 */}
        <View style={[s.thumb, { backgroundColor: thumbColor(episode.id) }]}>
          <Text style={s.thumbEmoji}>{episode.emoji}</Text>
          {episode.seriesName && episode.seriesOrder && episode.seriesTotal && (
            <View style={s.seriesBadge}>
              <Text style={s.seriesText}>{episode.seriesName} {episode.seriesOrder}/{episode.seriesTotal}</Text>
            </View>
          )}
          <View style={s.thumbScrim} />
        </View>

        <View style={s.content}>
          {/* HOT 배지 (달성 시) */}
          {episode.hitAchieved && (
            <View style={s.hitBanner}>
              <Text style={s.hitBannerText}>🔥  HOT 달성!</Text>
              <Text style={s.hitBannerSub}>스크립트를 완벽하게 낭독했습니다</Text>
            </View>
          )}

          {/* 제목 + 녹음 버튼 */}
          <View style={s.titleRow}>
            <Text style={s.title}>{episode.title}</Text>
            <Pressable
              style={[
                s.recordBtn,
                recordState === "recording" && s.recordBtnActive,
                recordState === "done" && s.recordBtnDone,
              ]}
              onPress={handleRecord}
            >
              {recordState === "recording" ? (
                <>
                  <View style={s.recordDot} />
                  <Text style={[s.recordBtnLabel, { color: C.red }]}>{formatElapsed(elapsed)}</Text>
                </>
              ) : recordState === "done" ? (
                <>
                  <Ionicons name="refresh-outline" size={14} color={C.gray2} />
                  <Text style={[s.recordBtnLabel, { color: C.gray2 }]}>재녹음</Text>
                </>
              ) : (
                <>
                  <Ionicons name="mic-outline" size={14} color={C.gray1} />
                  <Text style={[s.recordBtnLabel, { color: C.gray1 }]}>녹음</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* 녹음 유도 안내 (idle 상태에서만) */}
          {recordState === "idle" && !!getFullScript(episode) && (
            <View style={s.recordHint}>
              <Ionicons name="information-circle-outline" size={14} color={C.gray3} />
              <Text style={s.recordHintText}>스크립트를 보며 낭독하면 HIT 달성 여부를 판정합니다</Text>
            </View>
          )}

          {/* 메타 */}
          <View style={s.metaRow}>
            <Ionicons name="time-outline" size={14} color={C.gray2} />
            <Text style={s.metaText}>{episode.durationMinutes}분 수업</Text>
            <View style={s.dot} />
            <Ionicons name="speedometer-outline" size={14} color={C.gray2} />
            <Text style={s.metaText}>{episode.wpm} WPM</Text>
          </View>

          {/* 통계 2열 */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <View style={s.statIconRow}>
                <Ionicons name="call-outline" size={16} color={C.gray1} />
              </View>
              <Text style={s.statValue}>{episode.durationMinutes}분</Text>
              <Text style={s.statLabel}>통화 시간</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <View style={s.statIconRow}>
                <Ionicons name="speedometer-outline" size={16} color={C.gray1} />
              </View>
              <Text style={s.statValue}>{episode.wpm}</Text>
              <Text style={s.statLabel}>WPM</Text>
            </View>
          </View>

          {/* ─── 씬 탭 + 학습 표현 + 스크립트 ─── */}
          {episode.scenes && episode.scenes.length > 0 ? (
            <>
              {/* 씬 탭 */}
              <View style={s.sceneTabs}>
                {episode.scenes.map((_, i) => (
                  <Pressable
                    key={i}
                    style={[s.sceneTab, selectedScene === i && s.sceneTabActive]}
                    onPress={() => setSelectedScene(i)}
                  >
                    <Text style={[s.sceneTabText, selectedScene === i && s.sceneTabTextActive]}>
                      씬 {i + 1}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* 씬 이름 */}
              {currentScene && (
                <View style={s.sceneNameRow}>
                  <Text style={s.sceneNameLabel}>{currentScene.name}</Text>
                </View>
              )}

              {/* 학습 표현 */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>학습 표현</Text>
                {sceneExpressions.map((expr, i) => (
                  <View key={i} style={[s.expressionRow, isPlaceholder(expr) && s.expressionRowDim]}>
                    <View style={[s.exprNum, isPlaceholder(expr) && s.exprNumDim]}>
                      <Text style={s.exprNumText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.exprPhrase, isPlaceholder(expr) && s.exprTextDim]}>
                        {expr.phrase}
                      </Text>
                      {!isPlaceholder(expr) && (
                        <>
                          <Text style={s.exprMeaning}>{expr.meaning}</Text>
                          <Text style={s.exprNuance}>{expr.nuance}</Text>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* 씬 스크립트 */}
              {currentScene && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>스크립트</Text>
                  <View style={s.sceneCard}>
                    <Text style={s.sceneScript}>{currentScene.script}</Text>
                    <Text style={s.sceneCharCount}>{currentScene.script.length}자</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <>
              {/* 씬 없을 때 — legacy */}
              <View style={s.section}>
                <Text style={s.sectionTitle}>학습 표현</Text>
                {sceneExpressions.map((expr, i) => (
                  <View key={i} style={[s.expressionRow, isPlaceholder(expr) && s.expressionRowDim]}>
                    <View style={[s.exprNum, isPlaceholder(expr) && s.exprNumDim]}>
                      <Text style={s.exprNumText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.exprPhrase, isPlaceholder(expr) && s.exprTextDim]}>
                        {expr.phrase}
                      </Text>
                      {!isPlaceholder(expr) && (
                        <>
                          <Text style={s.exprMeaning}>{expr.meaning}</Text>
                          <Text style={s.exprNuance}>{expr.nuance}</Text>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              {episode.script && (
                <View style={s.section}>
                  <Text style={s.sectionTitle}>스크립트</Text>
                  <View style={s.sceneCard}>
                    <Text style={s.sceneScript}>{episode.script}</Text>
                  </View>
                </View>
              )}
            </>
          )}

          {/* 피드백 바로가기 */}
          <Pressable
            style={s.feedbackLink}
            onPress={() => {
              router.back();
              setTimeout(() => router.navigate({ pathname: "/(tabs)/feedback", params: { episodeId: episode.id } } as any), 100);
            }}
          >
            <View style={s.feedbackLinkIcon}>
              <Ionicons name="chatbubble-outline" size={18} color="#FF9800" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.feedbackLinkTitle}>내 피드백 보기</Text>
              <Text style={s.feedbackLinkSub}>
                {episode.feedback ? "AI 피드백 리포트 확인하기" : "수업 후 피드백이 생성됩니다"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.gray3} />
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // 헤더
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerBack: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: C.card, alignItems: "center", justifyContent: "center",
  },
  headerDate: { color: C.gray2, fontSize: 13 },

  // 썸네일
  thumb: {
    width: SCREEN_WIDTH, height: 200,
    alignItems: "center", justifyContent: "center",
    position: "relative", overflow: "hidden",
  },
  thumbEmoji: { fontSize: 72 },
  thumbScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.2)" },
  seriesBadge: {
    position: "absolute", top: 14, left: 14,
    backgroundColor: "rgba(255,0,0,0.9)", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  seriesText: { color: C.white, fontSize: 11, fontWeight: "700" },

  // 본문
  content: { paddingHorizontal: 20, paddingTop: 20 },

  // HIT 배너
  hitBanner: {
    backgroundColor: "#2A1E00", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "#554400", marginBottom: 16,
    alignItems: "center",
  },
  hitBannerText: { color: C.gold, fontSize: 16, fontWeight: "800", marginBottom: 4 },
  hitBannerSub: { color: "#AA8800", fontSize: 12 },

  // 제목 + 녹음
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 8 },
  title: { flex: 1, color: C.white, fontSize: 20, fontWeight: "800", lineHeight: 28 },
  recordBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
    borderWidth: 1, borderColor: C.border, marginTop: 2,
  },
  recordBtnActive: { borderColor: C.red, backgroundColor: "#1A0000" },
  recordBtnDone: { borderColor: C.border },
  recordBtnLabel: { fontSize: 12, fontWeight: "600" },
  recordDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: C.red,
  },

  // 녹음 유도
  recordHint: {
    flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 12,
  },
  recordHintText: { flex: 1, color: C.gray3, fontSize: 11, lineHeight: 16 },

  // 메타
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
  metaText: { color: C.gray2, fontSize: 13 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.gray3 },

  // 통계
  statsRow: {
    flexDirection: "row", backgroundColor: C.card, borderRadius: 16,
    paddingVertical: 16, marginBottom: 24,
  },
  statItem: { flex: 1, alignItems: "center" },
  statIconRow: { marginBottom: 6 },
  statValue: { color: C.white, fontSize: 18, fontWeight: "800", marginBottom: 4 },
  statLabel: { color: C.gray2, fontSize: 11 },
  statDivider: { width: 1, backgroundColor: C.border },

  // 섹션
  section: { marginBottom: 24 },
  sectionTitle: {
    color: C.gray2, fontSize: 11, fontWeight: "700",
    textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12,
  },

  // 학습 표현
  expressionRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: C.card, borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: C.border,
  },
  expressionRowDim: { opacity: 0.4 },
  exprNum: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.green,
    alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2,
  },
  exprNumDim: { backgroundColor: C.border },
  exprNumText: { color: C.white, fontSize: 11, fontWeight: "800" },
  exprPhrase: { color: C.white, fontSize: 15, fontWeight: "700", lineHeight: 22, marginBottom: 4 },
  exprMeaning: { color: C.gray1, fontSize: 13, lineHeight: 18, marginBottom: 8 },
  exprExampleBox: {
    backgroundColor: "#111", borderRadius: 8, padding: 10, marginBottom: 6,
    borderLeftWidth: 3, borderLeftColor: C.green,
  },
  exprExampleLabel: { color: C.green, fontSize: 10, fontWeight: "700", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.8 },
  exprExample: { color: C.gray1, fontSize: 13, lineHeight: 19, fontStyle: "italic" },
  exprNuance: { color: C.gray2, fontSize: 12, lineHeight: 18 },
  exprTextDim: { color: C.gray3 },

  // 씬 탭
  sceneTabs: {
    flexDirection: "row", gap: 8, marginBottom: 12,
  },
  sceneTab: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  sceneTabActive: {
    backgroundColor: C.red, borderColor: C.red,
  },
  sceneTabText: { color: C.gray2, fontSize: 13, fontWeight: "600" },
  sceneTabTextActive: { color: C.white },
  sceneNameRow: { marginBottom: 16 },
  sceneNameLabel: { color: C.gray2, fontSize: 12, lineHeight: 16 },

  // 씬 스크립트 카드
  sceneCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border,
  },
  sceneScript: { color: C.white, fontSize: 14, lineHeight: 23 },
  sceneCharCount: { color: C.gray3, fontSize: 11, marginTop: 8, textAlign: "right" },

  // 피드백 바로가기
  feedbackLink: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#1A1400", borderRadius: 14, padding: 16, marginTop: 8,
    borderWidth: 1, borderColor: "#33280A",
  },
  feedbackLinkIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#33280A", alignItems: "center", justifyContent: "center",
  },
  feedbackLinkTitle: { color: "#FF9800", fontSize: 14, fontWeight: "700" },
  feedbackLinkSub: { color: "#886600", fontSize: 12, marginTop: 2 },

  // 없음
  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  notFoundText: { color: C.gray2, fontSize: 16 },
  backBtn: {
    backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
    borderWidth: 1, borderColor: C.border,
  },
  backBtnText: { color: C.white, fontSize: 14, fontWeight: "600" },
});
