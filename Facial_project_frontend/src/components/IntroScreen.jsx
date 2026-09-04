import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────
   SVG face-mesh wireframe dots — purely CSS/SVG
───────────────────────────────────────────────*/
const MESH_POINTS = [
  // forehead row
  [128,60],[155,58],[182,60],[209,65],[236,74],
  // eye line
  [100,95],[127,90],[154,88],[181,88],[208,90],[235,95],
  // eye pair inner
  [127,105],[154,103],[181,103],[208,105],
  // nose bridge
  [167,115],[167,133],[167,150],
  // cheeks
  [100,135],[235,135],[105,160],[230,160],
  // lips
  [130,173],[149,170],[167,168],[185,170],[204,173],
  [135,188],[149,183],[167,181],[185,183],[199,188],
  // chin
  [128,205],[148,215],[167,220],[186,215],[206,205],
  // jaw
  [90,180],[243,180],[82,155],[251,155],
];

const MESH_EDGES = [
  [0,1],[1,2],[2,3],[3,4],
  [5,6],[6,7],[7,8],[8,9],[9,10],
  [6,11],[7,12],[8,13],[9,14],
  [11,15],[12,15],[13,16],[14,16],
  [15,17],[16,17],[17,18],[18,19],
  [20,21],[22,23],
  [24,25],[25,26],[26,27],[27,28],
  [29,30],[30,31],[31,32],[32,33],
  [24,29],[28,33],[25,30],[27,32],
  [34,26],[35,26],
  [36,37],[37,38],[38,39],[39,40],[40,36],
];

function FaceMesh({ opacity = 1, scale = 1, rotate = 0 }) {
  return (
    <svg
      width="336"
      height="280"
      viewBox="0 0 336 280"
      style={{
        opacity,
        animation: "meshRotate 5s ease-in-out infinite",
        willChange: "transform",
        filter: "drop-shadow(0 0 8px rgba(168,85,247,0.6))",
      }}
    >
      {/* Edges */}
      {MESH_EDGES.map(([a, b], i) => {
        const [x1, y1] = MESH_POINTS[a] || [0, 0];
        const [x2, y2] = MESH_POINTS[b] || [0, 0];
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(168,85,247,0.35)"
            strokeWidth="1"
          />
        );
      })}
      {/* Dots */}
      {MESH_POINTS.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="2.5"
          fill="rgba(216,180,254,0.85)"
        />
      ))}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   Floating orbiting ring (CSS only)
───────────────────────────────────────────────*/
function OrbitRing({ radius, duration, delay, color }) {
  return (
    <div
      style={{
        position: "absolute",
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        border: `1px solid ${color}`,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        animation: `spin ${duration}s linear ${delay}s infinite`,
        opacity: 0.35,
        willChange: "transform",
      }}
    />
  );
}

/* ─────────────────────────────────────────────
   Main IntroScreen
───────────────────────────────────────────────*/
export default function IntroScreen({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=logo, 1=mesh, 2=zoom-out
  /* auto-advance phases */
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setPhase(2), 3200);
    const t3 = setTimeout(() => onDone(), 4600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        key="intro"
        initial={{ opacity: 1 }}
        animate={phase === 2 ? { opacity: 0, scale: 1.12 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 40% 30%, #1a0533 0%, #0d001f 55%, #000000 100%)",
          perspective: "900px",
          overflow: "hidden",
        }}
      >
        {/* ── Orbit rings ── */}
        <OrbitRing radius={260} duration={18} delay={0}  color="rgba(168,85,247,0.5)" />
        <OrbitRing radius={380} duration={28} delay={-5} color="rgba(236,72,153,0.3)" />
        <OrbitRing radius={500} duration={40} delay={-10} color="rgba(99,102,241,0.2)" />

        {/* ── Radial glow ── */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />

        {/* ── 3D Face Mesh ── */}
        <motion.div
          initial={{ opacity: 0, rotateY: -30, scale: 0.7 }}
          animate={
            phase >= 1
              ? { opacity: 1, scale: 1, rotateY: 0 }
              : { opacity: 0, scale: 0.7 }
          }
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "relative", marginBottom: 24 }}
        >
          <FaceMesh opacity={0.9} scale={1} />
          {/* scanning line */}
          <motion.div
            animate={{ top: ["5%", "95%", "5%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 2,
              background:
                "linear-gradient(90deg, transparent, rgba(168,85,247,0.8), transparent)",
              boxShadow: "0 0 12px rgba(168,85,247,0.6)",
              pointerEvents: "none",
            }}
          />
        </motion.div>

        {/* ── Brand name ── */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={phase >= 1 ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: "center" }}
        >
          <h1
            style={{
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #e879f9, #a855f7, #6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            SmartAesthetica
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={phase >= 1 ? { opacity: 1 } : {}}
            transition={{ delay: 0.65, duration: 0.7 }}
            style={{
              marginTop: 10,
              color: "rgba(216,180,254,0.75)",
              fontSize: "clamp(0.8rem, 2vw, 1rem)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            3D Medical Aesthetic Simulation
          </motion.p>
        </motion.div>

        {/* ── Loading bar ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={phase >= 1 ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          style={{ marginTop: 40, width: 220 }}
        >
          <div
            style={{
              height: 2,
              background: "rgba(168,85,247,0.2)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, delay: 0.8, ease: "easeInOut" }}
              style={{
                height: "100%",
                background:
                  "linear-gradient(90deg, #a855f7, #ec4899)",
                borderRadius: 99,
                boxShadow: "0 0 8px rgba(168,85,247,0.8)",
              }}
            />
          </div>
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              marginTop: 10,
              color: "rgba(216,180,254,0.5)",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            Initializing 3D Engine…
          </motion.p>
        </motion.div>

        {/* ── Corner decorators ── */}
        {[
          { top: 20, left: 20, rotate: 0 },
          { top: 20, right: 20, rotate: 90 },
          { bottom: 20, right: 20, rotate: 180 },
          { bottom: 20, left: 20, rotate: 270 },
        ].map((pos, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            style={{
              position: "absolute",
              width: 28,
              height: 28,
              borderTop: "2px solid rgba(168,85,247,0.7)",
              borderLeft: "2px solid rgba(168,85,247,0.7)",
              transform: `rotate(${pos.rotate}deg)`,
              ...pos,
            }}
          />
        ))}

        {/* ── Floating particles (REDUCED) ── */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.7, 0],
              y: [0, -60 - Math.random() * 80],
              x: [0, (Math.random() - 0.5) * 80],
            }}
            transition={{
              duration: 2.5 + Math.random() * 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 1.5,
            }}
            style={{
              position: "absolute",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: i % 2 === 0 ? "#a855f7" : "#ec4899",
              left: `${10 + Math.random() * 80}%`,
              top: `${30 + Math.random() * 50}%`,
              pointerEvents: "none",
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
