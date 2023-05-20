function smallest_divisor(n) {
  return find_divisor(n, 2);
}
function find_divisor(n, test_divisor) {
  return square(test_divisor) > n
    ? n
    : divides(test_divisor, n)
    ? test_divisor
    : find_divisor(n, test_divisor + 1);
}

function square(n) {
  return n * n;
}
function divides(a, b) {
  return b % a === 0;
}

const result_1 = smallest_divisor(199);
const result_2 = smallest_divisor(1999);
const result_3 = smallest_divisor(19999);

console.log(result_1);
console.log(result_2);
console.log(result_3);
