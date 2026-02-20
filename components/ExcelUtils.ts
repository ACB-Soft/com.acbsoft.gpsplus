import * as XLSX from 'xlsx';
import { SavedLocation } from '../types';

/**
 * Verileri Excel formatında oluşturur ve Base64 string olarak döndürür.
 * Bu format Capacitor Filesystem ile Android'e kaydetmek için en güvenli yoldur.
 */
export const generateExcelBase64 = (locations: SavedLocation[]): string => {
  if (locations.length === 0) return "";

  // 1. Veriyi Excel satırlarına dönüştür
  const data = locations.map(loc => ({
    "Proje / Klasör": loc.folderName,
    "Nokta İsmi": loc.name,
    "Enlem": loc.lat,
    "Boylam": loc.lng,
    "Yükseklik (m)": loc.altitude !== null ? Math.round(loc.altitude) : '---',
    "Hassasiyet (m)": loc.accuracy.toFixed(2),
    "Tarih": new Date(loc.timestamp).toLocaleString('tr-TR'),
    "Açıklama": loc.description || ''
  }));

  // 2. Worksheet oluştur
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 3. Sütun genişliklerini ayarla (Okunabilirlik için)
  const wscols = [
    { wch: 20 }, // Klasör
    { wch: 15 }, // Nokta İsmi
    { wch: 15 }, // Enlem
    { wch: 15 }, // Boylam
    { wch: 15 }, // Yükseklik
    { wch: 15 }, // Hassasiyet
    { wch: 20 }, // Tarih
    { wch: 25 }, // Açıklama
  ];
  worksheet['!cols'] = wscols;

  // 4. Workbook oluştur ve sayfayı ekle
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Saha Verileri");

  // 5. Dosyayı Base64 formatında üret (Android için kritik kısım)
  const excelBase64 = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'base64' 
  });

  return excelBase64;
};
