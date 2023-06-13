// function square_tree(tree) { return tree_map(square, tree); }

function tree_map(func, tree) {
  return map(
    (subtree) =>
      is_null(subtree)
        ? null
        : is_pair(subtree)
        ? tree_map(func, subtree)
        : func(subtree),
    tree
  );
}
