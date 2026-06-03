$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$indexHtml = Get-Content -Raw -Path (Join-Path $root 'index.html')
$talksJs = Get-Content -Raw -Path (Join-Path $root 'Scripts\talks.js')
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

$homeRendererMatch = [regex]::Match($talksJs, 'function initHomeTalksPreview\(\) \{[\s\S]*?\n  \}')
Assert-True $homeRendererMatch.Success 'home talks preview renderer exists'

$homeRenderer = $homeRendererMatch.Value

Assert-True ($indexHtml.Contains('<section id="home-talks"')) 'home page has the static talks preview section'
Assert-True ($indexHtml.Contains('<ul id="home-talks-list"')) 'home page has the mini-polaroid list target'
Assert-True ($indexHtml.Contains('class="home-talks-carousel"')) 'home page has the talks carousel shell'
Assert-True ($indexHtml.Contains('home-talks-arrow--prev')) 'home talks carousel has a previous arrow'
Assert-True ($indexHtml.Contains('home-talks-arrow--next')) 'home talks carousel has a next arrow'
Assert-True (-not [regex]::IsMatch($indexHtml, 'carousel-track|carousel-indicators|carousel-control')) 'home page does not restore the old carousel markup'
Assert-True (-not [regex]::IsMatch($talksJs, 'initHomeCarousel|carousel-track|carousel-indicators|carousel-control|carousel-slide')) 'talks script does not restore the old carousel behavior'
Assert-True ($homeRenderer.Contains('slice(0, 3)')) 'home preview renders exactly three talks'
Assert-True ($homeRenderer.Contains("li.className = 'home-talk-polaroid'")) 'home preview renders mini-polaroid cards'
Assert-True ($homeRenderer.Contains('class="home-talk-title"')) 'home mini-polaroids render titles'
Assert-True ($homeRenderer.Contains('class="home-talk-photo"')) 'home mini-polaroids render photos'
Assert-True ($homeRenderer.Contains('class="home-talk-bottom-space"')) 'home mini-polaroids keep fixed whitespace below the title'
Assert-True ($homeRenderer.IndexOf('${thumb}') -lt $homeRenderer.IndexOf('class="home-talk-title"')) 'home mini-polaroids render image above title'
Assert-True (-not [regex]::IsMatch($homeRenderer, 'talk-venue|venueDetails|whenWhere|talk\.venue|talk\.desc')) 'home mini-polaroids omit venue and description details'
Assert-True ([regex]::IsMatch($styles, '\.home-talks-carousel\s*\{[\s\S]*?grid-template-columns:\s*1\.8rem\s*minmax\(0,\s*1fr\)\s*1\.8rem;')) 'home talks carousel frames one card with small arrows'
Assert-True ([regex]::IsMatch($styles, '#home-talks-list\s*\{[\s\S]*?display:\s*flex;')) 'home talks preview uses a one-card-at-a-time track'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-polaroid\s*\{[\s\S]*?flex:\s*0\s*0\s*100%;')) 'home talks carousel shows one polaroid at a time'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-polaroid\s*\{[\s\S]*?grid-template-rows:\s*auto\s*clamp\(1\.9rem,\s*10cqw,\s*2\.55rem\)\s*clamp\(0\.5rem,\s*3cqw,\s*0\.8rem\);')) 'home mini-polaroids use photo, compact title, and reduced bottom whitespace rows'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-polaroid\s*\{[\s\S]*?--home-polaroid-side-inset:\s*var\(--sp-3\);')) 'home mini-polaroids keep the horizontal photo frame inset'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-polaroid\s*\{[\s\S]*?--home-polaroid-vertical-inset:\s*var\(--sp-2\);')) 'home mini-polaroids use reduced vertical spacing'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-polaroid\s*\{[\s\S]*?--home-polaroid-title-gap:\s*0\.25rem;')) 'home mini-polaroid titles sit closer to the photo'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-polaroid\s*\{[\s\S]*?padding:\s*var\(--home-polaroid-vertical-inset\)\s*var\(--home-polaroid-side-inset\)\s*0;')) 'home mini-polaroids separate vertical and horizontal spacing'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-polaroid\s*\{[\s\S]*?row-gap:\s*var\(--home-polaroid-title-gap\);')) 'home mini-polaroid title distance below the photo uses the title gap'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-title-band\s*\{[\s\S]*?padding-top:\s*0;')) 'home mini-polaroid title spacing is controlled by the card gap'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-title-band\s*\{[\s\S]*?align-items:\s*flex-start;')) 'home mini-polaroid titles start near the photo'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-title\s*\{[\s\S]*?font-family:\s*''Roboto Mono'',\s*var\(--font-mono\);')) 'home mini-polaroid titles use Roboto Mono'
Assert-True ($talksJs.Contains('homeTitles.forEach((title) => fitElementText(title, { max: 1, min: 0.68, step: 0.02 }))')) 'home mini-polaroid titles are fit to the available band'
Assert-True ([regex]::IsMatch($styles, '\.home-talk-photo\s*\{[\s\S]*?width:\s*100%;')) 'home talk photos use the shared side padding'
Assert-True ($talksJs.Contains('list.style.transform = `translateX(-${current * 100}%)`;')) 'home talks carousel advances by translating one card'
Assert-True ($talksJs.Contains("prevBtn.addEventListener('click'")) 'home talks carousel handles previous arrow clicks'
Assert-True ($talksJs.Contains("nextBtn.addEventListener('click'")) 'home talks carousel handles next arrow clicks'

Write-Host 'home talks mini-polaroid contract passed'
