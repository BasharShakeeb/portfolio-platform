'use client';

import { useState, useEffect } from 'react';
import { useAuth, useLanguage, useProfile } from '@/contexts/app-context';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { supabase, type Item, type Message } from '@/lib/supabase';
import { LayoutDashboard, FolderKanban, Mail, Settings, LogOut, Home, Sun, Moon, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ItemsManager } from '@/components/admin/items-manager';
import { MessagesManager } from '@/components/admin/messages-manager';
import { SettingsManager } from '@/components/admin/settings-manager';
import { SettingsNavigation, type SettingsSection } from '@/components/admin/settings-navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'items' | 'messages' | 'settings';

export default function AdminDashboard() {
  const { session, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const { theme, setTheme } = useTheme();
  const { t, lang, setLang, dir } = useLanguage();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('profile');
  const [stats, setStats] = useState({ items: 0, messages: 0, unread: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !session) router.push('/admin/login');
  }, [session, loading, router]);

  useEffect(() => {
    if (!session) return;
    (async () => {
      const [itemsRes, messagesRes] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
      ]);
      const unreadRes = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('status', 'unread');
      setStats({
        items: itemsRes.count || 0,
        messages: messagesRes.count || 0,
        unread: unreadRes.count || 0,
      });
    })();
  }, [session, tab]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!session) return null;

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: t('admin.dashboard'), icon: LayoutDashboard },
    { id: 'items', label: t('admin.items'), icon: FolderKanban },
    { id: 'messages', label: t('admin.messages'), icon: Mail },
    { id: 'settings', label: t('admin.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30" dir={dir}>
      {/* Top bar */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">{t('admin.dashboard')}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="gap-1.5 h-9 px-2.5 text-xs font-medium"
              title={lang === 'en' ? 'التحويل إلى العربية' : 'Switch to English'}
            >
              <Languages className="h-4 w-4 text-primary" />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </Button>

            {/* Theme Toggle */}
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

            {/* Admin Profile Info */}
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-accent/50 border">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.site_name || 'Admin'}
                  className="h-7 w-7 rounded-full object-cover border"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {session?.user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              <span className="text-xs font-medium text-muted-foreground hidden md:inline max-w-[140px] truncate">
                {session?.user?.email}
              </span>
            </div>

            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
                <span className="hidden sm:inline">{t('nav.home')}</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-destructive hover:text-destructive">
              <LogOut className="h-4 w-4 ltr:mr-1.5 rtl:ml-1.5" />
              <span className="hidden sm:inline">{t('nav.logout')}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <nav aria-label={t('admin.dashboard')} className="flex flex-col gap-1 overflow-visible">
              {tabs.map((tabItem) => tabItem.id === 'settings' ? (
                <SettingsNavigation key={tabItem.id} active={tab === 'settings'} section={settingsSection}
                  onSelect={(section) => { setSettingsSection(section); setTab('settings'); }} />
              ) : (
                <button
                  key={tabItem.id}
                  onClick={() => setTab(tabItem.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                    tab === tabItem.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <tabItem.icon className="h-4 w-4" />
                  {tabItem.label}
                  {tabItem.id === 'messages' && stats.unread > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {stats.unread}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {tab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">{t('admin.dashboard')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <FolderKanban className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.items}</p>
                          <p className="text-sm text-muted-foreground">{t('admin.totalItems')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.messages}</p>
                          <p className="text-sm text-muted-foreground">{t('admin.totalMessages')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                          <Mail className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats.unread}</p>
                          <p className="text-sm text-muted-foreground">{t('admin.unreadMessages')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-4">
                      Welcome to your dashboard. Use the sidebar to manage your portfolio items, messages, and settings.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Button onClick={() => setTab('items')}>
                        <FolderKanban className="h-4 w-4 mr-2" />
                        {t('admin.items')}
                      </Button>
                      <Button variant="outline" onClick={() => setTab('messages')}>
                        <Mail className="h-4 w-4 mr-2" />
                        {t('admin.messages')}
                      </Button>
                      <Button variant="outline" onClick={() => setTab('settings')}>
                        <Settings className="h-4 w-4 mr-2" />
                        {t('admin.settings')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === 'items' && <ItemsManager />}
            {tab === 'messages' && <MessagesManager />}
            {tab === 'settings' && <SettingsManager section={settingsSection} />}
          </main>
        </div>
      </div>
    </div>
  );
}
