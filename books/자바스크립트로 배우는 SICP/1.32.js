//a

function accumulate(combiner, null_value, term, a, next, b) {
  return a > b
    ? null_value
    : combiner(
        accumulate(combiner, null_value, term, next(a), next, b),
        term(a)
      );
}

function sum(term, a, next, b) {
  function combiner(x, y) {
    return x + y;
  }
  return accumulate(combiner, 0, term, a, next, b);
}

function product(term, a, next, b) {
  function combiner(x, y) {
    return x * y;
  }
  return accumulate(combiner, 1, term, a, next, b);
}

//b

function accumulateIteration(combiner, null_value, term, a, next, b) {
  function iteration(a, result) {
    return a > b ? result : iteration(next(a), combiner(term(a), result));
  }
  return iteration(a, null_value);
}

function sumIteration(term, a, next, b) {
  function combiner(x, y) {
    return x + y;
  }
  return accumulateIteration(combiner, 0, term, a, next, b);
}
function productIteration(term, a, next, b) {
  function combiner(x,y) {
    return x * y;
  }
  return productIteration(combiner, 1, term, a, next, b);
}
