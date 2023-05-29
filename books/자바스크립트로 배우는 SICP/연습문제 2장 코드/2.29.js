// a
function left_branch(m) {
  return head(m);
}
function right_branch(m) {
  return head(tail(m));
}
function branch_length(b) {
  return head(b);
}
function branch_structure(b) {
  return head(tail(b));
}

// b
function total_weight(x) {
  return is_null(x)
    ? 0
    : !is_pair(x)
    ? x
    : total_weight(branch_structure(left_branch(x))) +
      total_weight(branch_structure(right_branch(x)));
}

// c
function is_balanced(x) {
  return (
    !is_pair(x) ||
    (is_balanced(branch_structure(left_branch(x))) &&
      is_balanced(branch_structure(right_branch(x))) &&
      total_weight(branch_structure(left_branch(x))) *
        branch_length(left_branch(x)) ===
        total_weight(branch_structure(right_branch(x))) *
          branch_length(right_branch(x)))
  );
}

// d
function left_branch(m) {
  return head(m);
}
function right_branch(m) {
  return tail(m);
}
function branch_length(b) {
  return head(b);
}
function branch_structure(b) {
  return tail(b);
}
