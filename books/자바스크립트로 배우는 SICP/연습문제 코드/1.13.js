const pi = (1 + 5 ** 0.5) / 2;

function fibonacci(n) {
  return n === 1 || n === 2 ? 1 : fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(1), pi / 5 ** 0.5);
console.log(fibonacci(2), pi ** 2 / 5 ** 0.5);
console.log(fibonacci(3), pi ** 3 / 5 ** 0.5);
console.log(fibonacci(5), pi ** 5 / 5 ** 0.5);
console.log(fibonacci(10), pi ** 10 / 5 ** 0.5);
