use cml_chain::crypto::Vkeywitness;
use cml_chain::serialization::{Deserialize, Serialize};
use cml_chain::transaction::Transaction;
use cml_chain::{assets::{AssetName, MultiAsset}, crypto::ScriptHash};
use cml_crypto::{PrivateKey, RawBytesEncoding};
use std::convert::TryFrom;

/// Build an ADA-only payment using CML, with one or more inputs and outputs.
///
/// The delimited argument format is intentionally narrow while the mobile
/// builder API is being replaced. All integer quantities are decimal strings
/// so the JS boundary does not lose lovelace precision.
pub fn build_simple_payment_transaction_hex(args: &str) -> Result<String, String> {
  use cml_chain::{
    address::Address,
    assets::Value,
    builders::{
      input_builder::SingleInputBuilder,
      output_builder::TransactionOutputBuilder,
      tx_builder::{ChangeSelectionAlgo, TransactionBuilder, TransactionBuilderConfigBuilder},
    },
    crypto::TransactionHash,
    fees::LinearFee,
    plutus::ExUnitPrices,
    serialization::Serialize,
    transaction::{TransactionInput, TransactionOutput},
    Rational,
  };

  let fields = args.split('|').collect::<Vec<_>>();
  if fields.len() != 10 {
    return Err(format!("expected 10 payment fields, received {}", fields.len()));
  }
  let parse_u64 = |index: usize, name: &str| -> Result<u64, String> {
    fields[index]
      .parse::<u64>()
      .map_err(|err| format!("invalid {name}: {err}"))
  };
  let change_address = Address::from_bech32(fields[2]).map_err(|err| err.to_string())?;
  let ttl = parse_u64(3, "ttl")?;
  let fee_coefficient = parse_u64(4, "fee coefficient")?;
  let fee_constant = parse_u64(5, "fee constant")?;
  let coins_per_utxo_byte = parse_u64(6, "coins per UTXO byte")?;
  let key_deposit = parse_u64(7, "key deposit")?;
  let pool_deposit = parse_u64(8, "pool deposit")?;
  let max_value_size = u32::try_from(parse_u64(9, "max value size")?)
    .map_err(|err| format!("max value size is out of range: {err}"))?;

  let config = TransactionBuilderConfigBuilder::new()
    .fee_algo(LinearFee::new(fee_coefficient, fee_constant, 0))
    .coins_per_utxo_byte(coins_per_utxo_byte)
    .ex_unit_prices(ExUnitPrices::new(
      Rational::new(577, 10000),
      Rational::new(721, 10000000),
    ))
    .pool_deposit(pool_deposit)
    .key_deposit(key_deposit)
    .max_value_size(max_value_size)
    .max_tx_size(16384)
    .collateral_percentage(150)
    .max_collateral_inputs(3)
    .prefer_pure_change(true)
    .build()
    .map_err(|err| err.to_string())?;
  let mut builder = TransactionBuilder::new(config);
  let inputs = fields[0].split(';').collect::<Vec<_>>();
  if inputs.is_empty() || (inputs.len() == 1 && inputs[0].is_empty()) {
    return Err("at least one input is required".to_owned());
  }
  for packed_input in inputs {
    let input_fields = packed_input.split(',').collect::<Vec<_>>();
    if input_fields.len() != 5 {
      return Err("each input must contain hash,index,address,lovelace,assets".to_owned());
    }
    let hash = hex::decode(input_fields[0]).map_err(|err| format!("invalid input hash: {err}"))?;
    let hash = TransactionHash::from_raw_bytes(&hash).map_err(|err| err.to_string())?;
    let index = input_fields[1].parse::<u64>().map_err(|err| format!("invalid input index: {err}"))?;
    let address = Address::from_bech32(input_fields[2]).map_err(|err| err.to_string())?;
    let coin = input_fields[3].parse::<u64>().map_err(|err| format!("invalid input coin: {err}"))?;
    let input = TransactionInput::new(hash, index);
    let utxo = TransactionOutput::new(address, Value::new(coin, parse_multiasset(input_fields[4])?), None, None);
    builder
      .add_input(SingleInputBuilder::new(input, utxo).payment_key().map_err(|err| err.to_string())?)
      .map_err(|err| err.to_string())?;
  }
  let outputs = fields[1].split(';').collect::<Vec<_>>();
  if outputs.is_empty() || (outputs.len() == 1 && outputs[0].is_empty()) {
    return Err("at least one output is required".to_owned());
  }
  for packed_output in outputs {
    let output_fields = packed_output.split(',').collect::<Vec<_>>();
    if output_fields.len() != 3 {
      return Err("each output must contain address,lovelace,assets".to_owned());
    }
    let address = Address::from_bech32(output_fields[0]).map_err(|err| err.to_string())?;
    let coin = output_fields[1].parse::<u64>().map_err(|err| format!("invalid output coin: {err}"))?;
    builder
      .add_output(
        TransactionOutputBuilder::new()
          .with_address(address)
          .next()
          .map_err(|err| err.to_string())?
          .with_value(Value::new(coin, parse_multiasset(output_fields[2])?))
          .build()
          .map_err(|err| err.to_string())?,
      )
      .map_err(|err| err.to_string())?;
  }
  builder.set_ttl(ttl);
  let tx = builder
    .build(ChangeSelectionAlgo::Default, &change_address)
    .map_err(|err| err.to_string())?
    .build_unchecked();
  Ok(format!("{}|{}", hex::encode(tx.to_cbor_bytes()), tx.body.fee))
}

/// Assets use policyHex~assetNameHex~quantity entries separated by ^.
/// This keeps quantities in decimal strings across JSI and avoids JS number loss.
fn parse_multiasset(raw: &str) -> Result<MultiAsset, String> {
  let mut assets = MultiAsset::default();
  if raw.is_empty() || raw == "-" {
    return Ok(assets);
  }
  for packed in raw.split('^') {
    let fields = packed.split('~').collect::<Vec<_>>();
    if fields.len() != 3 {
      return Err("each asset must contain policyHex~assetNameHex~quantity".to_owned());
    }
    let policy_bytes = hex::decode(fields[0]).map_err(|err| format!("invalid asset policy: {err}"))?;
    let policy = ScriptHash::from_raw_bytes(&policy_bytes).map_err(|err| err.to_string())?;
    let name_bytes = hex::decode(fields[1]).map_err(|err| format!("invalid asset name: {err}"))?;
    let name = AssetName::new(name_bytes).map_err(|err| err.to_string())?;
    let quantity = fields[2].parse::<u64>().map_err(|err| format!("invalid asset quantity: {err}"))?;
    assets.set(policy, name, quantity);
  }
  Ok(assets)
}

/// Add one Ed25519 vkey witness to a transaction using CML.
pub fn sign_transaction_hex(
  transaction_hex: &str, private_key_hex: &str,
) -> Result<String, String> {
  let transaction_bytes = hex::decode(transaction_hex).map_err(|err| err.to_string())?;
  let mut transaction =
    Transaction::from_cbor_bytes(&transaction_bytes).map_err(|err| err.to_string())?;
  let private_key = PrivateKey::from_raw_hex(private_key_hex).map_err(|err| err.to_string())?;
  let signature = private_key.sign(transaction.body.hash().to_raw_bytes());
  let witness = Vkeywitness::new(private_key.to_public(), signature);
  let mut witnesses =
    transaction.witness_set.vkeywitnesses.take().map(Vec::from).unwrap_or_default();
  witnesses.push(witness);
  transaction.witness_set.vkeywitnesses = Some(witnesses.into());
  Ok(hex::encode(transaction.to_cbor_bytes()))
}

#[cfg(test)]
mod tests {
  use super::{build_simple_payment_transaction_hex, sign_transaction_hex};

  const UNSIGNED_TRANSACTION_HEX: &str = "84a300d90102800180021a000f4240a0f5f6";
  const PRIVATE_KEY_HEX: &str = "1111111111111111111111111111111111111111111111111111111111111111";
  const CSL_SIGNED_TRANSACTION_HEX: &str = "84a300d90102800180021a000f4240a100d9010281825820d04ab232742bb4ab3a1368bd4615e4e6d0224ab71a016baf8520a332c97787375840489701c384e7437b286ca82f3279ac068b446e2416827ccabede352c4fd6843184dda82a97e499ec7c74007c7966786106ab6d899fd00c9f5b7a4498e9930a05f5f6";

  #[test]
  fn signed_transaction_bytes_match_csl_fixture() {
    assert_eq!(
      sign_transaction_hex(UNSIGNED_TRANSACTION_HEX, PRIVATE_KEY_HEX).unwrap(),
      CSL_SIGNED_TRANSACTION_HEX
    );
  }

  #[test]
  fn builds_simple_payment_with_csl_fee_change_and_serialization_parity() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32),
      address,
      address,
      address,
    );
    assert_eq!(
      build_simple_payment_transaction_hex(&args).unwrap(),
      "84a400d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00777f7b021a00029285031a0001e240a0f5f6|168581"
    );
  }

  #[test]
  fn supports_multiple_payment_inputs_and_outputs() {
    use cml_chain::{serialization::Deserialize, transaction::Transaction};

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},5000000,-;{},1,{},5000000,-|{},2000000,-;{},2000000,-|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32), address, "02".repeat(32), address,
      address, address, address,
    );
    let result = build_simple_payment_transaction_hex(&args).unwrap();
    let cbor_hex = result.rsplit_once('|').unwrap().0;
    let transaction = Transaction::from_cbor_bytes(&hex::decode(cbor_hex).unwrap()).unwrap();
    assert_eq!(transaction.body.inputs.len(), 2);
    assert_eq!(transaction.body.outputs.len(), 3); // two recipients and change
  }

  #[test]
  fn preserves_asset_policy_name_and_large_quantity_through_build() {
    use cml_chain::{
      assets::AssetName,
      crypto::ScriptHash,
      serialization::Deserialize,
      transaction::Transaction,
    };
    use cml_crypto::RawBytesEncoding;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let policy_hex = "ab".repeat(28);
    let quantity = "9007199254740993";
    let args = format!(
      "{},0,{},10000000,{}~00ff~{}|{},2000000,{}~00ff~{}|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32), address, policy_hex, quantity,
      address, policy_hex, quantity, address,
    );
    let result = build_simple_payment_transaction_hex(&args).unwrap();
    let cbor_hex = result.rsplit_once('|').unwrap().0;
    let transaction = Transaction::from_cbor_bytes(&hex::decode(cbor_hex).unwrap()).unwrap();
    let policy = ScriptHash::from_raw_bytes(&hex::decode(policy_hex).unwrap()).unwrap();
    let name = AssetName::new(vec![0x00, 0xff]).unwrap();
    assert_eq!(transaction.body.outputs[0].amount().multiasset.get(&policy, &name), Some(9007199254740993));
  }

  #[test]
  fn rejects_incomplete_simple_payment_arguments() {
    assert!(build_simple_payment_transaction_hex("missing|fields").is_err());
  }

  #[test]
  fn rejects_invalid_transaction_or_private_key_hex() {
    assert!(sign_transaction_hex("not-hex", PRIVATE_KEY_HEX).is_err());
    assert!(sign_transaction_hex(UNSIGNED_TRANSACTION_HEX, "not-hex").is_err());
  }

  #[test]
  fn c_abi_exposes_signed_cml_transaction() {
    use std::ffi::{CStr, CString};

    let transaction = CString::new(UNSIGNED_TRANSACTION_HEX).unwrap();
    let private_key = CString::new(PRIVATE_KEY_HEX).unwrap();
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();
    let succeeded = unsafe {
      crate::c_bridge::cml_transaction::cml_bridge_sign_transaction_hex(
        transaction.as_ptr(),
        private_key.as_ptr(),
        &mut result,
        &mut error,
      )
    };
    assert!(succeeded, "{}", unsafe { CStr::from_ptr(error) }.to_string_lossy());
    assert_eq!(unsafe { CStr::from_ptr(result) }.to_str().unwrap(), CSL_SIGNED_TRANSACTION_HEX);
    unsafe {
      crate::c_bridge::bridge_tools::string::csl_bridge_charptr_free(&mut result);
      if !error.is_null() {
        crate::c_bridge::bridge_tools::string::csl_bridge_charptr_free(&mut error);
      }
    }
  }

  #[test]
  fn cml_payment_builder_matches_csl_body_fee_and_change_fixture() {
    use cml_chain::{
      address::Address,
      assets::Value,
      builders::{
        input_builder::SingleInputBuilder,
        output_builder::TransactionOutputBuilder,
        tx_builder::{ChangeSelectionAlgo, TransactionBuilder, TransactionBuilderConfigBuilder},
      },
      crypto::TransactionHash,
      fees::LinearFee,
      plutus::ExUnitPrices,
      Rational,
      serialization::Serialize,
      transaction::{TransactionInput, TransactionOutput},
    };

    const ADDRESS_HEX: &str = "000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf";
    const CSL_BODY_HEX: &str = "a400d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00777f7b021a00029285031a0001e240";

    let address = Address::from_hex(ADDRESS_HEX).unwrap();
    let config = TransactionBuilderConfigBuilder::new()
      .fee_algo(LinearFee::new(44, 155381, 0))
      .coins_per_utxo_byte(4310)
      .ex_unit_prices(ExUnitPrices::new(
        Rational::new(577, 10000),
        Rational::new(721, 10000000),
      ))
      .pool_deposit(500000000)
      .key_deposit(2000000)
      .max_value_size(5000)
      .max_tx_size(16384)
      .collateral_percentage(150)
      .max_collateral_inputs(3)
      .build()
      .unwrap();
    let mut builder = TransactionBuilder::new(config);
    let input = TransactionInput::new(TransactionHash::from([1u8; 32]), 0);
    let utxo = TransactionOutput::new(address.clone(), Value::from(10000000), None, None);
    builder
      .add_input(SingleInputBuilder::new(input, utxo).payment_key().unwrap())
      .unwrap();
    builder
      .add_output(
        TransactionOutputBuilder::new()
          .with_address(address.clone())
          .next()
          .unwrap()
          .with_value(2000000)
          .build()
          .unwrap(),
      )
      .unwrap();
    builder.set_ttl(123456);
    let transaction = builder
      .build(ChangeSelectionAlgo::Default, &address)
      .unwrap()
      .build_unchecked();

    assert_eq!(hex::encode(transaction.body.to_cbor_bytes()), CSL_BODY_HEX);
    assert_eq!(transaction.body.fee, 168581);
    assert_eq!(transaction.body.outputs.len(), 2);
    assert_eq!(transaction.body.outputs[1].amount().coin, 7831419);
  }

  #[test]
  fn c_abi_exposes_cml_simple_payment_builder() {
    use std::ffi::{CStr, CString};

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = CString::new(format!(
      "{},0,{},10000000,-|{},2000000,-|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32), address, address, address,
    )).unwrap();
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();
    let succeeded = unsafe {
      crate::c_bridge::cml_transaction::cml_bridge_build_simple_payment_transaction_hex(
        args.as_ptr(),
        &mut result,
        &mut error,
      )
    };
    assert!(succeeded, "{}", unsafe { CStr::from_ptr(error) }.to_string_lossy());
    assert!(unsafe { CStr::from_ptr(result) }.to_str().unwrap().ends_with("|168581"));
    unsafe {
      crate::c_bridge::bridge_tools::string::csl_bridge_charptr_free(&mut result);
      if !error.is_null() {
        crate::c_bridge::bridge_tools::string::csl_bridge_charptr_free(&mut error);
      }
    }
  }
}
