module.exports = (Buffer => ({
  padstring(str) {
    const sl  = 4;
    const len = str.length;
    const diff = len % sl;
    if (!diff) return str;
    let p = len;
    let pl = sl - diff;
    let psl = len + pl;
    let b = Buffer.alloc(psl);
    b.write(str);
    b.write('='.repeat(pl), p);
    return b.toString();
  },
  toBase64(base64url) {
    base64url = base64url.toString();
    return module.exports.padstring(base64url)
      .replace(/\-/g,"+")
      .replace(/_/g,"/");
  },
  fromBase64(base64) {
    return base64
      .replace(/=/g,'')
      .replace(/\+/g,'-')
      .replace(/\//g,'_');
  },
  toBuffer(base64url) {
    return Buffer.from(module.exports.toBase64(base64url), 'base64');
  },
  encode(input, encoding = 'utf-8') {
    if (Buffer.isBuffer(input)) return module.exports.fromBase64(input.toString('base64'));
    return module.exports.fromBase64(Buffer.from(input, encoding).toString('base64'));
  },
  decode(base64url, encoding = 'utf-8') {
    return module.exports.toBuffer(base64url).toString(encoding);
  },
}))('function' === typeof Buffer ? Buffer : require('buffer'));
