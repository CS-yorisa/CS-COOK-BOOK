const dx = 0.00001;
const tolerance = 0.00001;

function fixed_point(f, first_guess) {
  function close_enough(x, y) {
    return Math.abs(x - y) < tolerance;
  }
  function try_with(guess) {
    const next = f(guess);
    return close_enough(guess, next) ? next : try_with(next);
  }
  return try_with(first_guess);
}

function deriv(g) {
  return (x) => (g(x + dx) - g(x)) / dx;
}

function newton_transform(g) {
  return (x) => x - g(x) / deriv(g)(x);
}
function newtons_method(g, guess) {
  return fixed_point(newton_transform(g), guess);
}

function cubic(a, b, c) {
  return (x) => x ** 3 + a * x ** 2 + b * x + c;
}

const result = newtons_method(cubic(3, 5, 7), 1);
console.log(result);
