"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/api";
import { motion } from "motion/react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { fetchUser, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone || phone.length !== 10 || !/^[6-9][0-9]{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep(2);
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Verify OTP via Firebase
      await window.confirmationResult.confirm(otp);

      // Call our backend to get the JWT
      const res = await api.post("/auth/customer-login", {
        phone: phone.startsWith("+") ? phone : `+91${phone}`,
        name,
      });

      if (res.data.success || res.status === 200) {
        // Authenticated! Update context
        await fetchUser(); 
        router.push(redirectPath);
      } else {
        throw new Error(res.data.message || "Failed to login on server");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Invalid OTP or login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-5">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md bg-[#fbf1e7]/50 border border-[#2b2320]/10 p-8 md:p-12 rounded-3xl shadow-2xl"
      >
        <h1 className="text-3xl head text-[#2b2320] mb-2 uppercase text-center">
          {step === 1 ? "Welcome Back" : "Verify OTP"}
        </h1>
        <p className="text-[#2b2320]/60 text-center text-sm mb-8">
          {step === 1 ? "Sign in or create an account with your phone number." : `We sent a code to ${phone}`}
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div id="recaptcha-container"></div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Name (Optional)</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name"
                className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">Phone Number *</label>
              <input 
                type="tel" 
                required
                value={phone} 
                onChange={(e) => {
                  // Strip non-digits, leading 0, and +91 prefix
                  let val = e.target.value.replace(/[^0-9]/g, "");
                  if (val.startsWith("91") && val.length > 10) val = val.slice(2);
                  if (val.startsWith("0")) val = val.slice(1);
                  setPhone(val.slice(0, 10));
                }} 
                placeholder="9876543210"
                maxLength={10}
                className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2b2320] text-[#fbf1e7] text-xs uppercase tracking-widest rounded-xl hover:bg-[#b08d57] transition-colors disabled:opacity-50 flex justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#fbf1e7] border-t-transparent rounded-full animate-spin"></div>
              ) : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#2b2320]/60 mb-2">6-Digit Code *</label>
              <input 
                type="text" 
                required
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="123456"
                className="w-full bg-transparent border border-[#2b2320]/20 rounded-xl px-4 py-3 text-[#2b2320] focus:border-[#b08d57] focus:outline-none text-center tracking-[0.5em] text-lg transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2b2320] text-[#fbf1e7] text-xs uppercase tracking-widest rounded-xl hover:bg-[#b08d57] transition-colors disabled:opacity-50 flex justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#fbf1e7] border-t-transparent rounded-full animate-spin"></div>
              ) : "Verify & Log In"}
            </button>
            <button 
              type="button"
              onClick={() => { setStep(1); setOtp(""); setError(null); }}
              className="w-full py-2 text-[#2b2320]/60 text-xs uppercase tracking-widest hover:text-[#2b2320] transition-colors"
            >
              Back
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
