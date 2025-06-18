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

  const handlePartChange = (part, value, isSubtype = false) => {
    setCharacter(prev => {
      const newChar = {...prev};
      
      if (part === 'eyes') {
        if (isSubtype) {
          newChar.eyes = {
            ...prev.eyes,
            subtype: value
          };
        } else {
          newChar.eyes = {
            type: value,
            subtype: value === 'обычные' ? 'с ресницами' : null
          };
        }
      } else {
        newChar[part] = value;
      }
      
      return newChar;
    });
  };

  const handleSubtypeChange = (part, subtype) => {
    if (part !== 'eyes') return;
    
    setCharacter(prev => ({
      ...prev,
      eyes: {
        ...prev.eyes,
        subtype: subtype
      }
    }));
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

  const handlePartColorChange = (part, color) => {
    setCharacter(prev => ({
      ...prev,
      partColors: {
        ...prev.partColors,
        [part]: color
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
        <div className="preview-area">
          <CharacterPreview psdData={psdData} character={character} />
        </div>
        
        <div className="controls">
          {/* Уши */}
          <div className="part-group">
            <PartSelector
              title="Уши"
              part="ears"
              options={PARTS_STRUCTURE.ears}
              current={character.ears}
              onChange={(part, value) => handlePartChange(part, value)}
            />
            <ColorPicker
              title="Цвет"
              color={character.partColors.ears}
              onChange={(color) => handlePartColorChange('ears', color)}
            />
          </div>

          {/* Глаза */}
          <div className="part-group">
            <PartSelector
              title="Глаза"
              part="eyes"
              options={PARTS_STRUCTURE.eyes.types}
              current={character.eyes.type}
              onChange={handlePartChange}
              showSubtypes={character.eyes.type === 'обычные'}
              subtypes={PARTS_STRUCTURE.eyes.subtypes['обычные']}
              currentSubtype={character.eyes.subtype}
              onSubtypeChange={handleSubtypeChange}
            />
            <ColorPicker
              title="Цвет"
              color={character.partColors.eyes}
              onChange={(color) => handlePartColorChange('eyes', color)}
            />
          </div>

          {/* Щёки */}
          <div className="part-group">
            <PartSelector
              title="Щёки"
              part="cheeks"
              options={PARTS_STRUCTURE.cheeks}
              current={character.cheeks}
              onChange={(part, value) => handlePartChange(part, value)}
            />
            {character.cheeks !== 'нет' && (
              <ColorPicker
                title="Цвет"
                color={character.partColors.cheeks}
                onChange={(color) => handlePartColorChange('cheeks', color)}
              />
          </div>

          {/* Грива */}
          <div className="part-group">
            <PartSelector
              title="Грива"
              part="mane"
              options={PARTS_STRUCTURE.mane}
              current={character.mane}
              onChange={(part, value) => handlePartChange(part, value)}
            />
            <ColorPicker
              title="Цвет"
              color={character.partColors.mane}
              onChange={(color) => handlePartColorChange('mane', color)}
            />
          </div>

          {/* Тело */}
          <div className="part-group">
            <PartSelector
              title="Тело"
              part="body"
              options={PARTS_STRUCTURE.body}
              current={character.body}
              onChange={(part, value) => handlePartChange(part, value)}
            />
            <ColorPicker
              title="Цвет"
              color={character.partColors.body}
              onChange={(color) => handlePartColorChange('body', color)}
            />
          </div>

          {/* Хвост */}
          <div className="part-group">
            <PartSelector
              title="Хвост"
              part="tail"
              options={PARTS_STRUCTURE.tail}
              current={character.tail}
              onChange={(part, value) => handlePartChange(part, value)}
            />
            <ColorPicker
              title="Цвет"
              color={character.partColors.tail}
              onChange={(color) => handlePartColorChange('tail', color)}
            />
          </div>

          {/* Основные цвета */}
          <div className="part-group">
            <ColorPicker
              title="Основной цвет"
              color={character.colors.main}
              onChange={(color) => {
                handleColorChange('main', color);
                setCharacter(prev => ({
                  ...prev,
                  partColors: {
                    ears: color,
                    cheeks: color,
                    mane: color,
                    body: color,
                    tail: color,
                    head: color
                  }
                }));
              }}
            />
                
            <ColorPicker
              title="Белки глаз"
              color={character.colors.eyesWhite}
              onChange={(color) => handleColorChange('eyesWhite', color)}
            />
                
          </div>

          <ExportButtons character={character} psdData={psdData} />
        </div>
      </div>
    </div>
  );
}

export default App;
