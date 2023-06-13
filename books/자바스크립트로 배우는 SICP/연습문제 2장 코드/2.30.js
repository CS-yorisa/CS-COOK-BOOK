// 직접 제곱
function square_tree(tree) {
  return is_null(tree)
    ? null
    : !is_pair(tree)
    ? square(tree)
    : pair(square_tree(head(tree)), square_tree(tail(tree)));
}

// map 사용
function square_tree_map(tree) {
  return map(
    (subtree) =>
      !is_pair(subtree) ? square(subtree) : square_tree_map(subtree),
    tree
  );
}
