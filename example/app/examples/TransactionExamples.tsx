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
  RewardAddress,
  RewardAddresses
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class TransactionExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      const coeffStr = '44';
      const constStr = '155381';
      const coeff = BigNum.from_str(coeffStr);
      const constant = BigNum.from_str(constStr);
      const fee = LinearFee.new(coeff, constant);
      const poolDeposit = BigNum.from_str('2000000');
      const keyDeposit = BigNum.from_str('3000000');
      const ed25519KeyHash = Ed25519KeyHash.from_hex('0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf');

      const stakeCred = Credential.from_keyhash(ed25519KeyHash);
      const stakeReg = StakeRegistration.new(stakeCred);
      const cert = Certificate.new_stake_registration(stakeReg);

      const txHash = TransactionHash.from_hex('0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf3ce41cbf');
      const txInput = TransactionInput.new(txHash, 0);
      const txInput2 = TransactionInput.new(txHash, 1);

      const addrBase58 = 'Ae2tdPwUPEZHu3NZa6kCwet2msq4xrBXKHBDvogFKwMsF18Jca8JHLRBas7';
      const byronAddress = ByronAddress.from_base58(addrBase58);

      const baseAddrHex =
        '00' +
        '0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf' +
        '0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf';
      const amount = Value.new(BigNum.from_str('1000000'));
      const recipientAddr = Address.from_hex(baseAddrHex);
      const txOutput = TransactionOutput.new(recipientAddr, amount);

      const certs = Certificates.new();
      certs.add(cert);
      const memPrice = UnitInterval.new(
        BigNum.from_str('11'),
        BigNum.from_str('333'),
      );

      const stepPrice = UnitInterval.new(
        BigNum.from_str('77'),
        BigNum.from_str('999'),
      );

      let configBuilder = TransactionBuilderConfigBuilder.new();
      configBuilder = configBuilder.fee_algo(fee);
      configBuilder = configBuilder.coins_per_utxo_byte(
        BigNum.from_str('11'),
      );
      configBuilder = configBuilder.ex_unit_prices(
        ExUnitPrices.new(memPrice, stepPrice),
      );
      configBuilder = configBuilder.pool_deposit(poolDeposit);
      configBuilder = configBuilder.key_deposit(keyDeposit);
      configBuilder = configBuilder.max_value_size(7000);
      configBuilder = configBuilder.max_tx_size(888888);
      const config = configBuilder.build();
      /**
       * TransactionBuilder
       */
      const txBuilder = TransactionBuilder.new(config);

      txBuilder.add_key_input(
        ed25519KeyHash,
        txInput,
        Value.new(BigNum.from_str('1000000')),
      );
      txBuilder.add_bootstrap_input(
        byronAddress,
        txInput2,
        Value.new(BigNum.from_str('1000000')),
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
      results.push(`✓ TransactionBuilder explicit input: ${explicitInCoin.to_str()} lovelace`);

      const implicitIn = txBuilder.get_implicit_input();
      const implicitInCoin = implicitIn.coin();
      results.push(`✓ TransactionBuilder implicit input: ${implicitInCoin.to_str()} lovelace`);

      const explicitOut = txBuilder.get_explicit_output();
      const explicitOutCoin = explicitOut.coin();
      results.push(`✓ TransactionBuilder explicit output: ${explicitOutCoin.to_str()} lovelace`);
      
      const changeAddrHex =
        '00' +
        '0000b04c3aa051f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf' +
        '0000b03c3aa052f51c084c54bd4059ead2d2e426ac89fa4b3ce41cbf';
      const change = Address.from_hex(changeAddrHex);
      const changeAdded = txBuilder.add_change_if_needed(change);
      results.push(`✓ TransactionBuilder change added: ${changeAdded}`);

      const txFromBuilder = txBuilder.build_tx();
      let txBodyFromBuilder = txFromBuilder.body();
      const txWitnessSet = txFromBuilder.witness_set();

      results.push(`✓ Transaction built successfully`);
      results.push(`✓ Transaction witness set: ${txWitnessSet.to_hex()}`);

      const minFee = txBuilder.min_fee().to_str();
      results.push(`✓ TransactionBuilder min fee: ${minFee} lovelace`);
      
      const deposit = txBuilder.get_deposit().to_str();
      results.push(`✓ TransactionBuilder deposit: ${deposit} lovelace`);
      
      const feeIfSet = txBuilder.get_fee_if_set();
      results.push(`✓ TransactionBuilder fee if set: ${feeIfSet ? feeIfSet.to_str() : 'null'} lovelace`);
      
      txBuilder.set_certs(certs);

      const feeForOutput = (
        txBuilder.fee_for_output(
          TransactionOutput.new(
            Address.from_hex(baseAddrHex),
            // largest possible CBOR value
            // note: this slightly over-estimates by a few bytes
            Value.new(BigNum.from_str((0x100000000).toString())),
          ),
        )
      ).to_str();
      results.push(`✓ TransactionBuilder fee for output: ${feeForOutput} lovelace`);

      // ------------------------------------------------
      // -------------- TransactionInputs ---------------
      const inputs = txBodyFromBuilder.inputs();
      results.push(`✓ TransactionInputs count: ${inputs.len()}`);
      const input = inputs.get(0);
      results.push(`✓ TransactionInput retrieved: ${input.to_hex()}`);

      // ------------------------------------------------
      // -------------- TransactionOutputs --------------
      const outputs = txBodyFromBuilder.outputs();
      results.push(`✓ TransactionOutputs count: ${outputs.len()}`);
      const output = outputs.get(0);
      results.push(`✓ TransactionOutput retrieved: ${output.to_hex()}`);

      // ------------------------------------------------
      // ------------------ Withdrawals -----------------
      const withdrawals = Withdrawals.new();
      results.push(`✓ Withdrawals initial count: ${withdrawals.len()}`);
      const withdrawalAddr = RewardAddress.from_address(
        Address.from_bech32(
          'addr1u8pcjgmx7962w6hey5hhsd502araxp26kdtgagakhaqtq8sxy9w7g',
        ),
      )!;
      // returns coin
      const _oldAmount = withdrawals.insert(
        withdrawalAddr,
        BigNum.from_str('10000000'),
      );
      results.push(`✓ Withdrawals insert returned: ${_oldAmount === null ? 'null' : 'value'}`);
      results.push(`✓ Withdrawals count after insert: ${withdrawals.len()}`);
      results.push(`✓ Withdrawals get returns: ${withdrawals.get(withdrawalAddr) !== null ? 'value' : 'null'}`);
      results.push(`✓ Withdrawals amount: ${withdrawals.get(withdrawalAddr)?.to_str() || 'null'} lovelace`);

      const randomAddr = RewardAddress.from_address(
        Address.from_bech32(
          'addr1uyvxhwsjarwzr67sutmer7dplwx0jl2czzsp8cvku0wjftgtt8ge9',
        ),
      )!;
      results.push(`✓ Withdrawals get for invalid address: ${withdrawals.get(randomAddr) === null ? 'null' : 'value'}`);
      results.push(`✓ Withdrawals keys count: ${withdrawals.keys().len()}`);

      // ------------------------------------------------
      // --------------- TransactionBody ----------------
      // addditional TransactionBody tests using previous
      // outputs
      txBuilder.set_certs(certs);
      txBuilder.set_withdrawals(withdrawals);
      txBuilder.set_ttl(TTL);

      // re-generate tx body
      txBodyFromBuilder = txBuilder.build();

      const feeFromTxBody = txBodyFromBuilder.fee();
      results.push(`✓ TransactionBody fee: ${feeFromTxBody.to_str()} lovelace`);

      const withdrawalsFromTxBody = txBodyFromBuilder.withdrawals()!;
      results.push(`✓ TransactionBody withdrawals amount: ${withdrawalsFromTxBody.get(withdrawalAddr)?.to_str() || 'null'} lovelace`);

      const certsFromTxBody = txBodyFromBuilder.certs();
      results.push(`✓ TransactionBody certificates count: ${certsFromTxBody?.len() || 0}`);
    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "📋 Transaction Examples", results };
  }
}
