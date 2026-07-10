import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const FONT =
  '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface ChatStrings { greeting: string; subtitle: string; placeholder: string; }

const CHAT_STRINGS: Record<string, ChatStrings> = {
  en: { greeting: "Hi! I'm Marin, DEVOCEAN Lodge's online receptionist. How can I help you today?",          subtitle: "Online receptionist",           placeholder: "Type a message…" },
  nl: { greeting: "Hallo! Ik ben Marin, de online receptioniste van DEVOCEAN Lodge. Hoe kan ik u helpen?",  subtitle: "Online receptionist",           placeholder: "Stuur een bericht…" },
  de: { greeting: "Hallo! Ich bin Marin, die Online-Rezeptionistin von DEVOCEAN Lodge. Wie kann ich Ihnen helfen?", subtitle: "Online-Rezeptionistin", placeholder: "Nachricht eingeben…" },
  fr: { greeting: "Bonjour! Je suis Marin, réceptionniste en ligne de DEVOCEAN Lodge. Comment puis-je vous aider?", subtitle: "Réceptionniste en ligne", placeholder: "Tapez un message…" },
  pt: { greeting: "Olá! Sou Marin, a recepcionista online do DEVOCEAN Lodge. Como posso ajudá-lo?",          subtitle: "Recepcionista online",          placeholder: "Escreva uma mensagem…" },
  es: { greeting: "¡Hola! Soy Marin, la recepcionista online de DEVOCEAN Lodge. ¿En qué puedo ayudarle?",   subtitle: "Recepcionista online",          placeholder: "Escribe un mensaje…" },
  it: { greeting: "Ciao! Sono Marin, la receptionist online di DEVOCEAN Lodge. Come posso aiutarla?",        subtitle: "Receptionist online",           placeholder: "Scrivi un messaggio…" },
  sv: { greeting: "Hej! Jag är Marin, DEVOCEAN Lodges onlinereceptionist. Hur kan jag hjälpa dig?",         subtitle: "Onlinereceptionist",            placeholder: "Skriv ett meddelande…" },
  pl: { greeting: "Cześć! Jestem Marin, recepcjonistką online DEVOCEAN Lodge. Jak mogę Ci pomóc?",           subtitle: "Recepcjonista online",          placeholder: "Napisz wiadomość…" },
  ro: { greeting: "Bună! Sunt Marin, recepționista online a DEVOCEAN Lodge. Cum vă pot ajuta?",              subtitle: "Recepționist online",           placeholder: "Scrieți un mesaj…" },
  cs: { greeting: "Dobrý den! Jsem Marin, online recepční DEVOCEAN Lodge. Jak vám mohu pomoci?",             subtitle: "Online recepční",               placeholder: "Napište zprávu…" },
  tr: { greeting: "Merhaba! Ben Marin, DEVOCEAN Lodge'un çevrimiçi resepsiyonistiyim. Size nasıl yardımcı olabilirim?", subtitle: "Çevrimiçi resepsiyonist", placeholder: "Bir mesaj yazın…" },
  ru: { greeting: "Привет! Я Марин, онлайн-администратор DEVOCEAN Lodge. Чем могу помочь?",                 subtitle: "Онлайн-администратор",          placeholder: "Введите сообщение…" },
  ja: { greeting: "こんにちは！私はマリン、DEVOCEANロッジのオンラインレセプショニストです。何かお手伝いできますか？",        subtitle: "オンライン受付",               placeholder: "メッセージを入力…" },
  zh: { greeting: "您好！我是Marin，DEVOCEAN Lodge的在线前台。有什么可以帮您的吗？",                             subtitle: "在线前台",                      placeholder: "输入消息…" },
  af: { greeting: "Hallo! Ek is Marin, die aanlyn ontvangsdame van DEVOCEAN Lodge. Hoe kan ek u help?",     subtitle: "Aanlyn ontvangsdame",           placeholder: "Tik 'n boodskap…" },
  sr: { greeting: "Zdravo! Ja sam Marin, online recepcionarka DEVOCEAN Lodge-a. Kako mogu da vam pomognem?", subtitle: "Online recepcionarka",          placeholder: "Napišite poruku…" },
  hr: { greeting: "Zdravo! Ja sam Marin, online recepcionar DEVOCEAN Lodge-a. Kako vam mogu pomoći?",        subtitle: "Online recepcionar",            placeholder: "Napišite poruku…" },
  zu: { greeting: "Sawubona! Mina ngingu Marin, umamukeli we-inthanethi we-DEVOCEAN Lodge. Ngingakusiza kanjani?", subtitle: "Umamukeli we-inthanethi", placeholder: "Bhala umlayezo…" },
  sw: { greeting: "Habari! Mimi ni Marin, mtumishi wa mapokezi wa mtandaoni wa DEVOCEAN Lodge. Ninaweza kukusaidia vipi?", subtitle: "Mtumishi wa mapokezi", placeholder: "Andika ujumbe…" },
};

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-0.5">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

export default function TextChatEmbed() {
  const lang = new URLSearchParams(window.location.search).get("lang") ?? "en";
  const c = CHAT_STRINGS[lang] ?? CHAT_STRINGS.en;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const ensureConversation = useCallback(async (): Promise<number> => {
    if (conversationId) return conversationId;
    const res = await fetch("/api/openai/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Text Chat" }),
    });
    if (!res.ok) throw new Error("Failed to create conversation");
    const data = await res.json();
    setConversationId(data.id);
    return data.id;
  }, [conversationId]);

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content || loading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setMessages((prev) => [...prev, { role: "user", content }]);
    setLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const convId = await ensureConversation();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", streaming: true },
      ]);

      const res = await fetch(
        `/api/openai/conversations/${convId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, lang }),
          signal: controller.signal,
        },
      );

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.content) {
              assistantText += payload.content;
              setMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.streaming)
                  next[next.length - 1] = { ...last, content: assistantText };
                return next;
              });
            }
          } catch {
          }
        }
      }

      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.streaming)
          next[next.length - 1] = {
            role: "assistant",
            content: last.content,
          };
        return next;
      });
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") return;
      setMessages((prev) => {
        const next = prev.filter((m) => !m.streaming);
        return [
          ...next,
          {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          },
        ];
      });
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, loading, ensureConversation, lang]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{ fontFamily: FONT }}
      className="flex flex-col h-screen bg-background overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-card shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0 select-none">
          M
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-none">
            Marin
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            DEVOCEAN Lodge · {c.subtitle}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {/* Static opening greeting */}
        <div className="flex gap-2 items-end">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0 select-none">
            M
          </div>
          <div className="max-w-[82%] bg-card border rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-foreground leading-snug">
            {c.greeting}
          </div>
        </div>

        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[82%] bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-3 py-2 text-sm leading-snug whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-2 items-end">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0 select-none">
                M
              </div>
              <div className="max-w-[82%] bg-card border rounded-2xl rounded-bl-sm px-3 py-2 text-sm text-foreground leading-snug whitespace-pre-wrap">
                {msg.content ? msg.content : msg.streaming ? <TypingDots /> : null}
              </div>
            </div>
          ),
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 py-3 border-t bg-card">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autoResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder={c.placeholder}
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 overflow-y-auto"
            style={{ lineHeight: "1.5", minHeight: "38px", maxHeight: "120px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center disabled:opacity-35 shrink-0 transition-opacity hover:opacity-90 active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-primary-foreground" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-1.5 select-none">
          Powered by DEVOCEAN AI
        </p>
      </div>
    </div>
  );
}
