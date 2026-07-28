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

function Get-DownloadCandidates([string]$url) {
  $candidates = New-Object System.Collections.Generic.List[string]

  if (-not [string]::IsNullOrWhiteSpace($url)) {
    [void]$candidates.Add($url)

    try {
      $uri = [System.Uri]$url
      $encodedPath = [System.Uri]::EscapeUriString($uri.GetLeftPart([System.UriPartial]::Authority) + $uri.AbsolutePath)
      if ($encodedPath -ne $url) {
        [void]$candidates.Add($encodedPath)
      }

      if ($uri.AbsolutePath -like '*/th/*') {
        $withoutThumb = $url -replace '/th/', '/'
        if ($withoutThumb -ne $url) {
          [void]$candidates.Add($withoutThumb)
        }
      }
    } catch {
    }
  }

  return $candidates | Select-Object -Unique
}

function Invoke-RewardDownload([string]$url, [string]$targetFile) {
  $lastError = $null

  foreach ($candidate in (Get-DownloadCandidates $url)) {
    try {
      Invoke-WebRequest -Uri $candidate -OutFile $targetFile
      return @{
        Success = $true
        Url = $candidate
        Error = $null
      }
    } catch {
      $lastError = $_.Exception.Message
    }
  }

  return @{
    Success = $false
    Url = $url
    Error = $lastError
  }
}

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

function New-PlaceholderRewardImage([string]$label, [string]$targetFile) {
  $canvasInfo = New-TransparentCanvas 600
  $canvas = $canvasInfo.Bitmap
  $graphics = $canvasInfo.Graphics

  $backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.Rectangle 0, 0, 600, 600),
    [System.Drawing.Color]::FromArgb(255, 255, 248, 232),
    [System.Drawing.Color]::FromArgb(255, 220, 234, 255),
    45
  )
  $graphics.FillRectangle($backgroundBrush, 0, 0, 600, 600)

  $borderPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(255, 20, 53, 113)), 10
  $graphics.DrawRectangle($borderPen, 24, 24, 552, 552)

  $titleFont = New-Object System.Drawing.Font('Segoe UI', 28, [System.Drawing.FontStyle]::Bold)
  $bodyFont = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Regular)
  $titleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 20, 53, 113))
  $bodyBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 55, 65, 81))
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center

  $graphics.DrawString(
    'Asset non disponibile',
    $titleFont,
    $titleBrush,
    (New-Object System.Drawing.RectangleF 60, 170, 480, 80),
    $format
  )
  $graphics.DrawString(
    $label,
    $bodyFont,
    $bodyBrush,
    (New-Object System.Drawing.RectangleF 70, 265, 460, 120),
    $format
  )

  $canvas.Save($targetFile, [System.Drawing.Imaging.ImageFormat]::Png)

  $backgroundBrush.Dispose()
  $borderPen.Dispose()
  $titleFont.Dispose()
  $bodyFont.Dispose()
  $titleBrush.Dispose()
  $bodyBrush.Dispose()
  $graphics.Dispose()
  $canvas.Dispose()
}

function Convert-SlugToLabel([string]$slug) {
  return (($slug -replace '-', ' ') -replace '\s+', ' ').Trim()
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
    $download = Invoke-RewardDownload -url $url -targetFile $tempFile
    if (-not $download.Success) {
      throw $download.Error
    }
    Convert-ToTransparentPng -sourceFile $tempFile -targetFile $outputFile
    $processed += $slug
  } catch {
    New-PlaceholderRewardImage -label (Convert-SlugToLabel $slug) -targetFile $outputFile
    Write-Warning ("Reward asset non trovato alla fonte, placeholder generato: " + $slug + " | " + $url + " | " + $_.Exception.Message)
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
    $download = Invoke-RewardDownload -url $url -targetFile $tempFile
    if (-not $download.Success) {
      throw $download.Error
    }
    Convert-ToTransparentPng -sourceFile $tempFile -targetFile $outputFile
    $processed += $slug
  } catch {
    New-PlaceholderRewardImage -label (Convert-SlugToLabel $slug) -targetFile $outputFile
    Write-Warning ("Reward override asset non trovato alla fonte, placeholder generato: " + $slug + " | " + $url + " | " + $_.Exception.Message)
  }
}

Write-Output ("Processed reward assets: " + $processed.Count)
