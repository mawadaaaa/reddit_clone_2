'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';
import { FaReddit } from 'react-icons/fa';

export default function CreatePostBar() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const [userImage, setUserImage] = useState(session?.user?.image || null);

    // Fetch user image if session has user but image is missing (stripped base64)
    useEffect(() => {
        if (session?.user?.username) {
            fetch(`/api/u/${session.user.username}`)
                .then(res => res.json())
                .then(data => {
                    if (data.image) setUserImage(data.image);
                })
                .catch(err => console.error(err));
        }
    }, [session]);


    const handleCreatePost = () => {
        if (!session) {
            setIsAuthModalOpen(true);
        } else {
            router.push('/submit');
        }
    };

    return (
        <>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', marginBottom: '16px' }}>
                <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    overflow: 'hidden', // Ensure image stays round
                    background: '#ccc',
                    flexShrink: 0
                }}>
                    <img
                        src={userImage || '/default-subreddit.png'}
                        alt="User"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                <input
                    type="text"
                    className="input-field"
                    placeholder="Create Post"
                    style={{ marginBottom: 0, border: '1px solid var(--color-border)', flex: 1, cursor: 'text' }}
                    onClick={handleCreatePost}
                    readOnly // Prevent typing here, force navigation
                    suppressHydrationWarning
                />
            </div>
        </>
    );
}
