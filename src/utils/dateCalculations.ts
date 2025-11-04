/**
 * Calculates the number of working days between two ISO date strings (inclusive),
 */
export const calculateWorkdays = (
  startDateStr: string,
  endDateStr: string
): number => {
  // Convert ISO strings to Date objects (setting time to noon for safety)
  const startDate = new Date(startDateStr + "T12:00:00");
  const endDate = new Date(endDateStr + "T12:00:00");

  let totalWorkDays = 0;

  // Convert dates to milliseconds to start the loop
  let currentDate = startDate.getTime();
  const endTime = endDate.getTime();

  // Loop through every day, from the start date up to and including the end date
  while (currentDate <= endTime) {
    const day = new Date(currentDate);
    const dayOfWeek = day.getDay(); // 0 = Sunday, 6 = Saturday

    if (dayOfWeek !== 0) {
      totalWorkDays += 1;
    }

    // Move to the next day: add 24 hours
    currentDate += 1000 * 60 * 60 * 24;
  }

  return totalWorkDays;
};
