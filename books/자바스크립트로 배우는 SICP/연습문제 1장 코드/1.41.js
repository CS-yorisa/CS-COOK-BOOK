function inc(x) {
  return x + 1;
}

function double(f) {
  return (x) => f(f(x));
}

const result = double(double(double))(inc)(5);
console.log(result);
