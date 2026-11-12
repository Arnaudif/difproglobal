export type View =
  | { name: 'home' }
  | { name: 'explore'; q?: string; cat?: string }
  | { name: 'service'; id: string }
  | { name: 'quote'; service?: string }
  | { name: 'requests' }
  | { name: 'alerts' }
  | { name: 'profile' }
  | { name: 'about' }
  | { name: 'contact' }
  | { name: 'faq' }
  | { name: 'terms' }
  | { name: 'privacy' }
  | { name: 'opportunities' }
  | { name: 'admin' };

export type Nav = { go: (v: View) => void; back: () => void };
