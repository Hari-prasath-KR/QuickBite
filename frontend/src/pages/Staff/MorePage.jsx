import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import StaffNavbar from "../../components/StaffNavbar";
import BottomNav from "./BottomNav";
import {
  FaStore,
  FaSlidersH,
  FaClipboardCheck,
  FaBullhorn,
  FaTrophy,
  FaHeart,
  FaPhoneAlt,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import { MdOutlineMore, MdPowerSettingsNew, MdAccessTime } from "react-icons/md";

function MorePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Operational Settings States
  const [isBranchOpen, setIsBranchOpen] = useState(true);
  const [waitTime, setWaitTime] = useState(15);
  const [operationalMode, setOperationalMode] = useState("Normal");

  // Notice Board States
  const [notices, setNotices] = useState([
    {
      id: 1,
      text: "Prep time is running high on Pizzas due to oven preheating.",
      tag: "Alert",
      time: "10 mins ago",
      color: "from-amber-500/10 to-amber-600/10 text-amber-800 border-amber-500/25"
    },
    {
      id: 2,
      text: "Out of packaging boxes. Please use paper wraps for walk-in orders.",
      tag: "Critical",
      time: "1 hr ago",
      color: "from-rose-500/10 to-rose-600/10 text-rose-800 border-rose-500/25"
    },
    {
      id: 3,
      text: "POS card reader is working fine again after restart.",
      tag: "Info",
      time: "2 hrs ago",
      color: "from-emerald-500/10 to-emerald-600/10 text-emerald-800 border-emerald-500/25"
    }
  ]);
  const [newNoticeText, setNewNoticeText] = useState("");
  const [newNoticeTag, setNewNoticeTag] = useState("Alert");

  // Cleaning Checklist States
  const [checklist, setChecklist] = useState([
    { id: 1, task: "Sanitize counters and cooking surfaces", completed: true },
    { id: 2, task: "Log refrigerator thermometer temperature", completed: false },
    { id: 3, task: "Check and restock sanitizer stations", completed: false },
    { id: 4, task: "Waste disposal and bin liner replacement", completed: true },
    { id: 5, task: "Verify POS scanners are wiped and active", completed: false }
  ]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userRes = await axios.get("http://localhost:5001/api/auth/profile", { withCredentials: true });
      const u = userRes.data.data || userRes.data;
      setUser(u);
    } catch (err) {
      console.error("Error fetching staff profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Operational toggles & handlers
  const handleToggleBranch = () => {
    const newState = !isBranchOpen;
    setIsBranchOpen(newState);
    if (newState) {
      toast.success("Branch status set to ONLINE & AVAILABLE");
    } else {
      toast.error("Branch status set to OFFLINE & CLOSED");
    }
  };

  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!newNoticeText.trim()) return;

    let color = "from-indigo-500/10 to-indigo-600/10 text-indigo-800 border-indigo-500/25";
    if (newNoticeTag === "Alert") {
      color = "from-amber-500/10 to-amber-600/10 text-amber-800 border-amber-500/25";
    } else if (newNoticeTag === "Critical") {
      color = "from-rose-500/10 to-rose-600/10 text-rose-800 border-rose-500/25";
    } else if (newNoticeTag === "Info") {
      color = "from-emerald-500/10 to-emerald-600/10 text-emerald-800 border-emerald-500/25";
    }

    const newNotice = {
      id: Date.now(),
      text: newNoticeText,
      tag: newNoticeTag,
      time: "Just now",
      color
    };

    setNotices([newNotice, ...notices]);
    setNewNoticeText("");
    toast.success("Broadcast note added!");
  };

  const handleDeleteNotice = (id) => {
    setNotices(notices.filter((n) => n.id !== id));
    toast.success("Broadcast note removed!");
  };

  const handleToggleChecklist = (id) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  // Stats derivations
  const completedChecks = checklist.filter((c) => c.completed).length;
  const progressPercent = Math.round((completedChecks / checklist.length) * 100);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-green-400 via-yellow-200 to-white text-gray-800 font-sans overflow-hidden">
      {/* Top Navbar */}
      <StaffNavbar />

      {/* Main Container */}
      <div className="pt-24 pb-28 px-4 md:px-8 flex-1 flex flex-col overflow-hidden max-w-7xl w-full mx-auto space-y-6">
        
        {/* Header Block matching the Order/Menu Page exactly */}
        <div className="flex flex-wrap justify-between items-center gap-4 bg-white/45 backdrop-blur-md border border-white/35 rounded-3xl p-6 shadow-xl">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <MdOutlineMore className="text-green-600 animate-pulse" /> Staff Tools & Hub
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Manage operational states, shifts, broadcast notes, and logs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 border rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm backdrop-blur-md ${
              isBranchOpen
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-700"
                : "bg-rose-500/10 border-rose-500/25 text-rose-700"
            }`}>
              <span className={`h-2.5 w-2.5 rounded-full ${isBranchOpen ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              {isBranchOpen ? "Accepting Orders" : "Shift Closed"}
            </span>
          </div>
        </div>

        {/* Scrollable Center Content Workspace */}
        <div className="flex-1 overflow-y-auto pr-1 pb-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          
          {/* Top Info Cards / Analytics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Shift Tracker Card */}
            <div className="bg-white/45 backdrop-blur-xl border border-white/40 p-5 rounded-3xl flex items-center gap-4 transition-all hover:scale-[1.02] shadow-xl">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl shadow-inner">
                <FaTrophy size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Today's Target</p>
                <h3 className="text-xl font-black text-slate-800 mt-0.5">85% Complete</h3>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-200/50 rounded-full h-1.5 mt-2 overflow-hidden border border-white/20">
                  <div className="bg-gradient-to-r from-emerald-400 to-green-500 h-full rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
            </div>

            {/* Shift Rating Card */}
            <div className="bg-white/45 backdrop-blur-xl border border-white/40 p-5 rounded-3xl flex items-center gap-4 transition-all hover:scale-[1.02] shadow-xl">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 rounded-2xl shadow-inner">
                <FaHeart size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Shift Rating</p>
                <h3 className="text-xl font-black text-slate-800 mt-0.5">4.8 / 5.0</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Excellent (24 client feedbacks)</p>
              </div>
            </div>

            {/* Operations Manager info */}
            <div className="bg-white/45 backdrop-blur-xl border border-white/40 p-5 rounded-3xl flex items-center gap-4 transition-all hover:scale-[1.02] shadow-xl">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl shadow-inner">
                <FaStore size={24} />
              </div>
              <div className="truncate">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Assigned Branch</p>
                <h3 className="text-xl font-black text-slate-800 mt-0.5 truncate">
                  {user?.branchName || "QuickBite Campus Branch"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 truncate">Staff ID: {user?._id || "Loading..."}</p>
              </div>
            </div>

          </div>

          {/* Grid Split: Left 1/2 Control Panel & Log checklist, Right 1/2 Broadcast Notices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT COMPONENT COLUMN */}
            <div className="space-y-6">
              
              {/* Branch Operations Control Panel Card */}
              <div className="bg-white/45 backdrop-blur-xl border border-white/35 rounded-3xl p-6 shadow-xl space-y-5">
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-200/50 pb-3">
                  <FaSlidersH className="text-green-600" /> Branch Operational State
                </h3>

                {/* Open/Close Toggle Button */}
                <div className="flex justify-between items-center gap-4 bg-white/40 border border-white/40 p-4 rounded-2xl shadow-sm">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">Shift Listing Status</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Toggle customer online ordering availability.</p>
                  </div>
                  <button
                    onClick={handleToggleBranch}
                    className={`p-3.5 rounded-2xl font-black text-white text-xs tracking-wider uppercase transition shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                      isBranchOpen
                        ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/15"
                        : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/15"
                    }`}
                  >
                    <MdPowerSettingsNew size={16} />
                    {isBranchOpen ? "Stop Orders" : "Start Orders"}
                  </button>
                </div>

                {/* Estimated Wait Time Slider */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                      <MdAccessTime size={16} className="text-slate-500" /> Wait Time Estimate
                    </label>
                    <span className="px-3 py-1 bg-green-500 text-white font-black text-xs rounded-xl shadow-md shadow-green-500/10">
                      {waitTime} mins
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={waitTime}
                    onChange={(e) => setWaitTime(parseInt(e.target.value))}
                    className="w-full accent-green-500 cursor-pointer h-2 bg-slate-200 rounded-lg border border-white/20"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold">Displayed to customers in their checkout screen.</p>
                </div>

                {/* Operational Stress dropdown */}
                <div className="space-y-2">
                  <label className="block font-extrabold text-sm text-slate-800">Current Kitchen Load</label>
                  <select
                    value={operationalMode}
                    onChange={(e) => {
                      setOperationalMode(e.target.value);
                      toast.success(`Operational load updated to ${e.target.value}`);
                    }}
                    className="w-full bg-white/70 border border-slate-200/50 text-slate-700 py-2.5 px-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent font-bold transition-all shadow-inner"
                  >
                    <option value="Normal">Normal Operation</option>
                    <option value="High Rush">High Rush Mode (Auto-extend Prep Times)</option>
                    <option value="Slowing Down">Slowing Down (Pre-close checklist active)</option>
                    <option value="Maintenance">Maintenance Break (Menu locked)</option>
                  </select>
                </div>

              </div>

              {/* Cleaning & Food Safety Checklist Card */}
              <div className="bg-white/45 backdrop-blur-xl border border-white/35 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-3">
                  <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <FaClipboardCheck className="text-green-600" /> Operational Quality Log
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {completedChecks}/{checklist.length} Done
                    </span>
                    <span className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-700 rounded-lg text-xs font-black shadow-sm">
                      {progressPercent}%
                    </span>
                  </div>
                </div>

                {/* Checklist Directory */}
                <div className="space-y-2.5">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-3 border rounded-2xl flex items-center gap-3 transition-all cursor-pointer select-none active:scale-[0.99] shadow-sm ${
                        item.completed
                          ? "bg-green-500/5 border-green-500/20 text-slate-800"
                          : "bg-white/40 border-white/40 text-slate-600 hover:bg-white/60"
                      }`}
                    >
                      <button className="focus:outline-none flex-shrink-0">
                        {item.completed ? (
                          <FaCheckCircle size={18} className="text-green-600" />
                        ) : (
                          <div className="h-[18px] w-[18px] border-2 border-slate-300 rounded-full bg-white transition-all hover:border-slate-500" />
                        )}
                      </button>
                      <span className={`text-xs font-bold ${item.completed ? "line-through text-slate-400" : ""}`}>
                        {item.task}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* RIGHT COMPONENT COLUMN */}
            <div className="space-y-6">
              
              {/* Interactive Broadcast Notice Board Card */}
              <div className="bg-white/45 backdrop-blur-xl border border-white/35 rounded-3xl p-6 shadow-xl flex flex-col h-full space-y-4">
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 border-b border-slate-200/50 pb-3">
                  <FaBullhorn className="text-green-600" /> Branch Broadcast Board
                </h3>

                {/* New Broadcast memo form */}
                <form onSubmit={handleAddNotice} className="bg-white/40 border border-white/45 p-4 rounded-2xl shadow-inner space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type broadcast alert (e.g. Out of stock...)"
                      value={newNoticeText}
                      onChange={(e) => setNewNoticeText(e.target.value)}
                      className="flex-1 bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent text-slate-800 shadow-sm"
                    />
                    
                    <select
                      value={newNoticeTag}
                      onChange={(e) => setNewNoticeTag(e.target.value)}
                      className="bg-white border border-slate-250 rounded-xl px-2 py-2 text-xs font-bold focus:outline-none text-slate-700 shadow-sm"
                    >
                      <option value="Alert">Alert ⚠️</option>
                      <option value="Critical">Critical 🚨</option>
                      <option value="Info">Info ℹ️</option>
                    </select>

                    <button
                      type="submit"
                      className="px-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-500/10 active:scale-95 transition cursor-pointer flex items-center justify-center"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                </form>

                {/* Broadcast Directory */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
                  {notices.length === 0 ? (
                    <div className="text-center py-10 bg-white/30 border border-dashed border-white/40 rounded-2xl p-6">
                      <FaBullhorn size={28} className="text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">Board is completely clear!</p>
                      <p className="text-[10px] text-slate-400 mt-1">Post memos here for all staff shift sync.</p>
                    </div>
                  ) : (
                    notices.map((notice) => (
                      <div
                        key={notice.id}
                        className={`bg-gradient-to-r border p-4 rounded-2xl shadow-sm flex justify-between items-start gap-4 transition-all hover:scale-[1.01] ${notice.color}`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest border border-current px-1.5 py-0.5 rounded backdrop-blur-md">
                              {notice.tag}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">{notice.time}</span>
                          </div>
                          <p className="text-xs font-semibold leading-relaxed mt-1 text-slate-800">
                            {notice.text}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors focus:outline-none"
                          title="Remove Memo"
                        >
                          <FaTrash size={11} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>

          </div>

          {/* Branch Direct Emergency Support Card */}
          <div className="bg-white/45 backdrop-blur-xl border border-white/35 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-2xl shadow-sm flex-shrink-0">
                <FaPhoneAlt size={18} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-850">Catering Service Support Console</h4>
                <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                  Direct connection with technical helpdesk, campus operations, and catering admin.
                </p>
              </div>
            </div>
            <button
              onClick={() => toast.success("Helpdesk agent notified. Please standby.")}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              📞 Request Assistance
            </button>
          </div>

        </div>
      </div>

      {/* Persistent Bottom Nav Bar */}
      <BottomNav />
    </div>
  );
}

export default MorePage;
