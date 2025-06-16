/**
 * Конфигурация для деплоя Telegram WebApp
 */
const path = require('path');
const fs = require('fs');

const buildDir = path.resolve(__dirname, 'build');
const deployDir = path.resolve(__dirname, 'deploy');

if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(buildDir, deployDir);

console.log('Файлы для деплоя скопированы в директорию deploy/');
console.log(
  'Для публикации в Telegram WebApp загрузите содержимое этой директории на ваш хостинг.'
);
console.log('После загрузки укажите URL в BotFather при создании WebApp URL для вашего бота.');
