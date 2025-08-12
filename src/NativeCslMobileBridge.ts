import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type NativeBigNum = { __bignum: boolean };

export interface Spec extends TurboModule {
  // BigNum
  bigNumFromBytes(bytes: number[]): NativeBigNum;
  bigNumToBytes(bigNum: NativeBigNum): number[];
  bigNumFromHex(hex: string): NativeBigNum;
  bigNumToHex(a: NativeBigNum): string;
  bigNumFromStr(value: string): NativeBigNum;
  bigNumToStr(bigNum: NativeBigNum): string;
  bigNumToJson(a: NativeBigNum): string;
  bigNumCheckedAdd(a: NativeBigNum, b: NativeBigNum): NativeBigNum;
  bigNumCheckedSub(a: NativeBigNum, b: NativeBigNum): NativeBigNum;
  bigNumCheckedMul(a: NativeBigNum, b: NativeBigNum): NativeBigNum;
  bigNumClampedSub(a: NativeBigNum, b: NativeBigNum): NativeBigNum;
  bigNumDivFloor(a: NativeBigNum, b: NativeBigNum): NativeBigNum;
  bigNumCompare(a: NativeBigNum, b: NativeBigNum): number;
  bigNumLessThan(a: NativeBigNum, b: NativeBigNum): boolean;
  bigNumIsZero(a: NativeBigNum): boolean;
  bigNumZero(): NativeBigNum;
  bigNumOne(): NativeBigNum;
  bigNumMaxValue(): NativeBigNum;
}

export default TurboModuleRegistry.getEnforcing<Spec>('CslMobileBridge');
