const LEET_MAP: Record<string, string> = {
  'a': '4',
  'e': '3',
  'i': '1',
  'o': '0',
  's': '5',
  't': '7',
  'l': '1',
  'g': '9',
  'b': '8'
};

const SYMBOL_MAP: Record<string, string> = {
  'a': '@',
  'e': '3',
  'i': '!',
  'o': '0',
  's': '$',
  't': '+',
  'l': '|',
  'n': '~'
};

export function leetSubstitution(text: string): string {
  return text.split('').map(char => {
    const lower = char.toLowerCase();
    return LEET_MAP[lower] || char;
  }).join('');
}

export function symbolSubstitution(text: string): string {
  return text.split('').map(char => {
    const lower = char.toLowerCase();
    return SYMBOL_MAP[lower] || char;
  }).join('');
}

export function homoglyphSubstitution(text: string): string {
  const homoglyphs: Record<string, string> = {
    'a': 'ᵃ',
    'b': 'ᵇ',
    'c': 'ᶜ',
    'd': 'ᵈ',
    'e': 'ᵉ',
    'f': 'ᶠ',
    'g': 'ᵍ',
    'h': 'ʰ',
    'i': 'ⁱ',
    'j': 'ʲ',
    'k': 'ᵏ',
    'l': 'ˡ',
    'm': 'ᵐ',
    'n': 'ⁿ',
    'o': 'ᵒ',
    'p': 'ᵖ',
    'r': 'ʳ',
    's': 'ˢ',
    't': 'ᵗ',
    'u': 'ᵘ',
    'v': 'ᵛ',
    'w': 'ʷ',
    'x': 'ˣ',
    'y': 'ʸ',
    'z': 'ᶻ'
  };

  return text.split('').map(char => {
    return homoglyphs[char.toLowerCase()] || char;
  }).join('');
}

export function staggerCase(text: string): string {
  return text.split('').map((char, i) => {
    return i % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
  }).join('');
}