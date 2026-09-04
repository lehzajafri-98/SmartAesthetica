import { motion } from "framer-motion";

const FloatingOrb = ({ color, size, initialPos, duration, delay }) => (
    <motion.div
        initial={initialPos}
        animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 40, 0],
            scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
            duration: duration,
            delay: delay,
            repeat: Infinity,
            ease: "easeInOut",
        }}
        className={`absolute rounded-full blur-[60px] pointer-events-none opacity-20 ${color}`}
        style={{ width: size, height: size, preserve3d: "true", willChange: "transform", transform: "translateZ(0)" }}
    />
);

export default function DynamicBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-gradient-to-b from-[#faf7ff] to-[#f3e9ff]">
            {/* Dynamic Orbs */}
            <FloatingOrb
                color="bg-purple-400"
                size="40vw"
                initialPos={{ top: "-10%", left: "-10%" }}
                duration={25}
                delay={0}
            />
            <FloatingOrb
                color="bg-blue-300"
                size="35vw"
                initialPos={{ bottom: "-5%", right: "-5%" }}
                duration={20}
                delay={2}
            />
            <FloatingOrb
                color="bg-fuchsia-300"
                size="30vw"
                initialPos={{ top: "30%", right: "10%" }}
                duration={30}
                delay={5}
            />
            <FloatingOrb
                color="bg-violet-300"
                size="25vw"
                initialPos={{ bottom: "20%", left: "15%" }}
                duration={22}
                delay={1}
            />

            {/* Subtle Moving Grid */}
            <motion.div
                animate={{
                    backgroundPosition: ["0px 0px", "60px 60px"]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }}
            />

            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        </div>
    );
}
