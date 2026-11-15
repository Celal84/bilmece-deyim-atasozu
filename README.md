# Bilmece Deyim Atasözü

9 yaş çocuklar için bilmece, deyim, atasözü, tekerleme ve fıkra öğreten Android uygulaması (WebView + tek sayfa JS).

- Kaynak: `src/` (data.js, data2.js, facts.js, app.js, style.css, template.html), Android kabuğu: `android/`
- Yerel derleme (Windows): `build-apk.ps1`; Linux/CI: `build.sh`
- GitHub Actions (`.github/workflows/build.yml`) her `main` push'unda APK'yı derler, imzalar ve Release'e koyar.
- Sürüm: `android/AndroidManifest.xml` içinde `versionCode` ve `versionName` (her güncellemede artırılır).
- Gerekli secret'lar: `KEYSTORE_BASE64` (zeka-release.jks'in base64'ü, alias `zeka`), `KEYSTORE_PASSWORD`.
- İmza anahtarı depoda YOK ve her sürümde aynı olmalı (güncellemenin üzerine kurulması için).
