import * as PSD from 'ag-psd';
import { CHARACTER_CONFIG } from './characterConfig';

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
    
    return processPSDStructure(psd);
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}

function processPSDStructure(psd) {
  const processedData = {};
  const groupOrder = [];

  psd.children.forEach(group => {
    if (!group.name || !group.children) return;
    
    // Определяем имя группы в нашей структуре
    const groupInfo = Object.entries(CHARACTER_CONFIG.parts).find(
      ([_, config]) => config.title === group.name
    );
    
    if (!groupInfo) return;
    
    const [partName, partConfig] = groupInfo;
    processedData[partName] = {};
    groupOrder.push(partName);

    // Обработка головы (особый случай)
    if (partConfig.isSingleVariant) {
      processedData[partName] = group.children.map(processLayer);
      return;
    }

    // Обработка вариантов частей
    group.children.forEach(variantGroup => {
      if (!variantGroup.name || !variantGroup.children) return;
      
      // Находим соответствующий вариант в конфигурации
      const variant = Object.entries(partConfig.variants).find(
        ([_, v]) => v.label === variantGroup.name
      );
      
      if (!variant) return;
      
      const [variantName] = variant;
      processedData[partName][variantName] = variantGroup.children.map(processLayer);
    });
  });

  // Сохраняем порядок групп для правильного рендеринга
  processedData._order = groupOrder;
  
  return processedData;
}

function processLayer(layer) {
  return {
    name: layer.name || '',
    canvas: layer.canvas,
    left: layer.left || 0,
    top: layer.top || 0,
    blendMode: layer.blendMode,
    clipping: layer.clipping,
    opacity: layer.opacity !== undefined ? layer.opacity : 1,
    hidden: false
  };
}
