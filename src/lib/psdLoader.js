import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`Failed to fetch PSD: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      preserveLayerPositions: true,
      skipLayerImageData: false
    });
    
    if (!psd || !psd.children) throw new Error('Invalid PSD structure');
    
    const processedData = {};
    
    function processGroup(group, path = '') {
      const currentPath = path ? `${path}/${group.name}` : group.name;
      
      if (group.children) {
        // Создаем объект для группы
        processedData[currentPath] = {};
        
        // Обрабатываем детей
        group.children.forEach(child => {
          processGroup(child, currentPath);
        });
      } else {
        // Это слой
        processedData[currentPath] = {
          name: group.name,
          canvas: group.canvas,
          left: group.left || 0,
          top: group.top || 0,
          blendMode: group.blendMode,
          clipping: group.clipping,
          opacity: group.opacity !== undefined ? group.opacity : 1
        };
      }
    }
    
    // Обрабатываем корневые группы
    psd.children.forEach(group => {
      processGroup(group);
    });
    
    return processedData;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
