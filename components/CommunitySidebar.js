'use client';

import { FaBirthdayCake, FaUserFriends, FaCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function CommunitySidebar({ community }) {
    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ backgroundColor: '#FF4500', padding: '12px', color: 'white', fontWeight: 'bold' }}>
                About Community
            </div>
            <div style={{ padding: '12px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
                    {/* Placeholder for community avatar in sidebar if needed, usually just header has it */}
                    {/* <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#FF4500', marginRight: '10px' }}></div> */}
                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>r/{community.name}</span>
                </div>

                <p style={{ fontSize: '14px', lineHeight: '21px', marginBottom: '8px' }}>
                    {community.description || 'Welcome to this community!'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#7c7c7c', marginBottom: '16px' }}>
                    <FaBirthdayCake />
                    <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edeff1', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{community.members.length.toLocaleString()}</div>
                        <div style={{ fontSize: '12px', color: '#7c7c7c' }}>Members</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FaCircle size={8} color="#46D160" />
                            {Math.ceil(community.members.length * 0.1)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#7c7c7c' }}>Online</div>
                    </div>
                </div>

                <Link href={`/r/${community.name}/submit`} style={{ textDecoration: 'none' }}>
                    <button className="btn btn-primary" style={{ width: '100%', borderRadius: '20px', fontWeight: 'bold' }}>
                        Create Post
                    </button>
                </Link>
            </div>
        </div>
    );
}
