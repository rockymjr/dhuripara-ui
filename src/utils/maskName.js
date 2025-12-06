export const maskName = (firstName, lastName) => {
  if (!firstName || !lastName) {
    return "******* *******";
  }
  
  const maskString = (str) => {
    if (!str || str.length === 0) return "*****";
    return str[0] + "*".repeat(str.length - 1);
  };