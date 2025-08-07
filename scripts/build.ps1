# Скрипт для сборки образа с podman (PowerShell версия)
# Использование: .\scripts\build.ps1 [tag]

param(
    [string]$Tag = "latest"
)

$ImageName = "geohod-frontend"

Write-Host "Building image $ImageName`:$Tag..." -ForegroundColor Green

# Проверяем наличие podman
try {
    $podmanVersion = podman --version
    Write-Host "Podman version: $podmanVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Podman is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install podman first" -ForegroundColor Red
    exit 1
}

# Собираем образ
Write-Host "Building image..." -ForegroundColor Yellow
podman build -t $ImageName`:$Tag .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Image $ImageName`:$Tag built successfully!" -ForegroundColor Green
    
    # Показываем информацию об образе
    Write-Host "Image information:" -ForegroundColor Cyan
    podman images $ImageName`:$Tag
} else {
    Write-Host "Failed to build image" -ForegroundColor Red
    exit 1
} 