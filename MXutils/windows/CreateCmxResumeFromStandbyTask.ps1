$class = cimclass MSFT_TaskEventTrigger root/Microsoft/Windows/TaskScheduler
$trigger = $class | New-CimInstance -ClientOnly
$trigger.Enabled = $true
$trigger.Subscription = '<QueryList><Query Id="0" Path="System"><Select Path="System">*[System[Provider[@Name=''Microsoft-Windows-Power-Troubleshooter''] and (Level=4 or Level=0) and (EventID=1)]]</Select></Query></QueryList>'
$trigger.Delay = 'PT2M'
$trigger.ExecutionTimeLimit = 'PT10M'

$ActionParameters = @{
    Execute  = 'sc.exe'
    Argument = 'start CumulusMX'
}
$Action = New-ScheduledTaskAction @ActionParameters

$Principal = New-ScheduledTaskPrincipal -UserId 'NT AUTHORITY\SYSTEM' -LogonType ServiceAccount -RunLevel Highest
$Settings = New-ScheduledTaskSettingsSet
$Settings.DisallowStartIfOnBatteries = $false

$RegSchTaskParameters = @{
    TaskName    = 'Start Cumulus MX on resume from standby'
    Description = 'Runs at computer resuming from standby'
    TaskPath    = '\'
    Action      = $Action
    Principal   = $Principal
    Settings    = $Settings
    Trigger     = $Trigger
}
Register-ScheduledTask @RegSchTaskParameters