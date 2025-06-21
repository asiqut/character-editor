import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { CHARACTER_CONFIG, DEFAULT_CHARACTER } from './lib/characterConfig';
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
        console.log('Starting PSD load...');
        const data = await loadPSD();
        console.log('PSD loaded successfully:', data);
        setPsdData(data);
      } catch (err) {
        console.error('PSD load error:', err);
        setError(`Ошибка загрузки PSD: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Проверяем загрузку конфига
  useEffect(() => {
    console.log('CHARACTER_CONFIG loaded:', !!CHARACTER_CONFIG);
    if (CHARACTER_CONFIG && CHARACTER_CONFIG.parts) {
      console.log('Parts available:', Object.keys(CHARACTER_CONFIG.parts));
    }
  }, []);

  const handlePartChange = (part, value) => {
    setCharacter(prev => ({
      ...prev,
      [part]: part === 'eyes' ? { type: value, subtype: value === 'обычные' ? 'с ресницами' : null } : value
    }));
  };

  const handleSubtypeChange = (subtype) => {
    setCharacter(prev => ({
      ...prev,
      eyes: {
        ...prev.eyes,
        subtype
      }
    }));
  };

  const handleMainColorChange = (color) => {
    setCharacter(prev => {
      const updatedPartColors = {};
      CHARACTER_CONFIG.colors.main.affects.forEach(part => {
        updatedPartColors[part] = color;
      });
      return {
        ...prev,
        colors: { ...prev.colors, main: color },
        partColors: { ...prev.partColors, ...updatedPartColors }
      };
    });
  };

  const handlePartColorChange = (part, color) => {
    setCharacter(prev => ({
      ...prev,
      partColors: { ...prev.partColors, [part]: color }
    }));
  };

  const handleEyesWhiteChange = (color) => {
    setCharacter(prev => ({
      ...prev,
      colors: { ...prev.colors, eyesWhite: color }
    }));
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!psdData) return <div>Данные не загружены</div>;
  
  // Более безопасная проверка конфигурации
  if (!CHARACTER_CONFIG?.parts) {
    console.error('CHARACTER_CONFIG.parts is missing:', CHARACTER_CONFIG);
    return <div className="error"><h2>Ошибка конфигурации</h2><p>Не удалось загрузить настройки персонажа</p></div>;
  }

  const renderPartGroup = (partKey, partConfig) => {
    if (!partConfig || !partConfig.enabled) return null;

    const options = partConfig.isSingleVariant ? [] : Object.keys(partConfig.variants || {});
    const currentValue = partConfig.isSingleVariant ? null : character[partKey];
    
    return (
      <div key={partKey} className="part-group">
        <PartSelector
          title={partConfig.title}
          part={partKey}
          options={options}
          current={currentValue}
          onChange={handlePartChange}
          showSubtypes={partKey === 'eyes' && character.eyes?.type === 'обычные'}
          subtypes={partKey === 'eyes' ? Object.keys(CHARACTER_CONFIG.parts.eyes.variants['обычные'].subtypes || {}) : null}
          currentSubtype={partKey === 'eyes' ? character.eyes?.subtype : null}
          onSubtypeChange={handleSubtypeChange}
        />

        {!partConfig.isSingleVariant && (
          <>
            {partKey === 'eyes' && character.eyes?.type === 'обычные' && (
              <ColorPicker
                title="Белки глаз"
                color={character.colors.eyesWhite}
                onChange={handleEyesWhiteChange}
              />
            )}
            <ColorPicker
              title="Цвет"
              color={character.partColors[partKey]}
              onChange={(color) => handlePartColorChange(partKey, color)}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="character-editor">
      <h1>Редактор персонажа Kinwoods</h1>
      <div className="editor-container">
        <div className="preview-area">
          <CharacterPreview psdData={psdData} character={character} />
        </div>
        <div className="controls">
          {Object.keys(CHARACTER_CONFIG.parts).map(partKey => 
            renderPartGroup(partKey, CHARACTER_CONFIG.parts[partKey])
          )}
          <div className="part-group">
            <ColorPicker
              title="Основной цвет"
              color={character.colors.main}
              onChange={handleMainColorChange}
            />
          </div>
          <ExportButtons character={character} psdData={psdData} />
        </div>
      </div>
    </div>
  );
}

export default App;
