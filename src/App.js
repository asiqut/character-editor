import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader'; // Убрали extractLayers
import { DEFAULT_CHARACTER, PARTS_STRUCTURE } from './lib/defaultConfig';
import CharacterPreview from './components/CharacterPreview';
import PartSelector from './components/PartSelector';
import ColorPicker from './components/ColorPicker';
import ExportButtons from './components/ExportButtons';
import './styles/main.css';

function App() {
  const [psdData, setPsdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadCharacterPSD() {
      try {
        const psd = await loadPSD();
        setPsdData(psd);
        setError(null);
      } catch (err) {
        console.error('PSD load error:', err);
        setError(`Ошибка загрузки: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadCharacterPSD();
  }, []);

  if (loading) return <div>Загрузка персонажа...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!psdData) return <div>Не удалось загрузить данные</div>;

  const handlePartChange = (part, value, subpart = null) => {
    setCharacter(prev => {
      if (subpart) {
        return {
          ...prev,
          [part]: {
            ...prev[part],
            [subpart]: value
          }
        };
      }
      return {
        ...prev,
        [part]: value
      };
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

  if (loading) return <div>Загрузка данных персонажа...</div>;
  if (!psdData) return <div>Ошибка загрузки PSD файла</div>;

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
