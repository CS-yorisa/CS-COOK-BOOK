const tolerance = 0.00001;
function abs(x) {
  return x > 0 ? x : -x;
}

function fixed_point(f, first_guess) {
  function close_enough(x, y) {
    return abs(x - y) < tolerance;
  }
  function try_with(guess) {
    console.log(guess);
    const next = f(guess);
    return close_enough(guess, next) ? next : try_with(next);
  }

  return try_with(first_guess);
}

function average(x, y) {
  return (x + y) / 2;
}

const fixed = fixed_point((x) => Math.log(1000) / Math.log(x), 2);
const averageFixed = fixed_point(
  (x) => average(x, Math.log(1000) / Math.log(x)),
  2
);

console.log(fixed); // 4.555532270803653
console.log(fixed ** fixed); // 999.9913579312362
console.log(abs(1000 - fixed ** fixed)); // 0.008642068763833777
console.log(averageFixed); // 4.555537551999825
console.log(averageFixed ** averageFixed); // 1000.0046472054871
console.log(abs(1000 - averageFixed ** averageFixed)); // 0.0046472054871173896
