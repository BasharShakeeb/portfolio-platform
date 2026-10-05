import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Safe timeout signal helper that works across all mobile browsers including iOS Safari */
export function safeTimeoutSignal(ms: number): AbortSignal | undefined {
  if (typeof AbortController !== 'undefined') {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        try {
          controller.abort();
        } catch {
          // Ignore abort errors
        }
      }, ms);
      if (typeof controller.signal.addEventListener === 'function') {
        controller.signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
      }
      return controller.signal;
    } catch {
      // Fallback
    }
  }
  return undefined;
}

/** Safe random UUID that falls back when crypto.randomUUID is not available (older iOS / non-secure contexts) */
export function safeRandomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Safe date formatting that prevents RangeError on iOS Safari */
export function safeFormatDate(dateStr: string | null | undefined, locale?: string): string {
  if (!dateStr) return '';
  try {
    const normalized = dateStr.includes(' ') && !dateStr.includes('T')
      ? dateStr.replace(' ', 'T')
      : dateStr;
    const d = new Date(normalized);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleString(locale);
  } catch {
    return String(dateStr);
  }
}

