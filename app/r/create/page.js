'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from '@/app/login/Auth.module.css'; // Reuse auth styles for simplicity

export default function CreateCommunityPage() {
    const { data: session, status } = useSession();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
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
        try {
            const res = await fetch('/api/communities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
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
            <div className={styles.card}>
                <h1 className={styles.title}>Create a Community</h1>
                {error && <div className={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Name</label>
                        <input
                            type="text"
                            placeholder="r/"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={21}
                            required
                        />
                        <p style={{ fontSize: '12px', color: '#878A8C', marginTop: '-10px', marginBottom: '10px' }}>
                            Cannot be changed.
                        </p>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Description</label>
                        <textarea
                            className="input-field"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            maxLength={500}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Create Community
                    </button>
                </form>
            </div>
        </div>
    );
}
