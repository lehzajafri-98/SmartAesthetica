import React, { useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: "easeOut" },
  }),
};

export default function About() {
  const pipelineRef = useRef(null);

  useEffect(() => {
    const el = pipelineRef.current;
    if (!el) return;

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;

      el.style.transform = `translate3d(${dx * 8}px, ${dy * 5}px, 0)`;
    }

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <Navbar />

      <div className="pt-28 relative min-h-screen overflow-hidden">



        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

          <section className="pt-4 pb-10 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-3xl sm:text-4xl md:text-6xl font-extrabold leading-snug text-[#4b3f72]"
            >
              Aesthetic Simulation —{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8c5bff] via-[#b887ff] to-[#d7baff]">
                AI Powered & Futuristic
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-5 text-base sm:text-lg md:text-xl text-[#5f5f8f] max-w-3xl mx-auto leading-relaxed px-2"
            >
              SmartAesthetica harnesses cutting-edge AI, neural rendering, and clinically validated datasets to produce ultra-realistic facial simulations — instantly. Every transformation is performed securely on private servers, ensuring complete confidentiality and peace of mind.
            </motion.p>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {[
                {
                  title: "Advanced AI",
                  desc: "State-of-the-art neural networks for precise facial simulations.",
                  color: "from-purple-600 to-indigo-500",
                },
                {
                  title: "HIPAA Compliant",
                  desc: "Fully secure and encrypted workflows for complete privacy.",
                  color: "from-pink-500 to-purple-500",
                },
                {
                  title: "Instant Previews",
                  desc: "High-fidelity results in real-time (<3 seconds).",
                  color: "from-blue-500 to-indigo-600",
                },
                {
                  title: "Explainable AI",
                  desc: "Landmark-driven transformations that are easy to understand.",
                  color: "from-purple-500 to-pink-400",
                },
              ].map((f, i) => (
                <Tilt
                  key={i}
                  tiltMaxAngleX={12}
                  tiltMaxAngleY={12}
                  perspective={1200}
                  scale={1.05}
                  transitionSpeed={400}
                  glareEnable={true}
                  glareMaxOpacity={0.25}
                  glareColor="white"
                  glarePosition="all"
                  className="p-8 sm:p-10 rounded-[2.5rem] bg-white/70 backdrop-blur-2xl border border-purple-100 shadow-[0_10px_40px_-10px_rgba(168,85,247,0.1)] transition-all duration-500 group hover:shadow-[0_25px_60px_-10px_rgba(168,85,247,0.3)] hover:border-purple-300 relative overflow-hidden h-full flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

                  <div className={`w-6 h-6 mb-6 rounded-full bg-gradient-to-tr ${f.color} shadow-lg group-hover:scale-125 transition-transform duration-500 relative z-10`} />

                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3 group-hover:bg-accent-gradient group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 relative z-10 tracking-tight">
                    {f.title}
                  </h3>

                  <p className="text-gray-600 font-medium leading-relaxed relative z-10 text-[15px] mb-8 flex-grow">
                    {f.desc}
                  </p>

                  {/* Animated Line */}
                  <div className="w-12 h-1.5 bg-purple-100 rounded-full scale-x-50 opacity-50 group-hover:scale-x-100 group-hover:opacity-100 group-hover:bg-purple-500 transition-all duration-500 ease-out origin-left relative z-10" />
                </Tilt>
              ))}
            </motion.div>
          </section>

          <section id="pipeline" className="py-20 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter mb-4">
                The <span className="bg-accent-gradient bg-clip-text text-transparent">Neural Pipeline</span>
              </h2>
              <p className="text-gray-500 font-semibold text-lg max-w-2xl mx-auto">
                How we transform a simple 2D photograph into a highly accurate, clinically-relevant 3D predictive simulation in under 3 seconds.
              </p>
            </motion.div>

            <div ref={pipelineRef} className="relative px-2">
               {/* Connecting Line */}
               <div className="absolute top-1/2 left-0 w-full h-1 bg-purple-100 -translate-y-1/2 hidden lg:block z-0" />

               <div className="w-full grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {[
                  { title: "Capture", desc: "Client image & anatomy", img: "/hiw_capture.png" },
                  { title: "Analyze", desc: "Landmarks & measurements", img: "/feature_landmark.png" },
                  { title: "Simulate", desc: "Neural rendering & 3D", img: "/feature_botox.png" },
                  { title: "Explain", desc: "Clinical output rendering", img: "/feature_render.png" },
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                  >
                     <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-xl group hover:-translate-y-4 transition-transform duration-500 relative">
                        {/* Number Badge */}
                        <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gray-900 text-white font-black flex items-center justify-center text-lg shadow-lg z-20 group-hover:bg-purple-600 transition-colors">
                           {i + 1}
                        </div>
                        
                        {/* Image */}
                        <div className="w-full aspect-square rounded-[1.5rem] overflow-hidden mb-6 bg-gray-100 border border-gray-50">
                           <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                        </div>
                        
                        {/* Text */}
                        <div className="px-2 pb-2">
                           <h3 className="font-black text-gray-900 text-xl tracking-tight mb-1 group-hover:text-purple-600 transition-colors">{step.title}</h3>
                           <p className="text-gray-500 text-sm font-semibold">{step.desc}</p>
                        </div>
                     </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <footer className="py-10 text-center text-sm text-[#8e85b7]">
            © {new Date().getFullYear()} SmartAesthetica — AI-Powered Aesthetic Previews
          </footer>
        </main>
      </div>
    </>
  );
}
