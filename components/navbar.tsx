'use client';

import { useState, useEffect } from 'react';
import { useLanguage, useColor, useAuth } from '@/contexts/app-context';
import { Moon, Sun, Languages, Menu, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { ColorPicker } from '@/components/color-picker';
import { cn } from '@/lib/utils';
import { VisualIdentityImage } from '@/components/visual-identity-image';

export function Navbar() {
  const { t, lang, setLang, dir } = useLanguage();
  const { resetColor } = useColor();
  const { session } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#projects', label: t('section.projects') },
    { href: '#awards', label: t('section.awards') },
    { href: '#certificates', label: t('section.certificates') },
    { href: '#research', label: t('section.research') },
    { href: '#contact', label: t('section.contact') },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-background/80 backdrop-blur-md border-b shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <VisualIdentityImage field="portfolio_logo_path" className="h-8 w-8 rounded-lg object-contain"
            fallback={<span className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm">P</span>} />
          <span className="hidden sm:inline">Portfolio</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            title={lang === 'en' ? 'العربية' : 'English'}
          >
            <Languages className="h-4 w-4" />
            <span className="ml-1 text-xs">{lang === 'en' ? 'AR' : 'EN'}</span>
          </Button>

          <ColorPicker />

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={t('theme.toggle')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {session ? (
            <Link href="/admin">
              <Button variant="ghost" size="icon" title={t('nav.dashboard')}>
                <Shield className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/admin/login">
              <Button variant="ghost" size="icon" title={t('nav.login')}>
                <Shield className="h-4 w-4" />
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-b bg-background">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
