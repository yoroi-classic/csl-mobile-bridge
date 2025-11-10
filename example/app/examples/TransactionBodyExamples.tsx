import React from 'react';
import { 
  TransactionBody,
  TransactionInputs,
  TransactionOutputs,
  TransactionInput,
  TransactionOutput,
  Value,
  BigNum,
  Address,
  Certificate,
  Certificates,
  Withdrawals,
  RewardAddress,
  Credential,
  Ed25519KeyHash,
  AuxiliaryData,
  GeneralTransactionMetadata,
  TransactionMetadatum,
  MetadataMap,
  Mint,
  AssetName,
  ScriptHash,
  PlutusData,
  Int,
  NetworkId,
  Ed25519KeyHashes,
  TransactionHash,
  MintAssets,
  StakeRegistration,
  hash_auxiliary_data,
  hash_plutus_data
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class TransactionBodyExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Create basic components
      const inputs = TransactionInputs.new();
      const outputs = TransactionOutputs.new();
      const fee = BigNum.from_str("170000");
      
      // Create input
      const txHash = "fd656fb1f4cf6fbbc36f2705568a4d3b7a970ec0b39f80cc81e1293626b77316";
      const txInput = TransactionInput.new(
        TransactionHash.from_hex(txHash),
        0
      );
      inputs.add(txInput);
      
      // Create output
      const address = Address.from_bech32("addr1vx7j284mqe59w2mka36gf5xq0hvu8ms2989553fk5qh3prcapfpj3");
      const value = Value.new(BigNum.from_str("1000000"));
      const txOutput = TransactionOutput.new(address, value);
      outputs.add(txOutput);
      
      // Create basic TransactionBody
      const txBody = TransactionBody.new(
        inputs,
        outputs,
        fee
      );
      
      results.push(`✓ Basic TransactionBody created`);
      results.push(`✓ Inputs count: ${txBody.inputs().len()}`);
      results.push(`✓ Outputs count: ${txBody.outputs().len()}`);
      results.push(`✓ Fee: ${txBody.fee().to_str()} lovelace`);
      results.push(`✓ TTL: ${txBody.ttl()}`);
      results.push(`✓ Validity start interval: ${txBody.validity_start_interval()}`);

      // TransactionBody with certificates
      const certificates = Certificates.new();
      const stakeCredential = Credential.from_keyhash(
        Ed25519KeyHash.from_bytes(new Uint8Array(32).fill(2))
      );
      const rewardAddress = RewardAddress.new(0, stakeCredential);
      const certificate = Certificate.new_stake_registration(StakeRegistration.new(stakeCredential));
      certificates.add(certificate);
      
      const txBodyWithCerts = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithCerts.set_certs(certificates);
      results.push(`✓ TransactionBody with certificates created`);
      results.push(`✓ Certificates count: ${txBodyWithCerts.certs().len()}`);

      // TransactionBody with withdrawals
      const withdrawals = Withdrawals.new();
      withdrawals.insert(
        rewardAddress,
        BigNum.from_str("500000")
      );
      
      const txBodyWithWithdrawals = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithWithdrawals.set_withdrawals(withdrawals);
      results.push(`✓ TransactionBody with withdrawals created`);
      results.push(`✓ Withdrawals count: ${txBodyWithWithdrawals.withdrawals().len()}`);

      // TransactionBody with auxiliary data
      const metadata = GeneralTransactionMetadata.new();
      const map = MetadataMap.new();
      map.insert_str("key", TransactionMetadatum.new_text("value"));
      metadata.insert(BigNum.from_str("1"), TransactionMetadatum.new_map(map));

      const auxiliaryData = AuxiliaryData.new();
      auxiliaryData.set_metadata(metadata);

      const txBodyWithAuxData = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithAuxData.set_auxiliary_data_hash(
        hash_auxiliary_data(auxiliaryData)
      )
      results.push(`✓ TransactionBody with auxiliary data hash created`);
      results.push(`✓ Auxiliary data hash present: ${txBodyWithAuxData.auxiliary_data_hash() !== null}`);

      // TransactionBody with validity interval
      const validityStart = 1000000;
      const ttl = 2000000;
      
      const txBodyWithValidity = TransactionBody.new(
        inputs,
        outputs,
        fee,
        ttl
      );
      txBodyWithValidity.set_validity_start_interval(validityStart)
      results.push(`✓ TransactionBody with validity interval created`);
      results.push(`✓ Validity start: ${txBodyWithValidity.validity_start_interval()}`);
      results.push(`✓ TTL: ${txBodyWithValidity.ttl()}`);

      // TransactionBody with mint
      const mint = Mint.new();
      const assets = MintAssets.new();
      const assetName = AssetName.new(new TextEncoder().encode("TestToken"));
      assets.insert(assetName, Int.from_str("100"));
      mint.insert(ScriptHash.from_bytes(new Uint8Array(28).fill(3)), assets);

      const txBodyWithMint = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithMint.set_mint(mint);
      results.push(`✓ TransactionBody with mint created`);
      results.push(`✓ Mint present: ${txBodyWithMint.mint() !== null}`);

      // TransactionBody with script data hash
      const plutusData = PlutusData.new_empty_constr_plutus_data(BigNum.from_str("0"));
      const scriptDataHash = hash_plutus_data(plutusData);
      
      const txBodyWithScriptData = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithScriptData.set_script_data_hash(scriptDataHash);
      results.push(`✓ TransactionBody with script data hash created`);
      results.push(`✓ Script data hash: ${txBodyWithScriptData.script_data_hash().to_hex()}`);

      // TransactionBody with required signers
      const requiredSigners = Ed25519KeyHashes.new();
      const keyHash = Ed25519KeyHash.from_bytes(new Uint8Array(32).fill(4));
      requiredSigners.add(keyHash);
      
      const txBodyWithSigners = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithSigners.set_required_signers(requiredSigners);
      results.push(`✓ TransactionBody with required signers created`);
      results.push(`✓ Required signers count: ${txBodyWithSigners.required_signers().len()}`);

      // TransactionBody with network id
      const networkId = NetworkId.testnet();
      
      const txBodyWithNetwork = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithNetwork.set_network_id(networkId);
      results.push(`✓ TransactionBody with network ID created`);
      results.push(`✓ Network ID: ${txBodyWithNetwork.network_id().kind()}`);
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "📄 TransactionBody Examples", results };
  }
}
