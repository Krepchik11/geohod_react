export function canShowFinishButton(event: any, user: any) {
  if (!event || !user) return false;
  const isOrganizer = String(event.author.id) === String(user.id);
  const eventDate = new Date(event.date);
  const now = new Date();
  const isToday =
    eventDate.getUTCFullYear() === now.getUTCFullYear() &&
    eventDate.getUTCMonth() === now.getUTCMonth() &&
    eventDate.getUTCDate() === now.getUTCDate();
  return isOrganizer && isToday && event.status !== 'FINISHED' && event.status !== 'CANCELED';
}
