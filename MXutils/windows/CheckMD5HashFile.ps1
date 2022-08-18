param (
    [Parameter(Mandatory=$true)][string]$HashFile
)

$infile = Get-Item -Path $HashFile
$hasFileName = $infile.Name

$SourceDir = Split-Path -Parent $infile

$Result = foreach ($Line in (Get-Content -LiteralPath $infile)) {
    if ($Line[0] -eq '#') {
        continue
    }

    $Hash, [string] $TestFileName = $Line.Split()
    $FullTestFileName = Join-Path -Path $SourceDir -ChildPath $TestFileName.Trim()
    if (Test-Path -LiteralPath $FullTestFileName) {
        $THash = (Get-FileHash -LiteralPath $FullTestFileName -Algorithm 'MD5').Hash
    } else {
        $THash = '__N/A__'
    }

    [PSCustomObject] @{
        FileName = $TestFileName.Trim()
        CopyOK = $THash -eq $Hash
        OriHash = $Hash
        CopyHash = $THash
    }
}

$out = $Result.Where({$_.CopyOK -eq $False})

if ($out.Count -eq 0) {
    Write-Host "All checksums are OK" -ForegroundColor Green
} else {
    $out
}