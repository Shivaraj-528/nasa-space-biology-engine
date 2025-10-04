import './globals.css';
import NavBar from '@/components/NavBar';
import { Providers } from './providers';

export const metadata = {
  title: 'Space Biology Knowledge Engine',
  description: 'Explore space biology publications, knowledge graphs, and AI assistance.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <NavBar />
          <main className="container py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
