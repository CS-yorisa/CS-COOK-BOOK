function pascal(i, j) {
  // i 행 j 열의 값
  return i < j
    ? 0
    : i === 0 || j === 0
    ? 1
    : pascal(i - 1, j - 1) + pascal(i - 1, j);
}

console.log(pascal(2, 1));
console.log(pascal(3, 1));
console.log(pascal(3, 2));
console.log(pascal(4, 0));
console.log(pascal(4, 1));
console.log(pascal(4, 2));
console.log(pascal(4, 3));
console.log(pascal(4, 4));
console.log(pascal(4, 5));
