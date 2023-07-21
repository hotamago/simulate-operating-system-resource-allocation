function getRndIntegerInclude(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export { getRndIntegerInclude, getRndInteger };
