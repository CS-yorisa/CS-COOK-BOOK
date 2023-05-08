// 책에서 제시된 방법
function abs(x) {
  return x > 0 ? x : x === 0 ? 0 : -x;
}

function square(x) {
  return x * x;
}

function average(x, y) {
  return (x + y) / 2;
}

function improve(guess, x) {
  return average(guess, x / guess);
}

function is_good_enough(guess, x) {
  return abs(square(guess) - x) < 0.001;
}

function sqrt_iter(guess, x) {
  return is_good_enough(guess, x) ? guess : sqrt_iter(improve(guess, x), x);
}

function sqrt(x) {
  return sqrt_iter(1, x);
}

// 비율을 활용하여 추측
function ratio_is_good_enough(guess, x) {
  return abs(square(guess) - x) / abs(x) < 0.001;
}

function ratio_sqrt_iter(guess, x) {
  return ratio_is_good_enough(guess, x)
    ? guess
    : ratio_sqrt_iter(improve(guess, x), x);
}

function ratio_sqrt(x) {
  return ratio_sqrt_iter(1, x);
}

// 작은 수에 대한 판정
let x = 0.00001;
let relative = sqrt(x);
let ratio = ratio_sqrt(x);

console.log(relative); // 0.03135649010771716
console.log(ratio); //0.0031622926477232706

console.log(square(relative), abs(x - square(relative))); // 0.0009832294718753643 0.0009732294718753642
console.log(square(ratio), abs(x - square(ratio))); // 0.000010000094789844653 9.478984465262992e-11

// 큰 수에 대한 판정
x = 1000000;
relative = sqrt(x);
ratio = ratio_sqrt(x);

console.log(square(relative)); // 1000000.0000000236
console.log(square(ratio)); // 1000000.3066033493
