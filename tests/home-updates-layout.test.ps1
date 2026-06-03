$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$indexHtml = Get-Content -Raw -Path (Join-Path $root 'index.html')
$styles = Get-Content -Raw -Path (Join-Path $root 'Styles\style.css')

function Assert-True {
    param(
        [bool] $Condition,
        [string] $Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

Assert-True ($indexHtml.Contains('<section id="home-updates"')) 'home page has the two-column updates section'
Assert-True ($indexHtml.IndexOf('<section id="home-talks"') -lt $indexHtml.IndexOf('<section id="latest-publications"')) 'talks column appears before publications column'
Assert-True ([regex]::IsMatch($styles, '#home-updates\s*\{[\s\S]*?display:\s*grid;[\s\S]*?grid-template-columns:\s*minmax\(242px,\s*308px\)\s*minmax\(0,\s*1fr\);')) 'home updates use a two-column grid with a larger talks column'
Assert-True ([regex]::IsMatch($styles, '#home-updates \.section-header h3\s*\{[\s\S]*?font-size:\s*var\(--text-lg\);')) 'home update headings use the same size'
Assert-True ([regex]::IsMatch($styles, '#hero\s*\{[\s\S]*?margin-bottom:\s*var\(--sp-5\);')) 'hero has reduced spacing before home updates'
Assert-True ([regex]::IsMatch($styles, '\.home-talks-carousel\s*\{[\s\S]*?grid-template-columns:\s*1\.8rem\s*minmax\(0,\s*1fr\)\s*1\.8rem;')) 'home talks column uses a small carousel'
Assert-True ([regex]::IsMatch($styles, '#latest-publications-dashboard \.publication-item\s*\{[\s\S]*?padding:\s*var\(--sp-3\);')) 'homepage publication cards are compact'
Assert-True ([regex]::IsMatch($styles, '#latest-publications-dashboard \.pub-header\s*\{[\s\S]*?grid-template-columns:\s*3\.8em\s*1fr;')) 'homepage publication cards fit the right column'
Assert-True ([regex]::IsMatch($styles, '@media \(max-width:\s*768px\)\s*\{[\s\S]*?#home-updates\s*\{ grid-template-columns:\s*1fr;')) 'home updates stack on mobile'

Write-Host 'home updates two-column layout contract passed'
