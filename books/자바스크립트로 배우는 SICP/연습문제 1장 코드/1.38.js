function cont_frac(n, d, k) {
  function search(k, i) {
    return k === i ? n(i) / d(i) : n(i) / (d(i) + search(k, i + 1));
  }
  return search(k, 1);
}

// e = 2.7182...
// e - 2 = 0.7182...

console.log(
  cont_frac(
    (i) => 1,
    (i) => (i % 3 == 2 ? (1 + Math.floor(i / 3)) * 2 : 1),
    1000
  )
); // 0.7182818284590453
