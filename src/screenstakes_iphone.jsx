import React, { useState, useEffect, useRef } from "react";

/**
 * ScreenStakes — full-viewport iPhone web app.
 *
 * For Vercel + iPhone Safari, also do these in your project:
 *
 * 1. In your <head> (e.g. app/layout.tsx or pages/_document.js):
 *      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
 *      <meta name="apple-mobile-web-app-capable" content="yes" />
 *      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
 *      <meta name="theme-color" content="#F7F2EB" />
 *
 * 2. In your global CSS:
 *      html, body, #__next, #root { height: 100%; margin: 0; padding: 0; overscroll-behavior: none; }
 *      body { -webkit-tap-highlight-color: transparent; -webkit-font-smoothing: antialiased; }
 */
export default function ScreenStakes() {
  const [tab, setTab] = useState("challenge");
  const [dark, setDark] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [slide, setSlide] = useState(0);
  const [showInvite, setShowInvite] = useState(false);
  const [stake, setStake] = useState(5);
  const [goalHours, setGoalHours] = useState(3);

  const chartInstance = useRef(null);
  const chartCanvasRef = useRef(null);

  // Match theme-color to current mode (changes the iOS status bar tint when added to home screen)
  useEffect(() => {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", dark ? "#110A02" : "#F7F2EB");
  }, [dark]);

  // Lock body scroll so the app behaves like a native app, not a webpage
  useEffect(() => {
    const prev = {
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyOverscroll: document.body.style.overscrollBehavior,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.documentElement.style.overflow = prev.htmlOverflow;
      document.body.style.overflow = prev.bodyOverflow;
      document.body.style.overscrollBehavior = prev.bodyOverscroll;
    };
  }, []);

  // Inject Google Fonts + style block once
  useEffect(() => {
    if (!document.getElementById("ss-fonts")) {
      const link = document.createElement("link");
      link.id = "ss-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=DM+Sans:wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    if (!document.getElementById("ss-style")) {
      const style = document.createElement("style");
      style.id = "ss-style";
      style.textContent = `
        :root {
          --ss-safe-top: env(safe-area-inset-top, 0px);
          --ss-safe-bottom: env(safe-area-inset-bottom, 0px);
          --ss-safe-left: env(safe-area-inset-left, 0px);
          --ss-safe-right: env(safe-area-inset-right, 0px);
        }
        .ss-scroll::-webkit-scrollbar { display: none; }
        .ss-scroll { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
        .ss-range {
          -webkit-appearance: none; appearance: none;
          width: 100%; height: 4px; border-radius: 2px;
          background: var(--ss-tertiary);
          outline: none;
        }
        .ss-range::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 26px; height: 26px; border-radius: 50%;
          background: var(--ss-surface);
          border: 1.5px solid var(--ss-accent);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15);
        }
        .ss-range::-moz-range-thumb {
          width: 26px; height: 26px; border-radius: 50%;
          background: var(--ss-surface);
          border: 1.5px solid var(--ss-accent);
          cursor: pointer;
        }
        .ss-tap { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        @keyframes ss-fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .ss-fade { animation: ss-fade-in 0.35s ease both; }
        @keyframes ss-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ss-sheet-in { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Chart lifecycle
  useEffect(() => {
    if (tab !== "stats" || showOnboarding) return;

    const renderChart = () => {
      if (!chartCanvasRef.current || !window.Chart) return;
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      const ctx = chartCanvasRef.current.getContext("2d");
      const labels = ["1", "2", "3", "4", "5", "6", "7", "8"];
      const actuals = [2.92, 2.5, 3.37, 2.17, 1.83, 2.92, 2.8, 2.23];
      const baseline = Array(8).fill(5.33);
      const goal = Array(8).fill(3);

      const accent = "#C04020";
      const gold = "#A87810";
      const muted = dark ? "#5A3820" : "#AC9278";
      const text2 = dark ? "#A87050" : "#7B5C42";
      const grid = dark ? "rgba(255,150,60,0.07)" : "rgba(80,45,10,0.07)";

      chartInstance.current = new window.Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Baseline",
              data: baseline,
              borderColor: muted,
              borderWidth: 1.2,
              borderDash: [4, 4],
              pointRadius: 0,
              fill: false,
              tension: 0,
            },
            {
              label: "Goal",
              data: goal,
              borderColor: gold,
              borderWidth: 1.2,
              borderDash: [4, 4],
              pointRadius: 0,
              fill: false,
              tension: 0,
            },
            {
              label: "Actual",
              data: actuals,
              borderColor: accent,
              borderWidth: 2,
              pointRadius: 2.5,
              pointBackgroundColor: accent,
              fill: {
                target: { value: 3 },
                above: "rgba(192,64,32,0.10)",
                below: "rgba(192,64,32,0.10)",
              },
              tension: 0.32,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: {
              grid: { color: grid, drawTicks: false },
              border: { display: false },
              ticks: { color: text2, font: { family: "DM Sans", size: 10 } },
            },
            y: {
              min: 0,
              max: 6,
              grid: { color: grid, drawTicks: false },
              border: { display: false },
              ticks: {
                color: text2,
                font: { family: "DM Sans", size: 10 },
                stepSize: 2,
                callback: (v) => `${v}h`,
              },
            },
          },
        },
      });
    };

    if (window.Chart) {
      renderChart();
    } else {
      const existing = document.getElementById("ss-chartjs");
      if (existing) {
        existing.addEventListener("load", renderChart);
      } else {
        const s = document.createElement("script");
        s.id = "ss-chartjs";
        s.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
        s.onload = renderChart;
        document.head.appendChild(s);
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [tab, dark, showOnboarding]);

  const theme = dark
    ? {
        "--ss-bg": "#110A02",
        "--ss-surface": "#1A0F06",
        "--ss-secondary": "#1A0F06",
        "--ss-tertiary": "#251608",
        "--ss-text": "#F0E6D4",
        "--ss-text2": "#A87050",
        "--ss-muted": "#5A3820",
        "--ss-border": "rgba(255,150,60,0.09)",
        "--ss-nav": "rgba(17,10,2,0.96)",
        "--ss-accent": "#C04020",
        "--ss-gold": "#A87810",
        "--ss-amber-bg": "rgba(168,120,16,0.10)",
      }
    : {
        "--ss-bg": "#F7F2EB",
        "--ss-surface": "#FDFAF5",
        "--ss-secondary": "#EDE4D6",
        "--ss-tertiary": "#E2D5C4",
        "--ss-text": "#211508",
        "--ss-text2": "#7B5C42",
        "--ss-muted": "#AC9278",
        "--ss-border": "rgba(80,45,10,0.1)",
        "--ss-nav": "rgba(247,242,235,0.96)",
        "--ss-accent": "#C04020",
        "--ss-gold": "#A87810",
        "--ss-amber-bg": "rgba(168,120,16,0.08)",
      };

  return (
    <div
      style={{
        ...theme,
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        background: "var(--ss-bg)",
        color: "var(--ss-text)",
        fontFamily: "'DM Sans', sans-serif",
        overflow: "hidden",
      }}
    >
      {showOnboarding && (
        <Onboarding
          slide={slide}
          setSlide={setSlide}
          onDone={() => setShowOnboarding(false)}
        />
      )}

      <div
        className="ss-scroll"
        style={{
          position: "absolute",
          inset: 0,
          paddingTop: "var(--ss-safe-top)",
          paddingBottom: "calc(var(--ss-safe-bottom) + 78px)",
          paddingLeft: "var(--ss-safe-left)",
          paddingRight: "var(--ss-safe-right)",
          overflowY: "auto",
          background: "var(--ss-bg)",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {tab === "challenge" && (
          <ChallengeTab
            dark={dark}
            setDark={setDark}
            onInvite={() => setShowInvite(true)}
            stake={stake}
            setStake={setStake}
            goalHours={goalHours}
            setGoalHours={setGoalHours}
          />
        )}
        {tab === "stats" && <StatsTab chartCanvasRef={chartCanvasRef} />}
        {tab === "account" && (
          <AccountTab dark={dark} setDark={setDark} onInvite={() => setShowInvite(true)} />
        )}
      </div>

      <BottomNav tab={tab} setTab={setTab} />

      {showInvite && <InviteSheet onClose={() => setShowInvite(false)} />}
    </div>
  );
}

function Onboarding({ slide, setSlide, onDone }) {
  const slides = [
    {
      heading: "Stake the day, share the pot",
      body: "Put a small amount on the table each day. Stay under your goal and you split the pot with everyone who did.",
      visual: <OnbVisual1 />,
    },
    {
      heading: "Your baseline becomes your line",
      body: "We pull your screen time average from the past two weeks. Your goal sits comfortably below it.",
      visual: <OnbVisual2 />,
    },
    {
      heading: "What you reclaim",
      body: "Money keeps you honest. The hours you get back are the point.",
      visual: <OnbVisual3 />,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 80,
        background: "var(--ss-bg)",
        display: "flex",
        flexDirection: "column",
        paddingTop: "calc(var(--ss-safe-top) + 8px)",
        paddingBottom: "calc(var(--ss-safe-bottom) + 24px)",
        paddingLeft: "var(--ss-safe-left)",
        paddingRight: "var(--ss-safe-right)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 24px" }}>
        <button
          onClick={onDone}
          className="ss-tap"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--ss-text2)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            cursor: "pointer",
            padding: "6px 4px",
          }}
        >
          Skip
        </button>
      </div>

      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div
          style={{
            display: "flex",
            width: "300%",
            height: "100%",
            transform: `translateX(-${slide * 33.3333}%)`,
            transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              style={{
                width: "33.3333%",
                padding: "20px 36px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: "100%",
                  flex: "0 0 auto",
                  marginBottom: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.visual}
              </div>
              <h2
                style={{
                  fontFamily: "'Lora', serif",
                  fontWeight: 500,
                  fontSize: "28px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                  color: "var(--ss-text)",
                  margin: "0 0 14px",
                  maxWidth: "300px",
                }}
              >
                {s.heading}
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  lineHeight: 1.55,
                  color: "var(--ss-text2)",
                  margin: 0,
                  maxWidth: "320px",
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: "6px", padding: "0 0 24px" }}>
        {slides.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === slide ? "20px" : "6px",
              height: "6px",
              borderRadius: "3px",
              background: i === slide ? "var(--ss-accent)" : "var(--ss-tertiary)",
              transition: "all 0.3s",
            }}
          />
        ))}
      </div>

      <div style={{ padding: "0 24px" }}>
        <button
          onClick={() => (slide < 2 ? setSlide(slide + 1) : onDone())}
          className="ss-tap"
          style={{
            width: "100%",
            padding: "16px",
            background: "var(--ss-accent)",
            color: "#fff",
            border: "none",
            borderRadius: "13px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          {slide < 2 ? "Continue" : "Begin"}
        </button>
      </div>
    </div>
  );
}

function OnbVisual1() {
  return (
    <svg viewBox="0 0 220 200" width="220" height="200">
      <circle cx="50" cy="60" r="10" fill="none" stroke="var(--ss-text2)" strokeWidth="1.2" />
      <circle cx="80" cy="40" r="10" fill="none" stroke="var(--ss-text2)" strokeWidth="1.2" />
      <circle cx="140" cy="40" r="10" fill="none" stroke="var(--ss-text2)" strokeWidth="1.2" />
      <circle cx="170" cy="60" r="10" fill="none" stroke="var(--ss-text2)" strokeWidth="1.2" />
      <circle cx="110" cy="30" r="10" fill="var(--ss-accent)" />
      <path d="M 50 80 L 90 110" stroke="var(--ss-muted)" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M 80 60 L 100 110" stroke="var(--ss-muted)" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M 110 50 L 110 110" stroke="var(--ss-muted)" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M 140 60 L 120 110" stroke="var(--ss-muted)" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M 170 80 L 130 110" stroke="var(--ss-muted)" strokeWidth="1" strokeDasharray="2 3" />
      <path
        d="M 60 120 Q 60 170 110 175 Q 160 170 160 120 Z"
        fill="var(--ss-secondary)"
        stroke="var(--ss-accent)"
        strokeWidth="1.5"
      />
      <text x="110" y="155" textAnchor="middle" fontFamily="Lora" fontSize="22" fill="var(--ss-text)">
        $247
      </text>
    </svg>
  );
}

function OnbVisual2() {
  return (
    <svg viewBox="0 0 260 200" width="260" height="200">
      <line x1="30" y1="20" x2="30" y2="180" stroke="var(--ss-border)" strokeWidth="1" />
      <line x1="30" y1="180" x2="240" y2="180" stroke="var(--ss-border)" strokeWidth="1" />
      <line x1="30" y1="60" x2="240" y2="60" stroke="var(--ss-text2)" strokeWidth="1.2" strokeDasharray="4 4" />
      <text x="244" y="63" fontFamily="DM Sans" fontSize="10" fill="var(--ss-text2)">baseline</text>
      <text x="0" y="63" fontFamily="DM Sans" fontSize="10" fill="var(--ss-text2)">5h 20m</text>
      <line x1="30" y1="130" x2="240" y2="130" stroke="var(--ss-gold)" strokeWidth="1.2" strokeDasharray="4 4" />
      <text x="244" y="133" fontFamily="DM Sans" fontSize="10" fill="var(--ss-gold)">goal</text>
      <text x="10" y="133" fontFamily="DM Sans" fontSize="10" fill="var(--ss-gold)">3h</text>
      <rect x="30" y="60" width="210" height="70" fill="var(--ss-accent)" opacity="0.08" />
      <path d="M 40 80 Q 80 100 110 110 T 180 145 T 230 140" stroke="var(--ss-accent)" strokeWidth="2" fill="none" />
      <circle cx="230" cy="140" r="3" fill="var(--ss-accent)" />
    </svg>
  );
}

function OnbVisual3() {
  return (
    <svg viewBox="0 0 240 220" width="240" height="220">
      <text x="120" y="80" textAnchor="middle" fontFamily="Lora" fontSize="56" fontWeight="500" fill="var(--ss-text)">
        −2h 22m
      </text>
      <text x="120" y="105" textAnchor="middle" fontFamily="DM Sans" fontSize="11" fill="var(--ss-text2)" letterSpacing="0.1em">
        PER DAY, RECLAIMED
      </text>
      <line x1="80" y1="135" x2="160" y2="135" stroke="var(--ss-border)" strokeWidth="1" />
      <text x="120" y="170" textAnchor="middle" fontFamily="Lora" fontSize="20" fill="var(--ss-text2)">
        +$74
      </text>
      <text x="120" y="190" textAnchor="middle" fontFamily="DM Sans" fontSize="10" fill="var(--ss-muted)" letterSpacing="0.1em">
        IN POT
      </text>
    </svg>
  );
}

function ChallengeTab({ dark, setDark, onInvite, stake, setStake, goalHours, setGoalHours }) {
  const days = [
    { d: 1, h: 2.92, win: true },
    { d: 2, h: 2.5, win: true },
    { d: 3, h: 3.37, win: false },
    { d: 4, h: 2.17, win: true },
    { d: 5, h: 1.83, win: true },
    { d: 6, h: 2.92, win: true },
    { d: 7, h: 2.8, win: true },
    { d: 8, h: 2.23, win: true, today: true },
  ];

  const totalCommitted = stake * 15;
  const goalFmt = formatHM(goalHours);
  const stakeFmt = `$${stake}`;

  return (
    <div className="ss-fade">
      <Header dark={dark} setDark={setDark} />

      <div style={{ padding: "0 20px", marginTop: "8px" }}>
        <div
          style={{
            background: "var(--ss-accent)",
            borderRadius: "20px",
            padding: "20px 22px 22px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10.5px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              opacity: 0.78,
              marginBottom: "14px",
            }}
          >
            Day 8 of 15 · under goal
          </div>
          <div
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "60px",
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            2h 14m
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              marginTop: "10px",
              opacity: 0.88,
              fontWeight: 400,
            }}
          >
            3h 6m back today · +$38 in pot
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.18)", margin: "18px 0 14px" }} />

          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
            <HeroStat label="Today's pot" value="$247" />
            <HeroStat label="Avg back / day" value="2h 22m" />
            <HeroStat label="Under goal" value="7 of 8" />
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <Card>
          <BarRow label="vs baseline" barPct={75} value="−2h 22m / day" color="var(--ss-accent)" />
          <div style={{ height: "14px" }} />
          <BarRow label="vs goal" barPct={28} value="46m under / day" color="var(--ss-gold)" />
        </Card>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <SectionLabel>This challenge</SectionLabel>
        <div className="ss-scroll" style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
          {Array.from({ length: 15 }).map((_, i) => {
            const dayNum = i + 1;
            const meta = days.find((d) => d.d === dayNum);
            const isFuture = dayNum > 8;
            const isToday = dayNum === 8;
            let bg = "var(--ss-tertiary)";
            let color = "var(--ss-text2)";
            let border = "1px solid transparent";
            if (meta && meta.win && !isToday) {
              bg = "var(--ss-accent)";
              color = "#fff";
            } else if (meta && !meta.win) {
              bg = "var(--ss-tertiary)";
              color = "var(--ss-text2)";
            } else if (isToday) {
              bg = "var(--ss-tertiary)";
              border = "2px solid var(--ss-accent)";
              color = "var(--ss-text)";
            } else if (isFuture) {
              bg = dark ? "rgba(37,22,8,0.5)" : "rgba(226,213,196,0.5)";
              color = "var(--ss-muted)";
            }
            return (
              <div
                key={i}
                style={{
                  flex: "1 1 0",
                  minWidth: "20px",
                  height: "36px",
                  borderRadius: "6px",
                  background: bg,
                  border,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px",
                  fontWeight: 500,
                  color,
                }}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <div
          style={{
            background: "var(--ss-amber-bg)",
            border: "1px solid var(--ss-border)",
            borderRadius: "16px",
            padding: "16px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div
                style={{
                  fontSize: "10.5px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ss-text2)",
                  marginBottom: "4px",
                }}
              >
                Weekly jackpot
              </div>
              <div
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "26px",
                  color: "var(--ss-text)",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                $184
              </div>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "var(--ss-text2)" }}>
              Friday in progress
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px" }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
              const won = i < 4;
              const today = i === 4;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: won ? "var(--ss-gold)" : today ? "transparent" : "var(--ss-tertiary)",
                      border: today ? "1.5px solid var(--ss-gold)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {won && (
                      <svg width="12" height="12" viewBox="0 0 12 12">
                        <path
                          d="M2 6 L5 9 L10 3"
                          stroke="#fff"
                          strokeWidth="1.8"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "9.5px",
                      color: today ? "var(--ss-gold)" : "var(--ss-muted)",
                      fontWeight: today ? 600 : 400,
                    }}
                  >
                    {d}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <div
          style={{
            background: "var(--ss-surface)",
            border: "1px solid var(--ss-border)",
            borderRadius: "16px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <AvatarGroup />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                color: "var(--ss-text)",
                fontWeight: 500,
              }}
            >
              3 friends in this challenge
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11.5px",
                color: "var(--ss-text2)",
                marginTop: "1px",
              }}
            >
              JK, MM, AR
            </div>
          </div>
          <button
            onClick={onInvite}
            className="ss-tap"
            style={{
              background: "var(--ss-secondary)",
              color: "var(--ss-text)",
              border: "none",
              borderRadius: "10px",
              padding: "9px 16px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Invite
          </button>
        </div>
      </div>

      <div style={{ padding: "24px 20px 0" }}>
        <SectionLabel>Next challenge</SectionLabel>
        <Card>
          <SliderRow
            label="Daily stake"
            value={stakeFmt}
            min={1}
            max={20}
            step={1}
            current={stake}
            onChange={(v) => setStake(v)}
          />
          <div style={{ height: "20px" }} />
          <SliderRow
            label="Screen time goal"
            value={goalFmt}
            min={1}
            max={5}
            step={0.25}
            current={goalHours}
            onChange={(v) => setGoalHours(v)}
          />
          <div
            style={{
              marginTop: "20px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              color: "var(--ss-muted)",
              textAlign: "center",
            }}
          >
            Total committed: ${totalCommitted} over 15 days
          </div>
        </Card>

        <button
          className="ss-tap"
          style={{
            width: "100%",
            marginTop: "14px",
            padding: "16px",
            background: "var(--ss-accent)",
            color: "#fff",
            border: "none",
            borderRadius: "13px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          Start challenge
        </button>
      </div>

      <div style={{ height: "20px" }} />
    </div>
  );
}

function Header({ dark, setDark }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 20px 16px",
      }}
    >
      <div
        style={{
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "24px",
          color: "var(--ss-text)",
          fontWeight: 500,
          letterSpacing: "-0.01em",
        }}
      >
        ScreenStakes
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={() => setDark(!dark)}
          className="ss-tap"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Toggle dark mode"
        >
          {dark ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="4" stroke="var(--ss-text)" strokeWidth="1.5" />
              <path
                d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"
                stroke="var(--ss-text)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
                stroke="var(--ss-text)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "var(--ss-secondary)",
            border: "1px solid var(--ss-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Lora', serif",
            fontSize: "13px",
            color: "var(--ss-text)",
            fontWeight: 500,
          }}
        >
          LV
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "9.5px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          opacity: 0.7,
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: 500, color: "#fff" }}>
        {value}
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "var(--ss-surface)",
        border: "1px solid var(--ss-border)",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "10.5px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--ss-text2)",
        marginBottom: "10px",
      }}
    >
      {children}
    </div>
  );
}

function BarRow({ label, barPct, value, color }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "var(--ss-text2)" }}>
          {label}
        </span>
        <span style={{ fontFamily: "'Lora', serif", fontSize: "15px", color: "var(--ss-text)", fontWeight: 500 }}>
          {value}
        </span>
      </div>
      <div style={{ height: "4px", background: "var(--ss-tertiary)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ width: `${barPct}%`, height: "100%", background: color, borderRadius: "2px" }} />
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, current, onChange }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "var(--ss-text2)" }}>
          {label}
        </span>
        <span
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "20px",
            color: "var(--ss-text)",
            fontWeight: 500,
            letterSpacing: "-0.01em",
          }}
        >
          {value}
        </span>
      </div>
      <input
        type="range"
        className="ss-range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}

function AvatarGroup() {
  const avs = [
    { i: "JK", c: "#7B6FB5" },
    { i: "MM", c: "#6B9474" },
    { i: "AR", c: "#A87B8C" },
  ];
  return (
    <div style={{ display: "flex" }}>
      {avs.map((a, i) => (
        <div
          key={i}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: a.c,
            color: "#fff",
            fontSize: "10px",
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginLeft: i === 0 ? 0 : "-8px",
            border: "2px solid var(--ss-surface)",
          }}
        >
          {a.i}
        </div>
      ))}
    </div>
  );
}

function StatsTab({ chartCanvasRef }) {
  const days = [
    { d: 1, h: 2.92, win: true, pot: 12 },
    { d: 2, h: 2.5, win: true, pot: 9 },
    { d: 3, h: 3.37, win: false, pot: -5 },
    { d: 4, h: 2.17, win: true, pot: 14 },
    { d: 5, h: 1.83, win: true, pot: 18 },
    { d: 6, h: 2.92, win: true, pot: 11 },
    { d: 7, h: 2.8, win: true, pot: 15 },
    { d: 8, h: 2.23, win: true, pot: null },
  ];
  const baseline = 5.33;

  return (
    <div className="ss-fade">
      <div
        style={{
          padding: "16px 20px 16px",
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "24px",
          color: "var(--ss-text)",
          fontWeight: 500,
        }}
      >
        Stats
      </div>

      <div style={{ padding: "0 20px" }}>
        <Card>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10.5px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ss-text2)",
              marginBottom: "6px",
            }}
          >
            Reclaimed per day
          </div>
          <div
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "52px",
              fontWeight: 500,
              color: "var(--ss-text)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            −2h 22m
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              color: "var(--ss-text2)",
              marginTop: "8px",
            }}
          >
            vs. your 5h 20m baseline · 8 days in
          </div>

          <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap" }}>
            <Chip>2h 22m / day</Chip>
            <Chip>44% reduction</Chip>
            <Chip>7 of 8 under</Chip>
          </div>
        </Card>
      </div>

      <div style={{ padding: "12px 20px 0" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <MoneyBox label="Spent" value="$5" />
          <MoneyBox label="Pot" value="+$74" />
          <MoneyBox label="Net" value="+$69" emphasized />
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <Card>
          <div style={{ display: "flex", gap: "14px", marginBottom: "10px", flexWrap: "wrap" }}>
            <LegendItem color="var(--ss-text2)" dashed label="Baseline" />
            <LegendItem color="var(--ss-gold)" dashed label="Goal" />
            <LegendItem color="var(--ss-accent)" label="Actual" />
          </div>
          <div style={{ height: "155px", position: "relative" }}>
            <canvas ref={chartCanvasRef} />
          </div>
        </Card>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <SectionLabel>Day by day</SectionLabel>
        <Card style={{ padding: "4px 16px" }}>
          {days.map((d, i) => {
            const saved = baseline - d.h;
            const savedFmt = `−${formatHM(saved)}`;
            return (
              <div
                key={d.d}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: i < days.length - 1 ? "1px solid var(--ss-border)" : "none",
                }}
              >
                <div
                  style={{
                    width: "30px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11px",
                    color: "var(--ss-muted)",
                    fontWeight: 500,
                  }}
                >
                  D{d.d}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: "'Lora', serif",
                      fontSize: "16px",
                      color: "var(--ss-text)",
                      fontWeight: 500,
                    }}
                  >
                    {savedFmt}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "10.5px",
                      color: "var(--ss-muted)",
                      marginTop: "2px",
                    }}
                  >
                    {formatHM(d.h)} used
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 500,
                    color:
                      d.pot === null
                        ? "var(--ss-muted)"
                        : d.pot > 0
                        ? "var(--ss-gold)"
                        : "var(--ss-text2)",
                  }}
                >
                  {d.pot === null ? "—" : d.pot > 0 ? `+$${d.pot}` : `–$${Math.abs(d.pot)}`}
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      <div style={{ height: "20px" }} />
    </div>
  );
}

function Chip({ children }) {
  return (
    <span
      style={{
        background: "var(--ss-secondary)",
        padding: "5px 10px",
        borderRadius: "999px",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "11px",
        color: "var(--ss-text2)",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

function MoneyBox({ label, value, emphasized }) {
  return (
    <div
      style={{
        flex: 1,
        background: "var(--ss-surface)",
        border: "1px solid var(--ss-border)",
        borderRadius: "12px",
        padding: "12px",
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "10px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--ss-muted)",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Lora', serif",
          fontSize: "18px",
          fontWeight: 500,
          color: emphasized ? "var(--ss-gold)" : "var(--ss-text)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function LegendItem({ color, label, dashed }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <svg width="18" height="3">
        <line
          x1="0"
          y1="1.5"
          x2="18"
          y2="1.5"
          stroke={color}
          strokeWidth="1.6"
          strokeDasharray={dashed ? "3 3" : ""}
        />
      </svg>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10.5px", color: "var(--ss-text2)" }}>
        {label}
      </span>
    </div>
  );
}

function AccountTab({ dark, setDark, onInvite }) {
  const menu = [
    { label: "Payment", icon: "card" },
    { label: "Challenge history", icon: "list" },
    { label: "Notifications", icon: "bell" },
    { label: "Invite friends", icon: "user", action: onInvite },
  ];

  return (
    <div className="ss-fade">
      <div
        style={{
          padding: "16px 20px 16px",
          fontFamily: "'Lora', serif",
          fontStyle: "italic",
          fontSize: "24px",
          color: "var(--ss-text)",
          fontWeight: 500,
        }}
      >
        Account
      </div>

      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            background: "var(--ss-accent)",
            borderRadius: "20px",
            padding: "20px",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Lora', serif",
                fontSize: "20px",
                fontWeight: 500,
              }}
            >
              LV
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Lora', serif",
                  fontSize: "20px",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                }}
              >
                Leo V.
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11.5px",
                  opacity: 0.78,
                  marginTop: "2px",
                }}
              >
                Member since Jan 2025
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px", marginTop: "16px", flexWrap: "wrap" }}>
            <DarkChip>2h 8m / day all-time</DarkChip>
            <DarkChip>+$142 net</DarkChip>
            <DarkChip>3 done</DarkChip>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 20px 0" }}>
        <Card style={{ padding: "4px 18px" }}>
          {menu.map((m) => (
            <button
              key={m.label}
              onClick={m.action}
              className="ss-tap"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                padding: "16px 0",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                borderBottom: "1px solid var(--ss-border)",
                textAlign: "left",
              }}
            >
              <MenuIcon name={m.icon} />
              <span
                style={{
                  flex: 1,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "var(--ss-text)",
                  fontWeight: 500,
                }}
              >
                {m.label}
              </span>
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path
                  d="M5 3 L9 7 L5 11"
                  stroke="var(--ss-muted)"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}

          <div style={{ padding: "16px 0", display: "flex", alignItems: "center", gap: "14px" }}>
            <MenuIcon name="moon" />
            <span
              style={{
                flex: 1,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: "var(--ss-text)",
                fontWeight: 500,
              }}
            >
              Dark mode
            </span>
            <Toggle on={dark} onClick={() => setDark(!dark)} />
          </div>
        </Card>
      </div>

      <div style={{ padding: "16px 20px 0" }}>
        <div
          style={{
            background: "var(--ss-amber-bg)",
            border: "1px solid var(--ss-border)",
            borderRadius: "16px",
            padding: "16px",
          }}
        >
          <div
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "16px",
              color: "var(--ss-text)",
              fontWeight: 500,
              marginBottom: "4px",
            }}
          >
            Refer a friend, get a free day
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              color: "var(--ss-text2)",
              marginBottom: "14px",
            }}
          >
            They join, you both get one stake on us.
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div
              style={{
                flex: 1,
                background: "var(--ss-secondary)",
                borderRadius: "10px",
                padding: "12px",
                fontFamily: "ui-monospace, 'SF Mono', monospace",
                fontSize: "13px",
                color: "var(--ss-text)",
                letterSpacing: "0.05em",
              }}
            >
              LEO-K8M2
            </div>
            <button
              className="ss-tap"
              style={{
                background: "var(--ss-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 18px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <div style={{ height: "20px" }} />
    </div>
  );
}

function DarkChip({ children }) {
  return (
    <span
      style={{
        background: "rgba(255,255,255,0.16)",
        padding: "5px 10px",
        borderRadius: "999px",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "10.5px",
        color: "#fff",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      className="ss-tap"
      style={{
        width: "44px",
        height: "26px",
        borderRadius: "13px",
        background: on ? "var(--ss-accent)" : "var(--ss-tertiary)",
        border: "none",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        padding: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: on ? "20px" : "2px",
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

function MenuIcon({ name }) {
  const stroke = "var(--ss-text2)";
  const sw = 1.4;
  const common = { width: 20, height: 20, fill: "none", stroke, strokeWidth: sw };
  switch (name) {
    case "card":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "list":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="14" y2="17" />
        </svg>
      );
    case "bell":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7z" strokeLinejoin="round" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    case "user":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="9" r="3.5" />
          <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" strokeLinecap="round" />
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "challenge", label: "Challenge", icon: "target" },
    { id: "stats", label: "Stats", icon: "chart" },
    { id: "account", label: "Account", icon: "person" },
  ];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--ss-nav)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--ss-border)",
        display: "flex",
        paddingBottom: "calc(var(--ss-safe-bottom) + 6px)",
        paddingLeft: "var(--ss-safe-left)",
        paddingRight: "var(--ss-safe-right)",
        zIndex: 40,
      }}
    >
      {items.map((it) => {
        const active = tab === it.id;
        return (
          <button
            key={it.id}
            onClick={() => setTab(it.id)}
            className="ss-tap"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              paddingTop: "10px",
              paddingBottom: "8px",
              color: active ? "var(--ss-accent)" : "var(--ss-muted)",
            }}
          >
            <NavIcon name={it.icon} active={active} />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "10px",
                fontWeight: active ? 600 : 500,
                letterSpacing: "0.02em",
              }}
            >
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function NavIcon({ name, active }) {
  const stroke = active ? "var(--ss-accent)" : "var(--ss-muted)";
  const sw = active ? 1.7 : 1.5;
  const common = { width: 24, height: 24, fill: "none", stroke, strokeWidth: sw };
  switch (name) {
    case "target":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" fill={stroke} />
        </svg>
      );
    case "chart":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 19V8M10 19v-7M16 19v-4M22 19V5" strokeLinecap="round" />
        </svg>
      );
    case "person":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="9" r="3.5" />
          <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function InviteSheet({ onClose }) {
  const contacts = [
    { name: "Cameron W.", sub: "From Tobin Center", initials: "CW", color: "#7B6FB5", joined: false },
    { name: "Shelley P.", sub: "Recent contact", initials: "SP", color: "#6B9474", joined: true },
    { name: "Adrien M.", sub: "Recent contact", initials: "AM", color: "#A87B8C", joined: false },
    { name: "Liya T.", sub: "Recent contact", initials: "LT", color: "#B58A4F", joined: false },
  ];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 90,
          animation: "ss-overlay-in 0.2s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 91,
          background: "var(--ss-surface)",
          borderRadius: "24px 24px 0 0",
          padding: "12px 22px calc(var(--ss-safe-bottom) + 24px)",
          maxHeight: "82%",
          overflowY: "auto",
          animation: "ss-sheet-in 0.32s cubic-bezier(0.4,0,0.2,1)",
        }}
        className="ss-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: "36px",
            height: "4px",
            background: "var(--ss-tertiary)",
            borderRadius: "2px",
            margin: "0 auto 16px",
          }}
        />
        <div
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "22px",
            fontWeight: 500,
            color: "var(--ss-text)",
            letterSpacing: "-0.01em",
            marginBottom: "4px",
          }}
        >
          Invite to challenge
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12.5px",
            color: "var(--ss-text2)",
            marginBottom: "18px",
          }}
        >
          More people, larger pot.
        </div>

        {contacts.map((c, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 0",
              borderBottom: i < contacts.length - 1 ? "1px solid var(--ss-border)" : "none",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: c.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {c.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--ss-text)",
                }}
              >
                {c.name}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11.5px",
                  color: "var(--ss-muted)",
                  marginTop: "1px",
                }}
              >
                {c.sub}
              </div>
            </div>
            <button
              disabled={c.joined}
              className="ss-tap"
              style={{
                background: c.joined ? "var(--ss-secondary)" : "var(--ss-accent)",
                color: c.joined ? "var(--ss-text2)" : "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "9px 16px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                cursor: c.joined ? "default" : "pointer",
              }}
            >
              {c.joined ? "Joined" : "Invite"}
            </button>
          </div>
        ))}

        <div style={{ marginTop: "20px" }}>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10.5px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ss-text2)",
              marginBottom: "8px",
            }}
          >
            Or share a link
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                flex: 1,
                background: "var(--ss-secondary)",
                borderRadius: "10px",
                padding: "12px",
                fontFamily: "ui-monospace, 'SF Mono', monospace",
                fontSize: "12px",
                color: "var(--ss-text2)",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              screenstakes.app/j/leo-k8m2
            </div>
            <button
              className="ss-tap"
              style={{
                background: "var(--ss-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "12px 18px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function formatHM(hours) {
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
