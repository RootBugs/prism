import { unicodeObfuscation, zeroWidthInsertion, rtlOverride, combiningMarks } from './unicode';
import { leetSubstitution, symbolSubstitution, homoglyphSubstitution, staggerCase } from './substitution';
import { wordSplitting, tokenBoundaryManipulation, selectiveSpacing, fragmentWords } from './token-splitting';

type ObfuscationTechnique = (text: string) => string;

interface Technique {
  name: string;
  fn: ObfuscationTechnique;
  intensity: number;
}

const techniques: Technique[] = [
  { name: 'unicode', fn: unicodeObfuscation, intensity: 1 },
  { name: 'zeroWidth', fn: zeroWidthInsertion, intensity: 1 },
  { name: 'rtl', fn: rtlOverride, intensity: 2 },
  { name: 'combining', fn: combiningMarks, intensity: 2 },
  { name: 'leet', fn: leetSubstitution, intensity: 1 },
  { name: 'symbol', fn: symbolSubstitution, intensity: 1 },
  { name: 'homoglyph', fn: homoglyphSubstitution, intensity: 2 },
  { name: 'stagger', fn: staggerCase, intensity: 1 },
  { name: 'wordSplit', fn: wordSplitting, intensity: 1 },
  { name: 'tokenBoundary', fn: tokenBoundaryManipulation, intensity: 2 },
  { name: 'spacing', fn: selectiveSpacing, intensity: 1 },
  { name: 'fragment', fn: fragmentWords, intensity: 2 }
];

export class ObfuscationEngine {
  private selectedTechniques: Technique[];

  constructor(techniqueNames?: string[]) {
    if (techniqueNames && techniqueNames.length > 0) {
      this.selectedTechniques = techniques.filter(t => 
        techniqueNames.includes(t.name)
      );
    } else {
      this.selectedTechniques = techniques.slice(0, 3);
    }
  }

  obfuscate(text: string, level: number = 1): string {
    let result = text;
    
    const applicableTechniques = this.selectedTechniques.filter(
      t => t.intensity <= level
    );

    for (const technique of applicableTechniques) {
      result = technique.fn(result);
    }

    return result;
  }

  getTechniques(): string[] {
    return techniques.map(t => t.name);
  }
}