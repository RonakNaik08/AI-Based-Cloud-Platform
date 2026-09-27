import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI CloudOps Manager | Intelligent Cloud Infrastructure Management Platform',
  description: 'Enterprise AI CloudOps Platform with Autonomous Monitoring, Multi-Cloud Fleet Management, Real-time Anomaly Detection, FinOps Cost Optimizer, and RAG-Grounded Copilot.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#070a12] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
