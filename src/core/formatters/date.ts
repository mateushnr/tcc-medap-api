export function formatDate(dateStr: string | undefined) {
  if (dateStr) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }

  return dateStr;
}
