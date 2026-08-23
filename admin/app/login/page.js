"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf1e7] px-4">
      <div className="w-full max-w-md p-8 bg-white/40 border border-[#2b2320]/10 rounded-3xl shadow-xl backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#b08d57]/10 rounded-full flex items-center justify-center mb-4">
            <ShieldCheck size={32} className="text-[#b08d57]" />
          </div>
          <h1 className="text-3xl head text-[#2b2320] mb-2 uppercase tracking-wide">Naivora Admin</h1>
          <p className="text-[#2b2320]/60 text-sm tracking-wide">Enter your credentials to continue</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/50 border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/50 border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#2b2320] text-[#fbf1e7] font-normal tracking-[0.2em] text-xs uppercase hover:bg-[#b08d57] transition-colors rounded-xl disabled:opacity-50 mt-4"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
