import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { History, LayoutDashboard, Calendar, Sparkles, Users, Settings, Lock, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [patients, setPatients] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('history'); // 'history', 'patients', 'staff'

    // Modal States
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [newPatientName, setNewPatientName] = useState("");
    const [newStaffName, setNewStaffName] = useState("");
    const [newStaffRole, setNewStaffRole] = useState("Consultation Staff");

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (user.plan === "Free") {
            navigate("/");
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch History
                const resHist = await fetch("http://localhost:8000/history", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resHist.ok) {
                    const data = await resHist.json();
                    setHistory(data.history || []);
                }

                // Fetch Clinic Data
                if (user.plan === "Clinic") {
                    const resPat = await fetch("http://localhost:8000/patients", {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (resPat.ok) {
                        const patData = await resPat.json();
                        setPatients(patData.patients || []);
                    }

                    const resStaff = await fetch("http://localhost:8000/staff", {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (resStaff.ok) {
                        const staffData = await resStaff.json();
                        setStaff(staffData.staff || []);
                    }
                }
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, token, navigate]);

    const handleAddPatient = async (e) => {
        e.preventDefault();
        if (!newPatientName.trim()) return;
        try {
            const res = await fetch("http://localhost:8000/patients", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: newPatientName })
            });
            if (res.ok) {
                const patData = await fetch("http://localhost:8000/patients", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const newData = await patData.json();
                setPatients(newData.patients || []);
                setShowPatientModal(false);
                setNewPatientName("");
            }
        } catch (err) { console.error(err); }
    };

    const handleInviteStaff = async (e) => {
        e.preventDefault();
        if (!newStaffName.trim()) return;
        try {
            const res = await fetch("http://localhost:8000/staff", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name: newStaffName, role: newStaffRole })
            });
            if (res.ok) {
                const staffData = await fetch("http://localhost:8000/staff", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const newData = await staffData.json();
                setStaff(newData.staff || []);
                setShowStaffModal(false);
                setNewStaffName("");
                setNewStaffRole("Consultation Staff");
            }
        } catch (err) { console.error(err); }
    };

    if (!user) return null; // Prevent flicker while redirecting

    return (
        <div className="min-h-screen flex flex-col pt-28">
            <Navbar />

            <main className="flex-grow max-w-7xl mx-auto px-6 w-full pb-20">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-purple-100 pb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-xl bg-accent-gradient flex items-center justify-center text-white shadow-md">
                                <LayoutDashboard className="w-6 h-6" />
                            </div>
                            <h1 className="text-4xl font-extrabold text-gray-900">My Dashboard</h1>
                        </div>
                        <p className="text-gray-600 text-lg ml-15">Welcome back, {user.name}. Here is your aesthetic journey.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-6 md:mt-0 flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm border border-purple-100"
                    >
                        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Current Plan:</span>
                        <span className={`text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${user.plan === 'Free' ? 'bg-gray-100 text-gray-500' :
                            user.plan === 'Pro' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' :
                                'bg-accent-gradient text-white shadow-md shadow-purple-200'
                            }`}>
                            {user.plan}
                        </span>
                    </motion.div>
                </div>

                {/* TIER FEATURES OVERVIEW */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    {[
                        { label: "Neural Simulations", status: "Active", plan: "All" },
                        { label: "Surgical Tools", status: user.plan === 'Free' ? "Locked" : "Active", plan: "Pro+" },
                        { label: "Medical PDF Repo", status: user.plan === 'Free' ? "Locked" : "Active", plan: "Pro+" },
                    ].map((feat, i) => (
                        <div key={i} className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/50 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{feat.label}</p>
                                <p className={`text-sm font-bold ${feat.status === 'Locked' ? 'text-gray-400' : 'text-purple-600'}`}>
                                    {feat.status}
                                </p>
                            </div>
                            <span className="text-[10px] bg-purple-50 text-purple-400 px-2 py-0.5 rounded-lg font-bold">{feat.plan}</span>
                        </div>
                    ))}
                </div>

                {/* QUICK ACTIONS PANEL (Tabs) */}
                <div className="flex flex-wrap gap-4 mb-12">
                    <button
                        onClick={user.plan === 'Clinic' ? () => setActiveTab('patients') : () => navigate("/pricing")}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold shadow-sm transition-all border ${user.plan === 'Clinic' && activeTab === 'patients' ? 'ring-2 ring-blue-400 bg-white text-gray-900 border-blue-200 shadow-md' : user.plan === 'Clinic' ? 'bg-white text-gray-900 border-gray-100 hover:border-blue-300 hover:shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                    >
                        <div className={`p-2 rounded-lg ${user.plan === 'Clinic' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-2">
                                New Patient Profile
                                {user.plan !== 'Clinic' && <Lock className="w-3 h-3" />}
                            </div>
                            <p className="text-[10px] opacity-60">
                                {user.plan === 'Pro' ? 'Upgrade to Clinic' : 'Clinic Tier Only'}
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={user.plan === 'Clinic' ? () => setActiveTab('staff') : () => navigate("/pricing")}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold shadow-sm transition-all border ${user.plan === 'Clinic' && activeTab === 'staff' ? 'ring-2 ring-purple-400 bg-white text-gray-900 border-purple-200 shadow-md' : user.plan === 'Clinic' ? 'bg-white text-gray-900 border-gray-100 hover:border-purple-300 hover:shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                    >
                        <div className={`p-2 rounded-lg ${user.plan === 'Clinic' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-2">
                                Staff Consultation
                                {user.plan !== 'Clinic' && <Lock className="w-3 h-3" />}
                            </div>
                            <p className="text-[10px] opacity-60">
                                {user.plan === 'Pro' ? 'Upgrade to Clinic' : 'Enterprise Tier Only'}
                            </p>
                        </div>
                    </button>

                    {user.plan === 'Clinic' && (
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold shadow-sm transition-all border ${activeTab === 'history' ? 'ring-2 ring-gray-400 bg-white text-gray-900 border-gray-200 shadow-md' : 'bg-white text-gray-900 border-gray-100 hover:border-gray-300 hover:shadow-md'}`}
                        >
                            <div className="p-2 rounded-lg bg-gray-50 text-gray-600">
                                <History className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    Simulation History
                                </div>
                                <p className="text-[10px] opacity-60">
                                    View Past Results
                                </p>
                            </div>
                        </button>
                    )}

                    {user.plan === 'Free' && (
                        <button
                            onClick={() => navigate("/pricing")}
                            className="flex items-center gap-3 px-6 py-4 rounded-2xl font-bold shadow-md bg-accent-gradient text-white hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            <Zap className="w-5 h-5 fill-white" />
                            Upgrade to Pro
                        </button>
                    )}
                </div>

                {/* CONTENT AREA */}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <History className="w-5 h-5 text-purple-600" />
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Simulation Neural-History</h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="relative max-w-2xl mx-auto py-10">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-300/30 rounded-full blur-[80px] -z-10 animate-pulse"></div>
                                <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-300/20 rounded-full blur-[60px] -z-10 animate-pulse delay-700"></div>

                                <Tilt
                                    tiltMaxAngleX={5}
                                    tiltMaxAngleY={5}
                                    perspective={1000}
                                    scale={1.02}
                                    transitionSpeed={800}
                                    glareEnable={true}
                                    glareMaxOpacity={0.15}
                                    glareColor="white"
                                    glarePosition="all"
                                    className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] border border-purple-100 py-24 px-8 text-center shadow-[0_20px_50px_-10px_rgba(168,85,247,0.15)] relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-0"></div>

                                    <div className="relative z-10 w-28 h-28 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-purple-100/50 group-hover:scale-110 transition-transform duration-500">
                                        <History className="w-12 h-12 text-purple-400 group-hover:text-purple-600 transition-colors duration-500" />
                                    </div>

                                    <h3 className="relative z-10 text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">No Simulations Yet</h3>

                                    <p className="relative z-10 text-gray-500 mb-10 text-lg max-w-md mx-auto leading-relaxed">
                                        You haven't run any AI facial simulations yet. Head over to the home page to preview treatments and get personalized recommendations!
                                    </p>

                                    <button
                                        onClick={() => navigate("/")}
                                        className="relative z-10 px-10 py-4 rounded-2xl bg-accent-gradient text-white font-bold text-lg shadow-lg hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        Start First Simulation
                                    </button>
                                </Tilt>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-8">
                                {history.map((item) => (
                                    <Tilt
                                        key={item.id}
                                        tiltMaxAngleX={3}
                                        tiltMaxAngleY={3}
                                        perspective={1200}
                                        scale={1.02}
                                        transitionSpeed={400}
                                        glareEnable={true}
                                        glareMaxOpacity={0.1}
                                        glareColor="#ffffff"
                                        glarePosition="all"
                                        className={`bg-white rounded-[2rem] p-6 shadow-sm border transition-all duration-300 hover:shadow-xl flex flex-col ${user.plan === 'Pro' ? 'bg-indigo-50/10 border-indigo-100 hover:border-indigo-300' : 'border-purple-50 hover:border-purple-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                                    <h3 className="text-xl font-bold text-gray-900">{item.procedure}</h3>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* IMAGES COMPARISON */}
                                        <div className="relative rounded-2xl overflow-hidden bg-gray-50 flex border border-gray-100/50 aspect-[16/9] w-full isolate">
                                            <div className="w-1/2 h-full relative border-r border-white/20">
                                                <img
                                                    src={`http://localhost:8000${item.original_image}`}
                                                    alt="Original"
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                                    Before
                                                </div>
                                            </div>
                                            <div className="w-1/2 h-full relative">
                                                <img
                                                    src={`http://localhost:8000${item.processed_image}`}
                                                    alt="Processed"
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute bottom-3 right-3 px-3 py-1 bg-accent-gradient backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                                    After
                                                </div>
                                            </div>
                                            {/* Center Line Glow */}
                                            <div className="absolute left-1/2 top-0 h-full w-[2px] bg-gradient-to-b from-purple-400 via-fuchsia-500 to-purple-400 shadow-[0_0_10px_rgba(192,38,211,0.5)] z-10 -translate-x-1/2" />
                                        </div>
                                    </Tilt>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* PATIENTS TAB */}
                {activeTab === 'patients' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-blue-600" />
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Patient Directory</h2>
                            </div>
                            <button onClick={() => setShowPatientModal(true)} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all shadow-md shadow-blue-200">
                                + Add Patient
                            </button>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <div className="space-y-4">
                                {patients.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 font-medium">No patients found in directory. Add your first patient!</div>
                                ) : (
                                    patients.map((p) => (
                                        <div key={p.id} className="h-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center px-6">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-4">
                                                {p.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{p.name}</p>
                                                <p className="text-xs text-gray-500">Last visited: {p.last_visit}</p>
                                            </div>
                                            <div className="ml-auto flex items-center gap-3">
                                                {p.status === 'Pending' && <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">Pending</span>}
                                                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{p.simulations_count} Simulations</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STAFF TAB */}
                {activeTab === 'staff' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-purple-600" />
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Staff & Permissions</h2>
                            </div>
                            <button onClick={() => setShowStaffModal(true)} className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md">
                                Invite Member
                            </button>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <div className="flex flex-col gap-6">
                                {/* Owner Always Visible */}
                                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-purple-600 font-bold">
                                            {user.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Dr. {user.name} (You)</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-purple-600 bg-purple-100 px-3 py-1.5 rounded-full uppercase tracking-widest">Owner Admin</span>
                                </div>

                                {/* Dynamic Staff Map */}
                                {staff.map((s) => (
                                    <div key={s.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50/50 hover:bg-white transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-600 font-bold">
                                                {s.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{s.name}</p>
                                                <p className="text-xs text-gray-500">{s.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-gray-500">{s.access_level}</span>
                                            <button className="text-gray-400 hover:text-gray-900"><Settings className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* MODALS */}
            {showPatientModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.form
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleAddPatient}
                        className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-gray-100"
                    >
                        <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Add New Patient</h3>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Patient Full Name</label>
                            <input type="text" value={newPatientName} onChange={e => setNewPatientName(e.target.value)} required className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none font-medium" placeholder="e.g. Jane Doe" />
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setShowPatientModal(false)} className="flex-1 px-4 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-3.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg shadow-blue-200 transition-all">Save Patient</button>
                        </div>
                    </motion.form>
                </div>
            )}

            {showStaffModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.form
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleInviteStaff}
                        className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-gray-100"
                    >
                        <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Invite Staff Member</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Staff Full Name</label>
                            <input type="text" value={newStaffName} onChange={e => setNewStaffName(e.target.value)} required className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-medium" placeholder="e.g. Dr. Smith" />
                        </div>
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Role Prefix</label>
                            <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all outline-none font-medium text-gray-700">
                                <option>Consultation Staff</option>
                                <option>Surgeon</option>
                                <option>Clinic Manager</option>
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setShowStaffModal(false)} className="flex-1 px-4 py-3.5 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-3.5 rounded-xl font-bold bg-gray-900 text-white hover:bg-black hover:shadow-lg transition-all">Send Invite</button>
                        </div>
                    </motion.form>
                </div>
            )}

            <Footer />
        </div>
    );
}
