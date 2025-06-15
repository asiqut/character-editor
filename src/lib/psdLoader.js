import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error('PSD file not found (HTTP '+response.status+')');
    
    const arrayBuffer = await response.arrayBuffer();
    const psd = PSD.readPsd(arrayBuffer);
    
    if (!psd) throw new Error('Failed to parse PSD file');
    return psd;
  } catch (error) {
    console.error('PSD loading failed:', error);
    throw error;
  }
}
