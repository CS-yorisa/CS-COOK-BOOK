// a
function cont_frac(n, d, k) {
  function search(k, i) {
    return k === i ? n(i) / d(i) : n(i) / (d(i) + search(k, i + 1));
  }
  return search(k, 1);
}

// 1 / pi = 0.618033...
console.log("a");
console.log(
  cont_frac(
    (i) => 1,
    (i) => 1,
    5
  )
); // 0.625
console.log(
  cont_frac(
    (i) => 1,
    (i) => 1,
    10
  )
); // 0.6179775280898876
console.log(
  cont_frac(
    (i) => 1,
    (i) => 1,
    11
  )
); // 0.6180555555555556
console.log(
  cont_frac(
    (i) => 1,
    (i) => 1,
    12
  )
); // 0.6180257510729613

// b
function cont_frac_iter(n, d, k) {
  function search(k, i, res) {
    return k === i ? res : search(k, i + 1, n(i) / (d(i) + res));
  }
  return search(k, 1, 0);
}

console.log("b");
console.log(
  cont_frac_iter(
    (i) => 1,
    (i) => 1,
    10
  )
); // 0.6181818181818182
console.log(
  cont_frac_iter(
    (i) => 1,
    (i) => 1,
    11
  )
); // 0.6179775280898876
console.log(
  cont_frac_iter(
    (i) => 1,
    (i) => 1,
    12
  )
); // 0.6180555555555556
console.log(
  cont_frac_iter(
    (i) => 1,
    (i) => 1,
    13
  )
); // 0.6180257510729613
