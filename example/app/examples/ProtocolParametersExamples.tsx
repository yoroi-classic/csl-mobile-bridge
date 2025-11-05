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
} from "@emurgo/csl-mobile-bridge-jsi";
import { ExampleSection } from '../types';

export default class ProtocolParametersExamples {
  static async run(): Promise<ExampleSection> {
    const results: string[] = [];
    
    try {
      // Protocol Param Update
      const paramUpdate = ProtocolParamUpdate.new();
      
      // Set various parameters
      paramUpdate.set_minfee_a(BigNum.from_str("44"));
      paramUpdate.set_minfee_b(BigNum.from_str("155381"));
      paramUpdate.set_max_block_body_size(65536);
      paramUpdate.set_max_tx_size(16384);
      paramUpdate.set_key_deposit(BigNum.from_str("2000000"));
      paramUpdate.set_pool_deposit(BigNum.from_str("500000000"));

      results.push(`✓ Min fee A: ${paramUpdate.minfee_a().to_str()}`);
      results.push(`✓ Min fee B: ${paramUpdate.minfee_b().to_str()}`);
      results.push(`✓ Max block body size: ${paramUpdate.max_block_body_size()}`);
      results.push(`✓ Max tx size: ${paramUpdate.max_tx_size()}`);
      results.push(`✓ Key deposit: ${paramUpdate.key_deposit().to_str()} lovelace`);
      results.push(`✓ Pool deposit: ${paramUpdate.pool_deposit().to_str()} lovelace`);

      // Unit Interval
      const unitInterval = UnitInterval.new(BigNum.from_str("1"), BigNum.from_str("2"));
      results.push(`✓ Unit interval: ${unitInterval.numerator().to_str()}/${unitInterval.denominator().to_str()}`);

      // ExUnit Prices
      const exUnitPrices = ExUnitPrices.new(unitInterval, unitInterval);
      results.push(`✓ ExUnit prices created`);

      // ExUnits
      const exUnits = ExUnits.new(BigNum.from_str("1000000"), BigNum.from_str("1000000"));
      results.push(`✓ ExUnits: mem=${exUnits.mem().to_str()}, steps=${exUnits.steps().to_str()}`);

      // Cost Model
      const costModel = CostModel.new();
      results.push(`✓ Cost model length: ${costModel.len()}`);

      // Cost Models
      const costModels = Costmdls.new();
      const plutusV1 = Language.new_plutus_v1();
      costModels.insert(plutusV1, costModel);
      results.push(`✓ Cost models count: ${costModels.len()}`);

    } catch (error) {
      results.push(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { title: "⚙️ Protocol Parameters Examples", results };
  }
}
