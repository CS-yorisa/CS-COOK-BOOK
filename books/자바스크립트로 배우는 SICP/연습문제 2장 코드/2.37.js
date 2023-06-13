function matrix_times_vector(m, v) {
  return map((row) => dot_product(row, v), m);
}
function transpose(mat) {
  return accumulate_n(pair, null, mat);
}
function matrix_times_matrix(n, m) {
  const cols = transpose(m);
  return map((x) => map((y) => dot_product(x, y), cols), n);
}
