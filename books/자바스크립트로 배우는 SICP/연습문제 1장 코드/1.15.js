function cube(x) {
  return x * x * x;
}
function p(x) {
  return 3 * x - 4 * cube(x);
}
function sine(angle) {
  return !(Math.abs(angle) > 0.1) ? angle : p(sine(angle / 3));
}

const result = sine(12.15);
console.log(result);
