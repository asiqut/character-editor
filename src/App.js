import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import { DEFAULT_CHARACTER } from './lib/defaultConfig';
import CharacterPreview from './components/CharacterPreview';
import './styles/main.css';

function App() {
  const [psdData, setPsdData] = useState(null);
  const [character] = useState(DEFAULT_CHARACTER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        console.log('Starting PSD load...');
        const data = await loadPSD();
        console.log('PSD loaded successfully', data);
        setPsdData(data);
      } catch (err) {
        console.error('Error loading PSD:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Загрузка PSD файла...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="character-editor">
      <h1>Тест отображения персонажа</h1>
      <div className="editor-container">
        <CharacterPreview psdData={psdData} character={character} />
      </div>
    </div>
  );
}

export default App;
