import React, { useState } from "react";

const GoogleAuthModal = ({ isOpen, onClose, onSelect }) => {
  const [useCustom, setUseCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const mockAccounts = [
    { name: "Jane Doe", email: "jane.doe@gmail.com", avatar: "J", bg: "bg-gradient-to-tr from-purple-500 to-indigo-600" },
    { name: "John Smith", email: "john.smith@gmail.com", avatar: "S", bg: "bg-gradient-to-tr from-blue-500 to-cyan-600" },
    { name: "Alice Johnson", email: "alice.j@gmail.com", avatar: "A", bg: "bg-gradient-to-tr from-emerald-500 to-teal-600" },
  ];

  const handleSelectAccount = (account) => {
    onSelect({
      name: account.name,
      email: account.email,
      googleId: `google-mock-${account.email.split("@")[0]}`,
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (!customEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    onSelect({
      name: customName,
      email: customEmail.toLowerCase(),
      googleId: `google-mock-custom-${Date.now()}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
      {/* Decorative background glows for premium look */}
      <div className="absolute w-72 h-72 rounded-full bg-green-400/20 blur-3xl -top-10 -left-10 pointer-events-none"></div>
      <div className="absolute w-72 h-72 rounded-full bg-yellow-300/20 blur-3xl -bottom-10 -right-10 pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl overflow-hidden border border-white/50 transform scale-100 transition-all duration-300 animate-scaleUp flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-yellow-300 flex items-center justify-center shadow-lg transform hover:scale-105 transition duration-350">
            <span className="text-3xl animate-bounce">🍔</span>
          </div>
          <h2 className="text-2xl font-extrabold mt-3 text-slate-800 tracking-tight">
            {useCustom ? "Inject Sandbox Profile" : "Google Sandbox Login"}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Simulating Google authentication for <span className="font-bold text-green-500">QuickBite 🍔</span>
          </p>
        </div>

        {/* Content Container */}
        <div className="px-6 pb-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          
          {!useCustom ? (
            <div className="space-y-3">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center mb-1">
                Choose a preconfigured sandbox test profile
              </p>

              {/* Preconfigured Mock accounts */}
              {mockAccounts.map((account, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAccount(account)}
                  className="w-full flex items-center p-3 rounded-2xl border border-slate-200/80 bg-white hover:border-green-400 hover:bg-green-50/20 hover:shadow transition duration-200 text-left focus:outline-none shadow-sm"
                >
                  <div className={`w-9 h-9 rounded-full ${account.bg} flex items-center justify-center text-white font-black text-sm mr-3.5 shadow-md`}>
                    {account.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{account.name}</p>
                    <p className="text-xs text-slate-400 truncate">{account.email}</p>
                  </div>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full border border-green-150">
                    Login
                  </span>
                </button>
              ))}

              {/* Toggle custom form button */}
              <button
                onClick={() => {
                  setUseCustom(true);
                  setError("");
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50/60 transition duration-150 text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                  +
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-600">Use custom test account</p>
                  <p className="text-[10px] text-slate-400">Inject a custom test email address</p>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                Simulate any Google profile offline
              </p>

              {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  Profile Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-400"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-400"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseCustom(false);
                    setError("");
                  }}
                  className="w-1/2 py-2.5 border border-slate-350 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-xs transition duration-150"
                >
                  Back to List
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs transition shadow-md hover:shadow-lg transform active:scale-95 duration-100"
                >
                  Inject & Login
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-[32px]">
          <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">Sandbox Developer Mode</span>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold tracking-wide focus:outline-none hover:underline"
          >
            Cancel & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
