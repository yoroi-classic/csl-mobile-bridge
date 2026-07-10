import React from 'react';
import {
  PlutusData,
  MetadataMap,
  GeneralTransactionMetadata,
  TransactionMetadatum,
  MetadataList,
  BigInt,
  BigNum,
  ConstrPlutusData,
  PlutusList,
  PlutusMap,
  PlutusMapValues,
  Int,
  AuxiliaryData,
  NativeScripts,
  PlutusScripts,
  TransactionMetadatumLabels,
  AssetName,
  ScriptHash
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

export default class MetadataExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      // Create metadata
      const metadata = GeneralTransactionMetadata.new();

      // Add text metadata
      const textValue = "Hello, Cardano!";
      const textMetadatum = TransactionMetadatum.new_text(textValue);
      metadata.insert(BigNum.from_str("1"), textMetadatum);
      validate(results, "Text metadata value", textValue, textMetadatum.as_text());

      // Add map metadata
      const map = MetadataMap.new();
      const nameValue = "CSL Mobile Bridge";
      const versionValue = "1.0.0";
      map.insert_str("name", TransactionMetadatum.new_text(nameValue));
      map.insert_str("version", TransactionMetadatum.new_text(versionValue));
      const mapMetadatum = TransactionMetadatum.new_map(map);
      metadata.insert(BigNum.from_str("3"), mapMetadatum);
      validate(results, "Map metadata name value", nameValue, map.get(TransactionMetadatum.new_text("name")).as_text());

      // Add list metadata
      const list = MetadataList.new();
      list.add(TransactionMetadatum.new_text("item1"));
      list.add(TransactionMetadatum.new_text("item2"));
      const listMetadatum = TransactionMetadatum.new_list(list);
      metadata.insert(BigNum.from_str("4"), listMetadatum);
      validate(results, "List initial length", 2, list.len());

      validate(results, "Total metadata entries", 3, metadata.len());

      // Metadata conversions
      const metadataJson = metadata.to_json();
      const metadataFromJson = GeneralTransactionMetadata.from_json(metadataJson);
      validate(results, "Metadata from JSON entries count", metadata.len(), metadataFromJson.len());

      // Plutus Data
      const constrTag = "123";
      const plutusData = PlutusData.new_empty_constr_plutus_data(BigNum.from_str(constrTag));
      results.push(`✓ Plutus data constructor created with tag ${constrTag}`);

      const plutusBytes = plutusData.to_bytes();
      const plutusFromBytes = PlutusData.from_bytes(plutusBytes);
      validate(results, "Plutus data from bytes round-trip", plutusData.to_hex(), plutusFromBytes.to_hex());

      // Additional Plutus Data types
      const intDataValue = "42";
      const intData = PlutusData.new_integer(BigInt.from_str(intDataValue));
      validate(results, "Plutus integer data kind", 3, intData.kind()); // 3 = Integer

      const bytesDataValue = new Uint8Array([1, 2, 3, 4]);
      const bytesData = PlutusData.new_bytes(bytesDataValue);
      validate(results, "Plutus bytes data kind", 4, bytesData.kind()); // 4 = Bytes

      const listData = PlutusList.new();
      listData.add(intData);
      listData.add(bytesData);
      const plutusListData = PlutusData.new_list(listData);
      validate(results, "Plutus list data kind", 2, plutusListData.kind()); // 2 = List

      const mapData = PlutusMap.new();
      mapData.insert(intData, PlutusMapValues.new());
      const plutusMapData = PlutusData.new_map(mapData);
      validate(results, "Plutus map data kind", 1, plutusMapData.kind()); // 1 = Map

      const constrData = ConstrPlutusData.new(BigNum.from_str("0"), listData);
      const plutusConstrData = PlutusData.new_constr_plutus_data(constrData);
      validate(results, "Plutus constructor data kind", 0, plutusConstrData.kind()); // 0 = Constr

      // Plutus Data conversions
      const plutusHex = plutusData.to_hex();
      const plutusFromHex = PlutusData.from_hex(plutusHex);
      validate(results, "Plutus data from hex round-trip", plutusHex, plutusFromHex.to_hex());

      const plutusJson = plutusData.to_json(1); // Schema 1
      const plutusFromJson = PlutusData.from_json(plutusJson, 1);
      validate(results, "Plutus data from JSON round-trip", plutusData.to_hex(), plutusFromJson.to_hex());

      // Metadata operations
      const metadataKey = BigNum.from_str("5");
      const existingValue = metadata.get(metadataKey);
      validate(results, "Get non-existent metadata value", null, existingValue);

      const metadataKeys = metadata.keys();
      validate(results, "Metadata keys count", 3, metadataKeys.len());

      // MetadataMap operations
      const intMetadatumValue = 123;
      const intMetadatum = TransactionMetadatum.new_int(Int.new(BigNum.from_str(intMetadatumValue.toString())));
      map.insert(TransactionMetadatum.new_int(Int.new_i32(10)), intMetadatum);
      validate(results, "Integer metadatum value", intMetadatumValue, intMetadatum.as_int().as_i32());

      const bytesMetadatumValue = new Uint8Array([5, 6, 7, 8]);
      const bytesMetadatum = TransactionMetadatum.new_bytes(bytesMetadatumValue);
      map.insert(TransactionMetadatum.new_int(Int.new_i32(11)), bytesMetadatum);
      validate(results, "Bytes metadatum length", 4, bytesMetadatum.as_bytes().length);

      const mapValue = map.get(TransactionMetadatum.new_text("name"));
      validate(results, "Map value lookup name", nameValue, mapValue.as_text());

      const mapHasKey = map.has(TransactionMetadatum.new_text("name"));
      validate(results, "Map has key 'name'", true, mapHasKey);

      const mapKeys = map.keys();
      validate(results, "Map keys count", 4, mapKeys.len());

      // MetadataList operations
      list.add(intMetadatum);
      list.add(bytesMetadatum);
      validate(results, "List length after additions", 4, list.len());

      const listItem = list.get(0);
      validate(results, "List first item kind (text)", 4, listItem.kind()); // 4 = Text

      // TransactionMetadatum operations
      const textMetadatumValue = textMetadatum.as_text();
      validate(results, "Text metadatum as_text", textValue, textMetadatumValue);

      const intMetadatumExtracted = intMetadatum.as_int().as_i32();
      validate(results, "Integer metadatum as_int", intMetadatumValue, intMetadatumExtracted);

      const bytesMetadatumExtracted = bytesMetadatum.as_bytes();
      validate(results, "Bytes metadatum length", bytesMetadatumValue.length, bytesMetadatumExtracted.length);

      const mapValue2 = mapMetadatum.as_map();
      validate(results, "Map metadatum initial length", 2, mapValue2.len());

      const listValue2 = listMetadatum.as_list();
      validate(results, "List metadatum initial length", 2, listValue2.len());

      // TransactionMetadatumLabels
      const labels = TransactionMetadatumLabels.new();
      labels.add(BigNum.from_str("1"));
      labels.add(BigNum.from_str("2"));
      validate(results, "Labels count", 2, labels.len());

      const label = labels.get(0);
      validate(results, "First label value", "1", label.to_str());

      // Auxiliary Data
      const auxData = AuxiliaryData.new();
      auxData.set_metadata(metadata);
      validate(results, "Auxiliary data metadata present", true, auxData.metadata() !== null);

      const nativeScripts = NativeScripts.new();
      auxData.set_native_scripts(nativeScripts);
      validate(results, "Native scripts present", true, auxData.native_scripts() !== null);

      const plutusScripts = PlutusScripts.new();
      auxData.set_plutus_scripts(plutusScripts);
      validate(results, "Plutus scripts present", true, auxData.plutus_scripts() !== null);

      auxData.set_prefer_alonzo_format(true);
      validate(results, "Prefer alonzo format", true, auxData.prefer_alonzo_format());

      // Auxiliary Data conversions
      const auxDataBytes = auxData.to_bytes();
      const auxDataFromBytes = AuxiliaryData.from_bytes(auxDataBytes);
      validate(results, "Auxiliary data from bytes round-trip", auxData.to_hex(), auxDataFromBytes.to_hex());

      const auxDataHex = auxData.to_hex();
      const auxDataFromHex = AuxiliaryData.from_hex(auxDataHex);
      validate(results, "Auxiliary data from hex round-trip", auxDataHex, auxDataFromHex.to_hex());

      const auxDataJson = auxData.to_json();
      const auxDataFromJson = AuxiliaryData.from_json(auxDataJson);
      validate(results, "Auxiliary data from JSON round-trip", auxData.to_hex(), auxDataFromJson.to_hex());

      // Complex metadata example
      const complexMetadata = GeneralTransactionMetadata.new();

      // Add complex nested structure
      const complexMap = MetadataMap.new();
      complexMap.insert_str("project", TransactionMetadatum.new_text("CSL Mobile Bridge"));
      complexMap.insert_str("version", TransactionMetadatum.new_text("1.0.0"));
      complexMap.insert_str("build", TransactionMetadatum.new_int(Int.new(BigNum.from_str("123"))));

      const complexList = MetadataList.new();
      complexList.add(TransactionMetadatum.new_text("feature1"));
      complexList.add(TransactionMetadatum.new_text("feature2"));
      complexList.add(TransactionMetadatum.new_bytes(new Uint8Array([9, 10, 11, 12])));

      complexMap.insert_str("features", TransactionMetadatum.new_list(complexList));
      complexMetadata.insert(BigNum.from_str("721"), TransactionMetadatum.new_map(complexMap));

      validate(results, "Complex metadata entries", 1, complexMetadata.len());

      // Asset-related metadata
      const assetMetadata = GeneralTransactionMetadata.new();
      const assetMap = MetadataMap.new();
      assetMap.insert_str("name", TransactionMetadatum.new_text("TestToken"));
      assetMap.insert_str("description", TransactionMetadatum.new_text("A test token for CSL Mobile Bridge"));
      assetMap.insert_str("decimals", TransactionMetadatum.new_int(Int.new(BigNum.from_str("6"))));

      const policyId = ScriptHash.from_bytes(new Uint8Array(28).fill(13));
      const assetName = AssetName.new(new TextEncoder().encode("TestToken"));

      // Create a multiasset-like structure in metadata
      const policyMap = MetadataMap.new();
      policyMap.insert_str(assetName.to_hex(), TransactionMetadatum.new_map(assetMap));
      assetMetadata.insert(BigNum.from_str("721"), TransactionMetadatum.new_map(policyMap));

      validate(results, "Asset metadata entries", 1, assetMetadata.len());

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "📝 Metadata Examples", results };
  }
}
