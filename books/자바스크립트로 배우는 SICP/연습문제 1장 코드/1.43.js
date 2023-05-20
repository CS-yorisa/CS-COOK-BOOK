function compose(f, g) {
  return (x) => f(g(x));
}

function square(x) {
  return x * x;
}
function repeated(f, n) {
  return n == 1 ? f : compose(f, repeated(f, n - 1));
}

const result = repeated(square, 2)(5);
console.log(result);
