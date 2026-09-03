/** Returns a new Date that is `days` after (or before, if negative) `date`. */
export const addDays = (date, days) => {
  const result = new Date(date.valueOf());
  result.setDate(result.getDate() + days);
  return result;
};

export default addDays;
