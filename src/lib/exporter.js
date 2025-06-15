import * as htmlToImage from 'html-to-image';
import * as PSD from 'ag-psd';

// Функция экспорта в PNG
export const exportPNG = async (canvas, character) => {
  try {
    // Конвертируем canvas в PNG
    const dataUrl = await htmlToImage.toPng(canvas);
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.download = `character_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('PNG export error:', error);
    alert('Ошибка при экспорте PNG: ' + error.message);
  }
};

// Функция экспорта в PSD
export const exportPSD = (psdData, character) => {
  try {
    // Создаем базовую структуру PSD
    const newPsd = {
      width: 800,
      height: 800,
      children: []
    };

    // Здесь должна быть ваша логика добавления слоев
    // на основе character и psdData
    
    // Генерируем и скачиваем PSD
    const psdBytes = PSD.writePsd(newPsd);
    const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `character_${Date.now()}.psd`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PSD export error:', error);
    alert('Ошибка при экспорте PSD: ' + error.message);
  }
};
