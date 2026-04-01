import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "@/lib/firebase";
import { useAppStore } from "@/store/useAppStore";

// ─── Google Sign-In 설정 ──────────────────────────────────
//
// @react-native-google-signin/google-signin 네이티브 라이브러리 사용
// - Expo Go에서는 동작하지 않음 (Development Build 필요)
// - Development Build: npx expo run:ios / npx expo run:android
// - EAS Build: eas build --profile development
//
// 필요 파일:
// - iOS: GoogleService-Info.plist (Firebase Console에서 다운로드)
// - Android: google-services.json (Firebase Console에서 다운로드)
//
// 필요 환경변수:
// - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: Google Cloud Console → 웹 클라이언트 ID
// ──────────────────────────────────────────────────────────

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

// GoogleSignin.configure는 앱 시작 시 1회 호출
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: false,
  scopes: ["profile", "email"],
});

export default function LoginScreen() {
  const router = useRouter();
  const loadDemoAccount = useAppStore((s) => s.loadDemoAccount);

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Google 로그인 핸들러 ────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        "설정 필요",
        "Google Web Client ID가 설정되지 않았습니다.\n" +
          ".env 파일에 EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID를 추가해주세요."
      );
      return;
    }

    setIsGoogleLoading(true);
    setError("");

    try {
      // Android: Play Services 확인
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // 네이티브 Google Sign-In UI 표시
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;

        if (!idToken) {
          setError("Google에서 인증 토큰을 받지 못했습니다.");
          return;
        }

        // Firebase 인증
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);

        // index.tsx의 Redirect 로직에 일임 (Firestore 로드 후 isOnboarded 확인)
        router.replace("/");
      }
      // cancelled response → 에러 표시 안 함
    } catch (err: any) {
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case statusCodes.IN_PROGRESS:
            // 이미 로그인 진행 중
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            setError("Google Play Services를 사용할 수 없습니다.");
            break;
          default:
            console.error("Google Sign-In error:", err.code, err.message);
            setError("Google 로그인 중 오류가 발생했습니다.");
        }
      } else {
        console.error("Google Sign-In unexpected error:", err);
        setError("Google 로그인 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // ─── 이메일 로그인 핸들러 ───────────────────────────────
  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      // index.tsx의 Redirect 로직에 일임 (Firestore 로드 후 isOnboarded 확인)
      router.replace("/");
    } catch (err: any) {
      const code = err.code as string;
      const msg =
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : code === "auth/email-already-in-use"
          ? "이미 사용 중인 이메일입니다."
          : code === "auth/weak-password"
          ? "비밀번호는 6자 이상이어야 합니다."
          : code === "auth/invalid-email"
          ? "올바른 이메일 형식이 아닙니다."
          : err.message;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* 로고 영역 */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="play" size={32} color="#FF0000" />
          </View>
          <Text style={styles.appName}>Vlogger</Text>
          <Text style={styles.tagline}>영어로 나만의 유튜브 채널을</Text>
          <Text style={styles.tagline}>만들어가는 스피킹 코치</Text>
        </View>

        {/* 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {isSignUp ? "계정 만들기" : "로그인"}
          </Text>

          {/* 이메일 */}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="mail-outline"
              size={18}
              color="#888"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="이메일"
              placeholderTextColor="#555"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          {/* 비밀번호 */}
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color="#888"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder={isSignUp ? "비밀번호 (6자 이상)" : "비밀번호"}
              placeholderTextColor="#555"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError("");
              }}
              secureTextEntry
            />
          </View>

          {/* 에러 메시지 */}
          {error !== "" && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color="#FF6B6B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* 이메일 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
            onPress={handleEmailAuth}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isSignUp ? "회원가입" : "로그인"}
              </Text>
            )}
          </TouchableOpacity>

          {/* 구분선 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google 로그인 버튼 */}
          <TouchableOpacity
            style={[styles.googleBtn, isGoogleLoading && styles.btnDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
            activeOpacity={0.8}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="logo-google" size={18} color="#fff" />
                <Text style={styles.googleBtnText}>Google로 계속하기</Text>
              </>
            )}
          </TouchableOpacity>

          {/* 안내 메시지 */}
          <Text style={styles.hint}>
            Google 로그인은 Development Build에서 동작합니다
          </Text>

          {/* 회원가입/로그인 토글 */}
          <TouchableOpacity
            style={styles.toggleBtn}
            onPress={() => {
              setIsSignUp((v) => !v);
              setError("");
            }}
          >
            <Text style={styles.toggleText}>
              {isSignUp
                ? "이미 계정이 있으신가요? "
                : "아직 계정이 없으신가요? "}
              <Text style={styles.toggleAccent}>
                {isSignUp ? "로그인" : "회원가입"}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* 데모 체험 */}
          <View style={styles.demoDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity
            style={styles.demoBtn}
            activeOpacity={0.7}
            onPress={() => {
              loadDemoAccount();
              router.replace("/(tabs)");
            }}
          >
            <Ionicons name="play-circle-outline" size={16} color="#888" />
            <Text style={styles.demoBtnText}>데모로 체험하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F0F0F",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "#888",
    lineHeight: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F0F0F",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    color: "#FFFFFF",
    fontSize: 15,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#2A1A1A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    flex: 1,
  },
  primaryBtn: {
    backgroundColor: "#FF0000",
    borderRadius: 12,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2A2A2A",
  },
  dividerText: {
    color: "#555",
    fontSize: 13,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    height: 50,
    borderWidth: 1,
    borderColor: "#3A3A3A",
  },
  googleBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  hint: {
    color: "#555",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
  toggleBtn: {
    marginTop: 16,
    alignItems: "center",
  },
  toggleText: {
    color: "#888",
    fontSize: 14,
  },
  toggleAccent: {
    color: "#FF0000",
    fontWeight: "600",
  },
  demoDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 4,
    gap: 12,
  },
  demoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: 12,
    height: 46,
    marginTop: 8,
  },
  demoBtnText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
  },
});
