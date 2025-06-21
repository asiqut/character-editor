// src/App.js
import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { PARTS, COLORS, DEFAULT_CHARACTER } from './lib/config';
import CharacterPreview from './components/CharacterPreview';
import './styles/main.css';

function App() {
  const [psdData, setPsdData] = useState(null);
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await loadPSD();
        setPsdData(data);
      } catch (err) {
        console.error('PSD load error:', err);
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
          <pre>{JSON.stringify(PARTS, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}

export default App;
