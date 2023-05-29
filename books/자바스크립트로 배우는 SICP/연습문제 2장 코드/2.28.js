function fringe(x) {
  return is_null(x)
    ? null
    : is_pair(x)
    ? append(fringe(head(x)), fringe(tail(x)))
    : list(x);
}
