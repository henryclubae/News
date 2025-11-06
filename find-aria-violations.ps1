# Find ARIA violations in TSX files
Write-Host "Searching for ARIA violations..." -ForegroundColor Yellow

$files = Get-ChildItem -Path "src" -Recurse -Filter "*.tsx"
$violations = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $lines = Get-Content $file.FullName
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match 'aria-[^=]+="{[^}]*}"') {
            $violations += [PSCustomObject]@{
                File = $file.Name
                Line = $i + 1
                Content = $line.Trim()
                Path = $file.FullName
            }
        }
    }
}

if ($violations.Count -gt 0) {
    Write-Host "`nFound $($violations.Count) ARIA violations:" -ForegroundColor Red
    $violations | Format-Table -AutoSize
} else {
    Write-Host "No ARIA violations found!" -ForegroundColor Green
}
