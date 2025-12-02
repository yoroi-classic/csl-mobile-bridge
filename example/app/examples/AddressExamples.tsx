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
      const baseAddress = BaseAddress.new(0, paymentCredential, stakeCredential);
      const address = baseAddress.to_address();
      results.push(`✓ Base Address: ${address.to_bech32()}`);
      results.push(`✓ Address Network ID: ${address.network_id()}`);
      results.push(`✓ Address Kind: ${address.kind()}`);

      // Enterprise Address
      const enterpriseAddress = EnterpriseAddress.new(0, paymentCredential);
      const enterpriseAddr = enterpriseAddress.to_address();
      results.push(`✓ Enterprise Address: ${enterpriseAddr.to_bech32()}`);

      // Reward Address
      const rewardAddress = RewardAddress.new(0, stakeCredential);
      const rewardAddr = rewardAddress.to_address();
      results.push(`✓ Reward Address: ${rewardAddr.to_bech32()}`);

      // Address conversions
      const addrBytes = address.to_bytes();
      const addrFromBytes = Address.from_bytes(addrBytes);
      results.push(`✓ Address from bytes: ${addrFromBytes.to_bech32()}`);

      const addrHex = address.to_hex();
      const addrFromHex = Address.from_hex(addrHex);
      results.push(`✓ Address from hex: ${addrFromHex.to_bech32()}`);

      // Address validation
      results.push(`✓ Is malformed: ${address.is_malformed()}`);

      // Address payment credential
      const paymentCred = address.payment_cred();
      results.push(`✓ Payment credential kind: ${paymentCred.kind()}`);
      results.push(`✓ Payment credential has script hash: ${paymentCred.has_script_hash()}`);

      // Address with different prefix
      const addressWithPrefix = address.to_bech32("custom");
      results.push(`✓ Address with custom prefix: ${addressWithPrefix}`);

      // Pointer Address
      const pointer = Pointer.new(100, 0, 0);
      const pointerAddress = PointerAddress.new(0, paymentCredential, pointer);
      const pointerAddr = pointerAddress.to_address();
      results.push(`✓ Pointer Address: ${pointerAddr.to_bech32()}`);
      results.push(`✓ Pointer Address network ID: ${pointerAddr.network_id()}`);

      // Byron Address
      const bip32PubKey = Bip32PublicKey.from_bytes(new Uint8Array(64).fill(6));
      const byronAddress = ByronAddress.icarus_from_key(bip32PubKey, 764824073);
      const byronAddr = byronAddress.to_address();
      results.push(`✓ Byron Address: ${byronAddr.to_bech32()}`);
      results.push(`✓ Byron Address network ID: ${byronAddr.network_id()}`);
      results.push(`✓ Byron Address kind: ${byronAddress.byron_address_kind()}`);
      results.push(`✓ Byron Address protocol magic: ${byronAddress.byron_protocol_magic()}`);

      // Byron Address from base58
      const byronBase58 = byronAddress.to_base58();
      ByronAddress.from_base58(byronBase58);
      results.push(`✓ Byron Address from base58: Success`);

      // Byron Address validation
      const isValidByron = ByronAddress.is_valid(byronBase58);
      results.push(`✓ Byron Address validation: ${isValidByron}`);

      // Address JSON conversion
      const addressJson = address.to_json();
      Address.from_json(addressJson);
      results.push(`✓ Address from JSON: Success`);
      results.push(`✓ Address JSON length: ${addressJson.length} characters`);

      // Network Info examples
      const testnetInfo = NetworkInfo.testnet_preview();
      results.push(`✓ Testnet Preview network ID: ${testnetInfo.network_id()}`);
      results.push(`✓ Testnet Preview protocol magic: ${testnetInfo.protocol_magic()}`);

      const mainnetInfo = NetworkInfo.mainnet();
      results.push(`✓ Mainnet network ID: ${mainnetInfo.network_id()}`);
      results.push(`✓ Mainnet protocol magic: ${mainnetInfo.protocol_magic()}`);

      const customInfo = NetworkInfo.new(2, 9999);
      results.push(`✓ Custom network ID: ${customInfo.network_id()}`);
      results.push(`✓ Custom protocol magic: ${customInfo.protocol_magic()}`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "📍 Address Examples", results };
  }
}
