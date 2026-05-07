// variations.jsx
// Three full-bleed marquee variations for Take a Look's main page.
// Each is a self-contained stage that fills its parent container.

const { MarqueeLane } = window;

// ─────────────────────────────────────────────────────────────
// Shared chrome: top-left logo + bottom HUD (index + arrows)
// ─────────────────────────────────────────────────────────────
function Logo({ tone = "light", scale = 1 }) {
  const c = tone === "light" ? "#0a0a0a" : "#f5f3ee";
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2 * scale,
        lineHeight: 1,
        color: c,
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontFamily: '"Instrument Serif", "Times New Roman", serif',
          fontSize: 22 * scale,
          fontStyle: "italic",
          letterSpacing: "-0.01em",
        }}
      >
        Take a Look
      </div>
      <div
        style={{
          fontFamily: '"Noto Sans KR", system-ui, sans-serif',
          fontSize: 9 * scale,
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: 0.55,
        }}
      >
        Essays on obsessions
      </div>
    </div>
  );
}

function HUD({ idx, total, tone = "light", onPrev, onNext, scale = 1 }) {
  const c = tone === "light" ? "#0a0a0a" : "#f5f3ee";
  const sub = tone === "light" ? "rgba(10,10,10,0.4)" : "rgba(245,243,238,0.4)";
  const btnBd = tone === "light" ? "rgba(10,10,10,0.18)" : "rgba(245,243,238,0.22)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18 * scale,
        color: c,
        fontFamily: '"Instrument Serif", "Times New Roman", serif',
        fontSize: 14 * scale,
        userSelect: "none",
      }}
    >
      <span style={{ fontVariantNumeric: "tabular-nums", fontStyle: "italic" }}>
        <span style={{ fontSize: 26 * scale }}>{String(idx + 1).padStart(2, "0")}</span>
        <span style={{ color: sub, margin: `0 ${4 * scale}px` }}>/</span>
        <span style={{ color: sub }}>{String(total).padStart(2, "0")}</span>
      </span>
      <div style={{ display: "flex", gap: 6 * scale }}>
        <button
          onClick={onPrev}
          style={{
            width: 30 * scale,
            height: 30 * scale,
            borderRadius: "50%",
            border: `0.5px solid ${btnBd}`,
            background: "transparent",
            color: c,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "inherit",
            fontSize: 14 * scale,
          }}
        >
          ←
        </button>
        <button
          onClick={onNext}
          style={{
            width: 30 * scale,
            height: 30 * scale,
            borderRadius: "50%",
            border: `0.5px solid ${btnBd}`,
            background: "transparent",
            color: c,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "inherit",
            fontSize: 14 * scale,
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Variation A — "Editorial" / classic two-lane full bleed
// Each card is a tall portrait poster (image + title overlay).
// Two lanes split the height evenly.
// ─────────────────────────────────────────────────────────────
function VariationA({ essays, speed = 60, density = "rich", scale = 1 }) {
  const [hover, setHover] = React.useState(null);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const total = essays.length;

  const cardW = 360 * scale;

  const Card = (essay, i) => {
    const isHover = hover === essay.id;
    return (
      <article
        onMouseEnter={() => {
          setHover(essay.id);
          setActiveIdx(i);
        }}
        onMouseLeave={() => setHover(null)}
        style={{
          width: cardW,
          height: "100%",
          marginRight: 16 * scale,
          position: "relative",
          overflow: "hidden",
          background: "#0a0a0a",
          cursor: "pointer",
        }}
      >
        <img
          src={essay.cover}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(1) contrast(1.05)",
            transform: isHover ? "scale(1.04)" : "scale(1)",
            transition: "transform 1.2s cubic-bezier(.2,.7,.2,1)",
          }}
        />
        {/* Bottom gradient */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0) 70%)",
          }}
        />
        {/* Index badge top-left */}
        <div
          style={{
            position: "absolute",
            top: 14 * scale,
            left: 16 * scale,
            color: "rgba(245,243,238,0.85)",
            fontFamily: '"Instrument Serif", serif',
            fontStyle: "italic",
            fontSize: 13 * scale,
          }}
        >
          № {String(essay.id).padStart(2, "0")}
        </div>
        {/* Category top-right */}
        <div
          style={{
            position: "absolute",
            top: 16 * scale,
            right: 16 * scale,
            color: "rgba(245,243,238,0.7)",
            fontFamily: '"Noto Sans KR", system-ui, sans-serif',
            fontSize: 9 * scale,
            letterSpacing: "0.2em",
            fontWeight: 500,
          }}
        >
          {essay.category}
        </div>
        {/* Title block */}
        <div
          style={{
            position: "absolute",
            left: 16 * scale,
            right: 16 * scale,
            bottom: 16 * scale,
            color: "#f5f3ee",
          }}
        >
          <div
            style={{
              fontFamily: '"Instrument Serif", "Times New Roman", serif',
              fontStyle: "italic",
              fontSize: 13 * scale,
              opacity: 0.7,
              marginBottom: 6 * scale,
              letterSpacing: "-0.01em",
            }}
          >
            {essay.titleEn}
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: '"Noto Sans KR", system-ui, sans-serif',
              fontWeight: 500,
              fontSize: 20 * scale,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            {essay.title}
          </h3>
          {density !== "minimal" && (
            <div
              style={{
                marginTop: 10 * scale,
                fontFamily: '"Noto Sans KR", system-ui, sans-serif',
                fontSize: 11 * scale,
                color: "rgba(245,243,238,0.65)",
                lineHeight: 1.5,
                maxHeight: isHover ? 60 * scale : 0,
                opacity: isHover ? 1 : 0,
                overflow: "hidden",
                transition: "all .35s ease",
              }}
            >
              {essay.excerpt}
            </div>
          )}
          {density === "rich" && (
            <div
              style={{
                marginTop: 10 * scale,
                display: "flex",
                gap: 6 * scale,
                flexWrap: "wrap",
              }}
            >
              {essay.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontFamily: '"Noto Sans KR", system-ui, sans-serif',
                    fontSize: 10 * scale,
                    color: "rgba(245,243,238,0.85)",
                    border: "0.5px solid rgba(245,243,238,0.3)",
                    padding: `${2 * scale}px ${7 * scale}px`,
                    borderRadius: 999,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  };

  const paused = hover !== null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#f5f3ee",
        overflow: "hidden",
        fontFamily: '"Noto Sans KR", system-ui, sans-serif',
      }}
    >
      {/* Two equal lanes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          gap: 16 * scale,
          padding: `${88 * scale}px 0 ${72 * scale}px`,
        }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <MarqueeLane
            essays={essays}
            direction="left"
            speed={speed}
            height="100%"
            renderCard={Card}
            paused={paused}
          />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <MarqueeLane
            essays={essays}
            direction="right"
            speed={speed * 0.85}
            height="100%"
            renderCard={Card}
            reverseList
            paused={paused}
          />
        </div>
      </div>

      {/* Top-left logo */}
      <div
        style={{
          position: "absolute",
          top: 24 * scale,
          left: 28 * scale,
          zIndex: 5,
        }}
      >
        <Logo tone="light" scale={scale} />
      </div>

      {/* Bottom-right HUD */}
      <div
        style={{
          position: "absolute",
          bottom: 24 * scale,
          right: 28 * scale,
          zIndex: 5,
        }}
      >
        <HUD
          idx={activeIdx}
          total={total}
          tone="light"
          scale={scale}
          onPrev={() => setActiveIdx((activeIdx - 1 + total) % total)}
          onNext={() => setActiveIdx((activeIdx + 1) % total)}
        />
      </div>

      {/* Bottom-left tiny meta */}
      <div
        style={{
          position: "absolute",
          bottom: 26 * scale,
          left: 28 * scale,
          zIndex: 5,
          fontFamily: '"Instrument Serif", serif',
          fontStyle: "italic",
          fontSize: 13 * scale,
          color: "rgba(10,10,10,0.55)",
        }}
      >
        Vol. 04 — Spring Issue
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Variation B — "Index Wall" / oversized numerals + asymmetric lanes
// Top lane: tall full-height cards. Bottom lane: half-height, offset.
// Background carries an enormous typographic mark.
// ─────────────────────────────────────────────────────────────
function VariationB({ essays, speed = 60, density = "rich", scale = 1 }) {
  const [hover, setHover] = React.useState(null);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const total = essays.length;

  const BigCard = (essay, i) => {
    const isHover = hover === essay.id;
    return (
      <article
        onMouseEnter={() => {
          setHover(essay.id);
          setActiveIdx(i);
        }}
        onMouseLeave={() => setHover(null)}
        style={{
          width: 480 * scale,
          height: "100%",
          marginRight: 12 * scale,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          background: "#0a0a0a",
        }}
      >
        <img
          src={essay.cover}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(1)",
            opacity: isHover ? 0.85 : 0.65,
            transition: "opacity .4s",
          }}
        />
        {/* Huge essay number */}
        <div
          style={{
            position: "absolute",
            top: -30 * scale,
            left: -10 * scale,
            color: "#f5f3ee",
            mixBlendMode: "difference",
            fontFamily: '"Instrument Serif", serif',
            fontStyle: "italic",
            fontSize: 280 * scale,
            lineHeight: 1,
            letterSpacing: "-0.06em",
            pointerEvents: "none",
          }}
        >
          {String(essay.id).padStart(2, "0")}
        </div>
        {/* Bottom block */}
        <div
          style={{
            position: "absolute",
            left: 24 * scale,
            right: 24 * scale,
            bottom: 22 * scale,
            color: "#f5f3ee",
            display: "flex",
            flexDirection: "column",
            gap: 8 * scale,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10 * scale,
              fontFamily: '"Noto Sans KR", system-ui, sans-serif',
              fontSize: 9 * scale,
              letterSpacing: "0.22em",
              fontWeight: 500,
              opacity: 0.85,
            }}
          >
            <span>{essay.category}</span>
            <span style={{ width: 18 * scale, height: 1, background: "currentColor", opacity: 0.5 }} />
            <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", letterSpacing: "0", fontSize: 12 * scale }}>
              {essay.readingTime} min read
            </span>
          </div>
          <h3
            style={{
              margin: 0,
              fontFamily: '"Noto Sans KR", system-ui, sans-serif',
              fontWeight: 500,
              fontSize: 28 * scale,
              lineHeight: 1.18,
              letterSpacing: "-0.025em",
              textWrap: "balance",
              maxWidth: 380 * scale,
            }}
          >
            {essay.title}
          </h3>
          <div
            style={{
              fontFamily: '"Instrument Serif", serif',
              fontStyle: "italic",
              fontSize: 14 * scale,
              opacity: 0.7,
              letterSpacing: "-0.005em",
            }}
          >
            {essay.titleEn}
          </div>
          {density !== "minimal" && (
            <div
              style={{
                marginTop: 6 * scale,
                display: "flex",
                gap: 6 * scale,
                flexWrap: "wrap",
              }}
            >
              {essay.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 10 * scale,
                    color: "rgba(245,243,238,0.9)",
                    border: "0.5px solid rgba(245,243,238,0.5)",
                    padding: `${2 * scale}px ${8 * scale}px`,
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  };

  const SlimCard = (essay, i) => {
    const isHover = hover === essay.id;
    return (
      <article
        onMouseEnter={() => {
          setHover(essay.id);
          setActiveIdx(i);
        }}
        onMouseLeave={() => setHover(null)}
        style={{
          width: 280 * scale,
          height: "100%",
          marginRight: 10 * scale,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          background: "#1a1a1a",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            width: 100 * scale,
            position: "relative",
            flex: "0 0 auto",
            background: "#0a0a0a",
          }}
        >
          <img
            src={essay.cover}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(1) contrast(1.1)",
              opacity: isHover ? 1 : 0.85,
              transition: "opacity .3s",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            padding: `${14 * scale}px ${16 * scale}px`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            color: "#f5f3ee",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              fontFamily: '"Instrument Serif", serif',
              fontStyle: "italic",
              fontSize: 12 * scale,
              opacity: 0.6,
            }}
          >
            <span>№ {String(essay.id).padStart(2, "0")}</span>
            <span>{essay.date}</span>
          </div>
          <h4
            style={{
              margin: 0,
              fontFamily: '"Noto Sans KR", system-ui, sans-serif',
              fontWeight: 500,
              fontSize: 15 * scale,
              lineHeight: 1.3,
              letterSpacing: "-0.015em",
              textWrap: "balance",
            }}
          >
            {essay.title}
          </h4>
          <div
            style={{
              fontFamily: '"Noto Sans KR", system-ui, sans-serif',
              fontSize: 9 * scale,
              letterSpacing: "0.18em",
              fontWeight: 500,
              opacity: 0.55,
            }}
          >
            {essay.category}
          </div>
        </div>
      </article>
    );
  };

  const paused = hover !== null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#0a0a0a",
        overflow: "hidden",
        fontFamily: '"Noto Sans KR", system-ui, sans-serif',
        color: "#f5f3ee",
      }}
    >
      {/* Background ghost type */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -40 * scale,
          bottom: -120 * scale,
          fontFamily: '"Instrument Serif", serif',
          fontStyle: "italic",
          fontSize: 480 * scale,
          lineHeight: 0.85,
          color: "rgba(245,243,238,0.04)",
          letterSpacing: "-0.05em",
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        Take a Look.
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          padding: `${100 * scale}px 0 ${80 * scale}px`,
          gap: 14 * scale,
        }}
      >
        <div style={{ flex: "0 0 62%", minHeight: 0 }}>
          <MarqueeLane
            essays={essays}
            direction="left"
            speed={speed}
            height="100%"
            renderCard={BigCard}
            paused={paused}
          />
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          <MarqueeLane
            essays={essays}
            direction="right"
            speed={speed * 0.7}
            height="100%"
            renderCard={SlimCard}
            reverseList
            paused={paused}
          />
        </div>
      </div>

      {/* Top-left logo */}
      <div
        style={{
          position: "absolute",
          top: 26 * scale,
          left: 30 * scale,
          zIndex: 5,
        }}
      >
        <Logo tone="dark" scale={scale} />
      </div>

      {/* Top-right tagline */}
      <div
        style={{
          position: "absolute",
          top: 32 * scale,
          right: 30 * scale,
          zIndex: 5,
          textAlign: "right",
          fontFamily: '"Instrument Serif", serif',
          fontStyle: "italic",
          fontSize: 16 * scale,
          color: "rgba(245,243,238,0.7)",
          maxWidth: 280 * scale,
          lineHeight: 1.35,
        }}
      >
        내가 왜 이걸 <br />
        파게 됐는지를 씁니다.
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 28 * scale,
          right: 30 * scale,
          zIndex: 5,
        }}
      >
        <HUD
          idx={activeIdx}
          total={total}
          tone="dark"
          scale={scale}
          onPrev={() => setActiveIdx((activeIdx - 1 + total) % total)}
          onNext={() => setActiveIdx((activeIdx + 1) % total)}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 30 * scale,
          left: 30 * scale,
          zIndex: 5,
          fontFamily: '"Noto Sans KR", system-ui, sans-serif',
          fontSize: 10 * scale,
          letterSpacing: "0.22em",
          color: "rgba(245,243,238,0.45)",
          fontWeight: 500,
        }}
      >
        AN INDEX OF OBSESSIONS · {total} ENTRIES
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Variation C — "Cinematic Slit" / horizon split
// One wide lane mid-screen, with huge type stacked above and below.
// Cards bleed top-to-bottom but a horizontal "letterbox" frames them.
// ─────────────────────────────────────────────────────────────
function VariationC({ essays, speed = 60, density = "rich", scale = 1 }) {
  const [hover, setHover] = React.useState(null);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const total = essays.length;
  const active = essays[activeIdx];

  const Card = (essay, i) => {
    const isHover = hover === essay.id;
    return (
      <article
        onMouseEnter={() => {
          setHover(essay.id);
          setActiveIdx(i);
        }}
        onMouseLeave={() => setHover(null)}
        style={{
          width: 320 * scale,
          height: "100%",
          marginRight: 8 * scale,
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          background: "#0a0a0a",
        }}
      >
        <img
          src={essay.cover}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: isHover
              ? "grayscale(0.4) contrast(1.05)"
              : "grayscale(1) contrast(1.05)",
            transform: isHover ? "scale(1.06)" : "scale(1)",
            transition: "all .8s cubic-bezier(.2,.7,.2,1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: isHover
              ? "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.55))"
              : "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.65))",
            transition: "background .3s",
          }}
        />
        {/* Index ticker top */}
        <div
          style={{
            position: "absolute",
            top: 12 * scale,
            left: 14 * scale,
            right: 14 * scale,
            display: "flex",
            justifyContent: "space-between",
            color: "rgba(245,243,238,0.85)",
            fontFamily: '"Instrument Serif", serif',
            fontStyle: "italic",
            fontSize: 12 * scale,
          }}
        >
          <span>№ {String(essay.id).padStart(2, "0")}</span>
          <span style={{ opacity: 0.6, fontFamily: '"Noto Sans KR", sans-serif', fontStyle: "normal", fontSize: 9 * scale, letterSpacing: "0.2em" }}>
            {essay.category}
          </span>
        </div>
        {/* Bottom title */}
        <div
          style={{
            position: "absolute",
            left: 14 * scale,
            right: 14 * scale,
            bottom: 14 * scale,
            color: "#f5f3ee",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: '"Noto Sans KR", system-ui, sans-serif',
              fontWeight: 500,
              fontSize: 18 * scale,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            {essay.title}
          </h3>
          {density !== "minimal" && (
            <div
              style={{
                marginTop: 6 * scale,
                fontFamily: '"Instrument Serif", serif',
                fontStyle: "italic",
                fontSize: 12 * scale,
                color: "rgba(245,243,238,0.7)",
              }}
            >
              {essay.titleEn}
            </div>
          )}
        </div>
      </article>
    );
  };

  const paused = hover !== null;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#ebe8e1",
        overflow: "hidden",
        fontFamily: '"Noto Sans KR", system-ui, sans-serif',
        color: "#0a0a0a",
      }}
    >
      {/* Top label band */}
      <div
        style={{
          position: "absolute",
          top: `28%`,
          left: 0,
          right: 0,
          textAlign: "center",
          transform: "translateY(-100%)",
          paddingBottom: 18 * scale,
          fontFamily: '"Instrument Serif", "Times New Roman", serif',
          fontStyle: "italic",
          fontSize: 130 * scale,
          lineHeight: 0.9,
          letterSpacing: "-0.04em",
          color: "#0a0a0a",
        }}
      >
        Take a Look,
      </div>

      {/* Marquee letterbox */}
      <div
        style={{
          position: "absolute",
          top: "28%",
          left: 0,
          right: 0,
          height: "44%",
          background: "#0a0a0a",
          overflow: "hidden",
        }}
      >
        <MarqueeLane
          essays={essays}
          direction="left"
          speed={speed}
          height="100%"
          renderCard={Card}
          paused={paused}
        />
        {/* Edge fades */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 80 * scale,
            background: "linear-gradient(to right, #0a0a0a, transparent)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: 80 * scale,
            background: "linear-gradient(to left, #0a0a0a, transparent)",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Bottom label */}
      <div
        style={{
          position: "absolute",
          top: "72%",
          left: 0,
          right: 0,
          paddingTop: 18 * scale,
          textAlign: "center",
          fontFamily: '"Instrument Serif", "Times New Roman", serif',
          fontStyle: "italic",
          fontSize: 130 * scale,
          lineHeight: 0.9,
          letterSpacing: "-0.04em",
          color: "#0a0a0a",
        }}
      >
        and stay a while.
      </div>

      {/* Active essay readout — bottom-left */}
      {density !== "minimal" && (
        <div
          style={{
            position: "absolute",
            bottom: 30 * scale,
            left: 30 * scale,
            zIndex: 5,
            maxWidth: 320 * scale,
            display: "flex",
            flexDirection: "column",
            gap: 6 * scale,
          }}
        >
          <div
            style={{
              fontFamily: '"Noto Sans KR", system-ui, sans-serif',
              fontSize: 9 * scale,
              letterSpacing: "0.22em",
              color: "rgba(10,10,10,0.5)",
              fontWeight: 500,
            }}
          >
            NOW SHOWING
          </div>
          <div
            style={{
              fontFamily: '"Noto Sans KR", system-ui, sans-serif',
              fontSize: 14 * scale,
              fontWeight: 500,
              letterSpacing: "-0.015em",
              lineHeight: 1.35,
            }}
          >
            {active.title}
          </div>
          <div
            style={{
              fontFamily: '"Noto Sans KR", system-ui, sans-serif',
              fontSize: 11 * scale,
              color: "rgba(10,10,10,0.55)",
              lineHeight: 1.5,
            }}
          >
            {active.excerpt}
          </div>
        </div>
      )}

      {/* Top-left logo */}
      <div
        style={{
          position: "absolute",
          top: 26 * scale,
          left: 30 * scale,
          zIndex: 5,
        }}
      >
        <Logo tone="light" scale={scale} />
      </div>

      {/* Bottom-right HUD */}
      <div
        style={{
          position: "absolute",
          bottom: 30 * scale,
          right: 30 * scale,
          zIndex: 5,
        }}
      >
        <HUD
          idx={activeIdx}
          total={total}
          tone="light"
          scale={scale}
          onPrev={() => setActiveIdx((activeIdx - 1 + total) % total)}
          onNext={() => setActiveIdx((activeIdx + 1) % total)}
        />
      </div>
    </div>
  );
}

Object.assign(window, { VariationA, VariationB, VariationC });
