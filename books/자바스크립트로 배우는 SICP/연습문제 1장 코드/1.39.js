function tan_cf(x, k) {
  return tan_cont_frac_iter(
    (i) => (i == 1 ? x : x ** 2),
    (i) => 2 * i - 1,
    k
  );
}

function tan_cont_frac_iter(n, d, k) {
  function iter(i, a) {
    return i == 0 ? a : iter(i - 1, n(i) / (d(i) - a));
  }
  return iter(k, n(k) / d(k));
}

const result_1 = tan_cf(1, 5);
const result_2 = Math.tan(1);

console.log(result_1);
console.log(result_2);
