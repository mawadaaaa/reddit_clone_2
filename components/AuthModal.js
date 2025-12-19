'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import styles from './AuthModal.module.css';
import { FaReddit, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AuthModal({ isOpen, onClose }) {
    const [login, setLogin] = useState(''); // Email or Username for Login
    const [email, setEmail] = useState(''); // Email for Signup
    const [username, setUsername] = useState(''); // Username for Signup
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);

    if (!isOpen) return null;

    const validate = () => {
        if (isLogin) {
            if (login.length < 3) return 'Username/Email must be at least 3 characters';
            if (password.length < 6) return 'Password must be at least 6 characters';
        } else {
            if (username.length < 4 || username.length > 20) return 'Username must be 4-20 characters';
            if (!/^[a-zA-Z]/.test(username)) return 'Username must start with a letter';
            if (!email.includes('@')) return 'Invalid email address';
            if (password.length < 6) return 'Password must be at least 6 characters';
            if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) return 'Password must contain both letters and numbers';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            if (isLogin) {
                const res = await signIn('credentials', {
                    username: login,
                    password,
                    redirect: false,
                });

                if (res?.error) {
                    setError('Invalid credentials');
                } else if (res?.ok) {
                    onClose();
                    window.location.reload();
                }
            } else {
                // Perform Signup Request
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || 'Signup failed');
                } else {
                    // Auto login after signup or switch to login mode?
                    // Let's auto login for better UX
                    const loginRes = await signIn('credentials', {
                        username,
                        password,
                        redirect: false,
                    });
                    if (loginRes?.ok) {
                        onClose();
                        window.location.reload();
                    } else {
                        // Fallback if auto-login fails
                        setIsLogin(true);
                        setLogin(username);
                        setError('Account created! Please log in.');
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setError('Something went wrong');
        }
    };

    const switchMode = (mode) => {
        setIsLogin(mode);
        setError('');
        setLogin('');
        setEmail('');
        setUsername('');
        setPassword('');
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                <div className={styles.header}>
                    <FaReddit size={40} color="#FF4500" />
                    <h2>
                        {isLogin ? 'Log In' : 'Sign Up'}
                    </h2>
                    <p style={{ maxWidth: '300px', margin: '0 auto' }}>
                        By continuing, you start your journey on our Reddit Clone.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '8px' }}>{error}</div>}

                    <>
                        {isLogin ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Email or username"
                                    className={styles.input}
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className={styles.input}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className={styles.input}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </>
                        )}

                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                className={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ width: '100%' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-dim)',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                        </div>

                        <button type="submit" className={styles.submitBtn + ' ' + styles.orangeBtn}>
                            {isLogin ? 'Log In' : 'Sign Up'}
                        </button>
                    </>
                </form>

                <div className={styles.footer}>
                    {isLogin ? (
                        <p>New to Reddit? <button className={styles.linkBtn} onClick={() => switchMode(false)}>Sign Up</button></p>
                    ) : (
                        <p>Already a redditor? <button className={styles.linkBtn} onClick={() => switchMode(true)}>Log In</button></p>
                    )}
                </div>
            </div>
        </div>
    );
}
