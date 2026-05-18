'use client';

import { useState } from 'react';

import styles from './page.module.css';

import ProtectedRoute from '@/app/components/ProtectedRoute.jsx';
import AppNavbar from '@/app/components/Navbar.jsx';
import PageHeader from '@/app/components/PageHeader.jsx';

const suggestions = [
  'Who came today?',
  'Who was absent today?',
  'Show weekly attendance',
  'show monthly attendance',
  'Show all employees',
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text:
        'Hello 👋 I am your AI Attendance Assistant. Ask me anything about attendance records.',
    },
  ]);

  const [input, setInput] = useState('');

  const handleSend = async () => {
  if (!input.trim()) return;

  const userMessage = {
    role: 'user',
    text: input,
  };

  setMessages((prev) => [
    ...prev,
    userMessage,
  ]);

  const currentInput = input;

  setInput('');

  try {
    const res = await fetch(
      'http://localhost:5000/api/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          query: currentInput,
        }),
      }
    );

    const data = await res.json();

    const botMessage = {
      role: 'bot',
      text:
        data?.data?.answer ||
        'No response received.',
      records:
        data?.data?.records || [],
      intent:
        data?.data?.intent || '',
    };

    setMessages((prev) => [
      ...prev,
      botMessage,
    ]);
  } catch (err) {
    setMessages((prev) => [
      ...prev,
      {
        role: 'bot',
        text:
          'Failed to connect to backend.',
      },
    ]);
  }
};
  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <AppNavbar />

        <main className={styles.main}>
          <PageHeader
            title="AI Attendance Assistant"
            subtitle="Ask questions about attendance records and employees"
          />

          <div className={styles.chatContainer}>
            <div className={styles.messages}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`${styles.messageRow} ${
                    msg.role === 'user'
                      ? styles.userRow
                      : styles.botRow
                  }`}
                >
                  <div
                    className={`${styles.messageBubble} ${
                      msg.role === 'user'
                        ? styles.userBubble
                        : styles.botBubble
                    }`}
                  >
                    <>
  <p className={styles.messageText}>
    {msg.text}
  </p>

  {msg.records &&
    msg.records.length > 0 && (
      <div className={styles.records}>
        {msg.records.map(
          (record, index) => (
            <div
              key={index}
              className={styles.recordCard}
            >
              <div
                className={styles.recordTop}
              >
                <span
                  className={
                    styles.recordName
                  }
                >
                  {record.name}
                </span>

                <span
                  className={
                    styles.recordId
                  }
                >
                  ID {record.user_id}
                </span>
              </div>

              {record.date && (
                <div
                  className={
                    styles.recordMeta
                  }
                >
                  📅 {record.date}
                </div>
              )}

              {record.time && (
                <div
                  className={
                    styles.recordMeta
                  }
                >
                  ⏰ {record.time}
                </div>
              )}
            </div>
          )
        )}
      </div>
    )}
</>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.suggestions}>
              {suggestions.map((item) => (
                <button
                  key={item}
                  className={styles.suggestionBtn}
                  onClick={() => setInput(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className={styles.inputSection}>
              <textarea
                className={styles.input}
                placeholder="Ask something..."
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                rows={2}
              />

              <button
                className={styles.sendBtn}
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

