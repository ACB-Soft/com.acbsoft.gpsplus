import { SavedLocation } from '../types';
import { BRAND_NAME, FULL_BRAND } from '../version';

export const generateKML = (locations: SavedLocation[]): string => {
  const placemarks = locations.map(loc => `
    <Placemark>
      <name>${escapeXml(loc.name)}</name>
      <description>${escapeXml(loc.description || 'Saha Ölçümü')}</description>
      <Point>
        <altitudeMode>clampToGround</altitudeMode>
        <coordinates>${loc.lng},${loc.lat},0</coordinates>
      </Point>
    </Placemark>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Saha Kayıtları ${BRAND_NAME}</name>
    <description>${FULL_BRAND} tarafından oluşturuldu.</description>
    ${placemarks}
  </Document>
</kml>`;
};

const escapeXml = (unsafe: string) => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
};

export const downloadKML = (locations: SavedLocation[]) => {
  if (locations.length === 0) {
    alert("Kayıt bulunamadı.");
    return;
  }
  
  const kmlContent = generateKML(locations);
  const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  link.href = url;
  link.download = `ACB_GPS_Verisi_${timestamp}.kml`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareKML = async (locations: SavedLocation[]) => {
  if (locations.length === 0) return;
  
  const kmlContent = generateKML(locations);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const fileName = `ACB_GPS_Verisi_${timestamp}.kml`;
  
  const file = new File([kmlContent], fileName, { type: 'application/vnd.google-earth.kml+xml' });

  if (navigator.share) {
    try {
      await navigator.share({
        files: [file],
        title: `${BRAND_NAME} Saha Verileri`,
        text: `Google Earth için ${BRAND_NAME} tarafından hazırlanan veriler.`
      });
    } catch (err) {
      console.error("Sharing failed", err);
      downloadKML(locations); // Fallback to download
    }
  } else {
    downloadKML(locations);
  }
};