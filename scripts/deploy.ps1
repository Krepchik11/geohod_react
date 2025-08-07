# Скрипт для деплоя с podman (PowerShell версия)
# Использование: .\scripts\deploy.ps1 [environment] [tag]

param(
    [string]$Environment = "production",
    [string]$Tag = "latest"
)

$ContainerName = "geohod-frontend-$Environment"
$ImageName = "geohod-frontend"

Write-Host "Deploying $ImageName`:$Tag to $Environment environment..." -ForegroundColor Green

# Останавливаем существующий контейнер если он запущен
Write-Host "Stopping existing container..." -ForegroundColor Yellow
podman stop $ContainerName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Container stopped" -ForegroundColor Green
}

# Удаляем существующий контейнер
Write-Host "Removing existing container..." -ForegroundColor Yellow
podman rm $ContainerName 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Container removed" -ForegroundColor Green
}

# Удаляем старые образы (оставляем только последние 3)
Write-Host "Cleaning old images..." -ForegroundColor Yellow
$oldImages = podman images $ImageName --format "table {{.Repository}}:{{.Tag}}" | Select-Object -Skip 1 | Sort-Object -Descending | Select-Object -Skip 3
if ($oldImages) {
    $oldImages | ForEach-Object { podman rmi $_ 2>$null }
    Write-Host "Old images cleaned" -ForegroundColor Green
}

# Запускаем новый контейнер
Write-Host "Starting new container..." -ForegroundColor Yellow
$port = if ($Environment -eq "production") { "8080:8080" } else { "8081:8080" }

podman run -d `
    --name $ContainerName `
    --restart unless-stopped `
    -p $port `
    -e NODE_ENV=$Environment `
    $ImageName`:$Tag

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    
    # Показываем статус контейнера
    Write-Host "Container status:" -ForegroundColor Cyan
    podman ps -f name=$ContainerName
    
    # Показываем логи
    Write-Host "Recent logs:" -ForegroundColor Cyan
    podman logs --tail 10 $ContainerName
} else {
    Write-Host "Failed to deploy container" -ForegroundColor Red
    exit 1
} 