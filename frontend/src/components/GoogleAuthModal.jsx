import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const GoogleAuthModal = ({ isOpen, onClose, onSelect }) => {
  const [showSandbox, setShowSandbox] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && window.google) {
      try {
        const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1038283594025-mbf76t3tkgjcf710h3d4f1s8ltdge0t0.apps.googleusercontent.com";
        
        window.google.accounts.id.initialize({
          client_id: clientID,
          callback: (response) => {
            if (response.credential) {
              onSelect({ credential: response.credential });
            } else {
              toast.error("Google authentication failed. Please try again.");
            }
          },
          auto_select: false
        });

        // Render the official native Google button
        window.google.accounts.id.renderButton(
          document.getElementById("real-google-btn-container"),
          { 
            theme: "filled_blue", 
            size: "large", 
            width: "320", 
            text: "continue_with",
            shape: "pill"
          }
        );

        // Optional One Tap prompt
        window.google.accounts.id.prompt();
      } catch (err) {
        console.error("Google Client SDK initialization error:", err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mockAccounts = [
    { name: "Jane Doe", email: "jane.doe@gmail.com", avatar: "J", bg: "bg-purple-600" },
    { name: "John Smith", email: "john.smith@gmail.com", avatar: "S", bg: "bg-blue-600" },
    { name: "Alice Johnson", email: "alice.j@gmail.com", avatar: "A", bg: "bg-emerald-600" },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transform scale-100 transition-all duration-300 animate-scaleUp">
        
        {/* Google Header Logo */}
        <div className="flex flex-col items-center pt-8 pb-4">
          <svg className="w-10 h-10" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.21-.63-.35-1.3-.35-2.09C4.66 12.63 5.84 14.09 5.84 14.09z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <h2 className="text-xl font-semibold mt-4 text-gray-800">
            Sign in with Google
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            to continue to <span className="font-semibold text-green-500">QuickBite 🍔</span>
          </p>
        </div>

        {/* Modal Content */}
        <div className="px-8 pb-8 flex flex-col items-center">
          
          {/* NATIVE GOOGLE IDENTITY SIGN-IN BUTTON CONTAINER */}
          <div className="w-full flex flex-col items-center py-4">
            <div id="real-google-btn-container" className="my-2 min-h-[46px] flex items-center justify-center"></div>
            <p className="text-[10px] text-gray-400 font-semibold mt-2 text-center">
              Uses official Google authentication popups securely.
            </p>
          </div>

          {/* ADVANCED DEVELOPER SANDBOX CHOOSER */}
          <div className="w-full border-t border-gray-150/60 pt-4 mt-4">
            <button
              type="button"
              onClick={() => {
                setShowSandbox(!showSandbox);
                setError("");
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-[10px] font-black tracking-wider uppercase text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition duration-200"
            >
              <span>🛠️</span> {showSandbox ? "Hide Developer Sandbox" : "Show Developer Sandbox"}
            </button>

            {showSandbox && (
              <div className="mt-4 space-y-3 animate-fade-in text-left">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2 text-center">
                  Mock profiles for local Sandbox sandbox testing
                </p>

                {mockAccounts.map((account, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAccount(account)}
                    className="w-full flex items-center p-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left focus:outline-none"
                  >
                    <div className={`w-8 h-8 rounded-full ${account.bg} flex items-center justify-center text-white font-bold text-xs shadow-sm mr-2.5`}>
                      {account.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 truncate">{account.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{account.email}</p>
                    </div>
                  </button>
                ))}

                {/* Custom Mock Sandbox Entry */}
                <div className="border-t border-dashed border-gray-200 pt-3 mt-3">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">
                    Simulate Custom Test Profile
                  </p>
                  <form onSubmit={handleCustomSubmit} className="space-y-2.5">
                    {error && <p className="text-red-500 text-[10px] text-center font-bold">{error}</p>}
                    <input
                      type="text"
                      placeholder="Custom Profile Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="custom@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition shadow"
                    >
                      Inject Custom Profile
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Close / Cancel Button */}
          <div className="flex justify-center mt-5">
            <button
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium tracking-wide focus:outline-none hover:underline"
            >
              Cancel & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
