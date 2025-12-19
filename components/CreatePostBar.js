'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AuthModal from './AuthModal';
import { FaReddit } from 'react-icons/fa';

export default function CreatePostBar() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleCreatePost = () => {
        if (!session) {
            setIsAuthModalOpen(true);
        } else {
            // Default to 'general' or redirect to a community selection page if implemented
            // For now, let's link to a popular one or the first one they follow?
            // Or maybe just /r/general/submit if that community exists, or just /r/news/submit?
            // Let's try to find a generic route or just pick one.
            router.push('/submit');
        }
    };

    return (
        <>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', marginBottom: '16px' }}>
                {session?.user?.image ? (
                    <img src={session.user.image} alt="User Avatar" style={{ width: 38, height: 38, borderRadius: '50%' }} />
                ) : (
                    <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: '#D7DADC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FaReddit size={24} color="white" />
                    </div>
                )}

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
