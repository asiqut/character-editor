import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { DEFAULT_CHARACTER, PARTS_STRUCTURE } from './lib/defaultConfig';
import CharacterPreview from './components/CharacterPreview';
import PartSelector from './components/PartSelector';
import ColorPicker from './components/ColorPicker';
import ExportButtons from './components/ExportButtons';
import './styles/main.css';

function App() {
  const [psdData, setPsdData] = useState(null);
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadPSD();
        setPsdData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handlePartChange = (part, value, subpart = null) => {
    setCharacter(prev => {
      const newChar = {...prev};
      if (subpart) {
        if (!newChar[part]) newChar[part] = {};
        newChar[part][subpart] = value;
      } else {
        newChar[part] = value;
        // Сбрасываем подтип при смене типа глаз
        if (part === 'eyes') {
          newChar.eyes.subtype = value === 'обычные' ? 'с ресницами' : '';
        }
      }
      return newChar;
    });
  };

  const handleColorChange = (colorType, color) => {
  setCharacter(prev => {
    const newColors = {
      ...prev.colors,
      [colorType]: color
    };
    
    // При изменении основного цвета сбрасываем все части к базовому цвету
    if (colorType === 'main') {
      return {
        ...prev,
        colors: newColors
      };
    }
    
    // При изменении цвета белков оставляем как есть
    return {
      ...prev,
      colors: newColors
    };
  });
};

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!psdData) return <div>Данные не загружены</div>;

  return (
    <div className="character-editor">
      <h1>Редактор персонажа</h1>
      
      <div className="editor-container">
        <CharacterPreview psdData={psdData} character={character} />
        
        <div className="controls">
          <PartSelector
            title="Уши"
            part="ears"
            options={PARTS_STRUCTURE.ears}
            current={character.ears}
            onChange={handlePartChange}
          />
          
          <PartSelector
            title="Глаза"
            part="eyes"
            options={PARTS_STRUCTURE.eyes.types}
            current={character.eyes.type}
            onChange={(value) => handlePartChange('eyes', value, 'type')}
            showSubtypes={character.eyes.type === 'обычные'}
            subtypes={PARTS_STRUCTURE.eyes.subtypes['обычные']}
            currentSubtype={character.eyes.subtype}
            onSubtypeChange={(value) => handlePartChange('eyes', value, 'subtype')}
          />
          
          <PartSelector
            title="Грива"
            part="mane"
            options={PARTS_STRUCTURE.mane}
            current={character.mane}
            onChange={handlePartChange}
          />
          
          <PartSelector
            title="Тело"
            part="body"
            options={PARTS_STRUCTURE.body}
            current={character.body}
            onChange={handlePartChange}
          />
          
          <PartSelector
            title="Хвост"
            part="tail"
            options={PARTS_STRUCTURE.tail}
            current={character.tail}
            onChange={handlePartChange}
          />
          
          <ColorPicker
            title="Основной цвет"
            color={character.colors.main}
            onChange={(color) => handleColorChange('main', color)}
          />
          
          <ColorPicker
            title="Цвет белков глаз"
            color={character.colors.eyesWhite}
            onChange={(color) => handleColorChange('eyesWhite', color)}
          />
          
          <ExportButtons character={character} psdData={psdData} />
        </div>
      </div>
    </div>
  );
}

export default App;
