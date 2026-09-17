'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/app-context';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type ChatMessage = {
  role: 'bot' | 'user';
  text: string;
};

export function ChatWidget() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'bot', text: t('chat.welcome') }]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getBotResponse = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('cv') || lower.includes('resume') || lower.includes('سيرة')) {
      return t('chat.cvResponse');
    }
    if (lower.includes('email') || lower.includes('contact') || lower.includes('تواصل') || lower.includes('بريد')) {
      return t('chat.emailResponse');
    }
    if (lower.includes('project') || lower.includes('work') || lower.includes('مشروع') || lower.includes('عمل')) {
      return t('chat.projectsResponse');
    }
    return t('chat.defaultResponse');
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setSending(true);

    // If it looks like a contact message, save to DB
    if (userMsg.length > 20 && userMsg.includes('@')) {
      const { data: profileData } = await supabase.from('profiles').select('id').limit(1).maybeSingle();
      if (profileData) {
        await supabase.from('messages').insert({
          user_id: profileData.id,
          visitor_name: 'Chat Widget',
          visitor_email: userMsg,
          subject: 'Chat message',
          body: userMsg,
        });
      }
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'bot', text: getBotResponse(userMsg) }]);
      setSending(false);
    }, 600);
  };

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {open && (
        <div className="fixed bottom-6 ltr:right-6 rtl:left-6 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border bg-card shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-semibold text-sm">{t('chat.title')}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 min-h-[150px]">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-muted-foreground rounded-bl-sm'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-3 py-2 text-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('chat.placeholder')}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSend} disabled={sending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
