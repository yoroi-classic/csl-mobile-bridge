import React from 'react';
import {
  HeaderBody,
  VRFVKey,
  VRFCert,
  OperationalCert,
  KESVKey,
  Ed25519Signature,
  ProtocolVersion,
  Vkey,
  BlockHash,
  BigNum,
  PublicKey
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

export default class HeaderBodyExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      // Create basic components
      const blockNumber = 1000;
      const blockBodySize = 232323;
      const slot = 50000000;
      const prevHashBytes = new Uint8Array(32).fill(1);
      const prevHash = BlockHash.from_bytes(prevHashBytes);
      const blockBodyHashBytes = new Uint8Array(32).fill(2);
      const blockBodyHash = BlockHash.from_bytes(blockBodyHashBytes);
      const issuerVkeyHex = "fd794e378784ee1b79eab6ebbebb202facee2d92d40d69b7e1c7a85943f5c679";
      const issuerVkey = Vkey.new(PublicKey.from_hex(issuerVkeyHex));

      // Create VRF components
      const vrfVkeyBytes = new Uint8Array(32).fill(4);
      const vrfVkey = VRFVKey.from_bytes(vrfVkeyBytes);
      const vrfResult = VRFCert.new(new Uint8Array(32).fill(7), new Uint8Array(80).fill(7));

      // Create operational certificate
      const kesSequence = 100;
      const kesPeriod = 200;
      const operationalCert = OperationalCert.new(
        KESVKey.from_bytes(new Uint8Array(32).fill(8)),
        kesSequence,
        kesPeriod,
        Ed25519Signature.from_bytes(new Uint8Array(64).fill(9))
      );

      // Create protocol version
      const protocolMajor = 5;
      const protocolMinor = 0;
      const protocolVersion = ProtocolVersion.new(protocolMajor, protocolMinor);

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
      validate(results, "Block number", blockNumber, headerBody.block_number());
      validate(results, "Slot", slot.toString(), headerBody.slot_bignum().to_str());

      const expectedPrevHashHex = "0101010101010101010101010101010101010101010101010101010101010101";
      validate(results, "Previous hash", expectedPrevHashHex, headerBody.prev_hash().to_hex());

      validate(results, "Issuer VKey hex", issuerVkeyHex, headerBody.issuer_vkey().public_key().to_hex());

      const expectedVrfVkeyHex = "0404040404040404040404040404040404040404040404040404040404040404";
      validate(results, "VRF VKey hex", expectedVrfVkeyHex, headerBody.vrf_vkey().to_hex());

      validate(results, "Block body size", blockBodySize, headerBody.block_body_size());

      const expectedBlockBodyHashHex = "0202020202020202020202020202020202020202020202020202020202020202";
      validate(results, "Block body hash", expectedBlockBodyHashHex, headerBody.block_body_hash().to_hex());

      validate(results, "Protocol version major", protocolMajor, headerBody.protocol_version().major());
      validate(results, "Protocol version minor", protocolMinor, headerBody.protocol_version().minor());

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
      validate(results, "Block number (no prev hash)", blockNumber, headerBodyWithoutPrevHash.block_number());

      // HeaderBody using new_headerbody method
      const headerBody2 = HeaderBody.new_headerbody(
        blockNumber,
        BigNum.from_str(slot.toString()),
        prevHash,
        issuerVkey,
        vrfVkey,
        vrfResult,
        blockBodySize,
        blockBodyHash,
        operationalCert,
        protocolVersion,
      );
      validate(results, "HeaderBody from new_headerbody block number", blockNumber, headerBody2.block_number());
      validate(results, "HeaderBody from new_headerbody slot", slot.toString(), headerBody2.slot_bignum().to_str());

      // HeaderBody using new_headerbody method without previous hash
      const headerBody3 = HeaderBody.new_headerbody(
        blockNumber,
        BigNum.from_str(slot.toString()),
        undefined,
        issuerVkey,
        vrfVkey,
        vrfResult,
        blockBodySize,
        blockBodyHash,
        operationalCert,
        protocolVersion,
      );

      validate(results, "HeaderBody from new_headerbody (no prev hash) block number", blockNumber, headerBody3.block_number());
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "📋 HeaderBody Examples", results };
  }
}
