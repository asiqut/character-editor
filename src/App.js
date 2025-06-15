import React, { useState, useEffect } from 'react';
import { loadPSD } from './lib/psdLoader';
import CharacterPreview from './components/CharacterPreview';
import './styles/main.css';

function App() {
  const [psdData, setPsdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
  async function load() {
    try {
      const data = await loadPSD();
      
      // Проверка структуры
      if (!data.children.some(c => c.name === 'Уши')) {
        console.error('Invalid PSD structure: Уши not found');
      }
      // Добавьте проверки для других обязательных групп
      
      setPsdData(data);
    } catch (err) {
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
        <CharacterPreview psdData={psdData} character={{}} />
      </div>
    </div>
  );
}

export default App;
