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

      // Additional Value operations
      const diff = valueWithAssets.checked_sub(adaValue);
      results.push(`✓ Value subtraction: ${diff.coin().to_str()} lovelace`);

      const clampedDiff = valueWithAssets.clamped_sub(adaValue);
      results.push(`✓ Value clamped subtraction: ${clampedDiff.coin().to_str()} lovelace`);

      const compareResult = adaValue.compare(value2);
      results.push(`✓ Value comparison: ${compareResult}`);

      // Value with MultiAsset only
      const multiAssetOnly = Value.new_from_assets(multiAsset);
      results.push(`✓ Value from MultiAsset only: ${multiAssetOnly.coin().to_str()} lovelace + assets`);

      // Value operations with MultiAsset
      const valueWithMoreAssets = Value.new_with_assets(BigNum.from_str("2000000"), multiAsset);
      results.push(`✓ Value with more assets: ${valueWithMoreAssets.coin().to_str()} lovelace + assets`);

      // Set and get MultiAsset
      const emptyValue = Value.new(BigNum.from_str("500000"));
      emptyValue.set_multiasset(multiAsset);
      results.push(`✓ Set MultiAsset on value`);
      results.push(`✓ Has MultiAsset: ${emptyValue.multiasset() !== null}`);

      // Set and get coin
      emptyValue.set_coin(BigNum.from_str("750000"));
      results.push(`✓ Set coin: ${emptyValue.coin().to_str()} lovelace`);

      // Value JSON conversion
      const valueJson = valueWithAssets.to_json();
      const valueFromJson = Value.from_json(valueJson);
      results.push(`✓ Value from JSON: Success`);
      results.push(`✓ Value JSON length: ${valueJson.length} characters`);

      // Value hex conversion
      const valueHex = valueWithAssets.to_hex();
      const valueFromHex = Value.from_hex(valueHex);
      results.push(`✓ Value from hex: Success`);
      results.push(`✓ Value hex length: ${valueHex.length} characters`);

      // MultiAsset operations
      const multiAsset2 = MultiAsset.new();
      const assets2 = Assets.new();
      const assetName2 = AssetName.new(new TextEncoder().encode("SecondToken"));
      const assetAmount2 = BigNum.from_str("200");
      assets2.insert(assetName2, assetAmount2);

      const policyId2 = ScriptHash.from_bytes(new Uint8Array(28).fill(2));
      multiAsset2.insert(policyId2, assets2);

      const multiAssetKeys = multiAsset.keys();
      results.push(`✓ MultiAsset keys count: ${multiAssetKeys.len()}`);

      const retrievedAssets = multiAsset.get(policyId);
      results.push(`✓ Retrieved assets: ${retrievedAssets.len()} items`);

      // Set asset in MultiAsset
      multiAsset.set_asset(policyId, assetName, BigNum.from_str("150"));
      results.push(`✓ Set asset in MultiAsset`);

      const getAsset = multiAsset.get_asset(policyId, assetName);
      results.push(`✓ Get asset amount: ${getAsset.to_str()}`);

      // MultiAsset conversions
      const multiAssetBytes = multiAsset.to_bytes();
      const multiAssetFromBytes = MultiAsset.from_bytes(multiAssetBytes);
      results.push(`✓ MultiAsset from bytes: Success`);

      const multiAssetHex = multiAsset.to_hex();
      const multiAssetFromHex = MultiAsset.from_hex(multiAssetHex);
      results.push(`✓ MultiAsset from hex: Success`);

      const multiAssetJson = multiAsset.to_json();
      const multiAssetFromJson = MultiAsset.from_json(multiAssetJson);
      results.push(`✓ MultiAsset from JSON: Success`);

      // Assets operations
      const assets3 = Assets.new();
      const assetName3 = AssetName.new(new TextEncoder().encode("ThirdToken"));
      const assetAmount3 = BigNum.from_str("300");
      assets3.insert(assetName3, assetAmount3);

      const assets4 = Assets.new();
      const assetName4 = AssetName.new(new TextEncoder().encode("FourthToken"));
      const assetAmount4 = BigNum.from_str("400");
      assets4.insert(assetName4, assetAmount4);

      const assetsLen = assets3.len();
      results.push(`✓ Assets length: ${assetsLen}`);

      const retrievedAsset = assets3.get(assetName3);
      results.push(`✓ Retrieved asset amount: ${retrievedAsset.to_str()}`);

      // Assets conversions
      const assetsBytes = assets3.to_bytes();
      const assetsFromBytes = Assets.from_bytes(assetsBytes);
      results.push(`✓ Assets from bytes: Success`);

      const assetsHex = assets3.to_hex();
      const assetsFromHex = Assets.from_hex(assetsHex);
      results.push(`✓ Assets from hex: Success`);

      const assetsJson = assets3.to_json();
      const assetsFromJson = Assets.from_json(assetsJson);
      results.push(`✓ Assets from JSON: Success`);

      // AssetName operations
      const assetName5 = AssetName.new(new TextEncoder().encode("FifthToken"));
      results.push(`✓ AssetName created`);
      results.push(`✓ AssetName hex: ${assetName5.to_hex()}`);

      const assetNameBytes = assetName5.to_bytes();
      const assetNameFromBytes = AssetName.from_bytes(assetNameBytes);
      results.push(`✓ AssetName from bytes: Success`);

      const assetNameHex = assetName5.to_hex();
      const assetNameFromHex = AssetName.from_hex(assetNameHex);
      results.push(`✓ AssetName from hex: Success`);

      const assetNameJson = assetName5.to_json();
      const assetNameFromJson = AssetName.from_json(assetNameJson);
      results.push(`✓ AssetName from JSON: Success`);

      const assetNameData = assetName5.name();
      results.push(`✓ AssetName data length: ${assetNameData.length}`);

      // AssetNames operations
      const assetNames = AssetNames.new();
      assetNames.add(assetName);
      assetNames.add(assetName2);
      assetNames.add(assetName3);
      results.push(`✓ AssetNames created`);
      results.push(`✓ AssetNames length: ${assetNames.len()}`);

      const retrievedAssetName = assetNames.get(0);
      results.push(`✓ Retrieved AssetName: ${retrievedAssetName.to_hex()}`);

      // AssetNames conversions
      const assetNamesBytes = assetNames.to_bytes();
      const assetNamesFromBytes = AssetNames.from_bytes(assetNamesBytes);
      results.push(`✓ AssetNames from bytes: Success`);

      const assetNamesHex = assetNames.to_hex();
      const assetNamesFromHex = AssetNames.from_hex(assetNamesHex);
      results.push(`✓ AssetNames from hex: Success`);

      const assetNamesJson = assetNames.to_json();
      const assetNamesFromJson = AssetNames.from_json(assetNamesJson);
      results.push(`✓ AssetNames from JSON: Success`);

      // Mint operations
      const mint = Mint.new();
      const mintAssets = MintAssets.new();
      const mintAssetName = AssetName.new(new TextEncoder().encode("MintToken"));
      const mintAmount = Int.new(BigNum.from_str("1000"));
      mintAssets.insert(mintAssetName, mintAmount);

      const mintPolicyId = ScriptHash.from_bytes(new Uint8Array(28).fill(3));
      mint.insert(mintPolicyId, mintAssets);

      results.push(`✓ Mint created`);
      results.push(`✓ Mint length: ${mint.len()}`);

      // Mint operations
      const mintKeys = mint.keys();
      results.push(`✓ Mint keys count: ${mintKeys.len()}`);

      const retrievedMintAssets = mint.get(mintPolicyId);
      results.push(`✓ Retrieved mint assets: ${retrievedMintAssets.len()} items`);

      const positiveMultiAsset = mint.as_positive_multiasset();
      results.push(`✓ Positive MultiAsset: ${positiveMultiAsset !== null}`);

      const negativeMultiAsset = mint.as_negative_multiasset();
      results.push(`✓ Negative MultiAsset: ${negativeMultiAsset !== null}`);

      // Mint conversions
      const mintBytes = mint.to_bytes();
      const mintFromBytes = Mint.from_bytes(mintBytes);
      results.push(`✓ Mint from bytes: Success`);

      const mintHex = mint.to_hex();
      const mintFromHex = Mint.from_hex(mintHex);
      results.push(`✓ Mint from hex: Success`);

      const mintJson = mint.to_json();
      const mintFromJson = Mint.from_json(mintJson);
      results.push(`✓ Mint from JSON: Success`);

      // MintAssets operations
      const mintAssets2 = MintAssets.new();
      const mintAssetName2 = AssetName.new(new TextEncoder().encode("MintToken2"));
      const mintAmount2 = Int.new(BigNum.from_str("2000"));
      mintAssets2.insert(mintAssetName2, mintAmount2);

      const mintAssets3 = MintAssets.new();
      const mintAssetName3 = AssetName.new(new TextEncoder().encode("MintToken3"));
      const mintAmount3 = Int.new(BigNum.from_str("3000"));
      mintAssets3.insert(mintAssetName3, mintAmount3);

      const mintAssetsLen = mintAssets2.len();
      results.push(`✓ MintAssets length: ${mintAssetsLen}`);

      const retrievedMintAmount = mintAssets2.get(mintAssetName2);
      results.push(`✓ Retrieved mint amount: ${retrievedMintAmount}`);

      const mintAssetsKeys = mintAssets2.keys();
      results.push(`✓ MintAssets keys count: ${mintAssetsKeys.len()}`);

      // ScriptHash operations
      const scriptHash = ScriptHash.from_bytes(new Uint8Array(28).fill(4));
      results.push(`✓ ScriptHash created`);
      results.push(`✓ ScriptHash hex: ${scriptHash.to_hex()}`);

      const scriptHashBytes = scriptHash.to_bytes();
      const scriptHashFromBytes = ScriptHash.from_bytes(scriptHashBytes);
      results.push(`✓ ScriptHash from bytes: Success`);

      const scriptHashHex = scriptHash.to_hex();
      const scriptHashFromHex = ScriptHash.from_hex(scriptHashHex);
      results.push(`✓ ScriptHash from hex: Success`);

      const scriptHashBech32 = scriptHash.to_bech32("script");
      const scriptHashFromBech32 = ScriptHash.from_bech32(scriptHashBech32);
      results.push(`✓ ScriptHash from bech32: Success`);

      // ScriptHashes operations
      const scriptHashes = ScriptHashes.new();
      scriptHashes.add(scriptHash);
      scriptHashes.add(policyId);
      scriptHashes.add(mintPolicyId);
      results.push(`✓ ScriptHashes created`);
      results.push(`✓ ScriptHashes length: ${scriptHashes.len()}`);

      const retrievedScriptHash = scriptHashes.get(0);
      results.push(`✓ Retrieved ScriptHash: ${retrievedScriptHash.to_hex()}`);

      // ScriptHashes conversions
      const scriptHashesBytes = scriptHashes.to_bytes();
      const scriptHashesFromBytes = ScriptHashes.from_bytes(scriptHashesBytes);
      results.push(`✓ ScriptHashes from bytes: Success`);

      const scriptHashesHex = scriptHashes.to_hex();
      const scriptHashesFromHex = ScriptHashes.from_hex(scriptHashesHex);
      results.push(`✓ ScriptHashes from hex: Success`);

      const scriptHashesJson = scriptHashes.to_json();
      const scriptHashesFromJson = ScriptHashes.from_json(scriptHashesJson);
      results.push(`✓ ScriptHashes from JSON: Success`);

      // Complex value example
      const complexMultiAsset = MultiAsset.new();
      const complexAssets = Assets.new();
      
      // Add multiple assets to same policy
      complexAssets.insert(AssetName.new(new TextEncoder().encode("TokenA")), BigNum.from_str("100"));
      complexAssets.insert(AssetName.new(new TextEncoder().encode("TokenB")), BigNum.from_str("200"));
      complexAssets.insert(AssetName.new(new TextEncoder().encode("TokenC")), BigNum.from_str("300"));
      
      const complexPolicyId = ScriptHash.from_bytes(new Uint8Array(28).fill(5));
      complexMultiAsset.insert(complexPolicyId, complexAssets);
      
      // Add second policy
      const complexAssets2 = Assets.new();
      complexAssets2.insert(AssetName.new(new TextEncoder().encode("TokenD")), BigNum.from_str("400"));
      const complexPolicyId2 = ScriptHash.from_bytes(new Uint8Array(28).fill(6));
      complexMultiAsset.insert(complexPolicyId2, complexAssets2);
      
      const complexValue = Value.new_with_assets(BigNum.from_str("5000000"), complexMultiAsset);
      results.push(`✓ Complex value created`);
      results.push(`✓ Complex value coin: ${complexValue.coin().to_str()} lovelace`);
      results.push(`✓ Complex value policies: ${complexMultiAsset.keys().len()}`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "💰 Value & MultiAsset Examples", results };
  }
}
