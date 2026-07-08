const encoder = new TextEncoder();

async function hash(data: string): Promise<string> {
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function fingerprintPrompt(prompt: string): Promise<string> {
  return hash(prompt);
}

export async function fingerprintConversation(messages: { role: string; content: string }[]): Promise<string> {
  const normalized = messages.map(m => `${m.role}:${m.content}`).join('|');
  return hash(normalized);
}

export function truncateHash(h: string, length: number = 12): string {
  return h.slice(0, length);
}

export function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateSessionId(): string {
  return `ses_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}