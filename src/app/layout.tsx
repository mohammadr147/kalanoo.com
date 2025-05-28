import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a fallback, assuming Vazir/IranSans applied via CSS
import './globals.css';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';
import { AuthProvider } from '@/context/auth-context'; // Import AuthProvider

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'کالانو | KalaNow',
  description: 'فروشگاه اینترنتی کالانو',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <AuthProvider> {/* Wrap with AuthProvider */}
          <CartProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              {/* Main content might need padding-top if header becomes very tall */}
              <main className="flex-1 pt-4 pb-8">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}