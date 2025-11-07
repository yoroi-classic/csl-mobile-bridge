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
      const privKeyFromHex = PrivateKey.from_hex(privKeyHex);
      results.push(`✓ Private key from hex: Success`);

      const pubKeyBytes = publicKey.as_bytes();
      const pubKeyFromBytes = PublicKey.from_bytes(pubKeyBytes);
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
      const privKeyFromBytes = PrivateKey.from_normal_bytes(privKeyBytes);
      results.push(`✓ Private key from normal bytes: Success`);

      const extendedKeyBytes = extendedPrivateKey.as_bytes();
      const extPrivKeyFromBytes = PrivateKey.from_extended_bytes(extendedKeyBytes);
      results.push(`✓ Extended private key from bytes: Success`);

      // Private key bech32
      const privKeyBech32 = privateKey.to_bech32();
      const privKeyFromBech32 = PrivateKey.from_bech32(privKeyBech32);
      results.push(`✓ Private key from bech32: Success`);

      // Public key verification
      const message = new Uint8Array(32).fill(1);
      const signature = privateKey.sign(message);
      const isValid = publicKey.verify(message, signature);
      results.push(`✓ Signature verification: ${isValid}`);

      // Public key from bech32
      const pubKeyBech32 = publicKey.to_bech32();
      const pubKeyFromBech32 = PublicKey.from_bech32(pubKeyBech32);
      results.push(`✓ Public key from bech32: Success`);

      // Vkey
      const vkey = Vkey.new(publicKey);
      const vkeyPubKey = vkey.public_key();
      results.push(`✓ Vkey created`);
      results.push(`✓ Vkey public key hash: ${vkeyPubKey.hash().to_bech32("vkey")}`);

      // Vkey conversions
      const vkeyBytes = vkey.to_bytes();
      const vkeyFromBytes = Vkey.from_bytes(vkeyBytes);
      results.push(`✓ Vkey from bytes: Success`);

      const vkeyHex = vkey.to_hex();
      const vkeyFromHex = Vkey.from_hex(vkeyHex);
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
      const bip32PrivKey = Bip32PrivateKey.generate_ed25519_bip32();
      const derivedKey = bip32PrivKey.derive(0);
      const rawKey = derivedKey.to_raw_key();
      results.push(`✓ Bip32 private key generated`);
      results.push(`✓ Derived key at index 0: Success`);

      // Bip32PrivateKey from 128 xprv
      const xprvBytes = new Uint8Array(128).fill(3);
      const bip32FromXprv = Bip32PrivateKey.from_128_xprv(xprvBytes);
      results.push(`✓ Bip32 from 128 xprv: Success`);

      // Bip32PrivateKey conversions
      const bip32Bytes = bip32PrivKey.as_bytes();
      const bip32FromBytes = Bip32PrivateKey.from_bytes(bip32Bytes);
      results.push(`✓ Bip32 from bytes: Success`);

      const bip32Bech32 = bip32PrivKey.to_bech32();
      const bip32FromBech32 = Bip32PrivateKey.from_bech32(bip32Bech32);
      results.push(`✓ Bip32 from bech32: Success`);

      const bip32Hex = bip32PrivKey.to_hex();
      const bip32FromHex = Bip32PrivateKey.from_hex(bip32Hex);
      results.push(`✓ Bip32 from hex: Success`);

      // Bip32PublicKey
      const bip32PubKey = bip32PrivKey.to_public();
      const derivedPubKey = bip32PubKey.derive(0);
      const rawPubKey = derivedPubKey.to_raw_key();
      results.push(`✓ Bip32 public key derived`);

      // Bip32PublicKey conversions
      const pub32Bytes = bip32PubKey.as_bytes();
      const pub32FromBytes = Bip32PublicKey.from_bytes(pub32Bytes);
      results.push(`✓ Bip32 public key from bytes: Success`);

      const pub32Bech32 = bip32PubKey.to_bech32();
      const pub32FromBech32 = Bip32PublicKey.from_bech32(pub32Bech32);
      results.push(`✓ Bip32 public key from bech32: Success`);

      const pub32Hex = bip32PubKey.to_hex();
      const pub32FromHex = Bip32PublicKey.from_hex(pub32Hex);
      results.push(`✓ Bip32 public key from hex: Success`);

      // Ed25519Signature
      const sigBytes = signature.to_bytes();
      const sigFromBytes = Ed25519Signature.from_bytes(sigBytes);
      results.push(`✓ Ed25519Signature from bytes: Success`);

      const sigHex = signature.to_hex();
      const sigFromHex = Ed25519Signature.from_hex(sigHex);
      results.push(`✓ Ed25519Signature from hex: Success`);

      const sigBech32 = signature.to_bech32();
      const sigFromBech32 = Ed25519Signature.from_bech32(sigBech32);
      results.push(`✓ Ed25519Signature from bech32: Success`);

      // Ed25519KeyHash conversions
      const keyHashBytes = keyHash.to_bytes();
      const keyHashFromBytes = Ed25519KeyHash.from_bytes(keyHashBytes);
      results.push(`✓ Ed25519KeyHash from bytes: Success`);

      const keyHashHex = keyHash.to_hex();
      const keyHashFromHex = Ed25519KeyHash.from_hex(keyHashHex);
      results.push(`✓ Ed25519KeyHash from hex: Success`);

      const keyHashBech32 = keyHash.to_bech32("key");
      const keyHashFromBech32 = Ed25519KeyHash.from_bech32(keyHashBech32);
      results.push(`✓ Ed25519KeyHash from bech32: Success`);

      // Legacy Daedalus Private Key
      const daedalusBytes = new Uint8Array(64).fill(4);
      const daedalusKey = LegacyDaedalusPrivateKey.from_bytes(daedalusBytes);
      results.push(`✓ Legacy Daedalus private key created`);
      results.push(`✓ Daedalus key bytes length: ${daedalusKey.as_bytes().length}`);

      // KES Key and Signature
      const kesBytes = new Uint8Array(32).fill(5);
      const kesVkey = KESVKey.from_bytes(kesBytes);
      results.push(`✓ KES Vkey created`);
      results.push(`✓ KES Vkey hex: ${kesVkey.to_hex()}`);

      const kesSigBytes = new Uint8Array(64).fill(6);
      const kesSignature = KESSignature.from_bytes(kesSigBytes);
      results.push(`✓ KES Signature created`);

      // VRF Key and Certificate
      const vrfBytes = new Uint8Array(32).fill(7);
      const vrfVkey = VRFVKey.from_bytes(vrfBytes);
      results.push(`✓ VRF Vkey created`);
      results.push(`✓ VRF Vkey hex: ${vrfVkey.to_hex()}`);

      const vrfHashBytes = new Uint8Array(32).fill(8);
      const vrfKeyHash = VRFKeyHash.from_bytes(vrfHashBytes);
      results.push(`✓ VRF KeyHash created`);
      results.push(`✓ VRF KeyHash hex: ${vrfKeyHash.to_hex()}`);

      const vrfOutput = new Uint8Array(32).fill(9);
      const vrfProof = new Uint8Array(64).fill(10);
      const vrfCert = VRFCert.new(vrfOutput, vrfProof);
      results.push(`✓ VRF Certificate created`);
      results.push(`✓ VRF Cert hex: ${vrfCert.to_hex()}`);

      // Bootstrap Witness
      const chainCode = new Uint8Array(32).fill(11);
      const attributes = new Uint8Array(32).fill(12);
      const bootstrapWitness = BootstrapWitness.new(vkey, signature, chainCode, attributes);
      results.push(`✓ Bootstrap witness created`);
      results.push(`✓ Bootstrap witness chain code length: ${bootstrapWitness.chain_code().length}`);

      // Bootstrap Witnesses
      const bootstrapWitnesses = BootstrapWitnesses.new();
      bootstrapWitnesses.add(bootstrapWitness);
      results.push(`✓ Bootstrap witnesses created`);
      results.push(`✓ Bootstrap witnesses count: ${bootstrapWitnesses.len()}`);

      // JSON conversions for various types
      const vkeyJson = vkey.to_json();
      const vkeyFromJson = Vkey.from_json(vkeyJson);
      results.push(`✓ Vkey JSON conversion: Success`);

      const vkeywitnessJson = vkeywitness.to_json();
      const vkeywitnessFromJson = Vkeywitness.from_json(vkeywitnessJson);
      results.push(`✓ Vkeywitness JSON conversion: Success`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "🔐 Cryptography Examples", results };
  }
}
