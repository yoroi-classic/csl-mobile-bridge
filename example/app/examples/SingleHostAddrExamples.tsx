import React from 'react';
import {
  SingleHostAddr,
  Ipv4,
  Ipv6,
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

export default class SingleHostAddrExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      // Create IPv4 SingleHostAddr
      const ipv4Bytes = new Uint8Array([192, 168, 1, 1]);
      const ipv4 = Ipv4.new(ipv4Bytes);
      const expectedIpv4Hex = "44c0a80101";
      const port = 3001;
      const ipv4SingleHostAddr = SingleHostAddr.new(port, ipv4);

      results.push(`✓ IPv4 SingleHostAddr created`);
      validate(results, "IPv4 address hex", expectedIpv4Hex, ipv4SingleHostAddr.ipv4().to_hex());
      validate(results, "IPv4 port", port, ipv4SingleHostAddr.port());

      // Create IPv6 SingleHostAddr
      const ipv6Bytes = new Uint8Array(16).fill(0x20);
      const ipv6 = Ipv6.new(ipv6Bytes);
      const expectedIpv6Hex = "5020202020202020202020202020202020";
      const ipv6SingleHostAddr = SingleHostAddr.new(port, undefined, ipv6);

      results.push(`✓ IPv6 SingleHostAddr created`);
      validate(results, "IPv6 address hex", expectedIpv6Hex, ipv6SingleHostAddr.ipv6().to_hex());
      validate(results, "IPv6 port", port, ipv6SingleHostAddr.port());

      // Create SingleHostAddr with different port
      const highPort = 8080;
      const highPortSingleHostAddr = SingleHostAddr.new(highPort, ipv4);
      validate(results, "High port", highPort, highPortSingleHostAddr.port());

      // SingleHostAddr conversions
      const singleHostAddrBytes = ipv4SingleHostAddr.to_bytes();
      const singleHostAddrFromBytes = SingleHostAddr.from_bytes(singleHostAddrBytes);
      validate(results, "SingleHostAddr from bytes port", port, singleHostAddrFromBytes.port());
      validate(results, "SingleHostAddr from bytes ipv4", expectedIpv4Hex, singleHostAddrFromBytes.ipv4().to_hex());

      const singleHostAddrJson = ipv4SingleHostAddr.to_json();
      const singleHostAddrFromJson = SingleHostAddr.from_json(singleHostAddrJson);
      validate(results, "SingleHostAddr from JSON port", port, singleHostAddrFromJson.port());
      validate(results, "SingleHostAddr from JSON ipv4", expectedIpv4Hex, singleHostAddrFromJson.ipv4().to_hex());

      // Test individual components
      validate(results, "IPv4 hex", expectedIpv4Hex, ipv4.to_hex());
      validate(results, "IPv6 hex", expectedIpv6Hex, ipv6.to_hex());

      // Create SingleHostAddr with localhost IPv4
      const localhostBytes = new Uint8Array([127, 0, 0, 1]);
      const localhostIpv4 = Ipv4.new(localhostBytes);
      const expectedLocalhostHex = "447f000001";
      const localhostSingleHostAddr = SingleHostAddr.new(port, localhostIpv4);

      validate(results, "Localhost IPv4 hex", expectedLocalhostHex, localhostSingleHostAddr.ipv4().to_hex());

      // Compare SingleHostAddr objects
      const sameAddr = SingleHostAddr.new(port, ipv4);
      const differentAddr = SingleHostAddr.new(highPort, undefined, ipv6);

      validate(results, "Same address hex comparison", ipv4SingleHostAddr.to_hex(), sameAddr.to_hex());
      validate(results, "Different ports comparison", true, ipv4SingleHostAddr.to_hex() !== differentAddr.to_hex());

      // Verify round-trip hex conversion
      const originalHex = ipv4SingleHostAddr.to_hex();
      const fromHex = SingleHostAddr.from_hex(originalHex);
      validate(results, "Hex round-trip", originalHex, fromHex.to_hex());

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "🌐 SingleHostAddr Examples", results };
  }
}
