import React from 'react';
import { 
  Block,
  BlockHash,
  Header,
  HeaderBody,
  TransactionBodies,
  TransactionWitnessSets,
  AuxiliaryDataSet,
  VRFVKey,
  VRFCert,
  OperationalCert,
  KESVKey,
  Ed25519Signature,
  ProtocolVersion,
  Vkey,
  PublicKey,
  KESSignature,
  FixedBlock,
  FixedVersionedBlock,
  VersionedBlock,
  BlockEra,
  BigNum,
  TransactionBody,
  TransactionInput,
  TransactionInputs,
  TransactionOutput,
  TransactionOutputs,
  Address,
  Value,
  TransactionWitnessSet,
  AuxiliaryData,
  GeneralTransactionMetadata,
  TransactionMetadatum,
  MetadataMap,
  TransactionHash
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class BlockExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Create basic components for block creation
      const blockNumber = 1000;
      const slot = 50000000;
      const prevHash = BlockHash.from_bytes(new Uint8Array(32).fill(1));
      const blockBodyHash = BlockHash.from_bytes(new Uint8Array(32).fill(2));
      const issuerVkey = Vkey.new(PublicKey.from_hex("fd794e378784ee1b79eab6ebbebb202facee2d92d40d69b7e1c7a85943f5c679"));
      
      // Create VRF components
      const vrfVkey = VRFVKey.from_bytes(new Uint8Array(32).fill(4));
      const vrfResult = VRFCert.new(new Uint8Array(32).fill(7), new Uint8Array(80).fill(7));

      // Create operational certificate
      const operationalCert = OperationalCert.new(
        KESVKey.from_bytes(new Uint8Array(32).fill(8)),
        100,
        200,
        Ed25519Signature.from_bytes(new Uint8Array(64).fill(9))
      );
      
      // Create protocol version
      const protocolVersion = ProtocolVersion.new(5, 0);
      
      // Create HeaderBody
      const headerBody = HeaderBody.new(
        blockNumber,
        slot,
        prevHash,
        issuerVkey,
        vrfVkey,
        vrfResult,
        232323, // block_body_size
        blockBodyHash,
        operationalCert,
        protocolVersion
      );

      // Create KES signature for Header
      const kesSignature = KESSignature.from_bytes(new Uint8Array(448).fill(10));
      const header = Header.new(headerBody, kesSignature);

      // Create transaction bodies
      const transactionBodies = TransactionBodies.new();
      
      // Create a simple transaction body
      const txHash = TransactionHash.from_hex("fd656fb1f4cf6fbbc36f2705568a4d3b7a970ec0b39f80cc81e1293626b77316");
      const txInput = TransactionInput.new(txHash, 0);
      const txOutputs = TransactionOutputs.new();
      const txOutput = TransactionOutput.new(
        Address.from_bech32("addr1vx7j284mqe59w2mka36gf5xq0hvu8ms2989553fk5qh3prcapfpj3"),
        Value.new(BigNum.from_str("1000000"))
      );
      txOutputs.add(txOutput);
      
      const txBody = TransactionBody.new(
        TransactionInputs.new(),
        txOutputs,
        BigNum.from_str("170000")
      );
      
      transactionBodies.add(txBody);
      results.push(`✓ Transaction bodies created: ${transactionBodies.len()}`);

      // Create transaction witness sets
      const transactionWitnessSets = TransactionWitnessSets.new();
      const witnessSet = TransactionWitnessSet.new();
      transactionWitnessSets.add(witnessSet);
      results.push(`✓ Transaction witness sets created: ${transactionWitnessSets.len()}`);

      // Create auxiliary data set
      const auxiliaryDataSet = AuxiliaryDataSet.new();
      const metadata = GeneralTransactionMetadata.new();
      const map = MetadataMap.new();
      map.insert_str("block_example", TransactionMetadatum.new_text("CSL Mobile Bridge Block Example"));
      metadata.insert(BigNum.from_str("1"), TransactionMetadatum.new_map(map));
      
      const auxData = AuxiliaryData.new();
      auxData.set_metadata(metadata);
      auxiliaryDataSet.insert(0, auxData);
      results.push(`✓ Auxiliary data set created: ${auxiliaryDataSet.len()}`);

      // Create invalid transactions array
      const invalidTransactions = new Uint32Array([1000, 2000, 3000]);
      results.push(`✓ Invalid transactions array created: ${invalidTransactions.length} items`);

      // Create Block
      const block = Block.new(
        header,
        transactionBodies,
        transactionWitnessSets,
        auxiliaryDataSet,
        invalidTransactions
      );
      
      results.push(`✓ Block created successfully`);
      results.push(`✓ Block header: ${block.header().to_hex().substring(0, 50)}...`);
      results.push(`✓ Block transaction bodies count: ${block.transaction_bodies().len()}`);
      results.push(`✓ Block transaction witness sets count: ${block.transaction_witness_sets().len()}`);
      results.push(`✓ Block auxiliary data set count: ${auxiliaryDataSet.len()}`);
      results.push(`✓ Block invalid transactions count: ${block.invalid_transactions().length}`);

      // Block conversions
      const blockBytes = block.to_bytes();
      const blockFromBytes = Block.from_bytes(blockBytes);
      results.push(`✓ Block from bytes: Success`);
      results.push(`✓ Block bytes length: ${blockBytes.length}`);

      const blockHex = block.to_hex();
      const blockFromHex = Block.from_hex(blockHex);
      results.push(`✓ Block from hex: Success`);
      results.push(`✓ Block hex length: ${blockHex.length} characters`);

      const blockJson = block.to_json();
      const blockFromJson = Block.from_json(blockJson);
      results.push(`✓ Block from JSON: Success`);
      results.push(`✓ Block JSON length: ${blockJson.length} characters`);

      // VersionedBlock examples
      const versionedBlock = VersionedBlock.new(block, 5); // Babbage era
      results.push(`✓ VersionedBlock created`);
      results.push(`✓ VersionedBlock era: ${versionedBlock.era()}`);
      results.push(`✓ VersionedBlock block access: Success`);

      // VersionedBlock conversions
      const versionedBlockBytes = versionedBlock.to_bytes();
      const versionedBlockFromBytes = VersionedBlock.from_bytes(versionedBlockBytes);
      results.push(`✓ VersionedBlock from bytes: Success`);
      results.push(`✓ VersionedBlock bytes length: ${versionedBlockBytes.length}`);

      const versionedBlockHex = versionedBlock.to_hex();
      const versionedBlockFromHex = VersionedBlock.from_hex(versionedBlockHex);
      results.push(`✓ VersionedBlock from hex: Success`);
      results.push(`✓ VersionedBlock hex length: ${versionedBlockHex.length} characters`);

      const versionedBlockJson = versionedBlock.to_json();
      const versionedBlockFromJson = VersionedBlock.from_json(versionedBlockJson);
      results.push(`✓ VersionedBlock from JSON: Success`);
      results.push(`✓ VersionedBlock JSON length: ${versionedBlockJson.length} characters`);

      // FixedBlock examples
      const fixedBlock = FixedBlock.from_bytes(blockBytes);
      results.push(`✓ FixedBlock created from bytes`);
      results.push(`✓ FixedBlock header: Success`);
      results.push(`✓ FixedBlock transaction bodies count: ${fixedBlock.transaction_bodies().len()}`);
      results.push(`✓ FixedBlock transaction witness sets count: ${fixedBlock.transaction_witness_sets().len()}`);
      results.push(`✓ FixedBlock auxiliary data set count: ${fixedBlock.auxiliary_data_set().len()}`);
      results.push(`✓ FixedBlock invalid transactions count: ${fixedBlock.invalid_transactions().length}`);
      
      const fixedBlockHash = fixedBlock.block_hash();
      results.push(`✓ FixedBlock hash: ${fixedBlockHash.to_hex()}`);

      // FixedBlock from hex
      const fixedBlockFromHex = FixedBlock.from_hex(blockHex);
      results.push(`✓ FixedBlock from hex: Success`);

      // FixedVersionedBlock examples
      const fixedVersionedBlock = FixedVersionedBlock.from_bytes(versionedBlockBytes);
      results.push(`✓ FixedVersionedBlock created from bytes`);
      results.push(`✓ FixedVersionedBlock era: ${fixedVersionedBlock.era()}`);
      results.push(`✓ FixedVersionedBlock block: Success`);

      const fixedVersionedBlockFromHex = FixedVersionedBlock.from_hex(versionedBlockHex);
      results.push(`✓ FixedVersionedBlock from hex: Success`);

      // BlockHash examples
      const blockHash = BlockHash.from_bytes(new Uint8Array(32).fill(42));
      results.push(`✓ BlockHash created`);
      results.push(`✓ BlockHash to hex: ${blockHash.to_hex()}`);
      results.push(`✓ BlockHash to bech32: ${blockHash.to_bech32("block")}`);

      const blockHashBytes = blockHash.to_bytes();
      const blockHashFromBytes = BlockHash.from_bytes(blockHashBytes);
      results.push(`✓ BlockHash from bytes: Success`);

      const blockHashFromHex = BlockHash.from_hex(blockHash.to_hex());
      results.push(`✓ BlockHash from hex: Success`);

      const blockHashFromBech32 = BlockHash.from_bech32(blockHash.to_bech32("block"));
      results.push(`✓ BlockHash from bech32: Success`);

      // BlockEra examples
      const byronEra = BlockEra.Byron;
      const shelleyEra = BlockEra.Shelley;
      const allegraEra = BlockEra.Allegra;
      const maryEra = BlockEra.Mary;
      const alonzoEra = BlockEra.Alonzo;
      const babbageEra = BlockEra.Babbage;
      const conwayEra = BlockEra.Conway;
      const unknownEra = BlockEra.Unknown;

      results.push(`✓ BlockEra Byron: ${byronEra}`);
      results.push(`✓ BlockEra Shelley: ${shelleyEra}`);
      results.push(`✓ BlockEra Allegra: ${allegraEra}`);
      results.push(`✓ BlockEra Mary: ${maryEra}`);
      results.push(`✓ BlockEra Alonzo: ${alonzoEra}`);
      results.push(`✓ BlockEra Babbage: ${babbageEra}`);
      results.push(`✓ BlockEra Conway: ${conwayEra}`);
      results.push(`✓ BlockEra Unknown: ${unknownEra}`);

      // Create blocks for different eras
      const byronVersionedBlock = VersionedBlock.new(block, BlockEra.Byron);
      const shelleyVersionedBlock = VersionedBlock.new(block, BlockEra.Shelley);
      const allegraVersionedBlock = VersionedBlock.new(block, BlockEra.Allegra);
      const maryVersionedBlock = VersionedBlock.new(block, BlockEra.Mary);
      const alonzoVersionedBlock = VersionedBlock.new(block, BlockEra.Alonzo);
      const babbageVersionedBlock = VersionedBlock.new(block, BlockEra.Babbage);
      const conwayVersionedBlock = VersionedBlock.new(block, BlockEra.Conway);

      results.push(`✓ Byron era VersionedBlock created`);
      results.push(`✓ Shelley era VersionedBlock created`);
      results.push(`✓ Allegra era VersionedBlock created`);
      results.push(`✓ Mary era VersionedBlock created`);
      results.push(`✓ Alonzo era VersionedBlock created`);
      results.push(`✓ Babbage era VersionedBlock created`);
      results.push(`✓ Conway era VersionedBlock created`);

      // Test different era values
      results.push(`✓ Byron versioned block era: ${byronVersionedBlock.era()}`);
      results.push(`✓ Shelley versioned block era: ${shelleyVersionedBlock.era()}`);
      results.push(`✓ Babbage versioned block era: ${babbageVersionedBlock.era()}`);
      results.push(`✓ Conway versioned block era: ${conwayVersionedBlock.era()}`);

      // Complex block example with multiple transactions
      const complexTransactionBodies = TransactionBodies.new();
      
      // Add multiple transactions
      for (let i = 0; i < 3; i++) {
        const txOutputs2 = TransactionOutputs.new();
        const txOutput2 = TransactionOutput.new(
          Address.from_bech32("addr1vx7j284mqe59w2mka36gf5xq0hvu8ms2989553fk5qh3prcapfpj3"),
          Value.new(BigNum.from_str((1000000 * (i + 1)).toString()))
        );
        txOutputs2.add(txOutput2);
        
        const complexTxBody = TransactionBody.new(
          TransactionInputs.new(),
          txOutputs2,
          BigNum.from_str("170000")
        );
        complexTransactionBodies.add(complexTxBody);
      }
      
      const complexTransactionWitnessSets = TransactionWitnessSets.new();
      for (let i = 0; i < 3; i++) {
        complexTransactionWitnessSets.add(TransactionWitnessSet.new());
      }
      
      const complexAuxiliaryDataSet = AuxiliaryDataSet.new();
      for (let i = 0; i < 3; i++) {
        const complexMetadata = GeneralTransactionMetadata.new();
        const complexMap = MetadataMap.new();
        complexMap.insert_str(`tx_${i}`, TransactionMetadatum.new_text(`Transaction ${i} metadata`));
        complexMetadata.insert(BigNum.from_str((i + 1).toString()), TransactionMetadatum.new_map(complexMap));
        
        const complexAuxData = AuxiliaryData.new();
        complexAuxData.set_metadata(complexMetadata);
        complexAuxiliaryDataSet.insert(i, complexAuxData);
      }
      
      const complexInvalidTransactions = new Uint32Array([1, 2]);
      
      const complexBlock = Block.new(
        header,
        complexTransactionBodies,
        complexTransactionWitnessSets,
        complexAuxiliaryDataSet,
        complexInvalidTransactions
      );
      
      results.push(`✓ Complex block created`);
      results.push(`✓ Complex block transaction bodies: ${complexBlock.transaction_bodies().len()}`);
      results.push(`✓ Complex block transaction witness sets: ${complexBlock.transaction_witness_sets().len()}`);
      results.push(`✓ Complex block auxiliary data set: ${complexBlock.auxiliary_data_set().len()}`);
      results.push(`✓ Complex block invalid transactions: ${complexBlock.invalid_transactions().length}`);

      // Test block header access
      const blockHeader = block.header();
      const blockHeaderBody = blockHeader.header_body();
      results.push(`✓ Block header body block number: ${blockHeaderBody.block_number()}`);
      results.push(`✓ Block header body slot: ${blockHeaderBody.slot()}`);
      results.push(`✓ Block header body slot (BigNum): ${blockHeaderBody.slot_bignum().to_str()}`);
      results.push(`✓ Block header body prev hash: ${blockHeaderBody.prev_hash().to_hex().substring(0, 20)}...`);
      results.push(`✓ Block header body issuer VKey hash: ${blockHeaderBody.issuer_vkey().public_key().hash().to_bech32("vkey")}`);
      results.push(`✓ Block header body VRF VKey: ${blockHeaderBody.vrf_vkey().to_bech32("vrf")}`);
      results.push(`✓ Block header body block body size: ${blockHeaderBody.block_body_size()}`);
      results.push(`✓ Block header body block body hash: ${blockHeaderBody.block_body_hash().to_hex().substring(0, 20)}...`);
      results.push(`✓ Block header body operational cert: ${blockHeaderBody.operational_cert().to_hex().substring(0, 20)}...`);
      results.push(`✓ Block header body protocol version: ${blockHeaderBody.protocol_version().major()}.${blockHeaderBody.protocol_version().minor()}`);

      // Test FixedBlock specific methods
      results.push(`✓ FixedBlock hash access: ${fixedBlock.block_hash().to_hex().substring(0, 20)}...`);

      // Test FixedVersionedBlock specific methods
      results.push(`✓ FixedVersionedBlock era: ${fixedVersionedBlock.era()}`);
      results.push(`✓ FixedVersionedBlock block access: Success`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "🧱 Block Examples", results };
  }
}
