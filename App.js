// src/App.js
import React, { useState, useEffect } from 'react';
import { loadPSD, extractLayers } from './lib/psdLoader';
import ColorPicker from './components/ColorPicker';
import PresetSelector from './components/PresetSelector';
import ExportButtons from './components/ExportButtons';

function App() {
  const [psdData, setPsdData] = useState(null);
  const [character, setCharacter] = useState({
    ears: 'длинные',
    tail: 'длинный',
    colors: {
      ears: '#ff9999',
      tail: '#cc6666'
    }
  });
  const [loading, setLoading] = useState(true);

  // Загрузка PSD файла при монтировании
  useEffect(() => {
    async function loadCharacterPSD() {
      try {
        const psd = await loadPSD('/assets/character.psd');
        setPsdData(psd);
        setLoading(false);
      } catch (error) {
        console.error('Error loading PSD:', error);
        setLoading(false);
      }
    }
    loadCharacterPSD();
  }, []);

  const handlePresetChange = (part, preset) => {
    setCharacter(prev => ({
      ...prev,
      [part]: preset
    }));
  };

  const handleColorChange = (part, color) => {
    setCharacter(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [part]: color
      }
    }));
  };

  if (loading) return <div>Loading character data...</div>;
  if (!psdData) return <div>Failed to load character data</div>;

  return (
    <div className="character-editor">
      <h1>Character Editor</h1>
      
      <div className="editor-container">
        <div className="preview-area">
          {/* Здесь будет отображаться предпросмотр персонажа */}
          <CharacterPreview psdData={psdData} character={character} />
        </div>
        
        <div className="controls">
          <PresetSelector 
            part="ears"
            presets={['длинные', 'торчком пушистые']}
            current={character.ears}
            onChange={handlePresetChange}
          />
          
          <ColorPicker 
            part="ears"
            color={character.colors.ears}
            onChange={handleColorChange}
          />
          
          <PresetSelector 
            part="tail"
            presets={['длинный', 'короткий']}
            current={character.tail}
            onChange={handlePresetChange}
          />
          
          <ColorPicker 
            part="tail"
            color={character.colors.tail}
            onChange={handleColorChange}
          />
          
          <ExportButtons character={character} psdData={psdData} />
        </div>
      </div>
    </div>
  );
}

export default App;
