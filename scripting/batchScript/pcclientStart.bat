::this simple script delays the start of pc-client until there is ping to the indicated server
@echo off
:pinging
echo pinging...
set papercutServer=google.cl
%SystemRoot%\system32\ping.exe -n 1 %papercutServer% >nul
if errorlevel 1 goto NoServer

echo %papercutServer% is availabe.
start /d "%ProgramFiles(x86)%\PaperCut MF Client\" pc-client.exe
goto :EOF

:NoServer
echo %MyServer% is not availabe yet.
goto pinging
