/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
function getPartString(path) {
  let key = "";

  for (let i = 0; i < path.length; i++) {
    const symbol = path[i];

    if (symbol === ".") {
      break;
    }

    key += symbol;
  }

  if (key.length === path.length) {
    return { key, rest: "" };
  }

  return { key, rest: path.substring(key.length + 1) };
}

export function createGetter(path) {
  const { key, rest } = getPartString(path);

  return (obj) => {
    if (!obj) {
      return undefined;
    }

    if (rest == "") {
      return obj[key];
    }

    let nestedGetter = createGetter(rest);
    return nestedGetter(obj[key]);
  };
}
