// lib/realtime.ts
//
// OpenAI Realtime API WebSocket 세션 관리
// - 오디오 포맷: PCM16, 24kHz, mono
// - turn_detection: server_vad (자동 발화 감지)
// - 음성: shimmer (따뜻한 여성 목소리)

export type EmmaEvent =
  | { type: "session_ready" }
  | { type: "audio_delta"; delta: string }        // base64 PCM16
  | { type: "audio_done" }
  | { type: "transcript"; text: string }          // Emma 발화 텍스트
  | { type: "input_transcript"; text: string }    // 유저 발화 텍스트 (STT)
  | { type: "error"; message: string };

type EmmaEventHandler = (event: EmmaEvent) => void;

export class EmmaSession {
  private ws: WebSocket | null = null;
  private handler: EmmaEventHandler | null = null;
  private audioDeltaBuffer: string[] = [];

  // ─── 연결 ────────────────────────────────────────────
  connect(apiKey: string, systemPrompt: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // React Native WebSocket은 3번째 인자로 headers 지원
      const WS = WebSocket as any;
      this.ws = new WS(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview",
        [],
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "OpenAI-Beta": "realtime=v1",
          },
        }
      );

      const ws = this.ws!;
      ws.onopen = () => {
        this._sendEvent({
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            voice: "shimmer",
            instructions: systemPrompt,
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: { model: "whisper-1" },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 700,
            },
          },
        });
        resolve();
      };

      ws.onerror = () => reject(new Error("WebSocket 연결 실패"));
      ws.onclose = () => {};
      ws.onmessage = (e) => this._handleMessage(e.data);
    });
  }

  // ─── 이벤트 핸들러 등록 ───────────────────────────────
  onEvent(handler: EmmaEventHandler) {
    this.handler = handler;
  }

  // ─── Emma 첫 인사 트리거 ─────────────────────────────
  triggerGreeting() {
    this._sendEvent({ type: "response.create" });
  }

  // ─── 유저 오디오 전송 (base64 PCM16, WAV 헤더 없음) ─
  sendAudio(base64PCM16: string) {
    this._sendEvent({
      type: "input_audio_buffer.append",
      audio: base64PCM16,
    });
  }

  // ─── 오디오 버퍼 확정 (VAD off일 때 수동 사용) ───────
  commitAudio() {
    this._sendEvent({ type: "input_audio_buffer.commit" });
    this._sendEvent({ type: "response.create" });
  }

  // ─── 연결 종료 ───────────────────────────────────────
  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.handler = null;
    this.audioDeltaBuffer = [];
  }

  // ─── 내부 메시지 처리 ─────────────────────────────────
  private _handleMessage(raw: string) {
    let msg: any;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    switch (msg.type) {
      case "session.updated":
        this.handler?.({ type: "session_ready" });
        break;

      case "response.audio.delta":
        this.audioDeltaBuffer.push(msg.delta);
        this.handler?.({ type: "audio_delta", delta: msg.delta });
        break;

      case "response.audio.done":
        this.handler?.({ type: "audio_done" });
        this.audioDeltaBuffer = [];
        break;

      case "response.audio_transcript.delta":
        // 실시간 텍스트는 무시 (done 이벤트만 사용)
        break;

      case "response.audio_transcript.done":
        this.handler?.({ type: "transcript", text: msg.transcript ?? "" });
        break;

      case "conversation.item.input_audio_transcription.completed":
        this.handler?.({ type: "input_transcript", text: msg.transcript ?? "" });
        break;

      case "error":
        this.handler?.({ type: "error", message: msg.error?.message ?? "알 수 없는 오류" });
        break;
    }
  }

  private _sendEvent(event: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }
}

// ─── WAV 헤더 생성 (PCM16, 24kHz, mono) ─────────────────
export function buildWavHeader(dataByteLength: number): Uint8Array {
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  const sampleRate = 24000;
  const channels = 1;
  const bitDepth = 16;
  const byteRate = (sampleRate * channels * bitDepth) / 8;
  const blockAlign = (channels * bitDepth) / 8;

  // RIFF
  v.setUint8(0, 0x52); v.setUint8(1, 0x49); v.setUint8(2, 0x46); v.setUint8(3, 0x46);
  v.setUint32(4, 36 + dataByteLength, true);
  v.setUint8(8, 0x57); v.setUint8(9, 0x41); v.setUint8(10, 0x56); v.setUint8(11, 0x45);
  // fmt
  v.setUint8(12, 0x66); v.setUint8(13, 0x6d); v.setUint8(14, 0x74); v.setUint8(15, 0x20);
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);       // PCM
  v.setUint16(22, channels, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, byteRate, true);
  v.setUint16(32, blockAlign, true);
  v.setUint16(34, bitDepth, true);
  // data
  v.setUint8(36, 0x64); v.setUint8(37, 0x61); v.setUint8(38, 0x74); v.setUint8(39, 0x61);
  v.setUint32(40, dataByteLength, true);

  return new Uint8Array(header);
}

// ─── base64 PCM16 → WAV base64 변환 ─────────────────────
// 각 delta를 개별 디코딩 후 binary 레벨에서 합산 (base64 문자열 직접 join 시 padding 오류)
export function pcm16DeltasToWavBase64(deltas: string[]): string {
  let pcmBinary = "";
  for (const delta of deltas) {
    pcmBinary += atob(delta);
  }
  const pcmBytes = new Uint8Array(pcmBinary.length);
  for (let i = 0; i < pcmBinary.length; i++) {
    pcmBytes[i] = pcmBinary.charCodeAt(i);
  }

  const header = buildWavHeader(pcmBytes.length);
  const wav = new Uint8Array(header.length + pcmBytes.length);
  wav.set(header, 0);
  wav.set(pcmBytes, header.length);

  let binary = "";
  for (let i = 0; i < wav.length; i++) {
    binary += String.fromCharCode(wav[i]);
  }
  return btoa(binary);
}

// ─── WAV 파일 base64 → PCM16 base64 (헤더 44바이트 제거) ─
export function wavBase64ToPcm16Base64(wavBase64: string): string {
  const binary = atob(wavBase64);
  const pcmBinary = binary.slice(44); // WAV 헤더 제거
  return btoa(pcmBinary);
}

// ─── Emma 시스템 프롬프트 생성 ───────────────────────────
export function buildEmmaPrompt(params: {
  userName: string;
  script: string;
  expressions: string[];
  englishLevel: string;
}): string {
  return `You are Emma, a warm and encouraging English speaking coach for Korean learners.

You are calling ${params.userName} for their scheduled English vlog lesson. Your goal is to help them practice speaking naturally using today's vlog script.

Today's script topic and content:
"${params.script}"

Key expressions to practice: ${params.expressions.join(", ")}

Student's English level: ${params.englishLevel}

Instructions:
- Speak naturally and at an appropriate pace for their level
- Start by greeting ${params.userName} and briefly introducing today's lesson topic
- Ask them to read the script aloud and gently correct pronunciation or grammar if needed
- Help them use the 5 key expressions naturally in conversation
- Be encouraging, specific in feedback, and keep energy upbeat
- Keep responses concise (2-3 sentences max) to maintain conversation flow
- After they've practiced the script, have a short natural conversation about the topic
- The total call should feel like 5-10 minutes

Begin by greeting ${params.userName} warmly and introducing today's lesson.`;
}
