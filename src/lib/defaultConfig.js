export const DEFAULT_CHARACTER = {
  ears: 'торчком обычные',
  eyes: {
    type: 'обычные',
    subtype: 'с ресницами'
  },
  cheeks: 'пушистые',
  mane: 'обычная',
  body: 'v1',
  tail: 'обычный',
  head: 'default',
  colors: {
    main: '#f1ece4',
    eyesWhite: '#ffffff'
  },
  partColors: {
    ears: '#f1ece4',
    cheeks: '#f1ece4',
    mane: '#f1ece4',
    body: '#f1ece4',
    tail: '#f1ece4',
    head: '#f1ece4'
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
  cheeks: ['пушистые', 'нет'],
  mane: ['пышная', 'обычная', 'короткошерстная'],
  body: ['v3', 'v2', 'v1'],
  tail: ['длинный тонкий', 'куцый', 'пышный', 'обычный']
};
