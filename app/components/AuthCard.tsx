import React, { useState, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { auth } from './firebase';
import {
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { Button, Stack, TextField, Typography } from '@mui/material';


interface AuthCardProps {
    onError: (msg: string) => void;
}

export default function AuthCard({ onError }: AuthCardProps) {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (e: unknown) {
            if (e instanceof Error) onError(e.message);
            else onError('Authentication error');
        }
    };

    const handleInput = (
        setter: (value: string) => void,
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setter(e.target.value);


    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6"
        >
            <Typography variant="h4">
                {'Welcome back'}
            </Typography>


            <Stack direction={"column"} gap={2}>
                <TextField
                    value={email}
                    onChange={(e) => handleInput(setEmail, e)}
                    className="w-full rounded-xl border p-3 text-sm"
                    placeholder="Email"
                    type="email"
                />


                <TextField
                    value={password}
                    onChange={(e) => handleInput(setPassword, e)}
                    className="w-full rounded-xl border p-3 text-sm"
                    placeholder="Password"
                    type="password"
                />


                <Button
                    onClick={handleLogin}
                    className="w-full rounded-xl py-3 text-sm font-semibold shadow-sm bg-indigo-600 text-white"
                >
                    {'Sign in'}
                </Button>
            </Stack>
        </motion.div>
    );
}