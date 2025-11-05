import React from 'react';
import { 
  PlutusData,
  MetadataMap,
  GeneralTransactionMetadata,
  TransactionMetadatum,
  MetadataList,
  BigNum
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

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "📝 Metadata Examples", results };
  }
}
