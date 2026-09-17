'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage, useAuth } from '@/contexts/app-context';
import { supabase, type Message } from '@/lib/supabase';
import { Mail, Reply, Trash2, Send, MailOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function MessagesManager() {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMsg, setReplyMsg] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState('all');

  const loadMessages = useCallback(async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    setMessages((data as Message[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const openReply = (msg: Message) => {
    setReplyMsg(msg);
    setReplyText(msg.reply || '');
    setReplyOpen(true);
    if (msg.status === 'unread') {
      supabase.from('messages').update({ status: 'read' }).eq('id', msg.id).then(() => loadMessages());
    }
  };

  const handleReply = async () => {
    if (!replyMsg) return;
    const { error } = await supabase
      .from('messages')
      .update({ reply: replyText, status: 'replied', replied_at: new Date().toISOString() })
      .eq('id', replyMsg.id);

    if (error) toast.error(t('admin.error'));
    else {
      toast.success(t('admin.saved'));
      setReplyOpen(false);
      loadMessages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) toast.error(t('admin.error'));
    else {
      toast.success(t('admin.saved'));
      loadMessages();
    }
  };

  const filtered = filter === 'all' ? messages : messages.filter((m) => m.status === filter);
  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  const statusIcon = (status: string) => {
    if (status === 'unread') return <Mail className="h-4 w-4 text-blue-500" />;
    if (status === 'read') return <MailOpen className="h-4 w-4 text-amber-500" />;
    return <Check className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          {t('section.all')} ({messages.length})
        </Button>
        <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>
          {t('admin.unread')} ({unreadCount})
        </Button>
        <Button variant={filter === 'replied' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('replied')}>
          {t('admin.replied')}
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{t('common.loading')}</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">{t('common.noData')}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <Card key={msg.id} className={cn(msg.status === 'unread' && 'border-primary/30 bg-primary/5')}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {statusIcon(msg.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold">{msg.visitor_name}</span>
                        <span className="text-sm text-muted-foreground">{msg.visitor_email}</span>
                        <Badge variant={msg.status === 'unread' ? 'default' : 'secondary'} className="text-xs">
                          {t(`admin.${msg.status}` as any)}
                        </Badge>
                      </div>
                      {msg.subject && <p className="text-sm font-medium mb-1">{msg.subject}</p>}
                      <p className="text-sm text-muted-foreground line-clamp-2">{msg.body}</p>
                      {msg.reply && (
                        <div className="mt-2 p-2 rounded-md bg-muted text-sm">
                          <span className="font-medium text-xs">{t('admin.reply')}: </span>
                          {msg.reply}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Button variant="outline" size="sm" onClick={() => openReply(msg)}>
                      <Reply className="h-3.5 w-3.5 mr-1" />
                      {t('admin.reply')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(msg.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.reply')}</DialogTitle>
          </DialogHeader>
          {replyMsg && (
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-muted text-sm">
                <p className="font-medium">{replyMsg.visitor_name} ({replyMsg.visitor_email})</p>
                {replyMsg.subject && <p className="font-medium mt-1">{replyMsg.subject}</p>}
                <p className="mt-1 text-muted-foreground">{replyMsg.body}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('admin.reply')}</label>
                <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyOpen(false)}>
              {t('admin.cancel')}
            </Button>
            <Button onClick={handleReply}>
              <Send className="h-4 w-4 mr-2" />
              {t('admin.reply')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
