import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./ChatBot.css";

interface Msg {
  role: "user" | "model";
  text: string;
}

const GREETING: Msg = {
  role: "model",
  text: "Hai, aku Dimdim 👋 Tanya apa aja soal Dimas, mulai dari skill, proyek, sertifikat, sampai cara menghubunginya.",
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250);
  }, [open]);

  async function invokeChat(payload: {
    message: string;
    history: { role: string; text: string }[];
  }) {
    return supabase.functions.invoke("chat-assistant", { body: payload });
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const history = messages
      .filter((m) => m !== GREETING)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    const payload = { message: trimmed, history };

    try {
      let { data, error } = await invokeChat(payload);
      if (error) {
        await new Promise((r) => setTimeout(r, 800));
        ({ data, error } = await invokeChat(payload));
        if (error) throw error;
      }
      setMessages((m) => [
        ...m,
        {
          role: "model",
          text: data?.reply || "Maaf, aku belum bisa jawab sekarang.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "model",
          text: "Lagi ada gangguan koneksi nih, coba lagi sebentar ya.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        className={`chatbot__fab ${open ? "chatbot__fab--open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Tutup chat" : "Chat dengan Dimdim"}
      >
        <i className={`bi ${open ? "bi-x-lg" : "bi-chat-dots-fill"}`} />
        {!open && <span className="chatbot__fab-pulse" aria-hidden="true" />}
      </button>

      <div
        className={`chatbot__panel ${open ? "chatbot__panel--open" : ""}`}
        role="dialog"
        aria-label="Chat dengan Dimdim"
      >
        <div className="chatbot__header">
          <div className="chatbot__header-info">
            <span className="chatbot__avatar">
              <i className="bi bi-robot" />
            </span>
            <div>
              <p className="chatbot__title">Dimdim</p>
              <p className="chatbot__subtitle">
                <span className="chatbot__dot" /> Asisten portofolio
              </p>
            </div>
          </div>
        </div>

        <div className="chatbot__messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chatbot__bubble chatbot__bubble--${m.role}`}
            >
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="chatbot__bubble chatbot__bubble--model chatbot__typing">
              <span />
              <span />
              <span />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="chatbot__input-row"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya soal Dimas..."
            disabled={loading}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Kirim pesan"
          >
            <i className="bi bi-send-fill" />
          </button>
        </form>
      </div>
    </>
  );
}
