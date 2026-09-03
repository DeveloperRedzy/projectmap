/** "Jane" + "Doe" -> "JD". Falls back to '?' when both names are missing. */
export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}` || '?';
};

export default getInitials;
