#!/usr/bin/env python3
"""APK'yı Google Drive'a yükler ve aynı uygulamanın eski sürümlerini kaldırır (çöp kutusuna taşır).

Drive'da yapı:  APK Arşivi / <Uygulama adı> / <Uygulama>-v<sürüm>.apk

Kimlik bilgisi: GDRIVE_OAUTH ortam değişkeni (GitHub gizli değişkeni), JSON:
  {"client_id": "...", "client_secret": "...", "refresh_token": "..."}
Kapsam: https://www.googleapis.com/auth/drive.file  (yalnızca bu betiğin oluşturduğu dosyalar)

Kullanım:
  drive_yukle.py var   "<Uygulama adı>" "<dosya adı>"   -> "var" / "yok" / "ayarsiz" yazar
  drive_yukle.py yukle "<Uygulama adı>" <apk yolu>      -> yükler, eskileri kaldırır
Yalnızca Python standart kütüphanesi kullanılır.
"""
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

KOK_KLASOR = "APK Arşivi"
KLASOR_MIME = "application/vnd.google-apps.folder"
API = "https://www.googleapis.com/drive/v3/files"
YUKLEME = "https://www.googleapis.com/upload/drive/v3/files"


def istek(url, yontem="GET", veri=None, basliklar=None, ham=False):
    basliklar = dict(basliklar or {})
    if veri is not None and not isinstance(veri, (bytes, bytearray)):
        veri = json.dumps(veri).encode()
        basliklar.setdefault("Content-Type", "application/json; charset=UTF-8")
    req = urllib.request.Request(url, data=veri, method=yontem, headers=basliklar)
    try:
        with urllib.request.urlopen(req, timeout=600) as yanit:
            if ham:
                return yanit
            govde = yanit.read()
            return json.loads(govde) if govde else {}
    except urllib.error.HTTPError as h:
        sys.exit(f"Drive hatası {h.code} ({yontem} {url.split('?')[0]}): {h.read().decode(errors='replace')[:500]}")


def erisim_anahtari():
    ham = os.environ.get("GDRIVE_OAUTH", "").strip()
    if not ham:
        return None
    k = json.loads(ham)
    veri = urllib.parse.urlencode({
        "client_id": k["client_id"],
        "client_secret": k["client_secret"],
        "refresh_token": k["refresh_token"],
        "grant_type": "refresh_token",
    }).encode()
    return istek("https://oauth2.googleapis.com/token", "POST", veri,
                 {"Content-Type": "application/x-www-form-urlencoded"})["access_token"]


def kacir(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")


def ara(tok, sorgu):
    q = urllib.parse.urlencode({"q": sorgu, "fields": "files(id,name,createdTime)",
                                "pageSize": 1000, "spaces": "drive"})
    return istek(f"{API}?{q}", basliklar={"Authorization": f"Bearer {tok}"}).get("files", [])


def klasor(tok, ad, ust, olustur=True):
    bulunan = ara(tok, f"name = '{kacir(ad)}' and mimeType = '{KLASOR_MIME}' and '{ust}' in parents and trashed = false")
    if bulunan:
        return bulunan[0]["id"]
    if not olustur:
        return None
    return istek(f"{API}?fields=id", "POST", {"name": ad, "mimeType": KLASOR_MIME, "parents": [ust]},
                 {"Authorization": f"Bearer {tok}"})["id"]


def uygulama_klasoru(tok, uygulama, olustur=True):
    kok = klasor(tok, KOK_KLASOR, "root", olustur)
    return kok and klasor(tok, uygulama, kok, olustur)


def var(uygulama, dosya_adi):
    tok = erisim_anahtari()
    if not tok:
        print("ayarsiz")
        return
    kl = uygulama_klasoru(tok, uygulama, olustur=False)
    ok = kl and ara(tok, f"name = '{kacir(dosya_adi)}' and '{kl}' in parents and trashed = false")
    print("var" if ok else "yok")


def yukle(uygulama, yol):
    tok = erisim_anahtari()
    if not tok:
        print("::warning::GDRIVE_OAUTH gizli değişkeni tanımlı değil; Drive'a yükleme atlandı.")
        return
    yetki = {"Authorization": f"Bearer {tok}"}
    kl = uygulama_klasoru(tok, uygulama)
    ad = os.path.basename(yol)
    boyut = os.path.getsize(yol)

    # 1) Yeni sürümü yükle (devam ettirilebilir yükleme)
    meta = {"name": ad, "parents": [kl], "mimeType": "application/vnd.android.package-archive"}
    oturum = istek(f"{YUKLEME}?uploadType=resumable&fields=id", "POST", meta,
                   {**yetki, "X-Upload-Content-Type": meta["mimeType"],
                    "X-Upload-Content-Length": str(boyut)}, ham=True)
    adres = oturum.headers["Location"]
    with open(yol, "rb") as f:
        yeni = istek(adres + "&fields=id,name,size", "PUT", f.read(),
                     {"Content-Type": meta["mimeType"], "Content-Length": str(boyut)})
    print(f"Yüklendi: {KOK_KLASOR}/{uygulama}/{ad} ({boyut // 1024} KB, id={yeni['id']})")

    # 2) Yükleme başarılıysa aynı klasördeki eski sürümleri kaldır (çöp kutusuna taşı)
    for d in ara(tok, f"'{kl}' in parents and trashed = false and mimeType != '{KLASOR_MIME}'"):
        if d["id"] != yeni["id"]:
            istek(f"{API}/{d['id']}", "PATCH", {"trashed": True}, yetki)
            print(f"Eski sürüm kaldırıldı: {d['name']}")


if __name__ == "__main__":
    if len(sys.argv) != 4 or sys.argv[1] not in ("var", "yukle"):
        sys.exit(__doc__)
    {"var": var, "yukle": yukle}[sys.argv[1]](sys.argv[2], sys.argv[3])
