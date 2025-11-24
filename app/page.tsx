"use client"

import { useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import AuthCard from "./components/AuthCard";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./components/firebase";
import { CircularProgress } from "@mui/material";
import FloatingParticles from "./components/FloatingParticles";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);


  const handleError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 6000);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center">
      <FloatingParticles />
      <div className="absolute top-4 left-0 right-0 flex justify-center">
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-xl shadow text-sm">
            {error}
          </div>
        )}
      </div>


      {loading ? (
        <CircularProgress size={24}/>
      ) : user ? (
        <Dashboard user={{ uid: user.uid, email: user.email }} onError={handleError} />
      ) : (
        <AuthCard onError={handleError} />
      )}
    </div>
  );
}
