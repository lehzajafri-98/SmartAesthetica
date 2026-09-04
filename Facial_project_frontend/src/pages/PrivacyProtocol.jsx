import { motion } from "framer-motion";
import { Shield, Eye, Lock, FileText, Globe, Server, UserCheck } from "lucide-react";
import Tilt from "react-parallax-tilt";
import Footer from "../components/Footer";

const protocols = [
    {
        icon: <Eye className="w-6 h-6" />,
        title: "Data Visualization",
        desc: "Facial data is used strictly for real-time simulation and is never stored without explicit user consent for history purposes."
    },
    {
        icon: <Lock className="w-6 h-6" />,
        title: "End-to-End Encryption",
        desc: "All communication between your browser and our secure AI processing units is protected by enterprise-grade TLS 1.3 encryption."
    },
    {
        icon: <Server className="w-6 h-6" />,
        title: "Secure Processing",
        desc: "Simulations are performed on secure, firewalled server-side environments designed to prevent unauthorized data access."
    },
    {
        icon: <UserCheck className="w-6 h-6" />,
        title: "User Control",
        desc: "You have complete control over your simulation history, with the ability to delete any processed image permanently from our systems."
    }
];

export default function PrivacyProtocol() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Ambient Background Elements */}
            <motion.div
                animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 right-[-10%] w-[40rem] h-[40rem] bg-purple-100/30 rounded-full blur-[120px] -z-10"
            />
            <motion.div
                animate={{ y: [0, 40, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-pink-50/20 rounded-full blur-[100px] -z-10"
            />

            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100/50 border border-purple-200 text-purple-600 text-xs font-black uppercase tracking-widest mb-6 shadow-sm">
                        <Shield className="w-3 h-3" /> Secure AI Infrastructure
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-8">
                        Privacy <span className="bg-accent-gradient bg-clip-text text-transparent italic">Protocol</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                        Our neural-first architecture prioritizes patient data integrity through multi-layered security and transparent processing standards.
                    </p>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-12 mb-32">
                    {protocols.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                        >
                            <Tilt
                                tiltMaxAngleX={8}
                                tiltMaxAngleY={8}
                                perspective={1500}
                                glareEnable={true}
                                glareMaxOpacity={0.15}
                                className="h-full"
                            >
                                <div className="p-10 rounded-[2.5rem] bg-white/70 backdrop-blur-2xl border border-white shadow-[0_20px_50px_-15px_rgba(168,85,247,0.12)] hover:shadow-[0_40px_80px_-20px_rgba(168,85,247,0.25)] transition-all duration-500 group h-full">
                                    <div className="w-16 h-16 rounded-2xl bg-accent-gradient flex items-center justify-center text-white mb-8 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight group-hover:text-purple-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                                        {item.desc}
                                    </p>
                                </div>
                            </Tilt>
                        </motion.div>
                    ))}
                </div>

                {/* Deep Dive Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-12 md:p-20 rounded-[3rem] bg-gray-900 shadow-2xl relative overflow-hidden group"
                >
                    {/* Animated Background Decor */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h2 className="text-4xl font-black text-white mb-6 tracking-tight">
                                Academic Commitment to <span className="text-purple-400 italic">Integrity</span>
                            </h2>
                            <div className="space-y-6 text-gray-400 text-lg leading-relaxed font-medium">
                                <p>
                                    SmartAesthetica operates on a strict "Privacy-by-Design" framework. Our AI models are engineered to process features geometrically rather than through personal identification metrics.
                                </p>
                                <p>
                                    In accordance with medical ethical standards, we maintain a zero-monetization policy on user data. Your biometric information belongs exclusively to you.
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-80 h-80 rounded-[2.5rem] bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-8 flex flex-col justify-center items-center text-center shadow-inner group-hover:border-purple-500/50 transition-colors duration-700">
                            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                                <Globe className="w-10 h-10 text-purple-400 animate-pulse" />
                            </div>
                            <h4 className="text-white font-black text-xl mb-2">Global Standards</h4>
                            <p className="text-gray-500 text-sm">Aligning with ISO/IEC 27701 privacy requirements.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
}
