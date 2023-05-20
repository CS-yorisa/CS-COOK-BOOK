function fast_expt(b, n) {
  return fast_expt_iter(b, n, 1);
}
function fast_expt_iter(b, n, a) {
  return n === 0
    ? a
    : is_even(n)
    ? fast_expt_iter(square(b), n / 2, a)
    : fast_expt_iter(b, n - 1, a * b);
}

function is_even(n) {
  return n % 2 === 0;
}
function square(n) {
  return n * n;
}

const result = fast_expt(5, 4);
console.log(result);
