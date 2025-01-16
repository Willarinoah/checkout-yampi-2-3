import QRCode from 'qrcode';

export const generateQRCodeBlob = async (url: string): Promise<Blob> => {
  console.log('Generating QR code for URL:', url);
  
  const canvas = document.createElement('canvas');
  await QRCode.toCanvas(canvas, url, {
    width: 400,
    margin: 2,
    color: {
      dark: '#FF1493', // lovepink color
      light: '#FFFFFF'
    }
  });
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      console.log('QR code blob generated successfully');
      resolve(blob!);
    }, 'image/png');
  });
};