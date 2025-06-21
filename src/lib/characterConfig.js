// src/lib/config.js
export const PARTS = {
  ears: {
    title: "Уши",
    enabled: true,
    variants: {
      'торчком обычные': {
        layers: ['Уши/торчком обычные/лайн']
      }
    }
  }
};

export const COLORS = {
  main: {
    default: '#f1ece4',
    affects: ['ears']
  }
};

export const DEFAULT_CHARACTER = {
  ears: 'торчком обычные',
  colors: {
    main: '#f1ece4'
  },
  partColors: {
    ears: '#f1ece4'
  }
};
