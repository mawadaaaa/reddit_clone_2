import { IBM_Plex_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import Navbar from '@/components/Navbar';
import LeftSidebar from '@/components/LeftSidebar';

const font = IBM_Plex_Sans({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Reddit Clone',
  description: 'A clone of Reddit built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <Providers>
          <Navbar />
          <div className="main-content">
            <LeftSidebar />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
