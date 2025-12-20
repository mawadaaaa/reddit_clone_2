'use client';

import { useState, useEffect } from 'react';
import { FaRobot } from 'react-icons/fa';

export default function AISummary({ content, title }) {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSummarize = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, title }),
            });
            const data = await res.json();
            setSummary(data.summary);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleSummarize();
    }, []);

    const hasContent = content && content.trim().length > 0;

    return (
        <div style={{ padding: '0 8px 8px 8px' }}>
            {loading && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaRobot className="spin" /> Summarizing...
                </div>
            )}

            {!loading && !summary && (
                <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
                    Unable to generate summary.
                </div>
            )}

            {summary && (
                <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    background: 'var(--color-surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    color: 'var(--color-text-main)'
                }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FaRobot /> AI Summary
                    </h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
                </div>
            )}
        </div>
    );
}
