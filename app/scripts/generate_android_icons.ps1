param(
    [Parameter(Mandatory = $true)]
    [string] $Source,

    [ValidateRange(0.4, 1.1)]
    [double] $AdaptiveScale = 1.0,

    [ValidateRange(0.5, 1.1)]
    [double] $LegacyScale = 1.0
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$resourceRoot = Join-Path $PSScriptRoot '..\android\app\src\main\res'
$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

function Export-Icon {
    param(
        [string] $Path,
        [int] $Size,
        [bool] $Round,
        [double] $ArtworkScale,
        [bool] $TransparentBackground
    )

    $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $clip = $null
    try {
        if ($TransparentBackground) {
            $graphics.Clear([System.Drawing.Color]::Transparent)
        }
        else {
            $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#18082F'))
        }
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

        if ($Round) {
            $clip = New-Object System.Drawing.Drawing2D.GraphicsPath
            $clip.AddEllipse(0, 0, $Size, $Size)
            $graphics.SetClip($clip)
        }

        $artworkSize = [int][Math]::Round($Size * $ArtworkScale)
        $artworkOffset = [int][Math]::Round(($Size - $artworkSize) / 2)
        $destination = New-Object System.Drawing.Rectangle(
            $artworkOffset,
            $artworkOffset,
            $artworkSize,
            $artworkSize
        )
        $graphics.DrawImage(
            $sourceImage,
            $destination,
            0,
            0,
            $sourceImage.Width,
            $sourceImage.Height,
            [System.Drawing.GraphicsUnit]::Pixel
        )
        $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        if ($clip) { $clip.Dispose() }
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

try {
    $densities = @{
        'mdpi' = @{ launcher = 48; foreground = 108 }
        'hdpi' = @{ launcher = 72; foreground = 162 }
        'xhdpi' = @{ launcher = 96; foreground = 216 }
        'xxhdpi' = @{ launcher = 144; foreground = 324 }
        'xxxhdpi' = @{ launcher = 192; foreground = 432 }
    }

    foreach ($density in $densities.Keys) {
        $directory = Join-Path $resourceRoot "mipmap-$density"
        $sizes = $densities[$density]
        Export-Icon (Join-Path $directory 'ic_launcher.png') $sizes.launcher $false $LegacyScale $false
        Export-Icon (Join-Path $directory 'ic_launcher_round.png') $sizes.launcher $true $LegacyScale $false
        Export-Icon (Join-Path $directory 'ic_launcher_foreground.png') $sizes.foreground $false $AdaptiveScale $true
    }
}
finally {
    $sourceImage.Dispose()
}

Write-Output "Generated Android launcher icons from $sourcePath"
