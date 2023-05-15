const tolerance = 0.00001;
function abs(x) {
  return x > 0 ? x : -x;
}

function fixed_point(f, first_guess) {
  function close_enough(x, y) {
    return abs(x - y) < tolerance;
  }
  function try_with(guess) {
    const next = f(guess);
    return close_enough(guess, next) ? next : try_with(next);
  }

  return try_with(first_guess);
}

console.log(fixed_point((x) => 1 + 1 / x, 1)); // 1.6180327868852458
console.log((1 + 5 ** 0.5) / 2); // 1.618033988749895
