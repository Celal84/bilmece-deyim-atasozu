# Bilmece Deyim Atasözü

9 yaş çocuklar için bilmece, deyim, atasözü, tekerleme ve fıkra öğreten Android uygulaması (WebView + tek sayfa JS).

- Kaynak: `src/` (data.js, data2.js, facts.js, app.js, style.css, template.html), Android kabuğu: `android/`
- Yerel derleme (Windows): `build-apk.ps1`; Linux/CI: `build.sh`
- GitHub Actions (`.github/workflows/build.yml`) her `main` push'unda APK'yı derler, imzalar ve Release'e koyar.
- Sürüm: `android/AndroidManifest.xml` içinde `versionCode` ve `versionName` (her güncellemede artırılır).
- Gerekli secret'lar: `KEYSTORE_BASE64` (zeka-release.jks'in base64'ü, alias `zeka`), `KEYSTORE_PASSWORD`.
- İmza anahtarı depoda YOK ve her sürümde aynı olmalı (güncellemenin üzerine kurulması için).

## Otomatik APK → GitHub Release + Google Drive

PC gerekmez: `main` dalına gönderilen her değişiklikte `.github/workflows/apk-drive.yml` çalışır.

- **Yeni sürüm çıkarmak için** `android/AndroidManifest.xml` içindeki `versionName` ve `versionCode` değerleri (ikisini birlikte artırın) güncellenip `main`e gönderilir.
- Sürüm yeniyse imzalı APK derlenir, `v<sürüm>` adıyla GitHub Release açılır ve APK Google Drive'da **APK Arşivi** klasöründeki uygulama klasörüne yüklenir; aynı klasördeki eski sürüm çöp kutusuna taşınır.
- Sürüm değişmediyse derleme atlanır. Elle yeniden derlemek için: Actions → *APK → Drive* → *Run workflow* (`zorla`).
- Drive bağlantısı için depoda tek gizli değişken gerekir: `GDRIVE_OAUTH` (`.github/scripts/drive_yukle.py` başındaki açıklamaya bakın).
