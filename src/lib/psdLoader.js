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
    
    // Сохраняем оригинальные размеры PSD
    const processedData = {
      width: psd.width,
      height: psd.height,
      canvasWidth: 800,
      canvasHeight: 800,
      offsetX: (800 - psd.width) / 2,
      offsetY: (800 - psd.height) / 2
    };
    
    const groupOrder = []; // Сохраняем порядок групп
    
    psd.children.forEach(group => {
      if (!group.name || !group.children) return;
      
      let groupName;
      switch(group.name) {
        case 'Грудь/шея/грива': groupName = 'mane'; break;
        case 'Уши': groupName = 'ears'; break;
        case 'Глаза': groupName = 'eyes'; break;
        case 'Щёки': groupName = 'cheeks'; break;
        case 'Голова': 
          groupName = 'head';
          processedData[groupName] = group.children.map(layer => ({
            name: layer.name,
            canvas: layer.canvas,
            left: layer.left || 0,
            top: layer.top || 0,
            blendMode: layer.blendMode,
            clipping: layer.clipping,
            opacity: layer.opacity !== undefined ? layer.opacity : 1
          }));
          return;
        case 'Тело': groupName = 'body'; break;
        case 'Хвосты': groupName = 'tail'; break;
        default: return;
      }
      
      processedData[groupName] = {};
      groupOrder.push(groupName);
      
      group.children.forEach(variant => {
        if (!variant.name || !variant.children) return;
        
        const variantName = groupName === 'head' ? 'default' : variant.name;
        
        processedData[groupName][variantName] = variant.children.map(layer => ({
          name: layer.name,
          canvas: layer.canvas,
          left: layer.left || 0,
          top: layer.top || 0,
          blendMode: layer.blendMode,
          clipping: layer.clipping,
          opacity: layer.opacity !== undefined ? layer.opacity : 1
        }));
      });
    });
    
    processedData._order = groupOrder;
    
    return processedData;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
