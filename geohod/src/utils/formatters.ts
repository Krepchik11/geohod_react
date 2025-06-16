/**
 * Форматирует время относительно текущего момента (например, "5 мин назад", "Вчера")
 * @param date Дата для форматирования
 * @returns Отформатированная строка
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Сейчас';
  }

  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} мин`;
  }

  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Вчера';
  }

  if (date.getFullYear() === now.getFullYear()) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}`;
  }

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`;
}

/**
 * Форматирует дату в формате "день.месяц.год"
 * @param date Дата для форматирования
 * @returns Отформатированная строка
 */
export function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${year}`;
}

/**
 * Форматирует время в формате "часы:минуты"
 * @param date Дата для форматирования
 * @returns Отформатированная строка
 */
export function formatTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
