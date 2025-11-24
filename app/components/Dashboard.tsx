import { SystemState, TemperatureReading } from '@/src/schema';
import LogoutIcon from '@mui/icons-material/Logout';
import { signOut } from 'firebase/auth';
import { ChangeEvent, useEffect, useState } from 'react';
import { auth } from './firebase';
import HeatingBorder from './HeatingBorder';
import HeatingIcon from './HeatingOnIcon';
import TempGauge from './TempGauge';

interface DashboardProps {
    user: {
        uid: string;
        email: string | null;
    };
    onError: (msg: string) => void;
}

export default function Dashboard({ user, onError }: DashboardProps) {
    const [currentTemp, setCurrentTemp] = useState<TemperatureReading>();
    const [heating, setHeating] = useState<boolean>(false);
    const [tempTimeStamp, setTempTimeStamp] = useState<Date | null>(null);
    const [targetTemp, setTargetTemp] = useState<number>(0);
    const [saving, setSaving] = useState<boolean>(false);

    useEffect(() => {
        const tempStream = new EventSource("/api/temp/stream");

        const stateStream = new EventSource("/api/state/stream");

        tempStream.onmessage = (event) => {
            const data = JSON.parse(event.data) as TemperatureReading;
            setCurrentTemp(data);
            setTempTimeStamp(data?.timestamp ? new Date(Number(data.timestamp)) : null);
        };

        stateStream.onmessage = (event) => {
            const data = JSON.parse(event.data) as SystemState;
            setHeating(data?.heatingOn ? true : false);
            setTargetTemp(data?.targetTemp);
        };

        return () => {
            tempStream.close();
            stateStream.close();
        }
    }, []);

    useEffect(() => {
        if (targetTemp >= 10) {
            saveTarget(targetTemp);
        }
    }, [targetTemp]);


    const saveTarget = async (val: number) => {
        if (isNaN(val)) {
            onError('Invalid number');
            return;
        }
        setSaving(true);
        try {
            fetch('/api/state', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "targetTemp": val, "heatingOn": heating }),
            })

        } catch (e: unknown) {
            if (e instanceof Error) onError(e.message);
            else onError('Failed to save');
        }
        setSaving(false);
    };

    const saveHeatingUntil = async (val: number) => {
        if (isNaN(val)) {
            onError('Invalid number');
            return;
        }
        setSaving(true);
        try {
            //await set(ref(db, 'Home/HeatingUntil'), (Date.now() / 1000) + (val * 6));
            /*await set(ref(db, 'Home/lastSetBy'), {
                uid: user.uid,
                email: user.email,
                time: serverTimestamp(),
            });*/

        } catch (e: unknown) {
            if (e instanceof Error) onError(e.message);
            else onError('Failed to save');
        }
        setSaving(false);
    };

    const handleTargetChange = (e: ChangeEvent<HTMLInputElement>) => {
        setTargetTemp(Number(e));
    };

    const quickTemps = [18, 20, 21, 22, 24];

    return (
        <div className="min-h-screen min-w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
            <HeatingBorder isOn={heating} borderRadius={24}>
                <div className="p-3 md:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                                <HeatingIcon size={28} isOn={heating} />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-white">Temperature Monitor</h1>
                                <p className="text-gray-400 text-sm">Realtime data</p>
                            </div>
                            <button className="px-2 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-blue-400 font-medium transition-all" onClick={() => signOut(auth)}>
                                <LogoutIcon />
                            </button>
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {/* Current Temperature Card */}
                        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-3 border border-gray-700/50">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Current</span>
                                <div className="text-right">
                                    <p className="text-2xl font-mono text-white">{tempTimeStamp?.toLocaleTimeString('ro-RO', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}</p>
                                    <p className="text-gray-500 text-sm">{tempTimeStamp?.toLocaleDateString('ro-RO')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <HeatingIcon size={48} isOn={heating} />
                                <div className="text-5xl md:text-6xl font-light text-white">
                                    {currentTemp?.value?.toFixed(2)}
                                    <span className="text-3xl text-gray-400">°C</span>
                                </div>
                            </div>

                            {currentTemp ? <TempGauge temp={currentTemp?.value} target={targetTemp} isHeating={heating} /> : ''}

                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                <span>10°C</span>
                                <span>Target: {targetTemp}°C</span>
                                <span>30°C</span>
                            </div>

                            <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${heating ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                                <span className={`w-2 h-2 rounded-full ${heating ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`} />
                                {heating ? 'Heating...' : 'Target Reached'}
                            </div>
                        </div>

                        {/* Target Temperature Card */}
                        <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-3 border border-gray-700/50">
                            <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Set Target Temperature</span>

                            <div className="flex items-center justify-center gap-4 my-8">
                                <button onClick={() => setTargetTemp(Math.max(10, targetTemp - 0.5))}
                                    className="w-14 h-14 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-2xl font-light transition-all active:scale-95">
                                    −
                                </button>
                                <div className="w-32 text-center">
                                    <span className="text-5xl font-light text-white">{targetTemp}</span>
                                    <span className="text-2xl text-gray-400">°C</span>
                                </div>
                                <button onClick={() => setTargetTemp(Math.min(30, targetTemp + 0.5))}
                                    className="w-14 h-14 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-2xl font-light transition-all active:scale-95">
                                    +
                                </button>
                            </div>

                            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-98">
                                Save Target
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-3 bg-gray-800/50 backdrop-blur rounded-2xl p-3 border border-gray-700/50">
                        <span className="text-gray-400 text-sm font-medium uppercase tracking-wide">Quick Actions</span>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mt-4">
                            {quickTemps.map((t, i) => (
                                <button key={i} onClick={() => setTargetTemp(t)}
                                    className={`py-3 rounded-xl font-medium transition-all active:scale-95 ${targetTemp === t
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
                                        : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 border border-gray-600/50'}`}>
                                    {t}°C
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                        {[
                            { label: 'Avg Today', value: '21.4°C', color: 'text-blue-400' },
                            { label: 'Max Today', value: '23.2°C', color: 'text-red-400' },
                            { label: 'Min Today', value: '19.8°C', color: 'text-cyan-400' },
                            { label: 'Runtime', value: '4h 23m', color: 'text-orange-400' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30">
                                <p className="text-gray-500 text-xs uppercase tracking-wide">{stat.label}</p>
                                <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </HeatingBorder>
        </div>
    );
}