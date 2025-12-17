'use client';

import { SessionProvider } from 'next-auth/react';
import { UIProvider } from '@/context/UIContext';

export function Providers({ children }) {
    return (
        <SessionProvider>
            <UIProvider>
                {children}
            </UIProvider>
        </SessionProvider>
    );
}
