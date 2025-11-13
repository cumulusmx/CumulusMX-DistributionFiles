# Check for administrative privileges
if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator." -ForegroundColor Red
    exit 1
}

# Define parameters for firewall rules
# The path the CumulusMX.exe in the same folder structure as this script
$exePath = Join-Path -Path $PSScriptRoot -Childpath "..\..\CumulusMX.exe" | Resolve-Path

$rules = @(
    @{ Name = "Allow CumulusMX TCP 8998"; Port = 8998; Protocol = "TCP" },
    @{ Name = "Allow CumulusMX UDP 8998"; Port = 8998; Protocol = "UDP" }
    @{ Name = "Allow CumulusMX UDP 22222"; Port = 22222; Protocol = "UDP" }
)

foreach ($rule in $rules) {
    $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "Firewall rule '$($rule.Name)' already exists." -ForegroundColor Yellow
    } else {
        New-NetFirewallRule `
            -DisplayName $rule.Name `
            -Direction Inbound `
            -Program $exePath `
            -Action Allow `
            -Protocol $rule.Protocol `
            -LocalPort $rule.Port `
            -Profile Any | Out-Null

        Write-Host "Firewall rule '$($rule.Name)' created successfully." -ForegroundColor Green
    }
}
