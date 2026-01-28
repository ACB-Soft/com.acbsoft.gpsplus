package com.acbsoft.gpsplus

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 1. WebView Oluşturma
        webView = WebView(this)
        setContentView(webView)

        // 2. WebView Ayarları
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true         // Verilerin kaydedilmesi (localStorage) için şart
            allowFileAccess = true
            setGeolocationEnabled(true)      // Web tarafındaki konum özelliğini açar
            databaseEnabled = true
            // Gereksiz olan mediaPlayback ayarı kaldırıldı
        }

        // 3. İzin Köprüsü (Geolocation Odaklı)
        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String,
                callback: GeolocationPermissions.Callback
            ) {
                // Web sayfasından gelen konum isteğine doğrudan onay verir
                callback.invoke(origin, true, false)
            }

            // onPermissionRequest (Kamera isteği) bloğu tamamen kaldırıldı
        }

        // Linklerin uygulama içinde kalmasını sağlar
        webView.webViewClient = WebViewClient()

        // 4. Sadece Konum İzinlerini Kontrol Et
        checkAndRequestPermissions()

        // 5. Uygulamayı Başlat
        webView.loadUrl("file:///android_asset/index.html")
    }

    private fun checkAndRequestPermissions() {
        // Sadece konum izinleri listeye alındı, CAMERA çıkarıldı
        val permissions = arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )

        val notGranted = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (notGranted.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, notGranted.toTypedArray(), 1)
        }
    }
}
