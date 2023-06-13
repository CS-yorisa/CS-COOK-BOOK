function horner_eval(x, coefficient_sequence) {
  return accumulate(
    (this_coeff, higher_terms) => x * higher_terms + this_coeff,
    0,
    coefficient_sequence
  );
}
