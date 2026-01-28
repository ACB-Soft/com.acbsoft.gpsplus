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

        // 1. WebView Oluşturma ve Görünüme Ekleme
        webView = WebView(this)
        setContentView(webView)

        // 2. Kritik WebView Ayarları
        webView.settings.apply {
            javaScriptEnabled = true         // JS çalışması için şart
            domStorageEnabled = true        // Modern UI (Tailwind/React) için şart
            allowFileAccess = true
            setGeolocationEnabled(true)     // Konum özelliğini açar
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false // Kamera/Video için
        }

        // 3. İzin Köprüsü (WebChromeClient)
        // Bu kısım "User denied geolocation" hatasını çözen yerdir.
        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String,
                callback: GeolocationPermissions.Callback
            ) {
                // Web sayfasından gelen konum isteğine "Evet" cevabı gönderir
                callback.invoke(origin, true, false)
            }

            // Kamera izni isteği gelirse (Kamera butonu için)
            override fun onPermissionRequest(request: PermissionRequest) {
                request.grant(request.resources)
            }
        }

        // Sayfa içi linklerin dış tarayıcıda değil, uygulama içinde açılmasını sağlar
        webView.webViewClient = WebViewClient()

        // 4. Android Sistem İzinlerini Kontrol Et ve İste
        checkAndRequestPermissions()

        // 5. Uygulamayı Başlat
        webView.loadUrl("file:///android_asset/index.html")
    }

    private fun checkAndRequestPermissions() {
        val permissions = arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.CAMERA
        )

        val notGranted = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (notGranted.isNotEmpty()) {
            // Kullanıcıya izin penceresini gösterir
            ActivityCompat.requestPermissions(this, notGranted.toTypedArray(), 1)
        }
    }
}
