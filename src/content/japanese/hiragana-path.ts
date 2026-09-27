export type HiraganaPathItem = Readonly<{
  id: string;
  title: string;
  symbol: string;
  description: string;
  kind: 'introduction' | 'group';
}>;

export const hiraganaPath: readonly HiraganaPathItem[] = [
  {
    id: 'introduction',
    title: 'Introducción',
    symbol: 'あ',
    description: 'Sonidos, trazos y lectura',
    kind: 'introduction',
  },
  {
    id: 'vowels',
    title: 'Vocales',
    symbol: 'あ',
    description: 'あ、い、う、え、お',
    kind: 'group',
  },
  {
    id: 'k-row',
    title: 'Fila K',
    symbol: 'か',
    description: 'か、き、く、け、こ',
    kind: 'group',
  },
  {
    id: 's-row',
    title: 'Fila S',
    symbol: 'さ',
    description: 'さ、し、す、せ、そ',
    kind: 'group',
  },
  {
    id: 't-row',
    title: 'Fila T',
    symbol: 'た',
    description: 'た、ち、つ、て、と',
    kind: 'group',
  },
  {
    id: 'n-row',
    title: 'Fila N',
    symbol: 'な',
    description: 'な、に、ぬ、ね、の',
    kind: 'group',
  },
  {
    id: 'h-row',
    title: 'Fila H',
    symbol: 'は',
    description: 'は、ひ、ふ、へ、ほ',
    kind: 'group',
  },
  {
    id: 'm-row',
    title: 'Fila M',
    symbol: 'ま',
    description: 'ま、み、む、め、も',
    kind: 'group',
  },
  {
    id: 'y-row',
    title: 'Fila Y',
    symbol: 'や',
    description: 'や、ゆ、よ',
    kind: 'group',
  },
  {
    id: 'r-row',
    title: 'Fila R',
    symbol: 'ら',
    description: 'ら、り、る、れ、ろ',
    kind: 'group',
  },
  {
    id: 'w-row',
    title: 'Fila W y ん',
    symbol: 'わ',
    description: 'わ、を、ん',
    kind: 'group',
  },
] as const;
