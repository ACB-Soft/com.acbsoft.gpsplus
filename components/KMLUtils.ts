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
  if (locations.length === 0) return "";
  return generateKML(locations);
};
