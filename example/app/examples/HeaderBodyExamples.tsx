import React from 'react';
import { 
  HeaderBody,
  VRFVKey,
  VRFCert,
  OperationalCert,
  KESVKey,
  Ed25519Signature,
  ProtocolVersion,
  Nonce,
  Vkey,
  BlockHash
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class HeaderBodyExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Create basic components
      const blockNumber = 1000;
      const blockBodySize = 232323;
      const slot = 50000000;
      const prevHash = BlockHash.from_bytes(new Uint8Array(32).fill(1));
      const blockBodyHash = BlockHash.from_bytes(new Uint8Array(32).fill(2));
      const issuerVkey = Vkey.from_bytes(new Uint8Array(32).fill(3));
      
      // Create VRF components
      const vrfVkey = VRFVKey.from_bytes(new Uint8Array(32).fill(4));
      const leaderVrf = VRFCert.new(new Uint8Array(32).fill(6), new Uint8Array(32).fill(6));
      const vrfResult = VRFCert.new(new Uint8Array(32).fill(7), new Uint8Array(32).fill(7));
      
      // Create operational certificate
      const operationalCert = OperationalCert.new(
        KESVKey.from_bytes(new Uint8Array(32).fill(8)),
        100,
        200,
        Ed25519Signature.from_bytes(new Uint8Array(64).fill(9))
      );
      
      // Create protocol version
      const protocolVersion = ProtocolVersion.new(5, 0);
      
      // Create nonce
      const nonce = Nonce.new_identity();
      
      // Basic HeaderBody with previous hash
      const headerBody = HeaderBody.new(
        blockNumber,
        slot,
        prevHash,
        issuerVkey,
        vrfVkey,
        vrfResult,
        blockBodySize,
        blockBodyHash,
        operationalCert,
        protocolVersion
      );
      
      results.push(`✓ HeaderBody with previous hash created`);
      results.push(`✓ Block number: ${headerBody.block_number()}`);
      results.push(`✓ Slot: ${headerBody.slot_bignum().to_str()}`);
      results.push(`✓ Previous hash: ${headerBody.prev_hash().to_hex()}`);
      results.push(`✓ Issuer VKey hash: ${headerBody.issuer_vkey().public_key().hash().to_bech32("vkey")}`);
      results.push(`✓ VRF VKey hash: ${headerBody.vrf_vkey().to_bech32("vkey")}`);
      results.push(`✓ VRF Cert: ${headerBody.vrf_result_or_nothing().to_hex()}`);
      results.push(`✓ Block body size: ${headerBody.block_body_size()}`);
      results.push(`✓ Block body hash: ${headerBody.block_body_hash().to_hex()}`);
      results.push(`✓ Operational Cert: ${headerBody.operational_cert().to_hex()}`);
      results.push(`✓ Protocol version: ${headerBody.protocol_version().major()} . ${headerBody.protocol_version().minor()}`);

      // HeaderBody without previous hash
      const headerBodyWithoutPrevHash = HeaderBody.new(
        blockNumber,
        slot,
        undefined,
        issuerVkey,
        vrfVkey,
        vrfResult,
        blockBodySize,
        blockBodyHash,
        operationalCert,
        protocolVersion
      );
      
      results.push(`✓ HeaderBody without previous hash created`);
      results.push(`✓ Previous hash: ${headerBodyWithoutPrevHash.prev_hash().to_hex()}`);
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "📋 HeaderBody Examples", results };
  }
}
