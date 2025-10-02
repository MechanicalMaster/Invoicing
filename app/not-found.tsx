import { Metadata } from 'next';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '404 - Page Not Found',
  robots: 'noindex',
};

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--gold-50))] to-[hsl(var(--gold-100))]">
      <div className="max-w-md w-full mx-auto px-6 text-center">
        {/* Animated 404 Number */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-9xl font-bold font-heading bg-gradient-to-br from-[hsl(var(--gold-500))] to-[hsl(var(--gold-600))] bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Main Heading */}
        <div className="mb-4 animate-slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <h2 className="text-3xl font-bold font-heading text-foreground mb-3">
            Page Not Found
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Please check the URL or return to the homepage.
          </p>
        </div>

        {/* CTA Button */}
        <div className="mt-8 animate-scale-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
          <Link href="/">
            <Button
              size="lg"
              className="bg-[hsl(var(--gold-600))] hover:bg-[hsl(var(--gold-500))] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Homepage
            </Button>
          </Link>
        </div>

        {/* Decorative Element */}
        <div className="mt-12 pt-8 border-t border-[hsl(var(--border))] animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <p className="text-sm text-muted-foreground">
            Need help? Contact support or check our documentation.
          </p>
        </div>
      </div>
    </div>
  );
}
