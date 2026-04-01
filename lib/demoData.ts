import type {
  UserProfile,
  ChannelInfo,
  LessonSchedule,
  Episode,
} from "@/store/useAppStore";

// ─── Demo Episodes ────────────────────────────────────────

const demoEpisodes: Episode[] = [
  {
    id: "demo-01",
    title: "도쿄 여행 첫날 브이로그",
    emoji: "🗼",
    thumbnailUrl: null,
    date: "2026-02-20",
    durationMinutes: 10,
    expressionsUsed: 4,
    expressionsTotal: 5,
    wpm: 112,
    seriesName: "도쿄 여행기",
    seriesOrder: 1,
    seriesTotal: 3,
    scenes: [
      {
        name: "스카이트리 전망대 (하늘을 배경으로)",
        script:
          "Hey everyone, welcome to Tokyo day one! I had no idea where to start because everything here is just incredible. We kicked off at Skytree, and I was completely blown away by the view from the top. The whole city stretches out in every direction. If you're ever in Tokyo, it's definitely worth a visit.",
        expressions: [
          {
            phrase: "I had no idea where to start.",
            meaning: "어디서부터 시작해야 할지 전혀 몰랐어요",
            nuance: "'have no idea'는 'don't know'보다 훨씬 강하고 구어적인 표현.",
          },
          {
            phrase: "We kicked off at Skytree.",
            meaning: "스카이트리에서 시작했어요",
            nuance: "'kick off' = 시작하다. 여행·이벤트 일정의 출발을 설명할 때 자연스러운 구어 표현.",
          },
          {
            phrase: "I was completely blown away by the view.",
            meaning: "경치에 완전히 압도됐어요",
            nuance: "'blown away' = 강한 감동으로 압도되다. 풍경·음식·공연 모두 사용 가능.",
          },
          {
            phrase: "The whole city stretches out in every direction.",
            meaning: "도시 전체가 사방으로 펼쳐져 있어요",
            nuance: "'stretch out' = 쭉 펼쳐지다. 넓은 공간을 시각적으로 묘사할 때 생생한 표현.",
          },
          {
            phrase: "It's definitely worth a visit.",
            meaning: "꼭 한번 가볼 만해요",
            nuance: "'worth + 명사/동명사' 구조로 추천을 표현. worth trying / worth watching 등 응용 가능.",
          },
        ],
      },
      {
        name: "아사쿠사 거리 (센소지 앞에서)",
        script:
          "After Skytree we wandered into Asakusa, and the atmosphere there was absolutely electric — street food, ancient temples, incredible energy everywhere. I couldn't help but take a million photos. It's one of those places where you forget to film because you're too busy experiencing it.",
        expressions: [
          {
            phrase: "We wandered into Asakusa.",
            meaning: "아사쿠사로 슬슬 걸어 들어갔어요",
            nuance: "'wander' = 목적 없이 어슬렁거리며 이동하다. 여행 중 자연스러운 동선 묘사에 딱.",
          },
          {
            phrase: "The atmosphere was absolutely electric.",
            meaning: "분위기가 완전히 열기로 가득했어요",
            nuance: "'electric'으로 장소 분위기를 묘사하면 설레고 에너지 넘치는 느낌이 전달됨.",
          },
          {
            phrase: "I couldn't help but take a million photos.",
            meaning: "사진을 수도 없이 찍지 않을 수 없었어요",
            nuance: "'couldn't help but + 동사' = 참을 수 없어서 ~했다. 충동적 행동에 자주 사용.",
          },
          {
            phrase: "It's one of those places where you forget to film.",
            meaning: "촬영을 잊어버리게 되는 그런 곳이에요",
            nuance: "'one of those places/moments where...' 구조로 보편적 경험을 세련되게 표현.",
          },
          {
            phrase: "You're too busy experiencing it.",
            meaning: "경험하느라 너무 바빠요",
            nuance: "'too busy + 동명사' = ~하느라 너무 바쁘다. 무언가에 완전히 몰입 중임을 표현.",
          },
        ],
      },
      {
        name: "호텔 방에서 (첫날 마무리)",
        script:
          "Wrapping up day one from the hotel. I'm exhausted but in the best possible way. Today was everything I imagined Tokyo would be and more. I had the time of my life, and tomorrow we've got Shibuya on the list. Subscribe if you want to follow along on this whole trip — see you tomorrow!",
        expressions: [
          {
            phrase: "I'm exhausted but in the best possible way.",
            meaning: "지쳐있지만 최고로 좋은 방식으로요",
            nuance: "'in the best/worst possible way'는 형용사를 문장 끝에서 뉘앙스를 조절하는 표현.",
          },
          {
            phrase: "Today was everything I imagined and more.",
            meaning: "오늘은 상상했던 그 이상이었어요",
            nuance: "'everything + 관계절 + and more'는 기대 이상임을 간결하게 전달하는 패턴.",
          },
          {
            phrase: "I had the time of my life.",
            meaning: "내 인생 최고의 시간을 보냈어요",
            nuance: "다시 없을 특별한 경험에 쓰는 최상급 표현. 영상 마무리 멘트로 자연스러움.",
          },
          {
            phrase: "We've got Shibuya on the list.",
            meaning: "시부야가 계획 목록에 있어요",
            nuance: "'have ~ on the list' = 계획에 있다. 다음 일정을 자연스럽게 소개하는 전환 표현.",
          },
          {
            phrase: "Subscribe if you want to follow along.",
            meaning: "함께 따라오고 싶다면 구독하세요",
            nuance: "'follow along' = 함께 따라가다. 구독 유도 멘트 중 가장 부드럽고 자연스러운 표현.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-02",
    title: "집에서 카페 만들기",
    emoji: "☕",
    thumbnailUrl: null,
    date: "2026-02-22",
    durationMinutes: 8,
    expressionsUsed: 3,
    expressionsTotal: 5,
    wpm: 98,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    scenes: [
      {
        name: "원두 고르며 (부엌 카운터에서)",
        script:
          "What's up guys! So I've been on a huge coffee kick lately and I thought — why not just set up a little café corner at home? I picked up a hand grinder, some single-origin beans, and a pour-over kit. The whole setup cost me less than thirty dollars, which is wild. I totally underestimated how easy this was going to be.",
        expressions: [
          {
            phrase: "I've been on a huge coffee kick lately.",
            meaning: "요즘 커피에 완전히 빠져있어요",
            nuance: "'on a ~ kick' = 최근 ~에 꽂혀있다. 관심사 앞에 붙이면 구어적으로 잘 표현됨.",
          },
          {
            phrase: "Why not just set up a little café corner at home?",
            meaning: "집에 작은 카페 코너를 만들면 어떨까요?",
            nuance: "'Why not + 동사원형?' = ~하면 어때? 즉흥적인 아이디어를 제안할 때 쓰는 구어 표현.",
          },
          {
            phrase: "I picked up a hand grinder.",
            meaning: "핸드 그라인더를 사왔어요",
            nuance: "'pick up' = 구매하다, 사다. 'buy'보다 캐주얼하고 자연스러운 일상 표현.",
          },
          {
            phrase: "Which is wild.",
            meaning: "그게 진짜 말이 안 되게 싸요",
            nuance: "'which is wild' = 믿기 어려울 정도라는 뜻. 가격이나 사실에 놀라움을 표현할 때 씀.",
          },
          {
            phrase: "I totally underestimated how easy this was.",
            meaning: "이게 이렇게 쉬울 줄 완전히 몰랐어요",
            nuance: "'underestimate' = 과소평가하다. 막연히 어렵다고 생각했던 것이 쉬웠을 때 딱 맞는 표현.",
          },
        ],
      },
      {
        name: "드립 중 (커피 내리는 과정 클로즈업)",
        script:
          "Okay so here's the actual pour-over process — and honestly it's way more satisfying to watch than I thought. You just need patience and a steady hand. The smell alone is worth the whole setup. It turned out better than I expected — rich, smooth, and honestly better than most coffee shops near me. I'm not exaggerating.",
        expressions: [
          {
            phrase: "It's way more satisfying than I thought.",
            meaning: "생각보다 훨씬 더 만족스러워요",
            nuance: "'way more ~ than I thought'는 예상을 훨씬 뛰어넘었을 때 쓰는 강조 구조.",
          },
          {
            phrase: "You just need patience and a steady hand.",
            meaning: "인내심과 안정된 손만 있으면 돼요",
            nuance: "'steady hand' = 떨리지 않는 안정된 손. 정밀한 작업이 필요한 상황을 묘사할 때 씀.",
          },
          {
            phrase: "The smell alone is worth the whole setup.",
            meaning: "향기만으로도 이 모든 세팅이 가치 있어요",
            nuance: "'~ alone is worth ~'는 하나의 요소만으로 전체를 정당화하는 강조 패턴.",
          },
          {
            phrase: "It turned out better than I expected.",
            meaning: "예상보다 훨씬 잘 됐어요",
            nuance: "'turn out' = 결과가 ~하게 나오다. 결과를 설명할 때 아주 자주 쓰는 동사구.",
          },
          {
            phrase: "I'm not exaggerating.",
            meaning: "과장이 아니에요",
            nuance: "강한 주장 뒤에 붙여서 신뢰성을 높이는 표현. 'I swear', 'honestly' 등과 비슷한 역할.",
          },
        ],
      },
      {
        name: "첫 한 모금 후 소감",
        script:
          "Okay. First sip. Yeah, that's good coffee. This has become part of my morning routine now and I genuinely look forward to it every day. If you're into coffee at all, give it a go — you won't regret it. Drop a comment below if you want me to do a full tutorial. See you next time!",
        expressions: [
          {
            phrase: "This has become part of my morning routine.",
            meaning: "이게 이제 제 아침 루틴의 일부가 됐어요",
            nuance: "'become part of ~' = ~의 일부가 되다. 습관화된 것을 자연스럽게 언급할 때 유용.",
          },
          {
            phrase: "I genuinely look forward to it every day.",
            meaning: "매일 진심으로 기대가 돼요",
            nuance: "'look forward to' = 기대하다. 'genuinely'를 붙이면 진심 어린 설렘이 강조됨.",
          },
          {
            phrase: "If you're into coffee at all.",
            meaning: "커피를 조금이라도 좋아한다면요",
            nuance: "'if you're into ~ at all' = 조금이라도 관심 있다면. 조건을 부드럽게 표현하는 방식.",
          },
          {
            phrase: "Give it a go — you won't regret it.",
            meaning: "한번 해봐요, 후회 안 해요",
            nuance: "'give it a go' = 한번 시도해보다. 'you won't regret it'을 붙이면 강한 추천이 됨.",
          },
          {
            phrase: "Drop a comment below.",
            meaning: "아래에 댓글 남겨주세요",
            nuance: "'drop a comment' = 댓글을 남기다. 유튜브 CTA(행동 유도) 멘트의 가장 자연스러운 표현.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-03",
    title: "새벽 루틴 공개",
    emoji: "🌅",
    thumbnailUrl: null,
    date: "2026-02-25",
    durationMinutes: 6,
    expressionsUsed: 5,
    expressionsTotal: 5,
    wpm: 105,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    hitAchieved: true,
    scenes: [
      {
        name: "알람 끄고 일어나며 (침대 옆에서)",
        script:
          "Good morning! Okay, I'll be honest — I'm not really a morning person, but I've been working on it for the past few months and it's genuinely changed things for me. My alarm goes off at five-thirty. I know, I know. But starting the day on the right foot really does make all the difference. This is day forty-two of the experiment.",
        expressions: [
          {
            phrase: "I'll be honest.",
            meaning: "솔직하게 말할게요",
            nuance: "영상에서 솔직한 이야기를 꺼낼 때 쓰는 자연스러운 도입 표현. 공감을 끌어내는 역할.",
          },
          {
            phrase: "I'm not really a morning person.",
            meaning: "저는 원래 아침형 인간이 아니에요",
            nuance: "'morning person' = 아침에 잘 일어나는 사람. 반대로 'night owl' = 올빼미형 인간.",
          },
          {
            phrase: "I've been working on it.",
            meaning: "고치려고 노력 중이에요",
            nuance: "'work on ~' = ~을 개선하려 노력하다. 완벽하지 않아도 성장 중임을 표현하는 구어 표현.",
          },
          {
            phrase: "My alarm goes off at five-thirty.",
            meaning: "알람이 5시 30분에 울려요",
            nuance: "'go off' = (알람이) 울리다. 'ring'이나 'sound'보다 훨씬 자연스러운 일상 표현.",
          },
          {
            phrase: "Starting the day on the right foot makes all the difference.",
            meaning: "하루를 좋은 출발로 시작하는 게 모든 걸 바꿔요",
            nuance: "'start on the right foot' = 좋은 시작을 끊다. 'make all the difference' = 완전히 다른 결과를 만들다.",
          },
        ],
      },
      {
        name: "모닝 루틴 준비 (부엌에서 레몬 물 만들며)",
        script:
          "First thing I do is make a glass of warm lemon water — it's such a simple thing but it wakes me up better than coffee does in the first ten minutes. Then I do five minutes of light stretching by the window. No music, no phone, nothing. I carved out this quiet time just for myself, and it's become my favourite part of the day.",
        expressions: [
          {
            phrase: "First thing I do is make lemon water.",
            meaning: "제일 먼저 하는 게 레몬 물 만들기예요",
            nuance: "'First thing I do is + 동사원형' = 가장 먼저 하는 것은 ~이다. 루틴 소개에 자주 쓰는 패턴.",
          },
          {
            phrase: "It wakes me up better than coffee.",
            meaning: "커피보다 더 잘 깨워줘요",
            nuance: "'wake someone up' = 잠을 깨우다. 물건이나 행동이 주어가 되는 자연스러운 구조.",
          },
          {
            phrase: "I do five minutes of light stretching.",
            meaning: "가볍게 5분 스트레칭을 해요",
            nuance: "'do ~ minutes of + 활동' 패턴으로 루틴을 간결하게 설명. 시간 + 강도를 동시에 표현.",
          },
          {
            phrase: "I carved out this quiet time just for myself.",
            meaning: "오롯이 나를 위한 조용한 시간을 만들어냈어요",
            nuance: "'carve out time' = 바쁜 일상에서 시간을 능동적으로 확보하다. 수동이 아닌 의지의 뉘앙스.",
          },
          {
            phrase: "It's become my favourite part of the day.",
            meaning: "하루 중 가장 좋아하는 시간이 됐어요",
            nuance: "습관이 좋아하는 루틴으로 자리잡았을 때 쓰는 자연스러운 마무리 표현.",
          },
        ],
      },
      {
        name: "조용한 시간 (소파에서 노트 들고)",
        script:
          "After that I sit quietly for about ten minutes and just think or write down what I want from the day. It's a small habit, but it's had a big impact on my focus and mood. If you're struggling with mornings, I highly recommend giving it a try — even just one week. Let me know in the comments how it goes!",
        expressions: [
          {
            phrase: "I write down what I want from the day.",
            meaning: "오늘 하루에서 원하는 것을 써 내려가요",
            nuance: "'write down' = 적어두다. 'write'보다 구체적으로 메모하는 행동을 강조하는 표현.",
          },
          {
            phrase: "It's a small habit that's had a big impact.",
            meaning: "작은 습관인데 큰 변화를 가져왔어요",
            nuance: "작은 실천이 큰 차이를 만든다는 메시지. 자기계발 영상에서 공감 댓글을 많이 유발하는 구조.",
          },
          {
            phrase: "If you're struggling with mornings.",
            meaning: "아침에 힘드신 분들이라면요",
            nuance: "'struggle with ~' = ~로 어려움을 겪다. 공감대를 형성하며 조언을 건네는 브리지 표현.",
          },
          {
            phrase: "I highly recommend giving it a try.",
            meaning: "꼭 한번 해보시길 강력히 추천드려요",
            nuance: "'highly recommend' = 강력히 추천. 'giving it a try'로 마무리하면 부담 없이 권유하는 뉘앙스.",
          },
          {
            phrase: "Let me know in the comments how it goes.",
            meaning: "어떻게 됐는지 댓글로 알려주세요",
            nuance: "'let me know how it goes' = 어떻게 되는지 알려달라. 시청자 참여를 유도하는 자연스러운 마무리.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-04",
    title: "요리 브이로그 입문",
    emoji: "🍳",
    thumbnailUrl: null,
    date: "2026-02-28",
    durationMinutes: 9,
    expressionsUsed: 3,
    expressionsTotal: 5,
    wpm: 89,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    scenes: [
      {
        name: "재료 준비 (부엌 카운터에서)",
        script:
          "Hey! So this week I decided to step outside my comfort zone and cook a proper meal from scratch — homemade pasta with tomato cream sauce. I've always been a takeout person, so this is a real challenge for me. Here's all the ingredients laid out. Doesn't look too intimidating, right? Right. Let's get into it.",
        expressions: [
          {
            phrase: "I decided to step outside my comfort zone.",
            meaning: "편안한 영역 밖으로 나가보기로 결심했어요",
            nuance: "'step outside one's comfort zone' = 익숙한 것에서 벗어나 새로운 도전을 하다. 도전 영상 오프닝 필수 표현.",
          },
          {
            phrase: "Cook a proper meal from scratch.",
            meaning: "처음부터 제대로 된 식사를 만들다",
            nuance: "'from scratch' = 아무것도 없는 상태에서 처음부터. 'proper' = 제대로 된, 제대로 차린.",
          },
          {
            phrase: "I've always been a takeout person.",
            meaning: "저는 항상 배달·포장 음식을 먹어왔어요",
            nuance: "'a ~ person' = ~를 주로 하는 사람. 자신의 성향을 쉽게 설명하는 패턴.",
          },
          {
            phrase: "Doesn't look too intimidating, right?",
            meaning: "너무 어렵게 보이지는 않죠?",
            nuance: "'intimidating' = 겁먹게 하는. 'right?'를 붙이면 시청자에게 공감을 구하는 느낌.",
          },
          {
            phrase: "Let's get into it.",
            meaning: "바로 시작해봐요",
            nuance: "설명을 마치고 본격적으로 시작할 때 쓰는 전환 표현. 'Let's go'보다 약간 더 집중적인 뉘앙스.",
          },
        ],
      },
      {
        name: "파스타 반죽 중 (힘들어하며)",
        script:
          "Okay so the pasta dough alone took me three tries. It's a bit of a learning curve, but honestly so much fun once you stop panicking. The key is not rushing it — just work the dough slowly and trust the process. Cooking from scratch is surprisingly satisfying once things start coming together. Almost there.",
        expressions: [
          {
            phrase: "The pasta dough alone took me three tries.",
            meaning: "반죽만 세 번 시도했어요",
            nuance: "'~ alone took ~' = ~만 하는 데 ~가 걸렸다. 작업의 난이도를 강조하는 구조.",
          },
          {
            phrase: "It's a bit of a learning curve.",
            meaning: "배우는 데 시간이 좀 걸려요",
            nuance: "'learning curve' = 처음에 익히는 데 걸리는 노력. 어렵지만 포기는 아니라는 뉘앙스.",
          },
          {
            phrase: "The key is not rushing it.",
            meaning: "핵심은 서두르지 않는 거예요",
            nuance: "'The key is + 동명사' = 핵심은 ~하는 것이다. 팁이나 비법을 소개할 때 쓰는 간결한 패턴.",
          },
          {
            phrase: "Trust the process.",
            meaning: "과정을 믿으세요",
            nuance: "결과가 불확실해도 방법을 믿고 따라가라는 의미. 요리·운동·창작 활동에서 자주 쓰이는 격려 표현.",
          },
          {
            phrase: "Once things start coming together.",
            meaning: "모든 게 맞춰지기 시작하면요",
            nuance: "'come together' = 요소들이 조화롭게 합쳐지다. 요리·프로젝트가 완성되어 가는 순간을 묘사.",
          },
        ],
      },
      {
        name: "완성 후 플레이팅 (접시 앞에서)",
        script:
          "Look at this. I went all out on the presentation because — well, content. The final result honestly looks like it came from a restaurant, if I do say so myself. And the taste? I'm not going to lie, it was incredible. I'm already planning my next dish. Drop your suggestions in the comments!",
        expressions: [
          {
            phrase: "I went all out on the presentation.",
            meaning: "플레이팅에 완전히 힘을 쏟았어요",
            nuance: "'go all out' = 온 힘을 다하다. 특히 음식·이벤트 준비에서 과하게 신경 쓴 걸 재미있게 표현.",
          },
          {
            phrase: "If I do say so myself.",
            meaning: "제가 이런 말을 해도 된다면요",
            nuance: "자기 자신을 칭찬하면서 겸손함을 동시에 표현하는 구어 표현. 유머러스한 자화자찬에 딱.",
          },
          {
            phrase: "I'm not going to lie.",
            meaning: "솔직히 말할게요",
            nuance: "솔직한 평가를 시작하기 전 쓰는 도입 표현. 'I'll be honest'와 비슷하지만 더 구어적.",
          },
          {
            phrase: "I'm already planning my next dish.",
            meaning: "벌써 다음에 만들 요리를 계획하고 있어요",
            nuance: "성공 후 이미 다음 도전을 계획 중이라는 의미. 열정과 흥미를 자연스럽게 전달.",
          },
          {
            phrase: "Drop your suggestions in the comments.",
            meaning: "댓글에 추천 남겨주세요",
            nuance: "'drop' = 남기다, 던지다. 'leave a comment'보다 캐주얼하고 에너지 넘치는 CTA 표현.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-05",
    title: "노을 타임랩스 촬영",
    emoji: "🌇",
    thumbnailUrl: null,
    date: "2026-03-02",
    durationMinutes: 5,
    expressionsUsed: 4,
    expressionsTotal: 5,
    wpm: 118,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    scenes: [
      {
        name: "언덕 공원 도착 (삼각대 꺼내며)",
        script:
          "Short one today but I had to share this. I drove up to the hillside park last Sunday with my tripod — total spur-of-the-moment decision. The sky already looked promising so I set up my gear and waited patiently for about an hour. No agenda, no plan. Just me, my camera, and whatever the sky decided to do.",
        expressions: [
          {
            phrase: "I had to share this.",
            meaning: "이건 꼭 공유해야 했어요",
            nuance: "'I had to' = ~하지 않을 수 없었다. 충동적이고 진심 어린 공유 욕구를 표현.",
          },
          {
            phrase: "Total spur-of-the-moment decision.",
            meaning: "완전히 즉흥적인 결정이었어요",
            nuance: "'spur-of-the-moment' = 충동적인, 즉흥적인. 계획 없이 행동한 것을 표현하는 세련된 숙어.",
          },
          {
            phrase: "The sky already looked promising.",
            meaning: "하늘이 이미 기대되는 모습이었어요",
            nuance: "'look promising' = 좋은 결과가 기대되어 보이다. 날씨·상황·사람 모두에 사용 가능.",
          },
          {
            phrase: "I set up my gear and waited patiently.",
            meaning: "장비를 세팅하고 인내심 있게 기다렸어요",
            nuance: "'set up gear' = 장비를 설치하다. 촬영·음악·운동 등 준비 과정 묘사에 자주 씀.",
          },
          {
            phrase: "No agenda, no plan.",
            meaning: "아무런 계획도 없었어요",
            nuance: "짧은 두 어구를 나열하는 방식으로 자유로운 상태를 강조. 리듬감 있는 구어 표현.",
          },
        ],
      },
      {
        name: "노을이 시작될 때 (카메라 옆에 앉아서)",
        script:
          "And then it started. Deep oranges melting into purple and pink across the whole horizon. The sky put on quite a show — honestly better than anything I've seen on a screen. The colors were absolutely breathtaking. I sat there barely breathing, trying to take it all in before it faded. It was totally worth the wait.",
        expressions: [
          {
            phrase: "Deep oranges melting into purple and pink.",
            meaning: "진한 오렌지색이 보라색과 분홍색으로 녹아들었어요",
            nuance: "'melt into' = 녹아 들다. 색이나 소리가 자연스럽게 섞여드는 장면을 시적으로 묘사.",
          },
          {
            phrase: "The sky put on quite a show.",
            meaning: "하늘이 멋진 쇼를 선보였어요",
            nuance: "'put on a show' = 인상적인 퍼포먼스를 보이다. 자연현상에 쓰면 생생한 의인화 표현이 됨.",
          },
          {
            phrase: "The colors were absolutely breathtaking.",
            meaning: "색깔이 정말 숨이 멎을 정도로 아름다웠어요",
            nuance: "'breathtaking' = 숨을 멎게 하는. 시각적 아름다움의 최상급 표현. 'absolutely'로 강도를 높임.",
          },
          {
            phrase: "I sat there barely breathing.",
            meaning: "숨도 제대로 못 쉬고 그냥 앉아 있었어요",
            nuance: "'barely + 동명사' = 겨우 ~하다. 감동이 너무 커서 행동이 멈춰버린 상태를 생생하게 묘사.",
          },
          {
            phrase: "It was totally worth the wait.",
            meaning: "기다린 게 완전히 가치 있었어요",
            nuance: "'worth the wait' = 기다린 보람이 있다. 시간과 인내를 투자한 것을 정당화하는 표현.",
          },
        ],
      },
      {
        name: "타임랩스 영상 보여주며 (마무리)",
        script:
          "The full timelapse is at the end of this video — watch it in full screen, it's worth it. Nature never disappoints when you show up for it. I think sometimes we just need to drive somewhere with no plan and see what happens. Anyway, hope this video gave you some peace. See you in the next one.",
        expressions: [
          {
            phrase: "Watch it in full screen — it's worth it.",
            meaning: "전체 화면으로 보세요 — 그럴 가치가 있어요",
            nuance: "'it's worth it' = 그럴 만한 가치가 있다. 행동을 촉구하면서 기대를 높이는 마무리 표현.",
          },
          {
            phrase: "Nature never disappoints when you show up for it.",
            meaning: "자연은 직접 찾아가면 절대 실망시키지 않아요",
            nuance: "'show up for ~' = ~을 위해 직접 나타나다. 수동적 관람이 아닌 능동적 참여를 강조.",
          },
          {
            phrase: "See what happens.",
            meaning: "어떻게 되는지 지켜봐요",
            nuance: "'see what happens' = 어떻게 되는지 두고 보다. 즉흥적인 태도와 기대감을 동시에 표현.",
          },
          {
            phrase: "Hope this video gave you some peace.",
            meaning: "이 영상이 마음의 평화를 드렸으면 해요",
            nuance: "감성적인 영상 마무리에 쓰는 따뜻한 클로징 표현. 시청자를 배려하는 뉘앙스.",
          },
          {
            phrase: "See you in the next one.",
            meaning: "다음 영상에서 봐요",
            nuance: "유튜브 영상의 가장 자연스러운 마무리 표현. 'See you next time'과 함께 필수 구문.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-06",
    title: "주말 산책 브이로그",
    emoji: "🚶",
    thumbnailUrl: null,
    date: "2026-03-05",
    durationMinutes: 7,
    expressionsUsed: 3,
    expressionsTotal: 5,
    wpm: 94,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    scenes: [
      {
        name: "집 앞을 나서며 (카메라 들고)",
        script:
          "Hey, welcome back. This is going to be a pretty chill one. I needed to clear my head this weekend so I grabbed my camera and went for a walk with no destination in mind. There's something so grounding about being in nature — I genuinely forget that sometimes when I'm stuck in the city routine. No plan, just walking.",
        expressions: [
          {
            phrase: "This is going to be a pretty chill one.",
            meaning: "오늘은 꽤 여유로운 영상이 될 거예요",
            nuance: "'chill' = 느긋하고 편안한. 무거운 주제나 빠른 편집 없이 여유로운 영상임을 미리 알리는 표현.",
          },
          {
            phrase: "I needed to clear my head.",
            meaning: "머리를 좀 식힐 필요가 있었어요",
            nuance: "'clear one's head' = 복잡한 생각을 정리하다. 스트레스나 과부하 상태를 솔직하게 표현.",
          },
          {
            phrase: "I went for a walk with no destination in mind.",
            meaning: "목적지 없이 산책을 나갔어요",
            nuance: "'with no ~ in mind' = ~을 염두에 두지 않고. 즉흥적이고 자유로운 행동을 표현.",
          },
          {
            phrase: "There's something so grounding about being in nature.",
            meaning: "자연 속에 있으면 발을 딛게 해주는 뭔가가 있어요",
            nuance: "'grounding' = 현실에 중심을 잡게 해주는. 자연·명상이 주는 안정감을 표현하는 감성적 단어.",
          },
          {
            phrase: "I'm stuck in the city routine.",
            meaning: "도시 루틴에 갇혀있어요",
            nuance: "'stuck in ~' = ~에 갇혀있다. 반복되는 일상에서 벗어나지 못하는 상태를 솔직하게 표현.",
          },
        ],
      },
      {
        name: "강변 트레일에서 (걷는 중)",
        script:
          "I ended up on the riverside trail and walked for about two hours. At some point I stumbled upon this hidden little spot — a wooden bench right by the water, completely tucked away. I sat there for maybe thirty minutes just watching the current. No content plan, no script, just me and my thoughts. I needed this.",
        expressions: [
          {
            phrase: "I ended up on the riverside trail.",
            meaning: "결국 강변 트레일에 닿았어요",
            nuance: "'end up + 장소/상황' = 결국 ~하게 되다. 계획 없이 행동하다 어딘가에 도달했을 때 자연스러운 표현.",
          },
          {
            phrase: "I stumbled upon this hidden little spot.",
            meaning: "우연히 이 숨겨진 작은 장소를 발견했어요",
            nuance: "'stumble upon' = 우연히 발견하다. 계획 없이 찾아낸 것을 표현하는 여행 브이로그 필수 표현.",
          },
          {
            phrase: "Completely tucked away.",
            meaning: "완전히 구석에 숨겨진",
            nuance: "'tucked away' = 숨겨진, 외진. 아무도 모르는 비밀스러운 장소를 묘사할 때 딱 맞는 표현.",
          },
          {
            phrase: "Just watching the current.",
            meaning: "그냥 물살을 바라보고 있었어요",
            nuance: "'current' = 물살, 흐름. 강이나 바다의 흐름을 묘사할 때 쓰는 자연스러운 단어.",
          },
          {
            phrase: "No content plan, no script.",
            meaning: "콘텐츠 계획도, 스크립트도 없었어요",
            nuance: "두 개의 'no' 구문을 나열해 자유로운 상태를 강조. 브이로그의 즉흥성을 표현하는 리듬감 있는 구조.",
          },
        ],
      },
      {
        name: "집으로 돌아오며 (해질녘)",
        script:
          "Sometimes the best days are the unplanned ones — and today was a good reminder of that. I came back feeling completely refreshed, which is honestly more valuable than any productive Saturday. If you're feeling overwhelmed, just go walk somewhere. Anyway, hope this gave you a bit of that energy too. See you next time.",
        expressions: [
          {
            phrase: "Sometimes the best days are the unplanned ones.",
            meaning: "가끔은 계획 없는 날이 최고의 날이 돼요",
            nuance: "즉흥성의 가치를 담은 철학적 문장. 영상 중반이나 마무리에 넣으면 여운을 남기는 효과.",
          },
          {
            phrase: "Today was a good reminder of that.",
            meaning: "오늘이 그걸 다시 일깨워줬어요",
            nuance: "'a good reminder' = 무언가를 상기시켜주는 계기. 경험에서 얻은 교훈을 부드럽게 전달.",
          },
          {
            phrase: "I came back feeling completely refreshed.",
            meaning: "돌아왔을 때 완전히 재충전된 느낌이었어요",
            nuance: "'come back feeling ~' = ~한 상태로 돌아오다. 경험 후 달라진 내면 상태를 묘사하는 패턴.",
          },
          {
            phrase: "More valuable than any productive Saturday.",
            meaning: "어떤 생산적인 토요일보다도 더 값진",
            nuance: "생산성이 아닌 회복의 가치를 강조하는 표현. 공감을 많이 얻는 가치관 메시지.",
          },
          {
            phrase: "If you're feeling overwhelmed, just go walk somewhere.",
            meaning: "지쳐있다면 그냥 어디든 걸어 나가세요",
            nuance: "'overwhelmed' = 과부하 상태, 감당하기 힘든. 시청자에게 직접 말을 건네는 따뜻한 조언 표현.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-07",
    title: "채널 성장 이야기",
    emoji: "📈",
    thumbnailUrl: null,
    date: "2026-03-08",
    durationMinutes: 12,
    expressionsUsed: 5,
    expressionsTotal: 5,
    wpm: 107,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    hitAchieved: true,
    scenes: [
      {
        name: "카메라 앞에 앉아 솔직하게 (시작 당시를 회상하며)",
        script:
          "Okay, today I want to do something different and just talk — about this channel, about the past year. It's been quite a journey, honestly. When I started, I had zero subscribers, zero views, and absolutely zero idea what I was doing. I think most of you who've been here from the start know that early content was rough.",
        expressions: [
          {
            phrase: "I want to do something different today.",
            meaning: "오늘은 좀 다른 걸 해보려고요",
            nuance: "평소와 다른 형식의 영상을 예고할 때 쓰는 도입 표현. 시청자의 호기심을 자극.",
          },
          {
            phrase: "It's been quite a journey.",
            meaning: "정말 긴 여정이었어요",
            nuance: "좋고 나쁜 경험 모두를 포함한 복합적인 회고 표현. 회고 영상의 오프닝으로 자주 쓰임.",
          },
          {
            phrase: "Zero idea what I was doing.",
            meaning: "제가 뭘 하는 건지 전혀 몰랐어요",
            nuance: "'zero idea' = 전혀 모르다. 'no idea'보다 더 강조된 표현. 초보 시절의 막막함을 솔직하게 전달.",
          },
          {
            phrase: "Most of you who've been here from the start.",
            meaning: "처음부터 함께해온 분들 대부분은",
            nuance: "'who've been here from the start' = 초창기부터 구독한 팬을 지칭하는 따뜻한 표현.",
          },
          {
            phrase: "The early content was rough.",
            meaning: "초기 콘텐츠는 엉망이었어요",
            nuance: "'rough' = 거칠고 완성도가 낮은. 자기 작업의 초기 버전을 솔직하게 평가할 때 씀.",
          },
        ],
      },
      {
        name: "힘들었던 순간 (과거 영상 화면 보여주며)",
        script:
          "There were moments around month three where I almost gave up. The videos weren't growing, I was running out of ideas, and I kept comparing myself to bigger creators. But I'm so glad I didn't quit. Because something clicked around month six. Consistency is key — I truly believe that now.",
        expressions: [
          {
            phrase: "I almost gave up.",
            meaning: "거의 포기할 뻔했어요",
            nuance: "'almost + 과거동사' = 거의 ~할 뻔하다. 실제로는 하지 않았음을 내포. 극적인 솔직함을 표현.",
          },
          {
            phrase: "I was running out of ideas.",
            meaning: "아이디어가 점점 바닥나고 있었어요",
            nuance: "'run out of ~' = ~이 떨어지다, 바닥나다. 창작 슬럼프를 표현하는 가장 자연스러운 구어 표현.",
          },
          {
            phrase: "I kept comparing myself to bigger creators.",
            meaning: "계속 더 큰 크리에이터들과 저를 비교했어요",
            nuance: "'keep + 동명사' = 계속 ~하다. 반복되는 행동을 표현. 비교의 부정적 영향을 솔직하게 전달.",
          },
          {
            phrase: "Something clicked.",
            meaning: "무언가 딱 맞아 떨어졌어요",
            nuance: "'click' = 이해가 딱 되다, 감이 잡히다. 갑자기 성과나 이해가 찾아오는 순간을 표현.",
          },
          {
            phrase: "Consistency is key — I truly believe that.",
            meaning: "꾸준함이 핵심이에요 — 진심으로 그렇게 믿어요",
            nuance: "'consistency is key'는 실제 경험으로 뒷받침될 때 설득력이 생김. 'truly'로 확신을 강조.",
          },
        ],
      },
      {
        name: "지금의 감사 (카메라를 바라보며)",
        script:
          "And then suddenly, people started watching. The support from all of you means the world to me — genuinely. This channel has changed my life in ways I never expected. And I just want you to know — I'm just getting started. The best content is still ahead. Thank you for being here from the beginning.",
        expressions: [
          {
            phrase: "And then suddenly, people started watching.",
            meaning: "그러다 갑자기 사람들이 보기 시작했어요",
            nuance: "'and then suddenly' = 그러다 갑자기. 전환점을 드라마틱하게 표현하는 서사 구조.",
          },
          {
            phrase: "The support from you all means the world to me.",
            meaning: "여러분의 응원이 제게는 전부예요",
            nuance: "'means the world to me' = 나에게 세상 전부를 의미한다. 감사의 최상급 표현.",
          },
          {
            phrase: "In ways I never expected.",
            meaning: "전혀 예상하지 못했던 방식으로",
            nuance: "'in ways I never expected'는 예상 밖의 변화를 강조하는 표현. 감동적인 성장 이야기에 자주 등장.",
          },
          {
            phrase: "I'm just getting started.",
            meaning: "이제 막 시작했을 뿐이에요",
            nuance: "겸손하면서도 앞으로의 포부를 강하게 담은 표현. 성장 영상의 클로징 라인으로 완벽.",
          },
          {
            phrase: "Thank you for being here from the beginning.",
            meaning: "처음부터 함께해줘서 고마워요",
            nuance: "초기 구독자에 대한 특별한 감사. 'from the beginning'이 충성 팬에 대한 따뜻한 인정을 담음.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-08",
    title: "첫 영어 브이로그 도전",
    emoji: "🎬",
    thumbnailUrl: null,
    date: "2026-03-11",
    durationMinutes: 11,
    expressionsUsed: 4,
    expressionsTotal: 5,
    wpm: 86,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    scenes: [
      {
        name: "카메라 켜기 전 긴장하며 (책상 앞)",
        script:
          "Hey guys, so — this is my first video entirely in English. Please bear with me. I was really nervous about this — like, really nervous. I almost filmed it in Korean and just gave up. But then I thought: if not now, when? I was nervous, but I just went for it. And here we are. Let's do this.",
        expressions: [
          {
            phrase: "Please bear with me.",
            meaning: "조금만 참아주세요 / 양해해 주세요",
            nuance: "'bear with me' = 참고 기다려주다. 자신의 서툼을 미리 양해 구하는 부드러운 영어 표현.",
          },
          {
            phrase: "Like, really nervous.",
            meaning: "진짜로, 정말 많이 떨렸어요",
            nuance: "'like'를 강조어로 쓰는 구어 패턴. 'really'를 반복해 감정의 강도를 높이는 자연스러운 표현.",
          },
          {
            phrase: "If not now, when?",
            meaning: "지금 하지 않으면 언제 해요?",
            nuance: "행동을 결심할 때 스스로를 설득하는 강력한 한 마디. 여운 있는 수사적 질문.",
          },
          {
            phrase: "I just went for it.",
            meaning: "그냥 해버렸어요",
            nuance: "'go for it' = 망설임 없이 도전하다. 두려움보다 행동을 택한 결단의 순간을 표현.",
          },
          {
            phrase: "And here we are.",
            meaning: "그래서 지금 여기 있어요",
            nuance: "결심 후 현재 상황을 간결하게 마무리하는 표현. 상황 전환에 자주 쓰이는 브리지 구문.",
          },
        ],
      },
      {
        name: "영어 실력에 대해 솔직하게",
        script:
          "My English is far from perfect. I still pause too much, I forget words, and my accent is definitely there. But I'm improving every day, and the only way to actually get better is to speak. Don't be afraid to make mistakes — that's genuinely how you learn. Imperfect is fine. Done is better than perfect.",
        expressions: [
          {
            phrase: "My English is far from perfect.",
            meaning: "제 영어는 아직 완벽과는 거리가 멀어요",
            nuance: "'far from ~' = ~와 거리가 멀다. 부족함을 인정하면서도 위축되지 않는 솔직한 표현.",
          },
          {
            phrase: "My accent is definitely there.",
            meaning: "억양이 확실히 있어요",
            nuance: "'it's there' = 분명히 존재한다. 부정하지 않고 현실을 있는 그대로 인정하는 자연스러운 표현.",
          },
          {
            phrase: "I'm improving every day.",
            meaning: "매일 조금씩 나아지고 있어요",
            nuance: "결과보다 과정을 강조하는 표현. 학습 진행 중임을 시청자에게 보여주는 성장 서사의 핵심.",
          },
          {
            phrase: "Don't be afraid to make mistakes.",
            meaning: "실수하는 걸 두려워하지 마세요",
            nuance: "언어 학습의 핵심 조언. 시청자에게 용기를 주는 메시지로 좋아요·댓글 유발 효과가 높음.",
          },
          {
            phrase: "Done is better than perfect.",
            meaning: "완성이 완벽보다 낫다",
            nuance: "완벽주의를 극복하는 유명한 격언. 실행의 가치를 강조하는 강력한 한 마디.",
          },
        ],
      },
      {
        name: "마무리 소감 (카메라를 직접 바라보며)",
        script:
          "I've been practicing speaking every day for two months now and the difference is night and day. I'm really proud of how far I've come. And honestly? This is just the beginning of something exciting. Thank you for being here for it — your support means more than I can say. See you next video!",
        expressions: [
          {
            phrase: "The difference is night and day.",
            meaning: "차이가 완전히 달라요 / 하늘과 땅 차이예요",
            nuance: "'night and day' = 낮과 밤처럼 완전히 다른. 두 상태의 극적인 차이를 표현하는 영어 관용구.",
          },
          {
            phrase: "I'm really proud of how far I've come.",
            meaning: "여기까지 온 제 자신이 정말 자랑스러워요",
            nuance: "'how far I've come' = 내가 얼마나 성장했는지. 과거와 현재를 비교하는 성장 서사의 핵심 표현.",
          },
          {
            phrase: "This is just the beginning of something exciting.",
            meaning: "이건 설레는 무언가의 시작일 뿐이에요",
            nuance: "미래에 대한 기대와 설렘을 담은 클로징. 'just the beginning'은 겸손함과 포부를 동시에 전달.",
          },
          {
            phrase: "Your support means more than I can say.",
            meaning: "여러분의 응원이 말로 표현할 수 없을 만큼 소중해요",
            nuance: "'more than I can say' = 말로 다 할 수 없을 만큼. 감사함의 한계를 역설적으로 표현.",
          },
          {
            phrase: "See you next video!",
            meaning: "다음 영상에서 봐요!",
            nuance: "유튜브 영상의 가장 친근하고 자연스러운 마무리 표현 중 하나.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-09",
    title: "서울 카페 투어",
    emoji: "🏙️",
    thumbnailUrl: null,
    date: "2026-03-15",
    durationMinutes: 8,
    expressionsUsed: 4,
    expressionsTotal: 5,
    wpm: 101,
    seriesName: "서울 로컬 스팟",
    seriesOrder: 1,
    seriesTotal: 2,
    scenes: [
      {
        name: "익선동 첫 카페 (빈티지 인테리어 앞에서)",
        script:
          "Welcome back! Today I'm taking you on a café tour of my favourite spots in Seoul — and trust me, Seoul's café scene is genuinely on another level. First stop is this tiny third-wave coffee shop in Ikseon-dong. Exposed brick, vintage furniture, incredible single-origin pour-over. The detail in the interior design blew me away — every element was intentional.",
        expressions: [
          {
            phrase: "I'm taking you on a café tour.",
            meaning: "카페 투어로 여러분을 데려갈게요",
            nuance: "'take someone on a ~' = ~에 데려가다. 시청자를 경험에 초대하는 브이로그 오프닝 패턴.",
          },
          {
            phrase: "Seoul's café scene is on another level.",
            meaning: "서울의 카페 문화는 차원이 달라요",
            nuance: "'on another level' = 수준이 완전히 다르다. 극찬을 간결하게 표현하는 인기 슬랭.",
          },
          {
            phrase: "First stop is this tiny coffee shop in Ikseon-dong.",
            meaning: "첫 번째 장소는 익선동의 작은 커피숍이에요",
            nuance: "'first stop' = 첫 번째 목적지. 투어나 여행 일정을 소개할 때 쓰는 자연스러운 표현.",
          },
          {
            phrase: "The detail in the design blew me away.",
            meaning: "디자인의 세심함에 완전히 압도됐어요",
            nuance: "'the detail in ~' = ~의 세부적인 부분. 공간이나 디자인의 정성을 칭찬할 때 씀.",
          },
          {
            phrase: "Every element was intentional.",
            meaning: "모든 요소가 의도적으로 배치됐어요",
            nuance: "'intentional' = 의도적인. 우연이 아닌 정성이 담긴 설계임을 표현하는 세련된 칭찬.",
          },
        ],
      },
      {
        name: "홍대 루프탑 카페 (도시 전망 배경)",
        script:
          "Second stop is a rooftop café in Hongdae with a view of the whole neighbourhood — perfect for content, obviously. I was spoiled for choice with angles up here. Each place we visited had its own completely unique vibe, which I love about Seoul. You can walk five minutes and feel like you're in a totally different world.",
        expressions: [
          {
            phrase: "Perfect for content, obviously.",
            meaning: "콘텐츠용으로 완벽하죠, 당연히",
            nuance: "'obviously'를 문장 끝에 붙이면 자명한 사실을 유머러스하게 인정하는 뉘앙스.",
          },
          {
            phrase: "I was spoiled for choice.",
            meaning: "선택지가 너무 많아서 고르기 힘들었어요",
            nuance: "'spoiled for choice' = 좋은 옵션이 너무 많아 오히려 고르기 힘든 상태. 긍정적인 고민.",
          },
          {
            phrase: "Each place had its own unique vibe.",
            meaning: "각 곳마다 자기만의 독특한 분위기가 있었어요",
            nuance: "'vibe' = 분위기, 감성. 장소나 사람이 풍기는 에너지를 표현하는 핵심 구어 단어.",
          },
          {
            phrase: "You can walk five minutes and feel like you're in a totally different world.",
            meaning: "5분만 걸어도 완전히 다른 세상에 있는 것 같아요",
            nuance: "짧은 거리에서 극적인 변화를 표현하는 패턴. 도시의 다양성을 생생하게 묘사.",
          },
          {
            phrase: "Which I love about Seoul.",
            meaning: "그게 바로 제가 서울을 좋아하는 이유예요",
            nuance: "'which I love about ~' = ~에서 내가 좋아하는 점이 바로 그것이다. 감상을 자연스럽게 연결.",
          },
        ],
      },
      {
        name: "다섯 번째 카페에서 (마무리)",
        script:
          "By café five I was fully caffeinated but zero regrets. I'll link all five spots in the description — everything you need to do this tour yourself. I'll definitely be coming back to every single one of them. Let me know if you want a full written guide with directions and opening hours. See you in the next one!",
        expressions: [
          {
            phrase: "Fully caffeinated but zero regrets.",
            meaning: "카페인 완충됐지만 후회 없어요",
            nuance: "'zero regrets' = 전혀 후회 없음. 'no regrets'보다 숫자를 써서 더 강조한 구어 표현.",
          },
          {
            phrase: "Everything you need to do this tour yourself.",
            meaning: "이 투어를 직접 하는 데 필요한 모든 것",
            nuance: "시청자가 직접 따라할 수 있도록 안내하는 CTA 표현. 실용적인 정보 제공 의지를 담음.",
          },
          {
            phrase: "I'll definitely be coming back.",
            meaning: "무조건 다시 올 거예요",
            nuance: "'I'll be coming back'은 'I'll come back'보다 더 구어적이고 확신에 찬 표현.",
          },
          {
            phrase: "Let me know if you want a full written guide.",
            meaning: "전체 가이드를 원하면 알려주세요",
            nuance: "시청자 반응을 보고 추가 콘텐츠를 제작하겠다는 의사 표현. 참여를 유도하는 자연스러운 방식.",
          },
          {
            phrase: "See you in the next one!",
            meaning: "다음 영상에서 봐요!",
            nuance: "유튜브 마무리 표현 중 가장 자연스럽고 자주 쓰이는 클로징 멘트.",
          },
        ],
      },
    ],
  },
  {
    id: "demo-10",
    title: "1만명 달성 기념 Q&A",
    emoji: "🎉",
    thumbnailUrl: null,
    date: "2026-03-20",
    durationMinutes: 15,
    expressionsUsed: 5,
    expressionsTotal: 5,
    wpm: 115,
    seriesName: null,
    seriesOrder: null,
    seriesTotal: null,
    scenes: [
      {
        name: "카메라 앞에서 숫자를 보며 (벅찬 표정)",
        script:
          "Oh my gosh. Ten thousand subscribers. I genuinely couldn't have done this without every single one of you. When I saw the number, it just hit me all at once — I sat there staring at my screen for five minutes not knowing what to feel. So to celebrate, I asked you to send your questions, and wow, did you deliver.",
        expressions: [
          {
            phrase: "Oh my gosh.",
            meaning: "세상에 / 맙소사",
            nuance: "'Oh my gosh'는 'Oh my God'의 순한 표현. 큰 충격이나 감동을 표현하는 가장 자연스러운 구어 반응.",
          },
          {
            phrase: "I genuinely couldn't have done this without you.",
            meaning: "진심으로 여러분 없이는 해낼 수 없었어요",
            nuance: "'couldn't have done without ~' = ~없이는 불가능했을 것. 감사함을 전달하는 가장 진심 어린 구조.",
          },
          {
            phrase: "It just hit me all at once.",
            meaning: "한꺼번에 확 실감이 났어요",
            nuance: "'hit someone' = 실감이 나다, 마음에 와 닿다. 'all at once' = 갑자기, 한꺼번에.",
          },
          {
            phrase: "Not knowing what to feel.",
            meaning: "어떤 감정을 느껴야 할지 모르겠어요",
            nuance: "압도적인 감동의 순간에 쓰는 표현. 감정이 너무 커서 정리가 안 될 때 공감을 많이 받음.",
          },
          {
            phrase: "Wow, did you deliver.",
            meaning: "와, 기대에 확실히 부응했네요",
            nuance: "'deliver' = 기대한 것을 해내다. 도치 구문('did you deliver')으로 감탄을 극적으로 표현.",
          },
        ],
      },
      {
        name: "팬 질문 답변 중 (노트 들고)",
        script:
          "Your questions really made me think. Someone asked what my lowest point was — honestly, it was month four, when I almost quit entirely. Someone else asked about my English journey — I've been practicing speaking every day for eight months now and the difference is really night and day. It takes time, but it works.",
        expressions: [
          {
            phrase: "Your questions really made me think.",
            meaning: "여러분의 질문들이 정말 생각하게 만들었어요",
            nuance: "'make someone think' = 깊이 생각하게 하다. 단순한 질문이 아닌 의미 있는 질문이었다는 칭찬.",
          },
          {
            phrase: "My lowest point.",
            meaning: "제가 가장 힘들었던 순간",
            nuance: "'lowest point' = 가장 힘든 시기, 밑바닥. 개인 성장 이야기에서 솔직함을 표현하는 핵심 표현.",
          },
          {
            phrase: "I almost quit entirely.",
            meaning: "완전히 그만둘 뻔했어요",
            nuance: "'entirely' = 완전히, 전부. 'almost quit'에 'entirely'를 붙여 포기의 강도를 강조.",
          },
          {
            phrase: "The difference is really night and day.",
            meaning: "차이가 정말 하늘과 땅이에요",
            nuance: "'night and day' = 낮과 밤처럼 완전히 다른. 두 상태의 극적인 차이를 표현하는 관용구.",
          },
          {
            phrase: "It takes time, but it works.",
            meaning: "시간이 걸리지만, 효과가 있어요",
            nuance: "학습이나 노력의 결실을 간결하게 표현. 포기하지 말라는 격려를 담은 강력한 한 마디.",
          },
        ],
      },
      {
        name: "마무리 (카메라를 바라보며)",
        script:
          "Here's to the next milestone — fifty thousand, here we come! This is truly just the beginning, and I cannot wait to show you what's next. Thank you for watching, thank you for commenting, and thank you for just being here. It means everything. See you in the next one — don't forget to subscribe!",
        expressions: [
          {
            phrase: "Here's to the next milestone!",
            meaning: "다음 마일스톤을 향해 건배 / 기대해봐요!",
            nuance: "'Here's to ~' = ~을 위해 건배. 축하와 동시에 다음 목표를 향한 설렘을 표현하는 마무리 멘트.",
          },
          {
            phrase: "Here we come!",
            meaning: "우리가 간다! / 여기 간다!",
            nuance: "목표를 향해 나아가는 결의와 흥분을 표현. 팀이나 채널이 함께 달려가는 느낌을 줌.",
          },
          {
            phrase: "This is truly just the beginning.",
            meaning: "이건 정말 시작에 불과해요",
            nuance: "'truly just the beginning' = 'I'm just getting started'보다 더 강조된 포부 표현.",
          },
          {
            phrase: "I cannot wait to show you what's next.",
            meaning: "다음에 뭘 보여줄지 너무 기대돼요",
            nuance: "'I cannot wait to ~' = 너무 하고 싶어서 기다릴 수가 없다. 강한 기대감과 설렘을 표현.",
          },
          {
            phrase: "Don't forget to subscribe!",
            meaning: "구독 잊지 마세요!",
            nuance: "유튜버의 가장 대표적인 CTA 마무리 표현. 'hit that subscribe button'과 함께 필수 구문.",
          },
        ],
      },
    ],
  },
];

// ─── Demo Channel Info ────────────────────────────────────

export const DEMO_CHANNEL_INFO: ChannelInfo = {
  channelName: "JY의 영어 브이로그",
  subscriberCount: 12400,
  badge: "silver",
  episodes: [...demoEpisodes].reverse(), // 최신순
  streakDays: 34,
  totalTalkTimeMinutes: 210,
  lastLessonDate: "2026-03-20",
  subscriberHistory: [10800, 11100, 11350, 11600, 11850, 12100, 12400],
};

// ─── Demo User Profile ────────────────────────────────────

export const DEMO_USER_PROFILE: UserProfile = {
  name: "JY",
  channelHandle: "@jy_english_vlog",
  gender: "prefer_not_to_say",
  job: "Designer",
  location: "Seoul",
  hobbies: ["travel"],
  englishLevel: "Intermediate",
  avatarIconName: "videocam",
};

// ─── Demo Lesson Schedule ─────────────────────────────────

export const DEMO_LESSON_SCHEDULE: LessonSchedule = {
  days: ["Mon", "Wed", "Fri"],
  timeSlots: ["07:30"],
};
