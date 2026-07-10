import React from 'react';
import {
  Value,
  MultiAsset,
  Assets,
  AssetName,
  ScriptHash,
  BigNum,
  Mint,
  MintAssets,
  Int,
  AssetNames,
  ScriptHashes
} from "@yoroi-classic/csl-mobile-bridge";
import { ExampleSection } from '../types';

// Helper function to validate expected vs actual values
function validate<T>(results: string[], name: string, expected: T, actual: T): void {
  if (expected === actual) {
    results.push(`✓ ${name}: expected ${expected}, actual: ${actual}`);
  } else {
    results.push(`❌ Error: ${name}: expected ${expected}, actual: ${actual}`);
  }
}

export default class ValueExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      // Simple value (ADA only)
      const adaValueStr = "1000000";
      const adaValue = Value.new(BigNum.from_str(adaValueStr));
      validate(results, "ADA value", adaValueStr, adaValue.coin().to_str());

      // MultiAsset
      const multiAsset = MultiAsset.new();
      const assets = Assets.new();
      const assetNameStr = "TestToken";
      const assetName = AssetName.new(new TextEncoder().encode(assetNameStr));
      const assetAmountStr = "100";
      const assetAmount = BigNum.from_str(assetAmountStr);
      assets.insert(assetName, assetAmount);

      const policyIdBytes = new Uint8Array(28).fill(1);
      const policyId = ScriptHash.from_bytes(policyIdBytes);
      const expectedPolicyIdHex = "01010101010101010101010101010101010101010101010101010101";
      multiAsset.insert(policyId, assets);
      validate(results, "Policy ID hex", expectedPolicyIdHex, policyId.to_hex());

      // Value with MultiAsset
      const valueWithAssets = Value.new_with_assets(BigNum.from_str(adaValueStr), multiAsset);
      validate(results, "Value with assets coin", adaValueStr, valueWithAssets.coin().to_str());

      // Value operations
      const value2Str = "500000";
      const value2 = Value.new(BigNum.from_str(value2Str));
      const sum = adaValue.checked_add(value2);
      const expectedSumStr = "1500000";
      validate(results, "Value addition", expectedSumStr, sum.coin().to_str());

      // Zero value
      const zeroValue = Value.zero();
      validate(results, "Zero value is zero", true, zeroValue.is_zero());

      // Value conversions
      const valueBytes = adaValue.to_bytes();
      const valueFromBytes = Value.from_bytes(valueBytes);
      validate(results, "Value from bytes", adaValueStr, valueFromBytes.coin().to_str());

      // Additional Value operations
      const diff = valueWithAssets.checked_sub(adaValue);
      validate(results, "Value subtraction coin", "0", diff.coin().to_str());

      const clampedDiff = valueWithAssets.clamped_sub(adaValue);
      validate(results, "Value clamped subtraction coin", "0", clampedDiff.coin().to_str());

      const compareResult = adaValue.compare(value2);
      validate(results, "Value comparison (1000000 vs 500000)", 1, compareResult); // 1 means first > second

      // Value with MultiAsset only
      const multiAssetOnly = Value.new_from_assets(multiAsset);
      validate(results, "Value from MultiAsset only coin", "0", multiAssetOnly.coin().to_str());

      // Value operations with MultiAsset
      const valueWithMoreAssetsStr = "2000000";
      const valueWithMoreAssets = Value.new_with_assets(BigNum.from_str(valueWithMoreAssetsStr), multiAsset);
      validate(results, "Value with more assets coin", valueWithMoreAssetsStr, valueWithMoreAssets.coin().to_str());

      // Set and get MultiAsset
      const emptyValueStr = "500000";
      const emptyValue = Value.new(BigNum.from_str(emptyValueStr));
      validate(results, "Has no MultiAsset before set", true, emptyValue.multiasset() == null);
      emptyValue.set_multiasset(multiAsset);
      validate(results, "Has MultiAsset after set", true, emptyValue.multiasset() !== null);

      // Set and get coin
      const newCoinStr = "750000";
      emptyValue.set_coin(BigNum.from_str(newCoinStr));
      validate(results, "Set coin", newCoinStr, emptyValue.coin().to_str());

      // Value JSON conversion
      const valueJson = valueWithAssets.to_json();
      const valueFromJson = Value.from_json(valueJson);
      validate(results, "Value from JSON coin", adaValueStr, valueFromJson.coin().to_str());

      // Value hex conversion
      const valueHex = valueWithAssets.to_hex();
      const valueFromHex = Value.from_hex(valueHex);
      validate(results, "Value from hex coin", adaValueStr, valueFromHex.coin().to_str());

      // MultiAsset operations
      const multiAsset2 = MultiAsset.new();
      const assets2 = Assets.new();
      const assetName2Str = "SecondToken";
      const assetName2 = AssetName.new(new TextEncoder().encode(assetName2Str));
      const assetAmount2Str = "200";
      const assetAmount2 = BigNum.from_str(assetAmount2Str);
      assets2.insert(assetName2, assetAmount2);

      const policyId2 = ScriptHash.from_bytes(new Uint8Array(28).fill(2));
      multiAsset2.insert(policyId2, assets2);

      const multiAssetKeys = multiAsset.keys();
      validate(results, "MultiAsset keys count", 1, multiAssetKeys.len());

      const retrievedAssets = multiAsset.get(policyId);
      validate(results, "Retrieved assets count", 1, retrievedAssets.len());

      // Set asset in MultiAsset
      const updatedAssetAmountStr = "150";
      multiAsset.set_asset(policyId, assetName, BigNum.from_str(updatedAssetAmountStr));
      const getAsset = multiAsset.get_asset(policyId, assetName);
      validate(results, "Get asset amount after set", updatedAssetAmountStr, getAsset.to_str());

      // MultiAsset conversions
      const multiAssetBytes = multiAsset.to_bytes();
      const multiAssetFromBytes = MultiAsset.from_bytes(multiAssetBytes);
      validate(results, "MultiAsset from bytes keys count", 1, multiAssetFromBytes.keys().len());

      const multiAssetHex = multiAsset.to_hex();
      const multiAssetFromHex = MultiAsset.from_hex(multiAssetHex);
      validate(results, "MultiAsset from hex keys count", 1, multiAssetFromHex.keys().len());

      const multiAssetJson = multiAsset.to_json();
      const multiAssetFromJson = MultiAsset.from_json(multiAssetJson);
      validate(results, "MultiAsset from JSON keys count", 1, multiAssetFromJson.keys().len());

      // Assets operations
      const assets3 = Assets.new();
      const assetName3Str = "ThirdToken";
      const assetName3 = AssetName.new(new TextEncoder().encode(assetName3Str));
      const assetAmount3Str = "300";
      const assetAmount3 = BigNum.from_str(assetAmount3Str);
      assets3.insert(assetName3, assetAmount3);

      const assets4 = Assets.new();
      const assetName4Str = "FourthToken";
      const assetName4 = AssetName.new(new TextEncoder().encode(assetName4Str));
      const assetAmount4Str = "400";
      const assetAmount4 = BigNum.from_str(assetAmount4Str);
      assets4.insert(assetName4, assetAmount4);

      validate(results, "Assets3 length", 1, assets3.len());

      const retrievedAsset = assets3.get(assetName3);
      validate(results, "Retrieved asset3 amount", assetAmount3Str, retrievedAsset.to_str());

      // Assets conversions
      const assetsBytes = assets3.to_bytes();
      const assetsFromBytes = Assets.from_bytes(assetsBytes);
      validate(results, "Assets from bytes length", 1, assetsFromBytes.len());

      const assetsHex = assets3.to_hex();
      const assetsFromHex = Assets.from_hex(assetsHex);
      validate(results, "Assets from hex length", 1, assetsFromHex.len());

      const assetsJson = assets3.to_json();
      const assetsFromJson = Assets.from_json(assetsJson);
      validate(results, "Assets from JSON length", 1, assetsFromJson.len());

      // AssetName operations
      const assetName5Str = "FifthToken";
      const assetName5 = AssetName.new(new TextEncoder().encode(assetName5Str));
      validate(results, "AssetName5 data length", assetName5Str.length, assetName5.name().length);

      const assetNameBytes = assetName5.to_bytes();
      const assetNameFromBytes = AssetName.from_bytes(assetNameBytes);
      validate(results, "AssetName from bytes", assetName5.to_hex(), assetNameFromBytes.to_hex());

      const assetNameHex = assetName5.to_hex();
      const assetNameFromHex = AssetName.from_hex(assetNameHex);
      validate(results, "AssetName from hex", assetNameHex, assetNameFromHex.to_hex());

      const assetNameJson = assetName5.to_json();
      const assetNameFromJson = AssetName.from_json(assetNameJson);
      validate(results, "AssetName from JSON", assetName5.to_hex(), assetNameFromJson.to_hex());

      // AssetNames operations
      const assetNames = AssetNames.new();
      assetNames.add(assetName);
      assetNames.add(assetName2);
      assetNames.add(assetName3);
      validate(results, "AssetNames length", 3, assetNames.len());

      const retrievedAssetName = assetNames.get(0);
      validate(results, "Retrieved AssetName", assetName.to_hex(), retrievedAssetName.to_hex());

      // AssetNames conversions
      const assetNamesBytes = assetNames.to_bytes();
      const assetNamesFromBytes = AssetNames.from_bytes(assetNamesBytes);
      validate(results, "AssetNames from bytes length", 3, assetNamesFromBytes.len());

      const assetNamesHex = assetNames.to_hex();
      const assetNamesFromHex = AssetNames.from_hex(assetNamesHex);
      validate(results, "AssetNames from hex length", 3, assetNamesFromHex.len());

      const assetNamesJson = assetNames.to_json();
      const assetNamesFromJson = AssetNames.from_json(assetNamesJson);
      validate(results, "AssetNames from JSON length", 3, assetNamesFromJson.len());

      // Mint operations
      const mint = Mint.new();
      const mintAssets = MintAssets.new();
      const mintAssetNameStr = "MintToken";
      const mintAssetName = AssetName.new(new TextEncoder().encode(mintAssetNameStr));
      const mintAmountStr = "1000";
      const mintAmount = Int.new(BigNum.from_str(mintAmountStr));
      mintAssets.insert(mintAssetName, mintAmount);

      const mintPolicyId = ScriptHash.from_bytes(new Uint8Array(28).fill(3));
      mint.insert(mintPolicyId, mintAssets);

      validate(results, "Mint length", 1, mint.len());

      // Mint operations
      const mintKeys = mint.keys();
      validate(results, "Mint keys count", 1, mintKeys.len());

      const retrievedMintAssets = mint.get(mintPolicyId);
      validate(results, "Retrieved mint assets count", 1, retrievedMintAssets.len());

      const positiveMultiAsset = mint.as_positive_multiasset();
      validate(results, "Positive MultiAsset not null", true, positiveMultiAsset !== null);

      const negativeMultiAsset = mint.as_negative_multiasset();
      validate(results, "Negative MultiAsset not null", true, negativeMultiAsset !== null);

      // Mint conversions
      const mintBytes = mint.to_bytes();
      const mintFromBytes = Mint.from_bytes(mintBytes);
      validate(results, "Mint from bytes length", 1, mintFromBytes.len());

      const mintHex = mint.to_hex();
      const mintFromHex = Mint.from_hex(mintHex);
      validate(results, "Mint from hex length", 1, mintFromHex.len());

      const mintJson = mint.to_json();
      const mintFromJson = Mint.from_json(mintJson);
      validate(results, "Mint from JSON length", 1, mintFromJson.len());

      // MintAssets operations
      const mintAssets2 = MintAssets.new();
      const mintAssetName2Str = "MintToken2";
      const mintAssetName2 = AssetName.new(new TextEncoder().encode(mintAssetName2Str));
      const mintAmount2Val = 2000;
      const mintAmount2 = Int.new(BigNum.from_str(mintAmount2Val.toString()));
      mintAssets2.insert(mintAssetName2, mintAmount2);

      const mintAssets3 = MintAssets.new();
      const mintAssetName3Str = "MintToken3";
      const mintAssetName3 = AssetName.new(new TextEncoder().encode(mintAssetName3Str));
      const mintAmount3Val = 3000;
      const mintAmount3 = Int.new(BigNum.from_str(mintAmount3Val.toString()));
      mintAssets3.insert(mintAssetName3, mintAmount3);

      validate(results, "MintAssets2 length", 1, mintAssets2.len());

      const retrievedMintAmount = mintAssets2.get(mintAssetName2).as_i32();
      validate(results, "Retrieved mint amount", mintAmount2Val, retrievedMintAmount);

      const mintAssetsKeys = mintAssets2.keys();
      validate(results, "MintAssets keys count", 1, mintAssetsKeys.len());

      // ScriptHash operations
      const scriptHashBytes = new Uint8Array(28).fill(4);
      const scriptHash = ScriptHash.from_bytes(scriptHashBytes);
      const expectedScriptHashHex = "04040404040404040404040404040404040404040404040404040404";
      validate(results, "ScriptHash hex", expectedScriptHashHex, scriptHash.to_hex());

      const scriptHashFromBytes = ScriptHash.from_bytes(scriptHash.to_bytes());
      validate(results, "ScriptHash from bytes", expectedScriptHashHex, scriptHashFromBytes.to_hex());

      const scriptHashHex = scriptHash.to_hex();
      const scriptHashFromHex = ScriptHash.from_hex(scriptHashHex);
      validate(results, "ScriptHash from hex", scriptHashHex, scriptHashFromHex.to_hex());

      const scriptHashBech32 = scriptHash.to_bech32("script");
      const scriptHashFromBech32 = ScriptHash.from_bech32(scriptHashBech32);
      validate(results, "ScriptHash from bech32", scriptHash.to_hex(), scriptHashFromBech32.to_hex());

      // ScriptHashes operations
      const scriptHashes = ScriptHashes.new();
      scriptHashes.add(scriptHash);
      scriptHashes.add(policyId);
      scriptHashes.add(mintPolicyId);
      validate(results, "ScriptHashes length", 3, scriptHashes.len());

      const retrievedScriptHash = scriptHashes.get(0);
      validate(results, "Retrieved ScriptHash", scriptHash.to_hex(), retrievedScriptHash.to_hex());

      // ScriptHashes conversions
      const scriptHashesBytes = scriptHashes.to_bytes();
      const scriptHashesFromBytes = ScriptHashes.from_bytes(scriptHashesBytes);
      validate(results, "ScriptHashes from bytes length", 3, scriptHashesFromBytes.len());

      const scriptHashesHex = scriptHashes.to_hex();
      const scriptHashesFromHex = ScriptHashes.from_hex(scriptHashesHex);
      validate(results, "ScriptHashes from hex length", 3, scriptHashesFromHex.len());

      const scriptHashesJson = scriptHashes.to_json();
      const scriptHashesFromJson = ScriptHashes.from_json(scriptHashesJson);
      validate(results, "ScriptHashes from JSON length", 3, scriptHashesFromJson.len());

      // Complex value example
      const complexMultiAsset = MultiAsset.new();
      const complexAssets = Assets.new();

      // Add multiple assets to same policy
      const tokenAAmountStr = "100";
      const tokenBAmountStr = "200";
      const tokenCAmountStr = "300";
      complexAssets.insert(AssetName.new(new TextEncoder().encode("TokenA")), BigNum.from_str(tokenAAmountStr));
      complexAssets.insert(AssetName.new(new TextEncoder().encode("TokenB")), BigNum.from_str(tokenBAmountStr));
      complexAssets.insert(AssetName.new(new TextEncoder().encode("TokenC")), BigNum.from_str(tokenCAmountStr));

      const complexPolicyId = ScriptHash.from_bytes(new Uint8Array(28).fill(5));
      complexMultiAsset.insert(complexPolicyId, complexAssets);

      // Add second policy
      const complexAssets2 = Assets.new();
      const tokenDAmountStr = "400";
      complexAssets2.insert(AssetName.new(new TextEncoder().encode("TokenD")), BigNum.from_str(tokenDAmountStr));
      const complexPolicyId2 = ScriptHash.from_bytes(new Uint8Array(28).fill(6));
      complexMultiAsset.insert(complexPolicyId2, complexAssets2);

      const complexValueCoinStr = "5000000";
      const complexValue = Value.new_with_assets(BigNum.from_str(complexValueCoinStr), complexMultiAsset);
      validate(results, "Complex value coin", complexValueCoinStr, complexValue.coin().to_str());
      validate(results, "Complex value policies count", 2, complexMultiAsset.keys().len());

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "💰 Value & MultiAsset Examples", results };
  }
}
