const dx = 0.00001;

function smooth(f) {
  return (x) => (f(x - dx) + f(x) + f(x + dx)) / 3;
}

function n_smooth(f, n) {
  return repeated(smooth, n)(f);
}
