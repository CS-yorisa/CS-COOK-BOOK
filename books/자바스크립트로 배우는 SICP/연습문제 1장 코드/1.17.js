function times(a, b) {
  return fast_times(a, b);
}
function fast_times(a, b) {
  return b === 0
    ? 0
    : is_even(b)
    ? fast_times(double(a), halve(b))
    : fast_times(a, b - 1) + a;
}

function is_even(n) {
  return n % 2 === 0;
}
function double(n) {
  return n + n;
}
function halve(n) {
  return n / 2;
}

const result = times(11, 12);
console.log(result);
