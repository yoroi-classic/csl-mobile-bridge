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
} from "@emurgo/csl-mobile-bridge";
import { ExampleSection } from '../types';

// Helper function to validate expected vs actual values
function validate<T>(results: string[], name: string, expected: T, actual: T): void {
  if (expected === actual) {
    results.push(`✓ ${name}: expected ${expected}, actual: ${actual}`);
  } else {
    results.push(`❌ Error: ${name}: expected ${expected}, actual: ${actual}`);
  }
}

export default class PoolParamsExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      // Create basic components
      const operatorBytes = new Uint8Array(28).fill(1);
      const operator = Ed25519KeyHash.from_bytes(operatorBytes);
      const expectedOperatorHex = "01010101010101010101010101010101010101010101010101010101";

      const vrfKeyhashBytes = new Uint8Array(32).fill(2);
      const vrfKeyhash = VRFKeyHash.from_bytes(vrfKeyhashBytes);
      const expectedVrfHex = "0202020202020202020202020202020202020202020202020202020202020202";

      const pledgeStr = "500000000000";
      const pledge = BigNum.from_str(pledgeStr);

      const costStr = "340000000000";
      const cost = BigNum.from_str(costStr);

      const marginNum = "1";
      const marginDen = "100";
      const margin = UnitInterval.new(BigNum.from_str(marginNum), BigNum.from_str(marginDen));

      const rewardAccount = RewardAddress.new(0, Credential.from_keyhash(operator));
      const poolOwners = Ed25519KeyHashes.new();
      poolOwners.add(Ed25519KeyHash.from_bytes(new Uint8Array(28).fill(3)));
      const relays = Relays.new();

      // Add IPv4 relay
      const ipv4Bytes = new Uint8Array([192, 168, 1, 1]);
      const ipv4 = Ipv4.new(ipv4Bytes);
      const ipv4Port = 3001;
      const ipv4Relay = Relay.new_single_host_addr(SingleHostAddr.new(ipv4Port, ipv4));
      relays.add(ipv4Relay);

      // Add IPv6 relay
      const ipv6 = Ipv6.new(new Uint8Array(16).fill(0x2001));
      const ipv6Port = 3002;
      const ipv6Relay = Relay.new_single_host_addr(SingleHostAddr.new(ipv6Port, undefined, ipv6));
      relays.add(ipv6Relay);

      // Add DNS relay
      const dnsRecordStr = "_cardano._tcp.example.com";
      const dnsRecord = DNSRecordSRV.new(dnsRecordStr);
      const dnsRelay = Relay.new_multi_host_name(MultiHostName.new(dnsRecord));
      relays.add(dnsRelay);

      // Create pool metadata
      const poolMetadataUrl = "https://example.com/poolmeta.json";
      const poolMetadata = PoolMetadata.new(
        URL.new(poolMetadataUrl),
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
      validate(results, "Operator hex", expectedOperatorHex, poolParams.operator().to_hex());
      validate(results, "VRF keyhash hex", expectedVrfHex, poolParams.vrf_keyhash().to_hex());
      validate(results, "Pledge", pledgeStr, poolParams.pledge().to_str());
      validate(results, "Cost", costStr, poolParams.cost().to_str());
      validate(results, "Margin numerator", marginNum, poolParams.margin().numerator().to_str());
      validate(results, "Margin denominator", marginDen, poolParams.margin().denominator().to_str());
      validate(results, "Pool owners count", 1, poolParams.pool_owners().len());
      validate(results, "Relays count", 3, poolParams.relays().len());

      // PoolParams with additional parameters
      const kesSignature = Ed25519Signature.from_bytes(new Uint8Array(64).fill(5));
      const kesVkey = KESVKey.from_bytes(new Uint8Array(32).fill(6));
      const opCertSequence = 100;
      const opCertPeriod = 200;
      const operationalCert = OperationalCert.new(
        kesVkey,
        opCertSequence,
        opCertPeriod,
        kesSignature
      );

      results.push(`✓ Operational cert created`);

      // PoolParams conversions
      const poolParamsBytes = poolParams.to_bytes();
      const poolParamsFromBytes = PoolParams.from_bytes(poolParamsBytes);
      validate(results, "PoolParams from bytes pledge", pledgeStr, poolParamsFromBytes.pledge().to_str());
      validate(results, "PoolParams from bytes cost", costStr, poolParamsFromBytes.cost().to_str());

      const poolParamsJson = poolParams.to_json();
      const poolParamsFromJson = PoolParams.from_json(poolParamsJson);
      validate(results, "PoolParams from JSON pledge", pledgeStr, poolParamsFromJson.pledge().to_str());

      // Test individual components
      const expectedIpv4Hex = "44c0a80101";
      validate(results, "IPv4 hex", expectedIpv4Hex, ipv4.to_hex());
      validate(results, "DNS record", dnsRecordStr, dnsRecord.record());

      // PoolParams with different pledge and cost
      const highPledgeStr = "1000000000000";
      const highCostStr = "500000000000";
      const highPledge = BigNum.from_str(highPledgeStr);
      const highCost = BigNum.from_str(highCostStr);
      const lowMarginNum = "1";
      const lowMarginDen = "1000";
      const lowMargin = UnitInterval.new(BigNum.from_str(lowMarginNum), BigNum.from_str(lowMarginDen));

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

      validate(results, "High pledge", highPledgeStr, poolParamsHigh.pledge().to_str());
      validate(results, "High cost", highCostStr, poolParamsHigh.cost().to_str());
      validate(results, "Low margin numerator", lowMarginNum, poolParamsHigh.margin().numerator().to_str());
      validate(results, "Low margin denominator", lowMarginDen, poolParamsHigh.margin().denominator().to_str());

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "🏊 PoolParams Examples", results };
  }
}
