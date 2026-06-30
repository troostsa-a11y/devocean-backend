import OpenAI, { toFile } from "openai";
import { Buffer } from "node:buffer";
import { spawn } from "child_process";
import { writeFile, unlink, readFile } from "fs/promises";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { join } from "path";

if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
  throw new Error(
    "AI_INTEGRATIONS_OPENAI_BASE_URL must be set. Did you forget to provision the OpenAI AI integration?",
  );
}

if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
  throw new Error(
    "AI_INTEGRATIONS_OPENAI_API_KEY must be set. Did you forget to provision the OpenAI AI integration?",
  );
}

export const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

/**
 * Audio model for voice-chat and TTS.
 * Defaults to gpt-4o-audio-preview (standard OpenAI).
 * Override with OPENAI_AUDIO_MODEL env var to use a different model
 * (e.g. set to "gpt-audio" when routing through the Replit AI proxy).
 */
const AUDIO_MODEL = process.env.OPENAI_AUDIO_MODEL ?? "gpt-4o-audio-preview";

export type AudioFormat = "wav" | "mp3" | "webm" | "mp4" | "ogg" | "unknown";

/**
 * Detect audio format from buffer magic bytes.
 * Supports: WAV, MP3, WebM (Chrome/Firefox), MP4/M4A/MOV (Safari/iOS), OGG
 */
export function detectAudioFormat(buffer: Buffer): AudioFormat {
  if (buffer.length < 12) return "unknown";

  // WAV: RIFF....WAVE
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    return "wav";
  }
  // WebM: EBML header
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return "webm";
  }
  // MP3: ID3 tag or frame sync
  if (
    (buffer[0] === 0xff && (buffer[1] === 0xfb || buffer[1] === 0xfa || buffer[1] === 0xf3)) ||
    (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33)
  ) {
    return "mp3";
  }
  // MP4/M4A/MOV: ....ftyp (Safari/iOS records in these containers)
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return "mp4";
  }
  // OGG: OggS
  if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
    return "ogg";
  }
  return "unknown";
}

/**
 * Convert any audio/video format to WAV using ffmpeg.
 */
export async function convertToWav(audioBuffer: Buffer): Promise<Buffer> {
  const inputPath = join(tmpdir(), `input-${randomUUID()}`);
  const outputPath = join(tmpdir(), `output-${randomUUID()}.wav`);

  try {
    await writeFile(inputPath, audioBuffer);

    await new Promise<void>((resolve, reject) => {
      const ffmpeg = spawn("ffmpeg", [
        "-i", inputPath,
        "-vn",
        "-f", "wav",
        "-ar", "16000",
        "-ac", "1",
        "-acodec", "pcm_s16le",
        "-y",
        outputPath,
      ]);

      ffmpeg.stderr.on("data", () => {});
      ffmpeg.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`ffmpeg exited with code ${code}`));
      });
      ffmpeg.on("error", reject);
    });

    return await readFile(outputPath);
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}

/**
 * Auto-detect and convert audio to OpenAI-compatible format.
 */
/**
 * The only audio formats OpenAI's chat completions `input_audio` API accepts.
 * Containers like webm/ogg/mp4 are rejected with a 400, so they must be
 * transcoded (ideally to WAV in the browser) before reaching this layer.
 */
export type OpenAIAudioInputFormat = "wav" | "mp3";

/** Thrown when audio cannot be made OpenAI-compatible (e.g. no ffmpeg in prod). */
export class UnsupportedAudioFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedAudioFormatError";
  }
}

/**
 * Returns the audio buffer in a format OpenAI accepts (`wav` or `mp3`).
 * wav/mp3 pass through untouched. Any other container (webm/ogg/mp4) must be
 * transcoded to WAV via ffmpeg; if ffmpeg is unavailable (e.g. production), this
 * throws an UnsupportedAudioFormatError so the caller can return a clean 400
 * instead of forwarding an invalid format to OpenAI.
 */
export async function ensureCompatibleFormat(
  audioBuffer: Buffer
): Promise<{ buffer: Buffer; format: OpenAIAudioInputFormat }> {
  const detected = detectAudioFormat(audioBuffer);
  if (detected === "wav") return { buffer: audioBuffer, format: "wav" };
  if (detected === "mp3") return { buffer: audioBuffer, format: "mp3" };

  // Anything else (webm/ogg/mp4/unknown) must be transcoded to WAV.
  try {
    const wavBuffer = await convertToWav(audioBuffer);
    return { buffer: wavBuffer, format: "wav" };
  } catch (err) {
    throw new UnsupportedAudioFormatError(
      `Audio format '${detected}' is not supported by OpenAI and could not be converted to WAV. ` +
        `Send WAV or MP3 (the web widget converts in-browser). Cause: ${
          err instanceof Error ? err.message : String(err)
        }`
    );
  }
}

/** Voice Chat: audio-in, audio-out using gpt-audio. */
export async function voiceChat(
  audioBuffer: Buffer,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy",
  inputFormat: OpenAIAudioInputFormat = "wav",
  outputFormat: "wav" | "mp3" = "mp3"
): Promise<{ transcript: string; audioResponse: Buffer }> {
  const audioBase64 = audioBuffer.toString("base64");
  const response = await openai.chat.completions.create({
    model: AUDIO_MODEL,
    modalities: ["text", "audio"],
    audio: { voice, format: outputFormat },
    messages: [{
      role: "user",
      content: [
        { type: "input_audio", input_audio: { data: audioBase64, format: inputFormat } },
      ] as any,
    }],
  });
  const message = response.choices[0]?.message as any;
  const transcript = message?.audio?.transcript || message?.content || "";
  const audioData = message?.audio?.data ?? "";
  return {
    transcript,
    audioResponse: Buffer.from(audioData, "base64"),
  };
}

/** Streaming Voice Chat for real-time audio responses. */
export async function voiceChatStream(
  audioBuffer: Buffer,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy",
  inputFormat: OpenAIAudioInputFormat = "wav",
  systemPrompt?: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<AsyncIterable<{ type: "transcript" | "audio"; data: string }>> {
  const audioBase64 = audioBuffer.toString("base64");

  const messages: any[] = [];
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  for (const m of history) {
    messages.push({ role: m.role, content: m.content });
  }
  messages.push({
    role: "user",
    content: [
      { type: "input_audio", input_audio: { data: audioBase64, format: inputFormat } },
    ],
  });

  const stream = await openai.chat.completions.create({
    model: AUDIO_MODEL,
    modalities: ["text", "audio"],
    audio: { voice, format: "pcm16" },
    messages: messages as any,
    stream: true,
  });

  return (async function* () {
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta as any;
      if (!delta) continue;
      if (delta?.audio?.transcript) {
        yield { type: "transcript", data: delta.audio.transcript };
      }
      if (delta?.audio?.data) {
        yield { type: "audio", data: delta.audio.data };
      }
    }
  })();
}

/**
 * Streaming Voice Chat with tool/function calling support.
 *
 * Runs the gpt-audio chat loop: if the model emits tool calls, `executeTool` is
 * invoked for each, the results are appended, and the model is called again until
 * it produces a final spoken answer. Yields the same transcript/audio events as
 * `voiceChatStream`. The first request is created eagerly so that, if gpt-audio
 * rejects the `tools` parameter, the caller can catch the error and fall back to
 * the plain (no-tools) `voiceChatStream`.
 */
export async function voiceChatStreamWithTools(
  audioBuffer: Buffer,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
  inputFormat: OpenAIAudioInputFormat,
  systemPrompt: string | undefined,
  history: { role: "user" | "assistant"; content: string }[],
  tools: any[],
  executeTool: (name: string, argsJson: string) => Promise<string>,
): Promise<AsyncIterable<{ type: "transcript" | "audio"; data: string }>> {
  const audioBase64 = audioBuffer.toString("base64");

  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  for (const m of history) messages.push({ role: m.role, content: m.content });
  messages.push({
    role: "user",
    content: [
      { type: "input_audio", input_audio: { data: audioBase64, format: inputFormat } },
    ],
  });

  const createStream = () =>
    openai.chat.completions.create({
      model: AUDIO_MODEL,
      modalities: ["text", "audio"],
      audio: { voice, format: "pcm16" },
      messages: messages as any,
      tools: tools as any,
      stream: true,
    });

  // Eager first request: surfaces "tools not supported" errors to the caller.
  let stream = await createStream();

  return (async function* () {
    let guard = 0;
    while (true) {
      guard++;
      const toolCalls: Record<number, { id: string; name: string; args: string }> = {};
      let assistantTranscript = "";

      for await (const chunk of stream) {
        const choice = chunk.choices?.[0];
        const delta = choice?.delta as any;
        if (!delta) continue;
        if (delta?.audio?.transcript) {
          assistantTranscript += delta.audio.transcript;
          yield { type: "transcript" as const, data: delta.audio.transcript };
        }
        if (delta?.audio?.data) {
          yield { type: "audio" as const, data: delta.audio.data };
        }
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const i = tc.index ?? 0;
            toolCalls[i] ??= { id: "", name: "", args: "" };
            if (tc.id) toolCalls[i].id = tc.id;
            if (tc.function?.name) toolCalls[i].name += tc.function.name;
            if (tc.function?.arguments) toolCalls[i].args += tc.function.arguments;
          }
        }
      }

      const calls = Object.values(toolCalls);
      if (calls.length === 0 || guard > 3) break;

      messages.push({
        role: "assistant",
        content: assistantTranscript || null,
        tool_calls: calls.map((c) => ({
          id: c.id,
          type: "function",
          function: { name: c.name, arguments: c.args },
        })),
      });
      for (const c of calls) {
        const result = await executeTool(c.name, c.args);
        messages.push({ role: "tool", tool_call_id: c.id, content: result });
      }

      stream = await createStream();
    }
  })();
}

/** Text-to-Speech using gpt-audio. */
export async function textToSpeech(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy",
  format: "wav" | "mp3" | "flac" | "opus" | "pcm16" = "wav"
): Promise<Buffer> {
  const response = await openai.chat.completions.create({
    model: AUDIO_MODEL,
    modalities: ["text", "audio"],
    audio: { voice, format },
    messages: [
      { role: "system", content: "You are an assistant that performs text-to-speech." },
      { role: "user", content: `Repeat the following text verbatim: ${text}` },
    ],
  });
  const audioData = (response.choices[0]?.message as any)?.audio?.data ?? "";
  return Buffer.from(audioData, "base64");
}

/** Streaming Text-to-Speech. */
export async function textToSpeechStream(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "alloy"
): Promise<AsyncIterable<string>> {
  const stream = await openai.chat.completions.create({
    model: AUDIO_MODEL,
    modalities: ["text", "audio"],
    audio: { voice, format: "pcm16" },
    messages: [
      { role: "system", content: "You are an assistant that performs text-to-speech." },
      { role: "user", content: `Repeat the following text verbatim: ${text}` },
    ],
    stream: true,
  });

  return (async function* () {
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta as any;
      if (!delta) continue;
      if (delta?.audio?.data) {
        yield delta.audio.data;
      }
    }
  })();
}

/** Speech-to-Text using gpt-4o-mini-transcribe. */
export async function speechToText(
  audioBuffer: Buffer,
  format: "wav" | "mp3" | "webm" = "wav"
): Promise<string> {
  const file = await toFile(audioBuffer, `audio.${format}`);
  const response = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe",
  });
  return response.text;
}

/** Streaming Speech-to-Text. */
export async function speechToTextStream(
  audioBuffer: Buffer,
  format: "wav" | "mp3" | "webm" = "wav"
): Promise<AsyncIterable<string>> {
  const file = await toFile(audioBuffer, `audio.${format}`);
  const stream = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe",
    stream: true,
  });

  return (async function* () {
    for await (const event of stream) {
      if (event.type === "transcript.text.delta") {
        yield event.delta;
      }
    }
  })();
}
