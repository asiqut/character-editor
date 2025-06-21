import * as PSD from 'ag-psd';
import { CHARACTER_CONFIG } from './characterConfig';

export async function loadPSD() {
  try {
    // Убедимся, что путь к PSD корректен
    const psdPath = `${window.publicPath || ''}/assets/model_kinwoods.psd`;
    console.log('Loading PSD from:', psdPath);

    const response = await fetch(psdPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch PSD: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      preserveLayerPositions: true,
      skipLayerImageData: false
    });
    
    if (!psd?.children) {
      throw new Error('Invalid PSD structure: no children layers found');
    }
    
    return processPSDStructure(psd);
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error; // Перебрасываем ошибку для обработки в компоненте
  }
}

function processPSDStructure(psd) {
  const processedData = {};
  
  // Добавим проверку на существование CHARACTER_CONFIG
  if (!CHARACTER_CONFIG?.parts) {
    throw new Error('Character configuration not loaded');
  }

  psd.children?.forEach(group => {
    if (!group?.name || !group?.children) return;
    
    const groupInfo = Object.entries(CHARACTER_CONFIG.parts).find(
      ([_, config]) => config.title === group.name
    );
    
    if (!groupInfo) return;
    
    const [partName] = groupInfo;
    processedData[partName] = {};

    if (CHARACTER_CONFIG.parts[partName]?.isSingleVariant) {
      processedData[partName] = group.children.map(processLayer);
      return;
    }

    group.children?.forEach(variantGroup => {
      if (!variantGroup?.name || !variantGroup?.children) return;
      
      const variant = Object.entries(CHARACTER_CONFIG.parts[partName].variants || {}).find(
        ([_, v]) => v.label === variantGroup.name
      );
      
      if (!variant) return;
      
      const [variantName] = variant;
      processedData[partName][variantName] = variantGroup.children.map(processLayer);
    });
  });

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
