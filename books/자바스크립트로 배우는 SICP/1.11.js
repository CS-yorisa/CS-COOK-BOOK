function f(n) {
  return n < 3 ? n : f(n - 1) + 2 * f(n - 2) + 3 * f(n - 3);
}

console.log(f(1)); // 1
console.log(f(2)); // 2
console.log(f(3)); // 4
console.log(f(4)); // 11
console.log(f(5)); // 25

function fRecursive(x, y, z, n) {
  return n === 0 ? x : fRecursive(y, z, x * 3 + y * 2 + z, n - 1);
}

console.log(fRecursive(0, 1, 2, 1));
console.log(fRecursive(0, 1, 2, 2));
console.log(fRecursive(0, 1, 2, 3));
console.log(fRecursive(0, 1, 2, 4));
console.log(fRecursive(0, 1, 2, 5));
