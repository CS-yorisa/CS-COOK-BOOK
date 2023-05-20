function fast_times(a, b) {
  return fast_times_iter(a, b, 0);
}
function fast_times_iter(a, b, n) {
  return b === 0
    ? n
    : is_even(b)
    ? fast_times_iter(double(a), halve(b), n)
    : fast_times_iter(a, b - 1, n + a);
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

const result = fast_times(11, 12);
console.log(result);
