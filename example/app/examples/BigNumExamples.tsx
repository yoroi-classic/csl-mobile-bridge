import React from 'react';
import { BigNum } from "@emurgo/csl-mobile-bridge";
import { ExampleSection } from '../types';

// Helper function to validate expected vs actual values
function validate<T>(results: string[], name: string, expected: T, actual: T): void {
  if (expected === actual) {
    results.push(`✓ ${name}: expected ${expected}, actual: ${actual}`);
  } else {
    results.push(`❌ Error: ${name}: expected ${expected}, actual: ${actual}`);
  }
}

export default class BigNumExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      // Basic creation
      const bn1Str = "12345678901234";
      const bn1 = BigNum.from_str(bn1Str);
      validate(results, "BigNum.from_str", bn1Str, bn1.to_str());

      // Static methods
      const zero = BigNum.zero();
      const one = BigNum.one();
      validate(results, "BigNum.zero()", "0", zero.to_str());
      validate(results, "BigNum.one()", "1", one.to_str());

      // Arithmetic operations
      const bn2Str = "1000000000000000000";
      const bn2 = BigNum.from_str(bn2Str);
      const sum = bn1.checked_add(bn2);
      const expectedSum = "1000012345678901234";
      validate(results, "Addition result", expectedSum, sum.to_str());

      const product = bn1.checked_mul(BigNum.from_str("2"));
      const expectedProduct = "24691357802468";
      validate(results, "Multiplication result", expectedProduct, product.to_str());

      // Comparison
      const isLess = bn1.less_than(product);
      validate(results, "Comparison bn1 < product", true, isLess);

      const bn1_2= bn1.to_str();
      validate(results, "Bn1 still the same", bn1Str, bn1_2);

      // Conversions
      const hex = bn1.to_hex();
      const expectedHex = "1b00000b3a73ce2ff2";
      validate(results, "To hex", expectedHex, hex);

      const fromBytes = BigNum.from_bytes(bn1.to_bytes());
      validate(results, "From bytes round-trip", bn1Str, fromBytes.to_str());

      const fromHex = BigNum.from_hex(hex);
      validate(results, "From hex round-trip", bn1Str, fromHex.to_str());

      // Additional BigNum operations
      const diff = product.checked_sub(bn1);
      const expectedDiff = bn1Str; // product - bn1 = 2*bn1 - bn1 = bn1
      validate(results, "Subtraction result", expectedDiff, diff.to_str());

      const clampedDiff = product.clamped_sub(bn1);
      validate(results, "Clamped subtraction result", expectedDiff, clampedDiff.to_str());

      const divResult = bn2.div_floor(BigNum.from_str("1000000000000"));
      const expectedDiv = "1000000";
      validate(results, "Division result", expectedDiv, divResult.to_str());

      // Max value and max function
      const maxValue = BigNum.max_value();
      const expectedMaxValue = "18446744073709551615";
      validate(results, "Max value", expectedMaxValue, maxValue.to_str());

      const maxOfTwo = BigNum.max(bn1, bn2);
      validate(results, "Max of two", bn2Str, maxOfTwo.to_str());

      // Zero check
      const isZero = zero.is_zero();
      const isNonZero = bn1.is_zero();
      validate(results, "zero.is_zero()", true, isZero);
      validate(results, "bn1.is_zero()", false, isNonZero);

      // JSON conversion
      const bigNumJson = bn1.to_json();
      const fromJson = BigNum.from_json(bigNumJson);
      validate(results, "BigNum from JSON round-trip", bn1Str, fromJson.to_str());

      // Bytes conversion verification
      const originalBytes = bn1.to_bytes();
      const reconstructed = BigNum.from_bytes(originalBytes);
      validate(results, "Bytes round-trip", bn1Str, reconstructed.to_str());

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "🔢 BigNum Examples", results };
  }
}
