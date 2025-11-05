import React from 'react';
import { 
  Transaction,
  TransactionBody,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  TransactionOutput,
  TransactionInput,
  TransactionHash,
  Value,
  BaseAddress,
  Credential,
  PrivateKey,
  LinearFee,
  BigNum
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class TransactionExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Create transaction builder config
      const linearFee = LinearFee.new(BigNum.from_str("44"), BigNum.from_str("155381"));
      const configBuilder = TransactionBuilderConfigBuilder.new();
      configBuilder.fee_algo(linearFee);
      configBuilder.coins_per_utxo_byte(BigNum.from_str("44"));
      const config = configBuilder.build();

      // Create transaction builder
      const txBuilder = TransactionBuilder.new(config);

      // Create inputs and outputs
      const txHash = TransactionHash.from_bytes(new Uint8Array(32).fill(0));
      const txInput = TransactionInput.new(txHash, 0);
      
      const privateKey = PrivateKey.generate_ed25519();
      const publicKey = privateKey.to_public();
      const keyHash = publicKey.hash();
      const paymentCredential = Credential.from_keyhash(keyHash);
      const baseAddress = BaseAddress.new(0, paymentCredential, paymentCredential);
      const address = baseAddress.to_address();

      const value = Value.new(BigNum.from_str("1000000"));
      const txOutput = TransactionOutput.new(address, value);

      // Add input and output
      txBuilder.add_regular_input(address, txInput, value);
      txBuilder.add_output(txOutput);

      // Build transaction
      const txBody = txBuilder.build();
      const tx = Transaction.new(txBody, txBuilder.build_tx().witness_set());

      results.push(`✓ Transaction built successfully`);
      results.push(`✓ Transaction hash: ${txBody.to_json()}`);
      results.push(`✓ Transaction inputs: ${txBody.inputs().len()}`);
      results.push(`✓ Transaction outputs: ${txBody.outputs().len()}`);
      results.push(`✓ Transaction fee: ${txBody.fee().to_str()} lovelace`);

      // Transaction serialization
      const txBytes = tx.to_bytes();
      results.push(`✓ Transaction size: ${txBytes.length} bytes`);

      const txHex = tx.to_hex();
      results.push(`✓ Transaction hex length: ${txHex.length} characters`);

      const txFromHex = Transaction.from_hex(txHex);
      results.push(`✓ Transaction from hex: Success`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "📋 Transaction Examples", results };
  }
}
