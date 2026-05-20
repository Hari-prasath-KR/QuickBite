import React, { useState } from "react";

const GoogleAuthModal = ({ isOpen, onClose, onSelect }) => {
  const [useCustom, setUseCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [error, setError] = useState("");

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
            {useCustom ? "Sign in with Google" : "Choose an account"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            to continue to <span className="font-semibold text-green-500">QuickBite 🍔</span>
          </p>
        </div>

        {/* Modal Content */}
        <div className="px-8 pb-8">
          {!useCustom ? (
            <div className="space-y-3">
              {mockAccounts.map((account, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAccount(account)}
                  className="w-full flex items-center p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className={`w-9 h-9 rounded-full ${account.bg} flex items-center justify-center text-white font-bold text-sm shadow-sm mr-3`}>
                    {account.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">{account.name}</p>
                    <p className="text-xs text-gray-400">{account.email}</p>
                  </div>
                  <div className="text-gray-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}

              <button
                onClick={() => {
                  setUseCustom(true);
                  setError("");
                }}
                className="w-full flex items-center p-3 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm mr-3">
                  +
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600">Use another account</p>
                  <p className="text-xs text-gray-400">Sign in with a new Google test email</p>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                  className="w-1/2 py-3 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl font-medium text-sm transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#4285F4] hover:bg-[#357ae8] text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-md"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* Close / Cancel Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium tracking-wide focus:outline-none hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
