import React, { useState, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from './firebase';
import { signOut } from 'firebase/auth';
import { ref, onValue, set, push, serverTimestamp } from 'firebase/database';
import { Button, TextField } from '@mui/material';


interface DashboardProps {
    user: {
        uid: string;
        email: string | null;
    };
    onError: (msg: string) => void;
}


export default function Dashboard({ user, onError }: DashboardProps) {
    const [currentTemp, setCurrentTemp] = useState<number | null>(null);
    const [tempTimeStamp, setTempTimeStamp] = useState<Date | null>(null);
    const [targetTemp, setTargetTemp] = useState<string>('');
    const [saving, setSaving] = useState<boolean>(false);


    useEffect(() => {
        const homeRef = ref(db, 'Home');
        return onValue(homeRef, (snapshot) => {
            const data = snapshot.val();
            setCurrentTemp(typeof data?.Temperature === 'number' ? data?.Temperature : null);
            setTempTimeStamp(data?.LastUpd ? new Date(Number(data.LastUpd)) : null);
            setTargetTemp(data?.setTemp ? data.setTemp : null);
        });
    }, []);


    const saveTarget = async (val?: number) => {
        const raw = val !== undefined ? String(val) : targetTemp;
        const parsed = parseFloat(raw);


        if (isNaN(parsed)) {
            onError('Invalid number');
            return;
        }


        setSaving(true);
        try {
            await set(ref(db, 'Home/setTemp'), parsed);
            await set(ref(db, 'Home/lastSetBy'), {
                uid: user.uid,
                email: user.email,
                time: serverTimestamp(),
            });


            await push(ref(db, 'Home/logs'), {
                by: user.email,
                target: parsed,
                ts: serverTimestamp(),
            });

        } catch (e: unknown) {
            if (e instanceof Error) onError(e.message);
            else onError('Failed to save');
        }
        setSaving(false);
    };


    const handleTargetChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTargetTemp(e.target.value);
    };


    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6"
        >
            <div className="flex justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Temperature Monitor</h3>
                    <p className="text-sm text-slate-500">Realtime data</p>
                </div>
                <div className="text-right text-xs">
                    <div>{user.email ?? 'Unknown user'}</div>
                    <button className="underline" onClick={() => signOut(auth)}>Sign out</button>
                </div>
            </div>


            <div className="p-4 border rounded-xl mb-4 flex justify-between">
                <div>
                    <div className="text-xs text-slate-500">Current</div>
                    <div className="text-4xl font-bold">{currentTemp !== null ? `${currentTemp}°C` : '—'}</div>
                </div>
                {tempTimeStamp?.toLocaleTimeString('ro-RO', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })}
                <br />
                {tempTimeStamp?.toLocaleDateString('ro-RO')}
            </div>


            <div className="p-4 border rounded-xl mb-4">
                <label className="text-xs text-slate-500">Set Target Temperature</label>
                <div className="flex gap-2 mt-2">
                    <NumberSpinner
                        label="Target Temperature"
                        value={targetTemp}
                        onChange={handleTargetChange}
                        className="flex-1 border rounded-xl p-3"
                        //placeholder="22.5"
                        type="number"
                        step="0.1"
                    />
                    <Button
                        onClick={() => saveTarget()}
                        disabled={saving}
                        className="px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
                    >
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>


            <div className="p-4 border rounded-xl">
                <h4 className="text-sm font-semibold mb-3">Quick actions</h4>
                <div className="flex gap-2">
                    {[20, 22, 24].map((t) => (
                        <button
                            key={t}
                            onClick={() => saveTarget(t)}
                            className="px-3 py-2 rounded-xl border"
                        >
                            {t}°C
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}