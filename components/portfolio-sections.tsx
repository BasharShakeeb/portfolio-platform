'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/app-context';
import { supabase, type Item, type Profile, type Message, type ContactSettings } from '@/lib/supabase';
import { monthNames } from '@/lib/i18n';
import { Search, Calendar, Tag, ExternalLink, ArrowRight, Send, Mail, MapPin, Phone, Github, Linkedin, Twitter, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { CVExport } from '@/components/cv-export';
import { useProfile } from '@/contexts/app-context';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { VisualIdentityImage } from '@/components/visual-identity-image';

const CATEGORIES = ['projects', 'awards', 'certificates', 'research', 'other'] as const;

export function PortfolioSections() {
  const { t, lang, dir } = useLanguage();
  const { profile, loading: profileLoading } = useProfile();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);

  useEffect(() => {
    loadItems();
    loadContactSettings();
  }, []);

  const loadContactSettings = useCallback(async () => {
    const { data } = await supabase.from('contact_settings').select('*').limit(1).maybeSingle();
    if (data) setContactSettings(data as ContactSettings);
  }, []);

  const loadItems = useCallback(async () => {
    const { data } = await supabase.from('items').select('*').order('sort_order', { ascending: true });
    setItems((data as Item[]) || []);
    setLoading(false);
  }, []);

  const years = useMemo(() => {
    const set = new Set<number>();
    items.forEach((i) => { if (i.year) set.add(i.year); });
    return Array.from(set).sort((a, b) => b - a);
  }, [items]);

  const days = useMemo(() => {
    const set = new Set<number>();
    items.forEach((i) => { if (i.day) set.add(i.day); });
    return Array.from(set).sort((a, b) => a - b);
  }, [items]);

  const filtered = useMemo(() => {
    let result = [...items];

    if (activeCategory !== 'all') {
      result = result.filter((i) => i.category === activeCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (yearFilter !== 'all') result = result.filter((i) => i.year === parseInt(yearFilter));
    if (monthFilter !== 'all') result = result.filter((i) => i.month === parseInt(monthFilter));
    if (dayFilter !== 'all') result = result.filter((i) => i.day === parseInt(dayFilter));

    if (sortBy === 'newest') result.sort((a, b) => (b.year || 0) - (a.year || 0));
    else if (sortBy === 'oldest') result.sort((a, b) => (a.year || 9999) - (b.year || 9999));
    else if (sortBy === 'title') result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [items, activeCategory, search, yearFilter, monthFilter, dayFilter, sortBy]);

  const clearFilters = () => {
    setYearFilter('all');
    setMonthFilter('all');
    setDayFilter('all');
    setSearch('');
    setActiveCategory('all');
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setSending(true);

    const { data: profileData } = await supabase.from('profiles').select('id').limit(1).maybeSingle();

    if (profileData) {
      const { error } = await supabase.from('messages').insert({
        user_id: profileData.id,
        visitor_name: contactForm.name,
        visitor_email: contactForm.email,
        subject: contactForm.subject,
        body: contactForm.message,
      });

      if (error) {
        toast.error(t('admin.error'));
      } else {
        toast.success(t('contact.sent'));
        setContactForm({ name: '', email: '', subject: '', message: '' });
      }
    }
    setSending(false);
  };

  const formatDate = (item: Item) => {
    const parts: string[] = [];
    if (item.year) parts.push(String(item.year));
    if (item.month) parts.push(monthNames[lang][item.month - 1] || '');
    if (item.day) parts.push(String(item.day));
    return parts.join(' - ');
  };

  const socialIcons: Record<string, typeof Github> = {
    github: Github,
    linkedin: Linkedin,
    twitter: Twitter,
  };

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden border-b">
        <VisualIdentityImage field="hero_background_path" decorative className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-20 text-center relative z-10">
          {profileLoading ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              <Skeleton className="h-32 w-32 rounded-2xl mx-auto" />
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
              <div className="flex gap-3 justify-center pt-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          ) : (
            <>
              {profile?.avatar_url && (
                <div className="mx-auto mb-6 max-w-[200px]">
                  <div className="rounded-2xl overflow-hidden border-4 border-primary/20 shadow-lg bg-muted/30">
                    <img
                      src={profile.avatar_url}
                      alt={profile.site_name}
                      className="w-full h-auto block"
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text">
                {profile?.site_name || 'My Portfolio'}
              </h1>
              {profile?.bio && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                  {profile.bio}
                </p>
              )}
              <div className="flex flex-wrap gap-3 justify-center">
                <a href="#projects">
                  <Button size="lg">
                    {t('hero.viewWork')}
                    <ArrowRight className="ml-2 h-4 w-4 rtl:rotate-180" />
                  </Button>
                </a>
                <a href="#contact">
                  <Button variant="outline" size="lg">
                    {t('hero.contact')}
                  </Button>
                </a>
                <CVExport profile={profile} items={items} />
              </div>

              {/* Social links */}
              {profile?.social_links && Object.keys(profile.social_links).length > 0 && (
                <div className="flex gap-3 justify-center mt-8">
                  {Object.entries(profile.social_links).map(([key, url]) => {
                    const Icon = socialIcons[key.toLowerCase()] || ExternalLink;
                    return (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Icon className="h-5 w-5" />
                        </Button>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Dynamic contact buttons from contact_settings */}
              {contactSettings && (
                <div className="flex flex-wrap gap-3 justify-center mt-6">
                  {contactSettings.phone_visible && contactSettings.phone && (
                    <a
                      href={`https://wa.me/${contactSettings.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </Button>
                    </a>
                  )}
                  {contactSettings.phone_visible && contactSettings.phone && (
                    <a href={`tel:${contactSettings.phone}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Phone className="h-4 w-4" />
                        Call
                      </Button>
                    </a>
                  )}
                  {contactSettings.email_visible && contactSettings.email && (
                    <a href={`mailto:${contactSettings.email}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                    </a>
                  )}
                  {contactSettings.github_visible && contactSettings.github && (
                    <a href={contactSettings.github} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Github className="h-4 w-4" />
                        GitHub
                      </Button>
                    </a>
                  )}
                  {contactSettings.linkedin_visible && contactSettings.linkedin && (
                    <a href={contactSettings.linkedin} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </Button>
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Search & Filters */}
      <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b py-4">
        <div className="container mx-auto px-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('search.placeholder')}
                className="ltr:pl-10 rtl:pr-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('sort.newest')}</SelectItem>
                  <SelectItem value="oldest">{t('sort.oldest')}</SelectItem>
                  <SelectItem value="title">{t('sort.title')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder={t('filter.year')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter.all')}</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={monthFilter} onValueChange={setMonthFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder={t('filter.month')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter.all')}</SelectItem>
                  {monthNames[lang].map((m, i) => (
                    <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dayFilter} onValueChange={setDayFilter}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder={t('filter.day')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('filter.all')}</SelectItem>
                  {days.map((d) => (
                    <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t('filter.clear')}
              </Button>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              {t('section.all')}
              <Badge variant="secondary" className="ml-2">{items.length}</Badge>
            </Button>
            {CATEGORIES.map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              return (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                >
                  {t(`section.${cat}` as any)}
                  {count > 0 && <Badge variant="secondary" className="ml-2">{count}</Badge>}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Items grid */}
      <section className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">{t('common.noData')}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} {t('search.results')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                  {item.image_url && (
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {t(`section.${item.category}` as any) || item.category}
                        </Badge>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {item.title}
                        </CardTitle>
                      </div>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {formatDate(item) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item)}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {item.description && (
                      <CardDescription className="line-clamp-3 mb-3">
                        {item.description}
                      </CardDescription>
                    )}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-2.5 w-2.5 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Contact section */}
      <section id="contact" className="container mx-auto px-4 py-20 border-t">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">{t('section.contact')}</h2>
          <p className="text-center text-muted-foreground mb-8">{t('hero.contact')}</p>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleContact} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('contact.name')}</label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t('contact.email')}</label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('contact.subject')}</label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">{t('contact.message')}</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <Button type="submit" disabled={sending} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? t('common.loading') : t('contact.send')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
