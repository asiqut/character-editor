import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    console.log('Loading PSD file...');
    const response = await fetch(`${window.publicPath || ''}/assets/model_kinwoods.psd`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PSD: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('PSD file loaded, parsing...');
    
    const psd = PSD.readPsd(arrayBuffer);
    console.log('PSD parsed successfully', psd);
    
    if (!psd) {
      throw new Error('Failed to parse PSD file');
    }
    
    return psd;
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
