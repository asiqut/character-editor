import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`Failed to fetch PSD: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      preserveLayerPositions: true
    });
    
    if (!psd || !psd.children) throw new Error('Invalid PSD structure');
    
    // Преобразуем структуру PSD в удобный формат
    const processedData = {};
    
    psd.children.forEach(group => {
      if (!group.name || !group.children) return;
      
      // Исправляем названия групп согласно структуре PSD
      let groupName;
      switch(group.name) {
        case 'Грудь/шея/грива': groupName = 'mane'; break;
        case 'Уши': groupName = 'ears'; break;
        case 'Глаза': groupName = 'eyes'; break;
        case 'Щёки': groupName = 'cheeks'; break;
        case 'Голова': groupName = 'head'; break;
        case 'Тело': groupName = 'body'; break;
        case 'Хвосты': groupName = 'tail'; break;
        default: return;
      }
      
      processedData[groupName] = {};
      
      group.children.forEach(variant => {
        if (!variant.name || !variant.children) return;
        
        processedData[groupName][variant.name] = variant.children.map(layer => ({
          name: layer.name,
          canvas: layer.canvas,
          left: layer.left || 0,
          top: layer.top || 0,
          blendMode: layer.blendMode,
          clipping: layer.clipping // Сохраняем информацию о клиппинге
        }));
      });
    });
    
    return processedData;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
