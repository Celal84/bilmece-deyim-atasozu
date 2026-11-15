Add-Type -AssemblyName System.Drawing
$here = $PSScriptRoot
function Draw($size, $path) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'AntiAlias'
    $s = $size / 192.0
    $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush ([System.Drawing.Point]::new(0,0)), ([System.Drawing.Point]::new(0,$size)), ([System.Drawing.Color]::FromArgb(108,195,255)), ([System.Drawing.Color]::FromArgb(126,217,87))
    $g.FillRectangle($bg, 0, 0, $size, $size)
    function B($hex) { New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($hex)) }
    # ears
    $g.FillPolygon((B '#8a5630'), @([System.Drawing.PointF]::new(48*$s,70*$s), [System.Drawing.PointF]::new(58*$s,22*$s), [System.Drawing.PointF]::new(92*$s,52*$s)))
    $g.FillPolygon((B '#8a5630'), @([System.Drawing.PointF]::new(144*$s,70*$s), [System.Drawing.PointF]::new(134*$s,22*$s), [System.Drawing.PointF]::new(100*$s,52*$s)))
    # body + head
    $g.FillEllipse((B '#a86b3c'), 30*$s, 62*$s, 132*$s, 118*$s)
    $g.FillEllipse((B '#f8e3bd'), 62*$s, 108*$s, 68*$s, 66*$s)
    $g.FillEllipse((B '#b9794a'), 36*$s, 36*$s, 120*$s, 104*$s)
    # eyes
    $g.FillEllipse((B '#ffffff'), 44*$s, 60*$s, 48*$s, 48*$s)
    $g.FillEllipse((B '#ffffff'), 100*$s, 60*$s, 48*$s, 48*$s)
    $g.FillEllipse((B '#2b1b0f'), 58*$s, 74*$s, 22*$s, 22*$s)
    $g.FillEllipse((B '#2b1b0f'), 112*$s, 74*$s, 22*$s, 22*$s)
    $g.FillEllipse((B '#ffffff'), 67*$s, 77*$s, 8*$s, 8*$s)
    $g.FillEllipse((B '#ffffff'), 121*$s, 77*$s, 8*$s, 8*$s)
    # beak
    $g.FillPolygon((B '#f59e0b'), @([System.Drawing.PointF]::new(84*$s,104*$s), [System.Drawing.PointF]::new(108*$s,104*$s), [System.Drawing.PointF]::new(96*$s,126*$s)))
    # graduation cap
    $g.FillPolygon((B '#3b2a8f'), @([System.Drawing.PointF]::new(96*$s,6*$s), [System.Drawing.PointF]::new(150*$s,28*$s), [System.Drawing.PointF]::new(96*$s,48*$s), [System.Drawing.PointF]::new(42*$s,28*$s)))
    $g.FillRectangle((B '#3b2a8f'), 72*$s, 36*$s, 48*$s, 16*$s)
    $g.FillEllipse((B '#facc15'), 142*$s, 26*$s, 10*$s, 24*$s)
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
}
$map = @{ 'mdpi'=48; 'hdpi'=72; 'xhdpi'=96; 'xxhdpi'=144; 'xxxhdpi'=192 }
foreach ($k in $map.Keys) {
    $d = "$here\android\res\mipmap-$k"
    New-Item -ItemType Directory -Force $d | Out-Null
    Draw $map[$k] "$d\ic_launcher.png"
}
"icons done"
