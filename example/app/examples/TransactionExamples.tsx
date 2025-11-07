import React from 'react';
import { 
  Transaction,
  TransactionBody,
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  TransactionOutput,
  TransactionInput,
  TransactionHash,
  Value,
  BaseAddress,
  Credential,
  PrivateKey,
  LinearFee,
  BigNum,
  TransactionWitnessSet,
  Vkeywitnesses,
  Vkeywitness,
  BootstrapWitnesses,
  BootstrapWitness,
  NativeScripts,
  PlutusScripts,
  PlutusData,
  PlutusList,
  AuxiliaryData,
  GeneralTransactionMetadata,
  TransactionMetadatum,
  MetadataMap,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  FixedTransaction,
  FixedTransactionBodies,
  FixedTransactionBody,
  FixedTxWitnessesSet,
  FixedVersionedBlock,
  FixedBlock,
  VersionedBlock,
  Block,
  Header,
  HeaderBody,
  TransactionBodies,
  TransactionWitnessSets,
  AuxiliaryDataSet,
  Ed25519Signature,
  Vkey,
  Bip32PrivateKey,
  ByronAddress,
  LegacyDaedalusPrivateKey,
  make_vkey_witness,
  make_icarus_bootstrap_witness,
  make_daedalus_bootstrap_witness,
  min_fee,
  hash_auxiliary_data
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class TransactionExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Create transaction builder config
      const linearFee = LinearFee.new(BigNum.from_str("44"), BigNum.from_str("155381"));
      const configBuilder = TransactionBuilderConfigBuilder.new();
      configBuilder.fee_algo(linearFee);
      configBuilder.coins_per_utxo_byte(BigNum.from_str("44"));
      const config = configBuilder.build();

      // Create transaction builder
      const txBuilder = TransactionBuilder.new(config);

      // Create inputs and outputs
      const txHash = TransactionHash.from_bytes(new Uint8Array(32).fill(0));
      const txInput = TransactionInput.new(txHash, 0);
      
      const privateKey = PrivateKey.generate_ed25519();
      const publicKey = privateKey.to_public();
      const keyHash = publicKey.hash();
      const paymentCredential = Credential.from_keyhash(keyHash);
      const baseAddress = BaseAddress.new(0, paymentCredential, paymentCredential);
      const address = baseAddress.to_address();

      const value = Value.new(BigNum.from_str("1000000"));
      const txOutput = TransactionOutput.new(address, value);

      // Add input and output
      txBuilder.add_regular_input(address, txInput, value);
      txBuilder.add_output(txOutput);

      // Build transaction
      const txBody = txBuilder.build();
      const tx = Transaction.new(txBody, txBuilder.build_tx().witness_set());

      results.push(`✓ Transaction built successfully`);
      results.push(`✓ Transaction hash: ${txBody.to_json()}`);
      results.push(`✓ Transaction inputs: ${txBody.inputs().len()}`);
      results.push(`✓ Transaction outputs: ${txBody.outputs().len()}`);
      results.push(`✓ Transaction fee: ${txBody.fee().to_str()} lovelace`);

      // Transaction serialization
      const txBytes = tx.to_bytes();
      results.push(`✓ Transaction size: ${txBytes.length} bytes`);

      const txHex = tx.to_hex();
      results.push(`✓ Transaction hex length: ${txHex.length} characters`);

      const txFromHex = Transaction.from_hex(txHex);
      results.push(`✓ Transaction from hex: Success`);

      // Transaction with auxiliary data
      const metadata = GeneralTransactionMetadata.new();
      const map = MetadataMap.new();
      map.insert_str("note", TransactionMetadatum.new_text("Test transaction"));
      metadata.insert(BigNum.from_str("1"), TransactionMetadatum.new_map(map));
      
      const auxData = AuxiliaryData.new();
      auxData.set_metadata(metadata);
      
      const txWithAux = Transaction.new(txBody, txBuilder.build_tx().witness_set(), auxData);
      results.push(`✓ Transaction with auxiliary data created`);
      results.push(`✓ Has auxiliary data: ${txWithAux.auxiliary_data() !== null}`);

      // Transaction witness set
      const witnessSet = TransactionWitnessSet.new();
      const vkeywitnesses = Vkeywitnesses.new();
      const vkey = Vkey.new(publicKey);
      const signature = Ed25519Signature.from_bytes(new Uint8Array(64).fill(1));
      const vkeywitness = Vkeywitness.new(vkey, signature);
      vkeywitnesses.add(vkeywitness);
      witnessSet.set_vkeys(vkeywitnesses);
      
      const txWithWitnesses = Transaction.new(txBody, witnessSet);
      results.push(`✓ Transaction with witness set created`);
      results.push(`✓ Vkey witnesses count: ${txWithWitnesses.witness_set().vkeys().len()}`);

      // Transaction validity
      results.push(`✓ Transaction is valid: ${tx.is_valid()}`);
      
      const invalidTx = Transaction.new(txBody, witnessSet);
      invalidTx.set_is_valid(false);
      results.push(`✓ Invalid transaction is valid: ${invalidTx.is_valid()}`);

      // Transaction JSON conversion
      const txJson = tx.to_json();
      const txFromJson = Transaction.from_json(txJson);
      results.push(`✓ Transaction from JSON: Success`);
      results.push(`✓ Transaction JSON length: ${txJson.length} characters`);

      // Transaction body operations
      results.push(`✓ Transaction body fee: ${tx.body().fee().to_str()}`);
      results.push(`✓ Transaction body TTL: ${tx.body().ttl()}`);
      results.push(`✓ Transaction body inputs: ${tx.body().inputs().len()}`);
      results.push(`✓ Transaction body outputs: ${tx.body().outputs().len()}`);

      // Transaction builder additional features
      txBuilder.set_ttl(1000000);
      txBuilder.set_validity_start_interval(500000);
      results.push(`✓ Transaction builder with TTL and validity start`);

      // Transaction builder with metadata
      txBuilder.add_metadatum(BigNum.from_str("2"), TransactionMetadatum.new_text("Builder metadata"));
      results.push(`✓ Added metadata to transaction builder`);

      // Transaction builder with JSON metadata
      txBuilder.add_json_metadatum(BigNum.from_str("3"), '{"key": "value"}');
      results.push(`✓ Added JSON metadata to transaction builder`);

      // Transaction Unspent Output
      const utxo = TransactionUnspentOutput.new(txInput, txOutput);
      results.push(`✓ Transaction unspent output created`);
      results.push(`✓ UTXO input index: ${utxo.input().index()}`);
      results.push(`✓ UTXO output address: ${utxo.output().address().to_bech32()}`);

      // Transaction Unspent Outputs
      const utxos = TransactionUnspentOutputs.new();
      utxos.add(utxo);
      results.push(`✓ Transaction unspent outputs created`);
      results.push(`✓ UTXOs count: ${utxos.len()}`);

      // UTXO JSON conversion
      const utxosJson = utxos.to_json();
      const utxosFromJson = TransactionUnspentOutputs.from_json(utxosJson);
      results.push(`✓ UTXOs from JSON: Success`);

      // Fixed Transaction
      const fixedTx = FixedTransaction.new(txBody.to_bytes(), witnessSet.to_bytes(), true);
      results.push(`✓ Fixed transaction created`);
      results.push(`✓ Fixed transaction is valid: ${fixedTx.is_valid()}`);
      results.push(`✓ Fixed transaction body hash: ${fixedTx.transaction_hash().to_hex()}`);

      // Fixed Transaction with auxiliary data
      const fixedTxWithAux = FixedTransaction.new_with_auxiliary(
        txBody.to_bytes(),
        witnessSet.to_bytes(),
        auxData.to_bytes(),
        true
      );
      results.push(`✓ Fixed transaction with auxiliary data created`);
      results.push(`✓ Has auxiliary data: ${fixedTxWithAux.auxiliary_data() !== null}`);

      // Fixed Transaction from body bytes
      const fixedTxFromBody = FixedTransaction.new_from_body_bytes(txBody.to_bytes());
      results.push(`✓ Fixed transaction from body bytes created`);

      // Fixed Transaction Bodies
      const fixedTxBodies = FixedTransactionBodies.new();
      const fixedTxBody = FixedTransactionBody.from_bytes(txBody.to_bytes());
      fixedTxBodies.add(fixedTxBody);
      results.push(`✓ Fixed transaction bodies created`);
      results.push(`✓ Fixed bodies count: ${fixedTxBodies.len()}`);

      // Fixed Transaction Witness Set
      const fixedWitnessSet = FixedTxWitnessesSet.from_bytes(witnessSet.to_bytes());
      results.push(`✓ Fixed transaction witness set created`);
      results.push(`✓ Fixed witness set Vkeys count: ${fixedWitnessSet.tx_witnesses_set().vkeys().len()}`);

      // Fixed Versioned Block
      const fixedBlock = FixedBlock.from_bytes(new Uint8Array(100).fill(2));
      const fixedVersionedBlock = FixedVersionedBlock.from_bytes(new Uint8Array(100).fill(3));
      results.push(`✓ Fixed block created`);
      results.push(`✓ Fixed versioned block created`);
      results.push(`✓ Fixed versioned block era: ${fixedVersionedBlock.era()}`);

      // Versioned Block
      const versionedBlock = VersionedBlock.new(Block.from_bytes(new Uint8Array(100).fill(4)), 2);
      results.push(`✓ Versioned block created`);
      results.push(`✓ Versioned block era: ${versionedBlock.era()}`);
      results.push(`✓ Versioned block bytes length: ${versionedBlock.to_bytes().length}`);

      // Block and Header
      const headerBody = HeaderBody.from_bytes(new Uint8Array(100).fill(5));
      const header = Header.new(headerBody, Ed25519Signature.from_bytes(new Uint8Array(64).fill(6)));
      const block = Block.new(header, TransactionBodies.new(), TransactionWitnessSets.new(), AuxiliaryDataSet.new(), "");
      results.push(`✓ Block created`);
      results.push(`✓ Block header body slot: ${block.header().header_body().slot()}`);

      // Witness creation functions
      const txBodyHash = txBody.to_bytes(); // Simplified for example
      const vkeyWitness = make_vkey_witness(TransactionHash.from_bytes(txBodyHash), privateKey);
      results.push(`✓ Vkey witness created`);
      results.push(`✓ Vkey witness signature hex: ${vkeyWitness.signature().to_hex()}`);

      // Bootstrap witness creation
      const byronPrivateKey = Bip32PrivateKey.generate_ed25519_bip32();
      const byronAddress = ByronAddress.icarus_from_key(byronPrivateKey.to_public(), 764824073);
      const icarusWitness = make_icarus_bootstrap_witness(TransactionHash.from_bytes(txBodyHash), byronAddress, byronPrivateKey);
      results.push(`✓ Icarus bootstrap witness created`);
      results.push(`✓ Bootstrap witness chain code length: ${icarusWitness.chain_code().length}`);

      const daedalusKey = LegacyDaedalusPrivateKey.from_bytes(new Uint8Array(64).fill(7));
      const daedalusWitness = make_daedalus_bootstrap_witness(TransactionHash.from_bytes(txBodyHash), byronAddress, daedalusKey);
      results.push(`✓ Daedalus bootstrap witness created`);

      // Fee calculation
      const minFee = min_fee(tx, linearFee);
      results.push(`✓ Minimum fee: ${minFee.to_str()} lovelace`);

      // Auxiliary data hashing
      const auxDataHash = hash_auxiliary_data(auxData);
      results.push(`✓ Auxiliary data hash: ${auxDataHash.to_hex()}`);

      // Transaction builder advanced features
      const advancedBuilder = TransactionBuilder.new(config);
      advancedBuilder.add_inputs_from(utxos, 1);
      advancedBuilder.add_output(txOutput);
      
      // Add change if needed
      const changeAdded = advancedBuilder.add_change_if_needed(address);
      results.push(`✓ Change added: ${changeAdded}`);

      // Calculate minimum fee
      const builderMinFee = advancedBuilder.min_fee();
      results.push(`✓ Builder minimum fee: ${builderMinFee.to_str()} lovelace`);

      // Build full transaction
      const fullTx = advancedBuilder.build_tx();
      results.push(`✓ Full transaction built`);
      results.push(`✓ Full transaction size: ${fullTx.to_bytes().length} bytes`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "📋 Transaction Examples", results };
  }
}
