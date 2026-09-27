'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, ImageIcon, MessageSquare, Settings, Shield, Terminal, User } from 'lucide-react';
import { useLanguage } from '@/contexts/app-context';
import { cn } from '@/lib/utils';

export type SettingsSection = 'profile' | 'visual-identity' | 'contact' | 'security' | 'advanced';

const sections = [
  { id: 'profile', icon: User, en: 'Profile & Site Settings', ar: 'إعدادات الملف الشخصي والموقع' },
  { id: 'visual-identity', icon: ImageIcon, en: 'Visual Identity', ar: 'الهوية البصرية' },
  { id: 'contact', icon: MessageSquare, en: 'Contact & Requests Settings', ar: 'إعدادات التواصل والطلبات' },
  { id: 'security', icon: Shield, en: 'Security & Password', ar: 'الأمان وكلمة المرور' },
  { id: 'advanced', icon: Terminal, en: 'Advanced Settings', ar: 'الإعدادات المتقدمة' },
] as const;

export function SettingsNavigation({ active, section, onSelect }: {
  active: boolean;
  section: SettingsSection;
  onSelect: (section: SettingsSection) => void;
}) {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); };
  const close = () => { clearTimer(); setOpen(false); };

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <div ref={root} className="relative"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse' && window.matchMedia('(min-width: 768px) and (hover: hover)').matches) {
          clearTimer(); setOpen(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse' || !window.matchMedia('(min-width: 768px)').matches) return;
        if (root.current?.contains(document.activeElement) && document.activeElement !== trigger.current) return;
        clearTimer(); timer.current = setTimeout(() => setOpen(false), 180);
      }}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close(); }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { event.preventDefault(); trigger.current?.focus(); close(); }
      }}>
      <button ref={trigger} type="button" aria-expanded={open} aria-controls="admin-settings-submenu"
        onClick={() => { clearTimer(); setOpen((value) => !value); }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault(); clearTimer(); setOpen(true);
            requestAnimationFrame(() => root.current?.querySelector<HTMLButtonElement>('[data-settings-item]')?.focus());
          }
        }}
        className={cn('flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-start text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#10B981]',
          active ? 'bg-[#10B981] text-white shadow-sm font-semibold' : 'text-[#A7ADB4] hover:text-[#F5F7F8] hover:bg-[#25292D]')}>
        <Settings className="h-5 w-5 shrink-0 stroke-[1.8]" aria-hidden="true" />
        <span className="flex-1">{t('admin.settings')}</span>
        <ChevronRight className="hidden h-4 w-4 md:block rtl:rotate-180 opacity-70" aria-hidden="true" />
        <ChevronDown className={cn('h-4 w-4 md:hidden transition-transform motion-reduce:transition-none opacity-70', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {/* Padding bridges the flyout gap; leaving it starts a short close delay. */}
      <div id="admin-settings-submenu" aria-hidden={!open}
        className={cn('md:absolute md:top-0 md:z-[60] md:w-72 md:ltr:left-full md:rtl:right-full md:ltr:pl-1 md:rtl:pr-1 transition-[opacity,transform] duration-150 motion-reduce:transition-none',
          open ? 'visible mt-2 opacity-100 md:mt-0 translate-y-0' : 'invisible hidden pointer-events-none opacity-0 md:block md:translate-y-1')}>
        <div className="rounded-2xl border border-[#343A40] bg-[#25292D] p-2 shadow-2xl">
          <ul aria-label={t('admin.settings')} className="space-y-1">
            {sections.map((item) => (
              <li key={item.id}>
                <button type="button" data-settings-item tabIndex={open ? 0 : -1}
                  aria-current={active && section === item.id ? 'page' : undefined}
                  onClick={() => { onSelect(item.id); trigger.current?.focus(); close(); }}
                  className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#10B981]',
                    active && section === item.id ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold' : 'text-[#A7ADB4] hover:bg-[#2B3035] hover:text-[#F5F7F8]')}>
                  <item.icon className="h-4 w-4 shrink-0 stroke-[1.8]" aria-hidden="true" />
                  <span>{item[lang]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
