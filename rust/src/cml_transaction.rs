use cml_chain::crypto::Vkeywitness;
use cml_chain::serialization::{Deserialize, Serialize};
use cml_chain::transaction::Transaction;
use cml_chain::{assets::{AssetName, MultiAsset}, crypto::ScriptHash};
use cml_chain::transaction::DatumOption;
use cml_chain::plutus::PlutusData;
use cml_crypto::{DatumHash, PrivateKey, RawBytesEncoding};
use std::convert::TryFrom;

/// Build a payment with ADA and multiasset values using CML.
///
/// The delimited argument format is intentionally narrow while the mobile
/// builder API is being replaced. All integer quantities are decimal strings
/// so the JS boundary does not lose lovelace precision.
pub fn build_simple_payment_transaction_hex(args: &str) -> Result<String, String> {
  use cml_chain::{
    assets::Value,
    builders::{
      input_builder::SingleInputBuilder,
      witness_builder::NativeScriptWitnessInfo,
      output_builder::TransactionOutputBuilder,
      tx_builder::{ChangeSelectionAlgo, TransactionBuilder, TransactionBuilderConfigBuilder},
      mint_builder::SingleMintBuilder,
    },
    crypto::TransactionHash,
    fees::LinearFee,
    plutus::ExUnitPrices,
    serialization::{Deserialize, Serialize},
    transaction::{TransactionInput, TransactionOutput},
    Rational,
  };

  let fields = args.split('|').collect::<Vec<_>>();
  if !(10..=12).contains(&fields.len()) {
    return Err(format!("expected 10 to 12 payment fields, received {}", fields.len()));
  }
  let parse_u64 = |index: usize, name: &str| -> Result<u64, String> {
    fields[index]
      .parse::<u64>()
      .map_err(|err| format!("invalid {name}: {err}"))
  };
  let change_address = parse_payment_address(fields[2])?;
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
    if input_fields.len() != 5 && input_fields.len() != 7 {
      return Err("each input must contain hash,index,address,lovelace,assets[,nativeScriptHex,witnessCount]".to_owned());
    }
    let hash = hex::decode(input_fields[0]).map_err(|err| format!("invalid input hash: {err}"))?;
    let hash = TransactionHash::from_raw_bytes(&hash).map_err(|err| err.to_string())?;
    let index = input_fields[1].parse::<u64>().map_err(|err| format!("invalid input index: {err}"))?;
    let address = parse_payment_address(input_fields[2])?;
    let coin = input_fields[3].parse::<u64>().map_err(|err| format!("invalid input coin: {err}"))?;
    let input = TransactionInput::new(hash, index);
    let utxo = TransactionOutput::new(address, Value::new(coin, parse_multiasset(input_fields[4])?), None, None);
    let input_builder = SingleInputBuilder::new(input, utxo);
    let input_result = if input_fields.len() == 7 && input_fields[5] != "-" {
      let script_bytes = hex::decode(input_fields[5]).map_err(|err| format!("invalid native script: {err}"))?;
      let script = cml_chain::transaction::NativeScript::from_cbor_bytes(&script_bytes)
        .map_err(|err| format!("invalid native script CBOR: {err}"))?;
      let witness_info = if input_fields[6] == "-" {
        NativeScriptWitnessInfo::assume_signature_count()
      } else {
        let count = input_fields[6].parse::<usize>().map_err(|err| format!("invalid native script witness count: {err}"))?;
        NativeScriptWitnessInfo::num_signatures(count)
      };
      input_builder.native_script(script, witness_info).map_err(|err| err.to_string())?
    } else {
      input_builder.payment_key().map_err(|err| err.to_string())?
    };
    builder.add_input(input_result).map_err(|err| err.to_string())?;
  }
  let outputs = fields[1].split(';').collect::<Vec<_>>();
  if outputs.is_empty() || (outputs.len() == 1 && outputs[0].is_empty()) {
    return Err("at least one output is required".to_owned());
  }
  for packed_output in outputs {
    let output_fields = packed_output.split(',').collect::<Vec<_>>();
    if output_fields.len() != 4 {
      return Err("each output must contain address,lovelace,assets,datum".to_owned());
    }
    let address = parse_payment_address(output_fields[0])?;
    let coin = output_fields[1].parse::<u64>().map_err(|err| format!("invalid output coin: {err}"))?;
    let mut output_builder = TransactionOutputBuilder::new().with_address(address);
    if output_fields[3] != "-" {
      let datum = output_fields[3].splitn(2, '~').collect::<Vec<_>>();
      if datum.len() != 2 {
        return Err("output datum must contain kind~hex".to_owned());
      }
      let datum_option = match datum[0] {
        "hash" => {
          let bytes = hex::decode(datum[1]).map_err(|err| format!("invalid datum hash: {err}"))?;
          DatumOption::new_hash(DatumHash::from_raw_bytes(&bytes).map_err(|err| err.to_string())?)
        }
        "inline" => {
          let bytes = hex::decode(datum[1]).map_err(|err| format!("invalid inline datum: {err}"))?;
          DatumOption::new_datum(PlutusData::from_cbor_bytes(&bytes).map_err(|err| err.to_string())?)
        }
        _ => return Err("output datum kind must be hash or inline".to_owned()),
      };
      output_builder = output_builder.with_data(datum_option);
    }
    let output_builder = output_builder
      .next()
      .map_err(|err| err.to_string())?
      .with_value(Value::new(coin, parse_multiasset(output_fields[2])?));
    builder
      .add_output(output_builder.build().map_err(|err| err.to_string())?)
      .map_err(|err| err.to_string())?;
  }
  if fields.len() == 11 {
    if let Some(auxiliary_data) = parse_auxiliary_metadata(fields[10])? {
      builder.set_auxiliary_data(auxiliary_data);
    }
  }
  if fields.len() == 12 && fields[11] != "-" {
    for packed_mint in fields[11].split(';') {
      let mint_fields = packed_mint.splitn(4, ',').collect::<Vec<_>>();
      if mint_fields.len() != 4 || mint_fields[1] != "native" {
        return Err("each supported mint must contain policyHex,native,scriptCborHex,assets".to_owned());
      }
      let script_bytes = hex::decode(mint_fields[2]).map_err(|err| format!("invalid mint native script: {err}"))?;
      let script = cml_chain::transaction::NativeScript::from_cbor_bytes(&script_bytes)
        .map_err(|err| format!("invalid mint native script CBOR: {err}"))?;
      let policy = hex::decode(mint_fields[0]).map_err(|err| format!("invalid mint policy: {err}"))?;
      let policy = ScriptHash::from_raw_bytes(&policy).map_err(|err| err.to_string())?;
      if policy != script.hash() {
        return Err("native mint policy ID does not match script hash".to_owned());
      }
      let mut mint_assets = cml_chain::OrderedHashMap::new();
      for packed_asset in mint_fields[3].split('^') {
        let asset_fields = packed_asset.split('~').collect::<Vec<_>>();
        if asset_fields.len() != 2 {
          return Err("each minted asset must contain assetNameHex~quantity".to_owned());
        }
        let name_bytes = hex::decode(asset_fields[0]).map_err(|err| format!("invalid minted asset name: {err}"))?;
        let name = AssetName::new(name_bytes).map_err(|err| err.to_string())?;
        let quantity = asset_fields[1].parse::<i64>().map_err(|err| format!("invalid mint quantity: {err}"))?;
        mint_assets.insert(name, quantity);
      }
      builder.add_mint(SingleMintBuilder::new(mint_assets).native_script(
        script,
        NativeScriptWitnessInfo::assume_signature_count(),
      )).map_err(|err| err.to_string())?;
    }
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

fn parse_payment_address(raw: &str) -> Result<cml_chain::address::Address, String> {
  use cml_chain::{address::Address, byron::ByronAddress};
  match Address::from_bech32(raw) {
    Ok(address) => Ok(address),
    Err(bech32_error) => ByronAddress::from_base58(raw)
      .map(|address| address.to_address())
      .map_err(|byron_error| format!("invalid bech32 ({bech32_error}) or Byron ({byron_error}) address")),
  }
}

fn parse_auxiliary_metadata(encoded_json: &str) -> Result<Option<cml_chain::auxdata::AuxiliaryData>, String> {
  use cml_chain::{auxdata::{AuxiliaryData, Metadata}, json::metadatums::{encode_json_str_to_metadatum, MetadataJsonSchema}};

  if encoded_json.is_empty() || encoded_json == "-" {
    return Ok(None);
  }
  let mut json_bytes = Vec::with_capacity(encoded_json.len());
  let encoded = encoded_json.as_bytes();
  let mut i = 0;
  while i < encoded.len() {
    if encoded[i] == b'%' {
      if i + 2 >= encoded.len() {
        return Err("invalid percent-encoded metadata JSON".to_owned());
      }
      let hex = std::str::from_utf8(&encoded[i + 1..i + 3]).map_err(|err| err.to_string())?;
      let byte = u8::from_str_radix(hex, 16).map_err(|err| format!("invalid metadata escape: {err}"))?;
      json_bytes.push(byte);
      i += 3;
    } else {
      json_bytes.push(encoded[i]);
      i += 1;
    }
  }
  let json = std::str::from_utf8(&json_bytes).map_err(|err| format!("metadata JSON is not UTF-8: {err}"))?;
  #[derive(serde::Deserialize)]
  struct MetadataEntry {
    label: String,
    data: serde_json::Value,
  }
  let entries: Vec<MetadataEntry> = serde_json::from_str(json).map_err(|err| format!("invalid metadata entries: {err}"))?;
  let mut metadata = Metadata::new();
  for entry in entries {
    let label = entry.label.parse::<u64>().map_err(|err| format!("invalid metadata label: {err}"))?;
    let metadatum = encode_json_str_to_metadatum(&entry.data.to_string(), MetadataJsonSchema::BasicConversions)
      .map_err(|err| err.to_string())?;
    metadata.set(label, metadatum);
  }
  Ok(Some(AuxiliaryData::new_shelley(metadata)))
}

/// Calculate the minimum coin for an output with assets using CML's current
/// coins-per-UTxO-byte rule. Args are addressBech32|packedAssets|coinsPerByte.
pub fn minimum_coin_for_assets(args: &str) -> Result<String, String> {
  use cml_chain::builders::output_builder::TransactionOutputBuilder;
  let fields = args.split('|').collect::<Vec<_>>();
  if fields.len() != 3 {
    return Err(format!("expected 3 minimum-coin fields, received {}", fields.len()));
  }
  let address = parse_payment_address(fields[0])?;
  let assets = parse_multiasset(fields[1])?;
  let coins_per_byte = fields[2].parse::<u64>().map_err(|err| format!("invalid coins per UTXO byte: {err}"))?;
  let output = TransactionOutputBuilder::new()
    .with_address(address)
    .next()
    .map_err(|err| err.to_string())?
    .with_asset_and_min_required_coin(assets, coins_per_byte)
    .map_err(|err| err.to_string())?
    .build()
    .map_err(|err| err.to_string())?;
  Ok(output.output.amount().coin.to_string())
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
  use super::{build_simple_payment_transaction_hex, minimum_coin_for_assets, sign_transaction_hex};

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
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000",
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
  fn metadata_encoding_matches_csl_for_escaped_strings_and_large_integers() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let metadata_json = r#"[{"label":"674","data":{"msg":["café | pipe",9007199254740993]}}]"#;
    let metadata_arg = metadata_json
      .as_bytes()
      .iter()
      .map(|byte| format!("%{:02X}", byte))
      .collect::<String>();
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|{}",
      "01".repeat(32), address, address, address, metadata_arg,
    );
    let cml_cbor = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml_cbor.rsplit_once('|').unwrap().0).unwrap();

    let addr = csl::Address::from_bech32(address).unwrap();
    let linear_fee = csl::LinearFee::new(
      &csl::BigNum::from_str("44").unwrap(),
      &csl::BigNum::from_str("155381").unwrap(),
    );
    let ex_prices = csl::ExUnitPrices::new(
      &csl::UnitInterval::new(&csl::BigNum::from_str("577").unwrap(), &csl::BigNum::from_str("10000").unwrap()),
      &csl::UnitInterval::new(&csl::BigNum::from_str("721").unwrap(), &csl::BigNum::from_str("10000000").unwrap()),
    );
    let config = csl::TransactionBuilderConfigBuilder::new()
      .fee_algo(&linear_fee)
      .coins_per_utxo_byte(&csl::BigNum::from_str("4310").unwrap())
      .ex_unit_prices(&ex_prices)
      .pool_deposit(&csl::BigNum::from_str("500000000").unwrap())
      .key_deposit(&csl::BigNum::from_str("2000000").unwrap())
      .max_value_size(5000)
      .max_tx_size(16384)
      .prefer_pure_change(true)
      .build()
      .unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    builder.add_output(&csl::TransactionOutput::new(
      &addr,
      &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
    )).unwrap();
    builder.set_ttl(123456);
    let input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let utxo = csl::TransactionUnspentOutput::new(
      &input,
      &csl::TransactionOutput::new(&addr, &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap())),
    );
    let mut utxos = csl::TransactionUnspentOutputs::new();
    utxos.add(&utxo);
    builder.add_inputs_from(&utxos, csl::CoinSelectionStrategyCIP2::LargestFirstMultiAsset).unwrap();
    let metadatum = csl::encode_json_str_to_metadatum(
      r#"{"msg":["café | pipe",9007199254740993]}"#.to_owned(),
      csl::MetadataJsonSchema::BasicConversions,
    ).unwrap();
    let mut metadata = csl::GeneralTransactionMetadata::new();
    metadata.insert(&csl::BigNum::from_str("674").unwrap(), &metadatum);
    builder.set_metadata(&metadata);
    assert!(builder.add_change_if_needed(&addr).unwrap());
    let body = builder.build().unwrap();
    let csl_transaction = csl::Transaction::new(
      &body,
      &csl::TransactionWitnessSet::new(),
      builder.get_auxiliary_data(),
    );
    assert_eq!(cml_cbor, csl_transaction.to_bytes());
  }

  #[test]
  fn supports_multiple_payment_inputs_and_outputs() {
    use cml_chain::{serialization::Deserialize, transaction::Transaction};

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},5000000,-;{},1,{},5000000,-|{},2000000,-,-;{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000",
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
  fn accepts_byron_inputs_and_plutus_script_outputs_with_csl_parity() {
    use cardano_serialization_lib as csl;

    let byron = "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3";
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let script_address = "addr_test1wzzfgjazt5ts34cstrhzaac4xav8x7z2m3vg76s8qmaztzglsw8k5";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,inline~d87980|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32), byron, script_address, address,
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml = hex::decode(cml.rsplit_once('|').unwrap().0).unwrap();

    let input_address = csl::ByronAddress::from_base58(byron).unwrap().to_address();
    let output_address = csl::Address::from_bech32(script_address).unwrap();
    let linear_fee = csl::LinearFee::new(
      &csl::BigNum::from_str("44").unwrap(),
      &csl::BigNum::from_str("155381").unwrap(),
    );
    let ex_prices = csl::ExUnitPrices::new(
      &csl::UnitInterval::new(&csl::BigNum::from_str("577").unwrap(), &csl::BigNum::from_str("10000").unwrap()),
      &csl::UnitInterval::new(&csl::BigNum::from_str("721").unwrap(), &csl::BigNum::from_str("10000000").unwrap()),
    );
    let config = csl::TransactionBuilderConfigBuilder::new()
      .fee_algo(&linear_fee)
      .coins_per_utxo_byte(&csl::BigNum::from_str("4310").unwrap())
      .ex_unit_prices(&ex_prices)
      .pool_deposit(&csl::BigNum::from_str("500000000").unwrap())
      .key_deposit(&csl::BigNum::from_str("2000000").unwrap())
      .max_value_size(5000)
      .max_tx_size(16384)
      .prefer_pure_change(true)
      .build()
      .unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    let mut output = csl::TransactionOutput::new(
      &output_address,
      &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
    );
    output.set_plutus_data(&csl::PlutusData::new_empty_constr_plutus_data(&csl::BigNum::zero()));
    builder.add_output(&output).unwrap();
    builder.set_ttl(123456);
    builder.add_regular_input(
      &input_address,
      &csl::TransactionInput::new(
        &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
        0,
      ),
      &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
    ).unwrap();
    let change_address = csl::Address::from_bech32(address).unwrap();
    assert!(builder.add_change_if_needed(&change_address).unwrap());
    let body = builder.build().unwrap();
    let expected = csl::Transaction::new(&body, &csl::TransactionWitnessSet::new(), None).to_bytes();
    assert_eq!(cml, expected);
  }

  #[test]
  fn multiple_native_script_inputs_and_required_signers_match_csl_fee() {
    use cardano_serialization_lib as csl;

    let script_cbor = format!("8200581c{}", "ab".repeat(28));
    let second_script_cbor = format!("8200581c{}", "cd".repeat(28));
    let script = csl::NativeScript::from_bytes(hex::decode(&script_cbor).unwrap()).unwrap();
    let second_script = csl::NativeScript::from_bytes(hex::decode(&second_script_cbor).unwrap()).unwrap();
    let address_for_script = |script: &csl::NativeScript| {
      csl::EnterpriseAddress::new(
        csl::NetworkInfo::new(0, 1).network_id(),
        &csl::Credential::from_scripthash(&script.hash()),
      ).to_address().to_bech32(None).unwrap()
    };
    let script_address = address_for_script(&script);
    let second_script_address = address_for_script(&second_script);
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},5000000,-,{},1;{},0,{},5000000,-,{},1|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32), script_address, script_cbor,
      "02".repeat(32), second_script_address, second_script_cbor,
      address, address,
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml = hex::decode(cml.rsplit_once('|').unwrap().0).unwrap();

    let linear_fee = csl::LinearFee::new(
      &csl::BigNum::from_str("44").unwrap(),
      &csl::BigNum::from_str("155381").unwrap(),
    );
    let ex_prices = csl::ExUnitPrices::new(
      &csl::UnitInterval::new(&csl::BigNum::from_str("577").unwrap(), &csl::BigNum::from_str("10000").unwrap()),
      &csl::UnitInterval::new(&csl::BigNum::from_str("721").unwrap(), &csl::BigNum::from_str("10000000").unwrap()),
    );
    let config = csl::TransactionBuilderConfigBuilder::new()
      .fee_algo(&linear_fee)
      .coins_per_utxo_byte(&csl::BigNum::from_str("4310").unwrap())
      .ex_unit_prices(&ex_prices)
      .pool_deposit(&csl::BigNum::from_str("500000000").unwrap())
      .key_deposit(&csl::BigNum::from_str("2000000").unwrap())
      .max_value_size(5000)
      .max_tx_size(16384)
      .prefer_pure_change(true)
      .build()
      .unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    builder.add_output(&csl::TransactionOutput::new(
      &csl::Address::from_bech32(address).unwrap(),
      &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
    )).unwrap();
    builder.set_ttl(123456);
    builder.add_native_script_input(
      &script,
      &csl::TransactionInput::new(
        &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
        0,
      ),
        &csl::Value::new(&csl::BigNum::from_str("5000000").unwrap()),
    );
    builder.add_native_script_input(
      &second_script,
      &csl::TransactionInput::new(
        &csl::TransactionHash::from_bytes(hex::decode("02".repeat(32)).unwrap()).unwrap(),
        0,
      ),
      &csl::Value::new(&csl::BigNum::from_str("5000000").unwrap()),
    );
    assert!(builder.add_change_if_needed(&csl::Address::from_bech32(address).unwrap()).unwrap());
    let body = builder.build().unwrap();
    let mut witnesses = csl::TransactionWitnessSet::new();
    let mut native_scripts = csl::NativeScripts::new();
    native_scripts.add(&second_script);
    native_scripts.add(&script);
    witnesses.set_native_scripts(&native_scripts);
    let expected = csl::Transaction::new(&body, &witnesses, None).to_bytes();
    assert_eq!(cml, expected);
  }

  #[test]
  fn native_mint_and_token_output_match_csl_fee_and_witnesses() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let script_hex = format!("8200581c{}", "ab".repeat(28));
    let script = csl::NativeScript::from_bytes(hex::decode(&script_hex).unwrap()).unwrap();
    let policy_hex = hex::encode(script.hash().to_bytes());
    let name_hex = "00ff";
    let args = format!(
      "{},0,{},10000000,-|{},5000000,{}~{}~1,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|{},native,{},{}~1",
      "01".repeat(32), address, address, policy_hex, name_hex, address, policy_hex, script_hex, name_hex,
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml = hex::decode(cml.rsplit_once('|').unwrap().0).unwrap();

    let addr = csl::Address::from_bech32(address).unwrap();
    let policy = csl::ScriptHash::from_bytes(hex::decode(&policy_hex).unwrap()).unwrap();
    let asset_name = csl::AssetName::new(hex::decode(name_hex).unwrap()).unwrap();
    let mut output_assets = csl::Assets::new();
    output_assets.insert(&asset_name, &csl::BigNum::from_str("1").unwrap());
    let mut output_multiasset = csl::MultiAsset::new();
    output_multiasset.insert(&policy, &output_assets);
    let mut output_value = csl::Value::new(&csl::BigNum::from_str("5000000").unwrap());
    output_value.set_multiasset(&output_multiasset);
    let fee = csl::LinearFee::new(
      &csl::BigNum::from_str("44").unwrap(),
      &csl::BigNum::from_str("155381").unwrap(),
    );
    let ex_prices = csl::ExUnitPrices::new(
      &csl::UnitInterval::new(&csl::BigNum::from_str("577").unwrap(), &csl::BigNum::from_str("10000").unwrap()),
      &csl::UnitInterval::new(&csl::BigNum::from_str("721").unwrap(), &csl::BigNum::from_str("10000000").unwrap()),
    );
    let config = csl::TransactionBuilderConfigBuilder::new()
      .fee_algo(&fee)
      .coins_per_utxo_byte(&csl::BigNum::from_str("4310").unwrap())
      .ex_unit_prices(&ex_prices)
      .pool_deposit(&csl::BigNum::from_str("500000000").unwrap())
      .key_deposit(&csl::BigNum::from_str("2000000").unwrap())
      .max_value_size(5000)
      .max_tx_size(16384)
      .prefer_pure_change(true)
      .build().unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    builder.add_output(&csl::TransactionOutput::new(&addr, &output_value)).unwrap();
    builder.set_ttl(123456);
    builder.add_regular_input(
      &addr,
      &csl::TransactionInput::new(
        &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(), 0,
      ),
      &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
    ).unwrap();
    let mut mint_assets = csl::MintAssets::new();
    mint_assets.insert(&asset_name, &csl::Int::new(&csl::BigNum::from_str("1").unwrap()));
    let mut mint = csl::Mint::new();
    mint.insert(&policy, &mint_assets);
    let native_script = script;
    let mut native_scripts = csl::NativeScripts::new();
    native_scripts.add(&native_script);
    builder.set_mint(&mint, &native_scripts).unwrap();
    assert!(builder.add_change_if_needed(&addr).unwrap());
    let body = builder.build().unwrap();
    let mut witness_set = csl::TransactionWitnessSet::new();
    witness_set.set_native_scripts(&native_scripts);
    let expected = csl::Transaction::new(&body, &witness_set, None).to_bytes();
    assert_eq!(cml, expected);
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
    let input_quantity = "18014398509481986";
    let args = format!(
      "{},0,{},10000000,{}~00ff~{}|{},2000000,{}~00ff~{},-|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32), address, policy_hex, input_quantity,
      address, policy_hex, quantity, address,
    );
    let result = build_simple_payment_transaction_hex(&args).unwrap();
    let cbor_hex = result.rsplit_once('|').unwrap().0;
    let transaction = Transaction::from_cbor_bytes(&hex::decode(cbor_hex).unwrap()).unwrap();
    let policy = ScriptHash::from_raw_bytes(&hex::decode(policy_hex).unwrap()).unwrap();
    let name = AssetName::new(vec![0x00, 0xff]).unwrap();
    assert_eq!(transaction.body.outputs[0].amount().multiasset.get(&policy, &name), Some(9007199254740993));
    assert_eq!(transaction.body.outputs[1].amount().multiasset.get(&policy, &name), Some(9007199254740993));
    assert!(transaction.body.outputs[1].amount().coin >= 1000000);
    assert_eq!(
      transaction.body.outputs.iter().map(|output| output.amount().coin).sum::<u64>() + transaction.body.fee,
      10000000,
    );
  }

  #[test]
  fn multiasset_fee_and_change_match_csl_builder_oracle() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let policy_hex = "ab".repeat(28);
    let asset_quantity = "9007199254740993";
    let asset_id = format!("{}~00ff~{}", policy_hex, asset_quantity);
    let input_hash = "01".repeat(32);
    let datum_hash_hex = "cd".repeat(32);
    let args = format!(
      "{},0,{},10000000,{}~00ff~18014398509481986|{},2000000,{},inline~d87980;{},2000000,-,hash~{}|{}|123456|44|155381|4310|2000000|500000000|5000",
      input_hash, address, policy_hex, address, asset_id, address, datum_hash_hex, address,
    );
    let cml_result = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml_result.rsplit_once('|').unwrap().0).unwrap();

    let addr = csl::Address::from_bech32(address).unwrap();
    let policy = csl::ScriptHash::from_bytes(hex::decode(&policy_hex).unwrap()).unwrap();
    let name = csl::AssetName::new(vec![0x00, 0xff]).unwrap();
    let mut assets = csl::Assets::new();
    assets.insert(&name, &csl::BigNum::from_str(asset_quantity).unwrap());
    let mut input_asset_bundle = csl::Assets::new();
    input_asset_bundle.insert(&name, &csl::BigNum::from_str("18014398509481986").unwrap());
    let mut input_assets = csl::MultiAsset::new();
    input_assets.insert(&policy, &input_asset_bundle);
    let mut input_value = csl::Value::new(&csl::BigNum::from_str("10000000").unwrap());
    input_value.set_multiasset(&input_assets);
    let input_output = csl::TransactionOutput::new(&addr, &input_value);
    let input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode(input_hash).unwrap()).unwrap(),
      0,
    );
    let utxo = csl::TransactionUnspentOutput::new(&input, &input_output);
    let mut utxos = csl::TransactionUnspentOutputs::new();
    utxos.add(&utxo);

    let linear_fee = csl::LinearFee::new(
      &csl::BigNum::from_str("44").unwrap(),
      &csl::BigNum::from_str("155381").unwrap(),
    );
    let ex_prices = csl::ExUnitPrices::new(
      &csl::UnitInterval::new(&csl::BigNum::from_str("577").unwrap(), &csl::BigNum::from_str("10000").unwrap()),
      &csl::UnitInterval::new(&csl::BigNum::from_str("721").unwrap(), &csl::BigNum::from_str("10000000").unwrap()),
    );
    let config = csl::TransactionBuilderConfigBuilder::new()
      .fee_algo(&linear_fee)
      .coins_per_utxo_byte(&csl::BigNum::from_str("4310").unwrap())
      .ex_unit_prices(&ex_prices)
      .pool_deposit(&csl::BigNum::from_str("500000000").unwrap())
      .key_deposit(&csl::BigNum::from_str("2000000").unwrap())
      .max_value_size(5000)
      .max_tx_size(16384)
      .prefer_pure_change(true)
      .build()
      .unwrap();
    let mut csl_builder = csl::TransactionBuilder::new(&config);
    let mut output_assets = csl::MultiAsset::new();
    output_assets.insert(&policy, &assets);
    let mut output_value = csl::Value::new(&csl::BigNum::from_str("2000000").unwrap());
    output_value.set_multiasset(&output_assets);
    let mut output = csl::TransactionOutput::new(&addr, &output_value);
    output.set_plutus_data(&csl::PlutusData::new_empty_constr_plutus_data(&csl::BigNum::zero()));
    csl_builder.add_output(&output).unwrap();
    let mut hash_output = csl::TransactionOutput::new(
      &addr,
      &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
    );
    hash_output.set_data_hash(&csl::DataHash::from_bytes(hex::decode(datum_hash_hex).unwrap()).unwrap());
    csl_builder.add_output(&hash_output).unwrap();
    csl_builder.set_ttl(123456);
    csl_builder.add_inputs_from(&utxos, csl::CoinSelectionStrategyCIP2::LargestFirstMultiAsset).unwrap();
    assert!(csl_builder.add_change_if_needed(&addr).unwrap());
    let csl_body = csl_builder.build().unwrap();
    let csl_transaction = csl::Transaction::new(
      &csl_body,
      &csl::TransactionWitnessSet::new(),
      None,
    );
    assert_eq!(hex::encode(&cml_cbor), hex::encode(csl_transaction.to_bytes()));
  }

  #[test]
  fn rejects_token_output_below_minimum_ada() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let policy = "ab".repeat(28);
    let policy_hash = csl::ScriptHash::from_bytes(hex::decode(&policy).unwrap()).unwrap();
    let asset_name = csl::AssetName::new(vec![0x00, 0xff]).unwrap();
    let mut token_bundle = csl::Assets::new();
    token_bundle.insert(&asset_name, &csl::BigNum::from_str("1").unwrap());
    let mut multiasset = csl::MultiAsset::new();
    multiasset.insert(&policy_hash, &token_bundle);
    let mut low_value = csl::Value::new(&csl::BigNum::from_str("1000000").unwrap());
    low_value.set_multiasset(&multiasset);
    let output = csl::TransactionOutput::new(&csl::Address::from_bech32(address).unwrap(), &low_value);
    let data_cost = csl::DataCost::new_coins_per_byte(&csl::BigNum::from_str("4310").unwrap());
    let csl_minimum = csl::min_ada_for_output(&output, &data_cost).unwrap();
    assert!(csl_minimum > csl::BigNum::from_str("1000000").unwrap());
    assert_eq!(
      minimum_coin_for_assets(&format!("{}|{}~00ff~1|4310", address, policy)).unwrap(),
      csl_minimum.to_str(),
    );
    let args = format!(
      "{},0,{},10000000,{}~00ff~2|{},1000000,{}~00ff~1|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32), address, policy, address, policy, address,
    );
    assert!(build_simple_payment_transaction_hex(&args).is_err());
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
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000",
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
