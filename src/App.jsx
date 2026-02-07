import { useState, useEffect, useRef } from "react";

const NOVELS = [
  { id: 1, title: "The Mezzanine Hour", status: "reading", chapter: 3, totalChapters: 5, chatAvailable: true },
  { id: 2, title: "Salt & Ceremony", status: "complete", chapter: 5, totalChapters: 5, chatAvailable: false },
  { id: 3, title: "Exit Velocity", status: "dissolved", chapter: 4, totalChapters: 5, chatAvailable: false },
  { id: 4, title: "The Lesser Dark", status: "unread", chapter: 0, totalChapters: 5, chatAvailable: false },
];

const CHAPTER_TEXT = [
  "The restaurant was on the second floor of a building that had no business being beautiful, but was. Something about the proportions of the windows, maybe. Or the ironwork on the balcony that no one ever stood on.",
  "Laura arrived twelve minutes early, which was a mistake she'd made before and would make again. She chose a table near the window, not the one directly by it — that would have been too deliberate, too staged — but the one behind it, where the light still reached but didn't perform.",
  "The waiter brought water without being asked. She liked that. She took a sip and set the glass down on a different spot than where he'd placed it, then moved it back, annoyed at herself for noticing.",
  "Her phone buzzed. Adrian.",
  { text: "Running 5 min late. Order me whatever you're having.", italic: true },
  "She read it twice. The first time for content, the second time for tone. It was fine. It was perfectly fine. The kind of message anyone sends. She put the phone face-down on the table and picked up the menu.",
  "The risotto was twenty-eight euros. She'd order it for herself and something else for him, because ordering the same thing for two people was a minor act of aggression she wasn't ready to explain.",
  "The window caught the last of the afternoon. Across the street, a woman was closing a florist's shop, pulling buckets of flowers inside one by one. Peonies first. Then something yellow Laura couldn't name. The woman worked without rushing, which made Laura want to watch her, the way you want to watch anyone who seems to have settled into the exact right speed for their life.",
  "Adrian would be here in four minutes, if he meant what he said. She opened the menu again. The risotto was still twenty-eight euros.",
  "She thought about the last time they'd been in a place like this — not this restaurant, but this kind of restaurant, with this kind of light, at this hour. It had been in October. He'd told her about his sister's divorce over a plate of something she couldn't remember, and she'd said the right things but had spent the entire time thinking about the way his hand moved when he talked, the way it conducted sentences she was barely hearing.",
  "That had been a good night. She wasn't sure why she was thinking about it now, except that the light was similar and the menu was overpriced and she was twelve minutes early again, which meant she had time to think, which was rarely a gift.",
  "The florist across the street had finished with the flowers. The lights went off inside the shop. Laura watched the woman lock the door, test the handle once, and walk away without looking back.",
  "She picked up her water glass. Set it down. Picked up the menu.",
  "The waiter came by again. She asked for another minute.",
];

const CHAT_MESSAGES_INIT = [
  { from: "laura", text: "hey", time: "9:41 PM" },
  { from: "laura", text: "sorry, I know it's late", time: "9:41 PM" },
  { from: "reader", text: "It's fine. How was dinner?", time: "9:43 PM" },
  { from: "laura", text: "it was fine", time: "9:44 PM" },
  { from: "laura", text: "that's not true. it was weird", time: "9:44 PM" },
  { from: "reader", text: "Weird how?", time: "9:45 PM" },
  { from: "laura", text: "I kept watching this woman close a flower shop across the street. like for ten minutes. she was pulling buckets inside and I just... couldn't look away", time: "9:46 PM" },
  { from: "laura", text: "and then he showed up and said something funny and I laughed and it was fine but I was still thinking about the flowers", time: "9:47 PM" },
  { from: "reader", text: "What kind of flowers?", time: "9:48 PM" },
  { from: "laura", text: "peonies and something yellow. I don't know the name", time: "9:48 PM" },
  { from: "laura", text: "why did you ask that", time: "9:49 PM" },
  { from: "reader", text: "Because you remembered them specifically.", time: "9:49 PM" },
  { from: "laura", text: "...", time: "9:50 PM" },
  { from: "laura", text: "yeah. I guess I did", time: "9:51 PM" },
];

const REPLY_QUEUE = [
  { from: "laura", text: "he never asks me things like that", time: "9:52 PM" },
  { from: "laura", text: "sorry. that's not fair to say", time: "9:52 PM" },
];

const themes = {
  dark: {
    bg: "#1a1a1e", drawer: "#141416", input: "#28282e",
    bubbleL: "#2a2a30", bubbleR: "#6b2040", bubbleRText: "#e8d0d8",
    text: "#d4d4d8", dim: "#71717a", muted: "#52525b",
    accent: "#c4506e", border: "#27272a", green: "#4ade80",
    check: "#a1a1aa", overlay: "rgba(0,0,0,0.55)", pill: "#2a2a30",
    bar: "#d4d4d8", outer: "#0e0e10",
  },
  light: {
    bg: "#faf9f7", drawer: "#f0efec", input: "#e9e8e4",
    bubbleL: "#e5e3df", bubbleR: "#8b1a4a", bubbleRText: "#fce8ef",
    text: "#1c1917", dim: "#57534e", muted: "#a8a29e",
    accent: "#9f1239", border: "#e0ded9", green: "#16a34a",
    check: "#78716c", overlay: "rgba(0,0,0,0.25)", pill: "#e5e3df",
    bar: "#1c1917", outer: "#e8e6e2",
  },
};

const F = {
  serif: "'Lora', Georgia, serif",
  sans: "'IBM Plex Sans', 'Helvetica Neue', sans-serif",
  mono: "'IBM Plex Mono', Menlo, monospace",
};

export default function DesireLaneMobile() {
  const [mode, setMode] = useState("dark");
  const [novel, setNovel] = useState(NOVELS[0]);
  const [view, setView] = useState("read");
  const [drawer, setDrawer] = useState(false);
  const [msgs, setMsgs] = useState([...CHAT_MESSAGES_INIT]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [queue, setQueue] = useState([...REPLY_QUEUE]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const c = themes[mode];

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    if (view === "chat") {
      const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [view]);

  function send() {
    const val = input.trim();
    if (!val) return;
    const now = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setMsgs(p => [...p, { from: "reader", text: val, time: now }]);
    setInput("");
    if (queue.length > 0) {
      const q = [...queue];
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setMsgs(p => [...p, q[0]]);
        setQueue(p => p.slice(1));
        if (q.length > 1) {
          setTimeout(() => {
            setMsgs(p => [...p, q[1]]);
            setQueue(p => p.slice(1));
          }, 900);
        }
      }, 1800 + Math.random() * 1500);
    }
  }

  function pick(n) {
    setNovel(n);
    setDrawer(false);
    setView("read");
  }

  function dot(s) {
    if (s === "reading") return { ch: "\u25CF", color: c.green, size: 7 };
    if (s === "complete") return { ch: "\u2713", color: c.check, size: 10 };
    if (s === "dissolved") return { ch: "\u25CB", color: c.muted, size: 7 };
    return { ch: "\u00B7", color: c.muted, size: 9 };
  }

  const isChat = view === "chat" && novel.chatAvailable;
  const isDissolved = view === "read" && novel.status === "dissolved";
  const isReading = view === "read" && novel.status !== "dissolved";

  return (
    <div style={{
      width: "100vw", height: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: c.outer, fontFamily: F.sans,
    }}>
      {/* Phone body */}
      <div style={{
        width: 390, height: 844, borderRadius: 44,
        background: "#000", padding: 8,
        boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        position: "relative",
      }}>
        {/* Screen — flex column, everything flows naturally */}
        <div style={{
          width: "100%", height: "100%", borderRadius: 38,
          overflow: "hidden", background: c.bg,
          display: "flex", flexDirection: "column",
          position: "relative",
        }}>

          {/* Notch */}
          <div style={{
            position: "absolute", top: 0, left: "50%",
            transform: "translateX(-50%)", width: 126, height: 34,
            borderRadius: "0 0 20px 20px", background: "#000", zIndex: 100,
          }} />

          {/* === STATUS BAR === */}
          <div style={{
            height: 54, flexShrink: 0, padding: "16px 28px 0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: c.bar, fontFamily: F.sans }}>9:41</span>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                <path d="M1 8.5h2v3H1zm4-3h2v6H5zm4-3h2v9H9zm4-2.5h2V12h-2z" fill={c.bar} opacity=".85"/>
              </svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
                <rect x=".5" y=".5" width="21" height="11" rx="3" stroke={c.bar} opacity=".4"/>
                <rect x="2" y="2" width="15" height="8" rx="1.5" fill={c.bar} opacity=".85"/>
                <path d="M23 4v4a2 2 0 000-4z" fill={c.bar} opacity=".4"/>
              </svg>
            </div>
          </div>

          {/* === NAV BAR === */}
          <div style={{
            height: 44, flexShrink: 0, padding: "0 16px",
            display: "flex", alignItems: "center",
            borderBottom: `1px solid ${c.border}`,
          }}>
            {/* Left */}
            <div style={{ width: 50 }}>
              {isChat ? (
                <div onClick={() => setView("read")} style={{
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 2,
                }}>
                  <span style={{ fontSize: 20, color: c.accent, lineHeight: 1 }}>{"\u2039"}</span>
                  <span style={{ fontSize: 12, color: c.accent, fontFamily: F.sans }}>Read</span>
                </div>
              ) : (
                <div onClick={() => setDrawer(true)} style={{
                  cursor: "pointer", padding: "8px 0",
                }}>
                  <div style={{ width: 18, height: 1.5, background: c.dim, borderRadius: 1, marginBottom: 4 }} />
                  <div style={{ width: 14, height: 1.5, background: c.dim, borderRadius: 1 }} />
                </div>
              )}
            </div>

            {/* Center */}
            <div style={{ flex: 1, textAlign: "center" }}>
              {isChat ? (
                <div>
                  <div style={{ fontSize: 14, color: c.text, fontWeight: 500, lineHeight: 1.2 }}>Laura</div>
                  <div style={{ fontSize: 10, color: c.green, fontFamily: F.mono }}>online &middot; ch.3</div>
                </div>
              ) : (
                <span style={{ fontSize: 13, color: c.text, fontWeight: 500 }}>{novel.title}</span>
              )}
            </div>

            {/* Right */}
            <div style={{ width: 50, textAlign: "right" }}>
              <span
                onClick={() => setMode(mode === "dark" ? "light" : "dark")}
                style={{ fontSize: 16, color: c.muted, cursor: "pointer" }}
              >{mode === "dark" ? "\u2600" : "\u263E"}</span>
            </div>
          </div>

          {/* === CONTENT AREA — fills remaining space === */}
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>

            {/* READING */}
            {isReading && (
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
                <div style={{ padding: "28px 24px 0" }}>
                  <div style={{
                    fontSize: 10, color: c.muted, fontFamily: F.mono,
                    letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4,
                  }}>
                    Chapter {novel.status === "unread" ? "One" : "Three"} &middot; {novel.chapter || 1}/{novel.totalChapters}
                  </div>
                  <h2 style={{
                    fontSize: 21, fontWeight: 400, fontFamily: F.serif,
                    color: c.text, margin: "0 0 28px", lineHeight: 1.3,
                  }}>The Mezzanine Hour</h2>
                </div>
                <div style={{ padding: "0 24px 100px" }}>
                  {CHAPTER_TEXT.map((para, i) => {
                    const isObj = typeof para === "object";
                    return (
                      <p key={i} style={{
                        fontFamily: F.serif, fontSize: 16, lineHeight: 1.78,
                        color: c.text, margin: "0 0 18px",
                        fontStyle: isObj && para.italic ? "italic" : "normal",
                        opacity: isObj && para.italic ? 0.7 : 1,
                      }}>{isObj ? para.text : para}</p>
                    );
                  })}

                  {novel.chatAvailable && (
                    <div style={{ marginTop: 36, paddingTop: 20, borderTop: `1px solid ${c.border}` }}>
                      <p style={{
                        fontFamily: F.serif, fontSize: 14.5, fontStyle: "italic",
                        color: c.muted, lineHeight: 1.65, margin: 0,
                      }}>
                        Laura is alone in her apartment. She's looking at her phone.
                      </p>
                      <div
                        onClick={() => setView("chat")}
                        style={{
                          marginTop: 16, padding: "12px 0",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          gap: 8, cursor: "pointer",
                          background: c.accent + "14", borderRadius: 10,
                        }}
                      >
                        <span style={{ color: c.green, fontSize: 6 }}>{"\u25CF"}</span>
                        <span style={{ fontFamily: F.serif, fontSize: 14.5, fontStyle: "italic", color: c.accent }}>
                          Talk to Laura
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DISSOLVED */}
            {isDissolved && (
              <div style={{
                flex: 1, minHeight: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 32,
              }}>
                <div style={{
                  fontSize: 10, color: c.muted, fontFamily: F.mono,
                  letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12,
                }}>Exit Velocity &middot; Dissolved</div>
                <p style={{
                  fontFamily: F.serif, fontSize: 15, color: c.dim,
                  lineHeight: 1.65, margin: "0 0 28px", textAlign: "center",
                }}>Chapter 4 did not complete.</p>
                <div style={{
                  width: "100%", maxWidth: 300,
                  background: c.bubbleL, borderRadius: 14,
                  padding: "12px 16px", marginBottom: 8,
                }}>
                  <p style={{ fontFamily: F.sans, fontSize: 13.5, color: c.text, lineHeight: 1.5, margin: 0 }}>
                    I didn't go to dinner with him tonight.
                  </p>
                </div>
                <div style={{
                  width: "100%", maxWidth: 300,
                  background: c.bubbleL, borderRadius: 14, padding: "12px 16px",
                }}>
                  <p style={{ fontFamily: F.sans, fontSize: 13.5, color: c.text, lineHeight: 1.5, margin: 0 }}>
                    I don't think I'm going back.
                  </p>
                </div>
                <p style={{ fontFamily: F.mono, fontSize: 10, color: c.muted, marginTop: 20 }}>
                  11:47 PM &middot; Dec 14
                </p>
              </div>
            )}

            {/* CHAT */}
            {isChat && (
              <>
                {/* Messages — scrollable */}
                <div style={{
                  flex: 1, minHeight: 0, overflowY: "auto",
                  padding: "12px 14px",
                  display: "flex", flexDirection: "column", gap: 2,
                  WebkitOverflowScrolling: "touch",
                }}>
                  {msgs.map((m, i) => {
                    const isR = m.from === "reader";
                    const last = i === msgs.length - 1 || msgs[i + 1]?.from !== m.from;
                    return (
                      <div key={i} style={{
                        display: "flex", flexDirection: "column",
                        alignItems: isR ? "flex-end" : "flex-start",
                      }}>
                        <div style={{
                          background: isR ? c.bubbleR : c.bubbleL,
                          color: isR ? c.bubbleRText : c.text,
                          padding: "8px 12px",
                          borderRadius: isR
                            ? `18px 18px ${last ? "4px" : "18px"} 18px`
                            : `18px 18px 18px ${last ? "4px" : "18px"}`,
                          maxWidth: "80%", fontSize: 15, lineHeight: 1.4,
                          fontFamily: F.sans,
                        }}>{m.text}</div>
                        {last && (
                          <span style={{
                            fontSize: 10, color: c.muted, fontFamily: F.mono,
                            margin: "2px 6px 6px",
                          }}>{m.time}</span>
                        )}
                      </div>
                    );
                  })}
                  {typing && (
                    <div>
                      <div style={{
                        background: c.bubbleL, padding: "10px 16px",
                        borderRadius: "18px 18px 18px 4px", display: "inline-block",
                      }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          {[0, 1, 2].map(j => (
                            <div key={j} style={{
                              width: 7, height: 7, borderRadius: "50%", background: c.muted,
                              animation: `dlDot 1.4s ease-in-out ${j * 0.2}s infinite`,
                            }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                {/* Input bar — pinned to bottom */}
                <div style={{ flexShrink: 0, padding: "8px 12px 24px" }}>
                  <div style={{
                    display: "flex", gap: 8, alignItems: "center",
                    background: c.input, borderRadius: 22, padding: "8px 8px 8px 16px",
                  }}>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
                      placeholder="Message Laura..."
                      style={{
                        flex: 1, background: "transparent", border: "none", outline: "none",
                        color: c.text, fontSize: 15, fontFamily: F.sans, padding: 0,
                      }}
                    />
                    <div
                      onClick={send}
                      style={{
                        width: 30, height: 30, borderRadius: 15,
                        background: input.trim() ? c.accent : c.border,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: input.trim() ? "pointer" : "default", flexShrink: 0,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M12 5l7 7-7 7"
                          stroke={input.trim() ? "#fff" : c.muted}
                          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Floating pill — reading + chat available */}
          {isReading && novel.chatAvailable && (
            <div
              onClick={() => setView("chat")}
              style={{
                position: "absolute", bottom: 16, left: "50%",
                transform: "translateX(-50%)", zIndex: 5,
                background: c.pill, borderRadius: 20,
                padding: "9px 18px", display: "flex",
                alignItems: "center", gap: 8, cursor: "pointer",
                boxShadow: mode === "dark"
                  ? "0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)"
                  : "0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)",
              }}
            >
              <span style={{ color: c.green, fontSize: 6 }}>{"\u25CF"}</span>
              <span style={{ fontSize: 12, color: c.text, fontFamily: F.sans }}>Laura is online</span>
            </div>
          )}

          {/* === DRAWER === */}
          {drawer && (
            <div
              onClick={() => setDrawer(false)}
              style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: c.overlay, zIndex: 80,
              }}
            />
          )}
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0,
            width: 280, background: c.drawer, zIndex: 90,
            transform: drawer ? "translateX(0)" : "translateX(-110%)",
            transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
            display: "flex", flexDirection: "column",
            borderRadius: "38px 0 0 38px", paddingTop: 54,
          }}>
            <div style={{
              padding: "12px 20px 16px", display: "flex",
              alignItems: "center", justifyContent: "space-between",
              borderBottom: `1px solid ${c.border}`,
            }}>
              <span style={{
                fontSize: 11, fontFamily: F.mono, letterSpacing: "0.12em",
                textTransform: "uppercase", color: c.dim,
              }}>dsrln</span>
              <span
                onClick={() => setDrawer(false)}
                style={{ fontSize: 20, color: c.muted, cursor: "pointer", lineHeight: 1 }}
              >{"\u00D7"}</span>
            </div>
            <div style={{
              padding: "14px 20px 8px", fontSize: 10, color: c.muted,
              letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: F.mono,
            }}>Library</div>
            <div style={{ flex: 1, overflow: "auto" }}>
              {NOVELS.map(n => {
                const sel = novel.id === n.id;
                const d = dot(n.status);
                return (
                  <div key={n.id} onClick={() => pick(n)} style={{
                    padding: "12px 20px", cursor: "pointer",
                    background: sel ? c.border : "transparent",
                    display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <span style={{ color: d.color, fontSize: d.size, width: 14, textAlign: "center" }}>{d.ch}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 14, color: sel ? c.text : c.dim,
                        fontFamily: F.sans, fontWeight: sel ? 500 : 400,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: c.muted, fontFamily: F.mono, marginTop: 2 }}>
                        ch. {n.status === "unread" ? 0 : n.chapter} / {n.totalChapters}
                        {n.chatAvailable && <span style={{ color: c.green, marginLeft: 6, fontSize: 5 }}>{"\u25CF"}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              padding: "12px 20px 32px", borderTop: `1px solid ${c.border}`,
              fontSize: 10, color: c.muted, fontFamily: F.mono,
            }}>4 titles &middot; 1 dissolved</div>
          </div>

        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Sans:wght@300;400;500&family=IBM+Plex+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 0; }
        ::placeholder { color: ${c.muted} !important; opacity: 1; }
        @keyframes dlDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
