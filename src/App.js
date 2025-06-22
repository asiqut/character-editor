// src/App.js
import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { CHARACTER_CONFIG, DEFAULT_CHARACTER } from './lib/characterConfig'; 
import CharacterPreview from './components/CharacterPreview';
import PartSelector from './components/PartSelector';
import './styles/main.css';

function App() {
  const [psdData, setPsdData] = useState(null);
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [loading, setLoading] = useState(true);

  const handlePartChange = (part, value) => {
    setCharacter(prev => ({
      ...prev,
      [part]: value
    }));
  };

useEffect(() => {
  async function load() {
    try {
      console.log('Starting PSD load...');
      const data = await loadPSD();
      console.log('PSD loaded successfully:', data);
      
      // Проверяем наличие необходимых данных
      if (!data['Уши']) {
        console.error('Missing "Уши" group in PSD');
        throw new Error('PSD structure is missing required parts');
      }
      
      setPsdData(data);
    } catch (err) {
      console.error('Full PSD load error:', err);
      setError(`Ошибка загрузки: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);

  if (loading) return <div>Загрузка...</div>;
  if (!psdData) return <div>Данные не загружены</div>;

  return (
    <div className="character-editor">
      <h1>Редактор персонажа Kinwoods</h1>
      <div className="editor-container">
        <div className="preview-area">
          <CharacterPreview psdData={psdData} character={character} />
        </div>
        <div className="controls">
          <PartSelector
            title={PARTS.ears.title}
            options={PARTS.ears.variants}
            current={character.ears}
            onChange={(value) => handlePartChange('ears', value)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
