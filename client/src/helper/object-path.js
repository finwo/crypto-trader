export function getProperty(subject, path, def = undefined) {
  if ('string' === typeof path) {
    path = path.split('.');
  }

  let reference = subject;
  for(const token of path) {
    if (!(token in reference)) {
      return def;
    }
    reference = reference[token];
  }

  return reference;
}

export function setProperty(subject, path, value) {
  if ('string' === typeof path) {
    path = path.split('.');
  }

  const parentPath = path.slice();
  const lastToken  = parentPath.pop();
  let   reference  = subject;
  for(const token of parentPath) {
    if (('object' !== typeof reference[token]) || !reference[token]) {
      reference[token] = {};
    }
    reference = reference[token];
  }

  reference[lastToken] = value;
}
