param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

Add-Type -AssemblyName System.Drawing

$rewardFiles = @(
  (Join-Path $ProjectRoot 'src\data\rewards.ts'),
  (Join-Path $ProjectRoot 'src\data\rewardOverrides.ts'),
  (Join-Path $ProjectRoot 'src\data\generatedRewards.ts')
)
$outputDir = Join-Path $ProjectRoot 'public\rewards'
$tempDir = Join-Path $ProjectRoot '.tmp\reward-assets'

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

$pattern = "slug:\s*'([^']+)'.*?sourceImageUrl:\s*'([^']+)'"
$matches = New-Object System.Collections.Generic.List[System.Text.RegularExpressions.Match]
foreach ($rewardFile in $rewardFiles) {
  if (-not (Test-Path $rewardFile)) { continue }
  $content = Get-Content -Path $rewardFile -Raw
  [regex]::Matches($content, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline) | ForEach-Object {
    [void]$matches.Add($_)
  }
}

$overrideEntries = New-Object System.Collections.Generic.List[object]
$overrideFile = Join-Path $ProjectRoot 'src\data\rewardOverrides.ts'
if (Test-Path $overrideFile) {
  $overrideContent = Get-Content -Path $overrideFile -Raw
  $overridePattern = "slug:\s*'([^']+)'.*?imageKey:\s*'([^']+)'"
  [regex]::Matches($overrideContent, $overridePattern, [System.Text.RegularExpressions.RegexOptions]::Singleline) | ForEach-Object {
    $overrideEntries.Add([PSCustomObject]@{
      slug = $_.Groups[1].Value
      url = "https://www.serebii.net/tcgpocket/emblems/$($_.Groups[2].Value).png"
    }) | Out-Null
  }

  $overrideHelperPattern = "create(?:Shop|Themed|SecretMission|Event)Emblem\(\s*'([^']+)'\s*,\s*'[^']+'\s*,\s*'([^']+)'"
  [regex]::Matches($overrideContent, $overrideHelperPattern, [System.Text.RegularExpressions.RegexOptions]::Singleline) | ForEach-Object {
    $overrideEntries.Add([PSCustomObject]@{
      slug = $_.Groups[1].Value
      url = "https://www.serebii.net/tcgpocket/emblems/$($_.Groups[2].Value).png"
    }) | Out-Null
  }
}

function New-TransparentCanvas([int]$size) {
  $canvas = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($canvas)
  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  return @{ Bitmap = $canvas; Graphics = $graphics }
}

function Convert-ToTransparentPng([string]$sourceFile, [string]$targetFile) {
  $original = [System.Drawing.Bitmap]::FromFile($sourceFile)
  $working = New-Object System.Drawing.Bitmap $original.Width, $original.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $workingGraphics = [System.Drawing.Graphics]::FromImage($working)
  $workingGraphics.DrawImage($original, 0, 0, $original.Width, $original.Height)
  $workingGraphics.Dispose()
  $original.Dispose()

  $minX = $working.Width
  $minY = $working.Height
  $maxX = -1
  $maxY = -1

  for ($x = 0; $x -lt $working.Width; $x++) {
    for ($y = 0; $y -lt $working.Height; $y++) {
      $pixel = $working.GetPixel($x, $y)
      if ($pixel.R -ge 245 -and $pixel.G -ge 245 -and $pixel.B -ge 245) {
        $working.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
      } else {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }

  if ($maxX -lt $minX -or $maxY -lt $minY) {
    $minX = 0
    $minY = 0
    $maxX = $working.Width - 1
    $maxY = $working.Height - 1
  }

  $cropWidth = $maxX - $minX + 1
  $cropHeight = $maxY - $minY + 1
  $cropped = New-Object System.Drawing.Bitmap $cropWidth, $cropHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $croppedGraphics = [System.Drawing.Graphics]::FromImage($cropped)
  $croppedGraphics.DrawImage(
    $working,
    (New-Object System.Drawing.Rectangle 0, 0, $cropWidth, $cropHeight),
    (New-Object System.Drawing.Rectangle $minX, $minY, $cropWidth, $cropHeight),
    [System.Drawing.GraphicsUnit]::Pixel
  )
  $croppedGraphics.Dispose()
  $working.Dispose()

  $canvasInfo = New-TransparentCanvas 600
  $canvas = $canvasInfo.Bitmap
  $graphics = $canvasInfo.Graphics

  $maxDimension = [Math]::Max($cropped.Width, $cropped.Height)
  $scale = 520.0 / $maxDimension
  $drawWidth = [int][Math]::Round($cropped.Width * $scale)
  $drawHeight = [int][Math]::Round($cropped.Height * $scale)
  $drawX = [int][Math]::Round((600 - $drawWidth) / 2)
  $drawY = [int][Math]::Round((600 - $drawHeight) / 2)

  $graphics.DrawImage($cropped, $drawX, $drawY, $drawWidth, $drawHeight)
  $graphics.Dispose()
  $cropped.Dispose()

  $canvas.Save($targetFile, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Dispose()
}

$processed = @()

foreach ($match in $matches) {
  $slug = $match.Groups[1].Value
  $url = $match.Groups[2].Value
  $tempFile = Join-Path $tempDir "$slug-source"
  $outputFile = Join-Path $outputDir "$slug.png"
  $legacyBinderSlug = $null

  if ($slug -like '*-custodia-raccoglitore') {
    $legacyBinderSlug = $slug -replace '-custodia-raccoglitore$', '-custodia'
  }

  if (-not (Test-Path $outputFile) -and $legacyBinderSlug) {
    $legacyBinderFile = Join-Path $outputDir "$legacyBinderSlug.png"
    if (Test-Path $legacyBinderFile) {
      Copy-Item -Path $legacyBinderFile -Destination $outputFile -Force
      $processed += $slug
      continue
    }
  }

  try {
    Invoke-WebRequest -Uri $url -OutFile $tempFile
    Convert-ToTransparentPng -sourceFile $tempFile -targetFile $outputFile
    $processed += $slug
  } catch {
    Write-Warning ("Skipped reward asset: " + $slug + " | " + $url)
  }
}

foreach ($overrideEntry in $overrideEntries) {
  $slug = $overrideEntry.slug
  $url = $overrideEntry.url
  $tempFile = Join-Path $tempDir "$slug-source"
  $outputFile = Join-Path $outputDir "$slug.png"

  if (Test-Path $outputFile) {
    continue
  }

  try {
    Invoke-WebRequest -Uri $url -OutFile $tempFile
    Convert-ToTransparentPng -sourceFile $tempFile -targetFile $outputFile
    $processed += $slug
  } catch {
    Write-Warning ("Skipped reward override asset: " + $slug + " | " + $url)
  }
}

Write-Output ("Processed reward assets: " + $processed.Count)
