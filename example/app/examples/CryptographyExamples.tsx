import React from 'react';
import {
  PrivateKey,
  PublicKey,
  ScriptHash,
  Ed25519KeyHash,
  Bip32PrivateKey,
  Bip32PublicKey,
  Ed25519Signature,
  Vkey,
  Vkeywitness,
  Vkeywitnesses,
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

      // Key conversions - with validation
      const privKeyHex = privateKey.to_hex();
      const privKeyFromHex = PrivateKey.from_hex(privKeyHex);
      validate(results, "Private key from hex round-trip", privKeyHex, privKeyFromHex.to_hex());

      const pubKeyBytes = publicKey.as_bytes();
      const pubKeyFromBytes = PublicKey.from_bytes(pubKeyBytes);
      validate(results, "Public key from bytes round-trip", publicKey.to_hex(), pubKeyFromBytes.to_hex());

      // Script hash
      const scriptHashBytes = new Uint8Array(28).fill(2);
      const scriptHash = ScriptHash.from_bytes(scriptHashBytes);
      const expectedScriptHashHex = "02020202020202020202020202020202020202020202020202020202";
      validate(results, "Script hash hex", expectedScriptHashHex, scriptHash.to_hex());

      // Extended Private Key
      const extendedPrivateKey = PrivateKey.generate_ed25519extended();
      const extendedPublicKey = extendedPrivateKey.to_public();
      results.push(`✓ Extended private key generated`);
      results.push(`✓ Extended public key: ${extendedPublicKey.to_bech32()}`);

      // Private key from bytes
      const privKeyBytes = privateKey.as_bytes();
      const privKeyFromNormalBytes = PrivateKey.from_normal_bytes(privKeyBytes);
      validate(results, "Private key from normal bytes round-trip", privateKey.to_hex(), privKeyFromNormalBytes.to_hex());

      const extendedKeyBytes = extendedPrivateKey.as_bytes();
      const extendedFromBytes = PrivateKey.from_extended_bytes(extendedKeyBytes);
      validate(results, "Extended private key from bytes round-trip", extendedPrivateKey.to_hex(), extendedFromBytes.to_hex());

      // Private key bech32
      const privKeyBech32 = privateKey.to_bech32();
      const privKeyFromBech32 = PrivateKey.from_bech32(privKeyBech32);
      validate(results, "Private key from bech32 round-trip", privKeyHex, privKeyFromBech32.to_hex());

      // Public key verification
      const message = new Uint8Array(32).fill(1);
      const signature = privateKey.sign(message);
      const isValid = publicKey.verify(message, signature);
      validate(results, "Signature verification", true, isValid);

      // Public key from bech32
      const pubKeyBech32 = publicKey.to_bech32();
      const pubKeyFromBech32 = PublicKey.from_bech32(pubKeyBech32);
      validate(results, "Public key from bech32 round-trip", publicKey.to_hex(), pubKeyFromBech32.to_hex());

      // Vkey
      const vkey = Vkey.new(publicKey);
      const vkeyPubKey = vkey.public_key();
      validate(results, "Vkey public key matches original", publicKey.to_hex(), vkeyPubKey.to_hex());

      // Vkey conversions
      const vkeyBytes = vkey.to_bytes();
      const vkeyFromBytes = Vkey.from_bytes(vkeyBytes);
      validate(results, "Vkey from bytes round-trip", vkey.to_hex(), vkeyFromBytes.to_hex());

      const vkeyHex = vkey.to_hex();
      const vkeyFromHex = Vkey.from_hex(vkeyHex);
      validate(results, "Vkey from hex round-trip", vkeyHex, vkeyFromHex.to_hex());

      // Vkeywitness
      const vkeywitness = Vkeywitness.new(vkey, signature);
      const witnessSignature = vkeywitness.signature();
      validate(results, "Vkeywitness signature matches", signature.to_hex(), witnessSignature.to_hex());

      // Vkeywitnesses
      const vkeywitnesses = Vkeywitnesses.new();
      vkeywitnesses.add(vkeywitness);
      validate(results, "Vkeywitnesses count", 1, vkeywitnesses.len());

      // Bip32PrivateKey
      const bip32PrivateKey = Bip32PrivateKey.generate_ed25519_bip32();
      const derivedKey = bip32PrivateKey.derive(0);
      derivedKey.to_raw_key();
      results.push(`✓ Bip32 private key generated`);
      results.push(`✓ Derived key at index 0: Success`);

      // Bip32PrivateKey from 128 xprv
      const xprv128 = bip32PrivateKey.to_128_xprv();
      const bip32From128 = Bip32PrivateKey.from_128_xprv(xprv128);
      validate(results, "Bip32 from 128 xprv round-trip", bip32PrivateKey.to_hex(), bip32From128.to_hex());

      // Bip32PrivateKey conversions
      const bip32Bytes = bip32PrivateKey.as_bytes();
      const bip32FromBytes = Bip32PrivateKey.from_bytes(bip32Bytes);
      validate(results, "Bip32 from bytes round-trip", bip32PrivateKey.to_hex(), bip32FromBytes.to_hex());

      const bip32Bech32 = bip32PrivateKey.to_bech32();
      const bip32FromBech32 = Bip32PrivateKey.from_bech32(bip32Bech32);
      validate(results, "Bip32 from bech32 round-trip", bip32PrivateKey.to_hex(), bip32FromBech32.to_hex());

      const bip32Hex = bip32PrivateKey.to_hex();
      const bip32FromHex = Bip32PrivateKey.from_hex(bip32Hex);
      validate(results, "Bip32 from hex round-trip", bip32Hex, bip32FromHex.to_hex());

      // Bip32PublicKey
      const bip32PubKey = bip32PrivateKey.to_public();
      const derivedPubKey = bip32PubKey.derive(0);
      derivedPubKey.to_raw_key();
      results.push(`✓ Bip32 public key derived`);

      // Bip32PublicKey conversions
      const pub32Bytes = bip32PubKey.as_bytes();
      const pub32FromBytes = Bip32PublicKey.from_bytes(pub32Bytes);
      validate(results, "Bip32 public key from bytes round-trip", bip32PubKey.to_hex(), pub32FromBytes.to_hex());

      const pub32Bech32 = bip32PubKey.to_bech32();
      const pub32FromBech32 = Bip32PublicKey.from_bech32(pub32Bech32);
      validate(results, "Bip32 public key from bech32 round-trip", bip32PubKey.to_hex(), pub32FromBech32.to_hex());

      const pub32Hex = bip32PubKey.to_hex();
      const pub32FromHex = Bip32PublicKey.from_hex(pub32Hex);
      validate(results, "Bip32 public key from hex round-trip", pub32Hex, pub32FromHex.to_hex());

      // Ed25519Signature
      const sigBytes = signature.to_bytes();
      const sigFromBytes = Ed25519Signature.from_bytes(sigBytes);
      validate(results, "Ed25519Signature from bytes round-trip", signature.to_hex(), sigFromBytes.to_hex());

      const sigHex = signature.to_hex();
      const sigFromHex = Ed25519Signature.from_hex(sigHex);
      validate(results, "Ed25519Signature from hex round-trip", sigHex, sigFromHex.to_hex());

      const sigBech32 = signature.to_bech32();
      const sigFromBech32 = Ed25519Signature.from_bech32(sigBech32);
      validate(results, "Ed25519Signature from bech32 round-trip", signature.to_hex(), sigFromBech32.to_hex());

      // Ed25519KeyHash conversions
      const keyHashBytes = keyHash.to_bytes();
      const keyHashFromBytes = Ed25519KeyHash.from_bytes(keyHashBytes);
      validate(results, "Ed25519KeyHash from bytes round-trip", keyHash.to_hex(), keyHashFromBytes.to_hex());

      const keyHashHex = keyHash.to_hex();
      const keyHashFromHex = Ed25519KeyHash.from_hex(keyHashHex);
      validate(results, "Ed25519KeyHash from hex round-trip", keyHashHex, keyHashFromHex.to_hex());

      const keyHashBech32 = keyHash.to_bech32("key");
      const keyHashFromBech32 = Ed25519KeyHash.from_bech32(keyHashBech32);
      validate(results, "Ed25519KeyHash from bech32 round-trip", keyHash.to_hex(), keyHashFromBech32.to_hex());
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "🔐 Cryptography Examples", results };
  }
}
