import React from 'react';
import { 
  SingleHostName,
  DNSRecordAorAAAA
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class SingleHostNameExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      const port = 3001;
      // Create DNSRecordSRV
      const dnsRecord = DNSRecordAorAAAA.new("_cardano._tcp.example.com");
      
      results.push(`✓ DNSRecordAorAAAA created`);
      results.push(`✓ DNS record: ${dnsRecord.record()}`);

      // Create SingleHostName with DNS record
      const singleHostName = SingleHostName.new(port, dnsRecord);
      
      results.push(`✓ SingleHostName created`);
      results.push(`✓ DNS record from SingleHostName: ${singleHostName.dns_name().record()}`);

      // SingleHostName conversions
      const singleHostNameBytes = singleHostName.to_bytes();
      const singleHostNameFromBytes = SingleHostName.from_bytes(singleHostNameBytes);
      results.push(`✓ SingleHostName from bytes: Success`);
      results.push(`✓ SingleHostName bytes length: ${singleHostNameBytes.length}`);

      const singleHostNameJson = singleHostName.to_json();
      const singleHostNameFromJson = SingleHostName.from_json(singleHostNameJson);
      results.push(`✓ SingleHostName JSON conversion: Success`);
      results.push(`✓ SingleHostName JSON length: ${singleHostNameJson.length} characters`);

      // Create different DNS records
      const stakePoolRecord = DNSRecordAorAAAA.new("_stake._tcp.example.com");
      const stakePoolSingleHostName = SingleHostName.new(port, stakePoolRecord);
      
      results.push(`✓ SingleHostName with stake pool record created`);
      results.push(`✓ Stake pool DNS: ${stakePoolSingleHostName.dns_name().record()}`);

      const relayRecord = DNSRecordAorAAAA.new("_relay._udp.example.com");
      const relaySingleHostName = SingleHostName.new(port, relayRecord);
      
      results.push(`✓ SingleHostName with relay record created`);
      results.push(`✓ Relay DNS: ${relaySingleHostName.dns_name().record()}`);

      // Create SingleHostName with different subdomains
      const apiRecord = DNSRecordAorAAAA.new("api.example.com");
      const apiSingleHostName = SingleHostName.new(port, apiRecord);

      results.push(`✓ SingleHostName with API record created`);
      results.push(`✓ API DNS: ${apiSingleHostName.dns_name().record()}`);

      const wwwRecord = DNSRecordAorAAAA.new("www.example.com");
      const wwwSingleHostName = SingleHostName.new(port, wwwRecord);
      
      results.push(`✓ SingleHostName with WWW record created`);
      results.push(`✓ WWW DNS: ${wwwSingleHostName.dns_name().record()}`);

      // Test DNS record validation
      const validRecord = DNSRecordAorAAAA.new("_cardano._tcp.example.com");
      const validSingleHostName = SingleHostName.new(port, validRecord);

      results.push(`✓ Valid DNS record created: ${validSingleHostName.dns_name().record()}`);

      // Test with empty record (should handle gracefully)
      try {
        const emptyRecord = DNSRecordAorAAAA.new("");
        const emptySingleHostName = SingleHostName.new(port, emptyRecord);
        results.push(`✓ Empty DNS record handled: ${emptySingleHostName.dns_name().record()}`);
      } catch (error) {
        results.push(`✓ Empty DNS record error handled: ${error instanceof Error ? error.message : String(error)}`);
      }
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "🌍 SingleHostName Examples", results };
  }
}
