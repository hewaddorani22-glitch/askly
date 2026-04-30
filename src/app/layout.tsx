import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Askly — Ask without raising your hand.',
  description: 'Anonymous Q&A platform for lectures & presentations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
