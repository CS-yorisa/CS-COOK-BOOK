// a

function filteredACcumulate(filter, combiner, null_value, term, a, next, b) {
  return a > b
    ? null_value
    : filter(a)
    ? combiner(
        filteredACcumulate(
          filter,
          combiner,
          null_value,
          term,
          next(a),
          next,
          b
        ),
        term(a)
      )
    : filteredACcumulate(filter, combiner, null_value, term, next(a), next, b);
}

function isPrime(x) {
  function iteration(y) {
    return y * y > x ? true : x % y === 0 ? false : iteration(inc(y));
  }
  return x < 2 ? false : iteration(2);
}

function sum(x, y) {
  return x + y;
}

function square(x) {
  return x * x;
}

function inc(x) {
  return x + 1;
}

function primeSquaerSum(a, b) {
  return filteredACcumulate(isPrime, sum, 0, square, a, inc, b);
}

// b

function identity(x) {
  return x;
}

function coprimeSum(n) {
  function gcd(a, b) {
    return b == 0 ? a : gcd(b, a % b);
  }
  function isCoprime(x) {
    return gcd(n, x) == 1;
  }
  return filteredACcumulate(isCoprime, sum, 0, identity, 1, inc, n - 1);
}
