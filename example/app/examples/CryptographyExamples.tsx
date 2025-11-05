import React from 'react';
import { 
  PrivateKey,
  PublicKey,
  ScriptHash,
  Ed25519KeyHash
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class CryptographyExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Key generation
      const privateKey = PrivateKey.generate_ed25519();
      const publicKey = privateKey.to_public();
      results.push(`✓ Private key generated`);
      results.push(`✓ Public key: ${publicKey.to_bech32()}`);

      // Key hash
      const keyHash = publicKey.hash();
      results.push(`✓ Key hash: ${keyHash.to_bech32("addr_vkh")}`);

      // Key conversions
      const privKeyHex = privateKey.to_hex();
      const privKeyFromHex = PrivateKey.from_hex(privKeyHex);
      results.push(`✓ Private key from hex: Success`);

      const pubKeyBytes = publicKey.as_bytes();
      const pubKeyFromBytes = PublicKey.from_bytes(pubKeyBytes);
      results.push(`✓ Public key from bytes: Success`);

      // Script hash
      const scriptHash = ScriptHash.from_bytes(new Uint8Array(28).fill(2));
      results.push(`✓ Script hash: ${scriptHash.to_bech32("script")}`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "🔐 Cryptography Examples", results };
  }
}
