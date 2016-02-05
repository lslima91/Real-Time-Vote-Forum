export function put (key, value) {
  window.localStorage.setItem(key, value);
}

export function put2 (key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function get (key) {
  return window.localStorage.getItem(key);
}

export function get2 (key) {
  return JSON.parse(window.localStorage.getItem(key));
}

export function remove (key) {
  return window.localStorage.removeItem(key);
}

export function clear () {
  window.localStorage.clear();
}
