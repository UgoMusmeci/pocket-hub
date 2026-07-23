param(
  [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$outputFile = Join-Path $ProjectRoot 'src\data\generatedRewards.ts'

$excludedRewardNames = @(
  'Battle Screen Tabellone'
)

$expansionNameMap = [ordered]@{
  'Genetic Apex' = 'Geni Supremi'
  'Mythical Island' = "L'Isola Misteriosa"
  'Space-Time Smackdown' = 'Scontro Spaziotemporale'
  'Triumphant Light' = 'Luce Trionfale'
  'Shining Revelry' = 'Tripudio Splendente'
  'Celestial Guardians' = 'Guardiani Astrali'
  'Extradimensional Crisis' = 'Crisi Ultradimensionale'
  'Eevee Grove' = 'Il Bosco di Eevee'
  'Wisdom of Sea and Sky' = 'La Via del Cielo e del Mare'
  'Secluded Springs' = 'Sorgenti Recondite'
  'Deluxe Pack ex' = 'Busta Deluxe ex'
  'Mega Rising' = 'Mega Ascesa'
  'Crimson Blaze' = 'Fiamme Cremisi'
  'Fantastical Parade' = 'Parata Fantasmagorica'
  'Paldean Wonders' = 'Meraviglie di Paldea'
  'Mega Shine' = 'Mega Splendore'
  'Pulsing Aura' = 'Aura Pulsante'
  'Paradox Drive' = 'Assalto dei Paradossi'
  'Everyday Wonders' = 'Giorni Giocondi'
}

function Convert-ToSlug([string]$value) {
  $lower = $value.ToLowerInvariant()
  $lower = [regex]::Replace($lower, '[^a-z0-9]+', '-')
  return $lower.Trim('-')
}

function Build-RewardName([string]$type, [string]$alt) {
  $name = [System.Net.WebUtility]::HtmlDecode($alt).Trim()

  switch ($type) {
    'emblema' { return $name -replace ' Emblem$', ' Emblema' }
    'moneta' { return $name -replace ' Coin$', '' -replace '^', 'Moneta ' }
    'copertina_carte' { return ($name -replace ' Sleeves$', '') + ' Copertina carte' }
    'custodia_raccoglitore' { return ($name -replace ' Binders$', '') + ' Custodia raccoglitore' }
    'tabellone' {
      if ($name -match 'Display Boards$') {
        return ($name -replace ' Display Boards$', '') + ' Tabellone'
      }
      return ($name -replace ' Playmats$', '') + ' Tabellone'
    }
    'icona' { return 'Icona ' + $name }
    default { return $name }
  }
}

function Localize-ExpansionNames([string]$value) {
  $localized = $value

  foreach ($entry in $expansionNameMap.GetEnumerator()) {
    $localized = $localized.Replace($entry.Key, $entry.Value)
  }

  return $localized
}

function Escape-ForTs([string]$value) {
  return $value.Replace('\', '\\').Replace("'", "\'")
}

$pages = @(
  @{ Url = 'https://www.serebii.net/tcgpocket/emblems.shtml'; Prefix = 'https://www.serebii.net'; Type = 'emblema'; Context = 'Ricompense emblema'; SourceLabel = 'Serebii Emblems'; Requirement = 'Ricompensa catalogata nell archivio emblemi. Metodo preciso di ottenimento da verificare.'; Description = 'Emblema presente nell archivio del gioco.' },
  @{ Url = 'https://www.serebii.net/tcgpocket/coins.shtml'; Prefix = 'https://www.serebii.net/tcgpocket/'; Type = 'moneta'; Context = 'Ricompense moneta'; SourceLabel = 'Serebii Coins'; Requirement = 'Ricompensa confermata nell archivio del gioco. Il metodo preciso di sblocco puo variare tra evento, missione o shop.'; Description = 'Moneta cosmetica confermata nell archivio del gioco.' },
  @{ Url = 'https://www.serebii.net/tcgpocket/sleeves.shtml'; Prefix = 'https://www.serebii.net/tcgpocket/'; Type = 'copertina_carte'; Context = 'Copertine carte'; SourceLabel = 'Serebii Sleeves'; Requirement = 'Ricompensa confermata nell archivio del gioco. Il metodo preciso di sblocco puo variare tra evento, missione o shop.'; Description = 'Copertina per carte confermata nel gioco.' },
  @{ Url = 'https://www.serebii.net/tcgpocket/playmats.shtml'; Prefix = 'https://www.serebii.net/tcgpocket/'; Type = 'tabellone'; Context = 'Tabelloni di gioco'; SourceLabel = 'Serebii Playmats'; Requirement = 'Ricompensa confermata nell archivio del gioco. Il metodo preciso di sblocco puo variare tra evento, missione o shop.'; Description = 'Tabellone di gioco confermato nel gioco.' },
  @{ Url = 'https://www.serebii.net/tcgpocket/displays.shtml'; Prefix = 'https://www.serebii.net/tcgpocket/'; Type = 'tabellone'; Context = 'Tabelloni esposizione'; SourceLabel = 'Serebii Display Boards'; Requirement = 'Ricompensa confermata nell archivio del gioco. Il metodo preciso di sblocco puo variare tra evento, missione o shop.'; Description = 'Tabellone o cornice da esposizione confermati nel gioco.' },
  @{ Url = 'https://www.serebii.net/tcgpocket/icons.shtml'; Prefix = 'https://www.serebii.net'; Type = 'icona'; Context = 'Icone profilo'; SourceLabel = 'Serebii Profile Icons'; Requirement = 'Ricompensa confermata nell archivio del gioco. Il metodo preciso di sblocco puo variare tra evento, missione o shop.'; Description = 'Icona profilo confermata nel gioco.' },
  @{ Url = 'https://www.serebii.net/tcgpocket/binders.shtml'; Prefix = 'https://www.serebii.net/tcgpocket/'; Type = 'custodia_raccoglitore'; Context = 'Custodie raccoglitore'; SourceLabel = 'Serebii Binders'; Requirement = 'Ricompensa confermata nell archivio del gioco. Il metodo preciso di sblocco puo variare tra evento, missione o shop.'; Description = 'Custodia raccoglitore confermata nel gioco.' }
)

$allRewards = New-Object System.Collections.Generic.List[object]

foreach ($page in $pages) {
  $html = curl.exe -sSL $page.Url
  $matches = [regex]::Matches($html, '<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"', 'IgnoreCase')

  foreach ($match in $matches) {
    $src = $match.Groups[1].Value
    $alt = [System.Net.WebUtility]::HtmlDecode($match.Groups[2].Value).Trim()

    if ([string]::IsNullOrWhiteSpace($alt)) { continue }
    if ($src -like '/Banner.jpg' -or $src -like '*Toolbar/icon*') { continue }
    if ($alt -like 'Pok*TCG Pocket*' -or $alt -in @('Display Boards', 'Binders', 'Playmats', 'Sleeves')) { continue }

    $absoluteSrc = if ($src.StartsWith('http')) { $src } elseif ($src.StartsWith('/')) { 'https://www.serebii.net' + $src } else { $page.Prefix + $src }
    $rewardName = Localize-ExpansionNames (Build-RewardName -type $page.Type -alt $alt)
    if ($excludedRewardNames -contains $rewardName) { continue }
    $slug = Convert-ToSlug($rewardName)

    $allRewards.Add([PSCustomObject]@{
      slug = $slug
      name = $rewardName
      type = $page.Type
      imageUrl = "/rewards/$slug.png"
      sourceImageUrl = $absoluteSrc
      method = 'archivio_gioco'
      availability = 'catalogata'
      sourceContext = $page.Context
      requirement = $page.Requirement
      description = $page.Description
      sourceLabel = $page.SourceLabel
      sourceUrl = $page.Url
    })
  }
}

$deduped = $allRewards |
  Group-Object { $_.type + '::' + $_.name.ToLowerInvariant() } |
  ForEach-Object { $_.Group[0] } |
  Sort-Object type, name

$lines = @()
$lines += "import type { RewardGuide } from '../types/rewards'"
$lines += ""
$lines += "export const generatedRewardGuides: RewardGuide[] = ["

foreach ($reward in $deduped) {
  $lines += "  {"
  $lines += "    slug: '$($reward.slug)',"
  $lines += "    name: '$(Escape-ForTs $reward.name)',"
  $lines += "    type: '$($reward.type)',"
  $lines += "    imageUrl: '$($reward.imageUrl)',"
  $lines += "    sourceImageUrl: '$($reward.sourceImageUrl)',"
  $lines += "    method: '$($reward.method)',"
  $lines += "    availability: '$($reward.availability)',"
  $lines += "    sourceContext: '$(Escape-ForTs $reward.sourceContext)',"
  $lines += "    requirement: '$(Escape-ForTs $reward.requirement)',"
  $lines += "    description: '$(Escape-ForTs $reward.description)',"
  $lines += "    sourceLabel: '$(Escape-ForTs $reward.sourceLabel)',"
  $lines += "    sourceUrl: '$($reward.sourceUrl)',"
  $lines += "  },"
}

$lines += "]"

Set-Content -Path $outputFile -Value $lines -Encoding UTF8
Write-Output ("Generated reward catalog entries: " + $deduped.Count)
