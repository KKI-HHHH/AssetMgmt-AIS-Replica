
export const formatDisplayDate = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '-';
  let date: Date;
  
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    // Handle DD/MM/YYYY format
    if (dateInput.includes('/') && !dateInput.includes('T')) {
      const parts = dateInput.split('/');
      if (parts.length === 3) {
        // Assume DD/MM/YYYY
        date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      } else {
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }
  } else {
    return '-';
  }

  if (isNaN(date.getTime())) return String(dateInput);

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatDetailedDate = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '-';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${minutes}`;
};
