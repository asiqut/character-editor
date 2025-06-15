export const DEFAULT_CHARACTER = {
  ears: 'торчком обычные',
  eyes: {
    type: 'обычные',
    subtype: 'с ресницами'
  },
  cheeks: 'пушистые',
  head: 'default',
  mane: 'обычная',
  body: 'v1',
  tail: 'обычный',
  colors: {
    main: '#f1ece4',
    eyesWhite: '#ffffff'
  }
};

export const PARTS_STRUCTURE = {
  ears: ['длинные', 'торчком пушистые', 'торчком обычные', 'повисшие'],
  eyes: {
    types: ['лисьи', 'обычные'],
    subtypes: {
      'обычные': ['с ресницами', 'без ресниц']
    }
  },
  mane: ['пышная', 'обычная', 'короткошерстная'],
  body: ['v3', 'v2', 'v1'],
  tail: ['длинный тонкий', 'куцый', 'пышный', 'обычный']
};
