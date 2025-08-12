import CslMobileBridge from './NativeCslMobileBridge';
import type { NativeBigNum } from './NativeCslMobileBridge';

export interface BigNum {
  compare(other: BigNum): number;
  checked_add(other: BigNum): BigNum;
  checked_sub(other: BigNum): BigNum;
  checked_mul(other: BigNum): BigNum;
  clamped_sub(other: BigNum): BigNum;
  div_floor(other: BigNum): BigNum;
  less_than(other: BigNum): boolean;
  is_zero(): boolean;
  to_bytes(): Uint8Array;
  to_hex(): string;
  to_str(): string;
  to_json(): string;
}

export interface BigNumConstructor {
  from_bytes(bytes: Uint8Array): BigNum;
  from_hex(hex: string): BigNum;
  from_str(value: string): BigNum;
  zero(): BigNum;
  one(): BigNum;
  max_value(): BigNum;
}

/**
 * JS wrapper convenience class (optional): keeps the native object reference private and delegates to CslMobileBridge.
 * This wrapper mirrors the native object's prototype methods, but wraps returned native objects.
 */
export class BigNumImpl implements BigNum {
  private _nativeObj: NativeBigNum;

  private constructor(nativeObj: NativeBigNum) {
    this._nativeObj = nativeObj;
  }

  static from_str(value: string): BigNum {
    const native = CslMobileBridge.bigNumFromStr(value);
    return BigNumImpl.fromNative(native);
  }

  static zero(): BigNum {
    return BigNumImpl.fromNative(CslMobileBridge.bigNumZero());
  }

  static one(): BigNum {
    return BigNumImpl.fromNative(CslMobileBridge.bigNumOne());
  }

  static max_value(): BigNum {
    return BigNumImpl.fromNative(CslMobileBridge.bigNumMaxValue());
  }

  static from_hex(hex: string): BigNum {
    return BigNumImpl.fromNative(CslMobileBridge.bigNumFromHex(hex));
  }

  static from_bytes(bytes: Uint8Array): BigNum {
    return BigNumImpl.fromNative(
      CslMobileBridge.bigNumFromBytes(Array.from(bytes))
    );
  }

  static fromNative(nativeObj: NativeBigNum): BigNumImpl {
    if (!nativeObj || typeof nativeObj !== 'object') {
      throw new Error('Invalid native BigNum instance');
    }
    return new BigNumImpl(nativeObj);
  }

  to_str(): string {
    return CslMobileBridge.bigNumToStr(this._nativeObj);
  }

  checked_add(other: BigNum): BigNum {
    const otherNative = (other as BigNumImpl)._nativeObj;
    const res = CslMobileBridge.bigNumCheckedAdd(this._nativeObj, otherNative);
    return BigNumImpl.fromNative(res);
  }

  checked_sub(other: BigNum): BigNum {
    const otherNative = (other as BigNumImpl)._nativeObj;
    const res = CslMobileBridge.bigNumCheckedSub(this._nativeObj, otherNative);
    return BigNumImpl.fromNative(res);
  }

  clamped_sub(other: BigNum): BigNum {
    const otherNative = (other as BigNumImpl)._nativeObj;
    const res = CslMobileBridge.bigNumClampedSub(this._nativeObj, otherNative);
    return BigNumImpl.fromNative(res);
  }

  compare(other: BigNum): number {
    const otherNative = (other as BigNumImpl)._nativeObj;
    return CslMobileBridge.bigNumCompare(this._nativeObj, otherNative);
  }

  is_zero(): boolean {
    return CslMobileBridge.bigNumIsZero(this._nativeObj);
  }

  checked_mul(other: BigNum): BigNum {
    const otherNative = (other as BigNumImpl)._nativeObj;
    const res = CslMobileBridge.bigNumCheckedMul(this._nativeObj, otherNative);
    return BigNumImpl.fromNative(res);
  }

  div_floor(other: BigNum): BigNum {
    const otherNative = (other as BigNumImpl)._nativeObj;
    const res = CslMobileBridge.bigNumDivFloor(this._nativeObj, otherNative);
    return BigNumImpl.fromNative(res);
  }

  less_than(other: BigNum): boolean {
    const otherNative = (other as BigNumImpl)._nativeObj;
    return CslMobileBridge.bigNumLessThan(this._nativeObj, otherNative);
  }

  to_hex(): string {
    return CslMobileBridge.bigNumToHex(this._nativeObj);
  }

  to_json(): string {
    return CslMobileBridge.bigNumToJson(this._nativeObj);
  }

  to_bytes(): Uint8Array {
    return new Uint8Array(CslMobileBridge.bigNumToBytes(this._nativeObj));
  }
}

export const BigNum = BigNumImpl as unknown as BigNumConstructor;
export default BigNum;
