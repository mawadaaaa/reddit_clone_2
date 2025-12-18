'use client';

import { FaBirthdayCake, FaUserFriends, FaCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function CommunitySidebar({ community }) {
    // Basic date formatting
    const createdAt = new Date(community.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return (
        <div className="card" style={{ padding: '12px', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
            <div style={{ padding: '0 0 12px 0' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontWeight: 'bold', fontSize: '16px' }}>{community.title || `r/${community.name}`}</h2>
                </div>

                <p style={{ fontSize: '14px', lineHeight: '21px', marginBottom: '16px', color: 'var(--color-text-dim)' }}>
                    {community.description || `r/${community.name} is a subreddit for...`}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-dim)', marginBottom: '16px' }}>
                    <FaBirthdayCake />
                    <span>Created {createdAt}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-dim)', marginBottom: '16px' }}>
                    <FaUserFriends />
                    <span>Public</span>
                </div>


                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{community.members.length.toLocaleString()}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>Members</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCircle size={8} color="#46D160" />
                            {Math.ceil(community.members.length * 0.12)}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>Online</div>
                    </div>
                </div>

                <Link href={`/r/${community.name}/submit`} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary" style={{ width: '100%', borderRadius: '999px', fontWeight: 'bold' }}>
                        Create Post
                    </button>
                </Link>
            </div>

            {/* Bookmarks Section (Mock) */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-dim)', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Community Bookmarks
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn" style={{ backgroundColor: '#272729', borderRadius: '20px', fontSize: '12px', padding: '8px 16px', fontWeight: '600' }}>
                        Discord server
                    </button>
                </div>
            </div>

            {/* Rules Section (Mock or real if added to model) */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-dim)', marginBottom: '12px', textTransform: 'uppercase' }}>
                    r/{community.name} Rules
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {community.rules && community.rules.length > 0 ? community.rules.map((rule, idx) => (
                        <div key={idx} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: '14px', fontWeight: '500' }}>
                            {idx + 1}. {rule.title}
                        </div>
                    )) : (
                        <div style={{ fontSize: '14px', color: 'var(--color-text-dim)' }}>
                            1. No dooxing
                            <br />
                            2. No brigading or inciting harassment
                            <br />
                            3. Be civil
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
