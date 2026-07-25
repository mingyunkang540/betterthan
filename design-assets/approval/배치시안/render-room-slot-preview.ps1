Add-Type -AssemblyName System.Drawing

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
$canvasWidth = 768
$canvasHeight = 1024

function New-SceneBitmap {
  $bitmap = [System.Drawing.Bitmap]::new($canvasWidth, $canvasHeight)
  $bitmap.SetResolution(144, 144)
  return $bitmap
}

function Draw-ContainedImage {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$RelativePath,
    [double]$X,
    [double]$Y,
    [double]$Width,
    [double]$Height,
    [ValidateSet('BottomCenter', 'TopLeft')]
    [string]$Anchor = 'BottomCenter'
  )

  $assetPath = Join-Path $projectRoot $RelativePath
  $image = [System.Drawing.Image]::FromFile($assetPath)
  try {
    $boxLeft = if ($Anchor -eq 'BottomCenter') { $X - ($Width / 2) } else { $X }
    $boxTop = if ($Anchor -eq 'BottomCenter') { $Y - $Height } else { $Y }
    $scale = [Math]::Min($Width / $image.Width, $Height / $image.Height)
    $drawWidth = $image.Width * $scale
    $drawHeight = $image.Height * $scale
    $drawLeft = $boxLeft + (($Width - $drawWidth) / 2)
    $drawTop = $boxTop + (($Height - $drawHeight) / 2)
    $destination = [System.Drawing.RectangleF]::new(
      [single]$drawLeft,
      [single]$drawTop,
      [single]$drawWidth,
      [single]$drawHeight
    )
    $Graphics.DrawImage($image, $destination)
  }
  finally {
    $image.Dispose()
  }
}

function Render-Scene {
  param(
    [array]$Layers,
    [string]$OutputPath
  )

  $bitmap = New-SceneBitmap
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 242, 204))
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

    Draw-ContainedImage $graphics 'assets/room/cozy-approved-v2/room-empty.png' 0 0 $canvasWidth $canvasHeight TopLeft
    foreach ($layer in ($Layers | Sort-Object zIndex)) {
      Draw-ContainedImage `
        $graphics `
        $layer.path `
        $layer.x `
        $layer.y `
        $layer.width `
        $layer.height `
        ($layer.anchor ?? 'BottomCenter')
    }

    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

$beforeLayers = @(
  @{ zIndex = 10; path = 'assets/room/cozy-approved-v2/rug-round.png'; x = 384; y = 820; width = 430; height = 250 },
  @{ zIndex = 20; path = 'assets/room/cozy-approved-v2/bed-basic.png'; x = 545; y = 715; width = 300; height = 300 },
  @{ zIndex = 30; path = 'assets/room/cozy-approved-v2/desk-basic.png'; x = 270; y = 710; width = 350; height = 300 },
  @{ zIndex = 36; path = 'assets/room/cozy-approved-v2/diary-book.png'; x = 248; y = 490; width = 100; height = 88; anchor = 'TopLeft' },
  @{ zIndex = 40; path = 'assets/room/cozy-approved-v3/chair-basic.png'; x = 330; y = 745; width = 165; height = 220 },
  @{ zIndex = 50; path = 'assets/room/cozy-approved/plant-floor.png'; x = 152; y = 711; width = 130; height = 175 },
  @{ zIndex = 70; path = 'assets/room/cozy-approved-v2/curtain-linen.png'; x = 250; y = 535; width = 270; height = 390 },
  @{ zIndex = 71; path = 'assets/room/cozy-approved-v2/shelf-basic.png'; x = 575; y = 500; width = 225; height = 150 },
  @{ zIndex = 72; path = 'assets/room/cozy-approved-v3/bookcase-small.png'; x = 135; y = 750; width = 150; height = 180 },
  @{ zIndex = 75; path = 'assets/room/cozy-approved/plant-desk.png'; x = 573; y = 354; width = 95; height = 115 },
  @{ zIndex = 80; path = 'assets/room/cozy-approved-v2/cat-window.png'; x = 300; y = 575; width = 120; height = 120 },
  @{ zIndex = 80; path = 'assets/room/cozy-approved-v2/dog-chair.png'; x = 330; y = 670; width = 110; height = 125 }
)

$afterLayers = @(
  @{ zIndex = 10; path = 'assets/room/cozy-approved-v2/rug-round.png'; x = 384; y = 820; width = 430; height = 250 },
  @{ zIndex = 20; path = 'assets/room/cozy-approved-v2/bed-basic.png'; x = 545; y = 715; width = 300; height = 300 },
  @{ zIndex = 30; path = 'assets/room/cozy-approved-v2/desk-basic.png'; x = 270; y = 710; width = 350; height = 300 },
  @{ zIndex = 32; path = 'assets/room/cozy-approved-v3/bookcase-small.png'; x = 648; y = 750; width = 128; height = 154 },
  @{ zIndex = 38; path = 'assets/room/cozy-approved-v2/diary-book.png'; x = 268; y = 502; width = 92; height = 78; anchor = 'TopLeft' },
  @{ zIndex = 40; path = 'assets/room/cozy-approved-v2/chair-basic.png'; x = 338; y = 752; width = 172; height = 224 },
  @{ zIndex = 50; path = 'assets/room/cozy-approved/plant-floor.png'; x = 152; y = 711; width = 130; height = 175 },
  @{ zIndex = 52; path = 'assets/room/cozy-approved/cat-sit.png'; x = 208; y = 822; width = 122; height = 142 },
  @{ zIndex = 53; path = 'assets/room/cozy-approved/dog-sit.png'; x = 545; y = 858; width = 132; height = 148 },
  @{ zIndex = 70; path = 'assets/room/cozy-approved-v2/curtain-linen.png'; x = 250; y = 535; width = 270; height = 390 },
  @{ zIndex = 71; path = 'assets/room/cozy-approved-v2/shelf-basic.png'; x = 575; y = 500; width = 225; height = 150 },
  @{ zIndex = 73; path = 'assets/room/cozy-approved-v3/plant-succulent.png'; x = 606; y = 457; width = 72; height = 86 }
)

$beforePath = Join-Path $PSScriptRoot 'room-slots-before.png'
$afterPath = Join-Path $PSScriptRoot 'room-slots-after.png'
$emptyPath = Join-Path $PSScriptRoot 'room-empty-after.png'
$comparisonPath = Join-Path $PSScriptRoot 'room-slots-before-after.png'

Render-Scene $beforeLayers $beforePath
Render-Scene $afterLayers $afterPath
Render-Scene @() $emptyPath

$before = [System.Drawing.Image]::FromFile($beforePath)
$after = [System.Drawing.Image]::FromFile($afterPath)
$comparison = [System.Drawing.Bitmap]::new($canvasWidth * 2, $canvasHeight)
$comparisonGraphics = [System.Drawing.Graphics]::FromImage($comparison)
try {
  $comparisonGraphics.DrawImage($before, 0, 0, $canvasWidth, $canvasHeight)
  $comparisonGraphics.DrawImage($after, $canvasWidth, 0, $canvasWidth, $canvasHeight)
  $comparison.Save($comparisonPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $comparisonGraphics.Dispose()
  $comparison.Dispose()
  $before.Dispose()
  $after.Dispose()
}

Write-Output $beforePath
Write-Output $afterPath
Write-Output $emptyPath
Write-Output $comparisonPath
