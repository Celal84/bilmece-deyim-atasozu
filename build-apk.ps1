# Zeka Ormani - APK build (no Gradle). Output: ZekaOrmani.apk
$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$and  = "$here\android"
$sdk  = "$env:LOCALAPPDATA\Android\Sdk"
$bt   = "$sdk\build-tools\35.0.0"
$jar  = "$sdk\platforms\android-35\android.jar"
$jdk  = "C:\Program Files\Android\Android Studio1\jbr"
$env:JAVA_HOME = $jdk
$env:PATH = "$jdk\bin;$env:PATH"
$out  = "$and\out"
$utf8 = New-Object System.Text.UTF8Encoding($false)

# 1) inline css/data/app into a single html
$tpl = [IO.File]::ReadAllText("$here\src\template.html", $utf8)
$css = [IO.File]::ReadAllText("$here\src\style.css", $utf8)
$dat = [IO.File]::ReadAllText("$here\src\data.js", $utf8) + "`n" + [IO.File]::ReadAllText("$here\src\facts.js", $utf8) + "`n" + [IO.File]::ReadAllText("$here\src\data2.js", $utf8)
$app = [IO.File]::ReadAllText("$here\src\app.js", $utf8)
$html = $tpl.Replace("/*CSS*/", $css).Replace("/*DATA*/", $dat).Replace("/*APP*/", $app)
New-Item -ItemType Directory -Force "$and\assets" | Out-Null
[IO.File]::WriteAllText("$and\assets\index.html", $html, $utf8)
[IO.File]::WriteAllText("$here\index.html", $html, $utf8)

if (Test-Path $out) { Remove-Item -Recurse -Force $out }
New-Item -ItemType Directory -Force "$out\res", "$out\classes", "$out\dex" | Out-Null

& "$bt\aapt2.exe" compile --dir "$and\res" -o "$out\res\res.zip"
if ($LASTEXITCODE) { throw "aapt2 compile" }
& "$bt\aapt2.exe" link -o "$out\base.apk" -I $jar --manifest "$and\AndroidManifest.xml" -A "$and\assets" --min-sdk-version 24 --target-sdk-version 35 --auto-add-overlay "$out\res\res.zip"
if ($LASTEXITCODE) { throw "aapt2 link" }

$src = Get-ChildItem "$and\src" -Recurse -Filter *.java | % FullName
& javac --release 11 -encoding UTF-8 -classpath $jar -d "$out\classes" $src
if ($LASTEXITCODE) { throw "javac" }
$cls = Get-ChildItem "$out\classes" -Recurse -Filter *.class | % FullName
& "$bt\d8.bat" --release --min-api 24 --lib $jar --output "$out\dex" $cls
if ($LASTEXITCODE) { throw "d8" }

Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::Open("$out\base.apk", "Update")
[IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, "$out\dex\classes.dex", "classes.dex") | Out-Null
$zip.Dispose()

& "$bt\zipalign.exe" -p -f 4 "$out\base.apk" "$out\aligned.apk"
if ($LASTEXITCODE) { throw "zipalign" }

$ks = "$and\zeka-release.jks"
$pf = "$and\keystore-password.txt"
if (-not (Test-Path $ks)) {
    $pw = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | % { [char]$_ })
    Set-Content $pf $pw -NoNewline -Encoding ascii
    & keytool -genkeypair -keystore $ks -alias zeka -keyalg RSA -keysize 2048 -validity 10000 -storepass $pw -keypass $pw -dname "CN=Zeka Ormani, O=Aile, C=TR" | Out-Null
    if ($LASTEXITCODE) { throw "keytool" }
}
$pw = (Get-Content $pf -Raw).Trim()

$final = "$here\BilmeceDeyimAtasozu.apk"
& "$bt\apksigner.bat" sign --ks $ks --ks-key-alias zeka --ks-pass "pass:$pw" --key-pass "pass:$pw" --out $final "$out\aligned.apk"
if ($LASTEXITCODE) { throw "apksigner sign" }
& "$bt\apksigner.bat" verify $final
if ($LASTEXITCODE) { throw "apksigner verify" }
"APK ready: $final ($([math]::Round((Get-Item $final).Length/1KB)) KB)"
