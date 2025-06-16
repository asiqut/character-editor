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
      
      processedData[group.name] = {};
      
      group.children.forEach(variant => {
        if (!variant.name || !variant.children) return;
        
        processedData[group.name][variant.name] = variant.children.map(layer => ({
          name: layer.name,
          canvas: layer.canvas,
          left: layer.left || 0,
          top: layer.top || 0,
          blendMode: layer.blendMode
        }));
      });
    });
    
    return processedData;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
