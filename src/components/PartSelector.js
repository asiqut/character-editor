// src/hooks/useCharacterParts.js
import { useState } from 'react';
import { DEFAULT_CHARACTER } from '../lib/defaultConfig';

export function useCharacterParts(initialState = DEFAULT_CHARACTER) {
  const [character, setCharacter] = useState(initialState);

  const handlePartChange = (part, value, isSubtype = false) => {
    setCharacter(prev => {
      if (part === 'eyes') {
        return {
          ...prev,
          eyes: isSubtype 
            ? { ...prev.eyes, subtype: value }
            : { type: value, subtype: value === 'обычные' ? 'с ресницами' : null }
        };
      }
      return { ...prev, [part]: value };
    });
  };

  const handleColorChange = (type, color) => {
    setCharacter(prev => ({
      ...prev,
      colors: { ...prev.colors, [type]: color }
    }));
  };

  const handlePartColorChange = (part, color) => {
    setCharacter(prev => ({
      ...prev,
      partColors: { ...prev.partColors, [part]: color }
    }));
  };

  return {
    character,
    handlePartChange,
    handleColorChange,
    handlePartColorChange,
    resetCharacter: () => setCharacter(DEFAULT_CHARACTER)
  };
}
