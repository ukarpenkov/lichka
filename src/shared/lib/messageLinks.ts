import { Linking } from 'react-native';

export type MessageTextSegment =
  | { type: 'text'; value: string }
  | { type: 'link'; value: string; href: string };

const URL_RE = /https?:\/\/[^\s<>"'`]+|www\.[^\s<>"'`]+/gi;

const TRAIL_PUNCT = new Set([
  '.',
  ',',
  ';',
  ':',
  '!',
  '?',
  '…',
  "'",
  '"',
  '»',
  '«',
  '“',
  '”',
  '‘',
  '’',
]);

const CLOSE_TO_OPEN: Record<string, string> = {
  ')': '(',
  ']': '[',
  '}': '{',
};

function bracketsBalanced(value: string, close: string): boolean {
  const open = CLOSE_TO_OPEN[close];
  if (!open) return true;
  let depth = 0;
  for (const ch of value) {
    if (ch === open) depth += 1;
    else if (ch === close) depth -= 1;
  }
  return depth === 0;
}

/** Strip trailing sentence punctuation; keep balanced `)` `]` `}`. */
export function splitUrlTrail(raw: string): { core: string; trail: string } {
  let core = raw;
  let trail = '';
  while (core.length > 0) {
    const ch = core[core.length - 1];
    if (TRAIL_PUNCT.has(ch)) {
      core = core.slice(0, -1);
      trail = ch + trail;
      continue;
    }
    if (CLOSE_TO_OPEN[ch] && !bracketsBalanced(core, ch)) {
      core = core.slice(0, -1);
      trail = ch + trail;
      continue;
    }
    break;
  }
  return { core, trail };
}

function isIpv4Host(host: string): boolean {
  return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host);
}

/**
 * Complete http(s) URL: real host, not `https://` / `www.` stubs.
 * `www.` matches are rewritten to https.
 */
export function toHttpHref(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^www\./i.test(trimmed) ? `https://${trimmed}` : trimmed;
  if (!/^https?:\/\//i.test(withScheme)) return null;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

  const host = parsed.hostname.replace(/\.+$/, '').toLowerCase();
  if (!host) return null;
  if (host === 'localhost' || isIpv4Host(host)) return parsed.href;
  if (host === 'www' || !host.includes('.')) return null;
  return parsed.href;
}

export function parseMessageLinks(text: string): MessageTextSegment[] {
  const segments: MessageTextSegment[] = [];
  const re = new RegExp(URL_RE.source, 'gi');
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    const { core } = splitUrlTrail(match[0]);
    const href = toHttpHref(core);
    if (!href) continue;
    const start = match.index;
    if (start < last) continue;
    if (start > last) {
      segments.push({ type: 'text', value: text.slice(last, start) });
    }
    segments.push({ type: 'link', value: core, href });
    last = start + core.length;
  }

  if (last < text.length) {
    segments.push({ type: 'text', value: text.slice(last) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}

export function hasMessageLinks(text: string): boolean {
  return parseMessageLinks(text).some((seg) => seg.type === 'link');
}

export async function openExternalUrl(href: string): Promise<void> {
  const safe = toHttpHref(href);
  if (!safe) {
    throw new Error('unsupported-url');
  }
  await Linking.openURL(safe);
}
