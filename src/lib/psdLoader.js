import * as PSD from 'ag-psd';
import { CHARACTER_CONFIG } from './characterConfig';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`PSD load failed: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      preserveLayerPositions: true,
      skipLayerImageData: false
    });

    console.log('Raw PSD structure:', psd); // Добавлено логирование
    
    if (!psd?.children) throw new Error('Invalid PSD structure');
    
    const processed = processPSDStructure(psd);
    console.log('Processed PSD structure:', processed); // Добавлено логирование
    return processed;
  } catch (error) {
    console.error('PSD loading failed:', error);
    throw error;
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

console.log('PSD full structure:', JSON.stringify(psd, null, 2));
  
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
