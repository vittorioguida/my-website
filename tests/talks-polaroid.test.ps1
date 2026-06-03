$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$talksHtml = Get-Content -Raw -Path (Join-Path $root 'talks.html')
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

$rendererMatch = [regex]::Match($talksJs, 'function initTalksList\(\) \{[\s\S]*?\n  \}')
Assert-True $rendererMatch.Success 'initTalksList exists'

$renderer = $rendererMatch.Value

Assert-True ($talksHtml.Contains('<main class="talks-main">')) 'talks page uses the wider talks-only main container'
Assert-True ($talksHtml.Contains('<ul id="home-talks-list"') -eq $false) 'talks page does not include the home talks preview'
Assert-True ($renderer.Contains('class="talk-polaroid-photo"')) 'talk list renders the image as a polaroid photo figure'
Assert-True ($renderer.IndexOf('${thumb}') -lt $renderer.IndexOf('<h3 class="title"')) 'talk image renders above the title'
Assert-True ($renderer.IndexOf('<h3 class="title"') -lt $renderer.IndexOf('class="talk-venue"')) 'talk venue renders below the title'
Assert-True ($renderer.Contains('class="talk-venue-band"')) 'talk venue has a fixed measuring band'
Assert-True ((-not $renderer.Contains('talk-summary')) -and (-not $renderer.Contains('talk.desc'))) 'talk list does not render descriptions'
Assert-True ([regex]::IsMatch($styles, '#talks-ul\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)')) 'desktop talks grid is capped at three columns'
Assert-True ([regex]::IsMatch($styles, '#talks-ul li\.talk-item\s*\{[\s\S]*?aspect-ratio:\s*0\.78;')) 'talk cards keep a fixed polaroid-like aspect ratio'
Assert-True ([regex]::IsMatch($styles, '#talks-ul li\.talk-item\s*\{[\s\S]*?grid-template-rows:\s*auto\s*var\(--polaroid-title-band\)\s*var\(--polaroid-venue-band\);')) 'talk cards use photo, title, and venue rows'
Assert-True ([regex]::IsMatch($styles, '#talks-ul li\.talk-item\s*\{[\s\S]*?row-gap:\s*0;')) 'talk card caption spacing is controlled by caption padding'
Assert-True ([regex]::IsMatch($styles, '\.talk-polaroid-photo\s*\{[\s\S]*?width:\s*92%;[\s\S]*?justify-self:\s*center;')) 'talk photos have equal left and right frame spacing'
Assert-True ([regex]::IsMatch($styles, '\.talk-content\s*\{[\s\S]*?padding:\s*var\(--sp-2\)\s*0\s*0;')) 'talk titles sit close below the photo'
Assert-True ([regex]::IsMatch($styles, '\.talk-venue-band\s*\{[\s\S]*?padding-top:\s*var\(--sp-1\);')) 'talk venues sit close below the title'
Assert-True ($talksJs.Contains('function fitElementText(element, options)')) 'talk card text has a fit-to-box helper'
Assert-True ($talksJs.Contains('element.scrollHeight > box.clientHeight')) 'talk text is measured against its reserved band'
Assert-True ($talksJs.Contains('scheduleTalkTextFit(list)')) 'talk card text is fit after rendering'
Assert-True ($talksJs.Contains("window.addEventListener('resize'")) 'talk card text is refit on resize'
Assert-True ([regex]::IsMatch($styles, '@media \(max-width:\s*980px\)\s*\{[\s\S]*?#talks-ul\s*\{ grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\); \}')) 'tablet talks grid uses two columns'
Assert-True ([regex]::IsMatch($styles, '@media \(max-width:\s*768px\)\s*\{[\s\S]*?#talks-ul\s*\{ grid-template-columns:\s*1fr; \}')) 'mobile talks grid uses one column'

Write-Host 'talks polaroid layout contract passed'
