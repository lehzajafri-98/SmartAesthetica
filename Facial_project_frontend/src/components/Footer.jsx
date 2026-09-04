import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Zap, Globe, Cpu } from "lucide-react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="w-full mt-32 relative overflow-hidden">
      {/* Top gradient divider with pulse */}
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3], scaleX: [0.8, 1, 0.8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="h-px w-full bg-gradient-to-r from-transparent via-purple-400 to-transparent"
      ></motion.div>

      <div className="bg-white/40 backdrop-blur-3xl border-t border-purple-50 pt-20 pb-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 lg:gap-8">

            {/* Brand Column - 3D Tilt */}
            <div className="lg:col-span-1">
              <Tilt tiltMaxAngleX={15} tiltMaxAngleY={15} perspective={1000} scale={1.05} transitionSpeed={400} className="inline-block">
                <div className="flex items-center gap-3 mb-6 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-accent-gradient flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:rotate-12 transition-transform duration-500">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-black tracking-tight bg-accent-gradient bg-clip-text text-transparent">
                    SmartAesthetica
                  </span>
                </div>
              </Tilt>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-medium">
                The world's most advanced AI-powered facial simulation engine. Precision analysis meeting aesthetic excellence.
              </p>

              <div className="flex gap-4 mt-8">
                {[Globe, Zap, ShieldCheck].map((Icon, i) => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-white border border-purple-50 flex items-center justify-center text-purple-500 hover:bg-purple-600 hover:text-white transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
                    <Icon size={18} />
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Quick Links */}
            <div>
              <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em] mb-8">Platform Sections</h4>
              <ul className="space-y-4">
                {[
                  { label: "Home Engine", to: "/" },
                  { label: "Our Story", to: "/about" },
                  { label: "Pricing Tiers", to: "/pricing" },
                  { label: "User Reviews", to: "/reviews" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-gray-600 text-sm font-semibold hover:text-purple-600 hover:translate-x-1 transition-all inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Intelligent Features */}
            <div>
              <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em] mb-8">Intelligent Features</h4>
              <ul className="space-y-4">
                {[

                  { label: "Simulation Specs", to: "/features" },
                  { label: "Neural Pipeline", to: "/how-it-works" },
                  { label: "Medical Reports", to: "/" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-gray-600 text-sm font-semibold hover:text-purple-600 hover:translate-x-1 transition-all flex items-center gap-2 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-200 group-hover:bg-purple-500 transition-colors"></div>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal & Compliance */}
            <div>
              <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.2em] mb-8">Trust & Compliance</h4>
              <ul className="space-y-4">
                {[
                  { label: "Privacy Protocol", to: "/privacy" },
                  { label: "Terms of Operation", to: "/terms" },
                  { label: "HIPAA Data Standards", to: "/hipaa" },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-gray-600 text-sm font-semibold hover:text-purple-600 hover:translate-x-1 transition-all flex items-center gap-2 group">
                      <Cpu size={14} className="text-purple-300 group-hover:text-purple-600 transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom reflective bar */}
          <div className="mt-20 pt-8 border-t border-purple-50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-[13px] font-medium italic">
              Empowering aesthetic confidence through neural intelligence.
            </p>
            <p className="text-gray-500 text-[13px] font-bold">
              © {new Date().getFullYear()} SmartAesthetica <span className="text-purple-300 mx-2">|</span> Precision Engineered
            </p>
          </div>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100/30 rounded-full blur-[120px] -z-10 translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-pink-50/20 rounded-full blur-[100px] -z-10 -translate-x-1/2 -translate-y-1/2" />
    </footer>
  );
}
