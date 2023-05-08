function abs(x) {
  return x > 0 ? x : x === 0 ? 0 : -x;
}

function square(x) {
  return x * x;
}

function cubic(x) {
  return x * x * x;
}

// 제곱근을 활용해서 확인하는 방법에서 세제곱 함수를 넣는 방식으로 변경
function is_good_enough(guess, x) {
  return abs(cubic(guess) - x) < 0.001;
}

// 수의 차이를 비교하는 식을 함수로 표현
function improve(guess, x) {
  return (x / square(guess) + 2 * guess) / 3;
}

function sqrt3_iter(guess, x) {
  return is_good_enough(guess, x) ? guess : sqrt3_iter(improve(guess, x), x);
}

function sqrt3(x) {
  return sqrt3_iter(1, x);
}

console.log(sqrt3(8)); // 2.000004911675504
console.log(cubic(sqrt3(8))); //8.000058940250797
