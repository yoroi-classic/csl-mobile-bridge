import React from 'react';
import { TransactionBody } from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class TransactionBodyExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Create TransactionBody from hex
      const txBody = TransactionBody.from_hex('a4008282582005ec4a4a7f4645fa66886cef2e34706907a3a7f9d88e0d48b313ad2cdf76fb5f008258206930f123df83e4178b0324ae617b2028c0b38c6ff4660583a2abf1f7b08195fe00018182582b82d818582183581ce3a1faa5b54bd1485a424d8f9b5e75296b328a2a624ef1d2f4c7b480a0001a88e5cdab1913890219042803191c20');
      results.push(`✓ TransactionBody from hex created`);
      results.push(`✓ Number of inputs: ${(txBody.inputs()).len()}`);
      results.push(`✓ Transaction fee: ${(txBody.fee()).to_str()}`);

      // Create TransactionBody from bytes
      const txBodyBytes = txBody.to_bytes();
      const txBodyFromBytes = TransactionBody.from_bytes(txBodyBytes);
      results.push(`✓ TransactionBody from bytes created`);
      results.push(`✓ Number of outputs: ${(txBodyFromBytes.outputs()).len()}`);
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "📄 TransactionBody Examples", results };
  }
}
