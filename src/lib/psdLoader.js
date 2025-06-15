import * as PSD from 'ag-psd';

export async function loadPSD() {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/assets/model_kinwoods.psd`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    return PSD.readPsd(arrayBuffer);
  } catch (error) {
    console.error('Error loading PSD:', error);
    throw error;
  }
}
