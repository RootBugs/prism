export function unicodeObfuscation(text: string): string {
  const confusables: Record<string, string> = {
    'a': 'а',
    'e': 'е',
    'o': 'о',
    'p': 'р',
    'c': 'с',
    'x': 'х',
    'y': 'у',
    'A': 'А',
    'B': 'В',
    'C': 'С',
    'E': 'Е',
    'H': 'Н',
    'K': 'К',
    'M': 'М',
    'O': 'О',
    'P': 'Р',
    'T': 'Т',
    'X': 'Х'
  };

  return text.split('').map(char => {
    return confusables[char] || char;
  }).join('');
}

export function zeroWidthInsertion(text: string, marker: string = '\u200B'): string {
  return text.split('').join(marker);
}

export function rtlOverride(text: string): string {
  return `\u202E${text}\u202C`;
}

export function combiningMarks(text: string): string {
  const combining = ['\u0300', '\u0301', '\u0302', '\u0303', '\u0304'];
  return text.split('').map((char, i) => {
    return char + (i % 2 === 0 ? combining[Math.floor(i / 2) % combining.length] : '');
  }).join('');
}