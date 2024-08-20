@echo off
setlocal

:: 编译 Linux ARM32
set GOOS=linux
set GOARCH=arm
set GOARM=7
set OUTPUT_DIR=.\builds\PandoraHelper-%1-%GOOS%-%GOARCH%
mkdir %OUTPUT_DIR%
mkdir %OUTPUT_DIR%\data
go build -trimpath -ldflags="-s -w" -o %OUTPUT_DIR%\PandoraHelper .\cmd\server\main.go
upx %OUTPUT_DIR%\PandoraHelper
copy .\data\config.json "%OUTPUT_DIR%"\data\

:: 编译 Linux ARM64
set GOOS=linux
set GOARCH=arm64
set OUTPUT_DIR=.\builds\PandoraHelper-%1-%GOOS%-%GOARCH%
mkdir %OUTPUT_DIR%
mkdir %OUTPUT_DIR%\data
go build -trimpath -ldflags="-s -w" -o %OUTPUT_DIR%\PandoraHelper .\cmd\server\main.go
upx %OUTPUT_DIR%\PandoraHelper
copy .\data\config.json "%OUTPUT_DIR%"\data\

:: 编译为Linux 64位
set GOOS=linux
set GOARCH=amd64
set OUTPUT_DIR=.\builds\PandoraHelper-%1-%GOOS%-%GOARCH%
mkdir %OUTPUT_DIR%
mkdir %OUTPUT_DIR%\data
go build -trimpath -ldflags="-s -w" -o %OUTPUT_DIR%\PandoraHelper .\cmd\server\main.go
upx %OUTPUT_DIR%\PandoraHelper
copy .\data\config.json "%OUTPUT_DIR%"\data\

:: 编译 Windows 64 位
set GOOS=windows
set GOARCH=amd64
set OUTPUT_DIR=.\builds\PandoraHelper-%1-%GOOS%-%GOARCH%
mkdir %OUTPUT_DIR%
mkdir %OUTPUT_DIR%\data
go build -trimpath -ldflags="-s -w" -o %OUTPUT_DIR%\PandoraHelper.exe .\cmd\server\main.go
upx %OUTPUT_DIR%\PandoraHelper.exe
copy .\data\config.json "%OUTPUT_DIR%"\data\

:: 编译为macOS 64位
set GOOS=darwin
set GOARCH=amd64
set OUTPUT_DIR=.\builds\PandoraHelper-%1-%GOOS%-%GOARCH%
mkdir %OUTPUT_DIR%
mkdir %OUTPUT_DIR%\data
go build -trimpath -ldflags="-s -w" -o %OUTPUT_DIR%\PandoraHelper .\cmd\server\main.go
copy .\data\config.json "%OUTPUT_DIR%"\data\

:: 编译为freebsd
set GOOS=freebsd
set GOARCH=amd64
set OUTPUT_DIR=.\builds\PandoraHelper-%1-%GOOS%-%GOARCH%
mkdir %OUTPUT_DIR%
mkdir %OUTPUT_DIR%\data
go build -trimpath -ldflags="-s -w" -o %OUTPUT_DIR%\PandoraHelper .\cmd\server\main.go
upx %OUTPUT_DIR%\PandoraHelper
copy .\data\config.json "%OUTPUT_DIR%"\data\

echo Compilation and compression complete.
