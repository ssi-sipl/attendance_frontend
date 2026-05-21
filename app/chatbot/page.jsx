"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import ProtectedRoute from "@/app/components/ProtectedRoute.jsx";
import AppNavbar from "@/app/components/Navbar.jsx";

const suggestions = [
  "Who came today?",
  "Who was absent today?",
  "Show weekly attendance",
  "Show monthly attendance",
  "Show all employees",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello 👋 I am your AI Attendance Assistant. Ask me anything.",
    },
  ]);

  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef(null);
  const suggestionsRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (e) => {
    const el = e.target;
    setInput(el.value);
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((p) => [...p, userMessage]);
    const query = input;
    setInput("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        }
      );

      const data = await res.json();

      const botMessage = {
        role: "bot",
        text: data?.message || "No response received.",
        records: data?.data?.records || [],
      };

      setMessages((p) => [...p, botMessage]);
    } catch {
      setMessages((p) => [...p, { role: "bot", text: "Failed to connect." }]);
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <AppNavbar title="AI Attendance Assistant" />

        <main className={styles.container}>
          <section className={styles.chatArea}>

            {/* ── messages ── */}
            <div className={styles.messages}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`${styles.messageRow} ${
                    m.role === "user" ? styles.userRow : styles.botRow
                  }`}
                >
                  <div
                    className={`${styles.messageBubble} ${
                      m.role === "user" ? styles.userBubble : styles.botBubble
                    }`}
                  >
                    <div className={styles.messageText}>{m.text}</div>

                    {m.records && m.records.length > 0 && (
                      <div className={styles.records}>
                        {m.records.map((r, idx) => (
                          <div key={idx} className={styles.recordCard}>
                            <div className={styles.recordTop}>
                              <div className={styles.recordField}>
                                <span className={styles.recordLabel}>Name</span>
                                <span className={styles.recordValue}>{r.name ?? "—"}</span>
                              </div>
                              {r.user_id && (
                                <div className={styles.recordField}>
                                  <span className={styles.recordLabel}>ID</span>
                                  <span className={styles.recordValue}>{r.user_id}</span>
                                </div>
                              )}
                              {r.status && (
                                <div className={styles.recordField}>
                                  <span className={styles.recordLabel}>Status</span>
                                  <span
                                    className={`${styles.recordValue} ${
                                      r.status === "Absent"
                                        ? styles.statusAbsent
                                        : styles.statusPresent
                                    }`}
                                  >
                                    {r.status}
                                  </span>
                                </div>
                              )}
                            </div>

                            {r.date && (
                              <div className={styles.recordMeta}>📅 {r.date}</div>
                            )}
                            {r.entry_time && (
                              <div className={styles.recordMeta}>🟢 In: {r.entry_time}</div>
                            )}
                            {r.exit_time && (
                              <div className={styles.recordMeta}>🔴 Out: {r.exit_time}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* ── floating input box ── */}
            <div className={styles.inputBox}>
              <textarea
                ref={textareaRef}
                className={styles.input}
                placeholder="Ask something..."
                value={input}
                onChange={handleInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
              />

              <div className={styles.bottomRow}>
                {/* Suggestions dropdown */}
                <div className={styles.suggestionsWrapper} ref={suggestionsRef}>
                  <button
                    className={`${styles.suggestionsBtn} ${showSuggestions ? styles.suggestionsBtnOpen : ""}`}
                    onClick={() => setShowSuggestions((p) => !p)}
                  >
                    <span>Suggestions</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>

                  {showSuggestions && (
                    <div className={styles.dropdown}>
                      {suggestions.map((s) => (
                        <button
                          key={s}
                          className={styles.dropdownItem}
                          onClick={() => {
                            setInput(s);
                            setShowSuggestions(false);
                            if (textareaRef.current) {
                              textareaRef.current.style.height = "auto";
                              textareaRef.current.style.height =
                                Math.min(textareaRef.current.scrollHeight, 180) + "px";
                            }
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send button */}
                <button
                  className={styles.sendBtn}
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 13V3M3 8l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}