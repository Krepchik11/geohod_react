# Скрипт для мониторинга контейнеров с Docker (PowerShell версия)
# Использование: .\scripts\monitor-docker.ps1 [container_name]

param(
    [string]$ContainerName = "geohod-frontend-production"
)

Write-Host "Monitoring container $ContainerName with Docker..." -ForegroundColor Green
Write-Host ""

# Проверяем статус контейнера
Write-Host "Container status:" -ForegroundColor Yellow
$containerStatus = docker ps -q -f name=$ContainerName
if ($containerStatus) {
    Write-Host "Container is running" -ForegroundColor Green
    docker ps -f name=$ContainerName
} else {
    Write-Host "Container is not running" -ForegroundColor Red
    Write-Host "Available containers:" -ForegroundColor Yellow
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
    exit 1
}

Write-Host ""

# Показываем использование ресурсов
Write-Host "Resource usage:" -ForegroundColor Yellow
docker stats --no-stream $ContainerName

Write-Host ""

# Показываем последние логи
Write-Host "Recent logs (10 lines):" -ForegroundColor Yellow
docker logs --tail 10 $ContainerName

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
docker port $ContainerName

Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  Real-time logs: docker logs -f $ContainerName" -ForegroundColor White
Write-Host "  Enter container: docker exec -it $ContainerName sh" -ForegroundColor White
Write-Host "  Restart: docker restart $ContainerName" -ForegroundColor White 