// src/lib/config.js
export const PARTS = {
  ears: {
    title: "Уши",
    enabled: true,
    variants: {
      'торчком обычные': {
        layers: ['Уши/торчком обычные/лайн']
      },
      'длинные': {
        layers: ['Уши/длинные/лайн']
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

// Обновим DEFAULT_CHARACTER для тестирования
export const DEFAULT_CHARACTER = {
  ears: 'торчком обычные',
  colors: {
    main: '#f1ece4'
  },
  partColors: {
    ears: '#a58a67' // Новый цвет по умолчанию
  }
};
