function gcd(a, b) {
  return b === 0 ? a : gcd(b, rem(a, b));
}

function rem(a, b) {
  return a % b;
}

const result = gcd(206, 40);
console.log(result);
