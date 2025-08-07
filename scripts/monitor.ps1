# Скрипт для мониторинга контейнеров (PowerShell версия)
# Использование: .\scripts\monitor.ps1 [container_name]

param(
    [string]$ContainerName = "geohod-frontend-production"
)

Write-Host "Monitoring container $ContainerName..." -ForegroundColor Green
Write-Host ""

# Проверяем статус контейнера
Write-Host "Container status:" -ForegroundColor Yellow
$containerStatus = podman ps -q -f name=$ContainerName
if ($containerStatus) {
    Write-Host "Container is running" -ForegroundColor Green
    podman ps -f name=$ContainerName
} else {
    Write-Host "Container is not running" -ForegroundColor Red
    Write-Host "Available containers:" -ForegroundColor Yellow
    podman ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
    exit 1
}

Write-Host ""

# Показываем использование ресурсов
Write-Host "Resource usage:" -ForegroundColor Yellow
podman stats --no-stream $ContainerName

Write-Host ""

# Показываем последние логи
Write-Host "Recent logs (10 lines):" -ForegroundColor Yellow
podman logs --tail 10 $ContainerName

Write-Host ""

# Проверяем доступность приложения
Write-Host "Application availability check:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -Method GET -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Application is available (HTTP 200)" -ForegroundColor Green
    } else {
        Write-Host "Application returned status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Application is not available" -ForegroundColor Red
}

Write-Host ""

# Показываем информацию о портах
Write-Host "Port information:" -ForegroundColor Yellow
podman port $ContainerName

Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  Real-time logs: podman logs -f $ContainerName" -ForegroundColor White
Write-Host "  Enter container: podman exec -it $ContainerName sh" -ForegroundColor White
Write-Host "  Restart: podman restart $ContainerName" -ForegroundColor White 