'use client';

import { SessionProvider } from 'next-auth/react';
import { UIProvider } from '@/context/UIContext';
import { VoteProvider } from '@/context/VoteContext';

export function Providers({ children }) {
    return (
        <SessionProvider>
            <VoteProvider>
                <UIProvider>
                    {children}
                </UIProvider>
            </VoteProvider>
        </SessionProvider>
    );
}
