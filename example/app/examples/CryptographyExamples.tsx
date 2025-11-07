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
  LegacyDaedalusPrivateKey,
  KESSignature,
  KESVKey,
  VRFVKey,
  VRFKeyHash,
  VRFCert,
  BootstrapWitness,
  BootstrapWitnesses
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
      PrivateKey.from_hex(privKeyHex);
      results.push(`✓ Private key from hex: Success`);

      const pubKeyBytes = publicKey.as_bytes();
      PublicKey.from_bytes(pubKeyBytes);
      results.push(`✓ Public key from bytes: Success`);

      // Script hash
      const scriptHash = ScriptHash.from_bytes(new Uint8Array(28).fill(2));
      results.push(`✓ Script hash: ${scriptHash.to_bech32("script")}`);

      // Extended Private Key
      const extendedPrivateKey = PrivateKey.generate_ed25519extended();
      const extendedPublicKey = extendedPrivateKey.to_public();
      results.push(`✓ Extended private key generated`);
      results.push(`✓ Extended public key: ${extendedPublicKey.to_bech32()}`);

      // Private key from bytes
      const privKeyBytes = privateKey.as_bytes();
      PrivateKey.from_normal_bytes(privKeyBytes);
      results.push(`✓ Private key from normal bytes: Success`);

      const extendedKeyBytes = extendedPrivateKey.as_bytes();
      PrivateKey.from_extended_bytes(extendedKeyBytes);
      results.push(`✓ Extended private key from bytes: Success`);

      // Private key bech32
      const privKeyBech32 = privateKey.to_bech32();
      PrivateKey.from_bech32(privKeyBech32);
      results.push(`✓ Private key from bech32: Success`);

      // Public key verification
      const message = new Uint8Array(32).fill(1);
      const signature = privateKey.sign(message);
      const isValid = publicKey.verify(message, signature);
      results.push(`✓ Signature verification: ${isValid}`);

      // Public key from bech32
      const pubKeyBech32 = publicKey.to_bech32();
      PublicKey.from_bech32(pubKeyBech32);
      results.push(`✓ Public key from bech32: Success`);

      // Vkey
      const vkey = Vkey.new(publicKey);
      const vkeyPubKey = vkey.public_key();
      results.push(`✓ Vkey created`);
      results.push(`✓ Vkey public key hash: ${vkeyPubKey.hash().to_bech32("vkey")}`);

      // Vkey conversions
      const vkeyBytes = vkey.to_bytes();
      Vkey.from_bytes(vkeyBytes);
      results.push(`✓ Vkey from bytes: Success`);

      const vkeyHex = vkey.to_hex();
      Vkey.from_hex(vkeyHex);
      results.push(`✓ Vkey from hex: Success`);

      // Vkeywitness
      const vkeywitness = Vkeywitness.new(vkey, signature);
      results.push(`✓ Vkeywitness created`);
      results.push(`✓ Vkeywitness signature hex: ${vkeywitness.signature().to_hex()}`);

      // Vkeywitnesses
      const vkeywitnesses = Vkeywitnesses.new();
      vkeywitnesses.add(vkeywitness);
      results.push(`✓ Vkeywitnesses created`);
      results.push(`✓ Vkeywitnesses count: ${vkeywitnesses.len()}`);

      // Bip32PrivateKey
      const bip32PrivateKey = Bip32PrivateKey.generate_ed25519_bip32();
      const derivedKey = bip32PrivateKey.derive(0);
      derivedKey.to_raw_key();
      results.push(`✓ Bip32 private key generated`);
      results.push(`✓ Derived key at index 0: Success`);

      // Bip32PrivateKey from 128 xprv
      Bip32PrivateKey.from_128_xprv(bip32PrivateKey.to_128_xprv());
      results.push(`✓ Bip32 from 128 xprv: Success`);

      // Bip32PrivateKey conversions
      const bip32Bytes = bip32PrivateKey.as_bytes();
      Bip32PrivateKey.from_bytes(bip32Bytes);
      results.push(`✓ Bip32 from bytes: Success`);

      const bip32Bech32 = bip32PrivateKey.to_bech32();
      Bip32PrivateKey.from_bech32(bip32Bech32);
      results.push(`✓ Bip32 from bech32: Success`);

      const bip32Hex = bip32PrivateKey.to_hex();
      Bip32PrivateKey.from_hex(bip32Hex);
      results.push(`✓ Bip32 from hex: Success`);

      // Bip32PublicKey
      const bip32PubKey = bip32PrivateKey.to_public();
      const derivedPubKey = bip32PubKey.derive(0);
      derivedPubKey.to_raw_key();
      results.push(`✓ Bip32 public key derived`);

      // Bip32PublicKey conversions
      const pub32Bytes = bip32PubKey.as_bytes();
      Bip32PublicKey.from_bytes(pub32Bytes);
      results.push(`✓ Bip32 public key from bytes: Success`);

      const pub32Bech32 = bip32PubKey.to_bech32();
      Bip32PublicKey.from_bech32(pub32Bech32);
      results.push(`✓ Bip32 public key from bech32: Success`);

      const pub32Hex = bip32PubKey.to_hex();
      Bip32PublicKey.from_hex(pub32Hex);
      results.push(`✓ Bip32 public key from hex: Success`);

      // Ed25519Signature
      const sigBytes = signature.to_bytes();
      Ed25519Signature.from_bytes(sigBytes);
      results.push(`✓ Ed25519Signature from bytes: Success`);

      const sigHex = signature.to_hex();
      Ed25519Signature.from_hex(sigHex);
      results.push(`✓ Ed25519Signature from hex: Success`);

      const sigBech32 = signature.to_bech32();
      Ed25519Signature.from_bech32(sigBech32);
      results.push(`✓ Ed25519Signature from bech32: Success`);

      // Ed25519KeyHash conversions
      const keyHashBytes = keyHash.to_bytes();
      Ed25519KeyHash.from_bytes(keyHashBytes);
      results.push(`✓ Ed25519KeyHash from bytes: Success`);

      const keyHashHex = keyHash.to_hex();
      Ed25519KeyHash.from_hex(keyHashHex);
      results.push(`✓ Ed25519KeyHash from hex: Success`);

      const keyHashBech32 = keyHash.to_bech32("key");
      Ed25519KeyHash.from_bech32(keyHashBech32);
      results.push(`✓ Ed25519KeyHash from bech32: Success`);
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "🔐 Cryptography Examples", results };
  }
}
