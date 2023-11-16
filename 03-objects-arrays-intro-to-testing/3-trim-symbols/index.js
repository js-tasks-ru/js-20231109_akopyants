/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return "";
  }

  if (!size) {
    return string;
  }

  let repeated = 1;

  const result = string
    .split("")
    .filter((curr, index, arr) => {
      const next = arr[index + 1];
      repeated = curr === next ? repeated + 1 : 1;

      return repeated <= size;
    })
    .join("");

  return result;
}
