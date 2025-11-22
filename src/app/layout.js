import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SwiftFlow ERP - Manufacturing Management System',
  description: 'Comprehensive ERP solution for manufacturing companies',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <main className="flex-1 w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
