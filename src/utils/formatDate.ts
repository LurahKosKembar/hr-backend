/**
 * Formats the current date into 'DD-MM-YYYY' string format.
 */
export const formatDate = (): string => {
  const date: Date = new Date();

  const day: string = String(date.getDate()).padStart(2, "0");
  const month: string = String(date.getMonth() + 1).padStart(2, "0");
  const year: number = date.getFullYear();

  return `${year}-${month}-${day}`;
};

/**
 * Formats the current time into 'HH:mm:ss' string format.
 */
export function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Formats a date object or string into the 'YYYY-MM-DD HH:MM:SS' format,
 */
export const formatMariaDBDatetime = (
  argsDate: Date | string | number
): string => {
  const date: Date = new Date(argsDate);

  // Utility function to pad single digits
  const pad = (n: number): string => n.toString().padStart(2, "0");

  const year: number = date.getFullYear();
  const month: string = pad(date.getMonth() + 1);
  const day: string = pad(date.getDate());
  const hours: string = pad(date.getHours());
  const minutes: string = pad(date.getMinutes());
  const seconds: string = pad(date.getSeconds());

  const formattedDatetime: string = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedDatetime;
};

/**
 * Formats the current datetime into 'YYYYMMDDHHMMSS' string format for API responses.
 */
export const formatAPIResponseDatetime = (): string => {
  const date: Date = new Date();
  const pad = (n: number): string => n.toString().padStart(2, "0");

  const year: number = date.getFullYear();
  const month: string = pad(date.getMonth() + 1);
  const day: string = pad(date.getDate());
  const hours: string = pad(date.getHours());
  const minutes: string = pad(date.getMinutes());
  const seconds: string = pad(date.getSeconds());

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};
