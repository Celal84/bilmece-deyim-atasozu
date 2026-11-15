#!/usr/bin/env bash
# Bilmece Deyim Atasozu - Linux/CI APK build (same steps as build-apk.ps1)
# Env: ANDROID_HOME, KEYSTORE_FILE, KEYSTORE_PASSWORD. Output: BilmeceDeyimAtasozu.apk
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
and="$here/android"
sdk="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
bt="$sdk/build-tools/35.0.0"
jar="$sdk/platforms/android-35/android.jar"
out="$and/out"

python3 - "$here" "$and" <<'PY'
import sys, pathlib
here, andr = map(pathlib.Path, sys.argv[1:3])
r = lambda p: (here / p).read_text(encoding="utf-8")
dat = r("src/data.js") + "\n" + r("src/facts.js") + "\n" + r("src/data2.js")
html = r("src/template.html").replace("/*CSS*/", r("src/style.css")).replace("/*DATA*/", dat).replace("/*APP*/", r("src/app.js"))
(andr / "assets").mkdir(exist_ok=True)
(andr / "assets/index.html").write_text(html, encoding="utf-8")
(here / "index.html").write_text(html, encoding="utf-8")
PY

rm -rf "$out"; mkdir -p "$out/res" "$out/classes" "$out/dex"
"$bt/aapt2" compile --dir "$and/res" -o "$out/res/res.zip"
"$bt/aapt2" link -o "$out/base.apk" -I "$jar" --manifest "$and/AndroidManifest.xml" -A "$and/assets" \
  --min-sdk-version 24 --target-sdk-version 35 --auto-add-overlay "$out/res/res.zip"
javac --release 11 -encoding UTF-8 -classpath "$jar" -d "$out/classes" $(find "$and/src" -name '*.java')
"$bt/d8" --release --min-api 24 --lib "$jar" --output "$out/dex" $(find "$out/classes" -name '*.class')
(cd "$out/dex" && zip -q -j "$out/base.apk" classes.dex)
"$bt/zipalign" -p -f 4 "$out/base.apk" "$out/aligned.apk"

ks="${KEYSTORE_FILE:-$and/zeka-release.jks}"
pw="${KEYSTORE_PASSWORD:-$(cat "$and/keystore-password.txt")}"
"$bt/apksigner" sign --ks "$ks" --ks-key-alias zeka --ks-pass "pass:$pw" --key-pass "pass:$pw" \
  --out "$here/BilmeceDeyimAtasozu.apk" "$out/aligned.apk"
"$bt/apksigner" verify "$here/BilmeceDeyimAtasozu.apk"
echo "APK ready: $here/BilmeceDeyimAtasozu.apk"
