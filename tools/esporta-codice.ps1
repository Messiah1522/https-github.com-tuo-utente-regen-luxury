<#
  esporta-codice.ps1 - Esporta TUTTO il codice sorgente di una cartella in un
  unico file Markdown, da allegare all'HandOff (o incollare in una nuova chat).

  Uso (PowerShell, dalla cartella del progetto, es. Desktop\backend\backend):
    Set-ExecutionPolicy -Scope Process Bypass
    .\esporta-codice.ps1                         # esporta la cartella corrente
    .\esporta-codice.ps1 -Root "C:\percorso\tesi" -Output "codice-tesi.md"

  Esclude automaticamente: node_modules, .git, build, .env (credenziali!),
  package-lock.json, file binari e immagini.
#>
param(
    [string]$Root = (Get-Location).Path,
    [string]$Output = "codice-esportato.md"
)

$estensioni = @(".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx", ".json", ".sol", ".ps1",
                ".md", ".tex", ".bib", ".puml", ".css", ".html", ".example", ".yml", ".yaml")
$cartelleEscluse = @("node_modules", ".git", "dist", "build", "artifacts", "cache", "coverage")
$fileEsclusi = @(".env", "package-lock.json", $Output)

$linguaggio = @{
    ".js" = "javascript"; ".mjs" = "javascript"; ".cjs" = "javascript"; ".jsx" = "jsx"
    ".ts" = "typescript"; ".tsx" = "tsx"; ".json" = "json"; ".sol" = "solidity"
    ".ps1" = "powershell"; ".tex" = "latex"; ".bib" = "bibtex"; ".puml" = "plantuml"
    ".css" = "css"; ".html" = "html"; ".yml" = "yaml"; ".yaml" = "yaml"; ".md" = "markdown"
}

$rootPath = (Resolve-Path $Root).Path
$files = Get-ChildItem -Path $rootPath -Recurse -File -Force | Where-Object {
    $rel = $_.FullName.Substring($rootPath.Length).TrimStart('\', '/')
    $parti = $rel -split '[\\/]'
    -not ($parti | Where-Object { $cartelleEscluse -contains $_ }) -and
    -not ($fileEsclusi -contains $_.Name) -and
    ($estensioni -contains $_.Extension.ToLower())
} | Sort-Object FullName

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# Codice esportato da: $rootPath")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Esportato il $(Get-Date -Format 'yyyy-MM-dd HH:mm') - $($files.Count) file")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("## Struttura")
[void]$sb.AppendLine("")
[void]$sb.AppendLine('```')
foreach ($f in $files) { [void]$sb.AppendLine($f.FullName.Substring($rootPath.Length).TrimStart('\', '/')) }
[void]$sb.AppendLine('```')

foreach ($f in $files) {
    $rel = $f.FullName.Substring($rootPath.Length).TrimStart('\', '/')
    $lang = $linguaggio[$f.Extension.ToLower()]
    $contenuto = Get-Content -Path $f.FullName -Raw -Encoding UTF8
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("## ``$rel``")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine('````' + $lang)
    [void]$sb.AppendLine($contenuto.TrimEnd())
    [void]$sb.AppendLine('````')
}

$outPath = Join-Path $rootPath $Output
[System.IO.File]::WriteAllText($outPath, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Esportati $($files.Count) file in: $outPath" -ForegroundColor Green
Write-Host "Controlla che NON contenga password o stringhe di connessione prima di condividerlo." -ForegroundColor Yellow
