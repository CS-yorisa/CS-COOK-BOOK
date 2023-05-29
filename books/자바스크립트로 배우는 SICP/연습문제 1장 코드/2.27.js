function deep_reverse(items) {
  if (typeof items === "number") {
    return items;
  } else {
    return items.map(deep_reverse).reverse();
  }
}

console.log(deep_reverse([1, 2, 3, 4]));
console.log(
  deep_reverse([
    [1, 2],
    [3, 4],
  ])
);
