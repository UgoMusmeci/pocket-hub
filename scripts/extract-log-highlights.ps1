param(
  [Parameter(Mandatory = $true)]
  [string]$LogPath
)

if (-not (Test-Path $LogPath)) {
  Write-Output '  - Nessun messaggio rilevante.'
  exit 0
}

$cleanLines = Get-Content -Path $LogPath | ForEach-Object {
  $line = $_ -replace "`e\[[0-9;]*[A-Za-z]", ''
  $line = $line -replace 'âœ“ built in', 'Build completata in'
  $line = $line -replace '✓ built in', 'Build completata in'
  $line = $line -replace 'â”‚', '|'
  $line.TrimEnd()
}

$patterns = @(
  'Error:',
  'ERRORE',
  'AVVISO:',
  'warning:',
  'Warning:',
  'Unable to create',
  'npm ERR!',
  'fatal:',
  'CONFLICT',
  'another git process seems to be running',
  'failed to push',
  'Could not ',
  'curl:',
  'TypeError: fetch failed',
  'connect EACCES',
  'Could not connect to server',
  'Reward asset non trovato',
  'Reward override asset non trovato',
  'Skipped set artwork',
  'Set artwork processed',
  'Stage non risolto via PokeAPI',
  'Verifica catalogo espansioni:',
  'Set presenti nel catalogo:',
  'OK: tutte le espansioni',
  'ATTENZIONE: mancano alcune espansioni',
  'Nota: alcune espansioni presenti hanno una data di uscita futura:',
  'Generated reward catalog entries',
  'Generated event images',
  'Processed reward assets:',
  'Mazzi sincronizzati:',
  'Catalog written to',
  'Build completata in'
)

$hits = foreach ($line in $cleanLines) {
  foreach ($pattern in $patterns) {
    if ($line -like ('*' + $pattern + '*')) {
      $line
      break
    }
  }
}

$hits = $hits |
  Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
  Select-Object -Unique

if (-not $hits) {
  Write-Output '  - Nessun messaggio rilevante.'
  exit 0
}

$hits | ForEach-Object { '  - ' + $_ }
