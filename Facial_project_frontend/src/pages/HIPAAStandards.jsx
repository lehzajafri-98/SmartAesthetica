import { motion } from "framer-motion";
import { ShieldCheck, Database, Lock, Search, HeartPulse, Activity, ClipboardCheck } from "lucide-react";
import Tilt from "react-parallax-tilt";
import Footer from "../components/Footer";

const standards = [
    {
        icon: <Database className="w-6 h-6" />,
        title: "PHI Security",
        desc: "Strict Protected Health Information (PHI) encryption at rest and in transit, ensuring 256-bit AES encryption for all facial datasets."
    },
    {
        icon: <Lock className="w-6 h-6" />,
        title: "Access Control",
        desc: "Role-based access management (RBAC) ensuring that only authorized clinical staff can access patient simulation reports."
    },
    {
        icon: <Search className="w-6 h-6" />,
        title: "Audit Logging",
        desc: "Comprehensive tracking of all data access events. Every simulation and record view is logged with a permanent, immutable timestamp."
    },
    {
        icon: <ClipboardCheck className="w-6 h-6" />,
        title: "Integrity Checks",
        desc: "Automated daily integrity checks of our database clusters to ensure no unauthorized modifications have occurred."
    }
];

export default function HIPAAStandards() {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] right-[-10%] w-[60rem] h-[60rem] bg-emerald-50/20 rounded-full blur-[180px] -z-10" />
            <div className="absolute bottom-[-10%] left-0 w-[40rem] h-[40rem] bg-indigo-50/10 rounded-full blur-[130px] -z-10" />

            <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="text-center mb-32"
                >
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-3xl bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-[0.2em] mb-12 shadow-sm border border-emerald-100">
                        <HeartPulse className="w-4 h-4 animate-bounce" /> Clinical Grade Security
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85] mb-12">
                        HIPAA Data <br />
                        <span className="bg-accent-gradient bg-clip-text text-transparent italic">Standards</span>
                    </h1>
                    <p className="text-2xl text-gray-400 max-w-2xl mx-auto font-medium lowercase">
                        Precision healthcare requires uncompromising data protection protocols.
                    </p>
                </motion.div>

                {/* Feature Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
                    {standards.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.7 }}
                        >
                            <Tilt
                                tiltMaxAngleX={15}
                                tiltMaxAngleY={15}
                                perspective={1200}
                                glareEnable={true}
                                glareMaxOpacity={0.2}
                                glarePosition="all"
                                className="h-full"
                            >
                                <div className="p-10 h-full rounded-[3rem] bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 group">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight uppercase group-hover:text-emerald-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm font-bold leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            </Tilt>
                        </motion.div>
                    ))}
                </div>

                {/* Compliance Visualization Section */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="grid lg:grid-cols-5 gap-12 items-center mb-32"
                >
                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-px flex-1 bg-emerald-100"></div>
                            <Activity className="text-emerald-400 animate-pulse" />
                            <div className="h-px flex-1 bg-emerald-100"></div>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 tracking-tighter">
                            Secure <span className="text-emerald-500 italic">Storage</span> & Archiving
                        </h2>
                        <p className="text-gray-500 text-xl font-semibold leading-relaxed mb-10">
                            All patient data processed through the SmartAesthetica portal is stored in HIPAA-compliant AWS data centers. We maintain physical and digital security measures that exceed standard regulatory requirements.
                        </p>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="text-emerald-500" />
                                <span className="text-sm font-black text-gray-900 tracking-wider">BAA Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="text-emerald-500" />
                                <span className="text-sm font-black text-gray-900 tracking-wider">HITECH Ready</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <Tilt perspective={2000} tiltMaxAngleX={10} tiltMaxAngleY={10}>
                            <div className="p-2 rounded-[4rem] bg-gradient-to-br from-emerald-400 to-indigo-500 shadow-3xl">
                                <div className="bg-white rounded-[3.8rem] p-12 text-center">
                                    <div className="text-6xl font-black text-gray-900 mb-2">99.9<span className="text-emerald-500">%</span></div>
                                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Data Safety Rating</div>
                                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden mb-8">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: "99.9%" }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                            className="h-full bg-accent-gradient"
                                        />
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium">Verified by third-party clinical security audits.</p>
                                </div>
                            </div>
                        </Tilt>
                    </div>
                </motion.div>

                {/* Footer */}
                <Footer />
            </div>
        </div>
    );
}
