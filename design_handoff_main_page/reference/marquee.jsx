// marquee.jsx
// Two-lane infinite marquee that fills its parent.
// Lane 1 flows left, Lane 2 flows right (or vice versa).
// `speed` is seconds-per-loop; smaller = faster.
// Children: a render function (essay, idx, totalCount) => ReactNode for one card.

function useMarqueeAnim() {
  React.useEffect(() => {
    if (document.getElementById("__tal-marquee-keyframes")) return;
    const s = document.createElement("style");
    s.id = "__tal-marquee-keyframes";
    s.textContent = `
      @keyframes tal-marq-left {
        from { transform: translate3d(0,0,0); }
        to   { transform: translate3d(-50%,0,0); }
      }
      @keyframes tal-marq-right {
        from { transform: translate3d(-50%,0,0); }
        to   { transform: translate3d(0,0,0); }
      }
    `;
    document.head.appendChild(s);
  }, []);
}

function MarqueeLane({
  essays,
  direction = "left",
  speed = 60,
  height,
  renderCard,
  paused = false,
  reverseList = false,
}) {
  useMarqueeAnim();
  const list = reverseList ? [...essays].reverse() : essays;
  // Duplicate the list so the -50% loop is seamless.
  const doubled = [...list, ...list];
  const anim = direction === "left" ? "tal-marq-left" : "tal-marq-right";
  return (
    <div
      style={{
        position: "relative",
        height,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          height: "100%",
          willChange: "transform",
          animation: `${anim} ${speed}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {doubled.map((essay, i) => (
          <div
            key={`${essay.id}-${i}`}
            style={{ height: "100%", flex: "0 0 auto" }}
          >
            {renderCard(essay, i % list.length, list.length)}
          </div>
        ))}
      </div>
    </div>
  );
}

window.MarqueeLane = MarqueeLane;
