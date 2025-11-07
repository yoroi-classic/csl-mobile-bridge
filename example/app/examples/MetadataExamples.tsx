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
  Assets,
  MultiAsset,
  ScriptHash
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class MetadataExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Create metadata
      const metadata = GeneralTransactionMetadata.new();
      
      // Add text metadata
      const textMetadatum = TransactionMetadatum.new_text("Hello, Cardano!");
      metadata.insert(BigNum.from_str("1"), textMetadatum);
      results.push(`✓ Added text metadata`);

      // Add map metadata
      const map = MetadataMap.new();
      map.insert_str("name", TransactionMetadatum.new_text("CSL Mobile Bridge"));
      map.insert_str("version", TransactionMetadatum.new_text("1.0.0"));
      const mapMetadatum = TransactionMetadatum.new_map(map);
      metadata.insert(BigNum.from_str("3"), mapMetadatum);
      results.push(`✓ Added map metadata`);

      // Add list metadata
      const list = MetadataList.new();
      list.add(TransactionMetadatum.new_text("item1"));
      list.add(TransactionMetadatum.new_text("item2"));
      const listMetadatum = TransactionMetadatum.new_list(list);
      metadata.insert(BigNum.from_str("4"), listMetadatum);
      results.push(`✓ Added list metadata`);

      results.push(`✓ Total metadata entries: ${metadata.len()}`);

      // Metadata conversions
      const metadataJson = metadata.to_json();
      results.push(`✓ Metadata JSON length: ${metadataJson.length} characters`);

      const metadataFromJson = GeneralTransactionMetadata.from_json(metadataJson);
      results.push(`✓ Metadata from JSON: Success`);

      // Plutus Data
      const plutusData = PlutusData.new_empty_constr_plutus_data(BigNum.from_str("123"));
      results.push(`✓ Plutus data integer created`);

      const plutusBytes = plutusData.to_bytes();
      const plutusFromBytes = PlutusData.from_bytes(plutusBytes);
      results.push(`✓ Plutus data from bytes: Success`);

      // Additional Plutus Data types
      const intData = PlutusData.new_integer(BigInt.from_str("42"));
      results.push(`✓ Plutus integer data created`);
      results.push(`✓ Integer data kind: ${intData.kind()}`);

      const bytesData = PlutusData.new_bytes(new Uint8Array([1, 2, 3, 4]));
      results.push(`✓ Plutus bytes data created`);
      results.push(`✓ Bytes data kind: ${bytesData.kind()}`);

      const listData = PlutusList.new();
      listData.add(intData);
      listData.add(bytesData);
      const plutusListData = PlutusData.new_list(listData);
      results.push(`✓ Plutus list data created`);
      results.push(`✓ List data kind: ${plutusListData.kind()}`);

      const mapData = PlutusMap.new();
      mapData.insert(intData, PlutusMapValues.new());
      const plutusMapData = PlutusData.new_map(mapData);
      results.push(`✓ Plutus map data created`);
      results.push(`✓ Map data kind: ${plutusMapData.kind()}`);

      const constrData = ConstrPlutusData.new(BigNum.from_str("0"), listData);
      const plutusConstrData = PlutusData.new_constr_plutus_data(constrData);
      results.push(`✓ Plutus constructor data created`);
      results.push(`✓ Constructor data kind: ${plutusConstrData.kind()}`);

      // Plutus Data conversions
      const plutusHex = plutusData.to_hex();
      const plutusFromHex = PlutusData.from_hex(plutusHex);
      results.push(`✓ Plutus data from hex: Success`);

      const plutusJson = plutusData.to_json(1); // Schema 1
      results.push(`✓ Plutus data JSON: ${plutusJson.substring(0, 50)}...`);

      const plutusFromJson = PlutusData.from_json(plutusJson, 1);
      results.push(`✓ Plutus data from JSON: Success`);

      // Metadata operations
      const metadataKey = BigNum.from_str("5");
      const existingValue = metadata.get(metadataKey);
      results.push(`✓ Get metadata value: ${existingValue ? "found" : "not found"}`);

      const metadataKeys = metadata.keys();
      results.push(`✓ Metadata keys count: ${metadataKeys.len()}`);

      // MetadataMap operations
      const intMetadatum = TransactionMetadatum.new_int(Int.new(BigNum.from_str("123")));
      map.insert(TransactionMetadatum.new_int(Int.new_i32(10)), intMetadatum);
      results.push(`✓ Added integer metadatum`);

      const bytesMetadatum = TransactionMetadatum.new_bytes(new Uint8Array([5, 6, 7, 8]));
      map.insert(TransactionMetadatum.new_int(Int.new_i32(11)), bytesMetadatum);
      results.push(`✓ Added bytes metadatum`);

      const mapValue = map.get(TransactionMetadatum.new_text("name"));
      results.push(`✓ Map value lookup: ${mapValue ? "found" : "not found"}`);

      const mapHasKey = map.has(TransactionMetadatum.new_text("name"));
      results.push(`✓ Map has key: ${mapHasKey}`);

      const mapKeys = map.keys();
      results.push(`✓ Map keys count: ${mapKeys.len()}`);

      // MetadataList operations
      list.add(intMetadatum);
      list.add(bytesMetadatum);
      results.push(`✓ Added items to metadata list`);
      results.push(`✓ List length: ${list.len()}`);

      const listItem = list.get(0);
      results.push(`✓ List item kind: ${listItem.kind()}`);

      // TransactionMetadatum operations
      const textValue = textMetadatum.as_text();
      results.push(`✓ Text metadatum value: ${textValue}`);

      const intValue = intMetadatum.as_int();
      results.push(`✓ Integer metadatum value: ${intValue}`);

      const bytesValue = bytesMetadatum.as_bytes();
      results.push(`✓ Bytes metadatum length: ${bytesValue.length}`);

      const mapValue2 = mapMetadatum.as_map();
      results.push(`✓ Map metadatum length: ${mapValue2.len()}`);

      const listValue2 = listMetadatum.as_list();
      results.push(`✓ List metadatum length: ${listValue2.len()}`);

      // TransactionMetadatumLabels
      const labels = TransactionMetadatumLabels.new();
      labels.add(BigNum.from_str("1"));
      labels.add(BigNum.from_str("2"));
      results.push(`✓ Metadata labels created`);
      results.push(`✓ Labels count: ${labels.len()}`);

      const label = labels.get(0);
      results.push(`✓ Label value: ${label.to_str()}`);

      // Auxiliary Data
      const auxData = AuxiliaryData.new();
      auxData.set_metadata(metadata);
      results.push(`✓ Auxiliary data created`);
      results.push(`✓ Auxiliary data metadata present: ${auxData.metadata() !== null}`);

      const nativeScripts = NativeScripts.new();
      auxData.set_native_scripts(nativeScripts);
      results.push(`✓ Set native scripts in auxiliary data`);
      results.push(`✓ Native scripts present: ${auxData.native_scripts() !== null}`);

      const plutusScripts = PlutusScripts.new();
      auxData.set_plutus_scripts(plutusScripts);
      results.push(`✓ Set plutus scripts in auxiliary data`);
      results.push(`✓ Plutus scripts present: ${auxData.plutus_scripts() !== null}`);

      auxData.set_prefer_alonzo_format(true);
      results.push(`✓ Prefer alonzo format: ${auxData.prefer_alonzo_format()}`);

      // Auxiliary Data conversions
      const auxDataBytes = auxData.to_bytes();
      const auxDataFromBytes = AuxiliaryData.from_bytes(auxDataBytes);
      results.push(`✓ Auxiliary data from bytes: Success`);

      const auxDataHex = auxData.to_hex();
      const auxDataFromHex = AuxiliaryData.from_hex(auxDataHex);
      results.push(`✓ Auxiliary data from hex: Success`);

      const auxDataJson = auxData.to_json();
      const auxDataFromJson = AuxiliaryData.from_json(auxDataJson);
      results.push(`✓ Auxiliary data from JSON: Success`);

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
      
      results.push(`✓ Complex metadata structure created`);
      results.push(`✓ Complex metadata entries: ${complexMetadata.len()}`);

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
      
      results.push(`✓ Asset metadata created`);
      results.push(`✓ Asset metadata entries: ${assetMetadata.len()}`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "📝 Metadata Examples", results };
  }
}
