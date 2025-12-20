import Link from 'next/link';
import dbConnect from '@/lib/db';
import Community from '@/models/Community';

export const dynamic = 'force-dynamic';

async function getAllCommunities() {
    await dbConnect();
    const communities = await Community.find({});
    return JSON.parse(JSON.stringify(communities));
}

export default async function ExplorePage() {
    const communities = await getAllCommunities();

    return (
        <div className="page-layout" style={{ marginTop: '20px' }}>
            <div style={{ width: '100%' }}>
                <h1 style={{ marginBottom: '20px', fontSize: '24px' }}>Explore Communities</h1>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                    {communities.map(community => (
                        <Link key={community._id} href={`/r/${community.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {community.icon ? (
                                        <img src={community.icon} alt={community.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <img src="/default-subreddit.png" alt={community.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                                    )}
                                    <h2 style={{ fontSize: '18px', margin: 0 }}>r/{community.name}</h2>
                                </div>
                                <p style={{ fontSize: '14px', color: '#878A8C', flex: 1 }}>{community.description || 'No description'}</p>
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                    {community.members?.length || 0} members
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
