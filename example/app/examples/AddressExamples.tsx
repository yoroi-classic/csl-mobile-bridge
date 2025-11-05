import React from 'react';
import { 
  Address, 
  BaseAddress, 
  EnterpriseAddress, 
  RewardAddress,
  Credential,
  PrivateKey,
  PublicKey
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

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "📍 Address Examples", results };
  }
}
