function head(items) {
  return items[0];
}

function tail(items) {
  return items[items.length - 1];
}

function for_each(func, items) {
  if (items.length === 0) {
    return true;
  } else {
    func(head(items));
    for_each(func, items.slice(1));
  }
}

for_each(console.log, [57, 321, 88]);
