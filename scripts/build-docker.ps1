# Скрипт для сборки образа с Docker (PowerShell версия)
# Использование: .\scripts\build-docker.ps1 [tag]

param(
    [string]$Tag = "latest"
)

$ImageName = "geohod-frontend"

Write-Host "Building image $ImageName`:$Tag with Docker..." -ForegroundColor Green

# Проверяем наличие Docker
try {
    $dockerVersion = docker --version
    Write-Host "Docker version: $dockerVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop first" -ForegroundColor Red
    exit 1
}

# Собираем образ
Write-Host "Building image..." -ForegroundColor Yellow
docker build -t $ImageName`:$Tag .

if ($LASTEXITCODE -eq 0) {
    Write-Host "Image $ImageName`:$Tag built successfully!" -ForegroundColor Green
    
    # Показываем информацию об образе
    Write-Host "Image information:" -ForegroundColor Cyan
    docker images $ImageName`:$Tag
} else {
    Write-Host "Failed to build image" -ForegroundColor Red
    exit 1
} 