declare global {
  // This is the native object installed by JSI
  interface NativeBigNum {
    to_str(): string;
    checked_add(other: NativeBigNum): NativeBigNum;
    checked_sub(other: NativeBigNum): NativeBigNum;
    clamped_sub(other: NativeBigNum): NativeBigNum;
    compare(other: NativeBigNum): number;
  }

  // This is the constructor for the native object
  interface BigNumConstructor {
    new (str: string): NativeBigNum;
    from_str(str: string): NativeBigNum;
  }

  // This is the global variable
  var BigNum: BigNumConstructor;
}

// We keep the same public API for our wrapper
export class BigNum {
  // It now holds a reference to the native-backed object
  private native: NativeBigNum;

  // The constructor is private to force usage of static methods
  private constructor(native: NativeBigNum) {
    this.native = native;
  }

  // Static method to create a BigNum from a string
  static from_str(str: string): BigNum {
    // We call the global native constructor's static method
    const native = globalThis.BigNum.from_str(str);
    return new BigNum(native);
  }

  // Instance methods now delegate to the native object
  to_str(): string {
    return this.native.to_str();
  }

  checked_add(other: BigNum): BigNum {
    const result = this.native.checked_add(other.native);
    return new BigNum(result);
  }

  checked_sub(other: BigNum): BigNum {
    const result = this.native.checked_sub(other.native);
    return new BigNum(result);
  }

  clamped_sub(other: BigNum): BigNum {
    const result = this.native.clamped_sub(other.native);
    return new BigNum(result);
  }

  compare(other: BigNum): number {
    return this.native.compare(other.native);
  }
}
