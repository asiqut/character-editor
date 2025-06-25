import * as PSD from 'ag-psd';
import { PSD_CONFIG } from './defaultConfig.js';

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
  if (!group.name) return;
  
  // Находим группу в PSD_CONFIG по русскому названию
  const groupConfig = Object.values(PSD_CONFIG).find(
    g => g.title === group.name
  );
  if (!groupConfig) return;

  const partName = Object.keys(PSD_CONFIG).find(
    key => PSD_CONFIG[key].title === group.name
  );
  processedData[partName] = {};

  group.children.forEach(variant => {
    if (!variant.name) return;
    const variantName = variant.name;
    processedData[partName][variantName] = variant.children.map(layer => ({
      name: layer.name,
      canvas: layer.canvas,
      left: layer.left || 0,
      top: layer.top || 0,
      blendMode: layer.blendMode,
      clipping: layer.clipping,
      opacity: layer.opacity ?? 1
    }));
  });
});
    
    // Сохраняем порядок групп для правильного рендеринга
    processedData._order = groupOrder; 
    
    return processedData;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
