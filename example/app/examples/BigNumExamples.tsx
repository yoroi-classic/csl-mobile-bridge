import React from 'react';
import { BigNum } from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class BigNumExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Basic creation
      const bn1 = BigNum.from_str("12345678901234");
      results.push(`✓ BigNum.from_str("12345678901234"): ${bn1.to_str()}`);

      // Static methods
      const zero = BigNum.zero();
      const one = BigNum.one();
      results.push(`✓ BigNum.zero(): ${zero.to_str()}`);
      results.push(`✓ BigNum.one(): ${one.to_str()}`);

      // Arithmetic operations
      const bn2 = BigNum.from_str("1000000000000000000");
      const sum = bn1.checked_add(bn2);
      results.push(`✓ Addition: ${bn1.to_str()} + ${bn2.to_str()} = ${sum.to_str()}`);

      const product = bn1.checked_mul(BigNum.from_str("2"));
      results.push(`✓ Multiplication: ${bn1.to_str()} * 2 = ${product.to_str()}`);

      // Comparison
      const isLess = bn1.less_than(product);
      results.push(`✓ Comparison: ${bn1.to_str()} < ${product.to_str()} = ${isLess}`);

      // Conversions
      const hex = bn1.to_hex();
      results.push(`✓ To hex: ${hex}`);

      const fromBytes = BigNum.from_bytes(bn1.to_bytes());
      results.push(`✓ From bytes: ${fromBytes.to_str()}`);

      const fromHex = BigNum.from_hex(hex);
      results.push(`✓ From hex: ${fromHex.to_str()}`);

      // Additional BigNum operations
      const diff = product.checked_sub(bn1);
      results.push(`✓ Subtraction: ${product.to_str()} - ${bn1.to_str()} = ${diff.to_str()}`);

      const clampedDiff = product.clamped_sub(bn1);
      results.push(`✓ Clamped subtraction: ${product.to_str()} - ${bn1.to_str()} = ${clampedDiff.to_str()}`);

      const divResult = bn2.div_floor(BigNum.from_str("1000000000000"));
      results.push(`✓ Division: ${bn2.to_str()} / 1000000000000 = ${divResult.to_str()}`);

      // Max value and max function
      const maxValue = BigNum.max_value();
      results.push(`✓ Max value: ${maxValue.to_str()}`);

      const maxOfTwo = BigNum.max(bn1, bn2);
      results.push(`✓ Max of two: max(${bn1.to_str()}, ${bn2.to_str()}) = ${maxOfTwo.to_str()}`);

      // Zero check
      const isZero = zero.is_zero();
      const isNonZero = bn1.is_zero();
      results.push(`✓ Zero is zero: ${isZero}, Non-zero is zero: ${isNonZero}`);

      // JSON conversion
      const bigNumJson = bn1.to_json();
      BigNum.from_json(bigNumJson);
      results.push(`✓ BigNum from JSON: Success`);
      results.push(`✓ BigNum JSON length: ${bigNumJson.length} characters`);

      // Bytes conversion verification
      const originalBytes = bn1.to_bytes();
      const reconstructed = BigNum.from_bytes(originalBytes);
      const isSame = bn1.to_str() === reconstructed.to_str();
      results.push(`✓ Bytes round-trip success: ${isSame}`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "🔢 BigNum Examples", results };
  }
}
