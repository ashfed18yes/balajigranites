# Balaji Granites — Luxury Favicon & Icon Suite Generator
Add-Type -AssemblyName System.Drawing

function Create-BalajiIcon([int]$w, [int]$h) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Start with pure transparent canvas
    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = [float]$w / 512.0

    # 1. Background Rounded Stone Tablet
    $pad = 12.0 * $scale
    $tabletW = [float]($w - ($pad * 2.0))
    $tabletH = [float]($h - ($pad * 2.0))
    $corner = 96.0 * $scale

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $rect = New-Object System.Drawing.RectangleF($pad, $pad, $tabletW, $tabletH)
    $d = $corner * 2.0
    $path.AddArc($rect.X, $rect.Y, $d, $d, 180, 90)
    $path.AddArc($rect.Right - $d, $rect.Y, $d, $d, 270, 90)
    $path.AddArc($rect.Right - $d, $rect.Bottom - $d, $d, $d, 0, 90)
    $path.AddArc($rect.X, $rect.Bottom - $d, $d, $d, 90, 90)
    $path.CloseFigure()

    # Deep architectural charcoal granite linear gradient
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF($pad, $pad)),
        (New-Object System.Drawing.PointF($pad, [float]($pad + $tabletH))),
        [System.Drawing.Color]::FromArgb(255, 30, 28, 25),
        [System.Drawing.Color]::FromArgb(255, 14, 13, 12)
    )
    $g.FillPath($bgBrush, $path)

    # Subtle radial stone specular sheen
    $sheenPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $sheenPath.AddEllipse([float](70 * $scale), [float](30 * $scale), [float](372 * $scale), [float](240 * $scale))
    $sheenBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($sheenPath)
    $sheenBrush.CenterColor = [System.Drawing.Color]::FromArgb(35, 255, 255, 255)
    $sheenBrush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 255, 255, 255))
    $g.FillPath($sheenBrush, $sheenPath)

    # Outer Champagne Gold Border (Refined luxury bezel)
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 198, 166, 120), [float](8.0 * $scale))
    $g.DrawPath($borderPen, $path)

    # Inner Fine Chamfer Line
    $inPad = 26.0 * $scale
    $inW = [float]($w - ($inPad * 2.0))
    $inH = [float]($h - ($inPad * 2.0))
    $inCorner = 80.0 * $scale
    $inPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $inRect = New-Object System.Drawing.RectangleF($inPad, $inPad, $inW, $inH)
    $inD = $inCorner * 2.0
    $inPath.AddArc($inRect.X, $inRect.Y, $inD, $inD, 180, 90)
    $inPath.AddArc($inRect.Right - $inD, $inRect.Y, $inD, $inD, 270, 90)
    $inPath.AddArc($inRect.Right - $inD, $inRect.Bottom - $inD, $inD, $inD, 0, 90)
    $inPath.AddArc($inRect.X, $inRect.Bottom - $inD, $inD, $inD, 90, 90)
    $inPath.CloseFigure()
    $inPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(65, 218, 185, 140), [float](1.5 * $scale))
    $g.DrawPath($inPen, $inPath)

    # 2. Majestic Roman Serif Monogram "B" (Precisely Centered)
    # Shifting coordinates so the entire B is optically balanced
    $ox = 6.0 * $scale
    $stemL = (142.0 * $scale) + $ox
    $stemR = (192.0 * $scale) + $ox
    $topY = 118.0 * $scale
    $botY = 394.0 * $scale
    $midY = 250.0 * $scale

    $bPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    
    # Outer contour of "B"
    $bPath.AddLine([float]((118.0 * $scale) + $ox), [float]$topY, [float]((255.0 * $scale) + $ox), [float]$topY)
    # Upper bowl outer curve
    $bPath.AddBezier(
        [float]((255.0 * $scale) + $ox), [float]$topY,
        [float]((335.0 * $scale) + $ox), [float]$topY,
        [float]((335.0 * $scale) + $ox), [float]$midY,
        [float]((250.0 * $scale) + $ox), [float]$midY
    )
    # Lower bowl outer curve
    $bPath.AddBezier(
        [float]((250.0 * $scale) + $ox), [float]$midY,
        [float]((355.0 * $scale) + $ox), [float]$midY,
        [float]((355.0 * $scale) + $ox), [float]$botY,
        [float]((265.0 * $scale) + $ox), [float]$botY
    )
    # Bottom serif
    $bPath.AddLine([float]((265.0 * $scale) + $ox), [float]$botY, [float]((118.0 * $scale) + $ox), [float]$botY)
    $bPath.AddLine([float]((118.0 * $scale) + $ox), [float]$botY, [float]((118.0 * $scale) + $ox), [float]($botY - (22.0 * $scale)))
    # Bottom left bracket
    $bPath.AddBezier(
        [float]((118.0 * $scale) + $ox), [float]($botY - (22.0 * $scale)),
        [float]$stemL, [float]($botY - (22.0 * $scale)),
        [float]$stemL, [float]($botY - (35.0 * $scale)),
        [float]$stemL, [float]($botY - (45.0 * $scale))
    )
    # Vertical spine
    $bPath.AddLine([float]$stemL, [float]($botY - (45.0 * $scale)), [float]$stemL, [float]($topY + (45.0 * $scale)))
    # Top left bracket
    $bPath.AddBezier(
        [float]$stemL, [float]($topY + (45.0 * $scale)),
        [float]$stemL, [float]($topY + (22.0 * $scale)),
        [float]((118.0 * $scale) + $ox), [float]($topY + (22.0 * $scale)),
        [float]((118.0 * $scale) + $ox), [float]$topY
    )
    $bPath.CloseFigure()

    # Upper Counter
    $upCut = New-Object System.Drawing.Drawing2D.GraphicsPath
    $upCut.AddLine([float]$stemR, [float]($topY + (32.0 * $scale)), [float]((240.0 * $scale) + $ox), [float]($topY + (32.0 * $scale)))
    $upCut.AddBezier(
        [float]((240.0 * $scale) + $ox), [float]($topY + (32.0 * $scale)),
        [float]((282.0 * $scale) + $ox), [float]($topY + (32.0 * $scale)),
        [float]((282.0 * $scale) + $ox), [float]($midY - (22.0 * $scale)),
        [float]((240.0 * $scale) + $ox), [float]($midY - (22.0 * $scale))
    )
    $upCut.AddLine([float]((240.0 * $scale) + $ox), [float]($midY - (22.0 * $scale)), [float]$stemR, [float]($midY - (22.0 * $scale)))
    $upCut.CloseFigure()

    # Lower Counter
    $lowCut = New-Object System.Drawing.Drawing2D.GraphicsPath
    $lowCut.AddLine([float]$stemR, [float]($midY + (20.0 * $scale)), [float]((248.0 * $scale) + $ox), [float]($midY + (20.0 * $scale)))
    $lowCut.AddBezier(
        [float]((248.0 * $scale) + $ox), [float]($midY + (20.0 * $scale)),
        [float]((296.0 * $scale) + $ox), [float]($midY + (20.0 * $scale)),
        [float]((296.0 * $scale) + $ox), [float]($botY - (32.0 * $scale)),
        [float]((248.0 * $scale) + $ox), [float]($botY - (32.0 * $scale))
    )
    $lowCut.AddLine([float]((248.0 * $scale) + $ox), [float]($botY - (32.0 * $scale)), [float]$stemR, [float]($botY - (32.0 * $scale)))
    $lowCut.CloseFigure()

    # Fill "B" with radiant warm ivory-white gradient
    $letterBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF(0, $topY)),
        (New-Object System.Drawing.PointF(0, $botY)),
        [System.Drawing.Color]::FromArgb(255, 255, 253, 248),
        [System.Drawing.Color]::FromArgb(255, 238, 232, 222)
    )
    $g.FillPath($letterBrush, $bPath)

    # Cut out the counters with background fill
    $g.FillPath($bgBrush, $upCut)
    $g.FillPath($bgBrush, $lowCut)

    # Subtle inner counter rim highlights
    $goldInnerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 218, 185, 140), [float](2.0 * $scale))
    $g.DrawPath($goldInnerPen, $upCut)
    $g.DrawPath($goldInnerPen, $lowCut)

    # 3. Signature Golden Bronzite 4-Point Crystal Diamond (✦)
    $starX = 388.0 * $scale
    $starY = 126.0 * $scale
    $starR = 32.0 * $scale
    $starW = 7.5 * $scale

    $starPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $starPath.AddPolygon(@(
        (New-Object System.Drawing.PointF($starX, [float]($starY - $starR))),
        (New-Object System.Drawing.PointF([float]($starX + $starW), [float]($starY - $starW))),
        (New-Object System.Drawing.PointF([float]($starX + $starR), $starY)),
        (New-Object System.Drawing.PointF([float]($starX + $starW), [float]($starY + $starW))),
        (New-Object System.Drawing.PointF($starX, [float]($starY + $starR))),
        (New-Object System.Drawing.PointF([float]($starX - $starW), [float]($starY + $starW))),
        (New-Object System.Drawing.PointF([float]($starX - $starR), $starY)),
        (New-Object System.Drawing.PointF([float]($starX - $starW), [float]($starY - $starW)))
    ))

    $starBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.PointF([float]($starX - $starR), [float]($starY - $starR))),
        (New-Object System.Drawing.PointF([float]($starX + $starR), [float]($starY + $starR))),
        [System.Drawing.Color]::FromArgb(255, 255, 238, 180),
        [System.Drawing.Color]::FromArgb(255, 205, 160, 92)
    )
    $g.FillPath($starBrush, $starPath)

    $starCore = New-Object System.Drawing.Drawing2D.GraphicsPath
    $coreR = 4.5 * $scale
    $starCore.AddEllipse([float]($starX - $coreR), [float]($starY - $coreR), [float]($coreR * 2.0), [float]($coreR * 2.0))
    $g.FillPath((New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))), $starCore)

    $g.Dispose()
    return $bmp
}

# Generate 512x512 Master Icon
$icon512 = Create-BalajiIcon 512 512
$icon512.Save("d:\BalajiGranites2\assets\android-chrome-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Generate 192x192 Android Chrome Icon
$icon192 = Create-BalajiIcon 192 192
$icon192.Save("d:\BalajiGranites2\assets\android-chrome-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Generate 180x180 Apple Touch Icon
$icon180 = Create-BalajiIcon 180 180
$icon180.Save("d:\BalajiGranites2\assets\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Generate 48x48 Icon
$icon48 = Create-BalajiIcon 48 48
$icon48.Save("d:\BalajiGranites2\assets\favicon-48x48.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Generate 32x32 Tab Icon
$icon32 = Create-BalajiIcon 32 32
$icon32.Save("d:\BalajiGranites2\assets\favicon-32x32.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Generate 16x16 Tab Icon
$icon16 = Create-BalajiIcon 16 16
$icon16.Save("d:\BalajiGranites2\assets\favicon-16x16.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Generate Multi-Resolution favicon.ico
function Export-Ico([System.Drawing.Bitmap[]]$bitmaps, [string]$outPath) {
    $fs = [System.IO.File]::Create($outPath)
    $bw = New-Object System.IO.BinaryWriter($fs)

    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]$bitmaps.Length)

    $pngBuffers = @()
    foreach ($b in $bitmaps) {
        $ms = New-Object System.IO.MemoryStream
        $b.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $pngBuffers += ,$ms.ToArray()
        $ms.Dispose()
    }

    $offset = 6 + (16 * $bitmaps.Length)

    for ($i = 0; $i -lt $bitmaps.Length; $i++) {
        $b = $bitmaps[$i]
        $png = $pngBuffers[$i]

        $wByte = if ($b.Width -ge 256) { [byte]0 } else { [byte]$b.Width }
        $hByte = if ($b.Height -ge 256) { [byte]0 } else { [byte]$b.Height }

        $bw.Write($wByte)
        $bw.Write($hByte)
        $bw.Write([byte]0)
        $bw.Write([byte]0)
        $bw.Write([uint16]1)
        $bw.Write([uint16]32)
        $bw.Write([uint32]$png.Length)
        $bw.Write([uint32]$offset)
        $offset += $png.Length
    }

    for ($i = 0; $i -lt $bitmaps.Length; $i++) {
        $png = $pngBuffers[$i]
        $bw.Write($png, 0, $png.Length)
    }

    $bw.Flush()
    $fs.Close()
}

Export-Ico @($icon16, $icon32, $icon48) "d:\BalajiGranites2\favicon.ico"
[System.IO.File]::Copy("d:\BalajiGranites2\favicon.ico", "d:\BalajiGranites2\assets\favicon.ico", $true)

Write-Output "ALL FAVICON PNG & ICO FILES GENERATED WITH 100% CLEAN PIXEL BOUNDARIES!"
