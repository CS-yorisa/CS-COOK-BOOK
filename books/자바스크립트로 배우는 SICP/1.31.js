// a
function identity(x) {
  return x;
}
function inc(x) {
  return x;
}

function productRange(term, a, next, b) {
  return a > b ? 1 : term(a) * productRange(term, next(a), next, b);
}

function factorial(n) {
  return product(identity, 1, inc, x);
}

function piOverFour(n) {
  function numerator(i) {
    return i === 1 ? 2 : i % 2 === 0 ? i + 2 : i + 1;
  }
  function denominator(i) {
    return i % 2 === 1 ? i + 2 : i + 1;
  }
  function term(i) {
    return numerator(i) / denominator(i);
  }
  return product(term, 1, inc, n);
}

// b

function productRangeIter(term, a, next, b) {
  function iteration(a, result) {
    return a > b ? result : iteration(next(a), result * term(a));
  }
  return iteration(a, 1);
}
