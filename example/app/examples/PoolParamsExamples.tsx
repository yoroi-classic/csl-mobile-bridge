import React from 'react';
import { 
  PoolParams,
  Ed25519KeyHash,
  Ed25519KeyHashes,
  Ed25519Signature,
  RewardAddress,
  BigNum,
  UnitInterval,
  URL,
  Relay,
  Relays,
  Ipv4,
  Ipv6,
  DNSRecordSRV,
  PoolMetadata,
  PoolMetadataHash,
  KESVKey,
  OperationalCert,
  Credential,
  SingleHostAddr,
  MultiHostName,
  VRFKeyHash,
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class PoolParamsExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Create basic components
      const operator = Ed25519KeyHash.from_bytes(new Uint8Array(28).fill(1));
      const vrfKeyhash = VRFKeyHash.from_bytes(new Uint8Array(32).fill(2));
      const pledge = BigNum.from_str("500000000000");
      const cost = BigNum.from_str("340000000000");
      const margin = UnitInterval.new(BigNum.from_str("1"), BigNum.from_str("100"));
      const rewardAccount = RewardAddress.new(0, Credential.from_keyhash(operator));
      const poolOwners = Ed25519KeyHashes.new();
      poolOwners.add(Ed25519KeyHash.from_bytes(new Uint8Array(28).fill(3)));
      const relays = Relays.new();
      
      // Add IPv4 relay
      const ipv4 = Ipv4.new(new Uint8Array([192, 168, 1, 1]));
      const ipv4Relay = Relay.new_single_host_addr(SingleHostAddr.new(3001, ipv4));
      relays.add(ipv4Relay);
      
      // Add IPv6 relay
      const ipv6 = Ipv6.new(new Uint8Array(16).fill(0x2001));
      const ipv6Relay = Relay.new_single_host_addr(SingleHostAddr.new(3002, undefined,ipv6));
      relays.add(ipv6Relay);
      
      // Add DNS relay
      const dnsRecord = DNSRecordSRV.new("_cardano._tcp.example.com");
      const dnsRelay = Relay.new_multi_host_name(MultiHostName.new(dnsRecord));
      relays.add(dnsRelay);
      
      // Create pool metadata
      const poolMetadata = PoolMetadata.new(
        URL.new("https://example.com/poolmeta.json"),
        PoolMetadataHash.from_bytes(new Uint8Array(32).fill(4))
      );

      // Create PoolParams
      const poolParams = PoolParams.new(
        operator,
        vrfKeyhash,
        pledge,
        cost,
        margin,
        rewardAccount,
        poolOwners,
        relays,
        poolMetadata
      );
      
      results.push(`✓ PoolParams created`);
      results.push(`✓ Operator: ${poolParams.operator().to_bech32("pool")}`);
      results.push(`✓ VRF keyhash: ${poolParams.vrf_keyhash().to_bech32("vrf")}`);
      results.push(`✓ Pledge: ${poolParams.pledge().to_str()} lovelace`);
      results.push(`✓ Cost: ${poolParams.cost().to_str()} lovelace`);
      results.push(`✓ Margin: ${poolParams.margin().numerator().to_str()}/${poolParams.margin().denominator().to_str()}`);
      results.push(`✓ Reward account: ${poolParams.reward_account().to_address().to_bech32()}`);
      results.push(`✓ Pool owners count: ${poolParams.pool_owners().len()}`);
      results.push(`✓ Relays count: ${poolParams.relays().len()}`);
      results.push(`✓ Pool metadata: ${poolParams.pool_metadata().to_hex()}`);

      // PoolParams with additional parameters
      const kesSignature = Ed25519Signature.from_bytes(new Uint8Array(64).fill(5));
      const kesVkey = KESVKey.from_bytes(new Uint8Array(32).fill(6));
      const operationalCert = OperationalCert.new(
        kesVkey,
        100,
        200,
        kesSignature
      );
      
      const poolParamsWithCert = PoolParams.new(
        operator,
        vrfKeyhash,
        pledge,
        cost,
        margin,
        rewardAccount,
        poolOwners,
        relays,
        poolMetadata,
      );

      // PoolParams conversions
      const poolParamsBytes = poolParams.to_bytes();
      const poolParamsFromBytes = PoolParams.from_bytes(poolParamsBytes);
      results.push(`✓ PoolParams from bytes: Success`);
      results.push(`✓ PoolParams bytes length: ${poolParamsBytes.length}`);

      const poolParamsJson = poolParams.to_json();
      const poolParamsFromJson = PoolParams.from_json(poolParamsJson);
      results.push(`✓ PoolParams JSON conversion: Success`);
      results.push(`✓ PoolParams JSON length: ${poolParamsJson.length} characters`);

      // Test individual components
      results.push(`✓ IPv4 relay created: ${ipv4.to_hex()}`);
      results.push(`✓ IPv6 relay created: ${ipv6.to_hex()}`);
      results.push(`✓ DNS record created: ${dnsRecord.record()}`);
      results.push(`✓ Operational cert created: ${operationalCert.to_hex()}`);

      // PoolParams with different pledge and cost
      const highPledge = BigNum.from_str("1000000000000");
      const highCost = BigNum.from_str("500000000000");
      const lowMargin = UnitInterval.new(BigNum.from_str("1"), BigNum.from_str("1000"));
      
      const poolParamsHigh = PoolParams.new(
        operator,
        vrfKeyhash,
        highPledge,
        highCost,
        lowMargin,
        rewardAccount,
        poolOwners,
        relays,
        poolMetadata
      );
      
      results.push(`✓ PoolParams with high values created`);
      results.push(`✓ High pledge: ${poolParamsHigh.pledge().to_str()} lovelace`);
      results.push(`✓ High cost: ${poolParamsHigh.cost().to_str()} lovelace`);
      results.push(`✓ Low margin: ${poolParamsHigh.margin().numerator().to_str()}/${poolParamsHigh.margin().denominator().to_str()}`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "🏊 PoolParams Examples", results };
  }
}
