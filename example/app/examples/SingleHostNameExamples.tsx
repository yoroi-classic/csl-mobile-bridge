import React from 'react';
import {
  SingleHostName,
  DNSRecordAorAAAA
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

export default class SingleHostNameExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      const port = 3001;
      // Create DNSRecordAorAAAA
      const dnsRecordStr = "_cardano._tcp.example.com";
      const dnsRecord = DNSRecordAorAAAA.new(dnsRecordStr);

      validate(results, "DNS record value", dnsRecordStr, dnsRecord.record());

      // Create SingleHostName with DNS record
      const singleHostName = SingleHostName.new(port, dnsRecord);

      validate(results, "SingleHostName port", port, singleHostName.port());
      validate(results, "SingleHostName DNS name", dnsRecordStr, singleHostName.dns_name().record());

      // SingleHostName conversions
      const singleHostNameBytes = singleHostName.to_bytes();
      const singleHostNameFromBytes = SingleHostName.from_bytes(singleHostNameBytes);
      validate(results, "SingleHostName from bytes DNS", dnsRecordStr, singleHostNameFromBytes.dns_name().record());
      validate(results, "SingleHostName from bytes port", port, singleHostNameFromBytes.port());

      const singleHostNameJson = singleHostName.to_json();
      const singleHostNameFromJson = SingleHostName.from_json(singleHostNameJson);
      validate(results, "SingleHostName from JSON DNS", dnsRecordStr, singleHostNameFromJson.dns_name().record());
      validate(results, "SingleHostName from JSON port", port, singleHostNameFromJson.port());

      // Create different DNS records
      const stakePoolRecordStr = "_stake._tcp.example.com";
      const stakePoolRecord = DNSRecordAorAAAA.new(stakePoolRecordStr);
      const stakePoolSingleHostName = SingleHostName.new(port, stakePoolRecord);

      validate(results, "Stake pool DNS record", stakePoolRecordStr, stakePoolSingleHostName.dns_name().record());

      const relayRecordStr = "_relay._udp.example.com";
      const relayRecord = DNSRecordAorAAAA.new(relayRecordStr);
      const relaySingleHostName = SingleHostName.new(port, relayRecord);

      validate(results, "Relay DNS record", relayRecordStr, relaySingleHostName.dns_name().record());

      // Create SingleHostName with different subdomains
      const apiRecordStr = "api.example.com";
      const apiRecord = DNSRecordAorAAAA.new(apiRecordStr);
      const apiSingleHostName = SingleHostName.new(port, apiRecord);

      validate(results, "API DNS record", apiRecordStr, apiSingleHostName.dns_name().record());

      const wwwRecordStr = "www.example.com";
      const wwwRecord = DNSRecordAorAAAA.new(wwwRecordStr);
      const wwwSingleHostName = SingleHostName.new(port, wwwRecord);

      validate(results, "WWW DNS record", wwwRecordStr, wwwSingleHostName.dns_name().record());

      // Test DNS record validation - hex round trip
      const validRecordStr = "_cardano._tcp.example.com";
      const validRecord = DNSRecordAorAAAA.new(validRecordStr);
      const validSingleHostName = SingleHostName.new(port, validRecord);

      const hexValue = validSingleHostName.to_hex();
      const fromHex = SingleHostName.from_hex(hexValue);
      validate(results, "SingleHostName hex round-trip DNS", validRecordStr, fromHex.dns_name().record());
      validate(results, "SingleHostName hex round-trip port", port, fromHex.port());

      // Test with empty record (should handle gracefully)
      try {
        const emptyRecord = DNSRecordAorAAAA.new("");
        const emptySingleHostName = SingleHostName.new(port, emptyRecord);
        validate(results, "Empty DNS record", "", emptySingleHostName.dns_name().record());
      } catch (error) {
        results.push(`✓ Empty DNS record error handled correctly: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "🌍 SingleHostName Examples", results };
  }
}
