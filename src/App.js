import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { DEFAULT_CHARACTER, PSD_CONFIG } from './lib/defaultConfig';
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
            part="ears"
            currentValue={character.ears}
            onChange={handlePartChange}
            character={character}
          />
          <ColorPicker
            title={PSD_CONFIG.groups.ears.interface_title + " цвет"}
            color={character.partColors.ears}
            onChange={(color) => handlePartColorChange('ears', color)}
          />
          </div>

          {/* Глаза */}
          <div className="part-group">
          <PartSelector
            part="eyes"
            currentValue={character.eyes.type}
            onChange={handlePartChange}
            currentSubtype={character.eyes.subtype}
            onSubtypeChange={handleSubtypeChange}
            character={character}
          />
          <ColorPicker
            title={PSD_CONFIG.groups.eyes.interface_title + " цвет"}
            color={character.partColors.eyes}
            onChange={(color) => handlePartColorChange('eyes', color)}
          />
          <ColorPicker
            title={"Цвет глаз"}
            color={character.partColors.eyesWhite}
            onChange={(color) => handlePartColorChange('eyesWhite', color)}
          />
          </div>

          {/* Щёки */}
          <div className="part-group">
            <PartSelector
              part="cheeks"
              currentValue={character.cheeks}
              onChange={handlePartChange}
              character={character}
            />
            <ColorPicker
              title={"Цвет белка глаз"}
              color={character.partColors.cheeks}
              onChange={(color) => handlePartColorChange('cheeks', color)}
            />
            </div>

            {/* Голова */}
            <div className="part-group">
            <PartSelector
              part="head"
              currentValue={character.head}
              onChange={handlePartChange}
              character={character}
            />
            <ColorPicker
              title={"Цвет головы"}
              color={character.partColors.head}
              onChange={(color) => handlePartColorChange('head', color)}
            />
            </div>

          {/* Грива */}
          <div className="part-group">
          <PartSelector
            part="mane"
            currentValue={character.mane}
            onChange={handlePartChange}
            character={character}
          />
          <ColorPicker
            title={"Цвет гривы"}
            color={character.partColors.mane}
            onChange={(color) => handlePartColorChange('mane', color)}
          />
          </div>

          {/* Тело */}
          <div className="part-group">
          <PartSelector
            part="body"
            currentValue={character.body}
            onChange={handlePartChange}
            character={character}
          />
          <ColorPicker
            title={"Цвет тела"}
            color={character.partColors.body}
            onChange={(color) => handlePartColorChange('body', color)}
          />
          </div>

          {/* Хвост */}
          <div className="part-group">
          <PartSelector
            part="tail"
            currentValue={character.tail}
            onChange={handlePartChange}
            character={character}
          />
          <ColorPicker
            title={"Цвет хвоста"}
            color={character.partColors.tail}
            onChange={(color) => handlePartColorChange('tail', color)}
          />
          </div>

          {/* Основные цвета */}
          <div className="part-group">
          <ColorPicker
            title={"Покрытие всего тела"}
            color={character.partColors.main}
            onChange={(color) => handlePartColorChange('main', color)}
          />

          <ExportButtons character={character} psdData={psdData} />
        </div>
      </div>
    </div>
  );
}

export default App;
