import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  readonly getConstants: () => {};
  bigNumFromStr(str: string): Promise<string>;
  bigNumToStr(ptr: string): Promise<string>;
  bigNumCheckedAdd(a: string, b: string): Promise<string>;
  bigNumCheckedSub(a: string, b: string): Promise<string>;
  bigNumClampedSub(a: string, b: string): Promise<string>;
  bigNumCompare(a: string, b: string): Promise<number>;
}

const CslMobileBridge = TurboModuleRegistry.get<Spec>('CslMobileBridge');

export class BigNum {
  private ptr: string;

  private constructor(ptr: string) {
    this.ptr = ptr;
  }

  static async from_str(str: string): Promise<BigNum> {
    if (!CslMobileBridge) {
      throw new Error('CslMobileBridge module not available');
    }
    const ptr = await CslMobileBridge.bigNumFromStr(str);
    return new BigNum(ptr);
  }

  async to_str(): Promise<string> {
    return CslMobileBridge!.bigNumToStr(this.ptr);
  }

  async checked_add(other: BigNum): Promise<BigNum> {
    const ptr = await CslMobileBridge!.bigNumCheckedAdd(this.ptr, other.ptr);
    return new BigNum(ptr);
  }

  async checked_sub(other: BigNum): Promise<BigNum> {
    const ptr = await CslMobileBridge!.bigNumCheckedSub(this.ptr, other.ptr);
    return new BigNum(ptr);
  }

  async clamped_sub(other: BigNum): Promise<BigNum> {
    const ptr = await CslMobileBridge!.bigNumClampedSub(this.ptr, other.ptr);
    return new BigNum(ptr);
  }

  async compare(other: BigNum): Promise<number> {
    return CslMobileBridge!.bigNumCompare(this.ptr, other.ptr);
  }
}
