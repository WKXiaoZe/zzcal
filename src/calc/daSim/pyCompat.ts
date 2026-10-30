// Python-compatible helpers so the web engine reproduces da-sim (Python) bit-for-bit.

/** Python `round(x, n)`: correctly rounded decimal, exact ties → half-to-even. */
export function pyRound(x: number, n = 0): number {
  if (!Number.isFinite(x)) return x;
  const m = 10 ** n;
  const twice = x * 2 * m;
  if (Number.isInteger(twice) && Math.abs(twice) < 2 ** 52 && Math.abs(twice) % 2 === 1) {
    // exact tie: k + 0.5 at scale m
    const lo = Math.floor(x * m);
    const pick = lo % 2 === 0 ? lo : lo + 1;
    return pick / m;
  }
  if (x < 0) return -Number((-x).toFixed(n));
  return Number(x.toFixed(n));
}

/** Python int(x) truncation for numeric-ish values. */
export function pyInt(x: unknown): number {
  const v = Number(x ?? 0);
  return Number.isFinite(v) ? Math.trunc(v) : 0;
}

/** Python `float(x or 0)`. */
export function f0(x: unknown, d = 0): number {
  if (x === undefined || x === null || x === '' || x === false) return d;
  if (x === true) return 1;
  const v = Number(x);
  return Number.isFinite(v) ? v : d;
}

/** Python truthiness for JSON-ish values. */
export function truthy(x: unknown): boolean {
  if (x === undefined || x === null || x === false || x === 0 || x === '') return false;
  if (Array.isArray(x)) return x.length > 0;
  if (typeof x === 'object') return Object.keys(x as object).length > 0;
  return true;
}

/** `a or b` */
export function or<T>(a: T, b: T): T {
  return truthy(a) ? a : b;
}

/**
 * Python `random.Random(seed)`: MT19937 seeded via init_by_array(abs(seed) 32-bit chunks).
 * `random()` = (a*67108864 + b) / 2^53 with a = genrand>>>5, b = genrand>>>6.
 */
export class PyRandom {
  private mt = new Uint32Array(624);
  private mti = 625;

  constructor(seed: number) {
    let s = Math.abs(Math.trunc(seed));
    const key: number[] = [];
    if (s === 0) key.push(0);
    while (s > 0) {
      key.push(s % 0x100000000);
      s = Math.floor(s / 0x100000000);
    }
    this.initByArray(key);
  }

  private initGenrand(s: number) {
    const mt = this.mt;
    mt[0] = s >>> 0;
    for (let i = 1; i < 624; i++) {
      const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = (Math.imul(1812433253, prev) + i) >>> 0;
    }
    this.mti = 624;
  }

  private initByArray(key: number[]) {
    const mt = this.mt;
    this.initGenrand(19650218);
    let i = 1;
    let j = 0;
    const n = 624;
    let k = n > key.length ? n : key.length;
    for (; k; k--) {
      const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = ((mt[i] ^ Math.imul(prev, 1664525)) + key[j] + j) >>> 0;
      i++;
      j++;
      if (i >= n) {
        mt[0] = mt[n - 1];
        i = 1;
      }
      if (j >= key.length) j = 0;
    }
    for (k = n - 1; k; k--) {
      const prev = mt[i - 1] ^ (mt[i - 1] >>> 30);
      mt[i] = ((mt[i] ^ Math.imul(prev, 1566083941)) - i) >>> 0;
      i++;
      if (i >= n) {
        mt[0] = mt[n - 1];
        i = 1;
      }
    }
    mt[0] = 0x80000000;
  }

  private genrand(): number {
    const mt = this.mt;
    let y: number;
    if (this.mti >= 624) {
      let kk = 0;
      for (; kk < 624 - 397; kk++) {
        y = (mt[kk] & 0x80000000) | (mt[kk + 1] & 0x7fffffff);
        mt[kk] = mt[kk + 397] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
      }
      for (; kk < 623; kk++) {
        y = (mt[kk] & 0x80000000) | (mt[kk + 1] & 0x7fffffff);
        mt[kk] = mt[kk + (397 - 624)] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
      }
      y = (mt[623] & 0x80000000) | (mt[0] & 0x7fffffff);
      mt[623] = mt[396] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
      this.mti = 0;
    }
    y = mt[this.mti++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  random(): number {
    const a = this.genrand() >>> 5;
    const b = this.genrand() >>> 6;
    return (a * 67108864 + b) / 9007199254740992;
  }

  uniform(a: number, b: number): number {
    return a + (b - a) * this.random();
  }
}
