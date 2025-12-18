'use client';

import { FaReddit, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';

export default function CommunitiesPage() {
  // Mock data for ranked communities
  const rankedCommunities = [
    { rank: 1, name: 'r/AskReddit', members: '43M', change: 'up' },
    { rank: 2, name: 'r/funny', members: '56M', change: 'same' },
    { rank: 3, name: 'r/worldnews', members: '34M', change: 'down' },
    { rank: 4, name: 'r/gaming', members: '39M', change: 'up' },
    { rank: 5, name: 'r/aww', members: '36M', change: 'same' },
    { rank: 6, name: 'r/videos', members: '27M', change: 'up' },
    { rank: 7, name: 'r/todayilearned', members: '35M', change: 'down' },
    { rank: 8, name: 'r/movies', members: '32M', change: 'same' },
    { rank: 9, name: 'r/science', members: '31M', change: 'up' },
    { rank: 10, name: 'r/pics', members: '30M', change: 'down' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Today's Top Growing Communities</h1>
        <p style={{ color: 'var(--color-text-dim)', fontSize: '14px' }}>Browse Reddit's top growing communities. Find the top communities in your favorite category.</p>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
        {rankedCommunities.map((community, index) => (
          <div
            key={community.rank}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px',
              borderBottom: index < rankedCommunities.length - 1 ? '1px solid var(--color-border)' : 'none',
              gap: '16px'
            }}
          >
            <span style={{ width: '24px', textAlign: 'center', fontWeight: '500', color: 'var(--color-text-main)' }}>
              {community.rank}
            </span>

            <div style={{ width: '16px' }}>
              {community.change === 'up' && <span style={{ color: '#46D160', fontSize: '12px' }}>▲</span>}
              {community.change === 'down' && <span style={{ color: '#FF4500', fontSize: '12px' }}>▼</span>}
              {community.change === 'same' && <span style={{ color: 'var(--color-text-dim)', fontSize: '16px' }}>-</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0079D3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <FaReddit size={20} />
              </div>
              <div>
                <Link
                  href={`/${community.name.replace('r/', 'r/')}`}
                  style={{ fontWeight: '500', color: 'var(--color-text-main)', textDecoration: 'none', display: 'block' }}
                >
                  {community.name}
                </Link>
                <span style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>{community.members} members</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ padding: '4px 16px', fontSize: '14px' }}>
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
