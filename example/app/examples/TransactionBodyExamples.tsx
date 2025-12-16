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
  hash_script_data,
  PlutusList,
  Costmdls,
  Redeemers
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

export default class TransactionBodyExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      // Create basic components
      const inputs = TransactionInputs.new();
      const outputs = TransactionOutputs.new();
      const feeStr = "170000";
      const fee = BigNum.from_str(feeStr);

      // Create input
      const txHash = "fd656fb1f4cf6fbbc36f2705568a4d3b7a970ec0b39f80cc81e1293626b77316";
      const inputIndex = 0;
      const txInput = TransactionInput.new(
        TransactionHash.from_hex(txHash),
        inputIndex
      );
      inputs.add(txInput);

      // Create output
      const addressBech32 = "addr1vx7j284mqe59w2mka36gf5xq0hvu8ms2989553fk5qh3prcapfpj3";
      const outputValueStr = "10000000";
      const address = Address.from_bech32(addressBech32);
      const value = Value.new(BigNum.from_str(outputValueStr));
      const txOutput = TransactionOutput.new(address, value);
      outputs.add(txOutput);

      // Create basic TransactionBody
      const txBody = TransactionBody.new(
        inputs,
        outputs,
        fee
      );

      results.push(`✓ Basic TransactionBody created`);
      validate(results, "Inputs count", 1, txBody.inputs().len());
      validate(results, "Outputs count", 1, txBody.outputs().len());
      validate(results, "Fee", feeStr, txBody.fee().to_str());

      // TransactionBody with certificates
      const certificates = Certificates.new();
      const rewardAddressBech32 = "stake1u9zjr6e37w53a474puhx606ayr3rz2l6jljrmzvlzkk3cmg0m2zw0";
      const rewardAddress = RewardAddress.from_address(
        Address.from_bech32(rewardAddressBech32)
      );
      const stakeCredential = rewardAddress.payment_cred();
      const certificate = Certificate.new_stake_registration(StakeRegistration.new(stakeCredential));
      certificates.add(certificate);

      const txBodyWithCerts = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithCerts.set_certs(certificates);
      validate(results, "Certificates count", 1, txBodyWithCerts.certs().len());

      // TransactionBody with withdrawals
      const withdrawals = Withdrawals.new();
      const withdrawalAmountStr = "5000000";
      withdrawals.insert(
        rewardAddress,
        BigNum.from_str(withdrawalAmountStr)
      );

      const txBodyWithWithdrawals = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithWithdrawals.set_withdrawals(withdrawals);
      validate(results, "Withdrawals count", 1, txBodyWithWithdrawals.withdrawals().len());
      validate(results, "Withdrawal amount", withdrawalAmountStr, txBodyWithWithdrawals.withdrawals().get(rewardAddress).to_str());

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
      validate(results, "Auxiliary data hash present", true, txBodyWithAuxData.auxiliary_data_hash() !== null);

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
      validate(results, "Validity start interval", validityStart, txBodyWithValidity.validity_start_interval());
      validate(results, "TTL", ttl, txBodyWithValidity.ttl());

      // TransactionBody with mint
      const mint = Mint.new();
      const mintAssets = MintAssets.new();
      const assetName = AssetName.new(new TextEncoder().encode("TestToken"));
      const mintAmountStr = "100";
      mintAssets.insert(assetName, Int.from_str(mintAmountStr));
      const mintPolicyId = ScriptHash.from_bytes(new Uint8Array(28).fill(3));
      mint.insert(mintPolicyId, mintAssets);

      const txBodyWithMint = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithMint.set_mint(mint);
      validate(results, "Mint present", true, txBodyWithMint.mint() !== null);
      validate(results, "Mint policies count", 1, txBodyWithMint.mint().len());

      // TransactionBody with script data hash
      const plutusList = PlutusList.new()
      plutusList.add(PlutusData.new_empty_constr_plutus_data(BigNum.from_str("0")));
      const scriptDataHash = hash_script_data(Redeemers.new(), Costmdls.new(), plutusList);

      const txBodyWithScriptData = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithScriptData.set_script_data_hash(scriptDataHash);
      validate(results, "Script data hash present", true, txBodyWithScriptData.script_data_hash() !== null);
      results.push(`✓ Script data hash: ${txBodyWithScriptData.script_data_hash().to_hex().substring(0, 20)}...`);

      // TransactionBody with required signers
      const requiredSigners = Ed25519KeyHashes.new();
      const keyHashBytes = new Uint8Array(28).fill(4);
      const keyHash = Ed25519KeyHash.from_bytes(keyHashBytes);
      requiredSigners.add(keyHash);

      const txBodyWithSigners = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithSigners.set_required_signers(requiredSigners);
      validate(results, "Required signers count", 1, txBodyWithSigners.required_signers().len());

      // TransactionBody with network id
      const networkId = NetworkId.testnet();

      const txBodyWithNetwork = TransactionBody.new(
        inputs,
        outputs,
        fee,
      );
      txBodyWithNetwork.set_network_id(networkId);
      validate(results, "Network ID kind (testnet)", 0, txBodyWithNetwork.network_id().kind());

      // Test mainnet network id
      const mainnetId = NetworkId.mainnet();
      txBodyWithNetwork.set_network_id(mainnetId);
      validate(results, "Network ID kind (mainnet)", 1, txBodyWithNetwork.network_id().kind());
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "📄 TransactionBody Examples", results };
  }
}
