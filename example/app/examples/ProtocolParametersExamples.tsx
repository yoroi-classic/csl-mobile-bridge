import React from 'react';
import {
  ProtocolParamUpdate,
  UnitInterval,
  ExUnitPrices,
  ExUnits,
  CostModel,
  Costmdls,
  Language,
  BigNum
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

export default class ProtocolParametersExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];

    try {
      // Protocol Param Update
      const paramUpdate = ProtocolParamUpdate.new();

      // Set various parameters
      const minfeeAStr = "44";
      const minfeeBStr = "155381";
      const maxBlockBodySize = 65536;
      const maxTxSize = 16384;
      const keyDepositStr = "2000000";
      const poolDepositStr = "500000000";

      paramUpdate.set_minfee_a(BigNum.from_str(minfeeAStr));
      paramUpdate.set_minfee_b(BigNum.from_str(minfeeBStr));
      paramUpdate.set_max_block_body_size(maxBlockBodySize);
      paramUpdate.set_max_tx_size(maxTxSize);
      paramUpdate.set_key_deposit(BigNum.from_str(keyDepositStr));
      paramUpdate.set_pool_deposit(BigNum.from_str(poolDepositStr));

      validate(results, "Min fee A", minfeeAStr, paramUpdate.minfee_a().to_str());
      validate(results, "Min fee B", minfeeBStr, paramUpdate.minfee_b().to_str());
      validate(results, "Max block body size", maxBlockBodySize, paramUpdate.max_block_body_size());
      validate(results, "Max tx size", maxTxSize, paramUpdate.max_tx_size());
      validate(results, "Key deposit", keyDepositStr, paramUpdate.key_deposit().to_str());
      validate(results, "Pool deposit", poolDepositStr, paramUpdate.pool_deposit().to_str());

      // Unit Interval
      const unitIntervalNum = "1";
      const unitIntervalDen = "2";
      const unitInterval = UnitInterval.new(BigNum.from_str(unitIntervalNum), BigNum.from_str(unitIntervalDen));
      validate(results, "Unit interval numerator", unitIntervalNum, unitInterval.numerator().to_str());
      validate(results, "Unit interval denominator", unitIntervalDen, unitInterval.denominator().to_str());

      // ExUnit Prices
      const exUnitPrices = ExUnitPrices.new(unitInterval, unitInterval);
      validate(results, "ExUnit prices mem price numerator", unitIntervalNum, exUnitPrices.mem_price().numerator().to_str());
      validate(results, "ExUnit prices step price numerator", unitIntervalNum, exUnitPrices.step_price().numerator().to_str());

      // ExUnits
      const exUnitsMem = "1000000";
      const exUnitsSteps = "1000000";
      const exUnits = ExUnits.new(BigNum.from_str(exUnitsMem), BigNum.from_str(exUnitsSteps));
      validate(results, "ExUnits mem", exUnitsMem, exUnits.mem().to_str());
      validate(results, "ExUnits steps", exUnitsSteps, exUnits.steps().to_str());

      // Cost Model
      const costModel = CostModel.new();
      validate(results, "Cost model initial length", 0, costModel.len());

      // Cost Models
      const costModels = Costmdls.new();
      const plutusV1 = Language.new_plutus_v1();
      costModels.insert(plutusV1, costModel);
      validate(results, "Cost models count after insert", 1, costModels.len());

      // Language kinds validation
      const plutusV2 = Language.new_plutus_v2();
      const plutusV3 = Language.new_plutus_v3();
      validate(results, "Plutus V1 kind", 0, plutusV1.kind());
      validate(results, "Plutus V2 kind", 1, plutusV2.kind());
      validate(results, "Plutus V3 kind", 2, plutusV3.kind());

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    const passed = results.filter(r => r.startsWith('✓')).length;
    const failed = results.filter(r => r.startsWith('❌')).length;
    results.push(`\n📊 Results: ${passed} passed, ${failed} failed`);

    return { title: "⚙️ Protocol Parameters Examples", results };
  }
}
