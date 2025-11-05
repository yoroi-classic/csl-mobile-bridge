import React from 'react';
import { 
  Value,
  MultiAsset,
  Assets,
  AssetName,
  ScriptHash,
  BigNum
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class ValueExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Simple value (ADA only)
      const adaValue = Value.new(BigNum.from_str("1000000"));
      results.push(`✓ ADA value: ${adaValue.coin().to_str()} lovelace`);

      // MultiAsset
      const multiAsset = MultiAsset.new();
      const assets = Assets.new();
      const assetName = AssetName.new(new TextEncoder().encode("TestToken"));
      const assetAmount = BigNum.from_str("100");
      assets.insert(assetName, assetAmount);

      const policyId = ScriptHash.from_bytes(new Uint8Array(28).fill(1));
      multiAsset.insert(policyId, assets);

      // Value with MultiAsset
      const valueWithAssets = Value.new_with_assets(BigNum.from_str("1000000"), multiAsset);
      results.push(`✓ Value with assets: ${valueWithAssets.coin().to_str()} lovelace + assets`);

      // Value operations
      const value2 = Value.new(BigNum.from_str("500000"));
      const sum = adaValue.checked_add(value2);
      results.push(`✓ Value addition: ${sum.coin().to_str()} lovelace`);

      // Zero value
      const zeroValue = Value.zero();
      results.push(`✓ Zero value: ${zeroValue.is_zero()}`);

      // Value conversions
      const valueBytes = adaValue.to_bytes();
      const valueFromBytes = Value.from_bytes(valueBytes);
      results.push(`✓ Value from bytes: ${valueFromBytes.coin().to_str()} lovelace`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "💰 Value & MultiAsset Examples", results };
  }
}
