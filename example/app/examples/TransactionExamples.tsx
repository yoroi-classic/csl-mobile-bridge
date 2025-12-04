import React from 'react';
import {
  TransactionBuilder,
  TransactionBuilderConfigBuilder,
  TransactionOutput,
  TransactionInput,
  TransactionHash,
  Value,
  Credential,
  LinearFee,
  BigNum,
  AuxiliaryData,
  GeneralTransactionMetadata,
  ByronAddress,
  ExUnitPrices,
  UnitInterval,
  Ed25519KeyHash,
  StakeRegistration,
  Certificate,
  Address,
  Certificates,
  Withdrawals,
  RewardAddress
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

// Helper function to validate expected vs actual values
function validate<T>(results: string[], name: string, expected: T, actual: T): void {
  if (expected === actual) {
    results.push(`✓ ${name}: expected ${expected}, actual: ${actual}`);
  } else {
    results.push(`❌ Error: ${name}: expected ${expected}, actual: ${actual}`);
  }
}

export default class TransactionExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      const coeffStr = '44';
      const constStr = '155381';
      const coeff = BigNum.from_str(coeffStr);
      const constant = BigNum.from_str(constStr);
      const fee = LinearFee.new(coeff, constant);
      const poolDepositStr = '2000000';
      const keyDepositStr = '3000000';
      const poolDeposit = BigNum.from_str(poolDepositStr);
      const keyDeposit = BigNum.from_str(keyDepositStr);
      const ed25519KeyHashHex = '0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf';
      const ed25519KeyHash = Ed25519KeyHash.from_hex(ed25519KeyHashHex);

      const stakeCred = Credential.from_keyhash(ed25519KeyHash);
      const stakeReg = StakeRegistration.new(stakeCred);
      const cert = Certificate.new_stake_registration(stakeReg);

      const txHashHex = '0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf3ce41cbf';
      const txHash = TransactionHash.from_hex(txHashHex);
      const txInput = TransactionInput.new(txHash, 0);
      const txInput2 = TransactionInput.new(txHash, 1);

      const addrBase58 = 'Ae2tdPwUPEZHu3NZa6kCwet2msq4xrBXKHBDvogFKwMsF18Jca8JHLRBas7';
      const byronAddress = ByronAddress.from_base58(addrBase58);
      validate(results, "Byron address from base58", addrBase58, byronAddress.to_base58());

      const baseAddrHex =
        '00' +
        '0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf' +
        '0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf';
      const outputAmountStr = '1000000';
      const amount = Value.new(BigNum.from_str(outputAmountStr));
      const recipientAddr = Address.from_hex(baseAddrHex);
      const txOutput = TransactionOutput.new(recipientAddr, amount);

      const certs = Certificates.new();
      certs.add(cert);
      const memPriceNum = '11';
      const memPriceDen = '333';
      const memPrice = UnitInterval.new(
        BigNum.from_str(memPriceNum),
        BigNum.from_str(memPriceDen),
      );

      const stepPriceNum = '77';
      const stepPriceDen = '999';
      const stepPrice = UnitInterval.new(
        BigNum.from_str(stepPriceNum),
        BigNum.from_str(stepPriceDen),
      );

      const coinsPerUtxoByteStr = '11';
      const maxValueSize = 7000;
      const maxTxSize = 888888;

      let configBuilder = TransactionBuilderConfigBuilder.new();
      configBuilder = configBuilder.fee_algo(fee);
      configBuilder = configBuilder.coins_per_utxo_byte(
        BigNum.from_str(coinsPerUtxoByteStr),
      );
      configBuilder = configBuilder.ex_unit_prices(
        ExUnitPrices.new(memPrice, stepPrice),
      );
      configBuilder = configBuilder.pool_deposit(poolDeposit);
      configBuilder = configBuilder.key_deposit(keyDeposit);
      configBuilder = configBuilder.max_value_size(maxValueSize);
      configBuilder = configBuilder.max_tx_size(maxTxSize);
      const config = configBuilder.build();

      const txBuilder = TransactionBuilder.new(config);

      const inputValueStr = '1000000';
      txBuilder.add_key_input(
        ed25519KeyHash,
        txInput,
        Value.new(BigNum.from_str(inputValueStr)),
      );
      txBuilder.add_bootstrap_input(
        byronAddress,
        txInput2,
        Value.new(BigNum.from_str(inputValueStr)),
      );
      txBuilder.add_output(txOutput);

      const TTL = 10;

      // add an empty metadata object
      const metadata = GeneralTransactionMetadata.new();
      const auxiliaryData = AuxiliaryData.new();
      auxiliaryData.set_metadata(metadata);
      txBuilder.set_auxiliary_data(auxiliaryData);

      const explicitIn = txBuilder.get_explicit_input();
      const explicitInCoin = explicitIn.coin();
      const expectedExplicitInputStr = '2000000'; // 2 inputs of 1000000 each
      validate(results, "TransactionBuilder explicit input", expectedExplicitInputStr, explicitInCoin.to_str());

      const implicitIn = txBuilder.get_implicit_input();
      const implicitInCoin = implicitIn.coin();
      validate(results, "TransactionBuilder implicit input", '0', implicitInCoin.to_str());

      const explicitOut = txBuilder.get_explicit_output();
      const explicitOutCoin = explicitOut.coin();
      validate(results, "TransactionBuilder explicit output", outputAmountStr, explicitOutCoin.to_str());

      const changeAddrHex =
        '00' +
        '0000b04c3aa051f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf' +
        '0000b03c3aa052f51c084c54bd4059ead2d2e426ac89fa4b3ce41cbf';
      const change = Address.from_hex(changeAddrHex);
      const changeAdded = txBuilder.add_change_if_needed(change);
      validate(results, "TransactionBuilder change added", true, changeAdded);

      const txFromBuilder = txBuilder.build_tx();
      let txBodyFromBuilder = txFromBuilder.body();
      const txWitnessSet = txFromBuilder.witness_set();

      results.push(`✓ Transaction built successfully`);
      validate(results, "Transaction witness set not empty", true, txWitnessSet.to_hex().length > 0);

      const minFee = txBuilder.min_fee().to_str();
      results.push(`✓ TransactionBuilder min fee: ${minFee} lovelace`);

      const deposit = txBuilder.get_deposit().to_str();
      validate(results, "TransactionBuilder deposit", '0', deposit);

      const feeIfSet = txBuilder.get_fee_if_set();
      validate(results, "TransactionBuilder fee if set present", true, feeIfSet !== null);

      txBuilder.set_certs(certs);

      const feeForOutput = (
        txBuilder.fee_for_output(
          TransactionOutput.new(
            Address.from_hex(baseAddrHex),
            Value.new(BigNum.from_str((0x100000000).toString())),
          ),
        )
      ).to_str();
      results.push(`✓ TransactionBuilder fee for output: ${feeForOutput} lovelace`);

      // ------------------------------------------------
      // -------------- TransactionInputs ---------------
      const inputs = txBodyFromBuilder.inputs();
      validate(results, "TransactionInputs count", 2, inputs.len());
      const input = inputs.get(0);
      results.push(`✓ TransactionInput retrieved: ${input.to_hex().substring(0, 30)}...`);

      // ------------------------------------------------
      // -------------- TransactionOutputs --------------
      const outputs = txBodyFromBuilder.outputs();
      validate(results, "TransactionOutputs count", 2, outputs.len()); // output + change
      const output = outputs.get(0);
      validate(results, "Output amount", outputAmountStr, output.amount().coin().to_str());

      // ------------------------------------------------
      // ------------------ Withdrawals -----------------
      const withdrawals = Withdrawals.new();
      validate(results, "Withdrawals initial count", 0, withdrawals.len());

      const withdrawalAddrBech32 = 'addr1u8pcjgmx7962w6hey5hhsd502araxp26kdtgagakhaqtq8sxy9w7g';
      const withdrawalAddr = RewardAddress.from_address(
        Address.from_bech32(withdrawalAddrBech32),
      )!;

      const withdrawalAmountStr = '10000000';
      const _oldAmount = withdrawals.insert(
        withdrawalAddr,
        BigNum.from_str(withdrawalAmountStr),
      );
      validate(results, "Withdrawals insert returned null (first insert)", true, _oldAmount === null);
      validate(results, "Withdrawals count after insert", 1, withdrawals.len());
      validate(results, "Withdrawals get returns value", true, withdrawals.get(withdrawalAddr) !== null);
      validate(results, "Withdrawals amount", withdrawalAmountStr, withdrawals.get(withdrawalAddr)?.to_str());

      const randomAddr = RewardAddress.from_address(
        Address.from_bech32(
          'addr1uyvxhwsjarwzr67sutmer7dplwx0jl2czzsp8cvku0wjftgtt8ge9',
        ),
      )!;
      validate(results, "Withdrawals get for non-existent address", true, withdrawals.get(randomAddr) === null);
      validate(results, "Withdrawals keys count", 1, withdrawals.keys().len());

      // ------------------------------------------------
      // --------------- TransactionBody ----------------
      txBuilder.set_certs(certs);
      txBuilder.set_withdrawals(withdrawals);
      txBuilder.set_ttl(TTL);

      // re-generate tx body
      txBodyFromBuilder = txBuilder.build();

      const feeFromTxBody = txBodyFromBuilder.fee();
      results.push(`✓ TransactionBody fee: ${feeFromTxBody.to_str()} lovelace`);

      const withdrawalsFromTxBody = txBodyFromBuilder.withdrawals()!;
      validate(results, "TransactionBody withdrawals amount", withdrawalAmountStr, withdrawalsFromTxBody.get(withdrawalAddr)?.to_str());

      const certsFromTxBody = txBodyFromBuilder.certs();
      validate(results, "TransactionBody certificates count", 1, certsFromTxBody?.len());

      validate(results, "TransactionBody TTL", TTL, txBodyFromBuilder.ttl());
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "📋 Transaction Examples", results };
  }
}
