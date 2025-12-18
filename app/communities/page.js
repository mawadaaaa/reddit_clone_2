'use client';

import { useState, useEffect } from 'react';
import { FaReddit, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const res = await fetch('/api/communities');
        if (res.ok) {
          const data = await res.json();
          setCommunities(data);
        }
      } catch (error) {
        console.error('Failed to fetch communities', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCommunities();
  }, []);

  if (loading) return <div style={{ padding: 24, textAlign: 'center' }}>Loading communities...</div>;

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Top Communities</h1>
          <p style={{ color: 'var(--color-text-dim)', fontSize: '14px' }}>Browse Reddit's growing communities.</p>
        </div>
        <Link href="/r/create">
          <button className="btn btn-primary">Create Community</button>
        </Link>
      </div>

      <div style={{ background: 'var(--color-surface)', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
        {communities.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-dim)' }}>
            No communities found. Be the first to create one!
          </div>
        ) : (
          communities.map((community, index) => (
            <div
              key={community._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                borderBottom: index < communities.length - 1 ? '1px solid var(--color-border)' : 'none',
                gap: '16px'
              }}
            >
              <span style={{ width: '24px', textAlign: 'center', fontWeight: '500', color: 'var(--color-text-main)' }}>
                {index + 1}
              </span>

              <div style={{ width: '16px' }}>
                <span style={{ color: '#46D160', fontSize: '12px' }}>▲</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: community.themeColor || '#0079D3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  overflow: 'hidden'
                }}>
                  {community.icon ? <img src={community.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaReddit size={20} />}
                </div>
                <div>
                  <Link
                    href={`/r/${community.name}`}
                    style={{ fontWeight: '500', color: 'var(--color-text-main)', textDecoration: 'none', display: 'block' }}
                  >
                    r/{community.name}
                  </Link>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
                    {community.members ? community.members.length : 0} members
                  </span>
                </div>
              </div>

              <Link href={`/r/${community.name}`}>
                <button className="btn btn-primary" style={{ padding: '4px 16px', fontSize: '14px' }}>
                  View
                </button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
