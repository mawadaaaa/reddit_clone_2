'use client';

import { useState, useRef } from 'react';
import { FaChevronRight } from 'react-icons/fa';

export default function ExploreFilters() {
    const [active, setActive] = useState('All');
    const scrollRef = useRef(null);

    const categories = [
        'All', 'Most Visited', 'Internet Culture', 'Games', 'Q&As & Stories',
        'Movies & TV', 'Technology', 'Pop Culture', 'Places & Travel',
        'Sports', 'Business & Finance', 'Education', 'Art', 'Music'
    ];

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    return (
        <div style={{ position: 'relative', marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    paddingBottom: '5px',
                    scrollbarWidth: 'none',
                    marginRight: '40px'
                }}
            >
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActive(cat)}
                        style={{
                            background: active === cat ? 'var(--color-text-main)' : 'var(--color-button-secondary-bg)',
                            color: active === cat ? 'var(--color-surface)' : 'var(--color-text-main)',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '999px',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.2s'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Scroll Button */}
            <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(to right, transparent, var(--color-background) 20%)',
                paddingLeft: '20px'
            }}>
                <button
                    onClick={scrollRight}
                    style={{
                        background: 'var(--color-button-secondary-bg)',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-text-main)'
                    }}
                >
                    <FaChevronRight size={12} />
                </button>
            </div>

            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
