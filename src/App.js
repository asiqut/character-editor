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
      
      if (part === 'eyes') {
        if (subpart === 'type') {
          // Изменение типа глаз
          newChar.eyes = {
            type: value,
            subtype: value === 'обычные' ? 'с ресницами' : null
          };
        } else if (subpart === 'subtype') {
          // Изменение подтипа глаз
          newChar.eyes = {
            ...newChar.eyes,
            subtype: value
          };
        }
      } else {
        // Для остальных частей
        newChar[part] = value;
      }
      
      return newChar;
    });
  };

  const handleColorChange = (colorType, color) => {
    setCharacter(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: color
      }
    }));
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
            onChange={(value) => handlePartChange('ears', value)}
          />
          
<PartSelector
  title="Глаза"
  part="eyes"
  options={PARTS_STRUCTURE.eyes.types}
  current={character.eyes.type}
  onChange={(value) => {
    // При изменении типа глаз сбрасываем подтип, если нужно
    const subtype = value === 'обычные' ? 'с ресницами' : undefined;
    handlePartChange('eyes', { type: value, subtype });
  }}
  showSubtypes={character.eyes.type === 'обычные'}
  subtypes={PARTS_STRUCTURE.eyes.subtypes['обычные']}
  currentSubtype={character.eyes.subtype}
  onSubtypeChange={(value) => {
    // При изменении подтипа сохраняем текущий тип
    handlePartChange('eyes', { 
      type: character.eyes.type, 
      subtype: value 
    });
  }}
/>
          
          <PartSelector
            title="Грива"
            part="mane"
            options={PARTS_STRUCTURE.mane}
            current={character.mane}
            onChange={(value) => handlePartChange('mane', value)}
          />
          
          <PartSelector
            title="Тело"
            part="body"
            options={PARTS_STRUCTURE.body}
            current={character.body}
            onChange={(value) => handlePartChange('body', value)}
          />
          
          <PartSelector
            title="Хвост"
            part="tail"
            options={PARTS_STRUCTURE.tail}
            current={character.tail}
            onChange={(value) => handlePartChange('tail', value)}
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
