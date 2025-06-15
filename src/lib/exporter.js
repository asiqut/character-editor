import * as PSD from 'ag-psd';

export function exportPSD(psdData, character) {
  try {
    // Создаем новый PSD документ
    const newPsd = {
      width: 800,
      height: 800,
      children: []
    };

    // Здесь должна быть логика добавления слоев
    // на основе character и psdData
    
    // Генерируем PSD файл
    const psdBytes = PSD.writePsd(newPsd);
    const blob = new Blob([psdBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    // Создаем ссылку для скачивания
    const a = document.createElement('a');
    a.href = url;
    a.download = `character_${Date.now()}.psd`;
    a.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('PSD export error:', error);
    alert('Ошибка при экспорте PSD: ' + error.message);
  }
}
