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
    const groupOrder = []; // Сохраняем порядок групп
    
    psd.children.forEach(group => {
      if (!group.name || !group.children) return;
      
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
      groupOrder.push(groupName); // Сохраняем порядок
      
      group.children.forEach(variant => {
        if (!variant.name || !variant.children) return;
        
        // Для головы используем 'default' вместо имени папки
        const variantName = groupName === 'head' ? 'default' : variant.name;
        
        processedData[groupName][variantName] = variant.children.map(layer => ({
          name: layer.name,
          canvas: layer.canvas,
          left: layer.left || 0,
          top: layer.top || 0,
          blendMode: layer.blendMode,
          clipping: layer.clipping
        }));
      });
    });
    
    // Сохраняем порядок групп для правильного рендеринга
    processedData._order = groupOrder(); 
    
    return processedData;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
