import React from 'react';
import {
  Address,
  BaseAddress,
  EnterpriseAddress,
  RewardAddress,
  PointerAddress,
  ByronAddress,
  Credential,
  PrivateKey,
  Bip32PublicKey,
  NetworkInfo,
  Pointer
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

// Helper function to validate expected vs actual values
function validate<T>(results: string[], name: string, expected: T, actual: T): void {
  if (expected === actual) {
    results.push(`✓ ${name}: expected ${expected}, actual: ${actual}`);
  } else {
    results.push(`❌ Error: ${name}: expected ${expected}, actual: ${actual}`);
  }
}

export default class AddressExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      // Create credentials
      const privateKey = PrivateKey.generate_ed25519();
      const publicKey = privateKey.to_public();
      const keyHash = publicKey.hash();
      const paymentCredential = Credential.from_keyhash(keyHash);
      const stakeCredential = Credential.from_keyhash(keyHash);

      // Base Address
      const expectedNetworkId = 0;
      const baseAddress = BaseAddress.new(expectedNetworkId, paymentCredential, stakeCredential);
      const address = baseAddress.to_address();
      results.push(`✓ Base Address: ${address.to_bech32()}`);
      validate(results, "Address Network ID", expectedNetworkId, address.network_id());
      validate(results, "Address Kind (BaseAddress)", 0, address.kind()); // 0 = BaseAddress

      // Enterprise Address
      const enterpriseAddress = EnterpriseAddress.new(expectedNetworkId, paymentCredential);
      const enterpriseAddr = enterpriseAddress.to_address();
      results.push(`✓ Enterprise Address: ${enterpriseAddr.to_bech32()}`);
      validate(results, "Enterprise Address Network ID", expectedNetworkId, enterpriseAddr.network_id());

      // Reward Address
      const rewardAddress = RewardAddress.new(expectedNetworkId, stakeCredential);
      const rewardAddr = rewardAddress.to_address();
      results.push(`✓ Reward Address: ${rewardAddr.to_bech32()}`);
      validate(results, "Reward Address Network ID", expectedNetworkId, rewardAddr.network_id());

      // Address conversions
      const addrBytes = address.to_bytes();
      const addrFromBytes = Address.from_bytes(addrBytes);
      validate(results, "Address from bytes round-trip", address.to_bech32(), addrFromBytes.to_bech32());

      const addrHex = address.to_hex();
      const addrFromHex = Address.from_hex(addrHex);
      validate(results, "Address from hex round-trip", address.to_bech32(), addrFromHex.to_bech32());

      // Address validation
      validate(results, "Is malformed", false, address.is_malformed());

      // Address payment credential
      const paymentCred = address.payment_cred();
      validate(results, "Payment credential kind (KeyHash)", 0, paymentCred.kind()); // 0 = KeyHash
      validate(results, "Payment credential has script hash", false, paymentCred.has_script_hash());

      // Address with different prefix
      const addressWithPrefix = address.to_bech32("custom");
      validate(results, "Address with custom prefix starts with 'custom'", true, addressWithPrefix.startsWith("custom"));

      // Pointer Address
      const expectedSlot = 100;
      const expectedTxIdx = 0;
      const expectedCertIdx = 0;
      const pointer = Pointer.new(expectedSlot, expectedTxIdx, expectedCertIdx);
      const pointerAddress = PointerAddress.new(expectedNetworkId, paymentCredential, pointer);
      const pointerAddr = pointerAddress.to_address();
      results.push(`✓ Pointer Address: ${pointerAddr.to_bech32()}`);
      validate(results, "Pointer Address network ID", expectedNetworkId, pointerAddr.network_id());

      // Byron Address
      const bip32PubKey = Bip32PublicKey.from_bytes(new Uint8Array(64).fill(6));
      const expectedProtocolMagic = 764824073;
      const byronAddress = ByronAddress.icarus_from_key(bip32PubKey, expectedProtocolMagic);
      const byronAddr = byronAddress.to_address();
      results.push(`✓ Byron Address: ${byronAddr.to_bech32()}`);
      validate(results, "Byron Address network ID", 1, byronAddr.network_id()); // Byron uses special network ID
      validate(results, "Byron Address kind", 0, byronAddress.byron_address_kind()); // 0 = Icarus
      validate(results, "Byron Address protocol magic", expectedProtocolMagic, byronAddress.byron_protocol_magic());

      // Byron Address from base58
      const byronBase58 = byronAddress.to_base58();
      const byronFromBase58 = ByronAddress.from_base58(byronBase58);
      validate(results, "Byron Address from base58 round-trip", byronBase58, byronFromBase58.to_base58());

      // Byron Address validation
      const isValidByron = ByronAddress.is_valid(byronBase58);
      validate(results, "Byron Address validation", true, isValidByron);

      // Address JSON conversion
      const addressJson = address.to_json();
      const addrFromJson = Address.from_json(addressJson);
      validate(results, "Address from JSON round-trip", address.to_bech32(), addrFromJson.to_bech32());

      // Network Info examples
      const testnetInfo = NetworkInfo.testnet_preview();
      validate(results, "Testnet Preview network ID", 0, testnetInfo.network_id());
      validate(results, "Testnet Preview protocol magic", 2, testnetInfo.protocol_magic());

      const mainnetInfo = NetworkInfo.mainnet();
      validate(results, "Mainnet network ID", 1, mainnetInfo.network_id());
      validate(results, "Mainnet protocol magic", 764824073, mainnetInfo.protocol_magic());

      const customNetworkId = 2;
      const customProtocolMagic = 9999;
      const customInfo = NetworkInfo.new(customNetworkId, customProtocolMagic);
      validate(results, "Custom network ID", customNetworkId, customInfo.network_id());
      validate(results, "Custom protocol magic", customProtocolMagic, customInfo.protocol_magic());

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "📍 Address Examples", results };
  }
}
