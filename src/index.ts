declare global {
  interface BigNumHostObject {
    to_str(): string;
    checked_add(other: BigNumHostObject): BigNumHostObject;
    checked_sub(other: BigNumHostObject): BigNumHostObject;
    clamped_sub(other: BigNumHostObject): BigNumHostObject;
    compare(other: BigNumHostObject): number;
  }

  interface BigNumConstructor {
    new (ptr: string): BigNumHostObject;
    from_str(str: string): BigNumHostObject;
  }

  var BigNum: BigNumConstructor;
}

export class BigNum {
  private hostObject: BigNumHostObject;

  private constructor(hostObject: BigNumHostObject) {
    this.hostObject = hostObject;
  }

  static from_str(str: string): BigNum {
    const hostObject = globalThis.BigNum.from_str(str);
    return new BigNum(hostObject);
  }

  to_str(): string {
    return this.hostObject.to_str();
  }

  checked_add(other: BigNum): BigNum {
    const result = this.hostObject.checked_add(other.hostObject);
    return new BigNum(result);
  }

  checked_sub(other: BigNum): BigNum {
    const result = this.hostObject.checked_sub(other.hostObject);
    return new BigNum(result);
  }

  clamped_sub(other: BigNum): BigNum {
    const result = this.hostObject.clamped_sub(other.hostObject);
    return new BigNum(result);
  }

  compare(other: BigNum): number {
    return this.hostObject.compare(other.hostObject);
  }
}
