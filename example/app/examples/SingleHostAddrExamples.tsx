import React from 'react';
import { 
  SingleHostAddr,
  Ipv4,
  Ipv6,
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class SingleHostAddrExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Create IPv4 SingleHostAddr
      const ipv4 = Ipv4.new(new Uint8Array([192, 168, 1, 1]));
      const port = 3001;
      const ipv4SingleHostAddr = SingleHostAddr.new(port, ipv4);
      
      results.push(`✓ IPv4 SingleHostAddr created`);
      results.push(`✓ IPv4 address: ${ipv4SingleHostAddr.ipv4().to_hex()}`);
      results.push(`✓ Port: ${ipv4SingleHostAddr.port()}`);
      results.push(`✓ IPv4 string: ${ipv4SingleHostAddr.ipv4().to_hex()}`);

      // Create IPv6 SingleHostAddr
      const ipv6 = Ipv6.new(new Uint8Array(16).fill(0x2001));
      const ipv6SingleHostAddr = SingleHostAddr.new(port, undefined, ipv6);
      
      results.push(`✓ IPv6 SingleHostAddr created`);
      results.push(`✓ IPv6 address: ${ipv6SingleHostAddr.ipv6().to_hex()}`);
      results.push(`✓ Port: ${ipv6SingleHostAddr.port()}`);
      results.push(`✓ IPv6 string: ${ipv6SingleHostAddr.ipv6().to_hex()}`);

      // Create SingleHostAddr with different port
      const highPort = 8080;
      const highPortSingleHostAddr = SingleHostAddr.new(highPort, ipv4);
      
      results.push(`✓ SingleHostAddr with high port created`);
      results.push(`✓ High port: ${highPortSingleHostAddr.port()}`);

      // SingleHostAddr conversions
      const singleHostAddrBytes = ipv4SingleHostAddr.to_bytes();
      const singleHostAddrFromBytes = SingleHostAddr.from_bytes(singleHostAddrBytes);
      results.push(`✓ SingleHostAddr from bytes: Success`);
      results.push(`✓ SingleHostAddr bytes length: ${singleHostAddrBytes.length}`);

      const singleHostAddrJson = ipv4SingleHostAddr.to_json();
      const singleHostAddrFromJson = SingleHostAddr.from_json(singleHostAddrJson);
      results.push(`✓ SingleHostAddr JSON conversion: Success`);
      results.push(`✓ SingleHostAddr JSON length: ${singleHostAddrJson.length} characters`);

      // Test individual components
      results.push(`✓ IPv4 created: ${ipv4.to_hex()}`);
      results.push(`✓ IPv6 created: ${ipv6.to_hex()}`);

      // Create SingleHostAddr with localhost IPv4
      const localhostIpv4 = Ipv4.new(new Uint8Array([127, 0, 0, 1]));
      const localhostSingleHostAddr = SingleHostAddr.new(port, localhostIpv4);
      
      results.push(`✓ Localhost IPv4 SingleHostAddr created`);
      results.push(`✓ Localhost IPv4: ${localhostSingleHostAddr.ipv4().to_hex()}`);

      // Compare SingleHostAddr objects
      const sameAddr = SingleHostAddr.new(port, ipv4);
      const differentAddr = SingleHostAddr.new(highPort, undefined, ipv6);

      results.push(`✓ Same address comparison: ${ipv4SingleHostAddr.to_hex()} === ${sameAddr.to_hex()}`);
      results.push(`✓ Different address comparison: ${ipv4SingleHostAddr.to_hex()} === ${differentAddr.to_hex()}`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "🌐 SingleHostAddr Examples", results };
  }
}
