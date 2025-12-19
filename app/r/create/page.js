'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './CreateCommunity.module.css';

export default function CreateCommunityPage() {
    const { data: session, status } = useSession();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('');
    const [banner, setBanner] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') return <div>Loading...</div>;
    if (!session) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return;

        try {
            const res = await fetch('/api/communities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, icon, banner }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message);
                return;
            }

            router.push(`/r/${data.name}`);
        } catch (err) {
            setError('Something went wrong');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.header}>
                    <h1 className={styles.pageTitle}>Create a Community</h1>
                    <div className={styles.subTitle}>
                        Build a new home for your community.
                    </div>
                </div>

                <div className={styles.card}>
                    {error && <div className={styles.error}>{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Name</label>
                            <div className={styles.helperText}>
                                Community names including capitalization cannot be changed.
                            </div>
                            <div className={styles.inputRow}>
                                <span className={styles.inputPrefix}>r/</span>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={21}
                                    required
                                />
                                <span style={{ fontSize: '12px', color: '#878A8C' }}>{21 - name.length}</span>
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Description</label>
                            <div className={styles.helperText}>
                                This is how new members come to understand your community.
                            </div>
                            <textarea
                                className={styles.textarea}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                maxLength={500}
                                placeholder="Tell us about your community"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Community Icon (Optional)</label>
                            <div className={styles.inputRow}>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    value={icon}
                                    onChange={(e) => setIcon(e.target.value)}
                                    placeholder="https://example.com/icon.png"
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Banner Image (Optional)</label>
                            <div className={styles.inputRow}>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    value={banner}
                                    onChange={(e) => setBanner(e.target.value)}
                                    placeholder="https://example.com/banner.png"
                                />
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={`${styles.btn} ${styles.cancelBtn}`}
                                onClick={() => router.back()}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`${styles.btn} ${styles.submitBtn} ${name ? styles.active : ''}`}
                                disabled={!name}
                            >
                                Create Community
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
