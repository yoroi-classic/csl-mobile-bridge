use cml_chain::crypto::Vkeywitness;
use cml_chain::plutus::PlutusData;
use cml_chain::serialization::{Deserialize, Serialize};
use cml_chain::transaction::DatumOption;
use cml_chain::transaction::Transaction;
use cml_chain::{
  assets::{AssetName, MultiAsset},
  crypto::ScriptHash,
};
use cml_crypto::{DatumHash, PrivateKey, RawBytesEncoding};
use std::convert::TryFrom;

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ScriptUtxoArgs {
  tx_hash_hex: String,
  index: String,
  address: String,
  lovelace: String,
  assets: Vec<ScriptAssetArgs>,
  inline_datum_cbor_hex: Option<String>,
  datum_cbor_hex: Option<String>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ScriptAssetArgs {
  policy_id_hex: String,
  asset_name_hex: String,
  quantity: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ScriptOutputArgs {
  address: String,
  lovelace: String,
  assets: Vec<ScriptAssetArgs>,
  datum_cbor_hex: Option<String>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct EscrowCmlArgs {
  script_input: ScriptUtxoArgs,
  #[serde(default)]
  additional_script_inputs: Vec<AdditionalScriptInputArgs>,
  reference_script_input: ScriptUtxoArgs,
  #[serde(default)]
  reference_inputs: Vec<ScriptUtxoArgs>,
  reference_script_cbor_hex: String,
  reference_script_size: String,
  funding_inputs: Vec<ScriptUtxoArgs>,
  collateral_input: ScriptUtxoArgs,
  #[serde(default)]
  additional_collateral_inputs: Vec<ScriptUtxoArgs>,
  collateral_return: Option<ScriptOutputArgs>,
  outputs: Vec<ScriptOutputArgs>,
  change_address: String,
  script_hash_hex: String,
  redeemer_cbor_hex: String,
  redeemer_mem: String,
  redeemer_steps: String,
  validity_start: String,
  ttl: String,
  fee_coefficient: String,
  fee_constant: String,
  coins_per_utxo_byte: String,
  key_deposit: String,
  pool_deposit: String,
  max_value_size: String,
  max_tx_size: Option<String>,
  collateral_percentage: Option<String>,
  ref_script_coins_per_byte: Option<RationalArgs>,
  ref_script_tier_step_bytes: Option<String>,
  ref_script_multiplier: Option<String>,
  ex_unit_prices_memory: RationalArgs,
  ex_unit_prices_steps: RationalArgs,
  #[serde(default)]
  plutus_version: Option<String>,
  #[serde(default)]
  plutus_v1_cost_model: Option<Vec<i64>>,
  #[serde(default)]
  plutus_v2_cost_model: Option<Vec<i64>>,
  #[serde(default)]
  plutus_v3_cost_model: Vec<i64>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AdditionalScriptInputArgs {
  script_input: ScriptUtxoArgs,
  script_hash_hex: String,
  #[serde(default)]
  plutus_version: Option<String>,
  #[serde(default)]
  reference_script_input: Option<ScriptUtxoArgs>,
  #[serde(default)]
  reference_script_cbor_hex: Option<String>,
  #[serde(default)]
  reference_script_size: Option<String>,
  redeemer_cbor_hex: String,
  redeemer_mem: String,
  redeemer_steps: String,
}

fn parse_plutus_language(version: Option<&str>) -> Result<(u64, cml_chain::plutus::Language), String> {
  match version.unwrap_or("V3") {
    "V1" => Ok((0, cml_chain::plutus::Language::PlutusV1)),
    "V2" => Ok((1, cml_chain::plutus::Language::PlutusV2)),
    "V3" => Ok((2, cml_chain::plutus::Language::PlutusV3)),
    other => Err(format!("unsupported Plutus version: {other}")),
  }
}

fn spend_redeemer_index(args: &EscrowCmlArgs, tx_hash_hex: &str, index: &str) -> Result<u64, String> {
  let mut inputs = Vec::with_capacity(1 + args.additional_script_inputs.len() + args.funding_inputs.len());
  inputs.push((args.script_input.tx_hash_hex.to_ascii_lowercase(), args.script_input.index.parse::<u64>().map_err(|err| format!("invalid script input index: {err}"))?));
  inputs.extend(args.additional_script_inputs.iter().map(|spend| {
    Ok((spend.script_input.tx_hash_hex.to_ascii_lowercase(), spend.script_input.index.parse::<u64>().map_err(|err| format!("invalid script input index: {err}"))?))
  }).collect::<Result<Vec<_>, String>>()?);
  inputs.extend(args.funding_inputs.iter().map(|input| {
    Ok((input.tx_hash_hex.to_ascii_lowercase(), input.index.parse::<u64>().map_err(|err| format!("invalid funding input index: {err}"))?))
  }).collect::<Result<Vec<_>, String>>()?);
  inputs.sort();
  let wanted_index = index.parse::<u64>().map_err(|err| format!("invalid script input index: {err}"))?;
  let wanted_hash = tx_hash_hex.to_ascii_lowercase();
  inputs.iter().position(|input| input.0 == wanted_hash && input.1 == wanted_index)
    .map(|position| position as u64)
    .ok_or_else(|| "script input is missing from the transaction inputs".to_owned())
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct RationalArgs {
  numerator: String,
  denominator: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct WalletSigningArgs {
  transaction_hex: String,
  master_key_hex: String,
  purpose: String,
  coin_type: String,
  account_index: String,
  staking_role: Option<String>,
  staking_index: Option<String>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AccountPublicKeyArgs {
  master_key_hex: String,
  purpose: String,
  coin_type: String,
  account_index: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct WalletPathSigningArgs {
  transaction_hex: String,
  master_key_hex: String,
  signer_paths: Vec<Vec<u32>>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct WalletDataSigningArgs {
  message_hex: String,
  master_key_hex: String,
  signer_path: Vec<u32>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct WalletPublicKeyArgs {
  master_key_hex: String,
  signer_path: Vec<u32>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct StakeCertificateArgs {
  kind: String,
  stake_credential_key_hash_hex: String,
  pool_key_hash: Option<String>,
  drep: Option<DRepArgs>,
}

#[derive(serde::Deserialize)]
enum DRepArgs {
  AlwaysAbstain,
  AlwaysNoConfidence,
  #[serde(rename = "KeyHash")]
  KeyHash(String),
  #[serde(rename = "ScriptHash")]
  ScriptHash(String),
}

fn parse_drep_arg(value: DRepArgs) -> Result<cml_chain::certs::DRep, String> {
  use cml_chain::certs::DRep;
  use cml_chain::crypto::Ed25519KeyHash;

  match value {
    DRepArgs::AlwaysAbstain => Ok(DRep::new_always_abstain()),
    DRepArgs::AlwaysNoConfidence => Ok(DRep::new_always_no_confidence()),
    DRepArgs::KeyHash(hash) => {
      let bytes = hex::decode(&hash).map_err(|err| format!("invalid DRep key hash: {err}"))?;
      Ok(DRep::new_key(Ed25519KeyHash::from_raw_bytes(&bytes).map_err(|err| err.to_string())?))
    }
    DRepArgs::ScriptHash(hash) => {
      let bytes = hex::decode(&hash).map_err(|err| format!("invalid DRep script hash: {err}"))?;
      Ok(DRep::new_script(ScriptHash::from_raw_bytes(&bytes).map_err(|err| err.to_string())?))
    }
  }
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct WithdrawalArgs {
  reward_address: String,
  amount: String,
}

/// Build a payment with ADA and multiasset values using CML.
///
/// The delimited argument format is intentionally narrow while the mobile
/// builder API is being replaced. All integer quantities are decimal strings
/// so the JS boundary does not lose lovelace precision.
pub fn build_simple_payment_transaction_hex(args: &str) -> Result<String, String> {
  use cml_chain::{
    assets::Value,
    builders::{
      certificate_builder::SingleCertificateBuilder,
      input_builder::SingleInputBuilder,
      mint_builder::SingleMintBuilder,
      output_builder::TransactionOutputBuilder,
      tx_builder::{ChangeSelectionAlgo, TransactionBuilder, TransactionBuilderConfigBuilder},
      witness_builder::NativeScriptWitnessInfo,
    },
    certs::{Certificate, StakeCredential},
    crypto::{Ed25519KeyHash, TransactionHash},
    fees::LinearFee,
    plutus::ExUnitPrices,
    serialization::{Deserialize, Serialize},
    transaction::{TransactionInput, TransactionOutput},
    Rational,
  };

  let fields = args.split('|').collect::<Vec<_>>();
  if !(10..=16).contains(&fields.len()) {
    return Err(format!("expected 10 to 16 payment fields, received {}", fields.len()));
  }
  let parse_u64 = |index: usize, name: &str| -> Result<u64, String> {
    fields[index].parse::<u64>().map_err(|err| format!("invalid {name}: {err}"))
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
    // This endpoint does not accept Plutus scripts or redeemers, so execution
    // prices cannot affect its fee calculation. CML requires the config field.
    .ex_unit_prices(ExUnitPrices::new(Rational::new(0, 1), Rational::new(0, 1)))
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
      return Err(
        "each input must contain hash,index,address,lovelace,assets[,nativeScriptHex,witnessCount]"
          .to_owned(),
      );
    }
    let hash = hex::decode(input_fields[0]).map_err(|err| format!("invalid input hash: {err}"))?;
    let hash = TransactionHash::from_raw_bytes(&hash).map_err(|err| err.to_string())?;
    let index =
      input_fields[1].parse::<u64>().map_err(|err| format!("invalid input index: {err}"))?;
    let address = parse_payment_address(input_fields[2])?;
    let coin =
      input_fields[3].parse::<u64>().map_err(|err| format!("invalid input coin: {err}"))?;
    let input = TransactionInput::new(hash, index);
    let utxo = TransactionOutput::new(
      address,
      Value::new(coin, parse_multiasset(input_fields[4])?),
      None,
      None,
    );
    let input_builder = SingleInputBuilder::new(input, utxo);
    let input_result = if input_fields.len() == 7 && input_fields[5] != "-" {
      let script_bytes =
        hex::decode(input_fields[5]).map_err(|err| format!("invalid native script: {err}"))?;
      let script = cml_chain::transaction::NativeScript::from_cbor_bytes(&script_bytes)
        .map_err(|err| format!("invalid native script CBOR: {err}"))?;
      let witness_info = if input_fields[6] == "-" {
        NativeScriptWitnessInfo::assume_signature_count()
      } else {
        let count = input_fields[6]
          .parse::<usize>()
          .map_err(|err| format!("invalid native script witness count: {err}"))?;
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
    let coin =
      output_fields[1].parse::<u64>().map_err(|err| format!("invalid output coin: {err}"))?;
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
          let bytes =
            hex::decode(datum[1]).map_err(|err| format!("invalid inline datum: {err}"))?;
          DatumOption::new_datum(
            PlutusData::from_cbor_bytes(&bytes).map_err(|err| err.to_string())?,
          )
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
  if fields.len() >= 11 {
    if let Some(auxiliary_data) = parse_auxiliary_metadata(fields[10])? {
      builder.set_auxiliary_data(auxiliary_data);
    }
  }
  if fields.len() >= 12 && fields[11] != "-" {
    for packed_mint in fields[11].split(';') {
      let mint_fields = packed_mint.splitn(4, ',').collect::<Vec<_>>();
      if mint_fields.len() != 4 || mint_fields[1] != "native" {
        return Err(
          "each supported mint must contain policyHex,native,scriptCborHex,assets".to_owned(),
        );
      }
      let script_bytes =
        hex::decode(mint_fields[2]).map_err(|err| format!("invalid mint native script: {err}"))?;
      let script = cml_chain::transaction::NativeScript::from_cbor_bytes(&script_bytes)
        .map_err(|err| format!("invalid mint native script CBOR: {err}"))?;
      let policy =
        hex::decode(mint_fields[0]).map_err(|err| format!("invalid mint policy: {err}"))?;
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
        let name_bytes = hex::decode(asset_fields[0])
          .map_err(|err| format!("invalid minted asset name: {err}"))?;
        let name = AssetName::new(name_bytes).map_err(|err| err.to_string())?;
        let quantity =
          asset_fields[1].parse::<i64>().map_err(|err| format!("invalid mint quantity: {err}"))?;
        mint_assets.insert(name, quantity);
      }
      builder
        .add_mint(
          SingleMintBuilder::new(mint_assets)
            .native_script(script, NativeScriptWitnessInfo::assume_signature_count()),
        )
        .map_err(|err| err.to_string())?;
    }
  }
  if fields.len() >= 13 && fields[12] != "-" {
    let certificate_json = String::from_utf8(decode_percent_encoded(fields[12])?)
      .map_err(|err| format!("stake certificate JSON is not UTF-8: {err}"))?;
    let certificates: Vec<StakeCertificateArgs> = serde_json::from_str(&certificate_json)
      .map_err(|err| format!("invalid stake certificates: {err}"))?;
    for certificate in certificates {
      let stake_hash_bytes = hex::decode(&certificate.stake_credential_key_hash_hex)
        .map_err(|err| format!("invalid stake credential key hash: {err}"))?;
      let stake_hash = Ed25519KeyHash::from_raw_bytes(&stake_hash_bytes)
        .map_err(|err| format!("invalid stake credential key hash: {err}"))?;
      let credential = StakeCredential::new_pub_key(stake_hash);
      let cert = match certificate.kind.as_str() {
        "StakeRegistration" => Certificate::new_stake_registration(credential),
        "StakeDeregistration" => Certificate::new_stake_deregistration(credential),
        "StakeDelegation" => {
          let pool_hash = certificate
            .pool_key_hash
            .ok_or_else(|| "stake delegation is missing pool key hash".to_owned())?;
          let pool_hash_bytes =
            hex::decode(&pool_hash).map_err(|err| format!("invalid stake pool key hash: {err}"))?;
          let pool_hash = Ed25519KeyHash::from_raw_bytes(&pool_hash_bytes)
            .map_err(|err| format!("invalid stake pool key hash: {err}"))?;
          Certificate::new_stake_delegation(credential, pool_hash)
        }
        "VoteDelegation" => Certificate::new_vote_deleg_cert(
          credential,
          parse_drep_arg(certificate.drep.ok_or_else(|| "vote delegation is missing DRep".to_owned())?)?,
        ),
        "StakeAndVoteDelegation" => {
          let pool_hash = certificate.pool_key_hash
            .ok_or_else(|| "stake/vote delegation is missing pool key hash".to_owned())?;
          let pool_hash = Ed25519KeyHash::from_raw_bytes(
            &hex::decode(&pool_hash).map_err(|err| format!("invalid stake pool key hash: {err}"))?,
          ).map_err(|err| err.to_string())?;
          let drep = parse_drep_arg(certificate.drep.ok_or_else(|| "stake/vote delegation is missing DRep".to_owned())?)?;
          Certificate::new_stake_vote_deleg_cert(credential, pool_hash, drep)
        }
        "StakeRegistrationAndDelegation" => {
          let pool_hash = certificate.pool_key_hash
            .ok_or_else(|| "stake registration/delegation is missing pool key hash".to_owned())?;
          let pool_hash = Ed25519KeyHash::from_raw_bytes(
            &hex::decode(&pool_hash).map_err(|err| format!("invalid stake pool key hash: {err}"))?,
          ).map_err(|err| err.to_string())?;
          Certificate::new_stake_reg_deleg_cert(credential, pool_hash, key_deposit)
        }
        "VoteRegistrationAndDelegation" => {
          let drep = parse_drep_arg(certificate.drep.ok_or_else(|| "vote registration/delegation is missing DRep".to_owned())?)?;
          Certificate::new_vote_reg_deleg_cert(credential, drep, key_deposit)
        }
        "StakeVoteRegistrationAndDelegation" => {
          let pool_hash = certificate.pool_key_hash
            .ok_or_else(|| "stake/vote registration is missing pool key hash".to_owned())?;
          let pool_hash = Ed25519KeyHash::from_raw_bytes(
            &hex::decode(&pool_hash).map_err(|err| format!("invalid stake pool key hash: {err}"))?,
          ).map_err(|err| err.to_string())?;
          let drep = parse_drep_arg(certificate.drep.ok_or_else(|| "stake/vote registration is missing DRep".to_owned())?)?;
          Certificate::new_stake_vote_reg_deleg_cert(credential, pool_hash, drep, key_deposit)
        }
        unsupported => return Err(format!("unsupported stake certificate: {unsupported}")),
      };
      let cert_result = if certificate.kind == "StakeRegistration" {
        SingleCertificateBuilder::new(cert).skip_witness()
      } else {
        SingleCertificateBuilder::new(cert).payment_key().map_err(|err| err.to_string())?
      };
      builder.add_cert(cert_result);
    }
  }
  if fields.len() >= 14 && fields[13] != "-" {
    use cml_chain::builders::withdrawal_builder::SingleWithdrawalBuilder;
    use cml_chain::address::RewardAddress;
    let withdrawal_json = String::from_utf8(decode_percent_encoded(fields[13])?)
      .map_err(|err| format!("withdrawal JSON is not UTF-8: {err}"))?;
    let withdrawals: Vec<WithdrawalArgs> = serde_json::from_str(&withdrawal_json)
      .map_err(|err| format!("invalid withdrawals: {err}"))?;
    for withdrawal in withdrawals {
      let address = parse_payment_address(&withdrawal.reward_address)?;
      let reward_address = RewardAddress::from_address(&address)
        .ok_or_else(|| "withdrawal address is not a reward address".to_owned())?;
      let amount = withdrawal.amount.parse::<u64>()
        .map_err(|err| format!("invalid withdrawal amount: {err}"))?;
      builder.add_withdrawal(
        SingleWithdrawalBuilder::new(reward_address, amount)
          .payment_key()
          .map_err(|err| err.to_string())?,
      );
    }
  }
  if fields.len() >= 16 && fields[15] != "-" {
    use cml_chain::builders::tx_builder::TransactionUnspentOutput;
    for packed_input in fields[15].split(';') {
      let input_fields = packed_input.split(',').collect::<Vec<_>>();
      if input_fields.len() != 5 {
        return Err("each reference input must contain hash,index,address,lovelace,assets".to_owned());
      }
      let hash = hex::decode(input_fields[0])
        .map_err(|err| format!("invalid reference input hash: {err}"))?;
      let hash = TransactionHash::from_raw_bytes(&hash).map_err(|err| err.to_string())?;
      let index = input_fields[1]
        .parse::<u64>()
        .map_err(|err| format!("invalid reference input index: {err}"))?;
      let address = parse_payment_address(input_fields[2])?;
      let coin = input_fields[3]
        .parse::<u64>()
        .map_err(|err| format!("invalid reference input coin: {err}"))?;
      let output = TransactionOutput::new(
        address,
        Value::new(coin, parse_multiasset(input_fields[4])?),
        None,
        None,
      );
      builder.add_reference_input(TransactionUnspentOutput::new(
        cml_chain::transaction::TransactionInput::new(hash, index),
        output,
      ));
    }
  }
  if fields.len() >= 15 && fields[14] != "-" {
    builder.set_validity_start_interval(parse_u64(14, "validity start")?);
  }
  builder.set_ttl(ttl);
  let mut tx = builder
    .build(ChangeSelectionAlgo::Default, &change_address)
    .map_err(|err| err.to_string())?
    .build_unchecked();
  // CSL serializes native scripts by descending script hash. CML's ordered
  // witness collection follows registration order, so normalize it here for
  // byte-for-byte compatibility with existing Yoroi fixtures.
  if let Some(native_scripts) = tx.witness_set.native_scripts.as_mut() {
    native_scripts.sort_by_key(|script| std::cmp::Reverse(script.hash().to_raw_bytes().to_vec()));
  }
  Ok(format!("{}|{}", hex::encode(tx.to_cbor_bytes()), tx.body.fee))
}

/// Build the current escrow redemption shape with CML. This narrow recipe is
/// deliberately separate from the generic payment DTO: it accepts Plutus V1/V2/V3
/// spends with inline or explicit datum, one reference script output,
/// key funding inputs, and one collateral input.
pub fn build_escrow_redeem_transaction_hex(args: &str) -> Result<String, String> {
  use cml_chain::{
    assets::Value,
    builders::{
      input_builder::SingleInputBuilder,
      output_builder::TransactionOutputBuilder,
      redeemer_builder::RedeemerWitnessKey,
      tx_builder::{ChangeSelectionAlgo, TransactionBuilder, TransactionBuilderConfigBuilder},
      witness_builder::{PartialPlutusWitness, PlutusScriptWitness},
    },
    crypto::TransactionHash,
    fees::LinearFee,
    plutus::{
      CostModels, ExUnitPrices, ExUnits, Language, PlutusData, RedeemerKey, RedeemerTag,
      RedeemerVal, Redeemers,
    },
    transaction::{ConwayFormatTxOut, DatumOption, TransactionInput, TransactionOutput},
    Rational, RequiredSigners, Script,
  };

  let args: EscrowCmlArgs =
    serde_json::from_str(args).map_err(|err| format!("invalid escrow CML arguments: {err}"))?;
  let parse_u64 =
    |value: &str, name: &str| value.parse::<u64>().map_err(|err| format!("invalid {name}: {err}"));
  let parse_hash = |value: &str, name: &str| -> Result<TransactionHash, String> {
    let bytes = hex::decode(value).map_err(|err| format!("invalid {name}: {err}"))?;
    TransactionHash::from_raw_bytes(&bytes).map_err(|err| format!("invalid {name}: {err}"))
  };
  let parse_input =
    |utxo: &ScriptUtxoArgs| -> Result<(TransactionInput, TransactionOutput), String> {
      let input = TransactionInput::new(
        parse_hash(&utxo.tx_hash_hex, "UTxO tx hash")?,
        parse_u64(&utxo.index, "UTxO index")?,
      );
      let address = parse_payment_address(&utxo.address)?;
      let assets = parse_assets(&utxo.assets)?;
      let coin = parse_u64(&utxo.lovelace, "UTxO lovelace")?;
      Ok((
        input,
        TransactionOutput::new_conway_format_tx_out(ConwayFormatTxOut::new(
          address,
          Value::new(coin, assets),
        )),
      ))
    };

  let mut cost_models = cml_chain::plutus::CostModels::default();
  let mut cost_model_map = cml_chain::OrderedHashMap::new();
  if let Some(model) = &args.plutus_v1_cost_model { cost_model_map.insert(0, model.clone()); }
  if let Some(model) = &args.plutus_v2_cost_model { cost_model_map.insert(1, model.clone()); }
  if !args.plutus_v3_cost_model.is_empty() { cost_model_map.insert(2, args.plutus_v3_cost_model.clone()); }
  let (language_index, language) = parse_plutus_language(args.plutus_version.as_deref())?;
  if !cost_model_map.contains_key(&language_index) {
    return Err(format!("missing cost model for Plutus {}", args.plutus_version.as_deref().unwrap_or("V3")));
  }
  cost_models.inner = cost_model_map;
  let config_models = cost_models.clone();
  let config_builder = TransactionBuilderConfigBuilder::new()
    .fee_algo(LinearFee::new(
      parse_u64(&args.fee_coefficient, "fee coefficient")?,
      parse_u64(&args.fee_constant, "fee constant")?,
      0,
    ))
    .coins_per_utxo_byte(parse_u64(&args.coins_per_utxo_byte, "coins per UTxO byte")?)
    .ex_unit_prices(ExUnitPrices::new(
      Rational::new(
        parse_u64(&args.ex_unit_prices_memory.numerator, "memory price numerator")?,
        parse_u64(&args.ex_unit_prices_memory.denominator, "memory price denominator")?,
      ),
      Rational::new(
        parse_u64(&args.ex_unit_prices_steps.numerator, "steps price numerator")?,
        parse_u64(&args.ex_unit_prices_steps.denominator, "steps price denominator")?,
      ),
    ))
    .pool_deposit(parse_u64(&args.pool_deposit, "pool deposit")?)
    .key_deposit(parse_u64(&args.key_deposit, "key deposit")?)
    .max_value_size(
      u32::try_from(parse_u64(&args.max_value_size, "max value size")?)
        .map_err(|err| err.to_string())?,
    )
    .max_tx_size(
      u32::try_from(parse_u64(args.max_tx_size.as_deref().unwrap_or("16384"), "max tx size")?)
        .map_err(|err| err.to_string())?,
    )
    .collateral_percentage(
      u32::try_from(parse_u64(
        args.collateral_percentage.as_deref().unwrap_or("150"),
        "collateral percentage",
      )?)
      .map_err(|err| err.to_string())?,
    )
    .max_collateral_inputs(3)
    .cost_models(cost_models)
    .prefer_pure_change(true);
  let config = config_builder.build().map_err(|err| err.to_string())?;
  let mut builder = TransactionBuilder::new(config);
  let change_address = parse_payment_address(&args.change_address)?;

  // A ref input must be registered before the Plutus input so CML can resolve
  // the referenced script hash from the supplied output.
  let (reference_input, mut reference_output) = parse_input(&args.reference_script_input)?;
  let script_bytes = hex::decode(&args.reference_script_cbor_hex)
    .map_err(|err| format!("invalid reference script CBOR: {err}"))?;
  let reference_script_size = parse_u64(&args.reference_script_size, "reference script size")?;
  if script_bytes.len() as u64 != reference_script_size {
    return Err("reference script size does not match supplied script bytes".to_owned());
  }
  let script_ref = match language {
    Language::PlutusV1 => Script::new_plutus_v1(cml_chain::plutus::PlutusV1Script::new(script_bytes)),
    Language::PlutusV2 => Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(script_bytes)),
    Language::PlutusV3 => Script::new_plutus_v3(cml_chain::plutus::PlutusV3Script::new(script_bytes)),
  };
  let expected_hash_bytes =
    hex::decode(&args.script_hash_hex).map_err(|err| format!("invalid script hash: {err}"))?;
  let expected_hash = cml_crypto::ScriptHash::from_raw_bytes(&expected_hash_bytes)
    .map_err(|err| format!("invalid script hash: {err}"))?;
  if script_ref.hash() != expected_hash {
    return Err("reference script bytes do not match requested script hash".to_owned());
  }
  match &mut reference_output {
    TransactionOutput::ConwayFormatTxOut(output) => output.script_reference = Some(script_ref),
    _ => return Err("reference output is not Conway format".to_owned()),
  }
  builder.add_reference_input(cml_chain::builders::tx_builder::TransactionUnspentOutput::new(
    reference_input,
    reference_output,
  ));

  let mut used_languages = vec![language];
  let mut reference_script_sizes = vec![(args.reference_script_input.tx_hash_hex.to_ascii_lowercase(), args.reference_script_input.index.clone(), reference_script_size)];
  for spend in &args.additional_script_inputs {
    let (language_index, spend_language) = parse_plutus_language(spend.plutus_version.as_deref().or(args.plutus_version.as_deref()))?;
    if !config_models.inner.contains_key(&language_index) {
      return Err(format!("missing cost model for Plutus {}", spend.plutus_version.as_deref().or(args.plutus_version.as_deref()).unwrap_or("V3")));
    }
    if !used_languages.contains(&spend_language) { used_languages.push(spend_language); }
    match (&spend.reference_script_input, &spend.reference_script_cbor_hex, &spend.reference_script_size) {
      (Some(utxo), Some(cbor), Some(size)) => {
        let bytes = hex::decode(cbor).map_err(|err| format!("invalid additional reference script CBOR: {err}"))?;
        let size_num = parse_u64(size, "additional reference script size")?;
        if bytes.len() as u64 != size_num { return Err("additional reference script size does not match supplied script bytes".to_owned()); }
        let script = match spend_language {
          Language::PlutusV1 => Script::new_plutus_v1(cml_chain::plutus::PlutusV1Script::new(bytes)),
          Language::PlutusV2 => Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(bytes)),
          Language::PlutusV3 => Script::new_plutus_v3(cml_chain::plutus::PlutusV3Script::new(bytes)),
        };
        let hash = ScriptHash::from_raw_bytes(&hex::decode(&spend.script_hash_hex).map_err(|err| format!("invalid additional script hash: {err}"))?).map_err(|err| err.to_string())?;
        if script.hash() != hash { return Err("additional reference script bytes do not match requested script hash".to_owned()); }
        let (input, mut output) = parse_input(utxo)?;
        match &mut output { TransactionOutput::ConwayFormatTxOut(output) => output.script_reference = Some(script), _ => return Err("additional reference output is not Conway format".to_owned()) }
        builder.add_reference_input(cml_chain::builders::tx_builder::TransactionUnspentOutput::new(input, output));
        reference_script_sizes.push((utxo.tx_hash_hex.to_ascii_lowercase(), utxo.index.clone(), size_num));
      }
      (None, None, None) => {},
      _ => return Err("additional reference script requires UTxO, CBOR, and size".to_owned()),
    }
  }
  used_languages.sort_by_key(|language| match language {
    // CBOR canonical key ordering puts integer language IDs before the
    // Plutus V1 byte-string key, whose wire encoding is the historical bug.
    Language::PlutusV2 => 0,
    Language::PlutusV3 => 1,
    Language::PlutusV1 => 2,
  });

  for reference_input in &args.reference_inputs {
    let (input, output) = parse_input(reference_input)?;
    builder.add_reference_input(
      cml_chain::builders::tx_builder::TransactionUnspentOutput::new(input, output),
    );
  }

  for funding in &args.funding_inputs {
    let (input, output) = parse_input(funding)?;
    let result =
      SingleInputBuilder::new(input, output).payment_key().map_err(|err| err.to_string())?;
    builder.add_input(result).map_err(|err| err.to_string())?;
  }

  let (collateral_input, collateral_output) = parse_input(&args.collateral_input)?;
  let collateral = SingleInputBuilder::new(collateral_input, collateral_output)
    .payment_key()
    .map_err(|err| err.to_string())?;
  builder.add_collateral(collateral).map_err(|err| err.to_string())?;
  for collateral_input in &args.additional_collateral_inputs {
    let (input, output) = parse_input(collateral_input)?;
    let collateral = SingleInputBuilder::new(input, output)
      .payment_key()
      .map_err(|err| err.to_string())?;
    builder.add_collateral(collateral).map_err(|err| err.to_string())?;
  }
  if let Some(output) = &args.collateral_return {
    let address = parse_payment_address(&output.address)?;
    let collateral_return = TransactionOutput::new(
      address,
      Value::new(
        parse_u64(&output.lovelace, "collateral return lovelace")?,
        parse_assets(&output.assets)?,
      ),
      None,
      None,
    );
    builder.set_collateral_return(collateral_return);
  }

  let (script_input, mut script_output) = parse_input(&args.script_input)?;
  let inline_datum_bytes = args.script_input.inline_datum_cbor_hex.as_deref()
    .map(|hex| hex::decode(hex).map_err(|err| format!("invalid inline datum CBOR: {err}")))
    .transpose()?;
  if let Some(datum_bytes) = &inline_datum_bytes {
    match &mut script_output {
      TransactionOutput::ConwayFormatTxOut(output) => {
        output.datum_option = Some(DatumOption::new_datum(
          PlutusData::from_cbor_bytes(datum_bytes).map_err(|err| err.to_string())?,
        ))
      }
      _ => return Err("script input is not Conway format".to_owned()),
    }
  }
  let redeemer_bytes =
    hex::decode(&args.redeemer_cbor_hex).map_err(|err| format!("invalid redeemer CBOR: {err}"))?;
  let redeemer = PlutusData::from_cbor_bytes(&redeemer_bytes).map_err(|err| err.to_string())?;
  let partial_witness =
    PartialPlutusWitness::new(PlutusScriptWitness::Ref(expected_hash.clone()), redeemer);
  let script_redeemer_index = spend_redeemer_index(
    &args,
    &args.script_input.tx_hash_hex,
    &args.script_input.index,
  )?;
  let script_input_builder = SingleInputBuilder::new(script_input.clone(), script_output);
  let script_result = if inline_datum_bytes.is_some() {
    script_input_builder.plutus_script_inline_datum(
      partial_witness,
      RequiredSigners::from(Vec::new()),
    )
  } else if let Some(datum_hex) = args.script_input.datum_cbor_hex.as_deref() {
    let datum_bytes = hex::decode(datum_hex)
      .map_err(|err| format!("invalid spending datum CBOR: {err}"))?;
    let datum = PlutusData::from_cbor_bytes(&datum_bytes).map_err(|err| err.to_string())?;
    script_input_builder.plutus_script(
      partial_witness,
      RequiredSigners::from(Vec::new()),
      datum,
    )
  } else {
    return Err("script input must carry inline or explicit datum CBOR".to_owned());
  }
  .map_err(|err| err.to_string())?;
  builder.add_input(script_result).map_err(|err| err.to_string())?;
  builder.set_exunits(
    RedeemerWitnessKey::new(RedeemerTag::Spend, script_redeemer_index),
    ExUnits::new(
      parse_u64(&args.redeemer_mem, "redeemer memory")?,
      parse_u64(&args.redeemer_steps, "redeemer steps")?,
    ),
  );

  for spend in &args.additional_script_inputs {
    let (_, _spend_language) = parse_plutus_language(spend.plutus_version.as_deref().or(args.plutus_version.as_deref()))?;
    let spend_hash_bytes = hex::decode(&spend.script_hash_hex)
      .map_err(|err| format!("invalid additional script hash: {err}"))?;
    let spend_hash = ScriptHash::from_raw_bytes(&spend_hash_bytes).map_err(|err| err.to_string())?;
    let spend_hash_for_witness = if spend.reference_script_input.is_some() { spend_hash.clone() } else {
      if spend_hash != expected_hash { return Err("additional script hash requires its own reference script output".to_owned()); }
      spend_hash.clone()
    };
    let (input, mut output) = parse_input(&spend.script_input)?;
    let inline_datum = spend.script_input.inline_datum_cbor_hex.as_deref()
      .map(|hex| hex::decode(hex).map_err(|err| format!("invalid inline datum CBOR: {err}")))
      .transpose()?;
    if let Some(bytes) = &inline_datum {
      match &mut output {
        TransactionOutput::ConwayFormatTxOut(output) => {
          output.datum_option = Some(DatumOption::new_datum(
            PlutusData::from_cbor_bytes(bytes).map_err(|err| err.to_string())?,
          ));
        }
        _ => return Err("script input is not Conway format".to_owned()),
      }
    }
    let redeemer_bytes = hex::decode(&spend.redeemer_cbor_hex)
      .map_err(|err| format!("invalid redeemer CBOR: {err}"))?;
    let redeemer = PlutusData::from_cbor_bytes(&redeemer_bytes).map_err(|err| err.to_string())?;
    let witness = PartialPlutusWitness::new(
      PlutusScriptWitness::Ref(spend_hash_for_witness),
      redeemer,
    );
    let input_builder = SingleInputBuilder::new(input, output);
    let result = if inline_datum.is_some() {
      input_builder.plutus_script_inline_datum(witness, RequiredSigners::from(Vec::new()))
    } else if let Some(datum_hex) = spend.script_input.datum_cbor_hex.as_deref() {
      let bytes = hex::decode(datum_hex).map_err(|err| format!("invalid spending datum CBOR: {err}"))?;
      let datum = PlutusData::from_cbor_bytes(&bytes).map_err(|err| err.to_string())?;
      input_builder.plutus_script(witness, RequiredSigners::from(Vec::new()), datum)
    } else {
      return Err("script input must carry inline or explicit datum CBOR".to_owned());
    }
    .map_err(|err| err.to_string())?;
    let redeemer_index = spend_redeemer_index(&args, &spend.script_input.tx_hash_hex, &spend.script_input.index)?;
    builder.add_input(result).map_err(|err| err.to_string())?;
    builder.set_exunits(
      RedeemerWitnessKey::new(RedeemerTag::Spend, redeemer_index),
      ExUnits::new(
        parse_u64(&spend.redeemer_mem, "redeemer memory")?,
        parse_u64(&spend.redeemer_steps, "redeemer steps")?,
      ),
    );
  }

  for output in args.outputs {
    let address = parse_payment_address(&output.address)?;
    let datum = output
      .datum_cbor_hex
      .map(|hex| {
        let bytes = hex::decode(hex).map_err(|err| format!("invalid output datum CBOR: {err}"))?;
        PlutusData::from_cbor_bytes(&bytes)
          .map(DatumOption::new_datum)
          .map_err(|err| err.to_string())
      })
      .transpose()?;
    let mut output_builder = TransactionOutputBuilder::new().with_address(address);
    if let Some(datum) = datum {
      output_builder = output_builder.with_data(datum);
    }
    let output = output_builder
      .next()
      .map_err(|err| err.to_string())?
      .with_value(Value::new(
        parse_u64(&output.lovelace, "output lovelace")?,
        parse_assets(&output.assets)?,
      ))
      .build()
      .map_err(|err| err.to_string())?;
    builder.add_output(output).map_err(|err| err.to_string())?;
  }
  if args.validity_start != "-" {
    builder.set_validity_start_interval(parse_u64(&args.validity_start, "validity start")?);
  }
  builder.set_ttl(parse_u64(&args.ttl, "TTL")?);
  let mut tx = builder
    .build(ChangeSelectionAlgo::Default, &change_address)
    .map_err(|err| err.to_string())?
    .build_unchecked();
  let cml_estimated_tx_size = tx.to_cbor_bytes().len();
  // CSL serializes redeemers as the Conway map representation. CML's builder
  // currently emits legacy arrays; normalize and re-hash script data to match.
  if let Some(Redeemers::ArrLegacyRedeemer { arr_legacy_redeemer, .. }) =
    tx.witness_set.redeemers.take()
  {
    let mut map = cml_chain::OrderedHashMap::new();
    for redeemer in arr_legacy_redeemer {
      map.insert(
        RedeemerKey::new(redeemer.tag, redeemer.index),
        RedeemerVal::new(redeemer.data, redeemer.ex_units),
      );
    }
    tx.witness_set.redeemers = Some(Redeemers::new_map_redeemer_key_to_redeemer_val(map));
  }
  // CSL's script-data hash and witness serializer use an indefinite-length
  // CBOR set for datum witnesses. CML's builder creates a definite-length set;
  // preserve the CSL wire encoding by round-tripping the datum set through its
  // ledger-compatible indefinite encoding before hashing and serialization.
  if let Some(datums) = tx.witness_set.plutus_datums.take() {
    let mut datum_set_bytes = vec![0xd9, 0x01, 0x02, 0x9f];
    for datum in &datums {
      datum_set_bytes.extend(datum.to_cbor_bytes());
    }
    datum_set_bytes.push(0xff);
    let datums = cml_chain::NonemptySetPlutusData::from_cbor_bytes(&datum_set_bytes)
      .map_err(|err| err.to_string())?;
    tx.witness_set.plutus_datums = Some(datums);
  }
  if tx.body.required_signers.as_ref().is_some_and(|signers| signers.is_empty()) {
    tx.body.required_signers = None;
  }
  if let Some(redeemers) = &tx.witness_set.redeemers {
    let datums = tx.witness_set.plutus_datums.clone().unwrap_or_else(|| Vec::new().into());
    tx.body.script_data_hash = cml_chain::crypto::hash::calc_script_data_hash(
      redeemers,
      &datums,
      &config_models,
      &used_languages,
      None,
    )
    .map_err(|err| err.to_string())?;
  }
  let compatibility_size_delta = tx
    .to_cbor_bytes()
    .len()
    .checked_sub(cml_estimated_tx_size)
    .ok_or("CML compatibility serialization unexpectedly reduced transaction size")?
    as u64;
  let mut reference_script_fee = 0;
  if let Some(cost) = &args.ref_script_coins_per_byte {
    reference_script_sizes.sort();
    for pair in reference_script_sizes.windows(2) {
      if pair[0].0 == pair[1].0 && pair[0].1 == pair[1].1 && pair[0].2 != pair[1].2 {
        return Err("the same reference input has conflicting script sizes".to_owned());
      }
    }
    reference_script_sizes.dedup_by(|a, b| a.0 == b.0 && a.1 == b.1);
    let size = reference_script_sizes.iter().try_fold(0u64, |total, entry| total.checked_add(entry.2).ok_or("reference script size overflow"))?;
    let tier_step = parse_u64(
      args.ref_script_tier_step_bytes.as_deref().ok_or("reference script tier step missing")?,
      "reference script tier step",
    )?;
    let multiplier =
      args.ref_script_multiplier.as_deref().ok_or("reference script multiplier missing")?;
    let ref_fee = calculate_reference_script_fee(
      size,
      parse_u64(&cost.numerator, "reference script cost numerator")?,
      parse_u64(&cost.denominator, "reference script cost denominator")?,
      tier_step,
      multiplier,
    )?;
    reference_script_fee = ref_fee;
  }
  let has_explicit_datum = args.script_input.datum_cbor_hex.is_some()
    || args.additional_script_inputs.iter().any(|spend| spend.script_input.datum_cbor_hex.is_some());
  if reference_script_fee > 0 || has_explicit_datum {
    add_reference_fee_and_rebalance(
      &mut tx,
      reference_script_fee,
      parse_u64(&args.fee_coefficient, "fee coefficient")?,
      parse_u64(&args.fee_constant, "fee constant")?,
      compatibility_size_delta,
    )?;
  }
  Ok(format!("{}|{}", hex::encode(tx.to_cbor_bytes()), tx.body.fee))
}

fn gcd_u128(mut a: u128, mut b: u128) -> u128 {
  while b != 0 {
    let remainder = a % b;
    a = b;
    b = remainder;
  }
  a
}

fn calculate_reference_script_fee(
  total_size: u64, coins_num: u64, coins_den: u64, tier_step_bytes: u64, multiplier: &str,
) -> Result<u64, String> {
  if coins_den == 0 || tier_step_bytes == 0 || coins_num == 0 {
    return Err("invalid reference script fee parameters".to_owned());
  }
  let (mult_num, mult_den) = parse_decimal_ratio(multiplier)?;
  if mult_num == 0 || mult_den == 0 {
    return Err("reference script multiplier must be positive".to_owned());
  }
  let mut total_num = 0u128;
  let mut total_den = 1u128;
  let full_tiers = total_size / tier_step_bytes;
  let partial = total_size % tier_step_bytes;
  for tier in 0..=full_tiers {
    let bytes = if tier < full_tiers { tier_step_bytes } else { partial };
    if bytes == 0 {
      continue;
    }
    let tier_num = u128::from(coins_num)
      .checked_mul(u128::from(bytes))
      .and_then(|v| v.checked_mul(mult_num.checked_pow(u32::try_from(tier).ok()?)?))
      .ok_or("reference script fee numerator overflow")?;
    let tier_den = u128::from(coins_den)
      .checked_mul(
        mult_den
          .checked_pow(u32::try_from(tier).map_err(|_| "reference script tier overflow")?)
          .ok_or("reference script denominator overflow")?,
      )
      .ok_or("reference script denominator overflow")?;
    let common = gcd_u128(total_den, tier_den);
    let left_factor = tier_den / common;
    let right_factor = total_den / common;
    total_num = total_num
      .checked_mul(left_factor)
      .and_then(|v| tier_num.checked_mul(right_factor).and_then(|term| v.checked_add(term)))
      .ok_or("reference script fee sum overflow")?;
    total_den =
      total_den.checked_mul(left_factor).ok_or("reference script fee denominator overflow")?;
    let reduce = gcd_u128(total_num, total_den);
    total_num /= reduce;
    total_den /= reduce;
  }
  u64::try_from(total_num / total_den).map_err(|_| "reference script fee exceeds u64".to_owned())
}

fn parse_decimal_ratio(value: &str) -> Result<(u128, u128), String> {
  let (whole, fraction) = value.split_once('.').unwrap_or((value, ""));
  if fraction.len() > 9
    || !whole.bytes().all(|b| b.is_ascii_digit())
    || !fraction.bytes().all(|b| b.is_ascii_digit())
  {
    return Err("invalid reference script multiplier".to_owned());
  }
  let denominator =
    10u128.checked_pow(fraction.len() as u32).ok_or("multiplier denominator overflow")?;
  let whole = whole.parse::<u128>().map_err(|_| "invalid multiplier whole part")?;
  let fraction = if fraction.is_empty() {
    0
  } else {
    fraction.parse::<u128>().map_err(|_| "invalid multiplier fraction")?
  };
  let numerator = whole
    .checked_mul(denominator)
    .and_then(|v| v.checked_add(fraction))
    .ok_or("multiplier overflow")?;
  let reduce = gcd_u128(numerator, denominator);
  Ok((numerator / reduce, denominator / reduce))
}

fn add_reference_fee_and_rebalance(
  tx: &mut Transaction, ref_fee: u64, fee_coefficient: u64, fee_constant: u64,
  extra_serialized_bytes: u64,
) -> Result<(), String> {
  use cml_chain::transaction::TransactionOutput;
  // Builder emits change last when present; script transactions must have it
  // to fund the reference-script surcharge.
  let old_coin =
    match tx.body.outputs.last().ok_or("transaction has no change output for reference fee")? {
      TransactionOutput::AlonzoFormatTxOut(output) => output.amount.coin,
      TransactionOutput::ConwayFormatTxOut(output) => output.amount.coin,
    };
  let old_fee = tx.body.fee;
  let initial_linear = fee_coefficient
    .checked_mul(tx.to_cbor_bytes().len() as u64)
    .and_then(|v| v.checked_add(fee_constant))
    .ok_or("linear fee overflow")?;
  let script_fee = old_fee.saturating_sub(initial_linear);
  let serialization_adjustment =
    fee_coefficient.checked_mul(extra_serialized_bytes).ok_or("transaction fee overflow")?;
  let mut target_fee = old_fee
    .checked_add(ref_fee)
    .and_then(|v| v.checked_add(serialization_adjustment))
    .ok_or("transaction fee overflow")?;
  for _ in 0..4 {
    let delta = target_fee.checked_sub(old_fee).ok_or("transaction fee underflow")?;
    let change =
      tx.body.outputs.last_mut().ok_or("transaction has no change output for reference fee")?;
    match change {
      TransactionOutput::AlonzoFormatTxOut(output) => {
        output.amount.coin =
          old_coin.checked_sub(delta).ok_or("insufficient change for reference script fee")?
      }
      TransactionOutput::ConwayFormatTxOut(output) => {
        output.amount.coin =
          old_coin.checked_sub(delta).ok_or("insufficient change for reference script fee")?
      }
    }
    tx.body.fee = target_fee;
    let linear = fee_coefficient
      .checked_mul(tx.to_cbor_bytes().len() as u64)
      .and_then(|v| v.checked_add(fee_constant))
      .ok_or("linear fee overflow")?;
    // The original CML builder fee already contains this transaction's
    // execution-unit charge. Preserve it while recalculating serialized size.
    let next_fee = linear
      .checked_add(ref_fee)
      .and_then(|v| v.checked_add(serialization_adjustment))
      .and_then(|v| v.checked_add(script_fee))
      .ok_or("transaction fee overflow")?;
    if next_fee == target_fee {
      return Ok(());
    }
    target_fee = next_fee;
  }
  Err("reference script fee did not converge".to_owned())
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
    let policy_bytes =
      hex::decode(fields[0]).map_err(|err| format!("invalid asset policy: {err}"))?;
    let policy = ScriptHash::from_raw_bytes(&policy_bytes).map_err(|err| err.to_string())?;
    let name_bytes = hex::decode(fields[1]).map_err(|err| format!("invalid asset name: {err}"))?;
    let name = AssetName::new(name_bytes).map_err(|err| err.to_string())?;
    let quantity =
      fields[2].parse::<u64>().map_err(|err| format!("invalid asset quantity: {err}"))?;
    assets.set(policy, name, quantity);
  }
  Ok(assets)
}

fn parse_assets(assets: &[ScriptAssetArgs]) -> Result<MultiAsset, String> {
  let mut result = MultiAsset::default();
  for asset in assets {
    let policy_bytes =
      hex::decode(&asset.policy_id_hex).map_err(|err| format!("invalid asset policy: {err}"))?;
    let policy = ScriptHash::from_raw_bytes(&policy_bytes).map_err(|err| err.to_string())?;
    let name_bytes =
      hex::decode(&asset.asset_name_hex).map_err(|err| format!("invalid asset name: {err}"))?;
    let name = AssetName::new(name_bytes).map_err(|err| err.to_string())?;
    let quantity =
      asset.quantity.parse::<u64>().map_err(|err| format!("invalid asset quantity: {err}"))?;
    result.set(policy, name, quantity);
  }
  Ok(result)
}

fn parse_payment_address(raw: &str) -> Result<cml_chain::address::Address, String> {
  use cml_chain::{address::Address, byron::ByronAddress};
  match Address::from_bech32(raw) {
    Ok(address) => Ok(address),
    Err(bech32_error) => {
      ByronAddress::from_base58(raw).map(|address| address.to_address()).map_err(|byron_error| {
        format!("invalid bech32 ({bech32_error}) or Byron ({byron_error}) address")
      })
    }
  }
}

fn parse_auxiliary_metadata(
  encoded_json: &str,
) -> Result<Option<cml_chain::auxdata::AuxiliaryData>, String> {
  use cml_chain::{
    auxdata::{AuxiliaryData, Metadata},
    json::metadatums::{encode_json_str_to_metadatum, MetadataJsonSchema},
  };

  if encoded_json.is_empty() || encoded_json == "-" {
    return Ok(None);
  }
  let json_bytes = decode_percent_encoded(encoded_json)?;
  let json =
    std::str::from_utf8(&json_bytes).map_err(|err| format!("metadata JSON is not UTF-8: {err}"))?;
  #[derive(serde::Deserialize)]
  struct MetadataEntry {
    label: String,
    data: serde_json::Value,
  }
  let entries: Vec<MetadataEntry> =
    serde_json::from_str(json).map_err(|err| format!("invalid metadata entries: {err}"))?;
  let mut metadata = Metadata::new();
  for entry in entries {
    let label =
      entry.label.parse::<u64>().map_err(|err| format!("invalid metadata label: {err}"))?;
    let metadatum =
      encode_json_str_to_metadatum(&entry.data.to_string(), MetadataJsonSchema::BasicConversions)
        .map_err(|err| err.to_string())?;
    metadata.set(label, metadatum);
  }
  Ok(Some(AuxiliaryData::new_shelley(metadata)))
}

fn decode_percent_encoded(value: &str) -> Result<Vec<u8>, String> {
  let mut decoded = Vec::with_capacity(value.len());
  let bytes = value.as_bytes();
  let mut index = 0;
  while index < bytes.len() {
    if bytes[index] == b'%' {
      if index + 2 >= bytes.len() {
        return Err("invalid percent-encoded JSON".to_owned());
      }
      let hex = std::str::from_utf8(&bytes[index + 1..index + 3]).map_err(|err| err.to_string())?;
      decoded
        .push(u8::from_str_radix(hex, 16).map_err(|err| format!("invalid percent escape: {err}"))?);
      index += 3;
    } else {
      decoded.push(bytes[index]);
      index += 1;
    }
  }
  Ok(decoded)
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
  let coins_per_byte =
    fields[2].parse::<u64>().map_err(|err| format!("invalid coins per UTXO byte: {err}"))?;
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

/// Derive the account and optional stake signing keys from a Cardano xprv and
/// sign the transaction without returning derived private keys to JavaScript.
pub fn sign_wallet_transaction_hex(args: &str) -> Result<String, String> {
  use cml_crypto::Bip32PrivateKey;

  let args: WalletSigningArgs =
    serde_json::from_str(args).map_err(|err| format!("invalid wallet-signing arguments: {err}"))?;
  let parse_index = |value: &str, name: &str| -> Result<u32, String> {
    value.parse::<u32>().map_err(|err| format!("invalid {name}: {err}"))
  };
  let account_index = parse_index(&args.account_index, "account index")?;
  if account_index >= 0x8000_0000 {
    return Err("account visual index must be a soft derivation index".to_owned());
  }

  let master_bytes = hex::decode(&args.master_key_hex)
    .map_err(|err| format!("invalid master private key encoding: {err}"))?;
  let master = Bip32PrivateKey::from_raw_bytes(&master_bytes)
    .map_err(|err| format!("invalid master private key: {err}"))?;
  let account_key = master
    .derive(parse_index(&args.purpose, "purpose")?)
    .derive(parse_index(&args.coin_type, "coin type")?)
    .derive(0x8000_0000 + account_index);
  let account_raw_key_hex = hex::encode(account_key.to_raw_key().to_raw_bytes());
  let signed = sign_transaction_hex(&args.transaction_hex, &account_raw_key_hex)?;

  match (args.staking_role, args.staking_index) {
    (Some(role), Some(index)) => {
      let role = parse_index(&role, "staking role")?;
      let index = parse_index(&index, "staking index")?;
      if role >= 0x8000_0000 || index >= 0x8000_0000 {
        return Err("staking role and index must be soft derivation indices".to_owned());
      }
      let staking_key_hex =
        hex::encode(account_key.derive(role).derive(index).to_raw_key().to_raw_bytes());
      sign_transaction_hex(&signed, &staking_key_hex)
    }
    (None, None) => Ok(signed),
    _ => Err("staking role and index must both be provided".to_owned()),
  }
}

/// Generate the canonical Cardano BIP32 root private key from BIP39 entropy.
pub fn wallet_root_key_hex_from_entropy(entropy_hex: &str) -> Result<String, String> {
  use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};

  let entropy =
    hex::decode(entropy_hex).map_err(|err| format!("invalid mnemonic entropy hex: {err}"))?;
  if !matches!(entropy.len(), 16 | 20 | 24 | 28 | 32) {
    return Err("BIP39 entropy must be 16, 20, 24, 28, or 32 bytes".to_owned());
  }
  let root = Bip32PrivateKey::from_bip39_entropy(&entropy, b"");
  Ok(hex::encode(root.to_raw_bytes()))
}

pub fn derive_account_public_key_hex(args: &str) -> Result<String, String> {
  use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};

  let args: AccountPublicKeyArgs =
    serde_json::from_str(args).map_err(|err| format!("invalid account-key arguments: {err}"))?;
  let account_index =
    args.account_index.parse::<u32>().map_err(|err| format!("invalid account index: {err}"))?;
  if account_index >= 0x8000_0000 {
    return Err("account visual index must be a soft derivation index".to_owned());
  }
  let master_bytes = hex::decode(args.master_key_hex)
    .map_err(|err| format!("invalid master private key encoding: {err}"))?;
  let master = Bip32PrivateKey::from_raw_bytes(&master_bytes)
    .map_err(|err| format!("invalid master private key: {err}"))?;
  let account_key = master
    .derive(args.purpose.parse::<u32>().map_err(|err| format!("invalid purpose: {err}"))?)
    .derive(args.coin_type.parse::<u32>().map_err(|err| format!("invalid coin type: {err}"))?)
    .derive(0x8000_0000 + account_index);
  Ok(hex::encode(account_key.to_public().to_raw_bytes()))
}

/// Sign a transaction with keys derived from the supplied wallet paths.
pub fn sign_wallet_transaction_paths_hex(args: &str) -> Result<String, String> {
  use cml_crypto::Bip32PrivateKey;

  let args: WalletPathSigningArgs = serde_json::from_str(args)
    .map_err(|err| format!("invalid wallet path-signing arguments: {err}"))?;
  let master_bytes = hex::decode(args.master_key_hex)
    .map_err(|err| format!("invalid master private key encoding: {err}"))?;
  let mut signed = args.transaction_hex;
  for (signer_index, path) in args.signer_paths.iter().enumerate() {
    if path.len() != 5 {
      return Err(format!("signer path {signer_index} must contain five derivation indices"));
    }
    let mut key = Bip32PrivateKey::from_raw_bytes(&master_bytes)
      .map_err(|err| format!("invalid master private key: {err}"))?;
    for index in path {
      key = key.derive(*index);
    }
    signed = sign_transaction_hex(&signed, &hex::encode(key.to_raw_key().to_raw_bytes()))?;
  }
  if args.signer_paths.is_empty() {
    // Ensure malformed transaction CBOR is still rejected, matching the CSL path.
    Transaction::from_cbor_bytes(&hex::decode(&signed).map_err(|err| err.to_string())?)
      .map_err(|err| err.to_string())?;
  }
  Ok(signed)
}

pub fn sign_wallet_data(args: &str) -> Result<String, String> {
  use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};

  let args: WalletDataSigningArgs = serde_json::from_str(args)
    .map_err(|err| format!("invalid wallet-data signing arguments: {err}"))?;
  if args.signer_path.len() != 5 {
    return Err("wallet data signer path must contain five derivation indices".to_owned());
  }
  let master_bytes = hex::decode(args.master_key_hex)
    .map_err(|err| format!("invalid master private key encoding: {err}"))?;
  let message =
    hex::decode(args.message_hex).map_err(|err| format!("invalid message hex: {err}"))?;
  let mut key = Bip32PrivateKey::from_raw_bytes(&master_bytes)
    .map_err(|err| format!("invalid master private key: {err}"))?;
  for index in args.signer_path {
    key = key.derive(index);
  }
  let raw_key = key.to_raw_key();
  let signature = raw_key.sign(&message);
  Ok(
    serde_json::json!({
      "signatureHex": hex::encode(signature.to_raw_bytes()),
      "publicKeyHex": hex::encode(raw_key.to_public().to_raw_bytes()),
    })
    .to_string(),
  )
}

pub fn derive_wallet_public_key_hex(args: &str) -> Result<String, String> {
  use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};
  let args: WalletPublicKeyArgs = serde_json::from_str(args)
    .map_err(|err| format!("invalid wallet public-key arguments: {err}"))?;
  if args.signer_path.len() != 5 {
    return Err("wallet public-key path must contain five derivation indices".to_owned());
  }
  let master_bytes = hex::decode(args.master_key_hex)
    .map_err(|err| format!("invalid master private key encoding: {err}"))?;
  let mut key = Bip32PrivateKey::from_raw_bytes(&master_bytes)
    .map_err(|err| format!("invalid master private key: {err}"))?;
  for index in args.signer_path {
    key = key.derive(index);
  }
  Ok(hex::encode(key.to_raw_key().to_public().to_raw_bytes()))
}

pub fn transaction_id_hex(transaction_hex: &str) -> Result<String, String> {
  use cml_crypto::RawBytesEncoding;
  let transaction_bytes =
    hex::decode(transaction_hex).map_err(|err| format!("invalid transaction hex: {err}"))?;
  let transaction = Transaction::from_cbor_bytes(&transaction_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  Ok(hex::encode(transaction.body.hash().to_raw_bytes()))
}

/// Parse the basic fields needed by Yoroi's CIP-30 transaction preflight.
pub fn transaction_validation_info_json(transaction_hex: &str) -> Result<String, String> {
  let transaction_bytes = hex::decode(transaction_hex)
    .map_err(|err| format!("invalid transaction hex: {err}"))?;
  let transaction = Transaction::from_cbor_bytes(&transaction_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  serde_json::to_string(&serde_json::json!({
    "inputsCount": transaction.body.inputs.len(),
    "outputsCount": transaction.body.outputs.len(),
    "fee": transaction.body.fee.to_string(),
    "ttl": transaction.body.ttl,
  })).map_err(|err| err.to_string())
}

/// Return the complete CML-parsed review payload without converting ledger
/// quantities to JavaScript numbers. Raw CBOR for the complete body,
/// witnesses, and auxiliary data is included so callers can retain fields
/// which are not yet represented in the normalized summary.
pub fn transaction_review_info_json(transaction_hex: &str) -> Result<String, String> {
  let transaction_bytes = hex::decode(transaction_hex)
    .map_err(|err| format!("invalid transaction hex: {err}"))?;
  let transaction = Transaction::from_cbor_bytes(&transaction_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  let outputs = transaction.body.outputs.iter().map(review_output_json).collect::<Vec<_>>();
  let inputs = transaction.body.inputs.iter().map(review_input_json).collect::<Vec<_>>();
  let collateral_inputs = transaction.body.collateral_inputs.as_ref().map(|set| set.iter().map(review_input_json).collect::<Vec<_>>());
  let reference_inputs = transaction.body.reference_inputs.as_ref().map(|set| set.iter().map(review_input_json).collect::<Vec<_>>());
  let withdrawals = transaction.body.withdrawals.as_ref().map(|entries| {
    entries.iter().map(|(address, amount)| {
      let reward_address = address.clone().to_address();
      serde_json::json!({
        "rewardAddress": reward_address.to_bech32(None).ok(),
        "rewardAddressHex": hex::encode(reward_address.to_raw_bytes()),
        "amount": amount.to_string(),
      })
    }).collect::<Vec<_>>()
  });
  let required_signers = transaction.body.required_signers.as_ref().map(|signers| {
    signers.iter().map(|signer| hex::encode(signer.to_raw_bytes())).collect::<Vec<_>>()
  });
  let witness_set_cbor = transaction.witness_set.to_cbor_bytes();
  let witnesses = &transaction.witness_set;
  let vkeys = witnesses.vkeywitnesses.as_ref().map(|set| set.iter().map(|witness| serde_json::json!({
    "publicKeyHex": hex::encode(witness.vkey.to_raw_bytes()),
    "signatureHex": hex::encode(witness.ed25519_signature.to_raw_bytes()),
  })).collect::<Vec<_>>()).unwrap_or_default();
  let bootstraps = witnesses.bootstrap_witnesses.as_ref().map(|set| set.iter().map(|witness| serde_json::json!({
    "publicKeyHex": hex::encode(witness.public_key.to_raw_bytes()),
    "signatureHex": hex::encode(witness.signature.to_raw_bytes()),
    "chainCodeHex": hex::encode(&witness.chain_code),
    "attributes": serde_json::to_value(&witness.attributes).unwrap_or(serde_json::Value::Null),
  })).collect::<Vec<_>>()).unwrap_or_default();
  let native_scripts = witnesses.native_scripts.as_ref().map(|set| set.iter().map(|script| serde_json::json!({
    "hashHex": hex::encode(script.hash().to_raw_bytes()),
    "cborHex": hex::encode(script.to_cbor_bytes()),
  })).collect::<Vec<_>>()).unwrap_or_default();
  let plutus_scripts = [
    witnesses.plutus_v1_scripts.as_ref().map(|set| set.iter().map(|script| serde_json::json!({"type":"plutusV1", "hashHex":hex::encode(script.hash().to_raw_bytes()), "bytesHex":hex::encode(script.to_raw_bytes()), "cborHex":hex::encode(script.to_cbor_bytes())})).collect::<Vec<_>>()).unwrap_or_default(),
    witnesses.plutus_v2_scripts.as_ref().map(|set| set.iter().map(|script| serde_json::json!({"type":"plutusV2", "hashHex":hex::encode(script.hash().to_raw_bytes()), "bytesHex":hex::encode(script.to_raw_bytes()), "cborHex":hex::encode(script.to_cbor_bytes())})).collect::<Vec<_>>()).unwrap_or_default(),
    witnesses.plutus_v3_scripts.as_ref().map(|set| set.iter().map(|script| serde_json::json!({"type":"plutusV3", "hashHex":hex::encode(script.hash().to_raw_bytes()), "bytesHex":hex::encode(script.to_raw_bytes()), "cborHex":hex::encode(script.to_cbor_bytes())})).collect::<Vec<_>>()).unwrap_or_default(),
  ].concat();
  let plutus_data = witnesses.plutus_datums.as_ref().map(|set| set.iter().map(|datum| hex::encode(datum.to_cbor_bytes())).collect::<Vec<_>>()).unwrap_or_default();
  let redeemers = witnesses.redeemers.as_ref().map(|value| serde_json::to_value(value).unwrap_or(serde_json::Value::Null));
  let auxiliary_data_cbor = transaction.auxiliary_data.as_ref().map(|data| data.to_cbor_bytes());
  let auxiliary_data = transaction.auxiliary_data.as_ref().map(|data| review_auxiliary_data_json(data, auxiliary_data_cbor.as_deref().unwrap_or_default()));
  serde_json::to_string(&serde_json::json!({
    "transactionIdHex": hex::encode(transaction.body.hash().to_raw_bytes()),
    "isValid": transaction.is_valid,
    "body": {
      "cborHex": hex::encode(transaction.body.to_cbor_bytes()),
      "inputs": inputs,
      "outputs": outputs,
      "fee": transaction.body.fee.to_string(),
      "ttl": transaction.body.ttl.map(|value| value.to_string()),
      "validityIntervalStart": transaction.body.validity_interval_start.map(|value| value.to_string()),
      "certificates": transaction.body.certs.as_ref().map(|value| serde_json::to_value(value).unwrap_or(serde_json::Value::Null)),
      "withdrawals": withdrawals,
      "mint": transaction.body.mint.as_ref().map(|value| serde_json::to_value(value).unwrap_or(serde_json::Value::Null)),
      "scriptDataHashHex": transaction.body.script_data_hash.as_ref().map(|value| hex::encode(value.to_raw_bytes())),
      "auxiliaryDataHashHex": transaction.body.auxiliary_data_hash.as_ref().map(|value| hex::encode(value.to_raw_bytes())),
      "collateralInputs": collateral_inputs,
      "requiredSigners": required_signers,
      "networkId": transaction.body.network_id.map(|value| value.network.to_string()),
      "collateralReturn": transaction.body.collateral_return.as_ref().map(review_output_json),
      "totalCollateral": transaction.body.total_collateral.map(|value| value.to_string()),
      "referenceInputs": reference_inputs,
      "votingProcedures": transaction.body.voting_procedures.as_ref().map(|value| serde_json::to_value(value).unwrap_or(serde_json::Value::Null)),
      "proposalProcedures": transaction.body.proposal_procedures.as_ref().map(|value| serde_json::to_value(value).unwrap_or(serde_json::Value::Null)),
      "currentTreasuryValue": transaction.body.current_treasury_value.map(|value| value.to_string()),
      "donation": transaction.body.donation.map(|value| value.to_string()),
    },
    "witnessSet": {
      "cborHex": hex::encode(witness_set_cbor),
      "vkeys": vkeys,
      "bootstraps": bootstraps,
      "nativeScripts": native_scripts,
      "plutusScripts": plutus_scripts,
      "plutusDataCborHex": plutus_data,
      "redeemers": redeemers,
      "cmlJson": serde_json::to_value(&transaction.witness_set).unwrap_or(serde_json::Value::Null),
    },
    "auxiliaryData": auxiliary_data,
  })).map_err(|err| err.to_string())
}

fn review_auxiliary_data_json(data: &cml_chain::auxdata::AuxiliaryData, cbor: &[u8]) -> serde_json::Value {
  let (metadata, native_scripts, plutus_scripts) = match data {
    cml_chain::auxdata::AuxiliaryData::Shelley(metadata) => (Some(metadata), Vec::new(), Vec::new()),
    cml_chain::auxdata::AuxiliaryData::ShelleyMA(data) => (Some(&data.transaction_metadata), data.auxiliary_scripts.iter().collect(), Vec::new()),
    cml_chain::auxdata::AuxiliaryData::Conway(data) => {
      let mut plutus = Vec::new();
      if let Some(scripts) = &data.plutus_v1_scripts { plutus.extend(scripts.iter().map(|script| serde_json::json!({"type":"plutusV1","hashHex":hex::encode(script.hash().to_raw_bytes()),"bytesHex":hex::encode(script.to_raw_bytes()),"cborHex":hex::encode(script.to_cbor_bytes())}))); }
      if let Some(scripts) = &data.plutus_v2_scripts { plutus.extend(scripts.iter().map(|script| serde_json::json!({"type":"plutusV2","hashHex":hex::encode(script.hash().to_raw_bytes()),"bytesHex":hex::encode(script.to_raw_bytes()),"cborHex":hex::encode(script.to_cbor_bytes())}))); }
      if let Some(scripts) = &data.plutus_v3_scripts { plutus.extend(scripts.iter().map(|script| serde_json::json!({"type":"plutusV3","hashHex":hex::encode(script.hash().to_raw_bytes()),"bytesHex":hex::encode(script.to_raw_bytes()),"cborHex":hex::encode(script.to_cbor_bytes())}))); }
      (data.metadata.as_ref(), data.native_scripts.as_ref().map(|scripts| scripts.iter().collect()).unwrap_or_default(), plutus)
    }
  };
  let metadata_labels = metadata.map(|metadata| metadata.entries.iter().map(|(label, value)| {
    let basic_conversions_json = cml_chain::json::metadatums::decode_metadatum_to_json_value(
      value,
      cml_chain::json::metadatums::MetadataJsonSchema::BasicConversions,
    ).ok().and_then(|decoded| decoded.to_string().ok());
    let decoded_json = basic_conversions_json.as_ref().map(|text| {
      serde_json::from_str::<serde_json::Value>(text)
        .unwrap_or_else(|_| serde_json::Value::String(text.clone()))
    });
    serde_json::json!({
      "label": label.to_string(),
      "json": decoded_json,
      "basicConversionsJson": basic_conversions_json,
      "cmlJson": serde_json::to_value(value).unwrap_or(serde_json::Value::Null),
    })
  }).collect::<Vec<_>>()).unwrap_or_default();
  let native_scripts = native_scripts.iter().map(|script| serde_json::json!({
    "hashHex": hex::encode(script.hash().to_raw_bytes()),
    "cborHex": hex::encode(script.to_cbor_bytes()),
  })).collect::<Vec<_>>();
  serde_json::json!({
    "cborHex": hex::encode(cbor),
    "metadata": metadata_labels,
    "nativeScripts": native_scripts,
    "plutusScripts": plutus_scripts,
    "cmlJson": serde_json::to_value(data).unwrap_or(serde_json::Value::Null),
  })
}

fn review_input_json(input: &cml_chain::transaction::TransactionInput) -> serde_json::Value {
  serde_json::json!({
    "transactionIdHex": hex::encode(input.transaction_id.to_raw_bytes()),
    "index": input.index.to_string(),
  })
}

fn review_output_json(output: &cml_chain::transaction::TransactionOutput) -> serde_json::Value {
  let assets = output.amount().multiasset.iter().flat_map(|(policy, tokens)| {
    tokens.iter().map(move |(name, quantity)| serde_json::json!({
      "policyIdHex": hex::encode(policy.to_raw_bytes()),
      "assetNameHex": hex::encode(name.to_raw_bytes()),
      "quantity": quantity.to_string(),
    }))
  }).collect::<Vec<_>>();
  let datum = output.datum().map(|datum| match datum {
    DatumOption::Hash { datum_hash, .. } => serde_json::json!({
      "kind": "hash", "hashHex": hex::encode(datum_hash.to_raw_bytes()),
    }),
    DatumOption::Datum { datum, .. } => serde_json::json!({
      "kind": "inline", "cborHex": hex::encode(datum.to_cbor_bytes()),
    }),
  });
  let script_ref = output.script_ref().map(|script| serde_json::json!({
    "type": match script {
      cml_chain::Script::Native { .. } => "native",
      cml_chain::Script::PlutusV1 { .. } => "plutusV1",
      cml_chain::Script::PlutusV2 { .. } => "plutusV2",
      cml_chain::Script::PlutusV3 { .. } => "plutusV3",
    },
    "hashHex": hex::encode(script.hash().to_raw_bytes()),
    "size": script.to_cbor_bytes().len().to_string(),
    "bytesHex": script.raw_plutus_bytes().ok().map(hex::encode),
    "cborHex": hex::encode(script.to_cbor_bytes()),
  }));
  serde_json::json!({
    "address": match output.address() {
      cml_chain::address::Address::Byron(address) => Some(address.to_base58()),
      _ => output.address().to_bech32(None).ok(),
    },
    "addressHex": hex::encode(output.address().to_raw_bytes()),
    "networkId": output.address().network_id().ok().map(|network| network.to_string()),
    "addressKind": format!("{:?}", output.address().kind()),
    "lovelace": output.amount().coin.to_string(),
    "assets": assets,
    "datum": datum,
    "scriptRef": script_ref,
    "cborHex": hex::encode(output.to_cbor_bytes()),
  })
}

/// Extract the serialized witness set from a signed transaction with CML.
pub fn transaction_witness_set_hex(transaction_hex: &str) -> Result<String, String> {
  let transaction_bytes = hex::decode(transaction_hex)
    .map_err(|err| format!("invalid transaction hex: {err}"))?;
  let transaction = Transaction::from_cbor_bytes(&transaction_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  Ok(hex::encode(transaction.witness_set.to_cbor_bytes()))
}

#[cfg(test)]
mod tests {
  use super::{
    add_reference_fee_and_rebalance, build_escrow_redeem_transaction_hex,
    build_simple_payment_transaction_hex, calculate_reference_script_fee,
    derive_account_public_key_hex, minimum_coin_for_assets, sign_transaction_hex, sign_wallet_data,
    sign_wallet_transaction_hex, sign_wallet_transaction_paths_hex, transaction_id_hex,
    review_output_json, transaction_review_info_json, transaction_validation_info_json,
    transaction_witness_set_hex,
    wallet_root_key_hex_from_entropy,
  };

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
  fn cml_wallet_derivation_and_signing_match_csl_for_account_and_stake_paths() {
    use cardano_serialization_lib as csl;
    use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};

    // Fixed non-secret entropy used only as a differential test vector.
    let entropy = [0x11; 16];
    let master = Bip32PrivateKey::from_bip39_entropy(&entropy, b"");
    let master_hex = hex::encode(master.to_raw_bytes());
    let args = serde_json::json!({
      "transactionHex": UNSIGNED_TRANSACTION_HEX,
      "masterKeyHex": master_hex,
      "purpose": "2147485500",
      "coinType": "2147485463",
      "accountIndex": "7",
      "stakingRole": "2",
      "stakingIndex": "0"
    })
    .to_string();

    let cml_signed = sign_wallet_transaction_hex(&args).unwrap();

    let csl_master = csl::Bip32PrivateKey::from_bytes(&master.to_raw_bytes()).unwrap();
    let account_key = csl_master.derive(2_147_485_500).derive(2_147_485_463).derive(2_147_483_655);
    let staking_key = account_key.derive(2).derive(0).to_raw_key();
    let account_key = account_key.to_raw_key();
    let mut csl_signed = csl::FixedTransaction::from_hex(UNSIGNED_TRANSACTION_HEX).unwrap();
    csl_signed.sign_and_add_vkey_signature(&account_key).unwrap();
    csl_signed.sign_and_add_vkey_signature(&staking_key).unwrap();

    assert_eq!(cml_signed, csl_signed.to_hex());
  }

  #[test]
  fn wallet_signing_rejects_invalid_derivation_paths() {
    let args = serde_json::json!({
      "transactionHex": UNSIGNED_TRANSACTION_HEX,
      "masterKeyHex": "00",
      "purpose": "2147485500",
      "coinType": "2147485463",
      "accountIndex": "2147483648"
    })
    .to_string();
    assert!(sign_wallet_transaction_hex(&args).unwrap_err().contains("soft derivation"));
  }

  #[test]
  fn wallet_root_key_from_entropy_matches_csl() {
    use cardano_serialization_lib as csl;
    use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};

    let entropy = [0x11_u8; 16];
    let cml_key = Bip32PrivateKey::from_bip39_entropy(&entropy, b"");
    let actual = wallet_root_key_hex_from_entropy(&hex::encode(entropy)).unwrap();
    let expected = csl::Bip32PrivateKey::from_bip39_entropy(&entropy, &[]).as_bytes();
    assert_eq!(hex::decode(&actual).unwrap(), expected);
    assert_eq!(hex::decode(&actual).unwrap(), cml_key.to_raw_bytes());
  }

  #[test]
  fn wallet_root_key_rejects_invalid_entropy_length() {
    assert!(wallet_root_key_hex_from_entropy("010203").unwrap_err().contains("BIP39 entropy"));
  }

  #[test]
  fn account_public_key_derivation_matches_csl() {
    use cardano_serialization_lib as csl;

    let entropy = [0x11_u8; 16];
    let root = csl::Bip32PrivateKey::from_bip39_entropy(&entropy, &[]);
    let root_hex = hex::encode(root.as_bytes());
    let args = serde_json::json!({
      "masterKeyHex": root_hex,
      "purpose": "2147485500",
      "coinType": "2147485463",
      "accountIndex": "0",
    })
    .to_string();
    let csl_account =
      root.derive(2_147_485_500).derive(2_147_485_463).derive(0x8000_0000).to_public().as_bytes();
    assert_eq!(hex::decode(derive_account_public_key_hex(&args).unwrap()).unwrap(), csl_account);
  }

  #[test]
  fn wallet_path_signing_matches_csl_for_multiple_signers() {
    use cardano_serialization_lib as csl;

    let entropy = [0x11_u8; 16];
    let root = csl::Bip32PrivateKey::from_bip39_entropy(&entropy, &[]);
    let paths = vec![
      vec![2_147_485_500, 2_147_485_463, 0x8000_0007, 0, 3],
      vec![2_147_485_500, 2_147_485_463, 0x8000_0007, 2, 0],
    ];
    let args = serde_json::json!({
      "transactionHex": UNSIGNED_TRANSACTION_HEX,
      "masterKeyHex": hex::encode(root.as_bytes()),
      "signerPaths": paths,
    })
    .to_string();

    let mut csl_tx = csl::FixedTransaction::from_hex(UNSIGNED_TRANSACTION_HEX).unwrap();
    for path in &paths {
      let mut key = csl::Bip32PrivateKey::from_bip39_entropy(&entropy, &[]);
      for index in path {
        key = key.derive(*index);
      }
      csl_tx.sign_and_add_vkey_signature(&key.to_raw_key());
    }
    assert_eq!(sign_wallet_transaction_paths_hex(&args).unwrap(), hex::encode(csl_tx.to_bytes()));
  }

  #[test]
  fn wallet_data_signature_and_public_key_match_csl() {
    use cardano_serialization_lib as csl;
    let entropy = [0x11_u8; 16];
    let root = csl::Bip32PrivateKey::from_bip39_entropy(&entropy, &[]);
    let path = vec![2_147_485_500, 2_147_485_463, 0x8000_0007, 0, 3];
    let message = b"CIP-8 COSE Sig_structure fixture";
    let args = serde_json::json!({
      "messageHex": hex::encode(message),
      "masterKeyHex": hex::encode(root.as_bytes()),
      "signerPath": path,
    })
    .to_string();
    let result: serde_json::Value =
      serde_json::from_str(&sign_wallet_data(&args).unwrap()).unwrap();
    let mut csl_key = root;
    for index in path {
      csl_key = csl_key.derive(index);
    }
    let csl_key = csl_key.to_raw_key();
    assert_eq!(result["signatureHex"], hex::encode(csl_key.sign(message).to_bytes()));
    assert_eq!(result["publicKeyHex"], hex::encode(csl_key.to_public().as_bytes()));
  }

  #[test]
  fn transaction_id_matches_csl_body_hash() {
    use cardano_serialization_lib as csl;
    let csl_tx = csl::FixedTransaction::from_hex(UNSIGNED_TRANSACTION_HEX).unwrap();
    assert_eq!(
      transaction_id_hex(UNSIGNED_TRANSACTION_HEX).unwrap(),
      csl_tx.transaction_hash().to_hex(),
    );
  }

  #[test]
  fn transaction_validation_info_matches_csl_fixture_and_rejects_bad_cbor() {
    use cardano_serialization_lib as csl;
    let tx = csl::FixedTransaction::from_hex(UNSIGNED_TRANSACTION_HEX).unwrap();
    let body = tx.body();
    let actual: serde_json::Value =
      serde_json::from_str(&transaction_validation_info_json(UNSIGNED_TRANSACTION_HEX).unwrap()).unwrap();
    assert_eq!(actual["inputsCount"], body.inputs().len());
    assert_eq!(actual["outputsCount"], body.outputs().len());
    assert_eq!(actual["fee"].as_str(), Some(body.fee().to_str().as_str()));
    assert!(actual["ttl"].is_null());
    assert!(transaction_validation_info_json("zz").unwrap_err().contains("invalid transaction hex"));
    assert!(transaction_validation_info_json("ff").unwrap_err().contains("invalid transaction CBOR"));
  }

  #[test]
  fn transaction_review_info_preserves_sections_and_string_quantities() {
    let actual: serde_json::Value = serde_json::from_str(
      &transaction_review_info_json(UNSIGNED_TRANSACTION_HEX).unwrap(),
    ).unwrap();
    assert_eq!(actual["transactionIdHex"].as_str().unwrap().len(), 64);
    assert_eq!(actual["isValid"], true);
    assert_eq!(actual["body"]["fee"], "1000000");
    assert_eq!(actual["body"]["inputs"].as_array().unwrap().len(), 0);
    assert!(actual["body"]["cborHex"].is_string());
    assert!(actual["witnessSet"]["cborHex"].is_string());
    assert!(actual["auxiliaryData"].is_null());
    assert!(transaction_review_info_json("zz").unwrap_err().contains("invalid transaction hex"));
  }

  #[test]
  fn transaction_review_output_keeps_byron_address_base58() {
    let address = "Ae2tdPwUPEZHtBmjZBF4YpMkK9tMSPTE2ADEZTPN97saNkhG78TvXdp3GDk";
    let byron = cml_chain::byron::ByronAddress::from_base58(address).unwrap().to_address();
    let output = cml_chain::transaction::TransactionOutput::new(
      byron,
      cml_chain::Value::zero(),
      None,
      None,
    );
    assert_eq!(review_output_json(&output)["address"], address);
  }

  #[test]
  fn cml_witness_set_extraction_matches_csl_serialized_bytes() {
    use cardano_serialization_lib as csl;
    let transaction = csl::Transaction::from_bytes(hex::decode(CSL_SIGNED_TRANSACTION_HEX).unwrap()).unwrap();
    assert_eq!(
      transaction_witness_set_hex(CSL_SIGNED_TRANSACTION_HEX).unwrap(),
      hex::encode(transaction.witness_set().to_bytes()),
    );
    assert!(transaction_witness_set_hex("ff").unwrap_err().contains("invalid transaction CBOR"));
  }

  #[test]
  fn reference_script_fee_matches_csl_across_tiers_and_fractional_multiplier() {
    use cardano_serialization_lib as csl;

    let coins_per_byte = csl::UnitInterval::new(
      &csl::BigNum::from_str("15").unwrap(),
      &csl::BigNum::from_str("1").unwrap(),
    );
    for size in [1usize, 6278, 25599, 25600, 25601, 51200, 70000] {
      let expected =
        csl::min_ref_script_fee(size, &coins_per_byte).unwrap().to_str().parse::<u64>().unwrap();
      let actual = calculate_reference_script_fee(size as u64, 15, 1, 25600, "1.2").unwrap();
      assert_eq!(actual, expected, "size {size}");
    }
  }

  #[test]
  fn adding_reference_fee_rebalances_change_and_preserves_input_output_conservation() {
    use cml_chain::{
      serialization::Deserialize,
      transaction::{Transaction, TransactionOutput},
    };
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32),
      address,
      address,
      address,
    );
    let result = build_simple_payment_transaction_hex(&args).unwrap();
    let mut tx =
      Transaction::from_cbor_bytes(&hex::decode(result.rsplit_once('|').unwrap().0).unwrap())
        .unwrap();
    let before_fee = tx.body.fee;
    add_reference_fee_and_rebalance(&mut tx, 94170, 44, 155381, 0).unwrap();
    assert!(tx.body.fee > before_fee);
    let outputs_coin: u64 = tx
      .body
      .outputs
      .iter()
      .map(|output| match output {
        TransactionOutput::AlonzoFormatTxOut(output) => output.amount.coin,
        TransactionOutput::ConwayFormatTxOut(output) => output.amount.coin,
      })
      .sum();
    assert_eq!(outputs_coin + tx.body.fee, 10_000_000);
  }

  #[test]
  fn escrow_plutus_reference_recipe_matches_csl_body_witnesses_fee_and_change() {
    use cardano_serialization_lib as csl;
    use cml_chain::serialization::{Deserialize, Serialize};
    use cml_chain::{plutus::PlutusV3Script, Script};
    use cml_crypto::RawBytesEncoding;

    let script_bytes = vec![1, 0, 0];
    let cml_script = Script::new_plutus_v3(PlutusV3Script::new(script_bytes.clone()));
    let script_hash_hex = hex::encode(cml_script.hash().to_raw_bytes());
    let key_address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let script_hash = csl::ScriptHash::from_bytes(hex::decode(&script_hash_hex).unwrap()).unwrap();
    let script_address = csl::EnterpriseAddress::new(
      csl::NetworkInfo::new(0, 1).network_id(),
      &csl::Credential::from_scripthash(&script_hash),
    )
    .to_address()
    .to_bech32(None)
    .unwrap();
    let args = serde_json::json!({
      "scriptInput": {"txHashHex": "01".repeat(32), "index": "0", "address": script_address, "lovelace": "5000000", "assets": [], "inlineDatumCborHex": "d87980"},
      "referenceScriptInput": {"txHashHex": "02".repeat(32), "index": "0", "address": key_address, "lovelace": "2000000", "assets": []},
      "referenceScriptCborHex": hex::encode(&script_bytes), "referenceScriptSize": "3",
      "fundingInputs": [{"txHashHex": "03".repeat(32), "index": "0", "address": key_address, "lovelace": "10000000", "assets": []}],
      "collateralInput": {"txHashHex": "04".repeat(32), "index": "0", "address": key_address, "lovelace": "5000000", "assets": []},
      "collateralReturn": {"address": key_address, "lovelace": "4000000", "assets": []},
      "outputs": [{"address": key_address, "lovelace": "2000000", "assets": []}],
      "changeAddress": key_address, "scriptHashHex": script_hash_hex, "redeemerCborHex": "d87980",
      "redeemerMem": "900000", "redeemerSteps": "250000000", "validityStart": "100", "ttl": "1000",
      "feeCoefficient": "44", "feeConstant": "155381", "coinsPerUtxoByte": "4310",
      "keyDeposit": "2000000", "poolDeposit": "500000000", "maxValueSize": "5000", "maxTxSize": "16384",
      "collateralPercentage": "150", "refScriptCoinsPerByte": {"numerator": "15", "denominator": "1"},
      "refScriptTierStepBytes": "25600", "refScriptMultiplier": "1.2",
      "exUnitPricesMemory": {"numerator": "577", "denominator": "10000"},
      "exUnitPricesSteps": {"numerator": "721", "denominator": "10000000"},
      "plutusV3CostModel": [0]
    }).to_string();
    let cml_hex = build_escrow_redeem_transaction_hex(&args).unwrap();
    let cml_hex = cml_hex.split('|').next().unwrap();
    let cml_cbor = hex::decode(cml_hex).unwrap();

    let address = csl::Address::from_bech32(key_address).unwrap();
    let script = csl::PlutusScript::new_v3(script_bytes);
    let ref_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("02".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let script_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let funding_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("03".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let collateral_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("04".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let fee_algo = csl::LinearFee::new(
      &csl::BigNum::from_str("44").unwrap(),
      &csl::BigNum::from_str("155381").unwrap(),
    );
    let ex_prices = csl::ExUnitPrices::new(
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("577").unwrap(),
        &csl::BigNum::from_str("10000").unwrap(),
      ),
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("721").unwrap(),
        &csl::BigNum::from_str("10000000").unwrap(),
      ),
    );
    let ref_cost = csl::UnitInterval::new(
      &csl::BigNum::from_str("15").unwrap(),
      &csl::BigNum::from_str("1").unwrap(),
    );
    let config = csl::TransactionBuilderConfigBuilder::new()
      .fee_algo(&fee_algo)
      .coins_per_utxo_byte(&csl::BigNum::from_str("4310").unwrap())
      .ex_unit_prices(&ex_prices)
      .ref_script_coins_per_byte(&ref_cost)
      .pool_deposit(&csl::BigNum::from_str("500000000").unwrap())
      .key_deposit(&csl::BigNum::from_str("2000000").unwrap())
      .max_value_size(5000)
      .max_tx_size(16384)
      .prefer_pure_change(true)
      .build()
      .unwrap();
    let mut csl_builder = csl::TransactionBuilder::new(&config);
    csl_builder
      .add_output(&csl::TransactionOutput::new(
        &address,
        &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
      ))
      .unwrap();
    csl_builder.set_validity_start_interval_bignum(&csl::BigNum::from_str("100").unwrap());
    csl_builder.set_ttl_bignum(&csl::BigNum::from_str("1000").unwrap());
    csl_builder.add_script_reference_input(&ref_input, 3);
    let script_hash = script.hash();
    let script_source = csl::PlutusScriptSource::new_ref_input(
      &script_hash,
      &ref_input,
      &csl::Language::new_plutus_v3(),
      3,
    );
    let datum_source = csl::DatumSource::new_ref_input(&script_input);
    let redeemer = csl::Redeemer::new(
      &csl::RedeemerTag::new_spend(),
      &csl::BigNum::zero(),
      &csl::PlutusData::from_bytes(hex::decode("d87980").unwrap()).unwrap(),
      &csl::ExUnits::new(
        &csl::BigNum::from_str("900000").unwrap(),
        &csl::BigNum::from_str("250000000").unwrap(),
      ),
    );
    let witness = csl::PlutusWitness::new_with_ref(&script_source, &datum_source, &redeemer);
    csl_builder.add_plutus_script_input(
      &witness,
      &script_input,
      &csl::Value::new(&csl::BigNum::from_str("5000000").unwrap()),
    );
    csl_builder
      .add_regular_input(
        &address,
        &funding_input,
        &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
      )
      .unwrap();
    let mut collateral = csl::TxInputsBuilder::new();
    collateral
      .add_regular_input(
        &address,
        &collateral_input,
        &csl::Value::new(&csl::BigNum::from_str("5000000").unwrap()),
      )
      .unwrap();
    csl_builder.set_collateral(&collateral);
    csl_builder
      .set_total_collateral_and_return(&csl::BigNum::from_str("1000000").unwrap(), &address)
      .unwrap();
    let mut cost_models = csl::Costmdls::new();
    let mut cost_model = csl::CostModel::new();
    cost_model.set(0, &csl::Int::new_i32(0)).unwrap();
    cost_models.insert(&csl::Language::new_plutus_v3(), &cost_model);
    csl_builder.calc_script_data_hash(&cost_models).unwrap();
    csl_builder.add_change_if_needed(&address).unwrap();
    let csl_tx = csl_builder.build_tx_unsafe().unwrap();
    assert_eq!(hex::encode(cml_cbor), hex::encode(csl_tx.to_bytes()));
  }

  #[test]
  fn escrow_plutus_explicit_datum_matches_csl_transaction_cbor() {
    use cardano_serialization_lib as csl;
    use cml_chain::serialization::{Deserialize, Serialize};
    use cml_chain::Script;
    use cml_crypto::RawBytesEncoding;

    for version in ["V1", "V2", "V3"] {
    let script_bytes = vec![1, 0, 0];
    let second_script_bytes = vec![2, 0, 0];
    let cml_script = match version {
      "V1" => Script::new_plutus_v1(cml_chain::plutus::PlutusV1Script::new(script_bytes.clone())),
      "V2" => Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(script_bytes.clone())),
      _ => Script::new_plutus_v3(cml_chain::plutus::PlutusV3Script::new(script_bytes.clone())),
    };
    let script_hash_hex = hex::encode(cml_script.hash().to_raw_bytes());
    let second_script = Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(second_script_bytes.clone()));
    let second_script_hash_hex = hex::encode(second_script.hash().to_raw_bytes());
    let key_address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let script_hash = csl::ScriptHash::from_bytes(hex::decode(&script_hash_hex).unwrap()).unwrap();
    let script_address = csl::EnterpriseAddress::new(
      csl::NetworkInfo::new(0, 1).network_id(),
      &csl::Credential::from_scripthash(&script_hash),
    )
    .to_address()
    .to_bech32(None)
    .unwrap();
    let second_script_hash = csl::ScriptHash::from_bytes(hex::decode(&second_script_hash_hex).unwrap()).unwrap();
    let second_script_address = csl::EnterpriseAddress::new(
      csl::NetworkInfo::new(0, 1).network_id(),
      &csl::Credential::from_scripthash(&second_script_hash),
    ).to_address().to_bech32(None).unwrap();
    let args = serde_json::json!({
      "scriptInput": {"txHashHex": "01".repeat(32), "index": "0", "address": script_address, "lovelace": "5000000", "assets": [], "inlineDatumCborHex": "d87980"},
      "additionalScriptInputs": [{
        "scriptInput": {"txHashHex": "06".repeat(32), "index": "0", "address": second_script_address, "lovelace": "5000000", "assets": [], "datumCborHex": "d87980"},
        "scriptHashHex": second_script_hash_hex, "plutusVersion": "V2",
        "referenceScriptInput": {"txHashHex": "08".repeat(32), "index": "0", "address": key_address, "lovelace": "2000000", "assets": []},
        "referenceScriptCborHex": hex::encode(&second_script_bytes), "referenceScriptSize": "3",
        "redeemerCborHex": "80", "redeemerMem": "100", "redeemerSteps": "200"
      }],
      "referenceScriptInput": {"txHashHex": "02".repeat(32), "index": "0", "address": key_address, "lovelace": "2000000", "assets": []},
      "referenceInputs": [{"txHashHex": "05".repeat(32), "index": "1", "address": key_address, "lovelace": "3000000", "assets": []}],
      "referenceScriptCborHex": hex::encode(&script_bytes), "referenceScriptSize": "3",
      "fundingInputs": [{"txHashHex": "03".repeat(32), "index": "0", "address": key_address, "lovelace": "10000000", "assets": []}],
      "collateralInput": {"txHashHex": "04".repeat(32), "index": "0", "address": key_address, "lovelace": "5000000", "assets": [{"policyIdHex": "aa".repeat(28), "assetNameHex": "01", "quantity": "2"}]},
      "additionalCollateralInputs": [{"txHashHex": "07".repeat(32), "index": "0", "address": key_address, "lovelace": "4000000", "assets": [{"policyIdHex": "aa".repeat(28), "assetNameHex": "01", "quantity": "3"}]}],
      "collateralReturn": {"address": key_address, "lovelace": "8000000", "assets": [{"policyIdHex": "aa".repeat(28), "assetNameHex": "01", "quantity": "5"}]},
      "outputs": [{"address": key_address, "lovelace": "2000000", "assets": []}],
      "changeAddress": key_address, "scriptHashHex": script_hash_hex, "redeemerCborHex": "d87980",
      "redeemerMem": "900000", "redeemerSteps": "250000000", "validityStart": "100", "ttl": "1000",
      "feeCoefficient": "44", "feeConstant": "155381", "coinsPerUtxoByte": "4310",
      "keyDeposit": "2000000", "poolDeposit": "500000000", "maxValueSize": "5000", "maxTxSize": "16384",
      "collateralPercentage": "150", "refScriptCoinsPerByte": {"numerator": "15", "denominator": "1"},
      "refScriptTierStepBytes": "25600", "refScriptMultiplier": "1.2",
      "exUnitPricesMemory": {"numerator": "577", "denominator": "10000"},
      "exUnitPricesSteps": {"numerator": "721", "denominator": "10000000"},
      "plutusVersion": version,
      "plutusV1CostModel": [0], "plutusV2CostModel": [0],
      "plutusV3CostModel": [0]
    }).to_string();
    let cml_hex = build_escrow_redeem_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml_hex.split('|').next().unwrap()).unwrap();

    let address = csl::Address::from_bech32(key_address).unwrap();
    let (script, language) = match version {
      "V1" => (csl::PlutusScript::new(script_bytes), csl::Language::new_plutus_v1()),
      "V2" => (csl::PlutusScript::new_v2(script_bytes), csl::Language::new_plutus_v2()),
      _ => (csl::PlutusScript::new_v3(script_bytes), csl::Language::new_plutus_v3()),
    };
    let ref_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("02".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let second_ref_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("05".repeat(32)).unwrap()).unwrap(),
      1,
    );
    let third_ref_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("08".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let script_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let second_script_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("06".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let funding_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("03".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let collateral_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("04".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let second_collateral_input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("07".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let fee_algo = csl::LinearFee::new(
      &csl::BigNum::from_str("44").unwrap(),
      &csl::BigNum::from_str("155381").unwrap(),
    );
    let ex_prices = csl::ExUnitPrices::new(
      &csl::UnitInterval::new(&csl::BigNum::from_str("577").unwrap(), &csl::BigNum::from_str("10000").unwrap()),
      &csl::UnitInterval::new(&csl::BigNum::from_str("721").unwrap(), &csl::BigNum::from_str("10000000").unwrap()),
    );
    let config = csl::TransactionBuilderConfigBuilder::new()
      .fee_algo(&fee_algo)
      .coins_per_utxo_byte(&csl::BigNum::from_str("4310").unwrap())
      .ex_unit_prices(&ex_prices)
      .ref_script_coins_per_byte(&csl::UnitInterval::new(&csl::BigNum::from_str("15").unwrap(), &csl::BigNum::one()))
      .pool_deposit(&csl::BigNum::from_str("500000000").unwrap())
      .key_deposit(&csl::BigNum::from_str("2000000").unwrap())
      .max_value_size(5000)
      .max_tx_size(16384)
      .prefer_pure_change(true)
      .build()
      .unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    builder.add_output(&csl::TransactionOutput::new(
      &address,
      &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
    )).unwrap();
    builder.set_validity_start_interval_bignum(&csl::BigNum::from_str("100").unwrap());
    builder.set_ttl_bignum(&csl::BigNum::from_str("1000").unwrap());
    builder.add_script_reference_input(&ref_input, 3);
    builder.add_script_reference_input(&third_ref_input, 3);
    builder.add_reference_input(&second_ref_input);
    let script_source = csl::PlutusScriptSource::new_ref_input(
      &script.hash(), &ref_input, &language, 3,
    );
    let datum = csl::PlutusData::from_bytes(hex::decode("d87980").unwrap()).unwrap();
    let datum_source = csl::DatumSource::new_ref_input(&script_input);
    let redeemer = csl::Redeemer::new(
      &csl::RedeemerTag::new_spend(),
      &csl::BigNum::zero(),
      &csl::PlutusData::from_bytes(hex::decode("d87980").unwrap()).unwrap(),
      &csl::ExUnits::new(&csl::BigNum::from_str("900000").unwrap(), &csl::BigNum::from_str("250000000").unwrap()),
    );
    let witness = csl::PlutusWitness::new_with_ref(&script_source, &datum_source, &redeemer);
    builder.add_plutus_script_input(
      &witness, &script_input, &csl::Value::new(&csl::BigNum::from_str("5000000").unwrap()),
    );
    let second_datum_source = csl::DatumSource::new(&datum);
    let second_redeemer = csl::Redeemer::new(
      &csl::RedeemerTag::new_spend(),
      &csl::BigNum::from_str("2").unwrap(),
      &csl::PlutusData::from_bytes(hex::decode("80").unwrap()).unwrap(),
      &csl::ExUnits::new(&csl::BigNum::from_str("100").unwrap(), &csl::BigNum::from_str("200").unwrap()),
    );
    let second_script = csl::PlutusScript::new_v2(second_script_bytes);
    let second_script_source = csl::PlutusScriptSource::new_ref_input(
      &second_script.hash(), &third_ref_input, &csl::Language::new_plutus_v2(), 3,
    );
    let second_witness = csl::PlutusWitness::new_with_ref(&second_script_source, &second_datum_source, &second_redeemer);
    builder.add_plutus_script_input(
      &second_witness,
      &second_script_input,
      &csl::Value::new(&csl::BigNum::from_str("5000000").unwrap()),
    );
    builder.add_regular_input(
      &address, &funding_input, &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
    ).unwrap();
    let mut collateral = csl::TxInputsBuilder::new();
    let policy = csl::PolicyID::from_bytes(hex::decode("aa".repeat(28)).unwrap()).unwrap();
    let asset_name = csl::AssetName::new(hex::decode("01").unwrap()).unwrap();
    let mut first_assets = csl::Assets::new();
    first_assets.insert(&asset_name, &csl::BigNum::from_str("2").unwrap());
    let mut first_multi_asset = csl::MultiAsset::new();
    first_multi_asset.insert(&policy, &first_assets);
    let mut first_collateral_value = csl::Value::new(&csl::BigNum::from_str("5000000").unwrap());
    first_collateral_value.set_multiasset(&first_multi_asset);
    collateral.add_regular_input(&address, &collateral_input, &first_collateral_value).unwrap();
    let mut second_assets = csl::Assets::new();
    second_assets.insert(&asset_name, &csl::BigNum::from_str("3").unwrap());
    let mut second_multi_asset = csl::MultiAsset::new();
    second_multi_asset.insert(&policy, &second_assets);
    let mut second_collateral_value = csl::Value::new(&csl::BigNum::from_str("4000000").unwrap());
    second_collateral_value.set_multiasset(&second_multi_asset);
    collateral.add_regular_input(&address, &second_collateral_input, &second_collateral_value).unwrap();
    builder.set_collateral(&collateral);
    builder.set_total_collateral_and_return(&csl::BigNum::from_str("1000000").unwrap(), &address).unwrap();
    let mut cost_models = csl::Costmdls::new();
    let mut cost_model = csl::CostModel::new();
    cost_model.set(0, &csl::Int::new_i32(0)).unwrap();
    cost_models.insert(&language, &cost_model);
    cost_models.insert(&csl::Language::new_plutus_v2(), &cost_model);
    builder.calc_script_data_hash(&cost_models).unwrap();
    builder.add_change_if_needed(&address).unwrap();
    let csl_tx = builder.build_tx_unsafe().unwrap();
    let csl_cbor = csl_tx.to_bytes();
    let decoded_cml = cml_chain::transaction::Transaction::from_cbor_bytes(&cml_cbor).unwrap();
    let decoded_csl = cml_chain::transaction::Transaction::from_cbor_bytes(&csl_cbor).unwrap();
    assert_eq!(decoded_cml.witness_set.redeemers.as_ref().unwrap().to_cbor_bytes(), decoded_csl.witness_set.redeemers.as_ref().unwrap().to_cbor_bytes(), "redeemer CBOR");
    assert_eq!(decoded_cml.witness_set.plutus_datums.as_ref().unwrap().to_cbor_bytes(), decoded_csl.witness_set.plutus_datums.as_ref().unwrap().to_cbor_bytes(), "datum CBOR");

    // CSL 15 collects reference inputs through a HashSet before serialization, so
    // the array order in its CBOR is process-randomized. Compare that set
    // semantically, and compare every other body/witness field byte-for-byte.
    let mut cml_body = decoded_cml.body.clone();
    let mut csl_body = decoded_csl.body.clone();
    let cml_reference_inputs = cml_body.reference_inputs.take().unwrap();
    let csl_reference_inputs = csl_body.reference_inputs.take().unwrap();
    let mut cml_reference_input_cbor: Vec<_> = cml_reference_inputs
      .iter()
      .map(|input| input.to_cbor_bytes())
      .collect();
    let mut csl_reference_input_cbor: Vec<_> = csl_reference_inputs
      .iter()
      .map(|input| input.to_cbor_bytes())
      .collect();
    cml_reference_input_cbor.sort();
    csl_reference_input_cbor.sort();
    assert_eq!(cml_reference_input_cbor, csl_reference_input_cbor);
    assert_eq!(decoded_cml.body.fee, decoded_csl.body.fee, "fee parity");
    assert_eq!(decoded_cml.body.script_data_hash, decoded_csl.body.script_data_hash, "script-data hash parity");
    assert_eq!(cml_body.to_cbor_bytes(), csl_body.to_cbor_bytes());
    assert_eq!(decoded_cml.witness_set.to_cbor_bytes(), decoded_csl.witness_set.to_cbor_bytes());
    assert_eq!(decoded_cml.body.fee, decoded_csl.body.fee);
    assert_eq!(cml_cbor.len(), csl_cbor.len());
    let script_data_hash = hex::encode(
      decoded_cml.body.script_data_hash.as_ref().unwrap().to_raw_bytes(),
    );
    assert_eq!(script_data_hash, hex::encode(decoded_csl.body.script_data_hash.as_ref().unwrap().to_raw_bytes()));
    assert_eq!(build_escrow_redeem_transaction_hex(&args).unwrap(), cml_hex, "CML mixed-language serialization is deterministic");
    }
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
  fn stake_delegation_certificate_matches_csl_body_fee_and_witnesses() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|%5B%7B%22kind%22%3A%22StakeDelegation%22%2C%22stakeCredentialKeyHashHex%22%3A%22{}%22%2C%22poolKeyHash%22%3A%22{}%22%7D%5D",
      "01".repeat(32), address, address, address, "aa".repeat(28), "bb".repeat(28),
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();
    let addr = csl::Address::from_bech32(address).unwrap();
    let fee = csl::LinearFee::new(
      &csl::BigNum::from_str("44").unwrap(),
      &csl::BigNum::from_str("155381").unwrap(),
    );
    let ex_prices = csl::ExUnitPrices::new(
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("577").unwrap(),
        &csl::BigNum::from_str("10000").unwrap(),
      ),
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("721").unwrap(),
        &csl::BigNum::from_str("10000000").unwrap(),
      ),
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
      .build()
      .unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    builder
      .add_regular_input(
        &csl::Address::from_bech32(address).unwrap(),
        &csl::TransactionInput::new(
          &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
          0,
        ),
        &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
      )
      .unwrap();
    builder
      .add_output(&csl::TransactionOutput::new(
        &addr,
        &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
      ))
      .unwrap();
    builder.set_ttl(123456);
    let stake_hash =
      csl::Ed25519KeyHash::from_bytes(hex::decode("aa".repeat(28)).unwrap()).unwrap();
    let pool_hash = csl::Ed25519KeyHash::from_bytes(hex::decode("bb".repeat(28)).unwrap()).unwrap();
    let credential = csl::Credential::from_keyhash(&stake_hash);
    let cert =
      csl::Certificate::new_stake_delegation(&csl::StakeDelegation::new(&credential, &pool_hash));
    let mut certs = csl::Certificates::new();
    certs.add(&cert);
    builder.set_certs(&certs).unwrap();
    assert!(builder.add_change_if_needed(&addr).unwrap());
    let body = builder.build().unwrap();
    let mut witnesses = csl::TransactionWitnessSet::new();
    let expected = csl::Transaction::new(&body, &witnesses, None).to_bytes();
    assert_eq!(cml_cbor, expected);
  }

  #[test]
  fn stake_registration_and_deregistration_match_csl_and_reject_invalid_shapes() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let addr = csl::Address::from_bech32(address).unwrap();
    let stake_hash_hex = "aa".repeat(28);
    let stake_hash =
      csl::Ed25519KeyHash::from_bytes(hex::decode(&stake_hash_hex).unwrap()).unwrap();
    let credential = csl::Credential::from_keyhash(&stake_hash);
    let fee = csl::LinearFee::new(
      &csl::BigNum::from_str("44").unwrap(),
      &csl::BigNum::from_str("155381").unwrap(),
    );
    let ex_prices = csl::ExUnitPrices::new(
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("577").unwrap(),
        &csl::BigNum::from_str("10000").unwrap(),
      ),
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("721").unwrap(),
        &csl::BigNum::from_str("10000000").unwrap(),
      ),
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
      .build()
      .unwrap();

    for (kind, cert) in [
      (
        "StakeRegistration",
        csl::Certificate::new_stake_registration(&csl::StakeRegistration::new(&credential)),
      ),
      (
        "StakeDeregistration",
        csl::Certificate::new_stake_deregistration(&csl::StakeDeregistration::new(&credential)),
      ),
    ] {
      let certificate_json = format!(
        "%5B%7B%22kind%22%3A%22{}%22%2C%22stakeCredentialKeyHashHex%22%3A%22{}%22%7D%5D",
        kind, stake_hash_hex,
      );
      let args =
        format!(
        "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}",
        "01".repeat(32), address, address, address, certificate_json,
      );
      let cml = build_simple_payment_transaction_hex(&args).unwrap();
      let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();

      let mut builder = csl::TransactionBuilder::new(&config);
      builder
        .add_regular_input(
          &addr,
          &csl::TransactionInput::new(
            &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
            0,
          ),
          &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
        )
        .unwrap();
      builder
        .add_output(&csl::TransactionOutput::new(
          &addr,
          &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
        ))
        .unwrap();
      builder.set_ttl(123456);
      let mut certs = csl::Certificates::new();
      certs.add(&cert);
      builder.set_certs(&certs).unwrap();
      assert!(builder.add_change_if_needed(&addr).unwrap());
      let body = builder.build().unwrap();
      let expected =
        csl::Transaction::new(&body, &csl::TransactionWitnessSet::new(), None).to_bytes();
      assert_eq!(cml_cbor, expected, "{kind} CBOR/fee mismatch");
    }

    for invalid_certificates in [
      r#"[{"kind":"StakeDelegation","stakeCredentialKeyHashHex":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","poolKeyHash":"not-hex"}]"#,
      r#"[{"kind":"PoolRegistration","stakeCredentialKeyHashHex":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}]"#,
    ] {
      let encoded = invalid_certificates
        .as_bytes()
        .iter()
        .map(|byte| format!("%{:02X}", byte))
        .collect::<String>();
      let args =
        format!(
        "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}",
        "01".repeat(32), address, address, address, encoded,
      );
      assert!(
        build_simple_payment_transaction_hex(&args).is_err(),
        "{}",
        format!("accepted invalid certificate {invalid_certificates}")
      );
    }
  }

  #[test]
  fn key_withdrawal_matches_csl_body_fee_and_rejects_non_reward_addresses() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let stake_hash = csl::Ed25519KeyHash::from_bytes(hex::decode("aa".repeat(28)).unwrap()).unwrap();
    let reward = csl::RewardAddress::new(0, &csl::Credential::from_keyhash(&stake_hash))
      .to_address().to_bech32(None).unwrap();
    let withdrawals_json = serde_json::json!([{"rewardAddress": reward, "amount": "3500000"}]).to_string();
    let withdrawals_arg = withdrawals_json.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>();
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|-|{}",
      "01".repeat(32), address, address, address, withdrawals_arg,
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();

    let addr = csl::Address::from_bech32(address).unwrap();
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
      .build()
      .unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    builder.add_regular_input(
      &addr,
      &csl::TransactionInput::new(
        &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
        0,
      ),
      &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
    ).unwrap();
    builder.add_output(&csl::TransactionOutput::new(
      &addr,
      &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
    )).unwrap();
    builder.set_ttl(123456);
    let mut withdrawals = csl::Withdrawals::new();
    withdrawals.insert(
      &csl::RewardAddress::from_address(&csl::Address::from_bech32(&reward).unwrap()).unwrap(),
      &csl::BigNum::from_str("3500000").unwrap(),
    );
    builder.set_withdrawals(&withdrawals);
    assert!(builder.add_change_if_needed(&addr).unwrap());
    let body = builder.build().unwrap();
    let expected = csl::Transaction::new(&body, &csl::TransactionWitnessSet::new(), None).to_bytes();
    assert_eq!(cml_cbor, expected);

    let invalid = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|-|%5B%7B%22rewardAddress%22%3A%22{}%22%2C%22amount%22%3A%223500000%22%7D%5D",
      "01".repeat(32), address, address, address, address,
    );
    assert!(build_simple_payment_transaction_hex(&invalid).is_err());
  }

  #[test]
  fn stake_delegation_and_key_withdrawal_together_match_csl_body_fee_and_witnesses() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let stake_hash_hex = "aa".repeat(28);
    let pool_hash_hex = "bb".repeat(28);
    let stake_hash = csl::Ed25519KeyHash::from_bytes(hex::decode(&stake_hash_hex).unwrap()).unwrap();
    let pool_hash = csl::Ed25519KeyHash::from_bytes(hex::decode(&pool_hash_hex).unwrap()).unwrap();
    let reward = csl::RewardAddress::new(0, &csl::Credential::from_keyhash(&stake_hash))
      .to_address().to_bech32(None).unwrap();
    let certificates = serde_json::json!([{
      "kind": "StakeDelegation",
      "stakeCredentialKeyHashHex": stake_hash_hex,
      "poolKeyHash": pool_hash_hex,
    }]).to_string();
    let withdrawals = serde_json::json!([{"rewardAddress": reward, "amount": "3500000"}]).to_string();
    let encode = |value: &str| value.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>();
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}|{}",
      "07".repeat(32), address, address, address, encode(&certificates), encode(&withdrawals),
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();
    let review: serde_json::Value = serde_json::from_str(
      &transaction_review_info_json(&hex::encode(&cml_cbor)).unwrap(),
    ).unwrap();
    assert!(review["body"]["certificates"].is_array());
    assert_eq!(review["body"]["withdrawals"][0]["amount"], "3500000");
    assert_eq!(review["body"]["withdrawals"][0]["rewardAddress"], reward);
    assert!(review["body"]["withdrawals"][0]["rewardAddressHex"].is_string());
    assert_eq!(review["witnessSet"]["vkeys"], serde_json::json!([]));

    let addr = csl::Address::from_bech32(address).unwrap();
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
      .build()
      .unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    builder.add_regular_input(
      &addr,
      &csl::TransactionInput::new(
        &csl::TransactionHash::from_bytes(hex::decode("07".repeat(32)).unwrap()).unwrap(),
        0,
      ),
      &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
    ).unwrap();
    builder.add_output(&csl::TransactionOutput::new(
      &addr,
      &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
    )).unwrap();
    builder.set_ttl(123456);
    let credential = csl::Credential::from_keyhash(&stake_hash);
    let certificate = csl::Certificate::new_stake_delegation(
      &csl::StakeDelegation::new(&credential, &pool_hash),
    );
    let mut certs = csl::Certificates::new();
    certs.add(&certificate);
    builder.set_certs(&certs).unwrap();
    let mut csl_withdrawals = csl::Withdrawals::new();
    csl_withdrawals.insert(
      &csl::RewardAddress::from_address(&csl::Address::from_bech32(&reward).unwrap()).unwrap(),
      &csl::BigNum::from_str("3500000").unwrap(),
    );
    builder.set_withdrawals(&csl_withdrawals);
    assert!(builder.add_change_if_needed(&addr).unwrap());
    let body = builder.build().unwrap();
    let expected = csl::Transaction::new(&body, &csl::TransactionWitnessSet::new(), None).to_bytes();
    assert_eq!(cml_cbor, expected);
  }

  #[test]
  fn vote_delegation_drep_variants_match_csl_and_invalid_drep_is_rejected() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let stake_hash_hex = "aa".repeat(28);
    let stake_hash = csl::Ed25519KeyHash::from_bytes(hex::decode(&stake_hash_hex).unwrap()).unwrap();
    let credential = csl::Credential::from_keyhash(&stake_hash);
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
      .build()
      .unwrap();
    let key_drep_hash = csl::Ed25519KeyHash::from_bytes(hex::decode("bb".repeat(28)).unwrap()).unwrap();
    let script_drep_hash = csl::ScriptHash::from_bytes(hex::decode("cc".repeat(28)).unwrap()).unwrap();
    let variants = [
      (serde_json::json!("AlwaysAbstain"), csl::DRep::new_always_abstain()),
      (serde_json::json!("AlwaysNoConfidence"), csl::DRep::new_always_no_confidence()),
      (serde_json::json!({"KeyHash": "bb".repeat(28)}), csl::DRep::new_key_hash(&key_drep_hash)),
      (serde_json::json!({"ScriptHash": "cc".repeat(28)}), csl::DRep::new_script_hash(&script_drep_hash)),
    ];

    for (drep_json, drep) in variants {
      let certificate_json = serde_json::json!([{
        "kind": "VoteDelegation",
        "stakeCredentialKeyHashHex": stake_hash_hex,
        "drep": drep_json,
      }]).to_string();
      let encoded = certificate_json.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>();
      let args = format!(
        "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}",
        "01".repeat(32), address, address, address, encoded,
      );
      let cml = build_simple_payment_transaction_hex(&args).unwrap();
      let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();

      let addr = csl::Address::from_bech32(address).unwrap();
      let mut builder = csl::TransactionBuilder::new(&config);
      builder.add_regular_input(
        &addr,
        &csl::TransactionInput::new(
          &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
          0,
        ),
        &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
      ).unwrap();
      builder.add_output(&csl::TransactionOutput::new(
        &addr,
        &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
      )).unwrap();
      builder.set_ttl(123456);
      let cert = csl::Certificate::new_vote_delegation(&csl::VoteDelegation::new(&credential, &drep));
      let mut certs = csl::Certificates::new();
      certs.add(&cert);
      builder.set_certs(&certs).unwrap();
      assert!(builder.add_change_if_needed(&addr).unwrap());
      let body = builder.build().unwrap();
      let expected = csl::Transaction::new(&body, &csl::TransactionWitnessSet::new(), None).to_bytes();
      assert_eq!(cml_cbor, expected, "DRep {drep_json} CBOR/fee mismatch");
    }

    let invalid = serde_json::json!([{
      "kind": "VoteDelegation",
      "stakeCredentialKeyHashHex": stake_hash_hex,
      "drep": {"ScriptHash": "not-hex"},
    }]).to_string();
    let encoded = invalid.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>();
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}",
      "01".repeat(32), address, address, address, encoded,
    );
    assert!(build_simple_payment_transaction_hex(&args).is_err());
  }

  #[test]
  fn combined_stake_and_vote_certificates_match_csl_deposits_and_cbor() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let stake_hex = "aa".repeat(28);
    let pool_hex = "bb".repeat(28);
    let stake_hash = csl::Ed25519KeyHash::from_bytes(hex::decode(&stake_hex).unwrap()).unwrap();
    let pool_hash = csl::Ed25519KeyHash::from_bytes(hex::decode(&pool_hex).unwrap()).unwrap();
    let credential = csl::Credential::from_keyhash(&stake_hash);
    let drep_hash = csl::Ed25519KeyHash::from_bytes(hex::decode("cc".repeat(28)).unwrap()).unwrap();
    let drep = csl::DRep::new_key_hash(&drep_hash);
    let coin = csl::BigNum::from_str("2000000").unwrap();
    let variants = [
      (
        "StakeAndVoteDelegation",
        serde_json::json!({"kind":"StakeAndVoteDelegation","stakeCredentialKeyHashHex":stake_hex,"poolKeyHash":pool_hex,"drep":{"KeyHash":"cc".repeat(28)}}),
        csl::Certificate::new_stake_and_vote_delegation(&csl::StakeAndVoteDelegation::new(&credential, &pool_hash, &drep)),
      ),
      (
        "StakeRegistrationAndDelegation",
        serde_json::json!({"kind":"StakeRegistrationAndDelegation","stakeCredentialKeyHashHex":stake_hex,"poolKeyHash":pool_hex}),
        csl::Certificate::new_stake_registration_and_delegation(&csl::StakeRegistrationAndDelegation::new(&credential, &pool_hash, &coin)),
      ),
      (
        "StakeVoteRegistrationAndDelegation",
        serde_json::json!({"kind":"StakeVoteRegistrationAndDelegation","stakeCredentialKeyHashHex":stake_hex,"poolKeyHash":pool_hex,"drep":"AlwaysAbstain"}),
        csl::Certificate::new_stake_vote_registration_and_delegation(&csl::StakeVoteRegistrationAndDelegation::new(&credential, &pool_hash, &csl::DRep::new_always_abstain(), &coin)),
      ),
      (
        "VoteRegistrationAndDelegation",
        serde_json::json!({"kind":"VoteRegistrationAndDelegation","stakeCredentialKeyHashHex":stake_hex,"drep":"AlwaysNoConfidence"}),
        csl::Certificate::new_vote_registration_and_delegation(&csl::VoteRegistrationAndDelegation::new(&credential, &csl::DRep::new_always_no_confidence(), &coin)),
      ),
    ];
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
      .key_deposit(&coin)
      .max_value_size(5000)
      .max_tx_size(16384)
      .prefer_pure_change(true)
      .build()
      .unwrap();
    let addr = csl::Address::from_bech32(address).unwrap();

    for (kind, certificate_json, cert) in variants {
      let packed = serde_json::json!([certificate_json]).to_string();
      let encoded = packed.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>();
      let args = format!(
        "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}",
        "01".repeat(32), address, address, address, encoded,
      );
      let cml = build_simple_payment_transaction_hex(&args).unwrap();
      let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();
      let mut builder = csl::TransactionBuilder::new(&config);
      builder.add_regular_input(
        &addr,
        &csl::TransactionInput::new(
          &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
          0,
        ),
        &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
      ).unwrap();
      builder.add_output(&csl::TransactionOutput::new(
        &addr,
        &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
      )).unwrap();
      builder.set_ttl(123456);
      let mut certs = csl::Certificates::new();
      certs.add(&cert);
      builder.set_certs(&certs).unwrap();
      assert!(builder.add_change_if_needed(&addr).unwrap());
      let body = builder.build().unwrap();
      let expected = csl::Transaction::new(&body, &csl::TransactionWitnessSet::new(), None).to_bytes();
      assert_eq!(cml_cbor, expected, "{kind} CBOR/fee/deposit mismatch");
    }
  }

  #[test]
  fn validity_interval_start_matches_csl_transaction_cbor_and_fee() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|-|-|120000",
      "01".repeat(32), address, address, address,
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();

    let addr = csl::Address::from_bech32(address).unwrap();
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
      .build()
      .unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    builder.add_regular_input(
      &addr,
      &csl::TransactionInput::new(
        &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
        0,
      ),
      &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
    ).unwrap();
    builder.add_output(&csl::TransactionOutput::new(
      &addr,
      &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
    )).unwrap();
    builder.set_validity_start_interval_bignum(&csl::BigNum::from_str("120000").unwrap());
    builder.set_ttl_bignum(&csl::BigNum::from_str("123456").unwrap());
    assert!(builder.add_change_if_needed(&addr).unwrap());
    let body = builder.build().unwrap();
    let expected = csl::Transaction::new(&body, &csl::TransactionWitnessSet::new(), None).to_bytes();
    assert_eq!(cml_cbor, expected);

    let invalid = args.replace("120000", "-");
    let mut fields = invalid.split('|').collect::<Vec<_>>();
    fields[3] = "not-a-slot";
    assert!(build_simple_payment_transaction_hex(&fields.join("|")).is_err());
  }

  #[test]
  fn reference_input_matches_csl_transaction_cbor_and_fee() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|-|-|-|{},1,{},1000000,-",
      "01".repeat(32), address, address, address, "02".repeat(32), address,
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();

    let addr = csl::Address::from_bech32(address).unwrap();
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
      .build()
      .unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    builder.add_regular_input(
      &addr,
      &csl::TransactionInput::new(
        &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
        0,
      ),
      &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
    ).unwrap();
    builder.add_output(&csl::TransactionOutput::new(
      &addr,
      &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
    )).unwrap();
    builder.add_reference_input(&csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("02".repeat(32)).unwrap()).unwrap(),
      1,
    ));
    builder.set_ttl_bignum(&csl::BigNum::from_str("123456").unwrap());
    assert!(builder.add_change_if_needed(&addr).unwrap());
    let body = builder.build().unwrap();
    let expected = csl::Transaction::new(&body, &csl::TransactionWitnessSet::new(), None).to_bytes();
    assert_eq!(cml_cbor, expected);

    let invalid = args.replace(",1,", ",bad-index,");
    assert!(build_simple_payment_transaction_hex(&invalid).is_err());
  }

  #[test]
  fn metadata_encoding_matches_csl_for_escaped_strings_and_large_integers() {
    use cardano_serialization_lib as csl;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let metadata_json = r#"[{"label":"674","data":{"msg":["café | pipe",9007199254740993]}}]"#;
    let metadata_arg =
      metadata_json.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>();
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|{}",
      "01".repeat(32),
      address,
      address,
      address,
      metadata_arg,
    );
    let cml_cbor = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml_cbor.rsplit_once('|').unwrap().0).unwrap();
    let review: serde_json::Value = serde_json::from_str(
      &transaction_review_info_json(&hex::encode(&cml_cbor)).unwrap(),
    ).unwrap();
    assert_eq!(
      review["auxiliaryData"]["metadata"][0]["basicConversionsJson"],
      r#"{"msg":["café | pipe",9007199254740993]}"#,
    );

    let addr = csl::Address::from_bech32(address).unwrap();
    let linear_fee = csl::LinearFee::new(
      &csl::BigNum::from_str("44").unwrap(),
      &csl::BigNum::from_str("155381").unwrap(),
    );
    let ex_prices = csl::ExUnitPrices::new(
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("577").unwrap(),
        &csl::BigNum::from_str("10000").unwrap(),
      ),
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("721").unwrap(),
        &csl::BigNum::from_str("10000000").unwrap(),
      ),
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
    builder
      .add_output(&csl::TransactionOutput::new(
        &addr,
        &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
      ))
      .unwrap();
    builder.set_ttl(123456);
    let input = csl::TransactionInput::new(
      &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
      0,
    );
    let utxo = csl::TransactionUnspentOutput::new(
      &input,
      &csl::TransactionOutput::new(
        &addr,
        &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
      ),
    );
    let mut utxos = csl::TransactionUnspentOutputs::new();
    utxos.add(&utxo);
    builder
      .add_inputs_from(&utxos, csl::CoinSelectionStrategyCIP2::LargestFirstMultiAsset)
      .unwrap();
    let metadatum = csl::encode_json_str_to_metadatum(
      r#"{"msg":["café | pipe",9007199254740993]}"#.to_owned(),
      csl::MetadataJsonSchema::BasicConversions,
    )
    .unwrap();
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
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("577").unwrap(),
        &csl::BigNum::from_str("10000").unwrap(),
      ),
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("721").unwrap(),
        &csl::BigNum::from_str("10000000").unwrap(),
      ),
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
    builder
      .add_regular_input(
        &input_address,
        &csl::TransactionInput::new(
          &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
          0,
        ),
        &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
      )
      .unwrap();
    let change_address = csl::Address::from_bech32(address).unwrap();
    assert!(builder.add_change_if_needed(&change_address).unwrap());
    let body = builder.build().unwrap();
    let expected =
      csl::Transaction::new(&body, &csl::TransactionWitnessSet::new(), None).to_bytes();
    assert_eq!(cml, expected);
  }

  #[test]
  fn multiple_native_script_inputs_and_required_signers_match_csl_fee() {
    use cardano_serialization_lib as csl;

    let script_cbor = format!("8200581c{}", "ab".repeat(28));
    let second_script_cbor = format!("8200581c{}", "cd".repeat(28));
    let script = csl::NativeScript::from_bytes(hex::decode(&script_cbor).unwrap()).unwrap();
    let second_script =
      csl::NativeScript::from_bytes(hex::decode(&second_script_cbor).unwrap()).unwrap();
    let address_for_script = |script: &csl::NativeScript| {
      csl::EnterpriseAddress::new(
        csl::NetworkInfo::new(0, 1).network_id(),
        &csl::Credential::from_scripthash(&script.hash()),
      )
      .to_address()
      .to_bech32(None)
      .unwrap()
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
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("577").unwrap(),
        &csl::BigNum::from_str("10000").unwrap(),
      ),
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("721").unwrap(),
        &csl::BigNum::from_str("10000000").unwrap(),
      ),
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
    builder
      .add_output(&csl::TransactionOutput::new(
        &csl::Address::from_bech32(address).unwrap(),
        &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()),
      ))
      .unwrap();
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
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("577").unwrap(),
        &csl::BigNum::from_str("10000").unwrap(),
      ),
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("721").unwrap(),
        &csl::BigNum::from_str("10000000").unwrap(),
      ),
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
      .build()
      .unwrap();
    let mut builder = csl::TransactionBuilder::new(&config);
    builder.add_output(&csl::TransactionOutput::new(&addr, &output_value)).unwrap();
    builder.set_ttl(123456);
    builder
      .add_regular_input(
        &addr,
        &csl::TransactionInput::new(
          &csl::TransactionHash::from_bytes(hex::decode("01".repeat(32)).unwrap()).unwrap(),
          0,
        ),
        &csl::Value::new(&csl::BigNum::from_str("10000000").unwrap()),
      )
      .unwrap();
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
      assets::AssetName, crypto::ScriptHash, serialization::Deserialize, transaction::Transaction,
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
    assert_eq!(
      transaction.body.outputs[0].amount().multiasset.get(&policy, &name),
      Some(9007199254740993)
    );
    assert_eq!(
      transaction.body.outputs[1].amount().multiasset.get(&policy, &name),
      Some(9007199254740993)
    );
    assert!(transaction.body.outputs[1].amount().coin >= 1000000);
    assert_eq!(
      transaction.body.outputs.iter().map(|output| output.amount().coin).sum::<u64>()
        + transaction.body.fee,
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
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("577").unwrap(),
        &csl::BigNum::from_str("10000").unwrap(),
      ),
      &csl::UnitInterval::new(
        &csl::BigNum::from_str("721").unwrap(),
        &csl::BigNum::from_str("10000000").unwrap(),
      ),
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
    hash_output
      .set_data_hash(&csl::DataHash::from_bytes(hex::decode(datum_hash_hex).unwrap()).unwrap());
    csl_builder.add_output(&hash_output).unwrap();
    csl_builder.set_ttl(123456);
    csl_builder
      .add_inputs_from(&utxos, csl::CoinSelectionStrategyCIP2::LargestFirstMultiAsset)
      .unwrap();
    assert!(csl_builder.add_change_if_needed(&addr).unwrap());
    let csl_body = csl_builder.build().unwrap();
    let csl_transaction =
      csl::Transaction::new(&csl_body, &csl::TransactionWitnessSet::new(), None);
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
    let output =
      csl::TransactionOutput::new(&csl::Address::from_bech32(address).unwrap(), &low_value);
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
      serialization::Serialize,
      transaction::{TransactionInput, TransactionOutput},
      Rational,
    };

    const ADDRESS_HEX: &str = "000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf";
    const CSL_BODY_HEX: &str = "a400d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00777f7b021a00029285031a0001e240";

    let address = Address::from_hex(ADDRESS_HEX).unwrap();
    let config = TransactionBuilderConfigBuilder::new()
      .fee_algo(LinearFee::new(44, 155381, 0))
      .coins_per_utxo_byte(4310)
      .ex_unit_prices(ExUnitPrices::new(Rational::new(577, 10000), Rational::new(721, 10000000)))
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
    builder.add_input(SingleInputBuilder::new(input, utxo).payment_key().unwrap()).unwrap();
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
    let transaction =
      builder.build(ChangeSelectionAlgo::Default, &address).unwrap().build_unchecked();

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
      "01".repeat(32),
      address,
      address,
      address,
    ))
    .unwrap();
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
