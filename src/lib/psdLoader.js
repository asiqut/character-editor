import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`Failed to fetch PSD: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      preserveLayerPositions: true // Сохраняем позиции слоев
    });
    
    if (!psd || !psd.children) throw new Error('Invalid PSD structure');
    
    // Нормализация данных
    psd.children.forEach(group => {
      if (group.children) {
        group.children.forEach(layer => {
          // Убедимся, что позиции есть
          layer.left = layer.left || 0;
          layer.top = layer.top || 0;
        });
      }
    });
    
    return psd;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
