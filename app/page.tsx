'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/app-context';
import { Navbar } from '@/components/navbar';
import { PortfolioSections } from '@/components/portfolio-sections';
import { ChatWidget } from '@/components/chat-widget';
import { MatrixRain } from '@/components/matrix-rain';
import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VisualIdentityImage } from '@/components/visual-identity-image';

export default function Home() {
  const { t, dir, lang } = useLanguage();
  const [matrixActive, setMatrixActive] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <div dir={dir}>
      <Navbar />
      <PortfolioSections />
      <ChatWidget />
      <MatrixRain active={matrixActive} />

      {/* Matrix toggle button - appears in the inspector area */}
      <div className="fixed bottom-6 ltr:left-6 rtl:right-6 z-50">
        <Button
          variant={matrixActive ? 'brand' : 'pill'}
          size="pill"
          onClick={() => setMatrixActive(!matrixActive)}
          className="shadow-lg border border-gray-200/80 dark:border-border font-medium"
        >
          <Terminal className="h-3.5 w-3.5 mr-2" />
          {matrixActive ? t('matrix.deactivate') : t('matrix.activate')}
        </Button>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <VisualIdentityImage field="brand_mark_path" className="h-12 w-12 object-contain mx-auto mb-3" />
          <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
        </div>
      </footer>
    </div>
  );
}
