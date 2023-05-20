function fib(n) {
  return fib_iter(1, 0, 0, 1, n);
}
function fib_iter(a, b, p, q, count) {
  return count === 0
    ? b
    : is_even(count)
    ? fib_iter(a, b, square(p) + square(q), square(q) + 2 * p * q, count / 2)
    : fib_iter(b * q + a * q + a * p, b * p + a * q, p, q, count - 1);
}

function is_even(n) {
  return n % 2 === 0;
}
function square(n) {
  return n * n;
}

const result = fib(10);
console.log(result);
