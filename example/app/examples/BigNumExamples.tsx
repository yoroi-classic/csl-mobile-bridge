import React from 'react';
import { BigNum } from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection, ExampleComponentProps } from '../types';

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

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "🔢 BigNum Examples", results };
  }
}
