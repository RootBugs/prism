export function wordSplitting(text: string): string {
  return text.split(' ').map(word => {
    if (word.length > 4) {
      const mid = Math.floor(word.length / 2);
      return `${word.slice(0, mid)} ${word.slice(mid)}`;
    }
    return word;
  }).join(' ');
}

export function tokenBoundaryManipulation(text: string): string {
  return text.split('').map((char, i) => {
    if (i > 0 && i % 5 === 0 && char !== ' ') {
      return ' ' + char;
    }
    return char;
  }).join('');
}

export function selectiveSpacing(text: string, insertPositions: number[] = [3, 7, 12]): string {
  let result = '';
  let insertIndex = 0;
  
  for (let i = 0; i < text.length; i++) {
    if (insertIndex < insertPositions.length && i === insertPositions[insertIndex]) {
      result += ' ';
      insertIndex++;
    }
    result += text[i];
  }
  
  return result;
}

export function fragmentWords(text: string): string {
  const words = text.split(' ');
  
  return words.map(word => {
    if (word.length <= 3) return word;
    
    const fragments: string[] = [];
    for (let i = 0; i < word.length; i += 2) {
      fragments.push(word.slice(i, i + 2));
    }
    
    return fragments.join('-');
  }).join(' ');
}