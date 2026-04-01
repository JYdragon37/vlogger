// lib/openai.ts
//
// NOTE: EXPO_PUBLIC_OPENAI_API_KEY is embedded in the JS bundle at build time.
// This is acceptable for MVP/development. For production, replace with a
// backend proxy (e.g. Firebase Cloud Functions) to protect the key.

const API_URL = "https://api.openai.com/v1/chat/completions";

export interface ExpressionWithExplanation {
  phrase: string;       // e.g. "stock up on", "end up doing"
  label?: string;       // e.g. "[패턴]", "[구동사]" (optional)
  explanation: string;  // 한국어 설명 1문장
  example: string;      // 스크립트에서 해당 표현이 쓰인 영어 문장
  meaning: string;      // example 문장의 한국어 해석
}

export interface ScriptResult {
  topic: string;            // e.g. "미국 마트 쇼핑 / US Grocery Shopping"
  culturalNote: string;     // 현지 문화 지식 한 스푼 (한국어, 2개 용어 설명 포함)
  culturalTitle: string;    // e.g. "Housewarming Party"
  script: string;           // 3 scenes (timeline story), ** bold ** 5개 필수
  expressions: ExpressionWithExplanation[]; // exactly 5
}

export async function generateVlogScript(profile: {
  name: string;
  gender: string;
  job: string;
  location: string;
  hobbies: string[];
  englishLevel: string;
}): Promise<ScriptResult> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error("EXPO_PUBLIC_OPENAI_API_KEY is not set");

  const hobbiesText = profile.hobbies.length > 0 ? profile.hobbies.join(", ") : "daily life";
  const shortName = profile.name || "학습자";

  const prompt = `You are a bilingual English-Korean content creator making a single educational vlog episode for a Korean learner.

Student profile: ${shortName}, ${profile.job || "professional"}, ${profile.gender}, from ${profile.location || "Korea"}, enjoys: ${hobbiesText}. English level: ${profile.englishLevel}.

CONCEPT: A "1타 강사 (top teacher)" English vlog episode with:
1. A rich Korean cultural note about AMERICAN culture
2. A 3-scene English vlog script where THE STUDENT IS THE VLOGGER (first-person)
3. 5 high-quality real-world expressions with Korean explanations

TOPIC: Choose ONE hyper-specific, vivid topic set in REAL American locations — use REAL brand names and places (Trader Joe's, Target, Starbucks drive-thru, In-N-Out, Costco, Whole Foods, Central Park, LA Metro, etc.). Make the listener feel like they are actually THERE in America.

---

**culturalTitle** (English, short):
- The cultural topic keyword(s), e.g. "Housewarming Party", "Airport Hustle", "First Day at Tech Firm"

**culturalNote** (한국어, 2 terms):
- 반드시 2개의 미국 문화 용어/개념을 소개
- ⭐ 난이도: 미국 현지인이 "어, 그거 진짜야? 나도 몰랐는데" 할 만한 인사이더 팁. 구글 첫 페이지에 나오는 뻔한 정보는 절대 금지.
  - ❌ 절대 금지: "미국은 팁 문화가 있어", "미국은 땅이 커", "할로윈에 trick or treat 해", "미국인은 직설적이야", "미국 마트는 24시간이야" 같은 누구나 아는 상식
  - ✅ 좋은 예 (이런 수준의 구체성): "Venmo 결제 시 이모지를 넣는 게 매너", "Target의 Up&Up 브랜드가 가성비 끝판왕인 이유", "미국 약국(CVS/Walgreens)에서 처방전 없이 살 수 있는 약의 범위", "Costco 리턴 정책의 미친 관대함 (타이어도 몇 년 뒤 환불 가능)", "미국 아파트 렌트 시 credit score가 왜 중요한지", "미국 식당에서 'to go box 주세요' 대신 써야 하는 표현"
- 각 용어는 "용어명: 설명" 형식으로 작성
- 설명은 2~3문장, 현지인만 아는 디테일이나 한국과의 구체적 차이를 포함
- 말투: 친한 친구한테 알려주듯 캐주얼하고 생동감있게
- 영어 단어/용어명은 그대로 영어로 쓰되 설명은 한국어
- ⭐ 핵심 용어/브랜드명은 반드시 **별표 두 개**로 감싸서 볼드 처리 — 각 설명에 최소 1개의 **볼드** 표현 필수
- 두 용어는 줄바꿈(\\n\\n)으로 구분
- 예시 (이 포맷과 퀄리티를 정확히 따를 것):
"Bulk Buying: 미국은 집이 크고 냉장고도 커서 **대용량(Bulk)**으로 사는 게 국룰이야. **"하나 사면 하나 공짜(BOGO: Buy One Get One Free)"** 행사가 진짜 많아.\\n\\nPaper or Plastic?: 계산대에서 점원이 꼭 물어볼 거야. 종이 가방에 담아줄까, 비닐봉지에 담아줄까 라는 뜻이지. 요즘은 **재활용 장바구니(Reusable bag)**를 많이 쓰는 추세야!"

---

⚠️ LANGUAGE RULES — CRITICAL:
- **script**: ENGLISH ONLY. Do NOT write Korean in the script.
- **culturalNote**: KOREAN ONLY (영어 용어명은 그대로 영어로 OK, 영어 문장은 불가).
- expression **phrases**: English. expression **explanations**: Korean. expression **example**: English. expression **meaning**: Korean.

---

**script** (ENGLISH ONLY — FIRST-PERSON VLOG NARRATION):
- The student IS the vlogger speaking directly to camera
- ⭐ THREE SCENES MUST FORM A CONNECTED TIMELINE STORY — Scene 1 leads to Scene 2, which leads to Scene 3. They are NOT independent vignettes. The narrative must flow as one continuous story arc.
- Use REAL American brand/place names in scene descriptions and narration
- Each scene starts with "(Scene: [Korean situation description in parentheses])"
  Example: "(Scene: 마트 입구에서 카트를 밀며)", "(Scene: 파티장에 도착해서 사람들과 인사하며)"
- Total 90-120 words across all 3 scenes. STRICT LIMIT: count every word before finalizing. If over 120, cut sentences. If under 90, expand. Do NOT exceed 120 words under any circumstances.
- Natural, enthusiastic first-person vlog narration with personality
- Embed EXACTLY 5 expressions in **double asterisks** — ALL 5 must appear in the script
- Spread the 5 expressions across different scenes (at least 1 per scene)
- CRITICAL: Bold markers must touch the expression directly — **expression** ✅, ** expression ** ❌ (no spaces inside the asterisks)

---

**expressions** (exactly 5, HIGH QUALITY):
- MUST be: phrasal verbs / collocations / sentence patterns / idioms
- ⭐ AT LEAST 1 must be a SPEAKING PATTERN (e.g. "I should've + pp", "It turned out to be ~", "I couldn't have asked for ~", "There's no way ~", "It's no wonder that ~"). Mark it with label "[패턴]".
- ✅ GOOD: "stock up on", "end up doing", "barely make it", "I should've + pp", "It turned out to be ~", "way too close", "hit the gym", "marks a fresh start", "run into", "go out of my way"
- ❌ FORBIDDEN: single nouns or adjectives (e.g. "adventure", "stunning view", "determination")
- ❌ FORBIDDEN (duplicates): All 5 expressions must be COMPLETELY DISTINCT — no synonyms, no two phrasal verbs with the same root verb (e.g. "get through" + "get over" ❌), no two patterns with the same sentence structure. Each expression must target a different learning point.
- Each expression object:
  - phrase: the expression in English
  - label: optional — "[패턴]", "[구동사]", "[관용구]", "[콜로케이션]"
  - explanation: 한국어 설명 1문장 (캐주얼한 말투, 뉘앙스 포함)
  - example: 스크립트에서 이 표현이 사용된 **정확한 영어 문장** (스크립트에서 그대로 복사)
  - meaning: example 문장의 자연스러운 한국어 해석

---

✅ QUALITY CHECKLIST (반드시 준수):
[✓] 구동사(Phrasal Verbs) — sleep in, get through, wrap up, burn off, pass up 등 중급 이상 구동사가 자연스럽게 포함
[✓] 콜로케이션(Collocation) — around the corner, live up to the hype 등 원어민이 세트로 쓰는 표현 포함
[✓] 고급 문장 구조 — It's no wonder that~, I couldn't have asked for~ 등 복문 구조 최소 1개 포함
[✓] 1타 강사식 설명 — 한국인이 흔히 틀리는 포인트를 짚는 뉘앙스 설명
[✓] 스크립트 **bold** 정확히 5개 — 제출 전 스크립트에서 **를 직접 세어볼 것: ** 오프닝 5개 + 클로징 5개 = 총 10개의 **가 있어야 함. 4개 또는 6개면 수정 필수.
[✓] 스크립트 단어 수 90-120개 (초과 절대 금지, 제출 전 반드시 카운트)
[✓] 5개 표현 중복 없음 — 동의어/유사 패턴/같은 동사 어근 사용 금지

---

Return JSON only — no markdown, no extra text:
{
  "topic": "한국어 제목 / English Title",
  "culturalTitle": "Cultural Topic Keywords",
  "culturalNote": "용어1: 설명...\\n\\n용어2: 설명...",
  "script": "(Scene: 한국어 상황 설명)\\n\\"English narration with **expr1** and **expr2**...\\"\\n\\n(Scene: 한국어 상황 설명)\\n\\"English narration with **expr3**...\\"\\n\\n(Scene: 한국어 상황 설명)\\n\\"English narration with **expr4** and **expr5**...\\"",
  "expressions": [
    { "phrase": "expr1", "label": "[구동사]", "explanation": "한국어 설명", "example": "script에서 expr1이 쓰인 영어 문장", "meaning": "example의 한국어 해석" },
    { "phrase": "expr2", "explanation": "한국어 설명", "example": "script에서 expr2가 쓰인 영어 문장", "meaning": "example의 한국어 해석" },
    { "phrase": "expr3", "label": "[패턴]", "explanation": "한국어 설명", "example": "script에서 expr3이 쓰인 영어 문장", "meaning": "example의 한국어 해석" },
    { "phrase": "expr4", "label": "[콜로케이션]", "explanation": "한국어 설명", "example": "script에서 expr4가 쓰인 영어 문장", "meaning": "example의 한국어 해석" },
    { "phrase": "expr5", "explanation": "한국어 설명", "example": "script에서 expr5가 쓰인 영어 문장", "meaning": "example의 한국어 해석" }
  ]
}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI API 응답에 content가 없습니다.");
  }
  try {
    return JSON.parse(content) as ScriptResult;
  } catch {
    throw new Error("OpenAI 응답 JSON 파싱 실패: " + content.slice(0, 200));
  }
}

// ─── 수업 피드백 생성 ───────────────────────────────────

export interface FeedbackResult {
  summary: string;
  corrections: string[];
  expressionTracking: { phrase: string; used: boolean; note: string }[];
  vocabularyTips: string[];
  patternTips: string[];
}

export async function generateLessonFeedback(params: {
  userName: string;
  topic: string;
  expressions: { phrase: string }[];
  conversation: { role: "emma" | "user"; text: string }[];
  callDurationSeconds: number;
}): Promise<FeedbackResult> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error("EXPO_PUBLIC_OPENAI_API_KEY is not set");

  const convoText = params.conversation
    .map((m) => `${m.role === "emma" ? "Emma" : params.userName}: ${m.text}`)
    .join("\n");

  const expressionList = params.expressions.map((e) => e.phrase).join(", ");
  const durationMin = Math.round(params.callDurationSeconds / 60);

  const prompt = `You are an expert English speaking coach analyzing a Korean student's phone English lesson.

Student: ${params.userName}
Topic: ${params.topic}
Duration: ${durationMin} minutes
Target Expressions: ${expressionList}

Conversation transcript:
${convoText}

---

Analyze the conversation and provide feedback in Korean. Return JSON only:

{
  "summary": "총평 2~3문장. 칭찬 먼저, 개선점 간결하게. 캐주얼한 코치 말투.",
  "corrections": [
    "에러 교정 or 개선 포인트 5가지. 각각 구체적인 예시 포함. 형식: '원문 → 교정' or 구체적 팁",
    "예: \\"There is big presentation → There's a big presentation (관사 a 필요)\\"",
    "예: \\"문장을 짧게 끊는 경향 → 접속사 활용: so, and then, after that\\"",
    "예: \\"주저할 때 침묵 대신 필러 사용 추천: um, you know, let me think\\"",
    "예: \\"수동적 답변 패턴 → Emma 질문에 역질문 추가해보기\\""
  ],
  "expressionTracking": [
    { "phrase": "target expression", "used": true/false, "note": "사용 횟수와 자연스러움 평가 or '미사용'" }
  ],
  "vocabularyTips": [
    "대화에서 더 좋은 어휘를 쓸 수 있었던 부분 2~3개. 형식: '사용한 표현 → 추천 표현 (이유)'"
  ],
  "patternTips": [
    "문법/패턴 개선 포인트 2~3개. 한국인이 자주 틀리는 패턴 위주."
  ]
}

IMPORTANT:
- expressionTracking: ONLY count expressions the STUDENT (${params.userName}) used. If Emma used the expression but the student did NOT, mark as used: false. Only mark used: true when the student said it.
- expressionTracking must have exactly ${params.expressions.length} items, one per target expression, in the same order
- corrections must have exactly 5 items
- All text in Korean except English examples
- Be encouraging but honest`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("피드백 생성 실패: content 없음");
  try {
    return JSON.parse(content) as FeedbackResult;
  } catch {
    throw new Error("피드백 JSON 파싱 실패: " + content.slice(0, 200));
  }
}
