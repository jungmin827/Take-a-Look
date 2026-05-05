// app.jsx — Take a Look main-page exploration
// Three full-bleed marquee variations, side-by-side on a design canvas,
// with a Tweaks panel for speed + overlay density.

const { ESSAYS, VariationA, VariationB, VariationC } = window;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "speed": 60,
  "density": "rich"
}/*EDITMODE-END*/;

// Artboard dimensions match a 16:9 viewport at modest scale so 3 boards
// fit comfortably on the canvas.
const AB_W = 960;
const AB_H = 600;
const STAGE_W = 1440;  // logical viewport the variations design against
const STAGE_H = 900;

function StageScaler({ children }) {
  // Render the variation at logical size and scale to the artboard.
  const scale = Math.min(AB_W / STAGE_W, AB_H / STAGE_H);
  return (
    <div
      style={{
        width: AB_W,
        height: AB_H,
        position: "relative",
        overflow: "hidden",
        background: "#000",
      }}
    >
      <div
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const variants = [
    {
      id: "A",
      label: "A · Editorial",
      Component: VariationA,
      note: "두 줄 동등 분할, 모노 잡지 톤",
    },
    {
      id: "B",
      label: "B · Index Wall",
      Component: VariationB,
      note: "다크 모드 + 거대한 인덱스 숫자",
    },
    {
      id: "C",
      label: "C · Cinematic Slit",
      Component: VariationC,
      note: "가로 레터박스 + 큰 세리프 헤드라인",
    },
  ];

  return (
    <React.Fragment>
      <DesignCanvas>
        <DCSection
          id="hero"
          title="Take a Look — Hero Marquee"
          subtitle="화면을 가득 채우는 두 줄 무한 흐름 · 8 essays · 모노톤 · 잡지 톤"
        >
          {variants.map(({ id, label, Component, note }) => (
            <DCArtboard
              key={id}
              id={id}
              label={`${label} — ${note}`}
              width={AB_W}
              height={AB_H}
            >
              <StageScaler>
                <Component
                  essays={ESSAYS}
                  speed={t.speed}
                  density={t.density}
                  scale={1}
                />
              </StageScaler>
            </DCArtboard>
          ))}
        </DCSection>
      </DesignCanvas>

      <TweaksPanel>
        <TweakSection label="Marquee" />
        <TweakSlider
          label="Loop duration"
          value={t.speed}
          min={20}
          max={140}
          step={5}
          unit="s"
          onChange={(v) => setTweak("speed", v)}
        />
        <TweakSection label="Overlay" />
        <TweakRadio
          label="Information density"
          value={t.density}
          options={["minimal", "balanced", "rich"]}
          onChange={(v) => setTweak("density", v)}
        />
      </TweaksPanel>
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
