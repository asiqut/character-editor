import PSD from 'psd.js';

export async function loadPSD(url) {
  const response = await fetch(process.env.PUBLIC_URL + '/assets/model_kinwoods.psd');
  const arrayBuffer = await response.arrayBuffer();
  return await PSD.fromArrayBuffer(arrayBuffer);
}

export function extractLayers(psd) {
  const layersMap = {};
  const root = psd.tree();
  
  function processNode(node, path = []) {
    if (node.isGroup()) {
      node.children.forEach(child => processNode(child, [...path, node.name]));
    } else {
      const part = path[0]; // 'Уши', 'Глаза' и т.д.
      const preset = path[1]; // 'длинные', 'лисьи' и т.д.
      
      if (!part || !preset) return;
      
      if (!layersMap[part]) layersMap[part] = {};
      if (!layersMap[part][preset]) layersMap[part][preset] = {};
      
      // Обработка слоёв для покраски
      if (node.name.includes('[красить]')) {
        layersMap[part][preset].colorLayer = node;
      } else if (node.name.includes('[белок красить]')) {
        layersMap[part][preset].eyesWhiteLayer = node;
      } else {
        layersMap[part][preset][node.name] = node;
      }
    }
  }
  
  processNode(root);
  return layersMap;
}
