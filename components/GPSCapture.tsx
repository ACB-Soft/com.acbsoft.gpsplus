import React, { useState, useEffect, useRef } from 'react';
import { Geolocation } from '@capacitor/geolocation';
// ... diğer importlar aynı kalsın

// Bu fonksiyonu dosya içinde bul ve değiştir
const checkPermissions = async () => {
  try {
    const permissions = await Geolocation.checkPermissions();
    if (permissions.location !== 'granted') {
      const request = await Geolocation.requestPermissions();
      return request.location === 'granted';
    }
    return true;
  } catch (err) {
    console.error("İzin alınırken hata oluştu:", err);
    return false;
  }
};
