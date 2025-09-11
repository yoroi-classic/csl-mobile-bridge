export declare class BigNum {
  // Instance methods
  to_hex(): string;
  to_str(): string;
  to_json(): string;
  to_bytes(): number[];
  is_zero(): boolean;

  div_floor(other: BigNum): BigNum;
  checked_add(other: BigNum): BigNum;
  checked_sub(other: BigNum): BigNum;
  checked_mul(other: BigNum): BigNum;
  clamped_sub(other: BigNum): BigNum;

  less_than(rhs: BigNum): boolean;
  compare(rhs: BigNum): number; // -1 | 0 | 1

  // Static methods
  static from_hex(hex: string): BigNum;
  static from_str(s: string): BigNum;
  static from_json(json: string): BigNum;
  static from_bytes(bytes: number[]): BigNum;

  static zero(): BigNum;
  static one(): BigNum;
  static max_value(): BigNum;
  static max(a: BigNum, b: BigNum): BigNum;
}
