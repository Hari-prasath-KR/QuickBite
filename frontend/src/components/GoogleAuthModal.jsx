import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const GoogleAuthModal = ({ isOpen, onClose, onSelect }) => {
  const [showSandbox, setShowSandbox] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [error, setError] = useState("");
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Poll or check for window.google to ensure SDK is fully available
  useEffect(() => {
    if (!isOpen) return;

    let checkInterval;
    const initializeGoogleBtn = () => {
      if (window.google && window.google.accounts) {
        setSdkLoaded(true);
        clearInterval(checkInterval);
        
        try {
          const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1038283594025-mbf76t3tkgjcf710h3d4f1s8ltdge0t0.apps.googleusercontent.com";
          
          window.google.accounts.id.initialize({
            client_id: clientID.trim() === "YOUR_GOOGLE_CLIENT_ID_HERE" ? "1038283594025-mbf76t3tkgjcf710h3d4f1s8ltdge0t0.apps.googleusercontent.com" : clientID,
            callback: (response) => {
              if (response.credential) {
                onSelect({ credential: response.credential });
              } else {
                toast.error("Google authentication failed. Please try again.");
              }
            },
            auto_select: false
          });

          // Wait a brief tick for DOM container to exist
          setTimeout(() => {
            const container = document.getElementById("real-google-btn-container");
            if (container) {
              window.google.accounts.id.renderButton(
                container,
                { 
                  theme: "filled_blue", 
                  size: "large", 
                  width: "320", 
                  text: "continue_with",
                  shape: "pill"
                }
              );
            }
          }, 100);

        } catch (err) {
          console.error("🔥 Google Client SDK initialization error:", err);
        }
      }
    };

    // Try immediately
    initializeGoogleBtn();

    // Or poll every 300ms if script is loading async
    checkInterval = setInterval(initializeGoogleBtn, 300);

    return () => clearInterval(checkInterval);
  }, [isOpen]);

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

  const isConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300 animate-fadeIn">
      {/* Premium glowing background elements for visual wow-factor */}
      <div className="absolute w-72 h-72 rounded-full bg-green-400/20 blur-3xl -top-10 -left-10 pointer-events-none"></div>
      <div className="absolute w-72 h-72 rounded-full bg-yellow-300/20 blur-3xl -bottom-10 -right-10 pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl overflow-hidden border border-white/50 transform scale-100 transition-all duration-300 animate-scaleUp flex flex-col max-h-[90vh]">
        
        {/* Header / Brand Branding */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-yellow-300 flex items-center justify-center shadow-lg transform hover:scale-105 transition duration-350">
            <span className="text-3xl animate-bounce">🍔</span>
          </div>
          <h2 className="text-2xl font-extrabold mt-3 text-slate-800 tracking-tight">
            Continue with Google
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Access secure campus dining at <span className="font-bold text-green-500">QuickBite</span>
          </p>
        </div>

        {/* Scrollable Container to prevent overflow on smaller screens */}
        <div className="px-6 pb-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin">
          
          {/* NATIVE GOOGLE IDENTITY SIGN-IN BUTTON CONTAINER */}
          <div className="w-full flex flex-col items-center py-4 bg-slate-50/50 rounded-2xl border border-slate-100/80 px-4 shadow-inner">
            {!sdkLoaded ? (
              <div className="flex flex-col items-center py-3 space-y-2">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[11px] text-slate-400 font-semibold">Connecting to Google Auth...</p>
              </div>
            ) : (
              <>
                <div id="real-google-btn-container" className="my-2 min-h-[46px] flex items-center justify-center"></div>
                <p className="text-[10px] text-slate-400 font-semibold mt-2 text-center flex items-center gap-1">
                  <span className="text-emerald-500">✓</span> Official secure Google OAuth 2.0 popup
                </p>
              </>
            )}
          </div>

          {/* OAUTH 2.0 DYNAMIC RESOLUTION GUIDE CARD */}
          <div className="w-full border border-amber-100 bg-amber-50/45 rounded-2xl overflow-hidden transition-all duration-300">
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between py-3 px-4 text-left focus:outline-none hover:bg-amber-100/30 transition duration-150"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🔑</span>
                <span className="text-xs font-bold text-amber-800 tracking-wide">
                  Fixing "Access Blocked / Authorization Error"
                </span>
              </div>
              <span className="text-xs font-bold text-amber-700">
                {showGuide ? "Hide" : "Show Setup"}
              </span>
            </button>

            {showGuide && (
              <div className="px-4 pb-4 pt-1 text-[11px] text-amber-900 border-t border-amber-100/50 space-y-2.5 leading-relaxed bg-white/50">
                <p className="font-medium text-slate-600">
                  Google blocks requests if the website origin is not authorized. Follow these simple steps to solve it:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 font-medium text-slate-700">
                  <li>
                    Go to the <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">Google Cloud Console</a>.
                  </li>
                  <li>
                    Select your project and open <strong>APIs & Services &gt; Credentials</strong>.
                  </li>
                  <li>
                    Edit your <strong>OAuth 2.0 Client ID</strong> under "Web application".
                  </li>
                  <li>
                    Add <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">http://localhost:5173</code> under <strong>Authorized JavaScript Origins</strong>.
                  </li>
                  <li>
                    Copy your Client ID, open <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">frontend/.env</code>, set:
                    <div className="bg-slate-900 text-white rounded p-1.5 font-mono text-[9px] mt-1.5 select-all border border-slate-700">
                      VITE_GOOGLE_CLIENT_ID=your_client_id_here
                    </div>
                  </li>
                  <li>
                    Restart your frontend client server by running <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">npm run dev</code>!
                  </li>
                </ol>
                <div className="pt-1.5 border-t border-amber-150">
                  <span className="font-bold text-slate-500">Current Status: </span>
                  {isConfigured ? (
                    <span className="text-emerald-600 font-bold">✓ Custom Client ID loaded from .env</span>
                  ) : (
                    <span className="text-red-500 font-bold">⚠️ Using fallback demo client ID (will block on unauthorized domains)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ADVANCED DEVELOPER SANDBOX MODE ACCORDION */}
          <div className="w-full border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300">
            <button
              type="button"
              onClick={() => {
                setShowSandbox(!showSandbox);
                setError("");
              }}
              className="w-full flex items-center justify-between py-3 px-4 text-left focus:outline-none hover:bg-slate-50 transition duration-150"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🛠️</span>
                <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                  Developer Sandbox Fallback
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {showSandbox ? "Hide" : "Expand"}
              </span>
            </button>

            {showSandbox && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-200/50 bg-slate-50/40 text-left space-y-3">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                  Simulate complete Google login instantly offline
                </p>

                {/* Preconfigured Mock accounts */}
                <div className="space-y-2">
                  {mockAccounts.map((account, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAccount(account)}
                      className="w-full flex items-center p-2.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-350 hover:bg-slate-50 transition duration-150 text-left focus:outline-none shadow-sm"
                    >
                      <div className={`w-8 h-8 rounded-full ${account.bg} flex items-center justify-center text-white font-black text-xs mr-3 shadow-md`}>
                        {account.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{account.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{account.email}</p>
                      </div>
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                        Inject
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom Sandbox simulation fields */}
                <div className="border-t border-dashed border-slate-200 pt-3 mt-3">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                    Simulate Custom Google Profile
                  </p>
                  <form onSubmit={handleCustomSubmit} className="space-y-2.5">
                    {error && <p className="text-red-500 text-[10px] text-center font-bold">{error}</p>}
                    <input
                      type="text"
                      placeholder="Custom Profile Name (e.g. Jane Smith)"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-400"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="custom@gmail.com"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-green-400"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg transform active:scale-95 duration-100"
                    >
                      Inject Custom Profile
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between rounded-b-[32px]">
          <span className="text-[9px] text-slate-400 font-medium">QuickBite Secure Gateway</span>
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
