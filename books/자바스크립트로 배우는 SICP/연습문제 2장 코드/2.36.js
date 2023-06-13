function accumulate_n(op, init, seqs) {
  return is_null(head(seqs))
    ? null
    : pair(
        accumulate(
          op,
          init,
          map((x) => head(x), seqs)
        ),
        accumulate_n(
          op,
          init,
          map((x) => tail(x), seqs)
        )
      );
}
