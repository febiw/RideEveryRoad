import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Ride Every Road',
  description: 'View all your Strava activities on one map',
  icons: { icon: '/rer.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-[960px] mx-auto w-full px-4">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
