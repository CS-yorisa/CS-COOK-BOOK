function A(x, y) {
  return y === 0 ? 0 : x === 0 ? 2 * y : y === 1 ? 2 : A(x - 1, A(x, y - 1));
}

console.log(A(1, 10)); //1024
console.log(A(2, 4)); // 65536
console.log(A(3, 3)); // 65536

function f(n) {
  return A(0, n);
} // n * 2

console.log(f(0)); // 0
console.log(f(1)); // 2
console.log(f(2)); // 4
console.log(f(3)); // 6

function g(n) {
  return A(1, n);
} // 2 ^ n

console.log(g(0)); // 0
console.log(g(1)); // 2
console.log(g(2)); // 4
console.log(g(3)); // 8
console.log(g(4)); // 16

function h(n) {
  return A(2, n);
} // 2 ^ h(n - 1)

console.log(h(0)); // 0
console.log(h(1)); // 2
console.log(h(2)); // 4
console.log(h(3)); // 16
console.log(h(4)); // 65536
// console.log(h(5)); max recursion error
