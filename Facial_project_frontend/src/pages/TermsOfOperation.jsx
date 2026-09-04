import { motion } from "framer-motion";
import { Scale, CheckCircle, AlertCircle, Clock, Zap, Cpu, Sparkles } from "lucide-react";
import Tilt from "react-parallax-tilt";
import Footer from "../components/Footer";

const terms = [
    {
        icon: <Clock className="w-6 h-6" />,
        title: "Service Availability",
        desc: "Our AI Simulation Engine is designed for 99.9% uptime. Temporary downtime may occur during neural model weight updates or standard maintenance."
    },
    {
        icon: <Zap className="w-6 h-6" />,
        title: "Simulation Speed",
        desc: "Average simulation inference time is under 1 second. Processing times may vary based on user connectivity and server load."
    },
    {
        icon: <AlertCircle className="w-6 h-6" />,
        title: "Results Disclaimer",
        desc: "Simulations are AI-generated approximations for illustrative purposes only. Actual medical results may vary based on physical clinical factors."
    },
    {
        icon: <CheckCircle className="w-6 h-6" />,
        title: "Account Integrity",
        desc: "Users are responsible for maintaining the confidentiality of their medical clinic portals and personal data access keys."
    }
];

export default function TermsOfOperation() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] bg-indigo-100/20 rounded-full blur-[150px] -z-10" />
            <div className="absolute top-1/2 right-[-5%] w-[40rem] h-[40rem] bg-purple-100/10 rounded-full blur-[120px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-28"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white shadow-xl shadow-purple-500/5 border border-purple-50 text-purple-600 text-sm font-black uppercase tracking-widest mb-10 group cursor-default">
                        <Scale className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Professional Standards
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.9] mb-10">
                        Terms of <br />
                        <span className="bg-accent-gradient bg-clip-text text-transparent italic">Operation</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-semibold">
                        Governing the intersection of medical ethics and advanced neural simulation technology.
                    </p>
                </motion.div>

                {/* Dynamic List */}
                <div className="space-y-8 mb-40">
                    {terms.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                        >
                            <Tilt
                                tiltMaxAngleX={4}
                                tiltMaxAngleY={4}
                                perspective={2000}
                                className="w-full"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8 p-10 rounded-[3rem] bg-white/60 backdrop-blur-3xl border border-white shadow-[0_30px_70px_-20px_rgba(168,85,247,0.1)] hover:shadow-[0_50px_100px_-20px_rgba(168,85,247,0.2)] transition-all duration-700 group">
                                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-gray-50 to-white shadow-inner flex items-center justify-center text-purple-600 group-hover:bg-accent-gradient group-hover:text-white transition-all duration-700 shrink-0">
                                        {item.icon}
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-3xl font-black text-gray-900 mb-3 tracking-tight group-hover:translate-x-2 transition-transform duration-700 uppercase">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-500 text-lg font-semibold leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </Tilt>
                        </motion.div>
                    ))}
                </div>

                {/* Global Compliance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-[4rem] bg-accent-gradient p-1 bg-white shadow-3xl overflow-hidden group"
                >
                    <div className="bg-white rounded-[3.8rem] p-12 md:p-20 flex flex-col items-center text-center overflow-hidden relative">
                        <div className="absolute top-[-50%] right-[-10%] w-[40rem] h-[40rem] bg-purple-50 rounded-full blur-[100px] -z-10 group-hover:scale-110 transition-transform duration-1000" />

                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 rounded-3xl bg-purple-50 flex items-center justify-center text-purple-600 mb-10 shadow-inner"
                        >
                            <Cpu className="w-12 h-12" />
                        </motion.div>

                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tighter">
                            Algorithmic <span className="text-purple-600 italic">Governance</span>
                        </h2>

                        <p className="text-gray-500 text-xl font-semibold max-w-3xl leading-relaxed mb-12">
                            SmartAesthetica employs proprietary neural safety filters. Any attempt to use the simulation engine for non-medical or deceptive purposes will result in automatic account suspension as per our integrity agreement.
                        </p>

                        <div className="flex gap-4">
                            <div className="px-8 py-3 rounded-2xl bg-gray-900 text-white font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer">
                                Accept Terms
                            </div>
                            <div className="px-8 py-3 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-sm uppercase tracking-widest shadow-sm hover:bg-indigo-100 transition-all cursor-pointer">
                                Download PDF
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
}
