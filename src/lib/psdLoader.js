// src/lib/psdLoader.js
import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    const arrayBuffer = await response.arrayBuffer();
    return PSD.readPsd(arrayBuffer, {
      parseLayerBlendingModes: true,
      skipLayerImageData: false
    });
  } catch (error) {
    console.error('PSD loading failed:', error);
    throw error;
  }
}
