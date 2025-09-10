import CslMobileBridge from './NativeCslMobileBridge';

type _BN = {
  to_hex(): string;
  to_str(): string;
  to_json(): string;
  to_bytes(): number[];
  is_zero(): boolean;

  div_floor(other: _BN): _BN;
  checked_add(other: _BN): _BN;
  checked_sub(other: _BN): _BN;
  checked_mul(other: _BN): _BN;
  clamped_sub(other: _BN): _BN;

  less_than(rhs: _BN): boolean;
  compare(rhs: _BN): number; // -1 | 0 | 1
};

type _Exports = {
  BigNum: {
    from_hex(hex: string): _BN;
    from_str(s: string): _BN;
    from_json(json: string): _BN;
    from_bytes(bytes: number[]): _BN;

    zero(): _BN;
    one(): _BN;
    max_value(): _BN;
    max(a: _BN, b: _BN): _BN;
  };
};

const _exports = CslMobileBridge.install() as _Exports;

export const BigNum = _exports.BigNum;
export default _exports;
