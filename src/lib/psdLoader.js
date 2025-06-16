import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      useImageData: true,
      preserveLayerPositions: true
    });
    
    console.log('Loaded PSD structure:', psd);
    
    // Нормализация данных
    if (psd.children) {
      psd.children.forEach(group => {
        if (group.children) {
          group.children.forEach(layer => {
            layer.left = layer.left || 0;
            layer.top = layer.top || 0;
          });
        }
      });
    }
    
    return psd;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
