import CslMobileBridge from './NativeCslMobileBridge';
import type { NativeBigNum } from './NativeCslMobileBridge';

/**
 * Represents a big number in Cardano Serialization Library
 * This class provides methods for arithmetic operations and conversions
 */
export class BigNum {
  private _nativeObj: NativeBigNum;

  private constructor(nativeObj: NativeBigNum) {
    this._nativeObj = nativeObj;
  }

  /**
   * Creates a BigNum from a string representation
   * @param value String representation of the number
   * @returns BigNum instance
   */
  static from_str(value: string): BigNum {
    const native = CslMobileBridge.bigNumFromStr(value);
    return new BigNum(native);
  }

  /**
   * Creates a BigNum from a hexadecimal string
   * @param hex Hexadecimal string representation
   * @returns BigNum instance
   */
  static from_hex(hex: string): BigNum {
    const native = CslMobileBridge.bigNumFromHex(hex);
    return new BigNum(native);
  }

  /**
   * Creates a BigNum from a byte array
   * @param bytes Byte array representation
   * @returns BigNum instance
   */
  static from_bytes(bytes: Uint8Array): BigNum {
    const native = CslMobileBridge.bigNumFromBytes(Array.from(bytes));
    return new BigNum(native);
  }

  /**
   * Returns the BigNum representing zero
   * @returns BigNum representing 0
   */
  static zero(): BigNum {
    const native = CslMobileBridge.bigNumZero();
    return new BigNum(native);
  }

  /**
   * Returns the BigNum representing one
   * @returns BigNum representing 1
   */
  static one(): BigNum {
    const native = CslMobileBridge.bigNumOne();
    return new BigNum(native);
  }

  /**
   * Returns the maximum possible BigNum value
   * @returns Maximum BigNum value
   */
  static max_value(): BigNum {
    const native = CslMobileBridge.bigNumMaxValue();
    return new BigNum(native);
  }

  /**
   * Internal method to create BigNum from native object
   * @param nativeObj Native BigNum object
   * @returns BigNum instance
   * @internal
   */
  static __from_native(nativeObj: NativeBigNum): BigNum {
    if (!nativeObj || typeof nativeObj !== 'object') {
      throw new Error('Invalid native BigNum instance');
    }
    return new BigNum(nativeObj);
  }

  /**
   * Converts BigNum to string representation
   * @returns String representation of the number
   */
  to_str(): string {
    return CslMobileBridge.bigNumToStr(this._nativeObj);
  }

  /**
   * Converts BigNum to hexadecimal string
   * @returns Hexadecimal string representation
   */
  to_hex(): string {
    return CslMobileBridge.bigNumToHex(this._nativeObj);
  }

  /**
   * Converts BigNum to byte array
   * @returns Byte array representation
   */
  to_bytes(): Uint8Array {
    return new Uint8Array(CslMobileBridge.bigNumToBytes(this._nativeObj));
  }

  /**
   * Converts BigNum to JSON string
   * @returns JSON string representation
   */
  to_json(): string {
    return CslMobileBridge.bigNumToJson(this._nativeObj);
  }

  /**
   * Adds two BigNum values with overflow checking
   * @param other BigNum to add
   * @returns New BigNum representing the sum
   * @throws Error if overflow occurs
   */
  checked_add(other: BigNum): BigNum {
    const res = CslMobileBridge.bigNumCheckedAdd(this._nativeObj, other._nativeObj);
    return new BigNum(res);
  }

  /**
   * Subtracts two BigNum values with underflow checking
   * @param other BigNum to subtract
   * @returns New BigNum representing the difference
   * @throws Error if underflow occurs
   */
  checked_sub(other: BigNum): BigNum {
    const res = CslMobileBridge.bigNumCheckedSub(this._nativeObj, other._nativeObj);
    return new BigNum(res);
  }

  /**
   * Multiplies two BigNum values with overflow checking
   * @param other BigNum to multiply by
   * @returns New BigNum representing the product
   * @throws Error if overflow occurs
   */
  checked_mul(other: BigNum): BigNum {
    const res = CslMobileBridge.bigNumCheckedMul(this._nativeObj, other._nativeObj);
    return new BigNum(res);
  }

  /**
   * Performs clamped subtraction (result is clamped to zero if negative)
   * @param other BigNum to subtract
   * @returns New BigNum representing the clamped difference
   */
  clamped_sub(other: BigNum): BigNum {
    const res = CslMobileBridge.bigNumClampedSub(this._nativeObj, other._nativeObj);
    return new BigNum(res);
  }

  /**
   * Performs floor division
   * @param other BigNum to divide by
   * @returns New BigNum representing the floor of the division
   */
  div_floor(other: BigNum): BigNum {
    const res = CslMobileBridge.bigNumDivFloor(this._nativeObj, other._nativeObj);
    return new BigNum(res);
  }

  /**
   * Compares two BigNum values
   * @param other BigNum to compare with
   * @returns -1 if this < other, 0 if equal, 1 if this > other
   */
  compare(other: BigNum): number {
    return CslMobileBridge.bigNumCompare(this._nativeObj, other._nativeObj);
  }

  /**
   * Checks if this BigNum is less than another
   * @param other BigNum to compare with
   * @returns true if this < other, false otherwise
   */
  less_than(other: BigNum): boolean {
    return CslMobileBridge.bigNumLessThan(this._nativeObj, other._nativeObj);
  }

  /**
   * Checks if this BigNum is zero
   * @returns true if this equals zero, false otherwise
   */
  is_zero(): boolean {
    return CslMobileBridge.bigNumIsZero(this._nativeObj);
  }

  /**
   * Internal method to access native object
   * @returns Native BigNum object
   * @internal
   */
  get __native(): NativeBigNum {
    return this._nativeObj;
  }
}

// Backward compatibility exports
/**
 * @deprecated Use BigNum directly instead
 */
export const BigNumImpl = BigNum;

/**
 * @deprecated Use BigNum directly instead
 */
export default BigNum;
