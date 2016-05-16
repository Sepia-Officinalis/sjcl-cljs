var sjcl = {cipher:{}, hash:{}, keyexchange:{}, mode:{}, misc:{}, codec:{}, exception:{corrupt:function(a) {
  this.toString = function() {
    return "CORRUPT: " + this.message;
  };
  this.message = a;
}, invalid:function(a) {
  this.toString = function() {
    return "INVALID: " + this.message;
  };
  this.message = a;
}, bug:function(a) {
  this.toString = function() {
    return "BUG: " + this.message;
  };
  this.message = a;
}, notReady:function(a) {
  this.toString = function() {
    return "NOT READY: " + this.message;
  };
  this.message = a;
}}};
"undefined" !== typeof module && module.exports && (module.exports = sjcl);
"function" === typeof define && define([], function() {
  return sjcl;
});
sjcl.cipher.aes = function(a) {
  this._tables[0][0][0] || this._precompute();
  var b, c, d, e, f = this._tables[0][4], g = this._tables[1];
  b = a.length;
  var h = 1;
  if (4 !== b && 6 !== b && 8 !== b) {
    throw new sjcl.exception.invalid("invalid aes key size");
  }
  this._key = [d = a.slice(0), e = []];
  for (a = b;a < 4 * b + 28;a++) {
    c = d[a - 1];
    if (0 === a % b || 8 === b && 4 === a % b) {
      c = f[c >>> 24] << 24 ^ f[c >> 16 & 255] << 16 ^ f[c >> 8 & 255] << 8 ^ f[c & 255], 0 === a % b && (c = c << 8 ^ c >>> 24 ^ h << 24, h = h << 1 ^ 283 * (h >> 7));
    }
    d[a] = d[a - b] ^ c;
  }
  for (b = 0;a;b++, a--) {
    c = d[b & 3 ? a : a - 4], e[b] = 4 >= a || 4 > b ? c : g[0][f[c >>> 24]] ^ g[1][f[c >> 16 & 255]] ^ g[2][f[c >> 8 & 255]] ^ g[3][f[c & 255]];
  }
};
sjcl.cipher.aes.prototype = {encrypt:function(a) {
  return this._crypt(a, 0);
}, decrypt:function(a) {
  return this._crypt(a, 1);
}, _tables:[[[], [], [], [], []], [[], [], [], [], []]], _precompute:function() {
  var a = this._tables[0], b = this._tables[1], c = a[4], d = b[4], e, f, g, h = [], k = [], m, l, n, p;
  for (e = 0;256 > e;e++) {
    k[(h[e] = e << 1 ^ 283 * (e >> 7)) ^ e] = e;
  }
  for (f = g = 0;!c[f];f ^= m || 1, g = k[g] || 1) {
    for (n = g ^ g << 1 ^ g << 2 ^ g << 3 ^ g << 4, n = n >> 8 ^ n & 255 ^ 99, c[f] = n, d[n] = f, l = h[e = h[m = h[f]]], p = 16843009 * l ^ 65537 * e ^ 257 * m ^ 16843008 * f, l = 257 * h[n] ^ 16843008 * n, e = 0;4 > e;e++) {
      a[e][f] = l = l << 24 ^ l >>> 8, b[e][n] = p = p << 24 ^ p >>> 8;
    }
  }
  for (e = 0;5 > e;e++) {
    a[e] = a[e].slice(0), b[e] = b[e].slice(0);
  }
}, _crypt:function(a, b) {
  if (4 !== a.length) {
    throw new sjcl.exception.invalid("invalid aes block size");
  }
  var c = this._key[b], d = a[0] ^ c[0], e = a[b ? 3 : 1] ^ c[1], f = a[2] ^ c[2], g = a[b ? 1 : 3] ^ c[3], h, k, m, l = c.length / 4 - 2, n, p = 4, r = [0, 0, 0, 0];
  h = this._tables[b];
  var t = h[0], H = h[1], G = h[2], x = h[3], y = h[4];
  for (n = 0;n < l;n++) {
    h = t[d >>> 24] ^ H[e >> 16 & 255] ^ G[f >> 8 & 255] ^ x[g & 255] ^ c[p], k = t[e >>> 24] ^ H[f >> 16 & 255] ^ G[g >> 8 & 255] ^ x[d & 255] ^ c[p + 1], m = t[f >>> 24] ^ H[g >> 16 & 255] ^ G[d >> 8 & 255] ^ x[e & 255] ^ c[p + 2], g = t[g >>> 24] ^ H[d >> 16 & 255] ^ G[e >> 8 & 255] ^ x[f & 255] ^ c[p + 3], p += 4, d = h, e = k, f = m;
  }
  for (n = 0;4 > n;n++) {
    r[b ? 3 & -n : n] = y[d >>> 24] << 24 ^ y[e >> 16 & 255] << 16 ^ y[f >> 8 & 255] << 8 ^ y[g & 255] ^ c[p++], h = d, d = e, e = f, f = g, g = h;
  }
  return r;
}};
sjcl.bitArray = {bitSlice:function(a, b, c) {
  a = sjcl.bitArray._shiftRight(a.slice(b / 32), 32 - (b & 31)).slice(1);
  return void 0 === c ? a : sjcl.bitArray.clamp(a, c - b);
}, extract:function(a, b, c) {
  var d = Math.floor(-b - c & 31);
  return ((b + c - 1 ^ b) & -32 ? a[b / 32 | 0] << 32 - d ^ a[b / 32 + 1 | 0] >>> d : a[b / 32 | 0] >>> d) & (1 << c) - 1;
}, concat:function(a, b) {
  if (0 === a.length || 0 === b.length) {
    return a.concat(b);
  }
  var c = a[a.length - 1], d = sjcl.bitArray.getPartial(c);
  return 32 === d ? a.concat(b) : sjcl.bitArray._shiftRight(b, d, c | 0, a.slice(0, a.length - 1));
}, bitLength:function(a) {
  var b = a.length;
  return 0 === b ? 0 : 32 * (b - 1) + sjcl.bitArray.getPartial(a[b - 1]);
}, clamp:function(a, b) {
  if (32 * a.length < b) {
    return a;
  }
  a = a.slice(0, Math.ceil(b / 32));
  var c = a.length;
  b &= 31;
  0 < c && b && (a[c - 1] = sjcl.bitArray.partial(b, a[c - 1] & 2147483648 >> b - 1, 1));
  return a;
}, partial:function(a, b, c) {
  return 32 === a ? b : (c ? b | 0 : b << 32 - a) + 1099511627776 * a;
}, getPartial:function(a) {
  return Math.round(a / 1099511627776) || 32;
}, equal:function(a, b) {
  if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) {
    return !1;
  }
  var c = 0, d;
  for (d = 0;d < a.length;d++) {
    c |= a[d] ^ b[d];
  }
  return 0 === c;
}, _shiftRight:function(a, b, c, d) {
  var e;
  e = 0;
  for (void 0 === d && (d = []);32 <= b;b -= 32) {
    d.push(c), c = 0;
  }
  if (0 === b) {
    return d.concat(a);
  }
  for (e = 0;e < a.length;e++) {
    d.push(c | a[e] >>> b), c = a[e] << 32 - b;
  }
  e = a.length ? a[a.length - 1] : 0;
  a = sjcl.bitArray.getPartial(e);
  d.push(sjcl.bitArray.partial(b + a & 31, 32 < b + a ? c : d.pop(), 1));
  return d;
}, _xor4:function(a, b) {
  return [a[0] ^ b[0], a[1] ^ b[1], a[2] ^ b[2], a[3] ^ b[3]];
}, byteswapM:function(a) {
  var b, c;
  for (b = 0;b < a.length;++b) {
    c = a[b], a[b] = c >>> 24 | c >>> 8 & 65280 | (c & 65280) << 8 | c << 24;
  }
  return a;
}};
sjcl.codec.utf8String = {fromBits:function(a) {
  var b = "", c = sjcl.bitArray.bitLength(a), d, e;
  for (d = 0;d < c / 8;d++) {
    0 === (d & 3) && (e = a[d / 4]), b += String.fromCharCode(e >>> 24), e <<= 8;
  }
  return decodeURIComponent(escape(b));
}, toBits:function(a) {
  a = unescape(encodeURIComponent(a));
  var b = [], c, d = 0;
  for (c = 0;c < a.length;c++) {
    d = d << 8 | a.charCodeAt(c), 3 === (c & 3) && (b.push(d), d = 0);
  }
  c & 3 && b.push(sjcl.bitArray.partial(8 * (c & 3), d));
  return b;
}};
sjcl.codec.hex = {fromBits:function(a) {
  var b = "", c;
  for (c = 0;c < a.length;c++) {
    b += ((a[c] | 0) + 0xf00000000000).toString(16).substr(4);
  }
  return b.substr(0, sjcl.bitArray.bitLength(a) / 4);
}, toBits:function(a) {
  var b, c = [], d;
  a = a.replace(/\s|0x/g, "");
  d = a.length;
  a += "00000000";
  for (b = 0;b < a.length;b += 8) {
    c.push(parseInt(a.substr(b, 8), 16) ^ 0);
  }
  return sjcl.bitArray.clamp(c, 4 * d);
}};
sjcl.codec.base32 = {_chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", _hexChars:"0123456789ABCDEFGHIJKLMNOPQRSTUV", BITS:32, BASE:5, REMAINING:27, fromBits:function(a, b, c) {
  var d = sjcl.codec.base32.BASE, e = sjcl.codec.base32.REMAINING, f = "", g = 0, h = sjcl.codec.base32._chars, k = 0, m = sjcl.bitArray.bitLength(a);
  c && (h = sjcl.codec.base32._hexChars);
  for (c = 0;f.length * d < m;) {
    f += h.charAt((k ^ a[c] >>> g) >>> e), g < d ? (k = a[c] << d - g, g += e, c++) : (k <<= d, g -= d);
  }
  for (;f.length & 7 && !b;) {
    f += "=";
  }
  return f;
}, toBits:function(a, b) {
  a = a.replace(/\s|=/g, "").toUpperCase();
  var c = sjcl.codec.base32.BITS, d = sjcl.codec.base32.BASE, e = sjcl.codec.base32.REMAINING, f = [], g, h = 0, k = sjcl.codec.base32._chars, m = 0, l, n = "base32";
  b && (k = sjcl.codec.base32._hexChars, n = "base32hex");
  for (g = 0;g < a.length;g++) {
    l = k.indexOf(a.charAt(g));
    if (0 > l) {
      if (!b) {
        try {
          return sjcl.codec.base32hex.toBits(a);
        } catch (p) {
        }
      }
      throw new sjcl.exception.invalid("this isn't " + n + "!");
    }
    h > e ? (h -= e, f.push(m ^ l >>> h), m = l << c - h) : (h += d, m ^= l << c - h);
  }
  h & 56 && f.push(sjcl.bitArray.partial(h & 56, m, 1));
  return f;
}};
sjcl.codec.base32hex = {fromBits:function(a, b) {
  return sjcl.codec.base32.fromBits(a, b, 1);
}, toBits:function(a) {
  return sjcl.codec.base32.toBits(a, 1);
}};
sjcl.codec.base64 = {_chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", fromBits:function(a, b, c) {
  var d = "", e = 0, f = sjcl.codec.base64._chars, g = 0, h = sjcl.bitArray.bitLength(a);
  c && (f = f.substr(0, 62) + "-_");
  for (c = 0;6 * d.length < h;) {
    d += f.charAt((g ^ a[c] >>> e) >>> 26), 6 > e ? (g = a[c] << 6 - e, e += 26, c++) : (g <<= 6, e -= 6);
  }
  for (;d.length & 3 && !b;) {
    d += "=";
  }
  return d;
}, toBits:function(a, b) {
  a = a.replace(/\s|=/g, "");
  var c = [], d, e = 0, f = sjcl.codec.base64._chars, g = 0, h;
  b && (f = f.substr(0, 62) + "-_");
  for (d = 0;d < a.length;d++) {
    h = f.indexOf(a.charAt(d));
    if (0 > h) {
      throw new sjcl.exception.invalid("this isn't base64!");
    }
    26 < e ? (e -= 26, c.push(g ^ h >>> e), g = h << 32 - e) : (e += 6, g ^= h << 32 - e);
  }
  e & 56 && c.push(sjcl.bitArray.partial(e & 56, g, 1));
  return c;
}};
sjcl.codec.base64url = {fromBits:function(a) {
  return sjcl.codec.base64.fromBits(a, 1, 1);
}, toBits:function(a) {
  return sjcl.codec.base64.toBits(a, 1);
}};
sjcl.codec.bytes = {fromBits:function(a) {
  var b = [], c = sjcl.bitArray.bitLength(a), d, e;
  for (d = 0;d < c / 8;d++) {
    0 === (d & 3) && (e = a[d / 4]), b.push(e >>> 24), e <<= 8;
  }
  return b;
}, toBits:function(a) {
  var b = [], c, d = 0;
  for (c = 0;c < a.length;c++) {
    d = d << 8 | a[c], 3 === (c & 3) && (b.push(d), d = 0);
  }
  c & 3 && b.push(sjcl.bitArray.partial(8 * (c & 3), d));
  return b;
}};
sjcl.hash.sha256 = function(a) {
  this._key[0] || this._precompute();
  a ? (this._h = a._h.slice(0), this._buffer = a._buffer.slice(0), this._length = a._length) : this.reset();
};
sjcl.hash.sha256.hash = function(a) {
  return (new sjcl.hash.sha256).update(a).finalize();
};
sjcl.hash.sha256.prototype = {blockSize:512, reset:function() {
  this._h = this._init.slice(0);
  this._buffer = [];
  this._length = 0;
  return this;
}, update:function(a) {
  "string" === typeof a && (a = sjcl.codec.utf8String.toBits(a));
  var b, c = this._buffer = sjcl.bitArray.concat(this._buffer, a);
  b = this._length;
  a = this._length = b + sjcl.bitArray.bitLength(a);
  if ("undefined" !== typeof Uint32Array) {
    var d = new Uint32Array(c), e = 0;
    for (b = 512 + b & -512;b <= a;b += 512) {
      this._block(d.subarray(16 * e, 16 * (e + 1))), e += 1;
    }
    c.splice(0, 16 * e);
  } else {
    for (b = 512 + b & -512;b <= a;b += 512) {
      this._block(c.splice(0, 16));
    }
  }
  return this;
}, finalize:function() {
  var a, b = this._buffer, c = this._h, b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
  for (a = b.length + 2;a & 15;a++) {
    b.push(0);
  }
  b.push(Math.floor(this._length / 4294967296));
  for (b.push(this._length | 0);b.length;) {
    this._block(b.splice(0, 16));
  }
  this.reset();
  return c;
}, _init:[], _key:[], _precompute:function() {
  function a(a) {
    return 4294967296 * (a - Math.floor(a)) | 0;
  }
  var b = 0, c = 2, d;
  a: for (;64 > b;c++) {
    for (d = 2;d * d <= c;d++) {
      if (0 === c % d) {
        continue a;
      }
    }
    8 > b && (this._init[b] = a(Math.pow(c, .5)));
    this._key[b] = a(Math.pow(c, 1 / 3));
    b++;
  }
}, _block:function(a) {
  var b, c, d, e = this._h, f = this._key, g = e[0], h = e[1], k = e[2], m = e[3], l = e[4], n = e[5], p = e[6], r = e[7];
  for (b = 0;64 > b;b++) {
    16 > b ? c = a[b] : (c = a[b + 1 & 15], d = a[b + 14 & 15], c = a[b & 15] = (c >>> 7 ^ c >>> 18 ^ c >>> 3 ^ c << 25 ^ c << 14) + (d >>> 17 ^ d >>> 19 ^ d >>> 10 ^ d << 15 ^ d << 13) + a[b & 15] + a[b + 9 & 15] | 0), c = c + r + (l >>> 6 ^ l >>> 11 ^ l >>> 25 ^ l << 26 ^ l << 21 ^ l << 7) + (p ^ l & (n ^ p)) + f[b], r = p, p = n, n = l, l = m + c | 0, m = k, k = h, h = g, g = c + (h & k ^ m & (h ^ k)) + (h >>> 2 ^ h >>> 13 ^ h >>> 22 ^ h << 30 ^ h << 19 ^ h << 10) | 0;
  }
  e[0] = e[0] + g | 0;
  e[1] = e[1] + h | 0;
  e[2] = e[2] + k | 0;
  e[3] = e[3] + m | 0;
  e[4] = e[4] + l | 0;
  e[5] = e[5] + n | 0;
  e[6] = e[6] + p | 0;
  e[7] = e[7] + r | 0;
}};
sjcl.hash.sha512 = function(a) {
  this._key[0] || this._precompute();
  a ? (this._h = a._h.slice(0), this._buffer = a._buffer.slice(0), this._length = a._length) : this.reset();
};
sjcl.hash.sha512.hash = function(a) {
  return (new sjcl.hash.sha512).update(a).finalize();
};
sjcl.hash.sha512.prototype = {blockSize:1024, reset:function() {
  this._h = this._init.slice(0);
  this._buffer = [];
  this._length = 0;
  return this;
}, update:function(a) {
  "string" === typeof a && (a = sjcl.codec.utf8String.toBits(a));
  var b, c = this._buffer = sjcl.bitArray.concat(this._buffer, a);
  b = this._length;
  a = this._length = b + sjcl.bitArray.bitLength(a);
  if ("undefined" !== typeof Uint32Array) {
    var d = new Uint32Array(c), e = 0;
    for (b = 1024 + b & -1024;b <= a;b += 1024) {
      this._block(d.subarray(32 * e, 32 * (e + 1))), e += 1;
    }
    c.splice(0, 32 * e);
  } else {
    for (b = 1024 + b & -1024;b <= a;b += 1024) {
      this._block(c.splice(0, 32));
    }
  }
  return this;
}, finalize:function() {
  var a, b = this._buffer, c = this._h, b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
  for (a = b.length + 4;a & 31;a++) {
    b.push(0);
  }
  b.push(0);
  b.push(0);
  b.push(Math.floor(this._length / 4294967296));
  for (b.push(this._length | 0);b.length;) {
    this._block(b.splice(0, 32));
  }
  this.reset();
  return c;
}, _init:[], _initr:[12372232, 13281083, 9762859, 1914609, 15106769, 4090911, 4308331, 8266105], _key:[], _keyr:[2666018, 15689165, 5061423, 9034684, 4764984, 380953, 1658779, 7176472, 197186, 7368638, 14987916, 16757986, 8096111, 1480369, 13046325, 6891156, 15813330, 5187043, 9229749, 11312229, 2818677, 10937475, 4324308, 1135541, 6741931, 11809296, 16458047, 15666916, 11046850, 698149, 229999, 945776, 13774844, 2541862, 12856045, 9810911, 11494366, 7844520, 15576806, 8533307, 15795044, 4337665, 
16291729, 5553712, 15684120, 6662416, 7413802, 12308920, 13816008, 4303699, 9366425, 10176680, 13195875, 4295371, 6546291, 11712675, 15708924, 1519456, 15772530, 6568428, 6495784, 8568297, 13007125, 7492395, 2515356, 12632583, 14740254, 7262584, 1535930, 13146278, 16321966, 1853211, 294276, 13051027, 13221564, 1051980, 4080310, 6651434, 14088940, 4675607], _precompute:function() {
  function a(a) {
    return 4294967296 * (a - Math.floor(a)) | 0;
  }
  function b(a) {
    return 1099511627776 * (a - Math.floor(a)) & 255;
  }
  var c = 0, d = 2, e;
  a: for (;80 > c;d++) {
    for (e = 2;e * e <= d;e++) {
      if (0 === d % e) {
        continue a;
      }
    }
    8 > c && (this._init[2 * c] = a(Math.pow(d, .5)), this._init[2 * c + 1] = b(Math.pow(d, .5)) << 24 | this._initr[c]);
    this._key[2 * c] = a(Math.pow(d, 1 / 3));
    this._key[2 * c + 1] = b(Math.pow(d, 1 / 3)) << 24 | this._keyr[c];
    c++;
  }
}, _block:function(a) {
  var b, c, d = this._h, e = this._key, f = d[0], g = d[1], h = d[2], k = d[3], m = d[4], l = d[5], n = d[6], p = d[7], r = d[8], t = d[9], H = d[10], G = d[11], x = d[12], y = d[13], B = d[14], z = d[15], u;
  if ("undefined" !== typeof Uint32Array) {
    u = Array(160);
    for (var v = 0;32 > v;v++) {
      u[v] = a[v];
    }
  } else {
    u = a;
  }
  var v = f, q = g, w = h, I = k, K = m, J = l, S = n, L = p, D = r, C = t, Q = H, M = G, R = x, N = y, T = B, O = z;
  for (a = 0;80 > a;a++) {
    if (16 > a) {
      b = u[2 * a], c = u[2 * a + 1];
    } else {
      c = u[2 * (a - 15)];
      var A = u[2 * (a - 15) + 1];
      b = (A << 31 | c >>> 1) ^ (A << 24 | c >>> 8) ^ c >>> 7;
      var E = (c << 31 | A >>> 1) ^ (c << 24 | A >>> 8) ^ (c << 25 | A >>> 7);
      c = u[2 * (a - 2)];
      var F = u[2 * (a - 2) + 1], A = (F << 13 | c >>> 19) ^ (c << 3 | F >>> 29) ^ c >>> 6, F = (c << 13 | F >>> 19) ^ (F << 3 | c >>> 29) ^ (c << 26 | F >>> 6), U = u[2 * (a - 7)], V = u[2 * (a - 16)], P = u[2 * (a - 16) + 1];
      c = E + u[2 * (a - 7) + 1];
      b = b + U + (c >>> 0 < E >>> 0 ? 1 : 0);
      c += F;
      b += A + (c >>> 0 < F >>> 0 ? 1 : 0);
      c += P;
      b += V + (c >>> 0 < P >>> 0 ? 1 : 0);
    }
    u[2 * a] = b |= 0;
    u[2 * a + 1] = c |= 0;
    var U = D & Q ^ ~D & R, W = C & M ^ ~C & N, F = v & w ^ v & K ^ w & K, Y = q & I ^ q & J ^ I & J, V = (q << 4 | v >>> 28) ^ (v << 30 | q >>> 2) ^ (v << 25 | q >>> 7), P = (v << 4 | q >>> 28) ^ (q << 30 | v >>> 2) ^ (q << 25 | v >>> 7), Z = e[2 * a], X = e[2 * a + 1], A = O + ((D << 18 | C >>> 14) ^ (D << 14 | C >>> 18) ^ (C << 23 | D >>> 9)), E = T + ((C << 18 | D >>> 14) ^ (C << 14 | D >>> 18) ^ (D << 23 | C >>> 9)) + (A >>> 0 < O >>> 0 ? 1 : 0), A = A + W, E = E + (U + (A >>> 0 < W >>> 0 ? 
    1 : 0)), A = A + X, E = E + (Z + (A >>> 0 < X >>> 0 ? 1 : 0)), A = A + c | 0, E = E + (b + (A >>> 0 < c >>> 0 ? 1 : 0));
    c = P + Y;
    b = V + F + (c >>> 0 < P >>> 0 ? 1 : 0);
    T = R;
    O = N;
    R = Q;
    N = M;
    Q = D;
    M = C;
    C = L + A | 0;
    D = S + E + (C >>> 0 < L >>> 0 ? 1 : 0) | 0;
    S = K;
    L = J;
    K = w;
    J = I;
    w = v;
    I = q;
    q = A + c | 0;
    v = E + b + (q >>> 0 < A >>> 0 ? 1 : 0) | 0;
  }
  g = d[1] = g + q | 0;
  d[0] = f + v + (g >>> 0 < q >>> 0 ? 1 : 0) | 0;
  k = d[3] = k + I | 0;
  d[2] = h + w + (k >>> 0 < I >>> 0 ? 1 : 0) | 0;
  l = d[5] = l + J | 0;
  d[4] = m + K + (l >>> 0 < J >>> 0 ? 1 : 0) | 0;
  p = d[7] = p + L | 0;
  d[6] = n + S + (p >>> 0 < L >>> 0 ? 1 : 0) | 0;
  t = d[9] = t + C | 0;
  d[8] = r + D + (t >>> 0 < C >>> 0 ? 1 : 0) | 0;
  G = d[11] = G + M | 0;
  d[10] = H + Q + (G >>> 0 < M >>> 0 ? 1 : 0) | 0;
  y = d[13] = y + N | 0;
  d[12] = x + R + (y >>> 0 < N >>> 0 ? 1 : 0) | 0;
  z = d[15] = z + O | 0;
  d[14] = B + T + (z >>> 0 < O >>> 0 ? 1 : 0) | 0;
}};
sjcl.hash.sha1 = function(a) {
  a ? (this._h = a._h.slice(0), this._buffer = a._buffer.slice(0), this._length = a._length) : this.reset();
};
sjcl.hash.sha1.hash = function(a) {
  return (new sjcl.hash.sha1).update(a).finalize();
};
sjcl.hash.sha1.prototype = {blockSize:512, reset:function() {
  this._h = this._init.slice(0);
  this._buffer = [];
  this._length = 0;
  return this;
}, update:function(a) {
  "string" === typeof a && (a = sjcl.codec.utf8String.toBits(a));
  var b, c = this._buffer = sjcl.bitArray.concat(this._buffer, a);
  b = this._length;
  a = this._length = b + sjcl.bitArray.bitLength(a);
  if ("undefined" !== typeof Uint32Array) {
    var d = new Uint32Array(c), e = 0;
    for (b = this.blockSize + b & -this.blockSize;b <= a;b += this.blockSize) {
      this._block(d.subarray(16 * e, 16 * (e + 1))), e += 1;
    }
    c.splice(0, 16 * e);
  } else {
    for (b = this.blockSize + b & -this.blockSize;b <= a;b += this.blockSize) {
      this._block(c.splice(0, 16));
    }
  }
  return this;
}, finalize:function() {
  var a, b = this._buffer, c = this._h, b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);
  for (a = b.length + 2;a & 15;a++) {
    b.push(0);
  }
  b.push(Math.floor(this._length / 4294967296));
  for (b.push(this._length | 0);b.length;) {
    this._block(b.splice(0, 16));
  }
  this.reset();
  return c;
}, _init:[1732584193, 4023233417, 2562383102, 271733878, 3285377520], _key:[1518500249, 1859775393, 2400959708, 3395469782], _f:function(a, b, c, d) {
  if (19 >= a) {
    return b & c | ~b & d;
  }
  if (39 >= a) {
    return b ^ c ^ d;
  }
  if (59 >= a) {
    return b & c | b & d | c & d;
  }
  if (79 >= a) {
    return b ^ c ^ d;
  }
}, _S:function(a, b) {
  return b << a | b >>> 32 - a;
}, _block:function(a) {
  var b, c, d, e, f, g, h = this._h, k;
  if ("undefined" !== typeof Uint32Array) {
    for (k = Array(80), b = 0;16 > b;b++) {
      k[b] = a[b];
    }
  } else {
    k = a;
  }
  c = h[0];
  d = h[1];
  e = h[2];
  f = h[3];
  g = h[4];
  for (a = 0;79 >= a;a++) {
    16 <= a && (k[a] = this._S(1, k[a - 3] ^ k[a - 8] ^ k[a - 14] ^ k[a - 16])), b = this._S(5, c) + this._f(a, d, e, f) + g + k[a] + this._key[Math.floor(a / 20)] | 0, g = f, f = e, e = this._S(30, d), d = c, c = b;
  }
  h[0] = h[0] + c | 0;
  h[1] = h[1] + d | 0;
  h[2] = h[2] + e | 0;
  h[3] = h[3] + f | 0;
  h[4] = h[4] + g | 0;
}};
sjcl.mode.ccm = {name:"ccm", _progressListeners:[], listenProgress:function(a) {
  sjcl.mode.ccm._progressListeners.push(a);
}, unListenProgress:function(a) {
  a = sjcl.mode.ccm._progressListeners.indexOf(a);
  -1 < a && sjcl.mode.ccm._progressListeners.splice(a, 1);
}, _callProgressListener:function(a) {
  var b = sjcl.mode.ccm._progressListeners.slice(), c;
  for (c = 0;c < b.length;c += 1) {
    b[c](a);
  }
}, encrypt:function(a, b, c, d, e) {
  var f, g = b.slice(0), h = sjcl.bitArray, k = h.bitLength(c) / 8, m = h.bitLength(g) / 8;
  e = e || 64;
  d = d || [];
  if (7 > k) {
    throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
  }
  for (f = 2;4 > f && m >>> 8 * f;f++) {
  }
  f < 15 - k && (f = 15 - k);
  c = h.clamp(c, 8 * (15 - f));
  b = sjcl.mode.ccm._computeTag(a, b, c, d, e, f);
  g = sjcl.mode.ccm._ctrMode(a, g, c, b, e, f);
  return h.concat(g.data, g.tag);
}, decrypt:function(a, b, c, d, e) {
  e = e || 64;
  d = d || [];
  var f = sjcl.bitArray, g = f.bitLength(c) / 8, h = f.bitLength(b), k = f.clamp(b, h - e), m = f.bitSlice(b, h - e), h = (h - e) / 8;
  if (7 > g) {
    throw new sjcl.exception.invalid("ccm: iv must be at least 7 bytes");
  }
  for (b = 2;4 > b && h >>> 8 * b;b++) {
  }
  b < 15 - g && (b = 15 - g);
  c = f.clamp(c, 8 * (15 - b));
  k = sjcl.mode.ccm._ctrMode(a, k, c, m, e, b);
  a = sjcl.mode.ccm._computeTag(a, k.data, c, d, e, b);
  if (!f.equal(k.tag, a)) {
    throw new sjcl.exception.corrupt("ccm: tag doesn't match");
  }
  return k.data;
}, _macAdditionalData:function(a, b, c, d, e, f) {
  var g = [], h = sjcl.bitArray, k = h._xor4;
  d = [h.partial(8, (b.length ? 64 : 0) | d - 2 << 2 | f - 1)];
  d = h.concat(d, c);
  d[3] |= e;
  d = a.encrypt(d);
  if (b.length) {
    for (c = h.bitLength(b) / 8, 65279 >= c ? g = [h.partial(16, c)] : 4294967295 >= c && (g = h.concat([h.partial(16, 65534)], [c])), g = h.concat(g, b), b = 0;b < g.length;b += 4) {
      d = a.encrypt(k(d, g.slice(b, b + 4).concat([0, 0, 0])));
    }
  }
  return d;
}, _computeTag:function(a, b, c, d, e, f) {
  var g = sjcl.bitArray, h = g._xor4;
  e /= 8;
  if (e % 2 || 4 > e || 16 < e) {
    throw new sjcl.exception.invalid("ccm: invalid tag length");
  }
  if (4294967295 < d.length || 4294967295 < b.length) {
    throw new sjcl.exception.bug("ccm: can't deal with 4GiB or more data");
  }
  c = sjcl.mode.ccm._macAdditionalData(a, d, c, e, g.bitLength(b) / 8, f);
  for (d = 0;d < b.length;d += 4) {
    c = a.encrypt(h(c, b.slice(d, d + 4).concat([0, 0, 0])));
  }
  return g.clamp(c, 8 * e);
}, _ctrMode:function(a, b, c, d, e, f) {
  var g, h = sjcl.bitArray;
  g = h._xor4;
  var k = b.length, m = h.bitLength(b), l = k / 50, n = l;
  c = h.concat([h.partial(8, f - 1)], c).concat([0, 0, 0]).slice(0, 4);
  d = h.bitSlice(g(d, a.encrypt(c)), 0, e);
  if (!k) {
    return {tag:d, data:[]};
  }
  for (g = 0;g < k;g += 4) {
    g > l && (sjcl.mode.ccm._callProgressListener(g / k), l += n), c[3]++, e = a.encrypt(c), b[g] ^= e[0], b[g + 1] ^= e[1], b[g + 2] ^= e[2], b[g + 3] ^= e[3];
  }
  return {tag:d, data:h.clamp(b, m)};
}};
void 0 === sjcl.beware && (sjcl.beware = {});
sjcl.beware["CTR mode is dangerous because it doesn't protect message integrity."] = function() {
  sjcl.mode.ctr = {name:"ctr", encrypt:function(a, b, c, d) {
    return sjcl.mode.ctr._calculate(a, b, c, d);
  }, decrypt:function(a, b, c, d) {
    return sjcl.mode.ctr._calculate(a, b, c, d);
  }, _calculate:function(a, b, c, d) {
    var e, f, g;
    if (d && d.length) {
      throw new sjcl.exception.invalid("ctr can't authenticate data");
    }
    if (128 !== sjcl.bitArray.bitLength(c)) {
      throw new sjcl.exception.invalid("ctr iv must be 128 bits");
    }
    if (!(d = b.length)) {
      return [];
    }
    c = c.slice(0);
    e = b.slice(0);
    b = sjcl.bitArray.bitLength(e);
    for (g = 0;g < d;g += 4) {
      f = a.encrypt(c), e[g] ^= f[0], e[g + 1] ^= f[1], e[g + 2] ^= f[2], e[g + 3] ^= f[3], c[3]++;
    }
    return sjcl.bitArray.clamp(e, b);
  }};
};
void 0 === sjcl.beware && (sjcl.beware = {});
sjcl.beware["CBC mode is dangerous because it doesn't protect message integrity."] = function() {
  sjcl.mode.cbc = {name:"cbc", encrypt:function(a, b, c, d) {
    if (d && d.length) {
      throw new sjcl.exception.invalid("cbc can't authenticate data");
    }
    if (128 !== sjcl.bitArray.bitLength(c)) {
      throw new sjcl.exception.invalid("cbc iv must be 128 bits");
    }
    var e = sjcl.bitArray, f = e._xor4, g = e.bitLength(b), h = 0, k = [];
    if (g & 7) {
      throw new sjcl.exception.invalid("pkcs#5 padding only works for multiples of a byte");
    }
    for (d = 0;h + 128 <= g;d += 4, h += 128) {
      c = a.encrypt(f(c, b.slice(d, d + 4))), k.splice(d, 0, c[0], c[1], c[2], c[3]);
    }
    g = 16843009 * (16 - (g >> 3 & 15));
    c = a.encrypt(f(c, e.concat(b, [g, g, g, g]).slice(d, d + 4)));
    k.splice(d, 0, c[0], c[1], c[2], c[3]);
    return k;
  }, decrypt:function(a, b, c, d) {
    if (d && d.length) {
      throw new sjcl.exception.invalid("cbc can't authenticate data");
    }
    if (128 !== sjcl.bitArray.bitLength(c)) {
      throw new sjcl.exception.invalid("cbc iv must be 128 bits");
    }
    if (sjcl.bitArray.bitLength(b) & 127 || !b.length) {
      throw new sjcl.exception.corrupt("cbc ciphertext must be a positive multiple of the block size");
    }
    var e = sjcl.bitArray, f = e._xor4, g, h = [];
    for (d = 0;d < b.length;d += 4) {
      g = b.slice(d, d + 4), c = f(c, a.decrypt(g)), h.splice(d, 0, c[0], c[1], c[2], c[3]), c = g;
    }
    g = h[d - 1] & 255;
    if (0 === g || 16 < g) {
      throw new sjcl.exception.corrupt("pkcs#5 padding corrupt");
    }
    c = 16843009 * g;
    if (!e.equal(e.bitSlice([c, c, c, c], 0, 8 * g), e.bitSlice(h, 32 * h.length - 8 * g, 32 * h.length))) {
      throw new sjcl.exception.corrupt("pkcs#5 padding corrupt");
    }
    return e.bitSlice(h, 0, 32 * h.length - 8 * g);
  }};
};
sjcl.mode.ocb2 = {name:"ocb2", encrypt:function(a, b, c, d, e, f) {
  if (128 !== sjcl.bitArray.bitLength(c)) {
    throw new sjcl.exception.invalid("ocb iv must be 128 bits");
  }
  var g, h = sjcl.mode.ocb2._times2, k = sjcl.bitArray, m = k._xor4, l = [0, 0, 0, 0];
  c = h(a.encrypt(c));
  var n, p = [];
  d = d || [];
  e = e || 64;
  for (g = 0;g + 4 < b.length;g += 4) {
    n = b.slice(g, g + 4), l = m(l, n), p = p.concat(m(c, a.encrypt(m(c, n)))), c = h(c);
  }
  n = b.slice(g);
  b = k.bitLength(n);
  g = a.encrypt(m(c, [0, 0, 0, b]));
  n = k.clamp(m(n.concat([0, 0, 0]), g), b);
  l = m(l, m(n.concat([0, 0, 0]), g));
  l = a.encrypt(m(l, m(c, h(c))));
  d.length && (l = m(l, f ? d : sjcl.mode.ocb2.pmac(a, d)));
  return p.concat(k.concat(n, k.clamp(l, e)));
}, decrypt:function(a, b, c, d, e, f) {
  if (128 !== sjcl.bitArray.bitLength(c)) {
    throw new sjcl.exception.invalid("ocb iv must be 128 bits");
  }
  e = e || 64;
  var g = sjcl.mode.ocb2._times2, h = sjcl.bitArray, k = h._xor4, m = [0, 0, 0, 0], l = g(a.encrypt(c)), n, p, r = sjcl.bitArray.bitLength(b) - e, t = [];
  d = d || [];
  for (c = 0;c + 4 < r / 32;c += 4) {
    n = k(l, a.decrypt(k(l, b.slice(c, c + 4)))), m = k(m, n), t = t.concat(n), l = g(l);
  }
  p = r - 32 * c;
  n = a.encrypt(k(l, [0, 0, 0, p]));
  n = k(n, h.clamp(b.slice(c), p).concat([0, 0, 0]));
  m = k(m, n);
  m = a.encrypt(k(m, k(l, g(l))));
  d.length && (m = k(m, f ? d : sjcl.mode.ocb2.pmac(a, d)));
  if (!h.equal(h.clamp(m, e), h.bitSlice(b, r))) {
    throw new sjcl.exception.corrupt("ocb: tag doesn't match");
  }
  return t.concat(h.clamp(n, p));
}, pmac:function(a, b) {
  var c, d = sjcl.mode.ocb2._times2, e = sjcl.bitArray, f = e._xor4, g = [0, 0, 0, 0], h = a.encrypt([0, 0, 0, 0]), h = f(h, d(d(h)));
  for (c = 0;c + 4 < b.length;c += 4) {
    h = d(h), g = f(g, a.encrypt(f(h, b.slice(c, c + 4))));
  }
  c = b.slice(c);
  128 > e.bitLength(c) && (h = f(h, d(h)), c = e.concat(c, [-2147483648, 0, 0, 0]));
  g = f(g, c);
  return a.encrypt(f(d(f(h, d(h))), g));
}, _times2:function(a) {
  return [a[0] << 1 ^ a[1] >>> 31, a[1] << 1 ^ a[2] >>> 31, a[2] << 1 ^ a[3] >>> 31, a[3] << 1 ^ 135 * (a[0] >>> 31)];
}};
sjcl.mode.ocb2progressive = {createEncryptor:function(a, b, c, d, e) {
  if (128 !== sjcl.bitArray.bitLength(b)) {
    throw new sjcl.exception.invalid("ocb iv must be 128 bits");
  }
  var f, g = sjcl.mode.ocb2._times2, h = sjcl.bitArray, k = h._xor4, m = [0, 0, 0, 0], l = g(a.encrypt(b)), n, p, r = [], t;
  c = c || [];
  d = d || 64;
  return {process:function(b) {
    if (0 == sjcl.bitArray.bitLength(b)) {
      return [];
    }
    var c = [];
    r = r.concat(b);
    for (f = 0;f + 4 < r.length;f += 4) {
      n = r.slice(f, f + 4), m = k(m, n), c = c.concat(k(l, a.encrypt(k(l, n)))), l = g(l);
    }
    r = r.slice(f);
    return c;
  }, finalize:function() {
    n = r;
    p = h.bitLength(n);
    t = a.encrypt(k(l, [0, 0, 0, p]));
    n = h.clamp(k(n.concat([0, 0, 0]), t), p);
    m = k(m, k(n.concat([0, 0, 0]), t));
    m = a.encrypt(k(m, k(l, g(l))));
    c.length && (m = k(m, e ? c : sjcl.mode.ocb2.pmac(a, c)));
    return h.concat(n, h.clamp(m, d));
  }};
}, createDecryptor:function(a, b, c, d, e) {
  if (128 !== sjcl.bitArray.bitLength(b)) {
    throw new sjcl.exception.invalid("ocb iv must be 128 bits");
  }
  d = d || 64;
  var f, g = sjcl.mode.ocb2._times2, h = sjcl.bitArray, k = h._xor4, m = [0, 0, 0, 0], l = g(a.encrypt(b)), n, p, r = [], t;
  c = c || [];
  return {process:function(b) {
    if (0 == b.length) {
      return [];
    }
    var c = [];
    r = r.concat(b);
    b = sjcl.bitArray.bitLength(r);
    for (f = 0;f + 4 < (b - d) / 32;f += 4) {
      n = k(l, a.decrypt(k(l, r.slice(f, f + 4)))), m = k(m, n), c = c.concat(n), l = g(l);
    }
    r = r.slice(f);
    return c;
  }, finalize:function() {
    p = sjcl.bitArray.bitLength(r) - d;
    t = a.encrypt(k(l, [0, 0, 0, p]));
    n = k(t, h.clamp(r, p).concat([0, 0, 0]));
    m = k(m, n);
    m = a.encrypt(k(m, k(l, g(l))));
    c.length && (m = k(m, e ? c : sjcl.mode.ocb2.pmac(a, c)));
    if (!h.equal(h.clamp(m, d), h.bitSlice(r, p))) {
      throw new sjcl.exception.corrupt("ocb: tag doesn't match");
    }
    return h.clamp(n, p);
  }};
}};
sjcl.mode.gcm = {name:"gcm", encrypt:function(a, b, c, d, e) {
  var f = b.slice(0);
  b = sjcl.bitArray;
  d = d || [];
  a = sjcl.mode.gcm._ctrMode(!0, a, f, d, c, e || 128);
  return b.concat(a.data, a.tag);
}, decrypt:function(a, b, c, d, e) {
  var f = b.slice(0), g = sjcl.bitArray, h = g.bitLength(f);
  e = e || 128;
  d = d || [];
  e <= h ? (b = g.bitSlice(f, h - e), f = g.bitSlice(f, 0, h - e)) : (b = f, f = []);
  a = sjcl.mode.gcm._ctrMode(!1, a, f, d, c, e);
  if (!g.equal(a.tag, b)) {
    throw new sjcl.exception.corrupt("gcm: tag doesn't match");
  }
  return a.data;
}, _galoisMultiply:function(a, b) {
  var c, d, e, f, g, h = sjcl.bitArray._xor4;
  e = [0, 0, 0, 0];
  f = b.slice(0);
  for (c = 0;128 > c;c++) {
    (d = 0 !== (a[Math.floor(c / 32)] & 1 << 31 - c % 32)) && (e = h(e, f));
    g = 0 !== (f[3] & 1);
    for (d = 3;0 < d;d--) {
      f[d] = f[d] >>> 1 | (f[d - 1] & 1) << 31;
    }
    f[0] >>>= 1;
    g && (f[0] ^= -520093696);
  }
  return e;
}, _ghash:function(a, b, c) {
  var d, e = c.length;
  b = b.slice(0);
  for (d = 0;d < e;d += 4) {
    b[0] ^= 4294967295 & c[d], b[1] ^= 4294967295 & c[d + 1], b[2] ^= 4294967295 & c[d + 2], b[3] ^= 4294967295 & c[d + 3], b = sjcl.mode.gcm._galoisMultiply(b, a);
  }
  return b;
}, _ctrMode:function(a, b, c, d, e, f) {
  var g, h, k, m, l, n, p, r, t = sjcl.bitArray;
  n = c.length;
  p = t.bitLength(c);
  r = t.bitLength(d);
  h = t.bitLength(e);
  g = b.encrypt([0, 0, 0, 0]);
  96 === h ? (e = e.slice(0), e = t.concat(e, [1])) : (e = sjcl.mode.gcm._ghash(g, [0, 0, 0, 0], e), e = sjcl.mode.gcm._ghash(g, e, [0, 0, Math.floor(h / 4294967296), h & 4294967295]));
  d = sjcl.mode.gcm._ghash(g, [0, 0, 0, 0], d);
  m = e.slice(0);
  l = d.slice(0);
  a || (l = sjcl.mode.gcm._ghash(g, d, c));
  for (k = 0;k < n;k += 4) {
    m[3]++, h = b.encrypt(m), c[k] ^= h[0], c[k + 1] ^= h[1], c[k + 2] ^= h[2], c[k + 3] ^= h[3];
  }
  c = t.clamp(c, p);
  a && (l = sjcl.mode.gcm._ghash(g, d, c));
  l = sjcl.mode.gcm._ghash(g, l, [Math.floor(r / 4294967296), r & 4294967295, Math.floor(p / 4294967296), p & 4294967295]);
  h = b.encrypt(e);
  l[0] ^= h[0];
  l[1] ^= h[1];
  l[2] ^= h[2];
  l[3] ^= h[3];
  return {tag:t.bitSlice(l, 0, f), data:c};
}};
sjcl.misc.hmac = function(a, b) {
  this._hash = b = b || sjcl.hash.sha256;
  var c = [[], []], d, e = b.prototype.blockSize / 32;
  this._baseHash = [new b, new b];
  a.length > e && (a = b.hash(a));
  for (d = 0;d < e;d++) {
    c[0][d] = a[d] ^ 909522486, c[1][d] = a[d] ^ 1549556828;
  }
  this._baseHash[0].update(c[0]);
  this._baseHash[1].update(c[1]);
  this._resultHash = new b(this._baseHash[0]);
};
sjcl.misc.hmac.prototype.encrypt = sjcl.misc.hmac.prototype.mac = function(a) {
  if (this._updated) {
    throw new sjcl.exception.invalid("encrypt on already updated hmac called!");
  }
  this.update(a);
  return this.digest(a);
};
sjcl.misc.hmac.prototype.reset = function() {
  this._resultHash = new this._hash(this._baseHash[0]);
  this._updated = !1;
};
sjcl.misc.hmac.prototype.update = function(a) {
  this._updated = !0;
  this._resultHash.update(a);
};
sjcl.misc.hmac.prototype.digest = function() {
  var a = this._resultHash.finalize(), a = (new this._hash(this._baseHash[1])).update(a).finalize();
  this.reset();
  return a;
};
sjcl.misc.pbkdf2 = function(a, b, c, d, e) {
  c = c || 1E3;
  if (0 > d || 0 > c) {
    throw sjcl.exception.invalid("invalid params to pbkdf2");
  }
  "string" === typeof a && (a = sjcl.codec.utf8String.toBits(a));
  "string" === typeof b && (b = sjcl.codec.utf8String.toBits(b));
  e = e || sjcl.misc.hmac;
  a = new e(a);
  var f, g, h, k, m = [], l = sjcl.bitArray;
  for (k = 1;32 * m.length < (d || 1);k++) {
    e = f = a.encrypt(l.concat(b, [k]));
    for (g = 1;g < c;g++) {
      for (f = a.encrypt(f), h = 0;h < f.length;h++) {
        e[h] ^= f[h];
      }
    }
    m = m.concat(e);
  }
  d && (m = l.clamp(m, d));
  return m;
};
sjcl.misc.scrypt = function(a, b, c, d, e, f, g) {
  var h = Math.pow(2, 32) - 1, k = sjcl.misc.scrypt;
  c = c || 16384;
  d = d || 8;
  e = e || 1;
  if (d * e >= Math.pow(2, 30)) {
    throw sjcl.exception.invalid("The parameters r, p must satisfy r * p < 2^30");
  }
  if (2 > c || c & 0 != c - 1) {
    throw sjcl.exception.invalid("The parameter N must be a power of 2.");
  }
  if (c > h / 128 / d) {
    throw sjcl.exception.invalid("N too big.");
  }
  if (d > h / 128 / e) {
    throw sjcl.exception.invalid("r too big.");
  }
  b = sjcl.misc.pbkdf2(a, b, 1, 128 * e * d * 8, g);
  d = b.length / e;
  k.reverse(b);
  for (h = 0;h < e;h++) {
    var m = b.slice(h * d, (h + 1) * d);
    k.blockcopy(k.ROMix(m, c), 0, b, h * d);
  }
  k.reverse(b);
  return sjcl.misc.pbkdf2(a, b, 1, f, g);
};
sjcl.misc.scrypt.salsa20Core = function(a, b) {
  for (var c = function(a, b) {
    return a << b | a >>> 32 - b;
  }, d = a.slice(0), e = b;0 < e;e -= 2) {
    d[4] ^= c(d[0] + d[12], 7), d[8] ^= c(d[4] + d[0], 9), d[12] ^= c(d[8] + d[4], 13), d[0] ^= c(d[12] + d[8], 18), d[9] ^= c(d[5] + d[1], 7), d[13] ^= c(d[9] + d[5], 9), d[1] ^= c(d[13] + d[9], 13), d[5] ^= c(d[1] + d[13], 18), d[14] ^= c(d[10] + d[6], 7), d[2] ^= c(d[14] + d[10], 9), d[6] ^= c(d[2] + d[14], 13), d[10] ^= c(d[6] + d[2], 18), d[3] ^= c(d[15] + d[11], 7), d[7] ^= c(d[3] + d[15], 9), d[11] ^= c(d[7] + d[3], 13), d[15] ^= c(d[11] + d[7], 18), d[1] ^= c(d[0] + d[3], 7), d[2] ^= c(d[1] + 
    d[0], 9), d[3] ^= c(d[2] + d[1], 13), d[0] ^= c(d[3] + d[2], 18), d[6] ^= c(d[5] + d[4], 7), d[7] ^= c(d[6] + d[5], 9), d[4] ^= c(d[7] + d[6], 13), d[5] ^= c(d[4] + d[7], 18), d[11] ^= c(d[10] + d[9], 7), d[8] ^= c(d[11] + d[10], 9), d[9] ^= c(d[8] + d[11], 13), d[10] ^= c(d[9] + d[8], 18), d[12] ^= c(d[15] + d[14], 7), d[13] ^= c(d[12] + d[15], 9), d[14] ^= c(d[13] + d[12], 13), d[15] ^= c(d[14] + d[13], 18);
  }
  for (e = 0;16 > e;e++) {
    a[e] = d[e] + a[e];
  }
};
sjcl.misc.scrypt.blockMix = function(a) {
  for (var b = a.slice(-16), c = [], d = a.length / 16, e = sjcl.misc.scrypt, f = 0;f < d;f++) {
    e.blockxor(a, 16 * f, b, 0, 16), e.salsa20Core(b, 8), 0 == (f & 1) ? e.blockcopy(b, 0, c, 8 * f) : e.blockcopy(b, 0, c, 8 * (f ^ 1 + d));
  }
  return c;
};
sjcl.misc.scrypt.ROMix = function(a, b) {
  for (var c = a.slice(0), d = [], e = sjcl.misc.scrypt, f = 0;f < b;f++) {
    d.push(c.slice(0)), c = e.blockMix(c);
  }
  for (f = 0;f < b;f++) {
    e.blockxor(d[c[c.length - 16] & b - 1], 0, c, 0), c = e.blockMix(c);
  }
  return c;
};
sjcl.misc.scrypt.reverse = function(a) {
  for (var b in a) {
    var c = a[b] & 255, c = c << 8 | a[b] >>> 8 & 255, c = c << 8 | a[b] >>> 16 & 255, c = c << 8 | a[b] >>> 24 & 255;
    a[b] = c;
  }
};
sjcl.misc.scrypt.blockcopy = function(a, b, c, d, e) {
  var f;
  e = e || a.length - b;
  for (f = 0;f < e;f++) {
    c[d + f] = a[b + f] | 0;
  }
};
sjcl.misc.scrypt.blockxor = function(a, b, c, d, e) {
  var f;
  e = e || a.length - b;
  for (f = 0;f < e;f++) {
    c[d + f] = c[d + f] ^ a[b + f] | 0;
  }
};
sjcl.prng = function(a) {
  this._pools = [new sjcl.hash.sha256];
  this._poolEntropy = [0];
  this._reseedCount = 0;
  this._robins = {};
  this._eventId = 0;
  this._collectorIds = {};
  this._nextReseed = this._poolStrength = this._strength = this._collectorIdNext = 0;
  this._key = [0, 0, 0, 0, 0, 0, 0, 0];
  this._counter = [0, 0, 0, 0];
  this._cipher = void 0;
  this._defaultParanoia = a;
  this._collectorsStarted = !1;
  this._callbacks = {progress:{}, seeded:{}};
  this._NOT_READY = this._callbackI = 0;
  this._READY = 1;
  this._REQUIRES_RESEED = 2;
  this._MAX_WORDS_PER_BURST = 65536;
  this._PARANOIA_LEVELS = [0, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024];
  this._MILLISECONDS_PER_RESEED = 3E4;
  this._BITS_PER_RESEED = 80;
};
sjcl.prng.prototype = {randomWords:function(a, b) {
  var c = [], d;
  d = this.isReady(b);
  var e;
  if (d === this._NOT_READY) {
    throw new sjcl.exception.notReady("generator isn't seeded");
  }
  d & this._REQUIRES_RESEED && this._reseedFromPools(!(d & this._READY));
  for (d = 0;d < a;d += 4) {
    0 === (d + 1) % this._MAX_WORDS_PER_BURST && this._gate(), e = this._gen4words(), c.push(e[0], e[1], e[2], e[3]);
  }
  this._gate();
  return c.slice(0, a);
}, setDefaultParanoia:function(a, b) {
  if (0 === a && "Setting paranoia=0 will ruin your security; use it only for testing" !== b) {
    throw "Setting paranoia=0 will ruin your security; use it only for testing";
  }
  this._defaultParanoia = a;
}, addEntropy:function(a, b, c) {
  c = c || "user";
  var d, e, f = (new Date).valueOf(), g = this._robins[c], h = this.isReady(), k = 0;
  d = this._collectorIds[c];
  void 0 === d && (d = this._collectorIds[c] = this._collectorIdNext++);
  void 0 === g && (g = this._robins[c] = 0);
  this._robins[c] = (this._robins[c] + 1) % this._pools.length;
  switch(typeof a) {
    case "number":
      void 0 === b && (b = 1);
      this._pools[g].update([d, this._eventId++, 1, b, f, 1, a | 0]);
      break;
    case "object":
      c = Object.prototype.toString.call(a);
      if ("[object Uint32Array]" === c) {
        e = [];
        for (c = 0;c < a.length;c++) {
          e.push(a[c]);
        }
        a = e;
      } else {
        for ("[object Array]" !== c && (k = 1), c = 0;c < a.length && !k;c++) {
          "number" !== typeof a[c] && (k = 1);
        }
      }
      if (!k) {
        if (void 0 === b) {
          for (c = b = 0;c < a.length;c++) {
            for (e = a[c];0 < e;) {
              b++, e >>>= 1;
            }
          }
        }
        this._pools[g].update([d, this._eventId++, 2, b, f, a.length].concat(a));
      }
      break;
    case "string":
      void 0 === b && (b = a.length);
      this._pools[g].update([d, this._eventId++, 3, b, f, a.length]);
      this._pools[g].update(a);
      break;
    default:
      k = 1;
  }
  if (k) {
    throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
  }
  this._poolEntropy[g] += b;
  this._poolStrength += b;
  h === this._NOT_READY && (this.isReady() !== this._NOT_READY && this._fireEvent("seeded", Math.max(this._strength, this._poolStrength)), this._fireEvent("progress", this.getProgress()));
}, isReady:function(a) {
  a = this._PARANOIA_LEVELS[void 0 !== a ? a : this._defaultParanoia];
  return this._strength && this._strength >= a ? this._poolEntropy[0] > this._BITS_PER_RESEED && (new Date).valueOf() > this._nextReseed ? this._REQUIRES_RESEED | this._READY : this._READY : this._poolStrength >= a ? this._REQUIRES_RESEED | this._NOT_READY : this._NOT_READY;
}, getProgress:function(a) {
  a = this._PARANOIA_LEVELS[a ? a : this._defaultParanoia];
  return this._strength >= a ? 1 : this._poolStrength > a ? 1 : this._poolStrength / a;
}, startCollectors:function() {
  if (!this._collectorsStarted) {
    this._eventListener = {loadTimeCollector:this._bind(this._loadTimeCollector), mouseCollector:this._bind(this._mouseCollector), keyboardCollector:this._bind(this._keyboardCollector), accelerometerCollector:this._bind(this._accelerometerCollector), touchCollector:this._bind(this._touchCollector)};
    if (window.addEventListener) {
      window.addEventListener("load", this._eventListener.loadTimeCollector, !1), window.addEventListener("mousemove", this._eventListener.mouseCollector, !1), window.addEventListener("keypress", this._eventListener.keyboardCollector, !1), window.addEventListener("devicemotion", this._eventListener.accelerometerCollector, !1), window.addEventListener("touchmove", this._eventListener.touchCollector, !1);
    } else {
      if (document.attachEvent) {
        document.attachEvent("onload", this._eventListener.loadTimeCollector), document.attachEvent("onmousemove", this._eventListener.mouseCollector), document.attachEvent("keypress", this._eventListener.keyboardCollector);
      } else {
        throw new sjcl.exception.bug("can't attach event");
      }
    }
    this._collectorsStarted = !0;
  }
}, stopCollectors:function() {
  this._collectorsStarted && (window.removeEventListener ? (window.removeEventListener("load", this._eventListener.loadTimeCollector, !1), window.removeEventListener("mousemove", this._eventListener.mouseCollector, !1), window.removeEventListener("keypress", this._eventListener.keyboardCollector, !1), window.removeEventListener("devicemotion", this._eventListener.accelerometerCollector, !1), window.removeEventListener("touchmove", this._eventListener.touchCollector, !1)) : document.detachEvent && 
  (document.detachEvent("onload", this._eventListener.loadTimeCollector), document.detachEvent("onmousemove", this._eventListener.mouseCollector), document.detachEvent("keypress", this._eventListener.keyboardCollector)), this._collectorsStarted = !1);
}, addEventListener:function(a, b) {
  this._callbacks[a][this._callbackI++] = b;
}, removeEventListener:function(a, b) {
  var c, d, e = this._callbacks[a], f = [];
  for (d in e) {
    e.hasOwnProperty(d) && e[d] === b && f.push(d);
  }
  for (c = 0;c < f.length;c++) {
    d = f[c], delete e[d];
  }
}, _bind:function(a) {
  var b = this;
  return function() {
    a.apply(b, arguments);
  };
}, _gen4words:function() {
  for (var a = 0;4 > a && (this._counter[a] = this._counter[a] + 1 | 0, !this._counter[a]);a++) {
  }
  return this._cipher.encrypt(this._counter);
}, _gate:function() {
  this._key = this._gen4words().concat(this._gen4words());
  this._cipher = new sjcl.cipher.aes(this._key);
}, _reseed:function(a) {
  this._key = sjcl.hash.sha256.hash(this._key.concat(a));
  this._cipher = new sjcl.cipher.aes(this._key);
  for (a = 0;4 > a && (this._counter[a] = this._counter[a] + 1 | 0, !this._counter[a]);a++) {
  }
}, _reseedFromPools:function(a) {
  var b = [], c = 0, d;
  this._nextReseed = b[0] = (new Date).valueOf() + this._MILLISECONDS_PER_RESEED;
  for (d = 0;16 > d;d++) {
    b.push(4294967296 * Math.random() | 0);
  }
  for (d = 0;d < this._pools.length && (b = b.concat(this._pools[d].finalize()), c += this._poolEntropy[d], this._poolEntropy[d] = 0, a || !(this._reseedCount & 1 << d));d++) {
  }
  this._reseedCount >= 1 << this._pools.length && (this._pools.push(new sjcl.hash.sha256), this._poolEntropy.push(0));
  this._poolStrength -= c;
  c > this._strength && (this._strength = c);
  this._reseedCount++;
  this._reseed(b);
}, _keyboardCollector:function() {
  this._addCurrentTimeToEntropy(1);
}, _mouseCollector:function(a) {
  var b, c;
  try {
    b = a.x || a.clientX || a.offsetX || 0, c = a.y || a.clientY || a.offsetY || 0;
  } catch (d) {
    c = b = 0;
  }
  0 != b && 0 != c && this.addEntropy([b, c], 2, "mouse");
  this._addCurrentTimeToEntropy(0);
}, _touchCollector:function(a) {
  a = a.touches[0] || a.changedTouches[0];
  this.addEntropy([a.pageX || a.clientX, a.pageY || a.clientY], 1, "touch");
  this._addCurrentTimeToEntropy(0);
}, _loadTimeCollector:function() {
  this._addCurrentTimeToEntropy(2);
}, _addCurrentTimeToEntropy:function(a) {
  "undefined" !== typeof window && window.performance && "function" === typeof window.performance.now ? this.addEntropy(window.performance.now(), a, "loadtime") : this.addEntropy((new Date).valueOf(), a, "loadtime");
}, _accelerometerCollector:function(a) {
  a = a.accelerationIncludingGravity.x || a.accelerationIncludingGravity.y || a.accelerationIncludingGravity.z;
  if (window.orientation) {
    var b = window.orientation;
    "number" === typeof b && this.addEntropy(b, 1, "accelerometer");
  }
  a && this.addEntropy(a, 2, "accelerometer");
  this._addCurrentTimeToEntropy(0);
}, _fireEvent:function(a, b) {
  var c, d = sjcl.random._callbacks[a], e = [];
  for (c in d) {
    d.hasOwnProperty(c) && e.push(d[c]);
  }
  for (c = 0;c < e.length;c++) {
    e[c](b);
  }
}};
sjcl.random = new sjcl.prng(6);
(function() {
  try {
    var a, b, c, d;
    if (d = "undefined" !== typeof module && module.exports) {
      var e;
      try {
        e = require("crypto");
      } catch (f) {
        e = null;
      }
      d = b = e;
    }
    if (d && b.randomBytes) {
      a = b.randomBytes(128), a = new Uint32Array((new Uint8Array(a)).buffer), sjcl.random.addEntropy(a, 1024, "crypto.randomBytes");
    } else {
      if ("undefined" !== typeof window && "undefined" !== typeof Uint32Array) {
        c = new Uint32Array(32);
        if (window.crypto && window.crypto.getRandomValues) {
          window.crypto.getRandomValues(c);
        } else {
          if (window.msCrypto && window.msCrypto.getRandomValues) {
            window.msCrypto.getRandomValues(c);
          } else {
            return;
          }
        }
        sjcl.random.addEntropy(c, 1024, "crypto.getRandomValues");
      }
    }
  } catch (f) {
    "undefined" !== typeof window && window.console && (console.log("There was an error collecting entropy from the browser:"), console.log(f));
  }
})();
sjcl.json = {defaults:{v:1, iter:1E3, ks:128, ts:64, mode:"ccm", adata:"", cipher:"aes"}, _encrypt:function(a, b, c, d) {
  c = c || {};
  d = d || {};
  var e = sjcl.json, f = e._add({iv:sjcl.random.randomWords(4, 0)}, e.defaults), g;
  e._add(f, c);
  c = f.adata;
  "string" === typeof f.salt && (f.salt = sjcl.codec.base64.toBits(f.salt));
  "string" === typeof f.iv && (f.iv = sjcl.codec.base64.toBits(f.iv));
  if (!sjcl.mode[f.mode] || !sjcl.cipher[f.cipher] || "string" === typeof a && 100 >= f.iter || 64 !== f.ts && 96 !== f.ts && 128 !== f.ts || 128 !== f.ks && 192 !== f.ks && 256 !== f.ks || 2 > f.iv.length || 4 < f.iv.length) {
    throw new sjcl.exception.invalid("json encrypt: invalid parameters");
  }
  "string" === typeof a ? (g = sjcl.misc.cachedPbkdf2(a, f), a = g.key.slice(0, f.ks / 32), f.salt = g.salt) : sjcl.ecc && a instanceof sjcl.ecc.elGamal.publicKey && (g = a.kem(), f.kemtag = g.tag, a = g.key.slice(0, f.ks / 32));
  "string" === typeof b && (b = sjcl.codec.utf8String.toBits(b));
  "string" === typeof c && (f.adata = c = sjcl.codec.utf8String.toBits(c));
  g = new sjcl.cipher[f.cipher](a);
  e._add(d, f);
  d.key = a;
  f.ct = "ccm" === f.mode && sjcl.arrayBuffer && sjcl.arrayBuffer.ccm && b instanceof ArrayBuffer ? sjcl.arrayBuffer.ccm.encrypt(g, b, f.iv, c, f.ts) : sjcl.mode[f.mode].encrypt(g, b, f.iv, c, f.ts);
  return f;
}, encrypt:function(a, b, c, d) {
  var e = sjcl.json, f = e._encrypt.apply(e, arguments);
  return e.encode(f);
}, _decrypt:function(a, b, c, d) {
  c = c || {};
  d = d || {};
  var e = sjcl.json;
  b = e._add(e._add(e._add({}, e.defaults), b), c, !0);
  var f, g;
  f = b.adata;
  "string" === typeof b.salt && (b.salt = sjcl.codec.base64.toBits(b.salt));
  "string" === typeof b.iv && (b.iv = sjcl.codec.base64.toBits(b.iv));
  if (!sjcl.mode[b.mode] || !sjcl.cipher[b.cipher] || "string" === typeof a && 100 >= b.iter || 64 !== b.ts && 96 !== b.ts && 128 !== b.ts || 128 !== b.ks && 192 !== b.ks && 256 !== b.ks || !b.iv || 2 > b.iv.length || 4 < b.iv.length) {
    throw new sjcl.exception.invalid("json decrypt: invalid parameters");
  }
  "string" === typeof a ? (g = sjcl.misc.cachedPbkdf2(a, b), a = g.key.slice(0, b.ks / 32), b.salt = g.salt) : sjcl.ecc && a instanceof sjcl.ecc.elGamal.secretKey && (a = a.unkem(sjcl.codec.base64.toBits(b.kemtag)).slice(0, b.ks / 32));
  "string" === typeof f && (f = sjcl.codec.utf8String.toBits(f));
  g = new sjcl.cipher[b.cipher](a);
  f = "ccm" === b.mode && sjcl.arrayBuffer && sjcl.arrayBuffer.ccm && b.ct instanceof ArrayBuffer ? sjcl.arrayBuffer.ccm.decrypt(g, b.ct, b.iv, b.tag, f, b.ts) : sjcl.mode[b.mode].decrypt(g, b.ct, b.iv, f, b.ts);
  e._add(d, b);
  d.key = a;
  return 1 === c.raw ? f : sjcl.codec.utf8String.fromBits(f);
}, decrypt:function(a, b, c, d) {
  var e = sjcl.json;
  return e._decrypt(a, e.decode(b), c, d);
}, encode:function(a) {
  var b, c = "{", d = "";
  for (b in a) {
    if (a.hasOwnProperty(b)) {
      if (!b.match(/^[a-z0-9]+$/i)) {
        throw new sjcl.exception.invalid("json encode: invalid property name");
      }
      c += d + '"' + b + '":';
      d = ",";
      switch(typeof a[b]) {
        case "number":
        ;
        case "boolean":
          c += a[b];
          break;
        case "string":
          c += '"' + escape(a[b]) + '"';
          break;
        case "object":
          c += '"' + sjcl.codec.base64.fromBits(a[b], 0) + '"';
          break;
        default:
          throw new sjcl.exception.bug("json encode: unsupported type");;
      }
    }
  }
  return c + "}";
}, decode:function(a) {
  a = a.replace(/\s/g, "");
  if (!a.match(/^\{.*\}$/)) {
    throw new sjcl.exception.invalid("json decode: this isn't json!");
  }
  a = a.replace(/^\{|\}$/g, "").split(/,/);
  var b = {}, c, d;
  for (c = 0;c < a.length;c++) {
    if (!(d = a[c].match(/^\s*(?:(["']?)([a-z][a-z0-9]*)\1)\s*:\s*(?:(-?\d+)|"([a-z0-9+\/%*_.@=\-]*)"|(true|false))$/i))) {
      throw new sjcl.exception.invalid("json decode: this isn't json!");
    }
    null != d[3] ? b[d[2]] = parseInt(d[3], 10) : null != d[4] ? b[d[2]] = d[2].match(/^(ct|adata|salt|iv)$/) ? sjcl.codec.base64.toBits(d[4]) : unescape(d[4]) : null != d[5] && (b[d[2]] = "true" === d[5]);
  }
  return b;
}, _add:function(a, b, c) {
  void 0 === a && (a = {});
  if (void 0 === b) {
    return a;
  }
  for (var d in b) {
    if (b.hasOwnProperty(d)) {
      if (c && void 0 !== a[d] && a[d] !== b[d]) {
        throw new sjcl.exception.invalid("required parameter overridden");
      }
      a[d] = b[d];
    }
  }
  return a;
}, _subtract:function(a, b) {
  var c = {}, d;
  for (d in a) {
    a.hasOwnProperty(d) && a[d] !== b[d] && (c[d] = a[d]);
  }
  return c;
}, _filter:function(a, b) {
  var c = {}, d;
  for (d = 0;d < b.length;d++) {
    void 0 !== a[b[d]] && (c[b[d]] = a[b[d]]);
  }
  return c;
}};
sjcl.encrypt = sjcl.json.encrypt;
sjcl.decrypt = sjcl.json.decrypt;
sjcl.misc._pbkdf2Cache = {};
sjcl.misc.cachedPbkdf2 = function(a, b) {
  var c = sjcl.misc._pbkdf2Cache, d;
  b = b || {};
  d = b.iter || 1E3;
  c = c[a] = c[a] || {};
  d = c[d] = c[d] || {firstSalt:b.salt && b.salt.length ? b.salt.slice(0) : sjcl.random.randomWords(2, 0)};
  c = void 0 === b.salt ? d.firstSalt : b.salt;
  d[c] = d[c] || sjcl.misc.pbkdf2(a, c, b.iter);
  return {key:d[c].slice(0), salt:c.slice(0)};
};
sjcl.bn = function(a) {
  this.initWith(a);
};
sjcl.bn.prototype = {radix:24, maxMul:8, _class:sjcl.bn, copy:function() {
  return new this._class(this);
}, initWith:function(a) {
  var b = 0, c;
  switch(typeof a) {
    case "object":
      this.limbs = a.limbs.slice(0);
      break;
    case "number":
      this.limbs = [a];
      this.normalize();
      break;
    case "string":
      a = a.replace(/^0x/, "");
      this.limbs = [];
      c = this.radix / 4;
      for (b = 0;b < a.length;b += c) {
        this.limbs.push(parseInt(a.substring(Math.max(a.length - b - c, 0), a.length - b), 16));
      }
      break;
    default:
      this.limbs = [0];
  }
  return this;
}, equals:function(a) {
  "number" === typeof a && (a = new this._class(a));
  var b = 0, c;
  this.fullReduce();
  a.fullReduce();
  for (c = 0;c < this.limbs.length || c < a.limbs.length;c++) {
    b |= this.getLimb(c) ^ a.getLimb(c);
  }
  return 0 === b;
}, getLimb:function(a) {
  return a >= this.limbs.length ? 0 : this.limbs[a];
}, greaterEquals:function(a) {
  "number" === typeof a && (a = new this._class(a));
  var b = 0, c = 0, d, e, f;
  for (d = Math.max(this.limbs.length, a.limbs.length) - 1;0 <= d;d--) {
    e = this.getLimb(d), f = a.getLimb(d), c |= f - e & ~b, b |= e - f & ~c;
  }
  return (c | ~b) >>> 31;
}, toString:function() {
  this.fullReduce();
  var a = "", b, c, d = this.limbs;
  for (b = 0;b < this.limbs.length;b++) {
    for (c = d[b].toString(16);b < this.limbs.length - 1 && 6 > c.length;) {
      c = "0" + c;
    }
    a = c + a;
  }
  return "0x" + a;
}, addM:function(a) {
  "object" !== typeof a && (a = new this._class(a));
  var b = this.limbs, c = a.limbs;
  for (a = b.length;a < c.length;a++) {
    b[a] = 0;
  }
  for (a = 0;a < c.length;a++) {
    b[a] += c[a];
  }
  return this;
}, doubleM:function() {
  var a, b = 0, c, d = this.radix, e = this.radixMask, f = this.limbs;
  for (a = 0;a < f.length;a++) {
    c = f[a], c = c + c + b, f[a] = c & e, b = c >> d;
  }
  b && f.push(b);
  return this;
}, halveM:function() {
  var a, b = 0, c, d = this.radix, e = this.limbs;
  for (a = e.length - 1;0 <= a;a--) {
    c = e[a], e[a] = c + b >> 1, b = (c & 1) << d;
  }
  e[e.length - 1] || e.pop();
  return this;
}, subM:function(a) {
  "object" !== typeof a && (a = new this._class(a));
  var b = this.limbs, c = a.limbs;
  for (a = b.length;a < c.length;a++) {
    b[a] = 0;
  }
  for (a = 0;a < c.length;a++) {
    b[a] -= c[a];
  }
  return this;
}, mod:function(a) {
  var b = !this.greaterEquals(new sjcl.bn(0));
  a = (new sjcl.bn(a)).normalize();
  var c = (new sjcl.bn(this)).normalize(), d = 0;
  for (b && (c = (new sjcl.bn(0)).subM(c).normalize());c.greaterEquals(a);d++) {
    a.doubleM();
  }
  for (b && (c = a.sub(c).normalize());0 < d;d--) {
    a.halveM(), c.greaterEquals(a) && c.subM(a).normalize();
  }
  return c.trim();
}, inverseMod:function(a) {
  var b = new sjcl.bn(1), c = new sjcl.bn(0), d = new sjcl.bn(this), e = new sjcl.bn(a), f, g = 1;
  if (!(a.limbs[0] & 1)) {
    throw new sjcl.exception.invalid("inverseMod: p must be odd");
  }
  do {
    for (d.limbs[0] & 1 && (d.greaterEquals(e) || (f = d, d = e, e = f, f = b, b = c, c = f), d.subM(e), d.normalize(), b.greaterEquals(c) || b.addM(a), b.subM(c)), d.halveM(), b.limbs[0] & 1 && b.addM(a), b.normalize(), b.halveM(), f = g = 0;f < d.limbs.length;f++) {
      g |= d.limbs[f];
    }
  } while (g);
  if (!e.equals(1)) {
    throw new sjcl.exception.invalid("inverseMod: p and x must be relatively prime");
  }
  return c;
}, add:function(a) {
  return this.copy().addM(a);
}, sub:function(a) {
  return this.copy().subM(a);
}, mul:function(a) {
  "number" === typeof a && (a = new this._class(a));
  var b, c = this.limbs, d = a.limbs, e = c.length, f = d.length, g = new this._class, h = g.limbs, k, m = this.maxMul;
  for (b = 0;b < this.limbs.length + a.limbs.length + 1;b++) {
    h[b] = 0;
  }
  for (b = 0;b < e;b++) {
    k = c[b];
    for (a = 0;a < f;a++) {
      h[b + a] += k * d[a];
    }
    --m || (m = this.maxMul, g.cnormalize());
  }
  return g.cnormalize().reduce();
}, square:function() {
  return this.mul(this);
}, power:function(a) {
  a = (new sjcl.bn(a)).normalize().trim().limbs;
  var b, c, d = new this._class(1), e = this;
  for (b = 0;b < a.length;b++) {
    for (c = 0;c < this.radix;c++) {
      a[b] & 1 << c && (d = d.mul(e));
      if (b == a.length - 1 && 0 == a[b] >> c + 1) {
        break;
      }
      e = e.square();
    }
  }
  return d;
}, mulmod:function(a, b) {
  return this.mod(b).mul(a.mod(b)).mod(b);
}, powermod:function(a, b) {
  a = new sjcl.bn(a);
  b = new sjcl.bn(b);
  if (1 == (b.limbs[0] & 1)) {
    var c = this.montpowermod(a, b);
    if (0 != c) {
      return c;
    }
  }
  for (var d, e = a.normalize().trim().limbs, f = new this._class(1), g = this, c = 0;c < e.length;c++) {
    for (d = 0;d < this.radix;d++) {
      e[c] & 1 << d && (f = f.mulmod(g, b));
      if (c == e.length - 1 && 0 == e[c] >> d + 1) {
        break;
      }
      g = g.mulmod(g, b);
    }
  }
  return f;
}, montpowermod:function(a, b) {
  a = (new sjcl.bn(a)).normalize().trim();
  b = new sjcl.bn(b);
  var c, d, e = this.radix, f = new this._class(1);
  c = this.copy();
  var g, h, k;
  k = a.bitLength();
  g = new sjcl.bn({limbs:b.copy().normalize().trim().limbs.map(function() {
    return 0;
  })});
  for (h = this.radix;0 < h;h--) {
    if (1 == (b.limbs[b.limbs.length - 1] >> h & 1)) {
      g.limbs[g.limbs.length - 1] = 1 << h;
      break;
    }
  }
  if (0 == k) {
    return this;
  }
  k = 18 > k ? 1 : 48 > k ? 3 : 144 > k ? 4 : 768 > k ? 5 : 6;
  var m = g.copy();
  d = b.copy();
  for (var l = new sjcl.bn(1), n = new sjcl.bn(0), p = g.copy();p.greaterEquals(1);) {
    p.halveM(), 0 == (l.limbs[0] & 1) ? (l.halveM(), n.halveM()) : (l.addM(d), l.halveM(), n.halveM(), n.addM(m));
  }
  l = l.normalize();
  n = n.normalize();
  m.doubleM();
  d = m.mulmod(m, b);
  if (!m.mul(l).sub(b.mul(n)).equals(1)) {
    return !1;
  }
  m = function(a, c) {
    var d, f, k = (1 << h + 1) - 1;
    d = a.mul(c);
    f = d.mul(n);
    f.limbs = f.limbs.slice(0, g.limbs.length);
    f.limbs.length == g.limbs.length && (f.limbs[g.limbs.length - 1] &= k);
    f = f.mul(b);
    f = d.add(f).normalize().trim();
    f.limbs = f.limbs.slice(g.limbs.length - 1);
    for (d = 0;d < f.limbs.length;d++) {
      0 < d && (f.limbs[d - 1] |= (f.limbs[d] & k) << e - h - 1), f.limbs[d] >>= h + 1;
    }
    f.greaterEquals(b) && f.subM(b);
    return f;
  };
  c = m(c, d);
  f = m(f, d);
  l = {};
  d = (1 << k - 1) - 1;
  l[1] = c.copy();
  l[2] = m(c, c);
  for (c = 1;c <= d;c++) {
    l[2 * c + 1] = m(l[2 * c - 1], l[2]);
  }
  p = function(a, b) {
    var c = b % a.radix;
    return (a.limbs[Math.floor(b / a.radix)] & 1 << c) >> c;
  };
  for (c = a.bitLength() - 1;0 <= c;) {
    if (0 == p(a, c)) {
      f = m(f, f), --c;
    } else {
      for (var r = c - k + 1;0 == p(a, r);) {
        r++;
      }
      var t = 0;
      for (d = r;d <= c;d++) {
        t += p(a, d) << d - r, f = m(f, f);
      }
      f = m(f, l[t]);
      c = r - 1;
    }
  }
  return m(f, 1);
}, trim:function() {
  var a = this.limbs, b;
  do {
    b = a.pop();
  } while (a.length && 0 === b);
  a.push(b);
  return this;
}, reduce:function() {
  return this;
}, fullReduce:function() {
  return this.normalize();
}, normalize:function() {
  var a = 0, b, c = this.placeVal, d = this.ipv, e, f = this.limbs, g = f.length, h = this.radixMask;
  for (b = 0;b < g || 0 !== a && -1 !== a;b++) {
    a = (f[b] || 0) + a, e = f[b] = a & h, a = (a - e) * d;
  }
  -1 === a && (f[b - 1] -= c);
  this.trim();
  return this;
}, cnormalize:function() {
  var a = 0, b, c = this.ipv, d, e = this.limbs, f = e.length, g = this.radixMask;
  for (b = 0;b < f - 1;b++) {
    a = e[b] + a, d = e[b] = a & g, a = (a - d) * c;
  }
  e[b] += a;
  return this;
}, toBits:function(a) {
  this.fullReduce();
  a = a || this.exponent || this.bitLength();
  var b = Math.floor((a - 1) / 24), c = sjcl.bitArray, d = [c.partial((a + 7 & -8) % this.radix || this.radix, this.getLimb(b))];
  for (b--;0 <= b;b--) {
    d = c.concat(d, [c.partial(Math.min(this.radix, a), this.getLimb(b))]), a -= this.radix;
  }
  return d;
}, bitLength:function() {
  this.fullReduce();
  for (var a = this.radix * (this.limbs.length - 1), b = this.limbs[this.limbs.length - 1];b;b >>>= 1) {
    a++;
  }
  return a + 7 & -8;
}};
sjcl.bn.fromBits = function(a) {
  var b = new this, c = [], d = sjcl.bitArray, e = this.prototype, f = Math.min(this.bitLength || 4294967296, d.bitLength(a)), g = f % e.radix || e.radix;
  for (c[0] = d.extract(a, 0, g);g < f;g += e.radix) {
    c.unshift(d.extract(a, g, e.radix));
  }
  b.limbs = c;
  return b;
};
sjcl.bn.prototype.ipv = 1 / (sjcl.bn.prototype.placeVal = Math.pow(2, sjcl.bn.prototype.radix));
sjcl.bn.prototype.radixMask = (1 << sjcl.bn.prototype.radix) - 1;
sjcl.bn.pseudoMersennePrime = function(a, b) {
  function c(a) {
    this.initWith(a);
  }
  var d = c.prototype = new sjcl.bn, e, f;
  e = d.modOffset = Math.ceil(f = a / d.radix);
  d.exponent = a;
  d.offset = [];
  d.factor = [];
  d.minOffset = e;
  d.fullMask = 0;
  d.fullOffset = [];
  d.fullFactor = [];
  d.modulus = c.modulus = new sjcl.bn(Math.pow(2, a));
  d.fullMask = 0 | -Math.pow(2, a % d.radix);
  for (e = 0;e < b.length;e++) {
    d.offset[e] = Math.floor(b[e][0] / d.radix - f), d.fullOffset[e] = Math.ceil(b[e][0] / d.radix - f), d.factor[e] = b[e][1] * Math.pow(.5, a - b[e][0] + d.offset[e] * d.radix), d.fullFactor[e] = b[e][1] * Math.pow(.5, a - b[e][0] + d.fullOffset[e] * d.radix), d.modulus.addM(new sjcl.bn(Math.pow(2, b[e][0]) * b[e][1])), d.minOffset = Math.min(d.minOffset, -d.offset[e]);
  }
  d._class = c;
  d.modulus.cnormalize();
  d.reduce = function() {
    var a, b, c, d = this.modOffset, e = this.limbs, f = this.offset, p = this.offset.length, r = this.factor, t;
    for (a = this.minOffset;e.length > d;) {
      c = e.pop();
      t = e.length;
      for (b = 0;b < p;b++) {
        e[t + f[b]] -= r[b] * c;
      }
      a--;
      a || (e.push(0), this.cnormalize(), a = this.minOffset);
    }
    this.cnormalize();
    return this;
  };
  d._strongReduce = -1 === d.fullMask ? d.reduce : function() {
    var a = this.limbs, b = a.length - 1, c, d;
    this.reduce();
    if (b === this.modOffset - 1) {
      d = a[b] & this.fullMask;
      a[b] -= d;
      for (c = 0;c < this.fullOffset.length;c++) {
        a[b + this.fullOffset[c]] -= this.fullFactor[c] * d;
      }
      this.normalize();
    }
  };
  d.fullReduce = function() {
    var a, b;
    this._strongReduce();
    this.addM(this.modulus);
    this.addM(this.modulus);
    this.normalize();
    this._strongReduce();
    for (b = this.limbs.length;b < this.modOffset;b++) {
      this.limbs[b] = 0;
    }
    a = this.greaterEquals(this.modulus);
    for (b = 0;b < this.limbs.length;b++) {
      this.limbs[b] -= this.modulus.limbs[b] * a;
    }
    this.cnormalize();
    return this;
  };
  d.inverse = function() {
    return this.power(this.modulus.sub(2));
  };
  c.fromBits = sjcl.bn.fromBits;
  return c;
};
var sbp = sjcl.bn.pseudoMersennePrime;
sjcl.bn.prime = {p127:sbp(127, [[0, -1]]), p25519:sbp(255, [[0, -19]]), p192k:sbp(192, [[32, -1], [12, -1], [8, -1], [7, -1], [6, -1], [3, -1], [0, -1]]), p224k:sbp(224, [[32, -1], [12, -1], [11, -1], [9, -1], [7, -1], [4, -1], [1, -1], [0, -1]]), p256k:sbp(256, [[32, -1], [9, -1], [8, -1], [7, -1], [6, -1], [4, -1], [0, -1]]), p192:sbp(192, [[0, -1], [64, -1]]), p224:sbp(224, [[0, 1], [96, -1]]), p256:sbp(256, [[0, -1], [96, 1], [192, 1], [224, -1]]), p384:sbp(384, [[0, -1], [32, 1], [96, -1], [128, 
-1]]), p521:sbp(521, [[0, -1]])};
sjcl.bn.random = function(a, b) {
  "object" !== typeof a && (a = new sjcl.bn(a));
  for (var c, d, e = a.limbs.length, f = a.limbs[e - 1] + 1, g = new sjcl.bn;;) {
    do {
      c = sjcl.random.randomWords(e, b), 0 > c[e - 1] && (c[e - 1] += 4294967296);
    } while (Math.floor(c[e - 1] / f) === Math.floor(4294967296 / f));
    c[e - 1] %= f;
    for (d = 0;d < e - 1;d++) {
      c[d] &= a.radixMask;
    }
    g.limbs = c;
    if (!g.greaterEquals(a)) {
      return g;
    }
  }
};
sjcl.ecc = {};
sjcl.ecc.point = function(a, b, c) {
  void 0 === b ? this.isIdentity = !0 : (b instanceof sjcl.bn && (b = new a.field(b)), c instanceof sjcl.bn && (c = new a.field(c)), this.x = b, this.y = c, this.isIdentity = !1);
  this.curve = a;
};
sjcl.ecc.point.prototype = {toJac:function() {
  return new sjcl.ecc.pointJac(this.curve, this.x, this.y, new this.curve.field(1));
}, mult:function(a) {
  return this.toJac().mult(a, this).toAffine();
}, mult2:function(a, b, c) {
  return this.toJac().mult2(a, this, b, c).toAffine();
}, multiples:function() {
  var a, b, c;
  if (void 0 === this._multiples) {
    for (c = this.toJac().doubl(), a = this._multiples = [new sjcl.ecc.point(this.curve), this, c.toAffine()], b = 3;16 > b;b++) {
      c = c.add(this), a.push(c.toAffine());
    }
  }
  return this._multiples;
}, negate:function() {
  var a = (new this.curve.field(0)).sub(this.y).normalize().reduce();
  return new sjcl.ecc.point(this.curve, this.x, a);
}, isValid:function() {
  return this.y.square().equals(this.curve.b.add(this.x.mul(this.curve.a.add(this.x.square()))));
}, toBits:function() {
  return sjcl.bitArray.concat(this.x.toBits(), this.y.toBits());
}};
sjcl.ecc.pointJac = function(a, b, c, d) {
  void 0 === b ? this.isIdentity = !0 : (this.x = b, this.y = c, this.z = d, this.isIdentity = !1);
  this.curve = a;
};
sjcl.ecc.pointJac.prototype = {add:function(a) {
  var b, c, d, e;
  if (this.curve !== a.curve) {
    throw "sjcl.ecc.add(): Points must be on the same curve to add them!";
  }
  if (this.isIdentity) {
    return a.toJac();
  }
  if (a.isIdentity) {
    return this;
  }
  b = this.z.square();
  c = a.x.mul(b).subM(this.x);
  if (c.equals(0)) {
    return this.y.equals(a.y.mul(b.mul(this.z))) ? this.doubl() : new sjcl.ecc.pointJac(this.curve);
  }
  b = a.y.mul(b.mul(this.z)).subM(this.y);
  d = c.square();
  a = b.square();
  e = c.square().mul(c).addM(this.x.add(this.x).mul(d));
  a = a.subM(e);
  b = this.x.mul(d).subM(a).mul(b);
  d = this.y.mul(c.square().mul(c));
  b = b.subM(d);
  c = this.z.mul(c);
  return new sjcl.ecc.pointJac(this.curve, a, b, c);
}, doubl:function() {
  if (this.isIdentity) {
    return this;
  }
  var a = this.y.square(), b = a.mul(this.x.mul(4)), c = a.square().mul(8), a = this.z.square(), d = this.curve.a.toString() == (new sjcl.bn(-3)).toString() ? this.x.sub(a).mul(3).mul(this.x.add(a)) : this.x.square().mul(3).add(a.square().mul(this.curve.a)), a = d.square().subM(b).subM(b), b = b.sub(a).mul(d).subM(c), c = this.y.add(this.y).mul(this.z);
  return new sjcl.ecc.pointJac(this.curve, a, b, c);
}, toAffine:function() {
  if (this.isIdentity || this.z.equals(0)) {
    return new sjcl.ecc.point(this.curve);
  }
  var a = this.z.inverse(), b = a.square();
  return new sjcl.ecc.point(this.curve, this.x.mul(b).fullReduce(), this.y.mul(b.mul(a)).fullReduce());
}, mult:function(a, b) {
  "number" === typeof a ? a = [a] : void 0 !== a.limbs && (a = a.normalize().limbs);
  var c, d, e = (new sjcl.ecc.point(this.curve)).toJac(), f = b.multiples();
  for (c = a.length - 1;0 <= c;c--) {
    for (d = sjcl.bn.prototype.radix - 4;0 <= d;d -= 4) {
      e = e.doubl().doubl().doubl().doubl().add(f[a[c] >> d & 15]);
    }
  }
  return e;
}, mult2:function(a, b, c, d) {
  "number" === typeof a ? a = [a] : void 0 !== a.limbs && (a = a.normalize().limbs);
  "number" === typeof c ? c = [c] : void 0 !== c.limbs && (c = c.normalize().limbs);
  var e, f = (new sjcl.ecc.point(this.curve)).toJac();
  b = b.multiples();
  var g = d.multiples(), h, k;
  for (d = Math.max(a.length, c.length) - 1;0 <= d;d--) {
    for (h = a[d] | 0, k = c[d] | 0, e = sjcl.bn.prototype.radix - 4;0 <= e;e -= 4) {
      f = f.doubl().doubl().doubl().doubl().add(b[h >> e & 15]).add(g[k >> e & 15]);
    }
  }
  return f;
}, negate:function() {
  return this.toAffine().negate().toJac();
}, isValid:function() {
  var a = this.z.square(), b = a.square(), a = b.mul(a);
  return this.y.square().equals(this.curve.b.mul(a).add(this.x.mul(this.curve.a.mul(b).add(this.x.square()))));
}};
sjcl.ecc.curve = function(a, b, c, d, e, f) {
  this.field = a;
  this.r = new sjcl.bn(b);
  this.a = new a(c);
  this.b = new a(d);
  this.G = new sjcl.ecc.point(this, new a(e), new a(f));
};
sjcl.ecc.curve.prototype.fromBits = function(a) {
  var b = sjcl.bitArray, c = this.field.prototype.exponent + 7 & -8;
  a = new sjcl.ecc.point(this, this.field.fromBits(b.bitSlice(a, 0, c)), this.field.fromBits(b.bitSlice(a, c, 2 * c)));
  if (!a.isValid()) {
    throw new sjcl.exception.corrupt("not on the curve!");
  }
  return a;
};
sjcl.ecc.curves = {c192:new sjcl.ecc.curve(sjcl.bn.prime.p192, "0xffffffffffffffffffffffff99def836146bc9b1b4d22831", -3, "0x64210519e59c80e70fa7e9ab72243049feb8deecc146b9b1", "0x188da80eb03090f67cbf20eb43a18800f4ff0afd82ff1012", "0x07192b95ffc8da78631011ed6b24cdd573f977a11e794811"), c224:new sjcl.ecc.curve(sjcl.bn.prime.p224, "0xffffffffffffffffffffffffffff16a2e0b8f03e13dd29455c5c2a3d", -3, "0xb4050a850c04b3abf54132565044b0b7d7bfd8ba270b39432355ffb4", "0xb70e0cbd6bb4bf7f321390b94a03c1d356c21122343280d6115c1d21", 
"0xbd376388b5f723fb4c22dfe6cd4375a05a07476444d5819985007e34"), c256:new sjcl.ecc.curve(sjcl.bn.prime.p256, "0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551", -3, "0x5ac635d8aa3a93e7b3ebbd55769886bc651d06b0cc53b0f63bce3c3e27d2604b", "0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296", "0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5"), c384:new sjcl.ecc.curve(sjcl.bn.prime.p384, "0xffffffffffffffffffffffffffffffffffffffffffffffffc7634d81f4372ddf581a0db248b0a77aecec196accc52973", 
-3, "0xb3312fa7e23ee7e4988e056be3f82d19181d9c6efe8141120314088f5013875ac656398d8a2ed19d2a85c8edd3ec2aef", "0xaa87ca22be8b05378eb1c71ef320ad746e1d3b628ba79b9859f741e082542a385502f25dbf55296c3a545e3872760ab7", "0x3617de4a96262c6f5d9e98bf9292dc29f8f41dbd289a147ce9da3113b5f0b8c00a60b1ce1d7e819d7a431d7c90ea0e5f"), c521:new sjcl.ecc.curve(sjcl.bn.prime.p521, "0x1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA51868783BF2F966B7FCC0148F709A5D03BB5C9B8899C47AEBB6FB71E91386409", -3, "0x051953EB9618E1C9A1F929A21A0B68540EEA2DA725B99B315F3B8B489918EF109E156193951EC7E937B1652C0BD3BB1BF073573DF883D2C34F1EF451FD46B503F00", 
"0xC6858E06B70404E9CD9E3ECB662395B4429C648139053FB521F828AF606B4D3DBAA14B5E77EFE75928FE1DC127A2FFA8DE3348B3C1856A429BF97E7E31C2E5BD66", "0x11839296A789A3BC0045C8A5FB42C7D1BD998F54449579B446817AFBD17273E662C97EE72995EF42640C550B9013FAD0761353C7086A272C24088BE94769FD16650"), k192:new sjcl.ecc.curve(sjcl.bn.prime.p192k, "0xfffffffffffffffffffffffe26f2fc170f69466a74defd8d", 0, 3, "0xdb4ff10ec057e9ae26b07d0280b7f4341da5d1b1eae06c7d", "0x9b2f2f6d9c5628a7844163d015be86344082aa88d95e2f9d"), k224:new sjcl.ecc.curve(sjcl.bn.prime.p224k, 
"0x010000000000000000000000000001dce8d2ec6184caf0a971769fb1f7", 0, 5, "0xa1455b334df099df30fc28a169a467e9e47075a90f7e650eb6b7a45c", "0x7e089fed7fba344282cafbd6f7e319f7c0b0bd59e2ca4bdb556d61a5"), k256:new sjcl.ecc.curve(sjcl.bn.prime.p256k, "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 0, 7, "0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798", "0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")};
sjcl.ecc.curveName = function(a) {
  for (var b in sjcl.ecc.curves) {
    if (sjcl.ecc.curves.hasOwnProperty(b) && sjcl.ecc.curves[b] === a) {
      return b;
    }
  }
  throw new sjcl.exception.invalid("no such curve");
};
sjcl.ecc.deserialize = function(a) {
  if (!a || !a.curve || !sjcl.ecc.curves[a.curve]) {
    throw new sjcl.exception.invalid("invalid serialization");
  }
  if (-1 === ["elGamal", "ecdsa"].indexOf(a.type)) {
    throw new sjcl.exception.invalid("invalid type");
  }
  var b = sjcl.ecc.curves[a.curve];
  if (a.secretKey) {
    if (!a.exponent) {
      throw new sjcl.exception.invalid("invalid exponent");
    }
    var c = new sjcl.bn(a.exponent);
    return new sjcl.ecc[a.type].secretKey(b, c);
  }
  if (!a.point) {
    throw new sjcl.exception.invalid("invalid point");
  }
  c = b.fromBits(sjcl.codec.hex.toBits(a.point));
  return new sjcl.ecc[a.type].publicKey(b, c);
};
sjcl.ecc.basicKey = {publicKey:function(a, b) {
  this._curve = a;
  this._curveBitLength = a.r.bitLength();
  this._point = b instanceof Array ? a.fromBits(b) : b;
  this.serialize = function() {
    var b = sjcl.ecc.curveName(a);
    return {type:this.getType(), secretKey:!1, point:sjcl.codec.hex.fromBits(this._point.toBits()), curve:b};
  };
  this.get = function() {
    var a = this._point.toBits(), b = sjcl.bitArray.bitLength(a), e = sjcl.bitArray.bitSlice(a, 0, b / 2), a = sjcl.bitArray.bitSlice(a, b / 2);
    return {x:e, y:a};
  };
}, secretKey:function(a, b) {
  this._curve = a;
  this._curveBitLength = a.r.bitLength();
  this._exponent = b;
  this.serialize = function() {
    var b = this.get(), d = sjcl.ecc.curveName(a);
    return {type:this.getType(), secretKey:!0, exponent:sjcl.codec.hex.fromBits(b), curve:d};
  };
  this.get = function() {
    return this._exponent.toBits();
  };
}};
sjcl.ecc.basicKey.generateKeys = function(a) {
  return function(b, c, d) {
    b = b || 256;
    if ("number" === typeof b && (b = sjcl.ecc.curves["c" + b], void 0 === b)) {
      throw new sjcl.exception.invalid("no such curve");
    }
    d = d || sjcl.bn.random(b.r, c);
    c = b.G.mult(d);
    return {pub:new sjcl.ecc[a].publicKey(b, c), sec:new sjcl.ecc[a].secretKey(b, d)};
  };
};
sjcl.ecc.elGamal = {generateKeys:sjcl.ecc.basicKey.generateKeys("elGamal"), publicKey:function(a, b) {
  sjcl.ecc.basicKey.publicKey.apply(this, arguments);
}, secretKey:function(a, b) {
  sjcl.ecc.basicKey.secretKey.apply(this, arguments);
}};
sjcl.ecc.elGamal.publicKey.prototype = {kem:function(a) {
  a = sjcl.bn.random(this._curve.r, a);
  var b = this._curve.G.mult(a).toBits();
  return {key:sjcl.hash.sha256.hash(this._point.mult(a).toBits()), tag:b};
}, getType:function() {
  return "elGamal";
}};
sjcl.ecc.elGamal.secretKey.prototype = {unkem:function(a) {
  return sjcl.hash.sha256.hash(this._curve.fromBits(a).mult(this._exponent).toBits());
}, dh:function(a) {
  return sjcl.hash.sha256.hash(a._point.mult(this._exponent).toBits());
}, dhJavaEc:function(a) {
  return a._point.mult(this._exponent).x.toBits();
}, getType:function() {
  return "elGamal";
}};
sjcl.ecc.ecdsa = {generateKeys:sjcl.ecc.basicKey.generateKeys("ecdsa")};
sjcl.ecc.ecdsa.publicKey = function(a, b) {
  sjcl.ecc.basicKey.publicKey.apply(this, arguments);
};
sjcl.ecc.ecdsa.publicKey.prototype = {verify:function(a, b, c) {
  sjcl.bitArray.bitLength(a) > this._curveBitLength && (a = sjcl.bitArray.clamp(a, this._curveBitLength));
  var d = sjcl.bitArray, e = this._curve.r, f = this._curveBitLength, g = sjcl.bn.fromBits(d.bitSlice(b, 0, f)), d = sjcl.bn.fromBits(d.bitSlice(b, f, 2 * f)), h = c ? d : d.inverseMod(e), f = sjcl.bn.fromBits(a).mul(h).mod(e), h = g.mul(h).mod(e), f = this._curve.G.mult2(f, h, this._point).x;
  if (g.equals(0) || d.equals(0) || g.greaterEquals(e) || d.greaterEquals(e) || !f.equals(g)) {
    if (void 0 === c) {
      return this.verify(a, b, !0);
    }
    throw new sjcl.exception.corrupt("signature didn't check out");
  }
  return !0;
}, getType:function() {
  return "ecdsa";
}};
sjcl.ecc.ecdsa.secretKey = function(a, b) {
  sjcl.ecc.basicKey.secretKey.apply(this, arguments);
};
sjcl.ecc.ecdsa.secretKey.prototype = {sign:function(a, b, c, d) {
  sjcl.bitArray.bitLength(a) > this._curveBitLength && (a = sjcl.bitArray.clamp(a, this._curveBitLength));
  var e = this._curve.r, f = e.bitLength();
  d = d || sjcl.bn.random(e.sub(1), b).add(1);
  b = this._curve.G.mult(d).x.mod(e);
  a = sjcl.bn.fromBits(a).add(b.mul(this._exponent));
  c = c ? a.inverseMod(e).mul(d).mod(e) : a.mul(d.inverseMod(e)).mod(e);
  return sjcl.bitArray.concat(b.toBits(f), c.toBits(f));
}, getType:function() {
  return "ecdsa";
}};
sjcl.keyexchange.srp = {makeVerifier:function(a, b, c, d) {
  a = sjcl.keyexchange.srp.makeX(a, b, c);
  a = sjcl.bn.fromBits(a);
  return d.g.powermod(a, d.N);
}, makeX:function(a, b, c) {
  a = sjcl.hash.sha1.hash(a + ":" + b);
  return sjcl.hash.sha1.hash(sjcl.bitArray.concat(c, a));
}, knownGroup:function(a) {
  "string" !== typeof a && (a = a.toString());
  sjcl.keyexchange.srp._didInitKnownGroups || sjcl.keyexchange.srp._initKnownGroups();
  return sjcl.keyexchange.srp._knownGroups[a];
}, _didInitKnownGroups:!1, _initKnownGroups:function() {
  var a, b;
  for (a = 0;a < sjcl.keyexchange.srp._knownGroupSizes.length;a++) {
    b = sjcl.keyexchange.srp._knownGroupSizes[a].toString(), b = sjcl.keyexchange.srp._knownGroups[b], b.N = new sjcl.bn(b.N), b.g = new sjcl.bn(b.g);
  }
  sjcl.keyexchange.srp._didInitKnownGroups = !0;
}, _knownGroupSizes:[1024, 1536, 2048, 3072, 4096, 6144, 8192], _knownGroups:{1024:{N:"EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3", g:2}, 1536:{N:"9DEF3CAFB939277AB1F12A8617A47BBBDBA51DF499AC4C80BEEEA9614B19CC4D5F4F5F556E27CBDE51C6A94BE4607A291558903BA0D0F84380B655BB9A22E8DCDF028A7CEC67F0D08134B1C8B97989149B609E0BE3BAB63D47548381DBC5B1FC764E3F4B53DD9DA1158BFD3E2B9C8CF56EDF019539349627DB2FD53D24B7C48665772E437D6C7F8CE442734AF7CCB7AE837C264AE3A9BEB87F8A2FE9B8B5292E5A021FFF5E91479E8CE7A28C2442C6F315180F93499A234DCF76E3FED135F9BB", 
g:2}, 2048:{N:"AC6BDB41324A9A9BF166DE5E1389582FAF72B6651987EE07FC3192943DB56050A37329CBB4A099ED8193E0757767A13DD52312AB4B03310DCD7F48A9DA04FD50E8083969EDB767B0CF6095179A163AB3661A05FBD5FAAAE82918A9962F0B93B855F97993EC975EEAA80D740ADBF4FF747359D041D5C33EA71D281E446B14773BCA97B43A23FB801676BD207A436C6481F1D2B9078717461A5B9D32E688F87748544523B524B0D57D5EA77A2775D2ECFA032CFBDBF52FB3786160279004E57AE6AF874E7303CE53299CCC041C7BC308D82A5698F3A8D0C38271AE35F8E9DBFBB694B5C803D89F7AE435DE236D525F54759B65E372FCD68EF20FA7111F9E4AFF73", 
g:2}, 3072:{N:"FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF", 
g:5}, 4096:{N:"FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B2699C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934063199FFFFFFFFFFFFFFFF", 
g:5}, 6144:{N:"FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B2699C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C93402849236C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B332051512BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97FBEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AACC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58BB7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E6DCC4024FFFFFFFFFFFFFFFF", 
g:5}, 8192:{N:"FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E088A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE649286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF6955817183995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7DB3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D2261AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200CBBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFCE0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B2699C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C93402849236C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B332051512BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97FBEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AACC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58BB7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E6DBE115974A3926F12FEE5E438777CB6A932DF8CD8BEC4D073B931BA3BC832B68D9DD300741FA7BF8AFC47ED2576F6936BA424663AAB639C5AE4F5683423B4742BF1C978238F16CBE39D652DE3FDB8BEFC848AD922222E04A4037C0713EB57A81A23F0C73473FC646CEA306B4BCBC8862F8385DDFA9D4B7FA2C087E879683303ED5BDD3A062B3CF5B3A278A66D2A13F83F44F82DDF310EE074AB6A364597E899A0255DC164F31CC50846851DF9AB48195DED7EA1B1D510BD7EE74D73FAF36BC31ECFA268359046F4EB879F924009438B481C6CD7889A002ED5EE382BC9190DA6FC026E479558E4475677E9AA9E3050E2765694DFC81F56E880B96E7160C980DD98EDD3DFFFFFFFFFFFFFFFFF", 
g:19}}};
sjcl.arrayBuffer = sjcl.arrayBuffer || {};
"undefined" === typeof ArrayBuffer && function(a) {
  a.ArrayBuffer = function() {
  };
  a.DataView = function() {
  };
}(this);
sjcl.arrayBuffer.ccm = {mode:"ccm", defaults:{tlen:128}, compat_encrypt:function(a, b, c, d, e) {
  var f = sjcl.codec.arrayBuffer.fromBits(b, !0, 16);
  b = sjcl.bitArray.bitLength(b) / 8;
  d = d || [];
  a = sjcl.arrayBuffer.ccm.encrypt(a, f, c, d, e || 64, b);
  c = sjcl.codec.arrayBuffer.toBits(a.ciphertext_buffer);
  c = sjcl.bitArray.clamp(c, 8 * b);
  return sjcl.bitArray.concat(c, a.tag);
}, compat_decrypt:function(a, b, c, d, e) {
  e = e || 64;
  d = d || [];
  var f = sjcl.bitArray, g = f.bitLength(b), h = f.clamp(b, g - e);
  b = f.bitSlice(b, g - e);
  h = sjcl.codec.arrayBuffer.fromBits(h, !0, 16);
  a = sjcl.arrayBuffer.ccm.decrypt(a, h, c, b, d, e, (g - e) / 8);
  return sjcl.bitArray.clamp(sjcl.codec.arrayBuffer.toBits(a), g - e);
}, encrypt:function(a, b, c, d, e, f) {
  var g, h = sjcl.bitArray, k = h.bitLength(c) / 8;
  d = d || [];
  e = e || sjcl.arrayBuffer.ccm.defaults.tlen;
  f = f || b.byteLength;
  e = Math.ceil(e / 8);
  for (g = 2;4 > g && f >>> 8 * g;g++) {
  }
  g < 15 - k && (g = 15 - k);
  c = h.clamp(c, 8 * (15 - g));
  d = sjcl.arrayBuffer.ccm._computeTag(a, b, c, d, e, f, g);
  d = sjcl.arrayBuffer.ccm._ctrMode(a, b, c, d, e, g);
  return {ciphertext_buffer:b, tag:d};
}, decrypt:function(a, b, c, d, e, f, g) {
  var h, k = sjcl.bitArray, m = k.bitLength(c) / 8;
  e = e || [];
  f = f || sjcl.arrayBuffer.ccm.defaults.tlen;
  g = g || b.byteLength;
  f = Math.ceil(f / 8);
  for (h = 2;4 > h && g >>> 8 * h;h++) {
  }
  h < 15 - m && (h = 15 - m);
  c = k.clamp(c, 8 * (15 - h));
  d = sjcl.arrayBuffer.ccm._ctrMode(a, b, c, d, f, h);
  a = sjcl.arrayBuffer.ccm._computeTag(a, b, c, e, f, g, h);
  if (!sjcl.bitArray.equal(d, a)) {
    throw new sjcl.exception.corrupt("ccm: tag doesn't match");
  }
  return b;
}, _computeTag:function(a, b, c, d, e, f, g) {
  c = sjcl.mode.ccm._macAdditionalData(a, d, c, e, f, g);
  if (0 !== b.byteLength) {
    for (d = new DataView(b);f < b.byteLength;f++) {
      d.setUint8(f, 0);
    }
    for (f = 0;f < d.byteLength;f += 16) {
      c[0] ^= d.getUint32(f), c[1] ^= d.getUint32(f + 4), c[2] ^= d.getUint32(f + 8), c[3] ^= d.getUint32(f + 12), c = a.encrypt(c);
    }
  }
  return sjcl.bitArray.clamp(c, 8 * e);
}, _ctrMode:function(a, b, c, d, e, f) {
  var g, h, k, m, l;
  g = sjcl.bitArray;
  h = g._xor4;
  var n = b.byteLength / 50, p = n;
  new DataView(new ArrayBuffer(16));
  c = g.concat([g.partial(8, f - 1)], c).concat([0, 0, 0]).slice(0, 4);
  d = g.bitSlice(h(d, a.encrypt(c)), 0, 8 * e);
  c[3]++;
  0 === c[3] && c[2]++;
  if (0 !== b.byteLength) {
    for (e = new DataView(b), l = 0;l < e.byteLength;l += 16) {
      l > n && (sjcl.mode.ccm._callProgressListener(l / b.byteLength), n += p), m = a.encrypt(c), g = e.getUint32(l), h = e.getUint32(l + 4), f = e.getUint32(l + 8), k = e.getUint32(l + 12), e.setUint32(l, g ^ m[0]), e.setUint32(l + 4, h ^ m[1]), e.setUint32(l + 8, f ^ m[2]), e.setUint32(l + 12, k ^ m[3]), c[3]++, 0 === c[3] && c[2]++;
    }
  }
  return d;
}};
"undefined" === typeof ArrayBuffer && function(a) {
  a.ArrayBuffer = function() {
  };
  a.DataView = function() {
  };
}(this);
sjcl.codec.arrayBuffer = {fromBits:function(a, b, c) {
  var d;
  b = void 0 == b ? !0 : b;
  c = c || 8;
  if (0 === a.length) {
    return new ArrayBuffer(0);
  }
  d = sjcl.bitArray.bitLength(a) / 8;
  if (0 !== sjcl.bitArray.bitLength(a) % 8) {
    throw new sjcl.exception.invalid("Invalid bit size, must be divisble by 8 to fit in an arraybuffer correctly");
  }
  b && 0 !== d % c && (d += c - d % c);
  c = new DataView(new ArrayBuffer(4 * a.length));
  for (b = 0;b < a.length;b++) {
    c.setUint32(4 * b, a[b] << 32);
  }
  a = new DataView(new ArrayBuffer(d));
  if (a.byteLength === c.byteLength) {
    return c.buffer;
  }
  d = c.byteLength < a.byteLength ? c.byteLength : a.byteLength;
  for (b = 0;b < d;b++) {
    a.setUint8(b, c.getUint8(b));
  }
  return a.buffer;
}, toBits:function(a) {
  var b = [], c, d, e;
  if (0 === a.byteLength) {
    return [];
  }
  d = new DataView(a);
  c = d.byteLength - d.byteLength % 4;
  for (a = 0;a < c;a += 4) {
    b.push(d.getUint32(a));
  }
  if (0 != d.byteLength % 4) {
    e = new DataView(new ArrayBuffer(4));
    a = 0;
    for (var f = d.byteLength % 4;a < f;a++) {
      e.setUint8(a + 4 - f, d.getUint8(c + a));
    }
    b.push(sjcl.bitArray.partial(d.byteLength % 4 * 8, e.getUint32(0)));
  }
  return b;
}, hexDumpBuffer:function(a) {
  a = new DataView(a);
  for (var b = "", c = 0;c < a.byteLength;c += 2) {
    0 == c % 16 && (b += "\n" + c.toString(16) + "\t");
    var d;
    d = a.getUint16(c).toString(16);
    d += "";
    d = 4 <= d.length ? d : Array(4 - d.length + 1).join("0") + d;
    b += d + " ";
  }
  console.log(b.toUpperCase());
}};
(function() {
  function a(a, b) {
    return a << b | a >>> 32 - b;
  }
  function b(a) {
    return (a & 255) << 24 | (a & 65280) << 8 | (a & 16711680) >>> 8 | (a & -16777216) >>> 24;
  }
  function c(b) {
    for (var c = this._h[0], d = this._h[1], g = this._h[2], h = this._h[3], x = this._h[4], y = this._h[0], B = this._h[1], z = this._h[2], u = this._h[3], v = this._h[4], q = 0, w;16 > q;++q) {
      w = a(c + (d ^ g ^ h) + b[k[q]] + e[q], l[q]) + x, c = x, x = h, h = a(g, 10), g = d, d = w, w = a(y + (B ^ (z | ~u)) + b[m[q]] + f[q], n[q]) + v, y = v, v = u, u = a(z, 10), z = B, B = w;
    }
    for (;32 > q;++q) {
      w = a(c + (d & g | ~d & h) + b[k[q]] + e[q], l[q]) + x, c = x, x = h, h = a(g, 10), g = d, d = w, w = a(y + (B & u | z & ~u) + b[m[q]] + f[q], n[q]) + v, y = v, v = u, u = a(z, 10), z = B, B = w;
    }
    for (;48 > q;++q) {
      w = a(c + ((d | ~g) ^ h) + b[k[q]] + e[q], l[q]) + x, c = x, x = h, h = a(g, 10), g = d, d = w, w = a(y + ((B | ~z) ^ u) + b[m[q]] + f[q], n[q]) + v, y = v, v = u, u = a(z, 10), z = B, B = w;
    }
    for (;64 > q;++q) {
      w = a(c + (d & h | g & ~h) + b[k[q]] + e[q], l[q]) + x, c = x, x = h, h = a(g, 10), g = d, d = w, w = a(y + (B & z | ~B & u) + b[m[q]] + f[q], n[q]) + v, y = v, v = u, u = a(z, 10), z = B, B = w;
    }
    for (;80 > q;++q) {
      w = a(c + (d ^ (g | ~h)) + b[k[q]] + e[q], l[q]) + x, c = x, x = h, h = a(g, 10), g = d, d = w, w = a(y + (B ^ z ^ u) + b[m[q]] + f[q], n[q]) + v, y = v, v = u, u = a(z, 10), z = B, B = w;
    }
    w = this._h[1] + g + u;
    this._h[1] = this._h[2] + h + v;
    this._h[2] = this._h[3] + x + y;
    this._h[3] = this._h[4] + c + B;
    this._h[4] = this._h[0] + d + z;
    this._h[0] = w;
  }
  sjcl.hash.ripemd160 = function(a) {
    a ? (this._h = a._h.slice(0), this._buffer = a._buffer.slice(0), this._length = a._length) : this.reset();
  };
  sjcl.hash.ripemd160.hash = function(a) {
    return (new sjcl.hash.ripemd160).update(a).finalize();
  };
  sjcl.hash.ripemd160.prototype = {reset:function() {
    this._h = d.slice(0);
    this._buffer = [];
    this._length = 0;
    return this;
  }, update:function(a) {
    "string" === typeof a && (a = sjcl.codec.utf8String.toBits(a));
    var d, e = this._buffer = sjcl.bitArray.concat(this._buffer, a);
    d = this._length;
    a = this._length = d + sjcl.bitArray.bitLength(a);
    for (d = 512 + d & -512;d <= a;d += 512) {
      for (var f = e.splice(0, 16), g = 0;16 > g;++g) {
        f[g] = b(f[g]);
      }
      c.call(this, f);
    }
    return this;
  }, finalize:function() {
    var a = sjcl.bitArray.concat(this._buffer, [sjcl.bitArray.partial(1, 1)]), d = (this._length + 1) % 512, d = (448 < d ? 512 : 448) - d % 448, e = d % 32;
    for (0 < e && (a = sjcl.bitArray.concat(a, [sjcl.bitArray.partial(e, 0)]));32 <= d;d -= 32) {
      a.push(0);
    }
    a.push(b(this._length | 0));
    for (a.push(b(Math.floor(this._length / 4294967296)));a.length;) {
      e = a.splice(0, 16);
      for (d = 0;16 > d;++d) {
        e[d] = b(e[d]);
      }
      c.call(this, e);
    }
    a = this._h;
    this.reset();
    for (d = 0;5 > d;++d) {
      a[d] = b(a[d]);
    }
    return a;
  }};
  for (var d = [1732584193, 4023233417, 2562383102, 271733878, 3285377520], e = [0, 1518500249, 1859775393, 2400959708, 2840853838], f = [1352829926, 1548603684, 1836072691, 2053994217, 0], g = 4;0 <= g;--g) {
    for (var h = 1;16 > h;++h) {
      e.splice(g, 0, e[g]), f.splice(g, 0, f[g]);
    }
  }
  var k = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13], m = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11], l = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6], n = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 
  13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11];
})();

