'use client';

import { useState } from 'react';
import { FaRobot } from 'react-icons/fa';

export default function AISummary({ content }) {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSummarize = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ai/summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            setSummary(data.summary);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '0 8px 8px 8px' }}>
            {!summary && (
                <button
                    onClick={handleSummarize}
                    disabled={loading}
                    className="btn btn-outline"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                >
                    <FaRobot /> {loading ? 'Summarizing...' : 'Summarize with AI'}
                </button>
            )}

            {summary && (
                <div style={{
                    marginTop: '10px',
                    padding: '12px',
                    background: '#f0f0f5',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    fontSize: '14px'
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
