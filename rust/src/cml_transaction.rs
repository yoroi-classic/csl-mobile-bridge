use crate::cml_address::parse_payment_address;
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
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ScriptUtxoArgs {
  tx_hash_hex: String,
  index: String,
  address: String,
  #[serde(default)]
  address_hex: Option<String>,
  #[serde(default)]
  is_bootstrap: Option<bool>,
  lovelace: String,
  assets: Vec<ScriptAssetArgs>,
  inline_datum_cbor_hex: Option<String>,
  datum_cbor_hex: Option<String>,
  native_script_cbor_hex: Option<String>,
  native_script_witness_count: Option<String>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct ScriptAssetArgs {
  policy_id_hex: String,
  asset_name_hex: String,
  quantity: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct ScriptOutputArgs {
  address: String,
  lovelace: String,
  assets: Vec<ScriptAssetArgs>,
  datum_cbor_hex: Option<String>,
  datum_hash_hex: Option<String>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct EscrowCmlArgs {
  script_input: ScriptUtxoArgs,
  #[serde(default)]
  additional_script_inputs: Vec<AdditionalScriptInputArgs>,
  reference_script_input: Option<ScriptUtxoArgs>,
  #[serde(default)]
  reference_inputs: Vec<ScriptUtxoArgs>,
  reference_script_cbor_hex: Option<String>,
  reference_script_size: Option<String>,
  #[serde(default)]
  inline_script_cbor_hex: Option<String>,
  funding_inputs: Vec<ScriptUtxoArgs>,
  collateral_input: ScriptUtxoArgs,
  #[serde(default)]
  additional_collateral_inputs: Vec<ScriptUtxoArgs>,
  collateral_return: Option<ScriptOutputArgs>,
  manual_change_output: Option<ScriptOutputArgs>,
  manual_fee: Option<String>,
  total_collateral: Option<String>,
  outputs: Vec<ScriptOutputArgs>,
  change_address: String,
  script_hash_hex: Option<String>,
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
  metadata: Option<String>,
  #[serde(default)]
  certificates: Vec<StakeCertificateArgs>,
  #[serde(default)]
  withdrawals: Vec<WithdrawalArgs>,
  #[serde(default)]
  mints: Vec<RecipeMintArgs>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct AdditionalScriptInputArgs {
  script_input: ScriptUtxoArgs,
  #[serde(default)]
  script_hash_hex: Option<String>,
  #[serde(default)]
  plutus_version: Option<String>,
  #[serde(default)]
  reference_script_input: Option<ScriptUtxoArgs>,
  #[serde(default)]
  reference_script_cbor_hex: Option<String>,
  #[serde(default)]
  reference_script_size: Option<String>,
  #[serde(default)]
  inline_script_cbor_hex: Option<String>,
  redeemer_cbor_hex: String,
  redeemer_mem: String,
  redeemer_steps: String,
}

fn parse_plutus_language(
  version: Option<&str>,
) -> Result<(u64, cml_chain::plutus::Language), String> {
  match version.unwrap_or("V3") {
    "V1" => Ok((0, cml_chain::plutus::Language::PlutusV1)),
    "V2" => Ok((1, cml_chain::plutus::Language::PlutusV2)),
    "V3" => Ok((2, cml_chain::plutus::Language::PlutusV3)),
    other => Err(format!("unsupported Plutus version: {other}")),
  }
}

fn spend_redeemer_index(
  args: &EscrowCmlArgs, tx_hash_hex: &str, index: &str,
) -> Result<u64, String> {
  let mut inputs =
    Vec::with_capacity(1 + args.additional_script_inputs.len() + args.funding_inputs.len());
  inputs.push((
    args.script_input.tx_hash_hex.to_ascii_lowercase(),
    args
      .script_input
      .index
      .parse::<u64>()
      .map_err(|err| format!("invalid script input index: {err}"))?,
  ));
  inputs.extend(
    args
      .additional_script_inputs
      .iter()
      .map(|spend| {
        Ok((
          spend.script_input.tx_hash_hex.to_ascii_lowercase(),
          spend
            .script_input
            .index
            .parse::<u64>()
            .map_err(|err| format!("invalid script input index: {err}"))?,
        ))
      })
      .collect::<Result<Vec<_>, String>>()?,
  );
  inputs.extend(
    args
      .funding_inputs
      .iter()
      .map(|input| {
        Ok((
          input.tx_hash_hex.to_ascii_lowercase(),
          input
            .index
            .parse::<u64>()
            .map_err(|err| format!("invalid funding input index: {err}"))?,
        ))
      })
      .collect::<Result<Vec<_>, String>>()?,
  );
  inputs.sort();
  let wanted_index =
    index.parse::<u64>().map_err(|err| format!("invalid script input index: {err}"))?;
  let wanted_hash = tx_hash_hex.to_ascii_lowercase();
  inputs
    .iter()
    .position(|input| input.0 == wanted_hash && input.1 == wanted_index)
    .map(|position| position as u64)
    .ok_or_else(|| "script input is missing from the transaction inputs".to_owned())
}

#[derive(serde::Deserialize, serde::Serialize)]
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

#[derive(Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct StakeCertificateArgs {
  kind: String,
  #[serde(default)]
  stake_credential_key_hash_hex: Option<String>,
  pool_key_hash: Option<String>,
  drep: Option<DRepArgs>,
  #[serde(default)]
  credential: Option<CertificateCredentialArgs>,
  #[serde(default)]
  cold_credential: Option<CertificateCredentialArgs>,
  #[serde(default)]
  hot_credential: Option<CertificateCredentialArgs>,
  #[serde(default)]
  deposit: Option<String>,
  #[serde(default)]
  epoch: Option<String>,
  #[serde(default)]
  anchor: Option<CertificateAnchorArgs>,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct CertificateCredentialArgs {
  kind: String,
  hash_hex: String,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct CertificateAnchorArgs {
  url: String,
  data_hash_hex: String,
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
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

fn parse_certificate_credential(
  value: CertificateCredentialArgs,
) -> Result<cml_chain::certs::Credential, String> {
  use cml_chain::{certs::Credential, crypto::Ed25519KeyHash};
  let bytes =
    hex::decode(&value.hash_hex).map_err(|err| format!("invalid credential hash: {err}"))?;
  match value.kind.as_str() {
    "key" => Ok(Credential::new_pub_key(
      Ed25519KeyHash::from_raw_bytes(&bytes).map_err(|err| err.to_string())?,
    )),
    "script" => {
      Ok(Credential::new_script(ScriptHash::from_raw_bytes(&bytes).map_err(|err| err.to_string())?))
    }
    _ => Err(format!("unsupported certificate credential kind: {}", value.kind)),
  }
}

fn parse_certificate_anchor(
  value: Option<CertificateAnchorArgs>,
) -> Result<Option<cml_chain::governance::Anchor>, String> {
  use cml_chain::{certs::Url, crypto::AnchorDocHash, governance::Anchor};
  value
    .map(|value| {
      let hash_bytes =
        hex::decode(&value.data_hash_hex).map_err(|err| format!("invalid anchor hash: {err}"))?;
      let hash = AnchorDocHash::from_raw_bytes(&hash_bytes).map_err(|err| err.to_string())?;
      let url = Url::new(value.url).map_err(|err| format!("invalid anchor URL: {err}"))?;
      Ok(Anchor::new(url, hash))
    })
    .transpose()
}

fn parse_certificate_amount(value: &str, field: &str) -> Result<u64, String> {
  value.parse::<u64>().map_err(|err| format!("invalid {field}: {err}"))
}

fn add_stake_certificates(
  builder: &mut cml_chain::builders::tx_builder::TransactionBuilder,
  certificates: Vec<StakeCertificateArgs>, key_deposit: u64,
) -> Result<(), String> {
  use cml_chain::{
    builders::certificate_builder::SingleCertificateBuilder,
    certs::{Certificate, StakeCredential},
    crypto::Ed25519KeyHash,
  };
  for certificate in certificates {
    let credential = if let Some(hash_hex) = &certificate.stake_credential_key_hash_hex {
      let bytes =
        hex::decode(hash_hex).map_err(|err| format!("invalid stake credential key hash: {err}"))?;
      Some(StakeCredential::new_pub_key(
        Ed25519KeyHash::from_raw_bytes(&bytes).map_err(|err| err.to_string())?,
      ))
    } else if let Some(value) = certificate.credential.clone() {
      Some(parse_certificate_credential(value)?)
    } else {
      None
    };
    let cert_credential_is_script = certificate
      .credential
      .as_ref()
      .or(certificate.cold_credential.as_ref())
      .is_some_and(|value| value.kind == "script");
    let certificate_kind = certificate.kind.clone();
    let credential_required = || {
      credential.clone().ok_or_else(|| format!("{certificate_kind} certificate missing credential"))
    };
    let cert = match certificate.kind.as_str() {
      "StakeRegistration" => Certificate::new_stake_registration(credential_required()?),
      "StakeDeregistration" => Certificate::new_stake_deregistration(credential_required()?),
      "StakeDelegation" => {
        let pool_hash =
          certificate.pool_key_hash.ok_or("stake delegation missing pool key hash")?;
        Certificate::new_stake_delegation(
          credential_required()?,
          Ed25519KeyHash::from_raw_bytes(
            &hex::decode(pool_hash).map_err(|err| format!("invalid pool key hash: {err}"))?,
          )
          .map_err(|err| err.to_string())?,
        )
      }
      "VoteDelegation" => Certificate::new_vote_deleg_cert(
        credential_required()?,
        parse_drep_arg(certificate.drep.ok_or("vote delegation missing DRep")?)?,
      ),
      "StakeAndVoteDelegation" => {
        let pool_hash =
          certificate.pool_key_hash.ok_or("stake/vote delegation missing pool key hash")?;
        let pool_hash = Ed25519KeyHash::from_raw_bytes(
          &hex::decode(pool_hash).map_err(|err| format!("invalid pool key hash: {err}"))?,
        )
        .map_err(|err| err.to_string())?;
        Certificate::new_stake_vote_deleg_cert(
          credential_required()?,
          pool_hash,
          parse_drep_arg(certificate.drep.ok_or("stake/vote delegation missing DRep")?)?,
        )
      }
      "StakeRegistrationAndDelegation" => {
        let pool_hash =
          certificate.pool_key_hash.ok_or("stake registration/delegation missing pool key hash")?;
        let pool_hash = Ed25519KeyHash::from_raw_bytes(
          &hex::decode(pool_hash).map_err(|err| format!("invalid pool key hash: {err}"))?,
        )
        .map_err(|err| err.to_string())?;
        Certificate::new_stake_reg_deleg_cert(credential_required()?, pool_hash, key_deposit)
      }
      "VoteRegistrationAndDelegation" => Certificate::new_vote_reg_deleg_cert(
        credential_required()?,
        parse_drep_arg(certificate.drep.ok_or("vote registration/delegation missing DRep")?)?,
        key_deposit,
      ),
      "StakeVoteRegistrationAndDelegation" => {
        let pool_hash =
          certificate.pool_key_hash.ok_or("stake/vote registration missing pool key hash")?;
        let pool_hash = Ed25519KeyHash::from_raw_bytes(
          &hex::decode(pool_hash).map_err(|err| format!("invalid pool key hash: {err}"))?,
        )
        .map_err(|err| err.to_string())?;
        Certificate::new_stake_vote_reg_deleg_cert(
          credential_required()?,
          pool_hash,
          parse_drep_arg(certificate.drep.ok_or("stake/vote registration missing DRep")?)?,
          key_deposit,
        )
      }
      "PoolRetirement" => {
        let pool_hash = certificate.pool_key_hash.ok_or("pool retirement missing pool key hash")?;
        let epoch = certificate
          .epoch
          .ok_or("pool retirement missing epoch")?
          .parse::<u64>()
          .map_err(|err| format!("invalid pool retirement epoch: {err}"))?;
        Certificate::new_pool_retirement(
          Ed25519KeyHash::from_raw_bytes(&hex::decode(pool_hash).map_err(|err| err.to_string())?)
            .map_err(|err| err.to_string())?,
          epoch,
        )
      }
      "CommitteeHotAuth" => Certificate::new_auth_committee_hot_cert(
        parse_certificate_credential(
          certificate.cold_credential.ok_or("committee hot auth missing cold credential")?,
        )?,
        parse_certificate_credential(
          certificate.hot_credential.ok_or("committee hot auth missing hot credential")?,
        )?,
      ),
      "CommitteeColdResign" => Certificate::new_resign_committee_cold_cert(
        parse_certificate_credential(
          certificate.cold_credential.ok_or("committee cold resignation missing credential")?,
        )?,
        parse_certificate_anchor(certificate.anchor)?,
      ),
      "DRepRegistration" => Certificate::new_reg_drep_cert(
        parse_certificate_credential(
          certificate.credential.ok_or("DRep registration missing credential")?,
        )?,
        parse_certificate_amount(
          certificate.deposit.as_deref().ok_or("DRep registration missing deposit")?,
          "DRep deposit",
        )?,
        parse_certificate_anchor(certificate.anchor)?,
      ),
      "DRepDeregistration" => Certificate::new_unreg_drep_cert(
        parse_certificate_credential(
          certificate.credential.ok_or("DRep deregistration missing credential")?,
        )?,
        parse_certificate_amount(
          certificate.deposit.as_deref().ok_or("DRep deregistration missing deposit")?,
          "DRep deposit",
        )?,
      ),
      "DRepUpdate" => Certificate::new_update_drep_cert(
        parse_certificate_credential(
          certificate.credential.ok_or("DRep update missing credential")?,
        )?,
        parse_certificate_anchor(certificate.anchor)?,
      ),
      unsupported => return Err(format!("unsupported stake certificate: {unsupported}")),
    };
    let result = if certificate.kind == "StakeRegistration" || cert_credential_is_script {
      SingleCertificateBuilder::new(cert).skip_witness()
    } else {
      SingleCertificateBuilder::new(cert).payment_key().map_err(|err| err.to_string())?
    };
    builder.add_cert(result);
  }
  Ok(())
}

#[derive(Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct WithdrawalArgs {
  reward_address: String,
  amount: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct TransactionRecipeArgs {
  protocol_params: RecipeProtocolParams,
  inputs: Vec<RecipeInputArgs>,
  outputs: Vec<RecipeOutputArgs>,
  #[serde(default)]
  certificates: Vec<StakeCertificateArgs>,
  #[serde(default)]
  withdrawals: Vec<WithdrawalArgs>,
  #[serde(default)]
  reference_inputs: Vec<RecipeReferenceInputArgs>,
  #[serde(default)]
  script_inputs: Vec<RecipeScriptInputArgs>,
  #[serde(default)]
  collateral_inputs: Vec<RecipeInputArgs>,
  collateral_return: Option<RecipeOutputArgs>,
  total_collateral: Option<String>,
  #[serde(default)]
  mints: Vec<RecipeMintArgs>,
  #[serde(default)]
  metadata: Vec<serde_json::Value>,
  options: RecipeOptions,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RecipeProtocolParams {
  linear_fee: LinearFeeArgs,
  coins_per_utxo_byte: String,
  key_deposit: String,
  pool_deposit: String,
  max_value_size: String,
  #[serde(default)]
  max_tx_size: Option<String>,
  #[serde(default)]
  collateral_percentage: Option<String>,
  #[serde(default)]
  ref_script_coins_per_byte: Option<RationalArgs>,
  #[serde(default)]
  ref_script_tier_step_bytes: Option<String>,
  #[serde(default)]
  ref_script_multiplier: Option<String>,
  #[serde(default)]
  ex_unit_prices_memory: Option<RationalArgs>,
  #[serde(default)]
  ex_unit_prices_steps: Option<RationalArgs>,
  #[serde(default)]
  plutus_v1_cost_model: Option<Vec<i64>>,
  #[serde(default)]
  plutus_v2_cost_model: Option<Vec<i64>>,
  #[serde(default)]
  plutus_v3_cost_model: Option<Vec<i64>>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct LinearFeeArgs {
  coefficient: String,
  constant: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RecipeInputArgs {
  #[serde(default)]
  kind: Option<String>,
  tx_hash_hex: String,
  index: String,
  address: String,
  #[serde(default)]
  address_hex: Option<String>,
  #[serde(default)]
  is_bootstrap: Option<bool>,
  lovelace: String,
  #[serde(default)]
  assets: Vec<ScriptAssetArgs>,
  #[serde(default)]
  native_script_cbor_hex: Option<String>,
  #[serde(default)]
  native_script_witness_count: Option<String>,
  #[serde(default)]
  inline_datum_cbor_hex: Option<String>,
  #[serde(default)]
  datum_hash_hex: Option<String>,
  #[serde(default)]
  reference_script: Option<RecipeReferenceScriptArgs>,
}

#[derive(serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
#[allow(dead_code)]
struct RecipeReferenceScriptArgs {
  hash: String,
  #[serde(default)]
  script_type: Option<String>,
  #[serde(default)]
  size: Option<u64>,
  #[serde(default)]
  bytes: Option<String>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RecipeScriptInputArgs {
  utxo: RecipeInputArgs,
  #[serde(default)]
  script_hash_hex: Option<String>,
  plutus_version: String,
  #[serde(default)]
  inline_script_cbor_hex: Option<String>,
  redeemer_cbor_hex: String,
  redeemer_mem: String,
  redeemer_steps: String,
  datum_source: serde_json::Value,
  #[serde(default)]
  reference_script: Option<RecipeScriptReferenceArgs>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RecipeScriptReferenceArgs {
  utxo: RecipeInputArgs,
  script_cbor_hex: String,
  size: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RecipeReferenceInputArgs {
  tx_hash_hex: String,
  index: String,
  address: String,
  #[serde(default)]
  address_hex: Option<String>,
  #[serde(default)]
  is_bootstrap: Option<bool>,
  lovelace: String,
  #[serde(default)]
  assets: Vec<ScriptAssetArgs>,
  #[serde(default)]
  reference_script: Option<RecipeReferenceScriptArgs>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RecipeOutputArgs {
  address: String,
  lovelace: String,
  #[serde(default)]
  assets: Vec<ScriptAssetArgs>,
  datum: Option<RecipeDatumArgs>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RecipeDatumArgs {
  kind: String,
  hex: String,
}

#[derive(serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RecipeMintArgs {
  policy_id_hex: String,
  script_type: String,
  script_cbor_hex: String,
  #[serde(default)]
  plutus_version: Option<String>,
  #[serde(default)]
  redeemer_cbor_hex: Option<String>,
  #[serde(default)]
  redeemer_mem: Option<String>,
  #[serde(default)]
  redeemer_steps: Option<String>,
  #[serde(default)]
  reference_input: Option<RecipeReferenceInputArgs>,
  assets: Vec<RecipeMintAssetArgs>,
}

#[derive(serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RecipeMintAssetArgs {
  asset_name_hex: String,
  quantity: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct RecipeOptions {
  #[serde(default)]
  change_address: Option<String>,
  #[serde(default)]
  ttl: Option<String>,
  #[serde(default)]
  validity_interval_start: Option<String>,
  #[serde(default)]
  validity_interval_end: Option<String>,
  #[serde(default)]
  manual_fee: Option<String>,
  #[serde(default)]
  manual_change_output: Option<RecipeOutputArgs>,
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
  if !(10..=19).contains(&fields.len()) {
    return Err(format!("expected 10 to 19 payment fields, received {}", fields.len()));
  }
  let parse_u64 = |index: usize, name: &str| -> Result<u64, String> {
    decode_percent_encoded_text(fields[index], name)?
      .parse::<u64>()
      .map_err(|err| format!("invalid {name}: {err}"))
  };
  let change_address =
    parse_payment_address(&decode_percent_encoded_text(fields[2], "change address")?)?;
  let ttl = if fields[3] == "-" { None } else { Some(parse_u64(3, "ttl")?) };
  let fee_coefficient = parse_u64(4, "fee coefficient")?;
  let fee_constant = parse_u64(5, "fee constant")?;
  let coins_per_utxo_byte = parse_u64(6, "coins per UTXO byte")?;
  let key_deposit = parse_u64(7, "key deposit")?;
  let pool_deposit = parse_u64(8, "pool deposit")?;
  let max_value_size = u32::try_from(parse_u64(9, "max value size")?)
    .map_err(|err| format!("max value size is out of range: {err}"))?;
  let max_tx_size = if fields.len() >= 19 {
    u32::try_from(parse_u64(18, "max transaction size")?)
      .map_err(|err| format!("max transaction size is out of range: {err}"))?
  } else {
    16384
  };

  let config = TransactionBuilderConfigBuilder::new()
    .fee_algo(LinearFee::new(fee_coefficient, fee_constant, 0))
    .coins_per_utxo_byte(coins_per_utxo_byte)
    // This endpoint does not accept Plutus scripts or redeemers, so execution
    // prices cannot affect its fee calculation. CML requires the config field.
    .ex_unit_prices(ExUnitPrices::new(Rational::new(0, 1), Rational::new(0, 1)))
    .pool_deposit(pool_deposit)
    .key_deposit(key_deposit)
    .max_value_size(max_value_size)
    .max_tx_size(max_tx_size)
    .collateral_percentage(150)
    .max_collateral_inputs(3)
    .prefer_pure_change(fields.len() < 12 || fields[11] == "-")
    .build()
    .map_err(|err| err.to_string())?;
  let mut builder = TransactionBuilder::new(config);
  let inputs =
    if fields[0].is_empty() { Vec::new() } else { fields[0].split(';').collect::<Vec<_>>() };
  let has_withdrawals = fields.len() >= 14 && fields[13] != "-";
  if inputs.is_empty() && !has_withdrawals {
    return Err("at least one input is required".to_owned());
  }
  for packed_input in inputs {
    let input_fields = packed_input.split(',').collect::<Vec<_>>();
    if !matches!(input_fields.len(), 5 | 7 | 8 | 9) {
      return Err(
        "each input must contain hash,index,address,lovelace,assets[,nativeScriptHex,witnessCount]"
          .to_owned(),
      );
    }
    let hash_text = decode_percent_encoded_text(input_fields[0], "input hash")?;
    let hash = hex::decode(hash_text).map_err(|err| format!("invalid input hash: {err}"))?;
    let hash = TransactionHash::from_raw_bytes(&hash).map_err(|err| err.to_string())?;
    let index = decode_percent_encoded_text(input_fields[1], "input index")?
      .parse::<u64>()
      .map_err(|err| format!("invalid input index: {err}"))?;
    let address =
      parse_payment_address(&decode_percent_encoded_text(input_fields[2], "input address")?)?;
    if input_fields.len() >= 8 && input_fields[7] != "-" {
      let address_hex_text = decode_percent_encoded_text(input_fields[7], "input address hex")?;
      let address_hex =
        hex::decode(address_hex_text).map_err(|err| format!("invalid input address hex: {err}"))?;
      let parsed_address = cml_chain::address::Address::from_raw_bytes(&address_hex)
        .map_err(|err| format!("invalid input address hex CBOR: {err}"))?;
      if parsed_address.to_raw_bytes() != address.to_raw_bytes() {
        return Err("input address and addressHex do not identify the same address".to_owned());
      }
    }
    if input_fields.len() >= 9 && input_fields[8] != "-" {
      let bootstrap_text = decode_percent_encoded_text(input_fields[8], "isBootstrap")?;
      let declared_bootstrap = match bootstrap_text.as_str() {
        "true" => true,
        "false" => false,
        other => return Err(format!("invalid isBootstrap value: {other}")),
      };
      if declared_bootstrap != matches!(address, cml_chain::address::Address::Byron(_)) {
        return Err("isBootstrap does not match the parsed input address".to_owned());
      }
    }
    let coin = decode_percent_encoded_text(input_fields[3], "input coin")?
      .parse::<u64>()
      .map_err(|err| format!("invalid input coin: {err}"))?;
    let assets = decode_percent_encoded_text(input_fields[4], "input assets")?;
    let input = TransactionInput::new(hash, index);
    let utxo =
      TransactionOutput::new(address, Value::new(coin, parse_multiasset(&assets)?), None, None);
    let input_builder = SingleInputBuilder::new(input, utxo);
    let input_result = if input_fields.len() >= 7 && input_fields[5] != "-" {
      let script_text = decode_percent_encoded_text(input_fields[5], "native script")?;
      let script_bytes =
        hex::decode(script_text).map_err(|err| format!("invalid native script: {err}"))?;
      let script = cml_chain::transaction::NativeScript::from_cbor_bytes(&script_bytes)
        .map_err(|err| format!("invalid native script CBOR: {err}"))?;
      let witness_count =
        decode_percent_encoded_text(input_fields[6], "native script witness count")?;
      let witness_info = if witness_count == "-" {
        NativeScriptWitnessInfo::assume_signature_count()
      } else {
        let count = witness_count
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
  let outputs =
    if fields[1].is_empty() { Vec::new() } else { fields[1].split(';').collect::<Vec<_>>() };
  for packed_output in outputs {
    let output_fields = packed_output.split(',').collect::<Vec<_>>();
    if output_fields.len() != 4 {
      return Err("each output must contain address,lovelace,assets,datum".to_owned());
    }
    let address =
      parse_payment_address(&decode_percent_encoded_text(output_fields[0], "output address")?)?;
    let coin = decode_percent_encoded_text(output_fields[1], "output coin")?
      .parse::<u64>()
      .map_err(|err| format!("invalid output coin: {err}"))?;
    let mut output_builder = TransactionOutputBuilder::new().with_address(address);
    if output_fields[3] != "-" {
      let datum_text = decode_percent_encoded_text(output_fields[3], "output datum")?;
      let datum = datum_text.splitn(2, '~').collect::<Vec<_>>();
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
    let assets = decode_percent_encoded_text(output_fields[2], "output assets")?;
    let output_builder = output_builder
      .next()
      .map_err(|err| err.to_string())?
      .with_value(Value::new(coin, parse_multiasset(&assets)?));
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
      let script_text = decode_percent_encoded_text(mint_fields[2], "mint native script")?;
      let script_bytes =
        hex::decode(script_text).map_err(|err| format!("invalid mint native script: {err}"))?;
      let script = cml_chain::transaction::NativeScript::from_cbor_bytes(&script_bytes)
        .map_err(|err| format!("invalid mint native script CBOR: {err}"))?;
      let policy_text = decode_percent_encoded_text(mint_fields[0], "mint policy")?;
      let policy = hex::decode(policy_text).map_err(|err| format!("invalid mint policy: {err}"))?;
      let policy = ScriptHash::from_raw_bytes(&policy).map_err(|err| err.to_string())?;
      if policy != script.hash() {
        return Err("native mint policy ID does not match script hash".to_owned());
      }
      let mut mint_assets = cml_chain::OrderedHashMap::new();
      let mint_assets_text = decode_percent_encoded_text(mint_fields[3], "mint assets")?;
      for packed_asset in mint_assets_text.split('^') {
        let asset_fields = packed_asset.split('~').collect::<Vec<_>>();
        if asset_fields.len() != 2 {
          return Err("each minted asset must contain assetNameHex~quantity".to_owned());
        }
        let asset_name = decode_percent_encoded_text(asset_fields[0], "mint asset name")?;
        let quantity_text = decode_percent_encoded_text(asset_fields[1], "mint quantity")?;
        let name_bytes =
          hex::decode(asset_name).map_err(|err| format!("invalid minted asset name: {err}"))?;
        let name = AssetName::new(name_bytes).map_err(|err| err.to_string())?;
        let quantity =
          quantity_text.parse::<i64>().map_err(|err| format!("invalid mint quantity: {err}"))?;
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
    add_stake_certificates(&mut builder, certificates, key_deposit)?;
  }
  if fields.len() >= 14 && fields[13] != "-" {
    use cml_chain::address::RewardAddress;
    use cml_chain::builders::withdrawal_builder::SingleWithdrawalBuilder;
    let withdrawal_json = String::from_utf8(decode_percent_encoded(fields[13])?)
      .map_err(|err| format!("withdrawal JSON is not UTF-8: {err}"))?;
    let withdrawals: Vec<WithdrawalArgs> = serde_json::from_str(&withdrawal_json)
      .map_err(|err| format!("invalid withdrawals: {err}"))?;
    for withdrawal in withdrawals {
      let address = parse_payment_address(&withdrawal.reward_address)?;
      let reward_address = RewardAddress::from_address(&address)
        .ok_or_else(|| "withdrawal address is not a reward address".to_owned())?;
      let amount = withdrawal
        .amount
        .parse::<u64>()
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
        return Err(
          "each reference input must contain hash,index,address,lovelace,assets".to_owned(),
        );
      }
      let hash_text = decode_percent_encoded_text(input_fields[0], "reference input hash")?;
      let hash =
        hex::decode(hash_text).map_err(|err| format!("invalid reference input hash: {err}"))?;
      let hash = TransactionHash::from_raw_bytes(&hash).map_err(|err| err.to_string())?;
      let index = decode_percent_encoded_text(input_fields[1], "reference input index")?
        .parse::<u64>()
        .map_err(|err| format!("invalid reference input index: {err}"))?;
      let address = parse_payment_address(&decode_percent_encoded_text(
        input_fields[2],
        "reference input address",
      )?)?;
      let coin = decode_percent_encoded_text(input_fields[3], "reference input coin")?
        .parse::<u64>()
        .map_err(|err| format!("invalid reference input coin: {err}"))?;
      let assets = decode_percent_encoded_text(input_fields[4], "reference input assets")?;
      let output =
        TransactionOutput::new(address, Value::new(coin, parse_multiasset(&assets)?), None, None);
      builder.add_reference_input(TransactionUnspentOutput::new(
        cml_chain::transaction::TransactionInput::new(hash, index),
        output,
      ));
    }
  }
  if fields.len() >= 15 && fields[14] != "-" {
    builder.set_validity_start_interval(parse_u64(14, "validity start")?);
  }
  if let Some(ttl) = ttl {
    builder.set_ttl(ttl);
  }
  let manual_fee =
    if fields.len() >= 17 && fields[16] != "-" { Some(parse_u64(16, "manual fee")?) } else { None };
  let manual_change = if fields.len() >= 18 {
    decode_percent_encoded_text(fields[17], "manual change flag")?
  } else {
    "false".to_owned()
  };
  let has_manual_change = fields.len() >= 18 && manual_change == "true";
  if fields.len() >= 18 && manual_change != "true" && manual_change != "false" {
    return Err("manual change flag must be true or false".to_owned());
  }
  let selected_fee = if has_manual_change && manual_fee.is_none() {
    let input_value = builder.get_total_input().map_err(|err| err.to_string())?;
    let output_value = builder.get_total_output().map_err(|err| err.to_string())?;
    let residual = input_value
      .checked_sub(&output_value)
      .map_err(|err| format!("manual change exceeds input value: {err}"))?;
    if residual.multiasset.len() != 0 {
      return Err("manual change leaves unassigned asset value".to_owned());
    }
    Some(residual.coin)
  } else {
    manual_fee
  };
  if let Some(fee) = selected_fee {
    let minimum_fee = builder.min_fee(false).map_err(|err| err.to_string())?;
    if fee < minimum_fee {
      return Err(format!("manual fee {fee} is below protocol minimum {minimum_fee}"));
    }
    builder.set_fee(fee);
    let input_value = builder.get_total_input().map_err(|err| err.to_string())?;
    let output_value = builder
      .get_total_output()
      .map_err(|err| err.to_string())?
      .checked_add(&Value::from(fee))
      .map_err(|err| err.to_string())?;
    if input_value != output_value {
      return Err("manual fee/change transaction does not conserve value".to_owned());
    }
  }
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

/// Build a normalized lossless transaction recipe through the same CML path as
/// ordinary payments. Advanced script/collateral operations are rejected until
/// they are represented by the generic recipe implementation; no fields are dropped.
pub fn build_transaction_recipe_cml_hex(args: &str) -> Result<String, String> {
  let args: TransactionRecipeArgs =
    serde_json::from_str(args).map_err(|err| format!("invalid CML transaction recipe: {err}"))?;
  if !args.script_inputs.is_empty() {
    return build_transaction_recipe_with_scripts(args);
  }
  if args.mints.iter().any(|mint| mint.script_type != "native") {
    return build_plutus_mint_only_recipe(args);
  }
  if !args.collateral_inputs.is_empty()
    || args.collateral_return.is_some()
    || args.total_collateral.is_some()
  {
    return Err("collateral inputs require at least one Plutus script input".to_owned());
  }
  if args.mints.iter().any(|mint| mint.script_type != "native") {
    return Err("only native-script mints are supported by this recipe version".to_owned());
  }
  if args.mints.iter().any(|mint| mint.reference_input.is_some()) {
    return Err("mint reference inputs are not supported by this recipe version".to_owned());
  }
  if args.mints.iter().any(|mint| {
    mint.plutus_version.is_some()
      || mint.redeemer_cbor_hex.is_some()
      || mint.redeemer_mem.is_some()
      || mint.redeemer_steps.is_some()
  }) {
    return Err("Plutus mint witness fields are not supported by this recipe version".to_owned());
  }
  for input in &args.inputs {
    match input.kind.as_deref() {
      Some("paymentKey") | None if input.native_script_cbor_hex.is_none() => {}
      Some("nativeScript") if input.native_script_cbor_hex.is_some() => {}
      Some("paymentKey") | None => {
        return Err("payment-key input cannot include a native script".to_owned())
      }
      Some("nativeScript") => {
        return Err("native-script input requires nativeScriptCborHex".to_owned())
      }
      Some(kind) => return Err(format!("unsupported input kind: {kind}")),
    }
    if input.native_script_cbor_hex.is_none() && input.native_script_witness_count.is_some() {
      return Err("native-script witness count requires nativeScriptCborHex".to_owned());
    }
  }

  let pack_assets = |assets: &[ScriptAssetArgs]| {
    if assets.is_empty() {
      return "-".to_owned();
    }
    assets
      .iter()
      .map(|asset| {
        format!(
          "{}~{}~{}",
          encode_wire_field(&asset.policy_id_hex),
          encode_wire_field(&asset.asset_name_hex),
          encode_wire_field(&asset.quantity)
        )
      })
      .collect::<Vec<_>>()
      .join("^")
  };
  let packed_inputs = args
    .inputs
    .iter()
    .map(|input| {
      let mut fields = vec![
        encode_wire_field(&input.tx_hash_hex),
        encode_wire_field(&input.index),
        encode_wire_field(&input.address),
        encode_wire_field(&input.lovelace),
        encode_wire_field(&pack_assets(&input.assets)),
        encode_wire_field(input.native_script_cbor_hex.as_deref().unwrap_or("-")),
        encode_wire_field(input.native_script_witness_count.as_deref().unwrap_or("-")),
      ];
      if input.address_hex.is_some() || input.is_bootstrap.is_some() {
        fields.push(encode_wire_field(input.address_hex.as_deref().unwrap_or("-")));
        fields.push(encode_wire_field(
          &input.is_bootstrap.map(|value| value.to_string()).unwrap_or_else(|| "-".to_owned()),
        ));
      }
      fields.join(",")
    })
    .collect::<Vec<_>>()
    .join(";");
  let pack_output = |output: &RecipeOutputArgs| -> Result<String, String> {
    let datum = match &output.datum {
      Some(datum) if datum.kind == "hash" || datum.kind == "inline" => {
        format!("{}~{}", encode_wire_field(&datum.kind), encode_wire_field(&datum.hex))
      }
      Some(_) => return Err("output datum kind must be hash or inline".to_owned()),
      None => "-".to_owned(),
    };
    Ok(format!(
      "{},{},{},{}",
      encode_wire_field(&output.address),
      encode_wire_field(&output.lovelace),
      encode_wire_field(&pack_assets(&output.assets)),
      encode_wire_field(&datum)
    ))
  };
  let mut outputs = args.outputs.iter().map(pack_output).collect::<Result<Vec<_>, _>>()?;
  if let Some(change) = &args.options.manual_change_output {
    outputs.push(pack_output(change)?);
  }
  let metadata = if args.metadata.is_empty() {
    "-".to_owned()
  } else {
    percent_encode(&serde_json::to_vec(&args.metadata).map_err(|err| err.to_string())?)
  };
  let mints = if args.mints.is_empty() {
    "-".to_owned()
  } else {
    args
      .mints
      .iter()
      .map(|mint| {
        format!(
          "{},{},{},{}",
          encode_wire_field(&mint.policy_id_hex),
          encode_wire_field(&mint.script_type),
          encode_wire_field(&mint.script_cbor_hex),
          mint
            .assets
            .iter()
            .map(|asset| {
              format!(
                "{}~{}",
                encode_wire_field(&asset.asset_name_hex),
                encode_wire_field(&asset.quantity)
              )
            })
            .collect::<Vec<_>>()
            .join("^")
        )
      })
      .collect::<Vec<_>>()
      .join(";")
  };
  let certificates = if args.certificates.is_empty() {
    "-".to_owned()
  } else {
    percent_encode(&serde_json::to_vec(&args.certificates).map_err(|err| err.to_string())?)
  };
  let withdrawals = if args.withdrawals.is_empty() {
    "-".to_owned()
  } else {
    percent_encode(&serde_json::to_vec(&args.withdrawals).map_err(|err| err.to_string())?)
  };
  let references = if args.reference_inputs.is_empty() {
    "-".to_owned()
  } else {
    args
      .reference_inputs
      .iter()
      .map(|input| {
        format!(
          "{},{},{},{},{}",
          encode_wire_field(&input.tx_hash_hex),
          encode_wire_field(&input.index),
          encode_wire_field(&input.address),
          encode_wire_field(&input.lovelace),
          encode_wire_field(&pack_assets(&input.assets))
        )
      })
      .collect::<Vec<_>>()
      .join(";")
  };
  let ttl = args
    .options
    .validity_interval_end
    .as_ref()
    .or(args.options.ttl.as_ref())
    .map(String::as_str)
    .unwrap_or("-");
  let validity_start = args.options.validity_interval_start.as_deref().unwrap_or("-");
  let change_address = args
    .options
    .change_address
    .as_deref()
    .or(args.options.manual_change_output.as_ref().map(|output| output.address.as_str()))
    // TransactionBuilder requires a change address even when an exact manual
    // fee consumes the complete residual. In that case the address is only a
    // builder parameter and must not produce an output. Reuse a real address
    // already present in the recipe rather than inventing one.
    .or_else(|| args.inputs.first().map(|input| input.address.as_str()))
    .ok_or_else(|| "transaction recipe requires a change address".to_owned())?;
  let manual_fee = args.options.manual_fee.as_deref().unwrap_or("-");
  let manual_change = args.options.manual_change_output.is_some();
  let packed = format!(
    "{}|{}|{}|{}|{}|{}|{}|{}|{}|{}|{}|{}|{}|{}|{}|{}|{}|{}|{}",
    packed_inputs,
    outputs.join(";"),
    encode_wire_field(change_address),
    encode_wire_field(ttl),
    encode_wire_field(&args.protocol_params.linear_fee.coefficient),
    encode_wire_field(&args.protocol_params.linear_fee.constant),
    encode_wire_field(&args.protocol_params.coins_per_utxo_byte),
    encode_wire_field(&args.protocol_params.key_deposit),
    encode_wire_field(&args.protocol_params.pool_deposit),
    encode_wire_field(&args.protocol_params.max_value_size),
    metadata,
    mints,
    certificates,
    withdrawals,
    encode_wire_field(validity_start),
    references,
    encode_wire_field(manual_fee),
    encode_wire_field(&manual_change.to_string()),
    encode_wire_field(args.protocol_params.max_tx_size.as_deref().unwrap_or("16384")),
  );
  build_simple_payment_transaction_hex(&packed)
}

/// Build a Plutus mint transaction with no Plutus spending inputs. Collateral
/// remains separate from normal funding inputs as required by the ledger.
fn build_plutus_mint_only_recipe(args: TransactionRecipeArgs) -> Result<String, String> {
  use cml_chain::{
    assets::{AssetName, Value},
    builders::{
      input_builder::SingleInputBuilder,
      mint_builder::SingleMintBuilder,
      output_builder::TransactionOutputBuilder,
      redeemer_builder::RedeemerWitnessKey,
      tx_builder::{ChangeSelectionAlgo, TransactionBuilder, TransactionBuilderConfigBuilder},
      witness_builder::{NativeScriptWitnessInfo, PartialPlutusWitness, PlutusScriptWitness},
    },
    crypto::TransactionHash,
    fees::LinearFee,
    plutus::{
      CostModels, ExUnitPrices, ExUnits, Language, PlutusData, PlutusScript, RedeemerKey,
      RedeemerTag, RedeemerVal, Redeemers,
    },
    transaction::{ConwayFormatTxOut, DatumOption, TransactionInput, TransactionOutput},
    Rational, RequiredSigners, Script,
  };

  if args.collateral_inputs.is_empty() {
    return Err("Plutus mint requires at least one collateral input".to_owned());
  }
  let parse_u64 =
    |value: &str, name: &str| value.parse::<u64>().map_err(|err| format!("invalid {name}: {err}"));
  let mut models = CostModels::default();
  let mut model_map = cml_chain::OrderedHashMap::new();
  if let Some(model) = &args.protocol_params.plutus_v1_cost_model {
    model_map.insert(0, model.clone());
  }
  if let Some(model) = &args.protocol_params.plutus_v2_cost_model {
    model_map.insert(1, model.clone());
  }
  if let Some(model) = &args.protocol_params.plutus_v3_cost_model {
    model_map.insert(2, model.clone());
  }
  models.inner = model_map;
  let config = TransactionBuilderConfigBuilder::new()
    .fee_algo(LinearFee::new(
      parse_u64(&args.protocol_params.linear_fee.coefficient, "fee coefficient")?,
      parse_u64(&args.protocol_params.linear_fee.constant, "fee constant")?,
      0,
    ))
    .coins_per_utxo_byte(parse_u64(
      &args.protocol_params.coins_per_utxo_byte,
      "coins per UTxO byte",
    )?)
    .ex_unit_prices(ExUnitPrices::new(
      Rational::new(
        parse_u64(
          args
            .protocol_params
            .ex_unit_prices_memory
            .as_ref()
            .ok_or("missing memory execution price")?
            .numerator
            .as_str(),
          "memory price numerator",
        )?,
        parse_u64(
          args
            .protocol_params
            .ex_unit_prices_memory
            .as_ref()
            .ok_or("missing memory execution price")?
            .denominator
            .as_str(),
          "memory price denominator",
        )?,
      ),
      Rational::new(
        parse_u64(
          args
            .protocol_params
            .ex_unit_prices_steps
            .as_ref()
            .ok_or("missing steps execution price")?
            .numerator
            .as_str(),
          "steps price numerator",
        )?,
        parse_u64(
          args
            .protocol_params
            .ex_unit_prices_steps
            .as_ref()
            .ok_or("missing steps execution price")?
            .denominator
            .as_str(),
          "steps price denominator",
        )?,
      ),
    ))
    .key_deposit(parse_u64(&args.protocol_params.key_deposit, "key deposit")?)
    .pool_deposit(parse_u64(&args.protocol_params.pool_deposit, "pool deposit")?)
    .max_value_size(
      u32::try_from(parse_u64(&args.protocol_params.max_value_size, "max value size")?)
        .map_err(|err| err.to_string())?,
    )
    .max_tx_size(
      u32::try_from(parse_u64(
        args.protocol_params.max_tx_size.as_deref().unwrap_or("16384"),
        "max tx size",
      )?)
      .map_err(|err| err.to_string())?,
    )
    .collateral_percentage(
      u32::try_from(parse_u64(
        args.protocol_params.collateral_percentage.as_deref().unwrap_or("150"),
        "collateral percentage",
      )?)
      .map_err(|err| err.to_string())?,
    )
    .max_collateral_inputs(3)
    .cost_models(models.clone())
    .prefer_pure_change(true)
    .build()
    .map_err(|err| err.to_string())?;
  let mut builder = TransactionBuilder::new(config);
  if !args.metadata.is_empty() {
    let metadata =
      percent_encode(&serde_json::to_vec(&args.metadata).map_err(|err| err.to_string())?);
    if let Some(aux) = parse_auxiliary_metadata(&metadata)? {
      builder.set_auxiliary_data(aux);
    }
  }
  for input in &args.inputs {
    let tx_hash = TransactionHash::from_raw_bytes(
      &hex::decode(&input.tx_hash_hex).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())?;
    let tx_input = TransactionInput::new(tx_hash, parse_u64(&input.index, "input index")?);
    let output = TransactionOutput::new_conway_format_tx_out(ConwayFormatTxOut::new(
      parse_payment_address(&input.address)?,
      Value::new(parse_u64(&input.lovelace, "input lovelace")?, parse_assets(&input.assets)?),
    ));
    let input_builder = SingleInputBuilder::new(tx_input, output);
    let result = if let Some(script_hex) = &input.native_script_cbor_hex {
      let script = cml_chain::transaction::NativeScript::from_cbor_bytes(
        &hex::decode(script_hex).map_err(|err| err.to_string())?,
      )
      .map_err(|err| err.to_string())?;
      let count = input
        .native_script_witness_count
        .as_deref()
        .map(|s| s.parse::<usize>().map_err(|err| err.to_string()))
        .transpose()?;
      input_builder
        .native_script(
          script,
          count
            .map(NativeScriptWitnessInfo::num_signatures)
            .unwrap_or_else(NativeScriptWitnessInfo::assume_signature_count),
        )
        .map_err(|err| err.to_string())?
    } else {
      input_builder.payment_key().map_err(|err| err.to_string())?
    };
    builder.add_input(result).map_err(|err| err.to_string())?;
  }
  for input in &args.reference_inputs {
    let tx_hash = TransactionHash::from_raw_bytes(
      &hex::decode(&input.tx_hash_hex).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())?;
    let tx_input = TransactionInput::new(tx_hash, parse_u64(&input.index, "reference index")?);
    let output = TransactionOutput::new_conway_format_tx_out(ConwayFormatTxOut::new(
      parse_payment_address(&input.address)?,
      Value::new(parse_u64(&input.lovelace, "reference lovelace")?, parse_assets(&input.assets)?),
    ));
    builder.add_reference_input(cml_chain::builders::tx_builder::TransactionUnspentOutput::new(
      tx_input, output,
    ));
  }
  add_stake_certificates(
    &mut builder,
    args.certificates.clone(),
    parse_u64(&args.protocol_params.key_deposit, "key deposit")?,
  )?;
  for withdrawal in &args.withdrawals {
    let address = parse_payment_address(&withdrawal.reward_address)?;
    let reward = cml_chain::address::RewardAddress::from_address(&address)
      .ok_or("withdrawal address is not a reward address")?;
    builder.add_withdrawal(
      cml_chain::builders::withdrawal_builder::SingleWithdrawalBuilder::new(
        reward,
        parse_u64(&withdrawal.amount, "withdrawal amount")?,
      )
      .payment_key()
      .map_err(|err| err.to_string())?,
    );
  }
  let mut collateral_total = Value::zero();
  for input in &args.collateral_inputs {
    let tx_hash = TransactionHash::from_raw_bytes(
      &hex::decode(&input.tx_hash_hex).map_err(|err| err.to_string())?,
    )
    .map_err(|err| err.to_string())?;
    let tx_input = TransactionInput::new(tx_hash, parse_u64(&input.index, "collateral index")?);
    let output = TransactionOutput::new_conway_format_tx_out(ConwayFormatTxOut::new(
      parse_payment_address(&input.address)?,
      Value::new(parse_u64(&input.lovelace, "collateral lovelace")?, parse_assets(&input.assets)?),
    ));
    collateral_total =
      collateral_total.checked_add(&output.amount()).map_err(|err| err.to_string())?;
    builder
      .add_collateral(
        SingleInputBuilder::new(tx_input, output).payment_key().map_err(|err| err.to_string())?,
      )
      .map_err(|err| err.to_string())?;
  }
  let collateral_return = args
    .collateral_return
    .as_ref()
    .map(|output| -> Result<TransactionOutput, String> {
      let datum = output
        .datum
        .as_ref()
        .map(|datum| match datum.kind.as_str() {
          "hash" => {
            let hash =
              DatumHash::from_raw_bytes(&hex::decode(&datum.hex).map_err(|err| err.to_string())?)
                .map_err(|err| err.to_string())?;
            Ok(DatumOption::new_hash(hash))
          }
          "inline" => {
            let bytes = hex::decode(&datum.hex).map_err(|err| err.to_string())?;
            Ok(DatumOption::new_datum(
              PlutusData::from_cbor_bytes(&bytes).map_err(|err| err.to_string())?,
            ))
          }
          _ => Err("datum kind must be hash or inline".to_owned()),
        })
        .transpose()?;
      Ok(TransactionOutput::new(
        parse_payment_address(&output.address)?,
        Value::new(
          parse_u64(&output.lovelace, "collateral return lovelace")?,
          parse_assets(&output.assets)?,
        ),
        datum,
        None,
      ))
    })
    .transpose()?;
  if let Some(output) = &collateral_return {
    builder.set_collateral_return(output.clone());
  }
  if let Some(total) = &args.total_collateral {
    let ret =
      collateral_return.as_ref().map(|output| output.amount().clone()).unwrap_or_else(Value::zero);
    if collateral_total.coin != parse_u64(total, "total collateral")? + ret.coin
      || collateral_total.multiasset != ret.multiasset
    {
      return Err(
        "collateral inputs must equal total collateral plus collateral return".to_owned(),
      );
    }
  }
  for output in &args.outputs {
    let address = parse_payment_address(&output.address)?;
    let datum = output
      .datum
      .as_ref()
      .map(|datum| match datum.kind.as_str() {
        "hash" => {
          DatumHash::from_raw_bytes(&hex::decode(&datum.hex).map_err(|err| err.to_string())?)
            .map(DatumOption::new_hash)
            .map_err(|err| err.to_string())
        }
        "inline" => {
          PlutusData::from_cbor_bytes(&hex::decode(&datum.hex).map_err(|err| err.to_string())?)
            .map(DatumOption::new_datum)
            .map_err(|err| err.to_string())
        }
        _ => Err("output datum kind must be hash or inline".to_owned()),
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
  if let Some(change) = &args.options.manual_change_output {
    let address = parse_payment_address(&change.address)?;
    let datum = change
      .datum
      .as_ref()
      .map(|datum| match datum.kind.as_str() {
        "hash" => {
          let hash =
            DatumHash::from_raw_bytes(&hex::decode(&datum.hex).map_err(|err| err.to_string())?)
              .map_err(|err| err.to_string())?;
          Ok(DatumOption::new_hash(hash))
        }
        "inline" => {
          let bytes = hex::decode(&datum.hex).map_err(|err| err.to_string())?;
          let data = PlutusData::from_cbor_bytes(&bytes).map_err(|err| err.to_string())?;
          Ok(DatumOption::new_datum(data))
        }
        _ => Err("change output datum kind must be hash or inline".to_owned()),
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
        parse_u64(&change.lovelace, "change lovelace")?,
        parse_assets(&change.assets)?,
      ))
      .build()
      .map_err(|err| err.to_string())?;
    builder.add_output(output).map_err(|err| err.to_string())?;
  }
  let mut languages = Vec::new();
  let mut policy_order = Vec::new();
  for mint in &args.mints {
    if mint.script_type != "native" {
      let hash = ScriptHash::from_raw_bytes(
        &hex::decode(&mint.policy_id_hex).map_err(|err| err.to_string())?,
      )
      .map_err(|err| err.to_string())?;
      policy_order.push(hash.to_raw_bytes().to_vec());
    }
  }
  policy_order.sort();
  policy_order.dedup();
  let mut ref_sizes = Vec::new();
  for mint in &args.mints {
    let bytes = hex::decode(&mint.script_cbor_hex).map_err(|err| err.to_string())?;
    let mut assets = cml_chain::OrderedHashMap::new();
    for asset in &mint.assets {
      assets.insert(
        AssetName::new(hex::decode(&asset.asset_name_hex).map_err(|err| err.to_string())?)
          .map_err(|err| err.to_string())?,
        asset.quantity.parse::<i64>().map_err(|err| err.to_string())?,
      );
    }
    let policy =
      ScriptHash::from_raw_bytes(&hex::decode(&mint.policy_id_hex).map_err(|err| err.to_string())?)
        .map_err(|err| err.to_string())?;
    if mint.script_type == "native" {
      let script = cml_chain::transaction::NativeScript::from_cbor_bytes(&bytes)
        .map_err(|err| err.to_string())?;
      if script.hash() != policy {
        return Err("native mint policy ID does not match script hash".to_owned());
      }
      builder
        .add_mint(
          SingleMintBuilder::new(assets)
            .native_script(script, NativeScriptWitnessInfo::assume_signature_count()),
        )
        .map_err(|err| err.to_string())?;
      continue;
    }
    let version = match mint.script_type.as_str() {
      "plutusV1" => "V1",
      "plutusV2" => "V2",
      "plutusV3" => "V3",
      other => return Err(format!("unsupported mint script type: {other}")),
    };
    let (language_index, language) = parse_plutus_language(Some(version))?;
    if !models.inner.contains_key(&language_index) {
      return Err(format!("missing cost model for Plutus mint {version}"));
    }
    if !languages.contains(&language) {
      languages.push(language);
    }
    let plutus_script = match language {
      Language::PlutusV1 => {
        PlutusScript::PlutusV1(cml_chain::plutus::PlutusV1Script::new(bytes.clone()))
      }
      Language::PlutusV2 => {
        PlutusScript::PlutusV2(cml_chain::plutus::PlutusV2Script::new(bytes.clone()))
      }
      Language::PlutusV3 => {
        PlutusScript::PlutusV3(cml_chain::plutus::PlutusV3Script::new(bytes.clone()))
      }
    };
    if plutus_script.hash() != policy {
      return Err("Plutus mint policy ID does not match script hash".to_owned());
    }
    let script_witness = if let Some(reference) = &mint.reference_input {
      let info = reference
        .reference_script
        .as_ref()
        .ok_or("reference mint requires referenceScript metadata")?;
      let ref_bytes =
        hex::decode(info.bytes.as_deref().ok_or("reference mint script bytes missing")?)
          .map_err(|err| err.to_string())?;
      if ref_bytes != bytes
        || info.size != Some(bytes.len() as u64)
        || info.hash != mint.policy_id_hex
        || info.script_type.as_deref().is_some_and(|kind| kind != mint.script_type)
      {
        return Err("reference mint script metadata does not match mint script".to_owned());
      }
      let tx_hash = TransactionHash::from_raw_bytes(
        &hex::decode(&reference.tx_hash_hex).map_err(|err| err.to_string())?,
      )
      .map_err(|err| err.to_string())?;
      let tx_input =
        TransactionInput::new(tx_hash, parse_u64(&reference.index, "mint reference index")?);
      let mut output = TransactionOutput::new_conway_format_tx_out(ConwayFormatTxOut::new(
        parse_payment_address(&reference.address)?,
        Value::new(
          parse_u64(&reference.lovelace, "mint reference lovelace")?,
          parse_assets(&reference.assets)?,
        ),
      ));
      if let TransactionOutput::ConwayFormatTxOut(out) = &mut output {
        out.script_reference = Some(match language {
          Language::PlutusV1 => {
            Script::new_plutus_v1(cml_chain::plutus::PlutusV1Script::new(bytes.clone()))
          }
          Language::PlutusV2 => {
            Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(bytes.clone()))
          }
          Language::PlutusV3 => {
            Script::new_plutus_v3(cml_chain::plutus::PlutusV3Script::new(bytes.clone()))
          }
        });
      }
      builder.add_reference_input(cml_chain::builders::tx_builder::TransactionUnspentOutput::new(
        tx_input, output,
      ));
      ref_sizes.push((
        reference.tx_hash_hex.to_ascii_lowercase(),
        reference.index.clone(),
        bytes.len() as u64,
      ));
      PlutusScriptWitness::Ref(policy.clone())
    } else {
      PlutusScriptWitness::Script(plutus_script)
    };
    let redeemer_bytes =
      hex::decode(mint.redeemer_cbor_hex.as_deref().ok_or("Plutus mint redeemer is missing")?)
        .map_err(|err| err.to_string())?;
    let redeemer = PlutusData::from_cbor_bytes(&redeemer_bytes).map_err(|err| err.to_string())?;
    builder
      .add_mint(SingleMintBuilder::new(assets).plutus_script(
        PartialPlutusWitness::new(script_witness, redeemer),
        RequiredSigners::from(Vec::new()),
      ))
      .map_err(|err| err.to_string())?;
    let index = policy_order
      .iter()
      .position(|item| item == &policy.to_raw_bytes())
      .ok_or("Plutus mint policy missing from canonical ordering")? as u64;
    builder.set_exunits(
      RedeemerWitnessKey::new(RedeemerTag::Mint, index),
      ExUnits::new(
        parse_u64(
          mint.redeemer_mem.as_deref().ok_or("mint redeemer memory is missing")?,
          "mint redeemer memory",
        )?,
        parse_u64(
          mint.redeemer_steps.as_deref().ok_or("mint redeemer steps are missing")?,
          "mint redeemer steps",
        )?,
      ),
    );
  }
  if let Some(ttl) = args.options.validity_interval_end.as_ref().or(args.options.ttl.as_ref()) {
    builder.set_ttl(parse_u64(ttl, "TTL")?);
  }
  if let Some(start) = &args.options.validity_interval_start {
    builder.set_validity_start_interval(parse_u64(start, "validity start")?);
  }
  let change_address = args
    .options
    .change_address
    .as_deref()
    .or(args.options.manual_change_output.as_ref().map(|output| output.address.as_str()))
    .ok_or("transaction recipe requires a change address")?;
  let manual_fee =
    args.options.manual_fee.as_deref().map(|fee| parse_u64(fee, "manual fee")).transpose()?;
  let has_manual_change = args.options.manual_change_output.is_some();
  let selected_fee = if manual_fee.is_some() {
    manual_fee
  } else if has_manual_change {
    let residual = builder
      .get_total_input()
      .map_err(|err| err.to_string())?
      .checked_sub(&builder.get_total_output().map_err(|err| err.to_string())?)
      .map_err(|err| format!("manual change exceeds input value: {err}"))?;
    if !residual.multiasset.is_empty() {
      return Err("manual change leaves unassigned asset value".to_owned());
    }
    Some(residual.coin)
  } else {
    None
  };
  if let Some(fee) = selected_fee {
    let minimum = builder.min_fee(false).map_err(|err| err.to_string())?;
    if fee < minimum {
      return Err(format!("manual fee {fee} is below protocol minimum {minimum}"));
    }
    builder.set_fee(fee);
    if has_manual_change {
      let expected = builder
        .get_total_output()
        .map_err(|err| err.to_string())?
        .checked_add(&Value::from(fee))
        .map_err(|err| err.to_string())?;
      let total_input = builder.get_total_input().map_err(|err| err.to_string())?;
      if total_input != expected {
        return Err(format!(
          "manual fee/change transaction does not conserve value: input {total_input:?}, output+fee {expected:?}"
        ));
      }
    }
  }
  let mut tx = builder
    .build(ChangeSelectionAlgo::Default, &parse_payment_address(change_address)?)
    .map_err(|err| err.to_string())?
    .build_unchecked();
  let initial_serialized_size = tx.to_cbor_bytes().len() as u64;
  if let Some(total) = &args.total_collateral {
    tx.body.total_collateral = Some(parse_u64(total, "total collateral")?);
  }
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
  if let Some(redeemers) = &tx.witness_set.redeemers {
    let mut languages = languages;
    languages.sort_by_key(|language| match language {
      Language::PlutusV2 => 0,
      Language::PlutusV3 => 1,
      Language::PlutusV1 => 2,
    });
    tx.body.script_data_hash = cml_chain::crypto::hash::calc_script_data_hash(
      redeemers,
      &tx.witness_set.plutus_datums.clone().unwrap_or_else(|| Vec::new().into()),
      &models,
      &languages,
      None,
    )
    .map_err(|err| err.to_string())?;
  }
  if let Some(fee) = selected_fee {
    tx.body.fee = fee;
  }
  let compatibility_size_delta =
    tx.to_cbor_bytes()
      .len()
      .checked_sub(usize::try_from(initial_serialized_size).unwrap_or(usize::MAX))
      .ok_or("CML compatibility serialization unexpectedly reduced transaction size")? as u64;
  let mut reference_script_fee = 0;
  if let Some(cost) = &args.protocol_params.ref_script_coins_per_byte {
    ref_sizes.sort();
    ref_sizes.dedup_by(|a, b| a.0 == b.0 && a.1 == b.1);
    let size = ref_sizes.iter().try_fold(0u64, |total, entry| {
      total.checked_add(entry.2).ok_or("reference script size overflow")
    })?;
    if size > 0 {
      reference_script_fee = calculate_reference_script_fee(
        size,
        parse_u64(&cost.numerator, "reference script cost numerator")?,
        parse_u64(&cost.denominator, "reference script cost denominator")?,
        parse_u64(
          args
            .protocol_params
            .ref_script_tier_step_bytes
            .as_deref()
            .ok_or("reference script tier step missing")?,
          "reference script tier step",
        )?,
        args
          .protocol_params
          .ref_script_multiplier
          .as_deref()
          .ok_or("reference script multiplier missing")?,
      )?;
    }
  }
  if let Some(fee) = selected_fee {
    let minimum = builder
      .min_fee(false)
      .map_err(|err| err.to_string())?
      .checked_add(reference_script_fee)
      .and_then(|value| {
        value.checked_add(
          parse_u64(&args.protocol_params.linear_fee.coefficient, "fee coefficient")
            .ok()?
            .checked_mul(compatibility_size_delta)?,
        )
      })
      .ok_or("transaction fee overflow")?;
    if fee < minimum {
      return Err(format!("manual fee {fee} is below protocol minimum {minimum}"));
    }
  } else if reference_script_fee > 0 || compatibility_size_delta > 0 {
    add_reference_fee_and_rebalance(
      &mut tx,
      reference_script_fee,
      parse_u64(&args.protocol_params.linear_fee.coefficient, "fee coefficient")?,
      parse_u64(&args.protocol_params.linear_fee.constant, "fee constant")?,
      compatibility_size_delta,
    )?;
  }
  Ok(format!("{}|{}", hex::encode(tx.to_cbor_bytes()), tx.body.fee))
}

fn build_transaction_recipe_with_scripts(args: TransactionRecipeArgs) -> Result<String, String> {
  if args.script_inputs.is_empty() || args.collateral_inputs.is_empty() {
    return Err("Plutus recipe requires script and collateral inputs".to_owned());
  }
  let change_address = args
    .options
    .change_address
    .as_deref()
    .ok_or_else(|| "Plutus recipe requires a change address".to_owned())?;
  let first_script = &args.script_inputs[0];
  let first_reference = first_script.reference_script.as_ref();
  if first_reference.is_some() == first_script.inline_script_cbor_hex.is_some() {
    return Err(
      "each Plutus spend requires exactly one reference or inline script source".to_owned(),
    );
  }
  let to_script_utxo = |input: &RecipeInputArgs, datum: Option<String>| -> serde_json::Value {
    serde_json::json!({
      "txHashHex": input.tx_hash_hex,
      "index": input.index,
      "address": input.address,
      "addressHex": input.address_hex,
      "isBootstrap": input.is_bootstrap,
      "lovelace": input.lovelace,
      "assets": input.assets.iter().map(|asset| serde_json::json!({
        "policyIdHex": asset.policy_id_hex,
        "assetNameHex": asset.asset_name_hex,
        "quantity": asset.quantity,
      })).collect::<Vec<_>>(),
      "inlineDatumCborHex": input.inline_datum_cbor_hex,
      "datumCborHex": datum,
      "nativeScriptCborHex": input.native_script_cbor_hex,
      "nativeScriptWitnessCount": input.native_script_witness_count,
    })
  };
  let spend_datum =
    |spend: &RecipeScriptInputArgs| -> Result<(Option<String>, Option<String>), String> {
      match &spend.datum_source {
        serde_json::Value::String(kind) if kind == "inline" => Ok((None, None)),
        serde_json::Value::Object(fields) => {
          let kind = fields
            .get("kind")
            .and_then(serde_json::Value::as_str)
            .ok_or_else(|| "explicit datum source requires kind".to_owned())?;
          let cbor = fields
            .get("cborHex")
            .and_then(serde_json::Value::as_str)
            .ok_or_else(|| "explicit datum source requires cborHex".to_owned())?
            .to_owned();
          if kind != "explicit" {
            return Err("datum source object kind must be explicit".to_owned());
          }
          Ok((None, Some(cbor)))
        }
        _ => Err("datumSource must be 'inline' or an explicit datum object".to_owned()),
      }
    };
  let to_additional_spend = |spend: &RecipeScriptInputArgs| -> Result<serde_json::Value, String> {
    let (inline, explicit) = spend_datum(spend)?;
    let mut utxo = to_script_utxo(&spend.utxo, explicit);
    if inline.is_some() {
      utxo["inlineDatumCborHex"] = serde_json::Value::String(inline.unwrap());
    }
    let reference = spend.reference_script.as_ref().map(|reference| {
      serde_json::json!({
        "referenceScriptInput": to_script_utxo(&reference.utxo, None),
        "referenceScriptCborHex": reference.script_cbor_hex,
        "referenceScriptSize": reference.size,
      })
    });
    let mut value = serde_json::json!({
      "scriptInput": utxo,
      "scriptHashHex": spend.script_hash_hex,
      "plutusVersion": spend.plutus_version,
      "inlineScriptCborHex": spend.inline_script_cbor_hex,
      "redeemerCborHex": spend.redeemer_cbor_hex,
      "redeemerMem": spend.redeemer_mem,
      "redeemerSteps": spend.redeemer_steps,
    });
    if let Some(reference) = reference {
      for (key, entry) in reference.as_object().unwrap() {
        value[key] = entry.clone();
      }
    }
    Ok(value)
  };
  let (first_inline, first_explicit) = spend_datum(first_script)?;
  let mut primary_script_utxo = to_script_utxo(&first_script.utxo, first_explicit);
  if let Some(inline) = first_inline {
    primary_script_utxo["inlineDatumCborHex"] = serde_json::Value::String(inline);
  }
  let collateral =
    args.collateral_inputs.iter().map(|input| to_script_utxo(input, None)).collect::<Vec<_>>();
  for input in &args.inputs {
    match input.kind.as_deref() {
      Some("nativeScript") if input.native_script_cbor_hex.is_some() => {}
      Some("nativeScript") => {
        return Err("native-script funding input requires nativeScriptCborHex".to_owned())
      }
      Some("paymentKey") | None if input.native_script_cbor_hex.is_none() => {}
      Some("paymentKey") | None => {
        return Err("payment-key funding input cannot include a native script".to_owned())
      }
      Some(kind) => return Err(format!("unsupported Plutus funding input kind: {kind}")),
    }
  }
  let additional_spends =
    args.script_inputs.iter().skip(1).map(to_additional_spend).collect::<Result<Vec<_>, _>>()?;
  let references = args
    .reference_inputs
    .iter()
    .map(|input| {
      serde_json::json!({
        "txHashHex": input.tx_hash_hex,
        "index": input.index,
        "address": input.address,
        "addressHex": input.address_hex,
        "isBootstrap": input.is_bootstrap,
        "lovelace": input.lovelace,
        "assets": input.assets.iter().map(|asset| serde_json::json!({
          "policyIdHex": asset.policy_id_hex,
          "assetNameHex": asset.asset_name_hex,
          "quantity": asset.quantity,
        })).collect::<Vec<_>>(),
      })
    })
    .collect::<Vec<_>>();
  let outputs = args
    .outputs
    .iter()
    .map(|output| {
      let datum_cbor_hex =
        output.datum.as_ref().filter(|datum| datum.kind == "inline").map(|datum| datum.hex.clone());
      let datum_hash_hex =
        output.datum.as_ref().filter(|datum| datum.kind == "hash").map(|datum| datum.hex.clone());
      Ok(serde_json::json!({
        "address": output.address,
        "lovelace": output.lovelace,
        "assets": output.assets.iter().map(|asset| serde_json::json!({
          "policyIdHex": asset.policy_id_hex,
          "assetNameHex": asset.asset_name_hex,
          "quantity": asset.quantity,
        })).collect::<Vec<_>>(),
        "datumCborHex": datum_cbor_hex,
        "datumHashHex": datum_hash_hex,
      }))
    })
    .collect::<Result<Vec<_>, String>>()?;
  let script_hash_hex = first_script.script_hash_hex.clone();
  let script_version = first_script.plutus_version.clone();
  let (prices_mem, prices_steps) = (
    args.protocol_params.ex_unit_prices_memory.as_ref().ok_or("missing memory execution price")?,
    args.protocol_params.ex_unit_prices_steps.as_ref().ok_or("missing steps execution price")?,
  );
  let metadata = if args.metadata.is_empty() {
    None
  } else {
    Some(percent_encode(&serde_json::to_vec(&args.metadata).map_err(|err| err.to_string())?))
  };
  let escrow_args = serde_json::json!({
    "scriptInput": primary_script_utxo,
    "additionalScriptInputs": additional_spends,
    "referenceScriptInput": first_reference.map(|reference| to_script_utxo(&reference.utxo, None)),
    "referenceInputs": references,
    "referenceScriptCborHex": first_reference.map(|reference| reference.script_cbor_hex.as_str()),
    "referenceScriptSize": first_reference.map(|reference| reference.size.as_str()),
    "inlineScriptCborHex": first_script.inline_script_cbor_hex,
    "fundingInputs": args.inputs.iter().map(|input| to_script_utxo(input, None)).collect::<Vec<_>>(),
    "collateralInput": collateral[0],
    "additionalCollateralInputs": collateral.iter().skip(1).cloned().collect::<Vec<_>>(),
    "collateralReturn": args.collateral_return.as_ref().map(|output| serde_json::json!({
      "address": output.address, "lovelace": output.lovelace,
      "assets": output.assets.iter().map(|asset| serde_json::json!({"policyIdHex": asset.policy_id_hex,"assetNameHex": asset.asset_name_hex,"quantity": asset.quantity})).collect::<Vec<_>>(),
      "datumCborHex": output.datum.as_ref().filter(|d| d.kind == "inline").map(|d| d.hex.clone()),
      "datumHashHex": output.datum.as_ref().filter(|d| d.kind == "hash").map(|d| d.hex.clone()),
    })),
    "totalCollateral": args.total_collateral,
    "manualFee": args.options.manual_fee,
    "manualChangeOutput": args.options.manual_change_output.as_ref().map(|output| serde_json::json!({
      "address": output.address, "lovelace": output.lovelace,
      "assets": output.assets.iter().map(|asset| serde_json::json!({"policyIdHex": asset.policy_id_hex,"assetNameHex": asset.asset_name_hex,"quantity": asset.quantity})).collect::<Vec<_>>(),
      "datumCborHex": output.datum.as_ref().filter(|d| d.kind == "inline").map(|d| d.hex.clone()),
      "datumHashHex": output.datum.as_ref().filter(|d| d.kind == "hash").map(|d| d.hex.clone()),
    })),
    "outputs": outputs,
    "changeAddress": change_address,
    "scriptHashHex": script_hash_hex,
    "redeemerCborHex": first_script.redeemer_cbor_hex,
    "redeemerMem": first_script.redeemer_mem,
    "redeemerSteps": first_script.redeemer_steps,
    "validityStart": args.options.validity_interval_start.as_deref().unwrap_or("-"),
    "ttl": args.options.validity_interval_end.as_ref().or(args.options.ttl.as_ref()).map(String::as_str).unwrap_or("-"),
    "feeCoefficient": args.protocol_params.linear_fee.coefficient,
    "feeConstant": args.protocol_params.linear_fee.constant,
    "coinsPerUtxoByte": args.protocol_params.coins_per_utxo_byte,
    "keyDeposit": args.protocol_params.key_deposit,
    "poolDeposit": args.protocol_params.pool_deposit,
    "maxValueSize": args.protocol_params.max_value_size,
    "maxTxSize": args.protocol_params.max_tx_size,
    "collateralPercentage": args.protocol_params.collateral_percentage,
    "refScriptCoinsPerByte": args.protocol_params.ref_script_coins_per_byte,
    "refScriptTierStepBytes": args.protocol_params.ref_script_tier_step_bytes,
    "refScriptMultiplier": args.protocol_params.ref_script_multiplier,
    "exUnitPricesMemory": prices_mem,
    "exUnitPricesSteps": prices_steps,
    "plutusVersion": script_version,
    "plutusV1CostModel": args.protocol_params.plutus_v1_cost_model,
    "plutusV2CostModel": args.protocol_params.plutus_v2_cost_model,
    "plutusV3CostModel": args.protocol_params.plutus_v3_cost_model.unwrap_or_default(),
    "metadata": metadata,
    "certificates": args.certificates,
    "withdrawals": args.withdrawals,
    "mints": args.mints,
  });
  build_escrow_redeem_transaction_hex(&escrow_args.to_string())
}

/// Build the current escrow redemption shape with CML. This narrow recipe is
/// deliberately separate from the generic payment DTO: it accepts Plutus V1/V2/V3
/// spends with inline or explicit datum, one reference script output,
/// key funding inputs, and one collateral input.
pub fn build_escrow_redeem_transaction_hex(args: &str) -> Result<String, String> {
  use cml_chain::{
    assets::{AssetName, Value},
    builders::{
      input_builder::SingleInputBuilder,
      mint_builder::SingleMintBuilder,
      output_builder::TransactionOutputBuilder,
      redeemer_builder::RedeemerWitnessKey,
      tx_builder::{ChangeSelectionAlgo, TransactionBuilder, TransactionBuilderConfigBuilder},
      witness_builder::{NativeScriptWitnessInfo, PartialPlutusWitness, PlutusScriptWitness},
    },
    crypto::TransactionHash,
    fees::LinearFee,
    plutus::{
      CostModels, ExUnitPrices, ExUnits, Language, PlutusData, PlutusScript, RedeemerKey,
      RedeemerTag, RedeemerVal, Redeemers,
    },
    transaction::{ConwayFormatTxOut, DatumOption, TransactionInput, TransactionOutput},
    Rational, RequiredSigners, Script,
  };

  let mut args: EscrowCmlArgs =
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
      if let Some(address_hex) = &utxo.address_hex {
        let bytes =
          hex::decode(address_hex).map_err(|err| format!("invalid UTxO address hex: {err}"))?;
        let parsed = cml_chain::address::Address::from_raw_bytes(&bytes)
          .map_err(|err| format!("invalid UTxO address hex CBOR: {err}"))?;
        if parsed.to_raw_bytes() != address.to_raw_bytes() {
          return Err("UTxO address and addressHex do not identify the same address".to_owned());
        }
      }
      if let Some(is_bootstrap) = utxo.is_bootstrap {
        if is_bootstrap != matches!(address, cml_chain::address::Address::Byron(_)) {
          return Err("UTxO isBootstrap does not match parsed address".to_owned());
        }
      }
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
  if let Some(model) = &args.plutus_v1_cost_model {
    cost_model_map.insert(0, model.clone());
  }
  if let Some(model) = &args.plutus_v2_cost_model {
    cost_model_map.insert(1, model.clone());
  }
  if !args.plutus_v3_cost_model.is_empty() {
    cost_model_map.insert(2, args.plutus_v3_cost_model.clone());
  }
  let (language_index, language) = parse_plutus_language(args.plutus_version.as_deref())?;
  if !cost_model_map.contains_key(&language_index) {
    return Err(format!(
      "missing cost model for Plutus {}",
      args.plutus_version.as_deref().unwrap_or("V3")
    ));
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
    .prefer_pure_change(args.mints.is_empty());
  let config = config_builder.build().map_err(|err| err.to_string())?;
  let mut builder = TransactionBuilder::new(config);
  if let Some(metadata) = args.metadata.as_deref() {
    if let Some(auxiliary_data) = parse_auxiliary_metadata(metadata)? {
      builder.set_auxiliary_data(auxiliary_data);
    }
  }
  let change_address = parse_payment_address(&args.change_address)?;

  // Reference scripts must be registered before the spend input. Inline script
  // witnesses are carried in the witness set and do not add a reference input.
  let has_reference_script = args.reference_script_input.is_some();
  if has_reference_script == args.inline_script_cbor_hex.is_some() {
    return Err("Plutus spend requires exactly one reference or inline script source".to_owned());
  }
  let script_source_hex = args
    .reference_script_cbor_hex
    .as_deref()
    .or(args.inline_script_cbor_hex.as_deref())
    .ok_or("Plutus script CBOR is missing")?;
  let script_bytes =
    hex::decode(script_source_hex).map_err(|err| format!("invalid Plutus script CBOR: {err}"))?;
  let reference_script_size = if has_reference_script {
    let size = parse_u64(
      args.reference_script_size.as_deref().ok_or("reference script size missing")?,
      "reference script size",
    )?;
    if script_bytes.len() as u64 != size {
      return Err("reference script size does not match supplied script bytes".to_owned());
    }
    Some(size)
  } else {
    if args.reference_script_cbor_hex.is_some() || args.reference_script_size.is_some() {
      return Err("inline script cannot include reference script fields".to_owned());
    }
    None
  };
  let script_ref = match language {
    Language::PlutusV1 => {
      Script::new_plutus_v1(cml_chain::plutus::PlutusV1Script::new(script_bytes.clone()))
    }
    Language::PlutusV2 => {
      Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(script_bytes.clone()))
    }
    Language::PlutusV3 => {
      Script::new_plutus_v3(cml_chain::plutus::PlutusV3Script::new(script_bytes.clone()))
    }
  };
  let expected_hash = if let Some(hash_hex) = args.script_hash_hex.as_deref() {
    let bytes = hex::decode(hash_hex).map_err(|err| format!("invalid script hash: {err}"))?;
    cml_chain::crypto::ScriptHash::from_raw_bytes(&bytes).map_err(|err| err.to_string())?
  } else if !has_reference_script {
    script_ref.hash()
  } else {
    return Err("reference script spend requires scriptHashHex".to_owned());
  };
  if script_ref.hash() != expected_hash {
    return Err("Plutus script bytes do not match requested script hash".to_owned());
  }
  if let Some(reference_utxo) = &args.reference_script_input {
    let (reference_input, mut reference_output) = parse_input(reference_utxo)?;
    match &mut reference_output {
      TransactionOutput::ConwayFormatTxOut(output) => output.script_reference = Some(script_ref),
      _ => return Err("reference output is not Conway format".to_owned()),
    }
    builder.add_reference_input(cml_chain::builders::tx_builder::TransactionUnspentOutput::new(
      reference_input,
      reference_output,
    ));
  }

  let mut used_languages = vec![language];
  let mut reference_script_sizes =
    if let (Some(reference), Some(size)) = (&args.reference_script_input, reference_script_size) {
      vec![(reference.tx_hash_hex.to_ascii_lowercase(), reference.index.clone(), size)]
    } else {
      Vec::new()
    };
  for spend in &args.additional_script_inputs {
    let (language_index, spend_language) =
      parse_plutus_language(spend.plutus_version.as_deref().or(args.plutus_version.as_deref()))?;
    if !config_models.inner.contains_key(&language_index) {
      return Err(format!(
        "missing cost model for Plutus {}",
        spend.plutus_version.as_deref().or(args.plutus_version.as_deref()).unwrap_or("V3")
      ));
    }
    if !used_languages.contains(&spend_language) {
      used_languages.push(spend_language);
    }
    match (
      &spend.reference_script_input,
      &spend.reference_script_cbor_hex,
      &spend.reference_script_size,
      &spend.inline_script_cbor_hex,
    ) {
      (Some(utxo), Some(cbor), Some(size), None) => {
        let bytes = hex::decode(cbor)
          .map_err(|err| format!("invalid additional reference script CBOR: {err}"))?;
        let size_num = parse_u64(size, "additional reference script size")?;
        if bytes.len() as u64 != size_num {
          return Err(
            "additional reference script size does not match supplied script bytes".to_owned(),
          );
        }
        let script = match spend_language {
          Language::PlutusV1 => {
            Script::new_plutus_v1(cml_chain::plutus::PlutusV1Script::new(bytes))
          }
          Language::PlutusV2 => {
            Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(bytes))
          }
          Language::PlutusV3 => {
            Script::new_plutus_v3(cml_chain::plutus::PlutusV3Script::new(bytes))
          }
        };
        let hash = ScriptHash::from_raw_bytes(
          &hex::decode(
            spend.script_hash_hex.as_deref().ok_or("reference script requires scriptHashHex")?,
          )
          .map_err(|err| format!("invalid additional script hash: {err}"))?,
        )
        .map_err(|err| err.to_string())?;
        if script.hash() != hash {
          return Err(
            "additional reference script bytes do not match requested script hash".to_owned(),
          );
        }
        let (input, mut output) = parse_input(utxo)?;
        match &mut output {
          TransactionOutput::ConwayFormatTxOut(output) => output.script_reference = Some(script),
          _ => return Err("additional reference output is not Conway format".to_owned()),
        }
        builder.add_reference_input(
          cml_chain::builders::tx_builder::TransactionUnspentOutput::new(input, output),
        );
        reference_script_sizes.push((
          utxo.tx_hash_hex.to_ascii_lowercase(),
          utxo.index.clone(),
          size_num,
        ));
      }
      (None, None, None, Some(inline_cbor)) => {
        let bytes = hex::decode(inline_cbor)
          .map_err(|err| format!("invalid additional inline script CBOR: {err}"))?;
        let script = match spend_language {
          Language::PlutusV1 => {
            Script::new_plutus_v1(cml_chain::plutus::PlutusV1Script::new(bytes))
          }
          Language::PlutusV2 => {
            Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(bytes))
          }
          Language::PlutusV3 => {
            Script::new_plutus_v3(cml_chain::plutus::PlutusV3Script::new(bytes))
          }
        };
        if spend
          .script_hash_hex
          .as_deref()
          .map(|hash_hex| {
            let bytes = hex::decode(hash_hex)
              .map_err(|err| format!("invalid additional script hash: {err}"))?;
            let hash = ScriptHash::from_raw_bytes(&bytes).map_err(|err| err.to_string())?;
            Ok::<bool, String>(script.hash() == hash)
          })
          .transpose()?
          .is_some_and(|matches| !matches)
        {
          return Err(
            "additional inline script bytes do not match requested script hash".to_owned(),
          );
        }
      }
      (None, None, None, None) => {
        return Err("additional Plutus spend requires a reference or inline script".to_owned())
      }
      _ => return Err("additional reference script requires UTxO, CBOR, and size".to_owned()),
    }
  }
  let mut mint_policy_order = args
    .mints
    .iter()
    .filter(|mint| mint.script_type != "native")
    .map(|mint| {
      let bytes = hex::decode(&mint.policy_id_hex)
        .map_err(|err| format!("invalid Plutus mint policy ID: {err}"))?;
      ScriptHash::from_raw_bytes(&bytes)
        .map(|hash| hash.to_raw_bytes().to_vec())
        .map_err(|err| err.to_string())
    })
    .collect::<Result<Vec<_>, String>>()?;
  mint_policy_order.sort();
  mint_policy_order.dedup();
  for mint in &args.mints {
    let script_bytes = hex::decode(&mint.script_cbor_hex)
      .map_err(|err| format!("invalid mint script hex: {err}"))?;
    let policy_bytes =
      hex::decode(&mint.policy_id_hex).map_err(|err| format!("invalid mint policy ID: {err}"))?;
    let policy_id = ScriptHash::from_raw_bytes(&policy_bytes).map_err(|err| err.to_string())?;
    let mut mint_assets = cml_chain::OrderedHashMap::new();
    for asset in &mint.assets {
      let name_bytes = hex::decode(&asset.asset_name_hex)
        .map_err(|err| format!("invalid mint asset name: {err}"))?;
      let name = AssetName::new(name_bytes).map_err(|err| err.to_string())?;
      let quantity = asset
        .quantity
        .parse::<i64>()
        .map_err(|err| format!("invalid mint asset quantity: {err}"))?;
      mint_assets.insert(name, quantity);
    }
    if mint.script_type == "native" {
      let native_script = cml_chain::transaction::NativeScript::from_cbor_bytes(&script_bytes)
        .map_err(|err| format!("invalid native mint script CBOR: {err}"))?;
      if native_script.hash() != policy_id {
        return Err("native mint policy ID does not match script hash".to_owned());
      }
      builder
        .add_mint(
          SingleMintBuilder::new(mint_assets)
            .native_script(native_script, NativeScriptWitnessInfo::assume_signature_count()),
        )
        .map_err(|err| err.to_string())?;
      continue;
    }
    let version = match mint.script_type.as_str() {
      "plutusV1" => "V1",
      "plutusV2" => "V2",
      "plutusV3" => "V3",
      other => return Err(format!("unsupported mint script type: {other}")),
    };
    let (language_index, mint_language) = parse_plutus_language(Some(version))?;
    if !config_models.inner.contains_key(&language_index) {
      return Err(format!("missing cost model for Plutus mint {version}"));
    }
    if !used_languages.contains(&mint_language) {
      used_languages.push(mint_language);
    }
    let plutus_script = match mint_language {
      Language::PlutusV1 => {
        PlutusScript::PlutusV1(cml_chain::plutus::PlutusV1Script::new(script_bytes.clone()))
      }
      Language::PlutusV2 => {
        PlutusScript::PlutusV2(cml_chain::plutus::PlutusV2Script::new(script_bytes.clone()))
      }
      Language::PlutusV3 => {
        PlutusScript::PlutusV3(cml_chain::plutus::PlutusV3Script::new(script_bytes.clone()))
      }
    };
    if plutus_script.hash() != policy_id {
      return Err("Plutus mint policy ID does not match script hash".to_owned());
    }
    let witness_script = if let Some(reference) = &mint.reference_input {
      let ref_script = reference
        .reference_script
        .as_ref()
        .ok_or("Plutus reference mint requires referenceScript metadata on its UTxO")?;
      let bytes =
        hex::decode(ref_script.bytes.as_deref().ok_or("reference mint script bytes missing")?)
          .map_err(|err| format!("invalid reference mint script bytes: {err}"))?;
      let size = ref_script.size.ok_or("reference mint script size missing")?;
      if bytes != script_bytes || bytes.len() as u64 != size {
        return Err("reference mint script bytes/size do not match mint script".to_owned());
      }
      let reference_hash = ScriptHash::from_raw_bytes(
        &hex::decode(&ref_script.hash)
          .map_err(|err| format!("invalid reference mint script hash: {err}"))?,
      )
      .map_err(|err| err.to_string())?;
      if reference_hash != policy_id {
        return Err("reference mint script hash does not match mint policy ID".to_owned());
      }
      if ref_script.script_type.as_deref().is_some_and(|kind| kind != mint.script_type) {
        return Err("reference mint script type does not match mint script type".to_owned());
      }
      let reference_utxo = ScriptUtxoArgs {
        tx_hash_hex: reference.tx_hash_hex.clone(),
        index: reference.index.clone(),
        address: reference.address.clone(),
        address_hex: reference.address_hex.clone(),
        is_bootstrap: reference.is_bootstrap,
        lovelace: reference.lovelace.clone(),
        assets: reference.assets.clone(),
        inline_datum_cbor_hex: None,
        datum_cbor_hex: None,
        native_script_cbor_hex: None,
        native_script_witness_count: None,
      };
      let (input, mut output) = parse_input(&reference_utxo)?;
      match &mut output {
        TransactionOutput::ConwayFormatTxOut(output) => {
          output.script_reference = Some(match mint_language {
            Language::PlutusV1 => {
              Script::new_plutus_v1(cml_chain::plutus::PlutusV1Script::new(bytes))
            }
            Language::PlutusV2 => {
              Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(bytes))
            }
            Language::PlutusV3 => {
              Script::new_plutus_v3(cml_chain::plutus::PlutusV3Script::new(bytes))
            }
          });
        }
        _ => return Err("reference mint UTxO output is not Conway format".to_owned()),
      }
      builder.add_reference_input(cml_chain::builders::tx_builder::TransactionUnspentOutput::new(
        input, output,
      ));
      reference_script_sizes.push((
        reference.tx_hash_hex.to_ascii_lowercase(),
        reference.index.clone(),
        size,
      ));
      PlutusScriptWitness::Ref(policy_id)
    } else {
      PlutusScriptWitness::Script(plutus_script)
    };
    let redeemer_hex =
      mint.redeemer_cbor_hex.as_deref().ok_or("Plutus mint redeemer is missing")?;
    let redeemer_bytes =
      hex::decode(redeemer_hex).map_err(|err| format!("invalid Plutus mint redeemer: {err}"))?;
    let redeemer = PlutusData::from_cbor_bytes(&redeemer_bytes).map_err(|err| err.to_string())?;
    let partial_witness = PartialPlutusWitness::new(witness_script, redeemer);
    builder
      .add_mint(
        SingleMintBuilder::new(mint_assets)
          .plutus_script(partial_witness, RequiredSigners::from(Vec::new())),
      )
      .map_err(|err| err.to_string())?;
    let policy_index = mint_policy_order
      .iter()
      .position(|bytes| bytes == &policy_id.to_raw_bytes())
      .ok_or("Plutus mint policy missing from canonical policy ordering")?
      as u64;
    let mem = parse_u64(
      mint.redeemer_mem.as_deref().ok_or("Plutus mint memory ex-unit is missing")?,
      "mint redeemer memory",
    )?;
    let steps = parse_u64(
      mint.redeemer_steps.as_deref().ok_or("Plutus mint step ex-unit is missing")?,
      "mint redeemer steps",
    )?;
    builder.set_exunits(
      RedeemerWitnessKey::new(RedeemerTag::Mint, policy_index),
      ExUnits::new(mem, steps),
    );
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
    builder.add_reference_input(cml_chain::builders::tx_builder::TransactionUnspentOutput::new(
      input, output,
    ));
  }

  for funding in &args.funding_inputs {
    let (input, output) = parse_input(funding)?;
    let input_builder = SingleInputBuilder::new(input, output);
    let result = if let Some(script_hex) = &funding.native_script_cbor_hex {
      let script_bytes =
        hex::decode(script_hex).map_err(|err| format!("invalid funding native script: {err}"))?;
      let script = cml_chain::transaction::NativeScript::from_cbor_bytes(&script_bytes)
        .map_err(|err| format!("invalid funding native script CBOR: {err}"))?;
      let witness_info = match funding.native_script_witness_count.as_deref() {
        Some(count) => NativeScriptWitnessInfo::num_signatures(
          count
            .parse::<usize>()
            .map_err(|err| format!("invalid native script witness count: {err}"))?,
        ),
        None => NativeScriptWitnessInfo::assume_signature_count(),
      };
      input_builder.native_script(script, witness_info).map_err(|err| err.to_string())?
    } else {
      if funding.native_script_witness_count.is_some() {
        return Err("native-script witness count requires nativeScriptCborHex".to_owned());
      }
      input_builder.payment_key().map_err(|err| err.to_string())?
    };
    builder.add_input(result).map_err(|err| err.to_string())?;
  }
  add_stake_certificates(
    &mut builder,
    args.certificates.clone(),
    parse_u64(&args.key_deposit, "key deposit")?,
  )?;
  for withdrawal in &args.withdrawals {
    use cml_chain::{
      address::RewardAddress, builders::withdrawal_builder::SingleWithdrawalBuilder,
    };
    let address = parse_payment_address(&withdrawal.reward_address)?;
    let reward_address = RewardAddress::from_address(&address)
      .ok_or_else(|| "withdrawal address is not a reward address".to_owned())?;
    let amount = parse_u64(&withdrawal.amount, "withdrawal amount")?;
    builder.add_withdrawal(
      SingleWithdrawalBuilder::new(reward_address, amount)
        .payment_key()
        .map_err(|err| err.to_string())?,
    );
  }

  let (collateral_input, collateral_output) = parse_input(&args.collateral_input)?;
  if args.collateral_input.native_script_cbor_hex.is_some()
    || args.collateral_input.native_script_witness_count.is_some()
    || args.additional_collateral_inputs.iter().any(|input| {
      input.native_script_cbor_hex.is_some() || input.native_script_witness_count.is_some()
    })
  {
    return Err("collateral inputs must be payment-key inputs".to_owned());
  }
  let collateral = SingleInputBuilder::new(collateral_input, collateral_output)
    .payment_key()
    .map_err(|err| err.to_string())?;
  builder.add_collateral(collateral).map_err(|err| err.to_string())?;
  for collateral_input in &args.additional_collateral_inputs {
    let (input, output) = parse_input(collateral_input)?;
    let collateral =
      SingleInputBuilder::new(input, output).payment_key().map_err(|err| err.to_string())?;
    builder.add_collateral(collateral).map_err(|err| err.to_string())?;
  }
  if let Some(output) = &args.collateral_return {
    let address = parse_payment_address(&output.address)?;
    if output.datum_cbor_hex.is_some() && output.datum_hash_hex.is_some() {
      return Err("collateral return cannot contain both inline datum and datum hash".to_owned());
    }
    let datum_hash = output
      .datum_hash_hex
      .as_deref()
      .map(|hex| {
        let bytes =
          hex::decode(hex).map_err(|err| format!("invalid collateral datum hash: {err}"))?;
        DatumHash::from_raw_bytes(&bytes).map(DatumOption::new_hash).map_err(|err| err.to_string())
      })
      .transpose()?;
    let collateral_return = TransactionOutput::new(
      address,
      Value::new(
        parse_u64(&output.lovelace, "collateral return lovelace")?,
        parse_assets(&output.assets)?,
      ),
      datum_hash,
      None,
    );
    builder.set_collateral_return(collateral_return);
  }
  if let Some(total_collateral) = args.total_collateral.as_deref() {
    let mut collateral_value = Value::zero();
    for input in
      std::iter::once(&args.collateral_input).chain(args.additional_collateral_inputs.iter())
    {
      collateral_value = collateral_value
        .checked_add(&Value::new(
          parse_u64(&input.lovelace, "collateral lovelace")?,
          parse_assets(&input.assets)?,
        ))
        .map_err(|err| err.to_string())?;
    }
    let return_value = if let Some(output) = &args.collateral_return {
      Value::new(
        parse_u64(&output.lovelace, "collateral return lovelace")?,
        parse_assets(&output.assets)?,
      )
    } else {
      Value::zero()
    };
    let required_coin = parse_u64(total_collateral, "total collateral")?
      .checked_add(return_value.coin)
      .ok_or("collateral amount overflow")?;
    if collateral_value.coin != required_coin
      || collateral_value.multiasset != return_value.multiasset
    {
      return Err(
        "collateral inputs must equal total collateral plus collateral return".to_owned(),
      );
    }
  }

  let (script_input, mut script_output) = parse_input(&args.script_input)?;
  let inline_datum_bytes = args
    .script_input
    .inline_datum_cbor_hex
    .as_deref()
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
  let witness_script = if has_reference_script {
    PlutusScriptWitness::Ref(expected_hash.clone())
  } else {
    PlutusScriptWitness::Script(match language {
      Language::PlutusV1 => {
        PlutusScript::PlutusV1(cml_chain::plutus::PlutusV1Script::new(script_bytes.clone()))
      }
      Language::PlutusV2 => {
        PlutusScript::PlutusV2(cml_chain::plutus::PlutusV2Script::new(script_bytes.clone()))
      }
      Language::PlutusV3 => {
        PlutusScript::PlutusV3(cml_chain::plutus::PlutusV3Script::new(script_bytes.clone()))
      }
    })
  };
  let partial_witness = PartialPlutusWitness::new(witness_script, redeemer);
  let script_redeemer_index =
    spend_redeemer_index(&args, &args.script_input.tx_hash_hex, &args.script_input.index)?;
  let script_input_builder = SingleInputBuilder::new(script_input.clone(), script_output);
  let script_result = if inline_datum_bytes.is_some() {
    script_input_builder
      .plutus_script_inline_datum(partial_witness, RequiredSigners::from(Vec::new()))
  } else if let Some(datum_hex) = args.script_input.datum_cbor_hex.as_deref() {
    let datum_bytes =
      hex::decode(datum_hex).map_err(|err| format!("invalid spending datum CBOR: {err}"))?;
    let datum = PlutusData::from_cbor_bytes(&datum_bytes).map_err(|err| err.to_string())?;
    script_input_builder.plutus_script(partial_witness, RequiredSigners::from(Vec::new()), datum)
  } else {
    // CSL's `PlutusWitness.newWithoutDatum` is used for the legacy inline
    // source when no explicit datum is supplied. CML's inline-datum builder
    // carries the same witness shape (no datum in the witness set); it does
    // not synthesize or attach a datum to the source output.
    script_input_builder
      .plutus_script_inline_datum(partial_witness, RequiredSigners::from(Vec::new()))
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
    let (_, spend_language) =
      parse_plutus_language(spend.plutus_version.as_deref().or(args.plutus_version.as_deref()))?;
    let inline_script_bytes = spend
      .inline_script_cbor_hex
      .as_deref()
      .map(|hex| hex::decode(hex).map_err(|err| format!("invalid additional inline script: {err}")))
      .transpose()?;
    let inline_script = inline_script_bytes.as_ref().map(|bytes| match spend_language {
      Language::PlutusV1 => {
        PlutusScript::PlutusV1(cml_chain::plutus::PlutusV1Script::new(bytes.clone()))
      }
      Language::PlutusV2 => {
        PlutusScript::PlutusV2(cml_chain::plutus::PlutusV2Script::new(bytes.clone()))
      }
      Language::PlutusV3 => {
        PlutusScript::PlutusV3(cml_chain::plutus::PlutusV3Script::new(bytes.clone()))
      }
    });
    let spend_hash = if let Some(hash_hex) = spend.script_hash_hex.as_deref() {
      let spend_hash_bytes =
        hex::decode(hash_hex).map_err(|err| format!("invalid additional script hash: {err}"))?;
      ScriptHash::from_raw_bytes(&spend_hash_bytes).map_err(|err| err.to_string())?
    } else if let Some(script) = &inline_script {
      script.hash()
    } else {
      return Err(
        "additional Plutus spend requires scriptHashHex or inline script CBOR".to_owned(),
      );
    };
    if inline_script.as_ref().is_some_and(|script| script.hash() != spend_hash) {
      return Err("additional inline script bytes do not match requested script hash".to_owned());
    }
    let witness_script = if spend.reference_script_input.is_some() {
      if inline_script.is_some() {
        return Err(
          "additional Plutus spend cannot set both inline and reference scripts".to_owned(),
        );
      }
      PlutusScriptWitness::Ref(spend_hash)
    } else {
      let script =
        inline_script.ok_or("additional Plutus spend requires a reference or inline script")?;
      PlutusScriptWitness::Script(script)
    };
    let (input, mut output) = parse_input(&spend.script_input)?;
    let inline_datum = spend
      .script_input
      .inline_datum_cbor_hex
      .as_deref()
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
    let witness = PartialPlutusWitness::new(witness_script, redeemer);
    let input_builder = SingleInputBuilder::new(input, output);
    let result = if inline_datum.is_some() {
      input_builder.plutus_script_inline_datum(witness, RequiredSigners::from(Vec::new()))
    } else if let Some(datum_hex) = spend.script_input.datum_cbor_hex.as_deref() {
      let bytes =
        hex::decode(datum_hex).map_err(|err| format!("invalid spending datum CBOR: {err}"))?;
      let datum = PlutusData::from_cbor_bytes(&bytes).map_err(|err| err.to_string())?;
      input_builder.plutus_script(witness, RequiredSigners::from(Vec::new()), datum)
    } else {
      // Match CSL `newWithoutDatum`: leave datum absent from the witness set.
      input_builder.plutus_script_inline_datum(witness, RequiredSigners::from(Vec::new()))
    }
    .map_err(|err| err.to_string())?;
    let redeemer_index =
      spend_redeemer_index(&args, &spend.script_input.tx_hash_hex, &spend.script_input.index)?;
    builder.add_input(result).map_err(|err| err.to_string())?;
    builder.set_exunits(
      RedeemerWitnessKey::new(RedeemerTag::Spend, redeemer_index),
      ExUnits::new(
        parse_u64(&spend.redeemer_mem, "redeemer memory")?,
        parse_u64(&spend.redeemer_steps, "redeemer steps")?,
      ),
    );
  }

  let has_manual_change = args.manual_change_output.is_some();
  let mut outputs = args.outputs;
  if let Some(change) = args.manual_change_output.take() {
    outputs.push(change);
  }
  for output in outputs {
    let address = parse_payment_address(&output.address)?;
    if output.datum_cbor_hex.is_some() && output.datum_hash_hex.is_some() {
      return Err("output cannot contain both inline datum and datum hash".to_owned());
    }
    let datum = output
      .datum_cbor_hex
      .map(|hex| {
        let bytes = hex::decode(hex).map_err(|err| format!("invalid output datum CBOR: {err}"))?;
        PlutusData::from_cbor_bytes(&bytes)
          .map(DatumOption::new_datum)
          .map_err(|err| err.to_string())
      })
      .transpose()?;
    let datum = if let Some(datum) = datum {
      Some(datum)
    } else {
      output
        .datum_hash_hex
        .as_deref()
        .map(|hex| {
          let bytes =
            hex::decode(hex).map_err(|err| format!("invalid output datum hash: {err}"))?;
          DatumHash::from_raw_bytes(&bytes)
            .map(DatumOption::new_hash)
            .map_err(|err| err.to_string())
        })
        .transpose()?
    };
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
  if args.ttl != "-" {
    builder.set_ttl(parse_u64(&args.ttl, "TTL")?);
  }
  let selected_manual_fee = if let Some(fee) = args.manual_fee.as_deref() {
    Some(parse_u64(fee, "manual fee")?)
  } else if has_manual_change {
    let input_value = builder.get_total_input().map_err(|err| err.to_string())?;
    let output_value = builder.get_total_output().map_err(|err| err.to_string())?;
    let residual = input_value
      .checked_sub(&output_value)
      .map_err(|err| format!("manual change exceeds input value: {err}"))?;
    if !residual.multiasset.is_empty() {
      return Err("manual change leaves unassigned asset value".to_owned());
    }
    Some(residual.coin)
  } else {
    None
  };
  let manual_fee_minimum = if selected_manual_fee.is_some() {
    Some(builder.min_fee(false).map_err(|err| err.to_string())?)
  } else {
    None
  };
  if let Some(fee) = selected_manual_fee {
    let minimum_fee = manual_fee_minimum.ok_or("manual fee minimum was not calculated")?;
    if fee < minimum_fee {
      return Err(format!("manual fee {fee} is below protocol minimum {minimum_fee}"));
    }
    builder.set_fee(fee);
    if has_manual_change {
      let input_value = builder.get_total_input().map_err(|err| err.to_string())?;
      let output_value = builder
        .get_total_output()
        .map_err(|err| err.to_string())?
        .checked_add(&Value::from(fee))
        .map_err(|err| err.to_string())?;
      if input_value != output_value {
        return Err("manual fee/change transaction does not conserve value".to_owned());
      }
    }
  }
  let mut tx = builder
    .build(ChangeSelectionAlgo::Default, &change_address)
    .map_err(|err| err.to_string())?
    .build_unchecked();
  if has_manual_change {
    tx.body.fee = selected_manual_fee.ok_or("manual change fee was not calculated")?;
  }
  if let Some(total_collateral) = args.total_collateral.as_deref() {
    tx.body.total_collateral = Some(parse_u64(total_collateral, "total collateral")?);
  }
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
  let compatibility_size_delta =
    tx.to_cbor_bytes()
      .len()
      .checked_sub(cml_estimated_tx_size)
      .ok_or("CML compatibility serialization unexpectedly reduced transaction size")? as u64;
  let mut reference_script_fee = 0;
  if let Some(cost) = &args.ref_script_coins_per_byte {
    reference_script_sizes.sort();
    for pair in reference_script_sizes.windows(2) {
      if pair[0].0 == pair[1].0 && pair[0].1 == pair[1].1 && pair[0].2 != pair[1].2 {
        return Err("the same reference input has conflicting script sizes".to_owned());
      }
    }
    reference_script_sizes.dedup_by(|a, b| a.0 == b.0 && a.1 == b.1);
    let size = reference_script_sizes.iter().try_fold(0u64, |total, entry| {
      total.checked_add(entry.2).ok_or("reference script size overflow")
    })?;
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
    || args
      .additional_script_inputs
      .iter()
      .any(|spend| spend.script_input.datum_cbor_hex.is_some());
  if let (Some(fee), Some(base_minimum)) = (selected_manual_fee, manual_fee_minimum) {
    let serialization_adjustment = parse_u64(&args.fee_coefficient, "fee coefficient")?
      .checked_mul(compatibility_size_delta)
      .ok_or("transaction fee overflow")?;
    let minimum_with_script_cost = base_minimum
      .checked_add(reference_script_fee)
      .and_then(|value| value.checked_add(serialization_adjustment))
      .ok_or("transaction fee overflow")?;
    if fee < minimum_with_script_cost {
      return Err(format!("manual fee {fee} is below protocol minimum {minimum_with_script_cost}"));
    }
  } else if reference_script_fee > 0 || has_explicit_datum {
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
  if raw.is_empty() || raw == "-" {
    return Ok(MultiAsset::default());
  }
  let entries = raw
    .split('^')
    .map(|packed| -> Result<(String, String, String), String> {
      let fields = packed.split('~').collect::<Vec<_>>();
      if fields.len() != 3 {
        return Err("each asset must contain policyHex~assetNameHex~quantity".to_owned());
      }
      Ok((
        decode_percent_encoded_text(fields[0], "asset policy")?,
        decode_percent_encoded_text(fields[1], "asset name")?,
        decode_percent_encoded_text(fields[2], "asset quantity")?,
      ))
    })
    .collect::<Result<Vec<_>, _>>()?;
  crate::cml_assets::multiasset_from_hex_amounts(
    entries
      .iter()
      .map(|(policy, name, quantity)| (policy.as_str(), name.as_str(), quantity.as_str())),
  )
}

fn parse_assets(assets: &[ScriptAssetArgs]) -> Result<MultiAsset, String> {
  crate::cml_assets::multiasset_from_hex_amounts(assets.iter().map(|asset| {
    (asset.policy_id_hex.as_str(), asset.asset_name_hex.as_str(), asset.quantity.as_str())
  }))
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
        return Err("invalid percent-encoded input".to_owned());
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

fn decode_percent_encoded_text(value: &str, name: &str) -> Result<String, String> {
  String::from_utf8(decode_percent_encoded(value)?)
    .map_err(|err| format!("{name} is not valid UTF-8: {err}"))
}

fn percent_encode(bytes: &[u8]) -> String {
  bytes.iter().map(|byte| format!("%{byte:02X}")).collect()
}

fn encode_wire_field(value: &str) -> String {
  let mut encoded = String::with_capacity(value.len());
  for character in value.chars() {
    if character.is_ascii() && matches!(character, '%' | '|' | ';' | ',' | '~' | '^') {
      encoded.push_str(&format!("%{:02X}", character as u8));
    } else {
      encoded.push(character);
    }
  }
  encoded
}

/// Calculate the minimum coin for an output with assets using CML's current
/// coins-per-UTxO-byte rule. Args are addressBech32|packedAssets|coinsPerByte.
pub fn minimum_coin_for_assets(args: &str) -> Result<String, String> {
  use cml_chain::builders::output_builder::TransactionOutputBuilder;
  let fields = args.split('|').collect::<Vec<_>>();
  if fields.len() != 3 {
    return Err(format!("expected 3 minimum-coin fields, received {}", fields.len()));
  }
  let address = parse_payment_address(&decode_percent_encoded_text(fields[0], "address")?)?;
  let assets_text = decode_percent_encoded_text(fields[1], "assets")?;
  let assets = parse_multiasset(&assets_text)?;
  let coins_per_byte = decode_percent_encoded_text(fields[2], "coins per UTXO byte")?;
  let coins_per_byte =
    coins_per_byte.parse::<u64>().map_err(|err| format!("invalid coins per UTXO byte: {err}"))?;
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
  let transaction_bytes =
    hex::decode(transaction_hex).map_err(|err| format!("invalid transaction hex: {err}"))?;
  let transaction = Transaction::from_cbor_bytes(&transaction_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  serde_json::to_string(&serde_json::json!({
    "inputsCount": transaction.body.inputs.len(),
    "outputsCount": transaction.body.outputs.len(),
    "fee": transaction.body.fee.to_string(),
    "ttl": transaction.body.ttl,
  }))
  .map_err(|err| err.to_string())
}

/// Return the complete CML-parsed review payload without converting ledger
/// quantities to JavaScript numbers. Raw CBOR for the complete body,
/// witnesses, and auxiliary data is included so callers can retain fields
/// which are not yet represented in the normalized summary.
pub fn transaction_review_info_json(transaction_hex: &str) -> Result<String, String> {
  let transaction_bytes =
    hex::decode(transaction_hex).map_err(|err| format!("invalid transaction hex: {err}"))?;
  let transaction = Transaction::from_cbor_bytes(&transaction_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  let outputs = transaction.body.outputs.iter().map(review_output_json).collect::<Vec<_>>();
  let inputs = transaction.body.inputs.iter().map(review_input_json).collect::<Vec<_>>();
  let collateral_inputs = transaction
    .body
    .collateral_inputs
    .as_ref()
    .map(|set| set.iter().map(review_input_json).collect::<Vec<_>>());
  let reference_inputs = transaction
    .body
    .reference_inputs
    .as_ref()
    .map(|set| set.iter().map(review_input_json).collect::<Vec<_>>());
  let withdrawals = transaction.body.withdrawals.as_ref().map(|entries| {
    entries
      .iter()
      .map(|(address, amount)| {
        let reward_address = address.clone().to_address();
        serde_json::json!({
          "rewardAddress": reward_address.to_bech32(None).ok(),
          "rewardAddressHex": hex::encode(reward_address.to_raw_bytes()),
          "amount": amount.to_string(),
        })
      })
      .collect::<Vec<_>>()
  });
  let required_signers = transaction.body.required_signers.as_ref().map(|signers| {
    signers.iter().map(|signer| hex::encode(signer.to_raw_bytes())).collect::<Vec<_>>()
  });
  let witness_set_cbor = transaction.witness_set.to_cbor_bytes();
  let witnesses = &transaction.witness_set;
  let vkeys = witnesses
    .vkeywitnesses
    .as_ref()
    .map(|set| {
      set
        .iter()
        .map(|witness| {
          serde_json::json!({
            "publicKeyHex": hex::encode(witness.vkey.to_raw_bytes()),
            "signatureHex": hex::encode(witness.ed25519_signature.to_raw_bytes()),
          })
        })
        .collect::<Vec<_>>()
    })
    .unwrap_or_default();
  let bootstraps = witnesses
    .bootstrap_witnesses
    .as_ref()
    .map(|set| {
      set.iter().map(|witness| serde_json::json!({
    "publicKeyHex": hex::encode(witness.public_key.to_raw_bytes()),
    "signatureHex": hex::encode(witness.signature.to_raw_bytes()),
    "chainCodeHex": hex::encode(&witness.chain_code),
    "attributes": serde_json::to_value(&witness.attributes).unwrap_or(serde_json::Value::Null),
  })).collect::<Vec<_>>()
    })
    .unwrap_or_default();
  let native_scripts = witnesses
    .native_scripts
    .as_ref()
    .map(|set| {
      set
        .iter()
        .map(|script| {
          serde_json::json!({
            "hashHex": hex::encode(script.hash().to_raw_bytes()),
            "cborHex": hex::encode(script.to_cbor_bytes()),
          })
        })
        .collect::<Vec<_>>()
    })
    .unwrap_or_default();
  let plutus_scripts = [
    witnesses.plutus_v1_scripts.as_ref().map(|set| set.iter().map(|script| serde_json::json!({"type":"plutusV1", "hashHex":hex::encode(script.hash().to_raw_bytes()), "bytesHex":hex::encode(script.to_raw_bytes()), "cborHex":hex::encode(script.to_cbor_bytes())})).collect::<Vec<_>>()).unwrap_or_default(),
    witnesses.plutus_v2_scripts.as_ref().map(|set| set.iter().map(|script| serde_json::json!({"type":"plutusV2", "hashHex":hex::encode(script.hash().to_raw_bytes()), "bytesHex":hex::encode(script.to_raw_bytes()), "cborHex":hex::encode(script.to_cbor_bytes())})).collect::<Vec<_>>()).unwrap_or_default(),
    witnesses.plutus_v3_scripts.as_ref().map(|set| set.iter().map(|script| serde_json::json!({"type":"plutusV3", "hashHex":hex::encode(script.hash().to_raw_bytes()), "bytesHex":hex::encode(script.to_raw_bytes()), "cborHex":hex::encode(script.to_cbor_bytes())})).collect::<Vec<_>>()).unwrap_or_default(),
  ].concat();
  let plutus_data = witnesses
    .plutus_datums
    .as_ref()
    .map(|set| set.iter().map(|datum| hex::encode(datum.to_cbor_bytes())).collect::<Vec<_>>())
    .unwrap_or_default();
  let redeemers = witnesses
    .redeemers
    .as_ref()
    .map(|value| serde_json::to_value(value).unwrap_or(serde_json::Value::Null));
  let auxiliary_data_cbor = transaction.auxiliary_data.as_ref().map(|data| data.to_cbor_bytes());
  let auxiliary_data = transaction.auxiliary_data.as_ref().map(|data| {
    review_auxiliary_data_json(data, auxiliary_data_cbor.as_deref().unwrap_or_default())
  });
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
      "mint": transaction.body.mint.as_ref().map(review_mint_json),
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

fn review_mint_json(mint: &cml_chain::assets::Mint) -> serde_json::Value {
  let policies = mint
    .iter()
    .map(|(policy_id, assets)| {
      let quantities = assets
        .iter()
        .map(|(asset_name, quantity)| {
          (hex::encode(asset_name.to_raw_bytes()), serde_json::Value::String(quantity.to_string()))
        })
        .collect::<serde_json::Map<_, _>>();
      (hex::encode(policy_id.to_raw_bytes()), serde_json::Value::Object(quantities))
    })
    .collect::<serde_json::Map<_, _>>();
  serde_json::Value::Object(policies)
}

/// Return the transaction fields used to determine which wallet keys must sign.
/// All ordered input arrays follow the order serialized in the transaction body.
pub fn transaction_signing_requirements_json(transaction_hex: &str) -> Result<String, String> {
  use std::collections::HashSet;

  let transaction_bytes =
    hex::decode(transaction_hex).map_err(|err| format!("invalid transaction hex: {err}"))?;
  let transaction = Transaction::from_cbor_bytes(&transaction_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  let inputs = transaction.body.inputs.iter().map(review_input_json).collect::<Vec<_>>();
  let collateral_inputs = transaction
    .body
    .collateral_inputs
    .as_ref()
    .map(|set| set.iter().map(review_input_json).collect::<Vec<_>>())
    .unwrap_or_default();
  let required_signers = transaction
    .body
    .required_signers
    .as_ref()
    .map(|set| set.iter().map(|hash| hex::encode(hash.to_raw_bytes())).collect::<Vec<_>>())
    .unwrap_or_default();
  let withdrawals = transaction
    .body
    .withdrawals
    .as_ref()
    .map(|entries| {
      entries
        .iter()
        .map(|(address, amount)| {
          serde_json::json!({
            "rewardAddressHex": hex::encode(address.clone().to_address().to_raw_bytes()),
            "amount": amount.to_string(),
          })
        })
        .collect::<Vec<_>>()
    })
    .unwrap_or_default();
  let has_staking_certificate = transaction
    .body
    .certs
    .as_ref()
    .map(|certificates| has_staking_certificate(certificates))
    .unwrap_or(false);
  let mut seen_hashes = HashSet::new();
  let mut native_script_key_hashes = Vec::new();
  if let Some(scripts) = transaction.witness_set.native_scripts.as_ref() {
    for script in scripts {
      for hash in crate::cml_native_script::native_script_key_hashes(script) {
        if seen_hashes.insert(hash.clone()) {
          native_script_key_hashes.push(hash);
        }
      }
    }
  }
  serde_json::to_string(&serde_json::json!({
    "inputs": inputs,
    "collateralInputs": collateral_inputs,
    "requiredSigners": required_signers,
    "hasStakingCertificate": has_staking_certificate,
    "withdrawals": withdrawals,
    "nativeScriptKeyHashesHex": native_script_key_hashes,
  }))
  .map_err(|err| err.to_string())
}

fn certificate_requires_staking_witness(certificate: &cml_chain::certs::Certificate) -> bool {
  use cml_chain::certs::Certificate;
  matches!(
    certificate,
    Certificate::StakeRegistration(_)
      | Certificate::StakeDeregistration(_)
      | Certificate::RegCert(_)
      | Certificate::UnregCert(_)
      | Certificate::StakeDelegation(_)
      | Certificate::StakeRegDelegCert(_)
      | Certificate::StakeVoteRegDelegCert(_)
      | Certificate::StakeVoteDelegCert(_)
      | Certificate::VoteDelegCert(_)
      | Certificate::VoteRegDelegCert(_)
  )
}

fn has_staking_certificate(certificates: &[cml_chain::certs::Certificate]) -> bool {
  certificates.iter().any(certificate_requires_staking_witness)
}

fn review_auxiliary_data_json(
  data: &cml_chain::auxdata::AuxiliaryData, cbor: &[u8],
) -> serde_json::Value {
  let (metadata, native_scripts, plutus_scripts) = match data {
    cml_chain::auxdata::AuxiliaryData::Shelley(metadata) => {
      (Some(metadata), Vec::new(), Vec::new())
    }
    cml_chain::auxdata::AuxiliaryData::ShelleyMA(data) => {
      (Some(&data.transaction_metadata), data.auxiliary_scripts.iter().collect(), Vec::new())
    }
    cml_chain::auxdata::AuxiliaryData::Conway(data) => {
      let mut plutus = Vec::new();
      if let Some(scripts) = &data.plutus_v1_scripts {
        plutus.extend(scripts.iter().map(|script| serde_json::json!({"type":"plutusV1","hashHex":hex::encode(script.hash().to_raw_bytes()),"bytesHex":hex::encode(script.to_raw_bytes()),"cborHex":hex::encode(script.to_cbor_bytes())})));
      }
      if let Some(scripts) = &data.plutus_v2_scripts {
        plutus.extend(scripts.iter().map(|script| serde_json::json!({"type":"plutusV2","hashHex":hex::encode(script.hash().to_raw_bytes()),"bytesHex":hex::encode(script.to_raw_bytes()),"cborHex":hex::encode(script.to_cbor_bytes())})));
      }
      if let Some(scripts) = &data.plutus_v3_scripts {
        plutus.extend(scripts.iter().map(|script| serde_json::json!({"type":"plutusV3","hashHex":hex::encode(script.hash().to_raw_bytes()),"bytesHex":hex::encode(script.to_raw_bytes()),"cborHex":hex::encode(script.to_cbor_bytes())})));
      }
      (
        data.metadata.as_ref(),
        data.native_scripts.as_ref().map(|scripts| scripts.iter().collect()).unwrap_or_default(),
        plutus,
      )
    }
  };
  let metadata_labels = metadata
    .map(|metadata| {
      metadata
        .entries
        .iter()
        .map(|(label, value)| {
          let basic_conversions_json = cml_chain::json::metadatums::decode_metadatum_to_json_value(
            value,
            cml_chain::json::metadatums::MetadataJsonSchema::BasicConversions,
          )
          .ok()
          .and_then(|decoded| decoded.to_string().ok());
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
        })
        .collect::<Vec<_>>()
    })
    .unwrap_or_default();
  let native_scripts = native_scripts
    .iter()
    .map(|script| {
      serde_json::json!({
        "hashHex": hex::encode(script.hash().to_raw_bytes()),
        "cborHex": hex::encode(script.to_cbor_bytes()),
      })
    })
    .collect::<Vec<_>>();
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

pub(crate) fn review_output_json(
  output: &cml_chain::transaction::TransactionOutput,
) -> serde_json::Value {
  let assets = output
    .amount()
    .multiasset
    .iter()
    .flat_map(|(policy, tokens)| {
      tokens.iter().map(move |(name, quantity)| {
        serde_json::json!({
          "policyIdHex": hex::encode(policy.to_raw_bytes()),
          "assetNameHex": hex::encode(name.to_raw_bytes()),
          "quantity": quantity.to_string(),
        })
      })
    })
    .collect::<Vec<_>>();
  let datum = output.datum().map(|datum| match datum {
    DatumOption::Hash { datum_hash, .. } => serde_json::json!({
      "kind": "hash", "hashHex": hex::encode(datum_hash.to_raw_bytes()),
    }),
    DatumOption::Datum { datum, .. } => serde_json::json!({
      "kind": "inline", "cborHex": hex::encode(datum.to_cbor_bytes()),
    }),
  });
  let script_ref = output.script_ref().map(|script| {
    serde_json::json!({
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
    })
  });
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
  let transaction_bytes =
    hex::decode(transaction_hex).map_err(|err| format!("invalid transaction hex: {err}"))?;
  let transaction = Transaction::from_cbor_bytes(&transaction_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  Ok(hex::encode(transaction.witness_set.to_cbor_bytes()))
}

/// Return an otherwise identical transaction with an empty witness set.
/// Auxiliary data and validity are intentionally preserved for CIP-30 rebuilds.
pub fn empty_witness_transaction_hex(transaction_hex: &str) -> Result<String, String> {
  let transaction_bytes =
    hex::decode(transaction_hex).map_err(|err| format!("invalid transaction hex: {err}"))?;
  let mut transaction = Transaction::from_cbor_bytes(&transaction_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  transaction.witness_set = cml_chain::transaction::TransactionWitnessSet::default();
  Ok(hex::encode(transaction.to_cbor_bytes()))
}

#[cfg(test)]
mod tests {
  use super::{
    add_reference_fee_and_rebalance, build_escrow_redeem_transaction_hex,
    build_simple_payment_transaction_hex, build_transaction_recipe_cml_hex,
    calculate_reference_script_fee, certificate_requires_staking_witness,
    derive_account_public_key_hex, empty_witness_transaction_hex, has_staking_certificate,
    minimum_coin_for_assets, parse_multiasset, review_output_json, sign_transaction_hex,
    sign_wallet_data, sign_wallet_transaction_hex, sign_wallet_transaction_paths_hex,
    transaction_id_hex, transaction_review_info_json, transaction_validation_info_json,
    transaction_witness_set_hex, wallet_root_key_hex_from_entropy,
  };

  #[test]
  fn conway_registration_certificates_require_stake_key_witnesses() {
    use cml_chain::certs::{Certificate, Credential};
    use cml_chain::crypto::Ed25519KeyHash;
    use cml_crypto::RawBytesEncoding;

    let credential = Credential::new_pub_key(Ed25519KeyHash::from_raw_bytes(&[0; 28]).unwrap());
    assert!(certificate_requires_staking_witness(&Certificate::new_reg_cert(
      credential.clone(),
      0,
    )));
    assert!(certificate_requires_staking_witness(&Certificate::new_unreg_cert(credential, 0,)));
  }

  #[test]
  fn staking_witness_detection_uses_any_staking_certificate() {
    use cml_chain::certs::{Certificate, Credential, DRep};
    use cml_crypto::{Ed25519KeyHash, RawBytesEncoding};

    let credential = Credential::new_pub_key(Ed25519KeyHash::from_raw_bytes(&[0; 28]).unwrap());
    let non_staking =
      Certificate::new_pool_retirement(Ed25519KeyHash::from_raw_bytes(&[1; 28]).unwrap(), 42);
    let staking = Certificate::new_vote_deleg_cert(credential.clone(), DRep::new_always_abstain());
    let deregistration = Certificate::new_stake_deregistration(credential.clone());
    let registration = Certificate::new_reg_cert(credential, 2_000_000);

    assert!(has_staking_certificate(&[non_staking.clone(), staking]));
    assert!(has_staking_certificate(&[deregistration]));
    assert!(has_staking_certificate(&[registration]));
    assert!(!has_staking_certificate(&[non_staking]));
    assert!(!has_staking_certificate(&[]));
  }

  #[test]
  fn empty_witness_transaction_preserves_body_validity_and_auxiliary_data() {
    use cml_chain::serialization::{Deserialize, Serialize};
    use cml_chain::transaction::Transaction;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let metadata_json = r#"[{"label":"674","data":{"msg":["cip30"]}}]"#;
    let metadata_arg =
      metadata_json.as_bytes().iter().map(|byte| format!("%{byte:02X}")).collect::<String>();
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|{}",
      "01".repeat(32),
      address,
      address,
      address,
      metadata_arg,
    );
    let unsigned_hex =
      build_simple_payment_transaction_hex(&args).unwrap().split('|').next().unwrap().to_owned();
    let signed_hex = sign_transaction_hex(&unsigned_hex, &"11".repeat(32)).unwrap();
    let signed = Transaction::from_cbor_bytes(&hex::decode(&signed_hex).unwrap()).unwrap();
    let cleared_hex = empty_witness_transaction_hex(&signed_hex).unwrap();
    let cleared = Transaction::from_cbor_bytes(&hex::decode(&cleared_hex).unwrap()).unwrap();

    assert_eq!(cleared.body.to_cbor_bytes(), signed.body.to_cbor_bytes());
    assert_eq!(cleared.is_valid, signed.is_valid);
    assert_eq!(
      cleared.auxiliary_data.as_ref().unwrap().to_cbor_bytes(),
      signed.auxiliary_data.as_ref().unwrap().to_cbor_bytes(),
    );
    assert!(signed.witness_set.vkeywitnesses.is_some());
    assert!(cleared.witness_set.vkeywitnesses.is_none());
    assert_eq!(hex::encode(cleared.witness_set.to_cbor_bytes()), "a0");
    assert!(empty_witness_transaction_hex("zz").is_err());
  }

  #[test]
  fn signing_requirements_normalize_inputs_stake_actions_withdrawals_and_nested_scripts() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let reward = "stake_test1uz42424242424242424242424242424242424242424242s7f0kdw";
    let native_script = format!("8200581c{}", "cc".repeat(28));
    let certificates = serde_json::json!([{
      "kind": "StakeDelegation",
      "stakeCredentialKeyHashHex": "aa".repeat(28),
      "poolKeyHash": "bb".repeat(28),
    }])
    .to_string();
    let withdrawals =
      serde_json::json!([{"rewardAddress": reward, "amount": "3500000"}]).to_string();
    let encode =
      |value: &str| value.as_bytes().iter().map(|byte| format!("%{byte:02X}")).collect::<String>();
    let args = format!(
      "{}||{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}|{}",
      format!("{},0,{},10000000,-,{},1", "01".repeat(32), address, native_script),
      address,
      encode(&certificates),
      encode(&withdrawals),
    );
    let transaction_hex =
      build_simple_payment_transaction_hex(&args).unwrap().split('|').next().unwrap().to_owned();
    let requirements: serde_json::Value = serde_json::from_str(
      &super::transaction_signing_requirements_json(&transaction_hex).unwrap(),
    )
    .unwrap();

    assert_eq!(
      requirements["inputs"],
      serde_json::json!([{
        "transactionIdHex": "01".repeat(32), "index": "0",
      }])
    );
    assert_eq!(requirements["collateralInputs"], serde_json::json!([]));
    assert_eq!(requirements["requiredSigners"], serde_json::json!([]));
    assert_eq!(requirements["hasStakingCertificate"], true);
    assert_eq!(requirements["withdrawals"][0]["amount"], "3500000");
    assert_eq!(requirements["withdrawals"][0]["rewardAddressHex"].as_str().unwrap().len(), 58);
    assert_eq!(requirements["nativeScriptKeyHashesHex"], serde_json::json!(["cc".repeat(28)]));
    assert!(super::transaction_signing_requirements_json("zz").is_err());
  }

  #[test]
  fn signing_requirements_report_no_staking_certificate_when_absent() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32),
      address,
      address,
      address,
    );
    let transaction_hex =
      build_simple_payment_transaction_hex(&args).unwrap().split('|').next().unwrap().to_owned();
    let requirements: serde_json::Value = serde_json::from_str(
      &super::transaction_signing_requirements_json(&transaction_hex).unwrap(),
    )
    .unwrap();

    assert_eq!(requirements["hasStakingCertificate"], false);
  }

  #[test]
  fn normalized_transaction_recipe_matches_payment_builder_and_rejects_unhandled_script_fields() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let input = format!("{},0,{},10000000,-,-,-", "01".repeat(32), address);
    let output = format!("{},2000000,-,-", address);
    let legacy = format!(
      "{}|{}|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|-|-|-|-|-|false",
      input, output, address,
    );
    let recipe = serde_json::json!({
      "protocolParams": {
        "linearFee": {"coefficient":"44", "constant":"155381"},
        "coinsPerUtxoByte":"4310", "keyDeposit":"2000000", "poolDeposit":"500000000",
        "maxValueSize":"5000"
      },
      "inputs":[{"txHashHex":"01".repeat(32),"index":"0","address":address,
        "lovelace":"10000000","assets":[],"kind":"paymentKey"}],
      "outputs":[{"address":address,"lovelace":"2000000","assets":[]}],
      "certificates":[],"withdrawals":[],"referenceInputs":[],"scriptInputs":[],
      "collateralInputs":[],"mints":[],"metadata":[],
      "options":{"changeAddress":address,"ttl":"123456"}
    })
    .to_string();
    assert_eq!(
      super::build_transaction_recipe_cml_hex(&recipe).unwrap(),
      super::build_simple_payment_transaction_hex(&legacy).unwrap(),
    );

    let mut injection_base: serde_json::Value = serde_json::from_str(&recipe).unwrap();
    injection_base["inputs"][0]["lovelace"] = serde_json::json!("100000000");
    let mut address_injection = injection_base.clone();
    address_injection["outputs"][0]["address"] =
      serde_json::json!(format!("{address},50000000,-,-;{address}"));
    assert!(super::build_transaction_recipe_cml_hex(&address_injection.to_string()).is_err());

    let mut lovelace_injection = injection_base.clone();
    lovelace_injection["outputs"][0]["lovelace"] =
      serde_json::json!(format!("2000000,-,-;{address},50000000"));
    assert!(super::build_transaction_recipe_cml_hex(&lovelace_injection.to_string()).is_err());

    let mut datum_injection = injection_base;
    datum_injection["outputs"][0]["datum"] = serde_json::json!({
      "kind": "inline",
      "hex": format!("d87980;{address},50000000,-,-")
    });
    assert!(super::build_transaction_recipe_cml_hex(&datum_injection.to_string()).is_err());

    let malformed_script_recipe = recipe.replace("\"scriptInputs\":[]", "\"scriptInputs\":[{}]");
    assert!(super::build_transaction_recipe_cml_hex(&malformed_script_recipe)
      .unwrap_err()
      .contains("invalid CML transaction recipe"));
    let unknown_field_recipe =
      recipe.replace("\"metadata\":[]", "\"metadata\":[],\"unexpected\":true");
    assert!(super::build_transaction_recipe_cml_hex(&unknown_field_recipe)
      .unwrap_err()
      .contains("invalid CML transaction recipe"));
    let mut collateral_recipe: serde_json::Value = serde_json::from_str(&recipe).unwrap();
    collateral_recipe["collateralInputs"] = serde_json::json!([{
      "txHashHex":"02".repeat(32), "index":"0", "address":address,
      "lovelace":"5000000", "assets":[]
    }]);
    assert!(super::build_transaction_recipe_cml_hex(&collateral_recipe.to_string())
      .unwrap_err()
      .contains("collateral inputs require at least one Plutus script input"));
  }

  #[test]
  fn normalized_recipe_routes_plutus_reference_and_collateral_fields_into_cml_builder() {
    use cml_chain::{
      crypto::Vkeywitness,
      serialization::{Deserialize, Serialize},
    };
    use cml_chain::{plutus::PlutusV3Script, Script};
    use cml_crypto::RawBytesEncoding;
    let script_bytes = vec![1, 0, 0];
    let script = Script::new_plutus_v3(PlutusV3Script::new(script_bytes.clone()));
    let script_hash_hex = hex::encode(script.hash().to_raw_bytes());
    let key_address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let script_address = cml_chain::address::EnterpriseAddress::new(
      0,
      cml_chain::certs::Credential::new_script(
        cml_chain::crypto::ScriptHash::from_raw_bytes(&hex::decode(&script_hash_hex).unwrap())
          .unwrap(),
      ),
    )
    .to_address()
    .to_bech32(None)
    .unwrap();
    let stake_hash_hex = "aa".repeat(28);
    let reward_address = cml_chain::address::RewardAddress::new(
      0,
      cml_chain::certs::Credential::new_pub_key(
        cml_chain::crypto::Ed25519KeyHash::from_raw_bytes(&hex::decode(&stake_hash_hex).unwrap())
          .unwrap(),
      ),
    )
    .to_address()
    .to_bech32(None)
    .unwrap();
    let recipe = serde_json::json!({
      "protocolParams": {
        "linearFee":{"coefficient":"44","constant":"155381"},
        "coinsPerUtxoByte":"4310","keyDeposit":"2000000","poolDeposit":"500000000","maxValueSize":"5000","maxTxSize":"16384",
        "collateralPercentage":"150","refScriptCoinsPerByte":{"numerator":"15","denominator":"1"},
        "refScriptTierStepBytes":"25600","refScriptMultiplier":"1.2",
        "exUnitPricesMemory":{"numerator":"577","denominator":"10000"},
        "exUnitPricesSteps":{"numerator":"721","denominator":"10000000"},"plutusV3CostModel":[0]
      },
      "inputs":[{"txHashHex":"03".repeat(32),"index":"0","address":key_address,"lovelace":"10000000","assets":[]}],
      "outputs":[{"address":key_address,"lovelace":"2000000","assets":[],"datum":{"kind":"hash","hex":"bb".repeat(32)}}],
      "certificates":[{"kind":"StakeRegistration","stakeCredentialKeyHashHex":stake_hash_hex}],
      "withdrawals":[{"rewardAddress":reward_address,"amount":"3500000"}],"referenceInputs":[],
      "scriptInputs":[{
        "utxo":{"txHashHex":"01".repeat(32),"index":"0","address":script_address,"lovelace":"5000000","assets":[],"inlineDatumCborHex":"d87980"},
        "scriptHashHex":script_hash_hex,"plutusVersion":"V3","redeemerCborHex":"d87980","redeemerMem":"900000","redeemerSteps":"250000000","datumSource":"inline",
        "referenceScript":{"utxo":{"txHashHex":"02".repeat(32),"index":"0","address":key_address,"lovelace":"2000000","assets":[]},"scriptCborHex":hex::encode(&script_bytes),"size":"3"}
      }],
      "collateralInputs":[{"txHashHex":"04".repeat(32),"index":"0","address":key_address,"lovelace":"5000000","assets":[]}],
      "collateralReturn":{"address":key_address,"lovelace":"4000000","assets":[]},
      "totalCollateral":"1000000","mints":[],"metadata":[{"label":"674","data":{"cml":"yes"}}],"options":{"changeAddress":key_address,"ttl":"1000","validityIntervalStart":"100"}
    }).to_string();
    let transaction_hex = build_transaction_recipe_cml_hex(&recipe).unwrap();
    let transaction_bytes = hex::decode(transaction_hex.split('|').next().unwrap()).unwrap();
    let built_transaction =
      cml_chain::transaction::Transaction::from_cbor_bytes(&transaction_bytes).unwrap();
    let review: serde_json::Value = serde_json::from_str(
      &super::transaction_review_info_json(transaction_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(review["body"]["inputs"].as_array().unwrap().len(), 2);
    assert_eq!(review["body"]["referenceInputs"].as_array().unwrap().len(), 1);
    assert_eq!(review["body"]["collateralInputs"].as_array().unwrap().len(), 1);
    assert_eq!(review["body"]["totalCollateral"], "1000000");
    assert_eq!(review["body"]["collateralReturn"]["lovelace"], "4000000");
    assert!(review["body"]["scriptDataHashHex"].is_string());
    assert_eq!(review["body"]["ttl"], "1000");
    assert_eq!(review["auxiliaryData"]["metadata"][0]["label"], "674");
    assert_eq!(review["body"]["certificates"].as_array().unwrap().len(), 1);
    assert_eq!(review["body"]["withdrawals"][0]["amount"], "3500000");
    assert_eq!(review["body"]["outputs"][0]["datum"]["kind"], "hash");

    let mut inline_script_recipe: serde_json::Value = serde_json::from_str(&recipe).unwrap();
    inline_script_recipe["scriptInputs"][0]["inlineScriptCborHex"] =
      serde_json::json!(hex::encode(&script_bytes));
    inline_script_recipe["scriptInputs"][0].as_object_mut().unwrap().remove("referenceScript");
    inline_script_recipe["scriptInputs"][0].as_object_mut().unwrap().remove("scriptHashHex");
    let inline_script_tx_hex =
      build_transaction_recipe_cml_hex(&inline_script_recipe.to_string()).unwrap();
    let inline_script_bytes = hex::decode(inline_script_tx_hex.split('|').next().unwrap()).unwrap();
    let inline_script_tx =
      cml_chain::transaction::Transaction::from_cbor_bytes(&inline_script_bytes).unwrap();
    let inline_script_review: serde_json::Value = serde_json::from_str(
      &transaction_review_info_json(inline_script_tx_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert!(inline_script_tx.witness_set.plutus_v3_scripts.is_some());
    assert!(inline_script_review["body"]["referenceInputs"].is_null());
    assert!(inline_script_review["body"]["scriptDataHashHex"].is_string());

    // The old app path uses `newWithoutDatum` when an inline script has no
    // explicit datum source. Keep that distinct from an inline datum stored
    // on the spent output.
    let mut no_datum_recipe = inline_script_recipe.clone();
    no_datum_recipe["scriptInputs"][0]["utxo"]
      .as_object_mut()
      .unwrap()
      .remove("inlineDatumCborHex");
    let no_datum_tx_hex = build_transaction_recipe_cml_hex(&no_datum_recipe.to_string()).unwrap();
    let no_datum_tx = cml_chain::transaction::Transaction::from_cbor_bytes(
      &hex::decode(no_datum_tx_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert!(no_datum_tx.witness_set.plutus_datums.is_none());
    assert!(no_datum_tx.witness_set.redeemers.is_some());
    assert!(no_datum_tx.witness_set.plutus_v3_scripts.is_some());

    let byron_address = "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3";
    let byron_address_hex =
      hex::encode(super::parse_payment_address(byron_address).unwrap().to_raw_bytes());
    let key_address_hex =
      hex::encode(super::parse_payment_address(key_address).unwrap().to_raw_bytes());
    let script_address_hex =
      hex::encode(super::parse_payment_address(&script_address).unwrap().to_raw_bytes());
    let mut byron_inline_recipe = inline_script_recipe.clone();
    byron_inline_recipe["inputs"][0]["address"] = serde_json::json!(byron_address);
    byron_inline_recipe["inputs"][0]["addressHex"] = serde_json::json!(byron_address_hex.clone());
    byron_inline_recipe["inputs"][0]["isBootstrap"] = serde_json::json!(true);
    byron_inline_recipe["scriptInputs"][0]["utxo"]["addressHex"] =
      serde_json::json!(script_address_hex.clone());
    byron_inline_recipe["scriptInputs"][0]["utxo"]["isBootstrap"] = serde_json::json!(false);
    byron_inline_recipe["collateralInputs"][0]["addressHex"] =
      serde_json::json!(key_address_hex.clone());
    byron_inline_recipe["collateralInputs"][0]["isBootstrap"] = serde_json::json!(false);
    let byron_tx_hex = build_transaction_recipe_cml_hex(&byron_inline_recipe.to_string()).unwrap();
    let byron_transaction = cml_chain::transaction::Transaction::from_cbor_bytes(
      &hex::decode(byron_tx_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(byron_transaction.body.inputs.len(), 2);
    assert!(byron_transaction.body.fee > 155381);
    byron_inline_recipe["inputs"][0]["addressHex"] = serde_json::json!(key_address_hex);
    assert!(build_transaction_recipe_cml_hex(&byron_inline_recipe.to_string())
      .unwrap_err()
      .contains("address and addressHex"));

    let mint_script_bytes = vec![2, 0, 0];
    let mint_script =
      Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(mint_script_bytes.clone()));
    let mint_policy_id = hex::encode(mint_script.hash().to_raw_bytes());
    let mut mint_recipe: serde_json::Value = serde_json::from_str(&recipe).unwrap();
    mint_recipe["protocolParams"]["plutusV2CostModel"] = serde_json::json!([0]);
    mint_recipe["mints"] = serde_json::json!([{
      "policyIdHex": mint_policy_id,
      "scriptType": "plutusV2",
      "scriptCborHex": hex::encode(&mint_script_bytes),
      "redeemerCborHex": "d87980",
      "redeemerMem": "100",
      "redeemerSteps": "200",
      "assets": [{"assetNameHex":"01ff","quantity":"3"}]
    }]);
    let mint_tx_hex = build_transaction_recipe_cml_hex(&mint_recipe.to_string()).unwrap();
    let mint_tx_bytes = hex::decode(mint_tx_hex.split('|').next().unwrap()).unwrap();
    let mint_tx = cml_chain::transaction::Transaction::from_cbor_bytes(&mint_tx_bytes).unwrap();
    let mint_review: serde_json::Value = serde_json::from_str(
      &transaction_review_info_json(mint_tx_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(mint_review["body"]["mint"][&mint_policy_id]["01ff"], "3");
    assert!(mint_tx.witness_set.redeemers.is_some());
    assert!(mint_tx.witness_set.plutus_v2_scripts.is_some());
    assert!(mint_tx.body.script_data_hash.is_some());

    let large_quantity = "9007199254740993";
    let mut large_mint_recipe = mint_recipe.clone();
    large_mint_recipe["mints"][0]["assets"][0]["quantity"] =
      serde_json::Value::String(large_quantity.to_owned());
    let large_mint = build_transaction_recipe_cml_hex(&large_mint_recipe.to_string()).unwrap();
    let large_mint_cbor = large_mint.split('|').next().unwrap();
    let large_mint_review: serde_json::Value =
      serde_json::from_str(&transaction_review_info_json(large_mint_cbor).unwrap()).unwrap();
    assert_eq!(
      large_mint_review["body"]["mint"][&mint_policy_id]["01ff"],
      serde_json::Value::String(large_quantity.to_owned()),
    );
    let mut reference_mint_recipe = mint_recipe.clone();
    reference_mint_recipe["mints"][0]["referenceInput"] = serde_json::json!({
      "txHashHex": "05".repeat(32),
      "index": "1",
      "address": key_address,
      "lovelace": "2000000",
      "assets": [],
      "referenceScript": {
        "hash": mint_policy_id,
        "scriptType": "plutusV2",
        "size": 3,
        "bytes": hex::encode(&mint_script_bytes)
      }
    });
    let reference_mint_hex =
      build_transaction_recipe_cml_hex(&reference_mint_recipe.to_string()).unwrap();
    let reference_mint_bytes = hex::decode(reference_mint_hex.split('|').next().unwrap()).unwrap();
    let reference_mint_tx =
      cml_chain::transaction::Transaction::from_cbor_bytes(&reference_mint_bytes).unwrap();
    assert_eq!(reference_mint_tx.body.reference_inputs.as_ref().unwrap().len(), 2);
    assert!(reference_mint_tx.witness_set.plutus_v2_scripts.is_none());
    assert!(reference_mint_tx.witness_set.redeemers.is_some());
    let mut mint_only_recipe = mint_recipe.clone();
    mint_only_recipe["scriptInputs"] = serde_json::json!([]);
    let mint_only_hex = build_transaction_recipe_cml_hex(&mint_only_recipe.to_string()).unwrap();
    let mint_only_tx = cml_chain::transaction::Transaction::from_cbor_bytes(
      &hex::decode(mint_only_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(mint_only_tx.body.inputs.len(), 1);
    assert_eq!(mint_only_tx.body.collateral_inputs.as_ref().unwrap().len(), 1);
    assert!(mint_only_tx.body.mint.is_some());
    assert!(mint_only_tx.body.script_data_hash.is_some());
    assert!(mint_only_tx.witness_set.redeemers.is_some());
    assert!(mint_only_tx.witness_set.plutus_v2_scripts.is_some());
    assert!(mint_only_tx.body.outputs.iter().any(|output| {
      output.amount().multiasset.get(
        &cml_chain::crypto::ScriptHash::from_raw_bytes(&hex::decode(&mint_policy_id).unwrap())
          .unwrap(),
        &cml_chain::assets::AssetName::new(hex::decode("01ff").unwrap()).unwrap(),
      ) == Some(3)
    }));
    // Keep the explicit change fixture isolated from certificate deposits and
    // withdrawals: those are separate ledger balance terms and are covered by
    // the mixed recipe above. This verifies the manual-fee/change contract for
    // the mint-only path without deriving change from a different recipe.
    let mut manual_mint_only_recipe = mint_only_recipe.clone();
    manual_mint_only_recipe["certificates"] = serde_json::json!([]);
    manual_mint_only_recipe["withdrawals"] = serde_json::json!([]);
    let manual_auto_hex =
      build_transaction_recipe_cml_hex(&manual_mint_only_recipe.to_string()).unwrap();
    let manual_auto_tx = cml_chain::transaction::Transaction::from_cbor_bytes(
      &hex::decode(manual_auto_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    let minted_auto_fee = manual_auto_tx.body.fee;
    let mut explicit_mint_only_recipe = manual_mint_only_recipe.clone();
    explicit_mint_only_recipe["options"]["manualFee"] =
      serde_json::json!((minted_auto_fee + 1_000).to_string());
    explicit_mint_only_recipe["options"]["manualChangeOutput"] = serde_json::json!({
      "address": key_address,
      "lovelace": (10_000_000u64 - 2_000_000 - minted_auto_fee - 1_000).to_string(),
      "assets": [{"policyIdHex": mint_policy_id, "assetNameHex": "01ff", "quantity": "3"}],
      "datum": {"kind": "hash", "hex": "bb".repeat(32)},
    });
    let explicit_mint_hex =
      build_transaction_recipe_cml_hex(&explicit_mint_only_recipe.to_string()).unwrap();
    let explicit_mint_tx = cml_chain::transaction::Transaction::from_cbor_bytes(
      &hex::decode(explicit_mint_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(explicit_mint_tx.body.fee, minted_auto_fee + 1_000);
    assert_eq!(explicit_mint_tx.body.outputs.len(), 2);
    let explicit_review: serde_json::Value = serde_json::from_str(
      &transaction_review_info_json(explicit_mint_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(
      explicit_review["body"]["outputs"][1]["lovelace"],
      (10_000_000u64 - 2_000_000 - minted_auto_fee - 1_000).to_string()
    );
    assert_eq!(explicit_review["body"]["outputs"][1]["assets"][0]["quantity"], "3");
    assert_eq!(explicit_review["body"]["outputs"][1]["assets"][0]["policyIdHex"], mint_policy_id);
    assert_eq!(explicit_review["body"]["outputs"][1]["datum"]["kind"], "hash");
    // Match the old builder's value distribution: mint residuals go to
    // change, while burns consume input assets before change is calculated.
    // Frozen semantic oracle captured with CSL Node 14.1.2's
    // `set_mint` + `add_change_if_needed`: a +3 mint with 1 sent yields 1 in
    // the requested output and 2 in change; a -3 burn against 5 input with 2
    // sent yields 2 in the requested output and no asset change.
    let mut positive_mint_distribution = manual_mint_only_recipe.clone();
    positive_mint_distribution["outputs"][0]["assets"] = serde_json::json!([{
      "policyIdHex": mint_policy_id,
      "assetNameHex": "01ff",
      "quantity": "1"
    }]);
    let positive_mint_tx = cml_chain::transaction::Transaction::from_cbor_bytes(
      &hex::decode(
        build_transaction_recipe_cml_hex(&positive_mint_distribution.to_string())
          .unwrap()
          .split('|')
          .next()
          .unwrap(),
      )
      .unwrap(),
    )
    .unwrap();
    let policy =
      cml_chain::crypto::ScriptHash::from_raw_bytes(&hex::decode(&mint_policy_id).unwrap())
        .unwrap();
    let asset = cml_chain::assets::AssetName::new(hex::decode("01ff").unwrap()).unwrap();
    let positive_asset_total = positive_mint_tx
      .body
      .outputs
      .iter()
      .map(|output| output.amount().multiasset.get(&policy, &asset).unwrap_or_default())
      .sum::<u64>();
    assert_eq!(positive_mint_tx.body.outputs[0].amount().multiasset.get(&policy, &asset), Some(1));
    assert_eq!(positive_mint_tx.body.outputs[1].amount().multiasset.get(&policy, &asset), Some(2));
    assert_eq!(positive_asset_total, 3);

    let mut burn_distribution = manual_mint_only_recipe.clone();
    burn_distribution["inputs"][0]["assets"] = serde_json::json!([{
      "policyIdHex": mint_policy_id,
      "assetNameHex": "01ff",
      "quantity": "5"
    }]);
    burn_distribution["outputs"][0]["assets"] = serde_json::json!([{
      "policyIdHex": mint_policy_id,
      "assetNameHex": "01ff",
      "quantity": "2"
    }]);
    burn_distribution["mints"][0]["assets"][0]["quantity"] = serde_json::json!("-3");
    let burn_tx = cml_chain::transaction::Transaction::from_cbor_bytes(
      &hex::decode(
        build_transaction_recipe_cml_hex(&burn_distribution.to_string())
          .unwrap()
          .split('|')
          .next()
          .unwrap(),
      )
      .unwrap(),
    )
    .unwrap();
    let burn_asset_total = burn_tx
      .body
      .outputs
      .iter()
      .map(|output| output.amount().multiasset.get(&policy, &asset).unwrap_or_default())
      .sum::<u64>();
    assert_eq!(burn_tx.body.outputs[0].amount().multiasset.get(&policy, &asset), Some(2));
    assert_eq!(burn_tx.body.outputs[1].amount().multiasset.get(&policy, &asset), None);
    assert_eq!(burn_asset_total, 2);
    let mut signed_mint_only = mint_only_tx.clone();
    signed_mint_only.witness_set.vkeywitnesses = Some(
      vec![Vkeywitness::new(
        cml_crypto::PublicKey::from_raw_bytes(&[0; 32]).unwrap(),
        cml_crypto::Ed25519Signature::from_raw_bytes(&[0; 64]).unwrap(),
      )]
      .into(),
    );
    let mint_only_minimum = 44u64 * signed_mint_only.to_cbor_bytes().len() as u64
      + 155_381
      + cml_chain::fees::min_script_fee(
        &mint_only_tx,
        &cml_chain::plutus::ExUnitPrices::new(
          cml_chain::Rational::new(577, 10_000),
          cml_chain::Rational::new(721, 10_000_000),
        ),
      )
      .unwrap();
    assert!(mint_only_tx.body.fee >= mint_only_minimum);
    let mut reference_mint_only_recipe = reference_mint_recipe.clone();
    reference_mint_only_recipe["scriptInputs"] = serde_json::json!([]);
    let reference_mint_only_hex =
      build_transaction_recipe_cml_hex(&reference_mint_only_recipe.to_string()).unwrap();
    let reference_mint_only_tx = cml_chain::transaction::Transaction::from_cbor_bytes(
      &hex::decode(reference_mint_only_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(reference_mint_only_tx.body.reference_inputs.as_ref().unwrap().len(), 1);
    assert!(reference_mint_only_tx.body.mint.is_some());
    assert!(reference_mint_only_tx.witness_set.plutus_v2_scripts.is_none());
    assert!(reference_mint_only_tx.witness_set.redeemers.is_some());
    assert!(reference_mint_only_tx.body.fee > mint_only_tx.body.fee);
    let mut signed_reference_mint_only = reference_mint_only_tx.clone();
    signed_reference_mint_only.witness_set.vkeywitnesses = Some(
      vec![Vkeywitness::new(
        cml_crypto::PublicKey::from_raw_bytes(&[0; 32]).unwrap(),
        cml_crypto::Ed25519Signature::from_raw_bytes(&[0; 64]).unwrap(),
      )]
      .into(),
    );
    let reference_mint_only_minimum = 44u64
      * signed_reference_mint_only.to_cbor_bytes().len() as u64
      + 155_381
      + cml_chain::fees::min_script_fee(
        &reference_mint_only_tx,
        &cml_chain::plutus::ExUnitPrices::new(
          cml_chain::Rational::new(577, 10_000),
          cml_chain::Rational::new(721, 10_000_000),
        ),
      )
      .unwrap()
      + calculate_reference_script_fee(3, 15, 1, 25_600, "1.2").unwrap();
    assert!(reference_mint_only_tx.body.fee >= reference_mint_only_minimum);
    // Check the fee against a signed-size transaction, not the builder's
    // provisional size estimate. The two required vkeys are the payment input
    // (also used by collateral) and stake withdrawal credential; the script
    // spend uses one Plutus redeemer and a 3-byte reference script.
    let mut signed_size_transaction = built_transaction.clone();
    let dummy_vkey = cml_crypto::PublicKey::from_raw_bytes(&[0; 32]).unwrap();
    let dummy_signature = cml_crypto::Ed25519Signature::from_raw_bytes(&[0; 64]).unwrap();
    signed_size_transaction.witness_set.vkeywitnesses = Some(
      vec![
        Vkeywitness::new(dummy_vkey.clone(), dummy_signature.clone()),
        Vkeywitness::new(dummy_vkey, dummy_signature),
      ]
      .into(),
    );
    let signed_size = signed_size_transaction.to_cbor_bytes().len() as u64;
    assert_eq!(signed_size, 801);
    let actual_linear_fee = 44u64 * signed_size + 155_381;
    let script_fee = cml_chain::fees::min_script_fee(
      &built_transaction,
      &cml_chain::plutus::ExUnitPrices::new(
        cml_chain::Rational::new(577, 10_000),
        cml_chain::Rational::new(721, 10_000_000),
      ),
    )
    .unwrap();
    let reference_script_fee = calculate_reference_script_fee(3, 15, 1, 25_600, "1.2").unwrap();
    let serialized_tx_minimum = actual_linear_fee + script_fee + reference_script_fee;
    assert_eq!(serialized_tx_minimum, 260_625);
    assert!(
      built_transaction.body.fee >= serialized_tx_minimum,
      "fee {} is below {} from signed serialized size {} + script fee {} + reference script fee {}",
      built_transaction.body.fee,
      serialized_tx_minimum,
      signed_size,
      script_fee,
      reference_script_fee,
    );
    assert!(built_transaction.witness_set.vkeywitnesses.is_none());
    assert!(built_transaction.witness_set.bootstrap_witnesses.is_none());
    assert!(built_transaction.witness_set.redeemers.is_some());
    let automatic_change = review["body"]["outputs"].as_array().unwrap().last().unwrap().clone();
    let mut explicit_change_recipe: serde_json::Value = serde_json::from_str(&recipe).unwrap();
    let automatic_fee = review["body"]["fee"].as_str().unwrap().parse::<u64>().unwrap();
    let fee_delta = 1_000u64;
    explicit_change_recipe["options"]["manualFee"] =
      serde_json::json!((automatic_fee + fee_delta).to_string());
    explicit_change_recipe["options"]["manualChangeOutput"] = serde_json::json!({
      "address": automatic_change["address"],
      "lovelace": (automatic_change["lovelace"].as_str().unwrap().parse::<u64>().unwrap() - fee_delta).to_string(),
      "assets": automatic_change["assets"],
    });
    let explicit_tx =
      build_transaction_recipe_cml_hex(&explicit_change_recipe.to_string()).unwrap();
    let explicit_review: serde_json::Value = serde_json::from_str(
      &super::transaction_review_info_json(explicit_tx.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(explicit_review["body"]["fee"], (automatic_fee + fee_delta).to_string());
    assert_eq!(
      explicit_review["body"]["outputs"][1]["lovelace"],
      (automatic_change["lovelace"].as_str().unwrap().parse::<u64>().unwrap() - fee_delta)
        .to_string(),
    );

    explicit_change_recipe["options"].as_object_mut().unwrap().remove("manualFee");
    let residual_fee_tx =
      build_transaction_recipe_cml_hex(&explicit_change_recipe.to_string()).unwrap();
    let residual_fee_review: serde_json::Value = serde_json::from_str(
      &super::transaction_review_info_json(residual_fee_tx.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(residual_fee_review["body"]["fee"], (automatic_fee + fee_delta).to_string());

    // The app's Conway-era credential and DRep certificate variants stay
    // representable alongside Plutus spends and withdrawals.
    let mut governance_recipe: serde_json::Value = serde_json::from_str(&recipe).unwrap();
    governance_recipe["certificates"] = serde_json::json!([
      {"kind":"StakeRegistration","stakeCredentialKeyHashHex":stake_hash_hex},
      {"kind":"PoolRetirement","poolKeyHash":"bb".repeat(28),"epoch":"42"},
      {"kind":"CommitteeHotAuth","coldCredential":{"kind":"key","hashHex":"cc".repeat(28)},"hotCredential":{"kind":"script","hashHex":"dd".repeat(28)}},
      {"kind":"CommitteeColdResign","coldCredential":{"kind":"key","hashHex":"ee".repeat(28)},"anchor":{"url":"https://example.test/constitution.json","dataHashHex":"ff".repeat(32)}},
      {"kind":"DRepRegistration","credential":{"kind":"key","hashHex":"11".repeat(28)},"deposit":"500000000","anchor":{"url":"https://example.test/drep.json","dataHashHex":"22".repeat(32)}},
      {"kind":"DRepDeregistration","credential":{"kind":"key","hashHex":"33".repeat(28)},"deposit":"500000000"},
      {"kind":"DRepUpdate","credential":{"kind":"key","hashHex":"44".repeat(28)}}
    ]);
    let governance_tx = build_transaction_recipe_cml_hex(&governance_recipe.to_string()).unwrap();
    let governance_review: serde_json::Value = serde_json::from_str(
      &transaction_review_info_json(governance_tx.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(governance_review["body"]["certificates"].as_array().unwrap().len(), 7);

    let mut invalid_collateral: serde_json::Value = serde_json::from_str(&recipe).unwrap();
    invalid_collateral["totalCollateral"] = serde_json::json!("1000001");
    assert!(build_transaction_recipe_cml_hex(&invalid_collateral.to_string())
      .unwrap_err()
      .contains("collateral inputs must equal total collateral plus collateral return"));
  }

  #[test]
  fn native_mint_change_matches_frozen_csl_body_for_mint_and_burn() {
    use cml_chain::crypto::Vkeywitness;
    use cml_chain::{
      serialization::{Deserialize, Serialize},
      transaction::Transaction,
    };
    use cml_crypto::RawBytesEncoding;
    const ADDRESS: &str = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    const POLICY: &str = "ed67591f9f6bb0860f89d300936e8ceed1b71cac3f4633e993a3b8ad";
    const SCRIPT: &str = "8200581cabababababababababababababababababababababababababababab";
    const POSITIVE_CSL_BODY: &str = "a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf821a001e8480a1581ced67591f9f6bb0860f89d300936e8ceed1b71cac3f4633e993a3b8ada14200ff01825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf821a007754afa1581ced67591f9f6bb0860f89d300936e8ceed1b71cac3f4633e993a3b8ada14200ff02021a0002bd51031a0001e24009a1581ced67591f9f6bb0860f89d300936e8ceed1b71cac3f4633e993a3b8ada14200ff03";
    const BURN_CSL_BODY: &str = "a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf821a001e8480a1581ced67591f9f6bb0860f89d300936e8ceed1b71cac3f4633e993a3b8ada14200ff02825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00775b0b021a0002b6f5031a0001e24009a1581ced67591f9f6bb0860f89d300936e8ceed1b71cac3f4633e993a3b8ada14200ff22";

    let recipe = |input_assets: serde_json::Value, output_quantity: &str, mint_quantity: &str| {
      serde_json::json!({
        "protocolParams": {
          "linearFee":{"coefficient":"44","constant":"155381"},
          "coinsPerUtxoByte":"4310","keyDeposit":"2000000","poolDeposit":"500000000",
          "maxValueSize":"5000","maxTxSize":"16384"
        },
        "inputs":[{"txHashHex":"01".repeat(32),"index":"0","address":ADDRESS,"lovelace":"10000000","assets":input_assets}],
        "outputs":[{"address":ADDRESS,"lovelace":"2000000","assets":[{"policyIdHex":POLICY,"assetNameHex":"00ff","quantity":output_quantity}]}],
        "referenceInputs":[],"scriptInputs":[],"collateralInputs":[],"certificates":[],"withdrawals":[],"metadata":[],
        "mints":[{"policyIdHex":POLICY,"scriptType":"native","scriptCborHex":SCRIPT,"assets":[{"assetNameHex":"00ff","quantity":mint_quantity}]}],
        "options":{"changeAddress":ADDRESS,"ttl":"123456"}
      })
    };

    let positive =
      build_transaction_recipe_cml_hex(&recipe(serde_json::json!([]), "1", "3").to_string())
        .unwrap();
    let positive_tx =
      Transaction::from_cbor_bytes(&hex::decode(positive.split('|').next().unwrap()).unwrap())
        .unwrap();
    assert_eq!(positive_tx.body.outputs.len(), 2);
    assert_eq!(positive_tx.body.outputs[0].amount().coin, 2_000_000);
    assert_eq!(positive_tx.body.outputs[1].amount().coin, 7_820_463);
    assert_eq!(positive_tx.body.fee, 179_537);
    assert_eq!(hex::encode(positive_tx.body.to_cbor_bytes()), POSITIVE_CSL_BODY);
    let mut signed_positive_tx = positive_tx.clone();
    signed_positive_tx.witness_set.vkeywitnesses = Some(
      vec![
        Vkeywitness::new(
          cml_crypto::PublicKey::from_raw_bytes(&[0; 32]).unwrap(),
          cml_crypto::Ed25519Signature::from_raw_bytes(&[0; 64]).unwrap(),
        ),
        Vkeywitness::new(
          cml_crypto::PublicKey::from_raw_bytes(&[1; 32]).unwrap(),
          cml_crypto::Ed25519Signature::from_raw_bytes(&[1; 64]).unwrap(),
        ),
      ]
      .into(),
    );
    let positive_minimum = 44 * signed_positive_tx.to_cbor_bytes().len() as u64 + 155_381;
    assert!(positive_tx.body.fee >= positive_minimum);

    let burn = build_transaction_recipe_cml_hex(
      &recipe(
        serde_json::json!([{"policyIdHex":POLICY,"assetNameHex":"00ff","quantity":"5"}]),
        "2",
        "-3",
      )
      .to_string(),
    )
    .unwrap();
    let burn_tx =
      Transaction::from_cbor_bytes(&hex::decode(burn.split('|').next().unwrap()).unwrap()).unwrap();
    assert_eq!(burn_tx.body.outputs.len(), 2);
    assert_eq!(burn_tx.body.fee, 177_909);
    assert_eq!(hex::encode(burn_tx.body.to_cbor_bytes()), BURN_CSL_BODY);
    let mut signed_burn_tx = burn_tx.clone();
    signed_burn_tx.witness_set.vkeywitnesses = Some(
      vec![
        Vkeywitness::new(
          cml_crypto::PublicKey::from_raw_bytes(&[0; 32]).unwrap(),
          cml_crypto::Ed25519Signature::from_raw_bytes(&[0; 64]).unwrap(),
        ),
        Vkeywitness::new(
          cml_crypto::PublicKey::from_raw_bytes(&[1; 32]).unwrap(),
          cml_crypto::Ed25519Signature::from_raw_bytes(&[1; 64]).unwrap(),
        ),
      ]
      .into(),
    );
    let burn_minimum = 44 * signed_burn_tx.to_cbor_bytes().len() as u64 + 155_381;
    assert!(burn_tx.body.fee >= burn_minimum);
  }

  const UNSIGNED_TRANSACTION_HEX: &str = "84a300d90102800180021a000f4240a0f5f6";
  const PRIVATE_KEY_HEX: &str = "1111111111111111111111111111111111111111111111111111111111111111";
  const SIGNED_TRANSACTION_HEX: &str = "84a300d90102800180021a000f4240a100d9010281825820d04ab232742bb4ab3a1368bd4615e4e6d0224ab71a016baf8520a332c97787375840489701c384e7437b286ca82f3279ac068b446e2416827ccabede352c4fd6843184dda82a97e499ec7c74007c7966786106ab6d899fd00c9f5b7a4498e9930a05f5f6";

  #[test]
  fn signed_transaction_bytes_match_frozen_vector() {
    assert_eq!(
      sign_transaction_hex(UNSIGNED_TRANSACTION_HEX, PRIVATE_KEY_HEX).unwrap(),
      SIGNED_TRANSACTION_HEX
    );
  }

  #[test]
  fn cml_wallet_derivation_and_signing_match_csl_for_account_and_stake_paths() {
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

    assert_eq!(cml_signed, "84a300d90102800180021a000f4240a100d9010282825820da89a3daa2c8472a1d9d38877d4e6b2215435257b8557e2f1a2ffd6c24dff04758400e1cc22c7bcfd0a8d7e3080833863ecdb14d37d108018ab981684d8ff1b1652b105bc26b72a14e19a09804238cf1156fd5ad63e3afcabb2770282c5fa1d5890982582012828d77dc0165e1f4f22db75e30b5d1e6147b31fcb2ac765108dc6f0aba914f5840e81a5560a0380d5f47914f6eb28ded3efda5fd73576e6ff5dcbe896e219cf1086b05717707c607a6e66cc3bc472a76bf7f9a9f198221ed5f4b6216a0d7eafa0bf5f6");
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
  fn wallet_root_key_from_entropy_matches_frozen_vector() {
    use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};

    let entropy = [0x11_u8; 16];
    let cml_key = Bip32PrivateKey::from_bip39_entropy(&entropy, b"");
    let actual = wallet_root_key_hex_from_entropy(&hex::encode(entropy)).unwrap();
    assert_eq!(actual, "789baf867d07a3ab819e4a28b0639a29611c6d87cb381ae5a7f265c234a8785d86842032c8c1eb143d7be93358701495a6402e88c5fb3346801ac8585fc286cbcc9dbd2223bfaac220dc66aa6dd54c04590227b39e448bc24efc730b176b8e48");
    assert_eq!(hex::decode(&actual).unwrap(), cml_key.to_raw_bytes());
  }

  #[test]
  fn wallet_root_key_rejects_invalid_entropy_length() {
    assert!(wallet_root_key_hex_from_entropy("010203").unwrap_err().contains("BIP39 entropy"));
  }

  #[test]
  fn account_public_key_derivation_matches_frozen_vector() {
    let entropy = [0x11_u8; 16];
    use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};
    let root = Bip32PrivateKey::from_bip39_entropy(&entropy, b"");
    let root_hex = hex::encode(root.to_raw_bytes());
    let args = serde_json::json!({
      "masterKeyHex": root_hex,
      "purpose": "2147485500",
      "coinType": "2147485463",
      "accountIndex": "0",
    })
    .to_string();
    assert_eq!(derive_account_public_key_hex(&args).unwrap(), "7767e22b7620f192e95c11043ea60e727a2b7c6e73d669d25829aece22dac23dba6ca30fb658503e5de84d07a27ef8dc215e05ba228ab41ab857f82b280f7398");
  }

  #[test]
  fn wallet_path_signing_matches_frozen_multi_signer_vector() {
    use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};

    let entropy = [0x11_u8; 16];
    let root = Bip32PrivateKey::from_bip39_entropy(&entropy, b"");
    let paths = vec![
      vec![2_147_485_500_u32, 2_147_485_463, 0x8000_0007, 0, 3],
      vec![2_147_485_500_u32, 2_147_485_463, 0x8000_0007, 2, 0],
    ];
    let args = serde_json::json!({
      "transactionHex": UNSIGNED_TRANSACTION_HEX,
      "masterKeyHex": hex::encode(root.to_raw_bytes()),
      "signerPaths": paths,
    })
    .to_string();

    assert_eq!(sign_wallet_transaction_paths_hex(&args).unwrap(), "84a300d90102800180021a000f4240a100d9010282825820e521dbb738431b454f5967e47f11c689ba0e3ad70bbdc2d5042ab078ebac3366584017c9fafa54a38f5afe8ef7c1d22bd8cd4ade630fbb4428560f421e7fa6436bbb585fbcc073ec4edc393b77fdfa769af3bd9b8706b4445c1b46423a6e85c9900082582012828d77dc0165e1f4f22db75e30b5d1e6147b31fcb2ac765108dc6f0aba914f5840e81a5560a0380d5f47914f6eb28ded3efda5fd73576e6ff5dcbe896e219cf1086b05717707c607a6e66cc3bc472a76bf7f9a9f198221ed5f4b6216a0d7eafa0bf5f6");
  }

  #[test]
  fn wallet_data_signature_and_public_key_match_frozen_vectors() {
    use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};
    let entropy = [0x11_u8; 16];
    let root = Bip32PrivateKey::from_bip39_entropy(&entropy, b"");
    let path = vec![2_147_485_500_u32, 2_147_485_463, 0x8000_0007, 0, 3];
    let message = b"CIP-8 COSE Sig_structure fixture";
    let args = serde_json::json!({
      "messageHex": hex::encode(message),
      "masterKeyHex": hex::encode(root.to_raw_bytes()),
      "signerPath": path,
    })
    .to_string();
    let result: serde_json::Value =
      serde_json::from_str(&sign_wallet_data(&args).unwrap()).unwrap();
    assert_eq!(result["signatureHex"], "793b3ba5128d0ba85afa5a766d86342436027826227e1af047cc1c45ecadc245cdd01e6cea2a47035ab4b610c63d919e3b52182620e03947d8910a973908da02");
    assert_eq!(
      result["publicKeyHex"],
      "e521dbb738431b454f5967e47f11c689ba0e3ad70bbdc2d5042ab078ebac3366"
    );
  }

  #[test]
  fn transaction_id_matches_frozen_body_hash() {
    assert_eq!(
      transaction_id_hex(UNSIGNED_TRANSACTION_HEX).unwrap(),
      "df1348c147835fdeae9d1838feede0bc56d337fe9794729b554fc5f76c6e05b4",
    );
  }

  #[test]
  fn transaction_validation_info_matches_frozen_fixture_and_rejects_bad_cbor() {
    let actual: serde_json::Value =
      serde_json::from_str(&transaction_validation_info_json(UNSIGNED_TRANSACTION_HEX).unwrap())
        .unwrap();
    assert_eq!(actual["inputsCount"], 0);
    assert_eq!(actual["outputsCount"], 0);
    assert_eq!(actual["fee"], "1000000");
    assert!(actual["ttl"].is_null());
    assert!(transaction_validation_info_json("zz")
      .unwrap_err()
      .contains("invalid transaction hex"));
    assert!(transaction_validation_info_json("ff")
      .unwrap_err()
      .contains("invalid transaction CBOR"));
  }

  #[test]
  fn transaction_review_info_preserves_sections_and_string_quantities() {
    let actual: serde_json::Value =
      serde_json::from_str(&transaction_review_info_json(UNSIGNED_TRANSACTION_HEX).unwrap())
        .unwrap();
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
    let output =
      cml_chain::transaction::TransactionOutput::new(byron, cml_chain::Value::zero(), None, None);
    assert_eq!(review_output_json(&output)["address"], address);
  }

  #[test]
  fn cml_witness_set_extraction_matches_frozen_bytes() {
    assert_eq!(
      transaction_witness_set_hex(SIGNED_TRANSACTION_HEX).unwrap(),
      "a100d9010281825820d04ab232742bb4ab3a1368bd4615e4e6d0224ab71a016baf8520a332c97787375840489701c384e7437b286ca82f3279ac068b446e2416827ccabede352c4fd6843184dda82a97e499ec7c74007c7966786106ab6d899fd00c9f5b7a4498e9930a05",
    );
    assert!(transaction_witness_set_hex("ff").unwrap_err().contains("invalid transaction CBOR"));
  }

  #[test]
  fn reference_script_fee_matches_tiered_golden_vectors() {
    for (size, expected) in [
      (1u64, 15u64),
      (6278, 94170),
      (25599, 383985),
      (25600, 384000),
      (25601, 384018),
      (51200, 844800),
      (70000, 1250880),
    ] {
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
    use cml_chain::serialization::{Deserialize, Serialize};
    use cml_chain::transaction::Transaction;
    use cml_chain::{plutus::PlutusV3Script, Script};
    use cml_crypto::RawBytesEncoding;

    let script_bytes = vec![1, 0, 0];
    let cml_script = Script::new_plutus_v3(PlutusV3Script::new(script_bytes.clone()));
    let script_hash_hex = hex::encode(cml_script.hash().to_raw_bytes());
    let key_address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let script_address = cml_chain::address::EnterpriseAddress::new(
      0,
      cml_chain::certs::Credential::new_script(
        cml_chain::crypto::ScriptHash::from_raw_bytes(&hex::decode(&script_hash_hex).unwrap())
          .unwrap(),
      ),
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

    let review: serde_json::Value =
      serde_json::from_str(&transaction_review_info_json(&hex::encode(&cml_cbor)).unwrap())
        .unwrap();
    assert_eq!(review["body"]["inputs"].as_array().unwrap().len(), 2);
    assert_eq!(review["body"]["referenceInputs"].as_array().unwrap().len(), 1);
    assert_eq!(review["body"]["collateralInputs"].as_array().unwrap().len(), 1);
    assert_eq!(review["body"]["totalCollateral"], "1000000");
    assert_eq!(review["body"]["collateralReturn"]["lovelace"], "4000000");
    assert!(review["body"]["scriptDataHashHex"].is_string());
    let decoded = Transaction::from_cbor_bytes(&cml_cbor).unwrap();
    assert!(decoded.witness_set.redeemers.is_some());
    assert_ne!(review["witnessSet"]["cborHex"], "a0");
    assert!(review["body"]["fee"].as_str().unwrap().parse::<u64>().unwrap() > 155381);
  }

  #[test]
  fn inline_plutus_spend_without_datum_matches_frozen_csl_body_and_witnesses() {
    use cml_chain::serialization::{Deserialize, Serialize};
    use cml_chain::transaction::Transaction;
    use cml_chain::Script;
    use cml_crypto::RawBytesEncoding;

    // Frozen from CSL 14.1.2's TransactionBuilder using
    // PlutusWitness.newWithoutDatum(script, redeemer). The source UTxO has no
    // datum; this is the legacy inline-script/no-datum contract.
    const CSL_BODY_HEX: &str = "a900d90102828258200101010101010101010101010101010101010101010101010101010101010101008258200303030303030303030303030303030303030303030303030303030303030303000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00c294b0021a0003c890031903e80818640b5820ae2b45f41e189930f36f491c1ec677d665ed99b8c54aa463a1a950551fd507ca0dd901028182582004040404040404040404040404040404040404040404040404040404040404040010825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a003d0900111a000f4240";
    const CSL_REDEEMERS_HEX: &str = "a182000082d87980821a000dbba01a0ee6b280";
    const CSL_PLUTUS_V3_SCRIPT_HEX: &str = "43010000";
    const CSL_SCRIPT_DATA_HASH_HEX: &str =
      "ae2b45f41e189930f36f491c1ec677d665ed99b8c54aa463a1a950551fd507ca";
    const CSL_SIGNED_TX_SIZE: usize = 510;

    let key_address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let script_bytes = vec![1, 0, 0];
    let script =
      Script::new_plutus_v3(cml_chain::plutus::PlutusV3Script::new(script_bytes.clone()));
    let script_address = cml_chain::address::EnterpriseAddress::new(
      0,
      cml_chain::certs::Credential::new_script(script.hash()),
    )
    .to_address()
    .to_bech32(None)
    .unwrap();
    let args = serde_json::json!({
      "scriptInput": {"txHashHex": "01".repeat(32), "index": "0", "address": script_address, "lovelace": "5000000", "assets": []},
      "inlineScriptCborHex": hex::encode(&script_bytes),
      "fundingInputs": [{"txHashHex": "03".repeat(32), "index": "0", "address": key_address, "lovelace": "10000000", "assets": []}],
      "collateralInput": {"txHashHex": "04".repeat(32), "index": "0", "address": key_address, "lovelace": "5000000", "assets": []},
      "collateralReturn": {"address": key_address, "lovelace": "4000000", "assets": []},
      "totalCollateral": "1000000",
      "outputs": [{"address": key_address, "lovelace": "2000000", "assets": []}],
      "changeAddress": key_address, "redeemerCborHex": "d87980",
      "redeemerMem": "900000", "redeemerSteps": "250000000", "validityStart": "100", "ttl": "1000",
      "feeCoefficient": "44", "feeConstant": "155381", "coinsPerUtxoByte": "4310",
      "keyDeposit": "2000000", "poolDeposit": "500000000", "maxValueSize": "5000", "maxTxSize": "16384",
      "collateralPercentage": "150", "refScriptCoinsPerByte": {"numerator": "15", "denominator": "1"},
      "refScriptTierStepBytes": "25600", "refScriptMultiplier": "1.2",
      "exUnitPricesMemory": {"numerator": "577", "denominator": "10000"},
      "exUnitPricesSteps": {"numerator": "721", "denominator": "10000000"},
      "plutusVersion": "V3", "plutusV3CostModel": [0]
    }).to_string();

    let tx_hex = build_escrow_redeem_transaction_hex(&args).unwrap();
    let (tx_hex, _) = tx_hex.split_once('|').unwrap();
    let tx = Transaction::from_cbor_bytes(&hex::decode(tx_hex).unwrap()).unwrap();
    let review: serde_json::Value =
      serde_json::from_str(&transaction_review_info_json(tx_hex).unwrap()).unwrap();
    let oracle_body =
      cml_chain::transaction::TransactionBody::from_cbor_bytes(&hex::decode(CSL_BODY_HEX).unwrap())
        .unwrap();
    assert_eq!(tx.body.inputs.to_cbor_bytes(), oracle_body.inputs.to_cbor_bytes());
    assert_eq!(tx.body.outputs[0].to_cbor_bytes(), oracle_body.outputs[0].to_cbor_bytes());
    assert_eq!(
      tx.body.outputs[1].address().to_cbor_bytes(),
      oracle_body.outputs[1].address().to_cbor_bytes()
    );
    assert_eq!(tx.body.outputs[1].amount().multiasset, oracle_body.outputs[1].amount().multiasset);
    assert_eq!(oracle_body.outputs[1].amount().coin + 44, tx.body.outputs[1].amount().coin);
    assert_eq!(tx.body.fee + 44, oracle_body.fee);
    assert_eq!(tx.body.ttl, oracle_body.ttl);
    assert_eq!(tx.body.validity_interval_start, oracle_body.validity_interval_start);
    assert_eq!(
      tx.body.collateral_inputs.as_ref().unwrap().to_cbor_bytes(),
      oracle_body.collateral_inputs.as_ref().unwrap().to_cbor_bytes()
    );
    assert_eq!(tx.body.total_collateral, oracle_body.total_collateral);
    assert_eq!(
      tx.body.collateral_return.as_ref().unwrap().to_cbor_bytes(),
      oracle_body.collateral_return.as_ref().unwrap().to_cbor_bytes()
    );
    let witness_set = &tx.witness_set;
    assert!(witness_set.plutus_datums.is_none());
    assert_eq!(
      hex::encode(witness_set.redeemers.as_ref().unwrap().to_cbor_bytes()),
      CSL_REDEEMERS_HEX
    );
    assert_eq!(
      hex::encode(
        witness_set.plutus_v3_scripts.as_ref().unwrap().iter().next().unwrap().to_cbor_bytes()
      ),
      CSL_PLUTUS_V3_SCRIPT_HEX
    );
    let mut cost_models = cml_chain::plutus::CostModels::default();
    cost_models.inner.insert(2, vec![0]);
    assert_eq!(hex::encode(cost_models.to_cbor_bytes()), "a1028100");
    assert_eq!(review["body"]["scriptDataHashHex"], CSL_SCRIPT_DATA_HASH_HEX);
    assert_eq!(review["body"]["fee"], "247908");
    assert_eq!(script.hash().to_raw_bytes().len(), 28);

    // Both final signed transactions are 510 bytes with the one required
    // payment vkey plus the Plutus script/redeemer witnesses. Their actual
    // ledger minimum is therefore 247,776. The older CSL builder selected
    // 247,952 (176 over minimum); CML selects 247,908 (132 over minimum), a
    // 44-lovelace estimator difference, not an underpayment.
    let mut signed_size_tx = tx.clone();
    signed_size_tx.witness_set.vkeywitnesses = Some(
      vec![cml_chain::crypto::Vkeywitness::new(
        cml_crypto::PublicKey::from_raw_bytes(&[0; 32]).unwrap(),
        cml_crypto::Ed25519Signature::from_raw_bytes(&[0; 64]).unwrap(),
      )]
      .into(),
    );
    let linear_fee = 44 * signed_size_tx.to_cbor_bytes().len() as u64 + 155_381;
    assert_eq!(signed_size_tx.to_cbor_bytes().len(), CSL_SIGNED_TX_SIZE);
    assert_eq!(CSL_SIGNED_TX_SIZE, 510);
    let script_fee = cml_chain::fees::min_script_fee(
      &tx,
      &cml_chain::plutus::ExUnitPrices::new(
        cml_chain::Rational::new(577, 10_000),
        cml_chain::Rational::new(721, 10_000_000),
      ),
    )
    .unwrap();
    assert_eq!(linear_fee, 177_821);
    assert_eq!(script_fee, 69_955);
    assert_eq!(44 * CSL_SIGNED_TX_SIZE as u64 + 155_381 + script_fee, 247_776);
    assert_eq!(247_952u64 - (44 * CSL_SIGNED_TX_SIZE as u64 + 155_381 + script_fee), 176);
    assert_eq!(tx.body.fee, linear_fee + script_fee + 132);
    assert_eq!(tx.body.fee, 247_908);
  }

  #[test]
  fn escrow_plutus_explicit_datum_matches_csl_transaction_cbor() {
    use cml_chain::serialization::{Deserialize, Serialize};
    use cml_chain::transaction::Transaction;
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
      let second_script =
        Script::new_plutus_v2(cml_chain::plutus::PlutusV2Script::new(second_script_bytes.clone()));
      let second_script_hash_hex = hex::encode(second_script.hash().to_raw_bytes());
      let key_address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
      let script_address = cml_chain::address::EnterpriseAddress::new(
        0,
        cml_chain::certs::Credential::new_script(
          cml_chain::crypto::ScriptHash::from_raw_bytes(&hex::decode(&script_hash_hex).unwrap())
            .unwrap(),
        ),
      )
      .to_address()
      .to_bech32(None)
      .unwrap();
      let second_script_address = cml_chain::address::EnterpriseAddress::new(
        0,
        cml_chain::certs::Credential::new_script(
          cml_chain::crypto::ScriptHash::from_raw_bytes(
            &hex::decode(&second_script_hash_hex).unwrap(),
          )
          .unwrap(),
        ),
      )
      .to_address()
      .to_bech32(None)
      .unwrap();
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

      let review: serde_json::Value =
        serde_json::from_str(&transaction_review_info_json(&hex::encode(&cml_cbor)).unwrap())
          .unwrap();
      assert_eq!(review["body"]["inputs"].as_array().unwrap().len(), 3);
      assert_eq!(review["body"]["referenceInputs"].as_array().unwrap().len(), 3);
      assert_eq!(review["body"]["collateralInputs"].as_array().unwrap().len(), 2);
      assert_eq!(review["body"]["totalCollateral"], "1000000");
      assert_eq!(review["body"]["collateralReturn"]["lovelace"], "8000000");
      assert_eq!(review["body"]["collateralReturn"]["assets"][0]["quantity"], "5");
      assert_eq!(review["body"]["validityIntervalStart"], "100");
      assert_eq!(review["body"]["ttl"], "1000");
      assert!(review["body"]["scriptDataHashHex"].is_string());
      let decoded = Transaction::from_cbor_bytes(&cml_cbor).unwrap();
      assert!(decoded.witness_set.redeemers.is_some());
      assert_ne!(review["witnessSet"]["cborHex"], "a0");
      let outputs_coin = review["body"]["outputs"]
        .as_array()
        .unwrap()
        .iter()
        .map(|output| output["lovelace"].as_str().unwrap().parse::<u64>().unwrap())
        .sum::<u64>();
      assert_eq!(
        outputs_coin + review["body"]["fee"].as_str().unwrap().parse::<u64>().unwrap(),
        20_000_000
      );
      assert!(review["body"]["fee"].as_str().unwrap().parse::<u64>().unwrap() > 155381);
      assert_eq!(
        build_escrow_redeem_transaction_hex(&args).unwrap(),
        cml_hex,
        "CML mixed-language serialization is deterministic"
      );

      let mut inline_args: serde_json::Value = serde_json::from_str(&args).unwrap();
      inline_args["inlineScriptCborHex"] = serde_json::json!(hex::encode(&script_bytes));
      inline_args.as_object_mut().unwrap().remove("referenceScriptInput");
      inline_args.as_object_mut().unwrap().remove("referenceScriptCborHex");
      inline_args.as_object_mut().unwrap().remove("referenceScriptSize");
      inline_args.as_object_mut().unwrap().remove("scriptHashHex");
      inline_args["additionalScriptInputs"][0]["inlineScriptCborHex"] =
        serde_json::json!(hex::encode(&second_script_bytes));
      for field in ["referenceScriptInput", "referenceScriptCborHex", "referenceScriptSize"] {
        inline_args["additionalScriptInputs"][0].as_object_mut().unwrap().remove(field);
      }
      inline_args["additionalScriptInputs"][0].as_object_mut().unwrap().remove("scriptHashHex");
      let inline_cml_hex = build_escrow_redeem_transaction_hex(&inline_args.to_string()).unwrap();
      let inline_cbor = hex::decode(inline_cml_hex.split('|').next().unwrap()).unwrap();
      let inline_review: serde_json::Value =
        serde_json::from_str(&transaction_review_info_json(&hex::encode(&inline_cbor)).unwrap())
          .unwrap();
      assert_eq!(inline_review["body"]["referenceInputs"].as_array().unwrap().len(), 1);
      let inline_transaction = Transaction::from_cbor_bytes(&inline_cbor).unwrap();
      assert!(inline_transaction.witness_set.plutus_v2_scripts.is_some());
      assert!(inline_transaction.witness_set.redeemers.is_some());
      match version {
        "V1" => assert!(inline_transaction.witness_set.plutus_v1_scripts.is_some()),
        "V2" => assert!(inline_transaction.witness_set.plutus_v2_scripts.is_some()),
        _ => assert!(inline_transaction.witness_set.plutus_v3_scripts.is_some()),
      }
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
  fn simple_payment_decodes_percent_encoded_asset_separators() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let policy = "ab".repeat(28);
    let assets = format!("{policy}~00ff~1");
    let input = format!("{},0,{address},10000000,{assets}", "01".repeat(32));
    let output = format!("{address},2000000,{assets},-");
    let fields = [
      input,
      output,
      address.to_owned(),
      "123456".to_owned(),
      "44".to_owned(),
      "155381".to_owned(),
      "4310".to_owned(),
      "2000000".to_owned(),
      "500000000".to_owned(),
      "5000".to_owned(),
    ];
    let raw_args = fields.join("|");
    let encoded_args = raw_args.replace('~', "%7E");

    assert_eq!(
      build_simple_payment_transaction_hex(&encoded_args).unwrap(),
      build_simple_payment_transaction_hex(&raw_args).unwrap(),
    );
  }

  #[test]
  fn asset_component_delimiters_are_decoded_after_asset_packing() {
    let policy = "ab".repeat(28);
    let encoded_name = format!("%30%30%66%66%5E{}%7E01%7E1000", "cd".repeat(28));
    let encoded_assets = format!("{policy}~{encoded_name}~1");

    assert!(parse_multiasset(&encoded_assets).unwrap_err().contains("invalid asset name hex"));
    assert!(parse_multiasset(&format!("{policy}~%30%30%66%66~%31")).is_ok());
    assert!(parse_multiasset(&format!("{policy}~00ff~1")).is_ok());
  }

  #[test]
  fn stake_delegation_certificate_matches_frozen_transaction_vector() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|%5B%7B%22kind%22%3A%22StakeDelegation%22%2C%22stakeCredentialKeyHashHex%22%3A%22{}%22%2C%22poolKeyHash%22%3A%22{}%22%7D%5D",
      "01".repeat(32), address, address, address, "aa".repeat(28), "bb".repeat(28),
    );
    assert_eq!(build_simple_payment_transaction_hex(&args).unwrap(), "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00776243021a0002afbd031a0001e24004d901028183028200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa581cbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbba0f5f6|176061");
  }

  #[test]
  fn stake_registration_and_deregistration_match_golden_vectors_and_reject_invalid_shapes() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let stake_hash_hex = "aa".repeat(28);
    for (kind, expected) in [
      ("StakeRegistration", "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a0058f447021a00029939031a0001e24004d901028182008200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0f5f6|170297"),
      ("StakeDeregistration", "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a0095ebeb021a0002aa95031a0001e24004d901028182018200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0f5f6|174741"),
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
      assert_eq!(build_simple_payment_transaction_hex(&args).unwrap(), expected, "{kind} CBOR/fee mismatch");
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
        "invalid certificate was accepted"
      );
    }
  }

  #[test]
  fn change_only_governance_certificates_match_golden_vectors() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let stake_hex = "aa".repeat(28);
    for (kind, expected) in [
      ("StakeRegistration", "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000181825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a007783f3021a00028e0d031a0001e24004d901028182008200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa0f5f6|167437"),
      ("VoteDelegation", "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000181825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a0095f6bf021a00029fc1031a0001e24004d901028183098200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa8102a0f5f6|171969"),
    ] {
      let certificate_json = if kind == "StakeRegistration" {
        serde_json::json!([{
          "kind": kind,
          "stakeCredentialKeyHashHex": stake_hex.clone(),
        }])
      } else {
        serde_json::json!([{
          "kind": kind,
          "stakeCredentialKeyHashHex": stake_hex.clone(),
          "drep": "AlwaysAbstain",
        }])
      }
      .to_string();
      let encoded = certificate_json
        .as_bytes()
        .iter()
        .map(|byte| format!("%{:02X}", byte))
        .collect::<String>();
      let args = format!(
        "{},0,{},10000000,-||{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}",
        "01".repeat(32), address, address, encoded,
      );
      assert_eq!(build_simple_payment_transaction_hex(&args).unwrap(), expected, "{kind} change-only CBOR/fee mismatch");
    }

    let no_action = format!(
      "{},0,{},10000000,-||{}|123456|44|155381|4310|2000000|500000000|5000|-|-|-",
      "01".repeat(32),
      address,
      address,
    );
    assert!(build_simple_payment_transaction_hex(&no_action).is_ok());
  }

  #[test]
  fn key_withdrawal_matches_golden_transaction_and_rejects_non_reward_addresses() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let reward = "stake_test1uz42424242424242424242424242424242424242424242s7f0kdw";
    let withdrawals_json =
      serde_json::json!([{"rewardAddress": reward, "amount": "3500000"}]).to_string();
    let withdrawals_arg =
      withdrawals_json.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>();
    let args =
      format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|-|{}",
      "01".repeat(32), address, address, address, withdrawals_arg,
    );
    assert_eq!(build_simple_payment_transaction_hex(&args).unwrap(), "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00accf77021a0002aa69031a0001e24005a1581de0aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1a003567e0a0f5f6|174697");

    let invalid = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|-|%5B%7B%22rewardAddress%22%3A%22{}%22%2C%22amount%22%3A%223500000%22%7D%5D",
      "01".repeat(32), address, address, address, address,
    );
    assert!(build_simple_payment_transaction_hex(&invalid).is_err());
  }

  #[test]
  fn stake_delegation_and_key_withdrawal_together_match_csl_body_fee_and_witnesses() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let stake_hash_hex = "aa".repeat(28);
    let pool_hash_hex = "bb".repeat(28);
    let reward = "stake_test1uz42424242424242424242424242424242424242424242s7f0kdw";
    let certificates = serde_json::json!([{
      "kind": "StakeDelegation",
      "stakeCredentialKeyHashHex": stake_hash_hex,
      "poolKeyHash": pool_hash_hex,
    }])
    .to_string();
    let withdrawals =
      serde_json::json!([{"rewardAddress": reward, "amount": "3500000"}]).to_string();
    let encode = |value: &str| {
      value.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>()
    };
    let args =
      format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}|{}",
      "07".repeat(32), address, address, address, encode(&certificates), encode(&withdrawals),
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();
    let expected = hex::decode("84a600d90102818258200707070707070707070707070707070707070707070707070707070707070707000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00acc39b021a0002b645031a0001e24004d901028183028200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa581cbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb05a1581de0aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1a003567e0a0f5f6").unwrap();
    assert_eq!(cml_cbor, expected);
    assert_eq!(cml.split('|').nth(1), Some("177733"));
    let review: serde_json::Value =
      serde_json::from_str(&transaction_review_info_json(&hex::encode(&cml_cbor)).unwrap())
        .unwrap();
    assert!(review["body"]["certificates"].is_array());
    assert_eq!(review["body"]["withdrawals"][0]["amount"], "3500000");
    assert_eq!(review["body"]["withdrawals"][0]["rewardAddress"], reward);
    assert!(review["body"]["withdrawals"][0]["rewardAddressHex"].is_string());
    assert_eq!(review["witnessSet"]["vkeys"], serde_json::json!([]));
  }

  #[test]
  fn vote_delegation_drep_variants_match_csl_and_invalid_drep_is_rejected() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let stake_hash_hex = "aa".repeat(28);
    let variants: [(serde_json::Value, String); 4] = [
      (serde_json::json!("AlwaysAbstain"), "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00776713021a0002aaed031a0001e24004d901028183098200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa8102a0f5f6".to_string()),
      (serde_json::json!("AlwaysNoConfidence"), "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00776713021a0002aaed031a0001e24004d901028183098200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa8103a0f5f6".to_string()),
      (serde_json::json!({"KeyHash": "bb".repeat(28)}), format!("84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a007761eb021a0002b015031a0001e24004d901028183098200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa8200581c{}a0f5f6", "bb".repeat(28))),
      (serde_json::json!({"ScriptHash": "cc".repeat(28)}), "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a007761eb021a0002b015031a0001e24004d901028183098200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa8201581ccccccccccccccccccccccccccccccccccccccccccccccccccccccccca0f5f6".to_string()),
    ];

    for (drep_json, expected_hex) in variants {
      let certificate_json = serde_json::json!([{
        "kind": "VoteDelegation",
        "stakeCredentialKeyHashHex": stake_hash_hex,
        "drep": drep_json,
      }])
      .to_string();
      let encoded =
        certificate_json.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>();
      let args =
        format!(
        "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}",
        "01".repeat(32), address, address, address, encoded,
      );
      let cml = build_simple_payment_transaction_hex(&args).unwrap();
      let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();
      assert_eq!(hex::encode(&cml_cbor), expected_hex, "DRep {drep_json} transaction vector");
      assert_eq!(
        cml.split('|').nth(1),
        Some(if drep_json == "AlwaysAbstain" || drep_json == "AlwaysNoConfidence" {
          "174829"
        } else {
          "176149"
        })
      );
    }

    let invalid = serde_json::json!([{
      "kind": "VoteDelegation",
      "stakeCredentialKeyHashHex": stake_hash_hex,
      "drep": {"ScriptHash": "not-hex"},
    }])
    .to_string();
    let encoded =
      invalid.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>();
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}",
      "01".repeat(32),
      address,
      address,
      address,
      encoded,
    );
    assert!(build_simple_payment_transaction_hex(&args).is_err());
  }

  #[test]
  fn combined_stake_and_vote_certificates_match_csl_deposits_and_cbor() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let stake_hex = "aa".repeat(28);
    let pool_hex = "bb".repeat(28);
    let variants = [
      (
        "StakeAndVoteDelegation",
        serde_json::json!({"kind":"StakeAndVoteDelegation","stakeCredentialKeyHashHex":stake_hex,"poolKeyHash":pool_hex,"drep":{"KeyHash":"cc".repeat(28)}}),
        "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00775cc3021a0002b53d031a0001e24004d9010281840a8200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa581cbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb8200581ccccccccccccccccccccccccccccccccccccccccccccccccccccccccca0f5f6",
      ),
      (
        "StakeRegistrationAndDelegation",
        serde_json::json!({"kind":"StakeRegistrationAndDelegation","stakeCredentialKeyHashHex":stake_hex,"poolKeyHash":pool_hex}),
        "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a0058dce7021a0002b099031a0001e24004d9010281840b8200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa581cbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb1a001e8480a0f5f6",
      ),
      (
        "StakeVoteRegistrationAndDelegation",
        serde_json::json!({"kind":"StakeVoteRegistrationAndDelegation","stakeCredentialKeyHashHex":stake_hex,"poolKeyHash":pool_hex,"drep":"AlwaysAbstain"}),
        "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a0058dc8f021a0002b0f1031a0001e24004d9010281850d8200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa581cbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb81021a001e8480a0f5f6",
      ),
      (
        "VoteRegistrationAndDelegation",
        serde_json::json!({"kind":"VoteRegistrationAndDelegation","stakeCredentialKeyHashHex":stake_hex,"drep":"AlwaysNoConfidence"}),
        "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a0058e1b7021a0002abc9031a0001e24004d9010281840c8200581caaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa81031a001e8480a0f5f6",
      ),
    ];

    for (kind, certificate_json, expected_hex) in variants {
      let packed = serde_json::json!([certificate_json]).to_string();
      let encoded =
        packed.as_bytes().iter().map(|byte| format!("%{:02X}", byte)).collect::<String>();
      let args =
        format!(
        "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|{}",
        "01".repeat(32), address, address, address, encoded,
      );
      let cml = build_simple_payment_transaction_hex(&args).unwrap();
      let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();
      let signing_requirements: serde_json::Value = serde_json::from_str(
        &super::transaction_signing_requirements_json(&hex::encode(&cml_cbor)).unwrap(),
      )
      .unwrap();
      assert_eq!(signing_requirements["hasStakingCertificate"], true, "{kind}");
      assert_eq!(hex::encode(&cml_cbor), expected_hex, "{kind} CBOR/deposit vector");
      let review: serde_json::Value =
        serde_json::from_str(&transaction_review_info_json(&hex::encode(&cml_cbor)).unwrap())
          .unwrap();
      assert_eq!(
        review["body"]["certificates"].as_array().unwrap().len(),
        1,
        "{kind} certificate retained"
      );
      assert!(
        review["body"]["fee"].as_str().unwrap().parse::<u64>().unwrap() > 155381,
        "{kind} fee includes certificate size"
      );
    }
  }

  #[test]
  fn validity_interval_start_matches_csl_transaction_cbor_and_fee() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|-|-|120000",
      "01".repeat(32), address, address, address,
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();
    assert_eq!(hex::encode(&cml_cbor), "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a00777e73021a0002938d031a0001e240081a0001d4c0a0f5f6");
    assert_eq!(cml.split('|').nth(1), Some("168845"));

    let invalid = args.replace("120000", "-");
    let mut fields = invalid.split('|').collect::<Vec<_>>();
    fields[3] = "not-a-slot";
    assert!(build_simple_payment_transaction_hex(&fields.join("|")).is_err());
  }

  #[test]
  fn reference_input_matches_csl_transaction_cbor_and_fee() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|-|-|-|-|{},1,{},1000000,-",
      "01".repeat(32), address, address, address, "02".repeat(32), address,
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml_cbor = hex::decode(cml.split('|').next().unwrap()).unwrap();
    assert_eq!(hex::encode(&cml_cbor), "84a500d90102818258200101010101010101010101010101010101010101010101010101010101010101000182825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a001e8480825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf1a0077786f021a00029991031a0001e24012d9010281825820020202020202020202020202020202020202020202020202020202020202020201a0f5f6");
    assert_eq!(cml.split('|').nth(1), Some("170385"));

    let invalid = args.replace(",1,", ",bad-index,");
    assert!(build_simple_payment_transaction_hex(&invalid).is_err());
  }

  #[test]
  fn metadata_encoding_matches_csl_for_escaped_strings_and_large_integers() {
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
    let review: serde_json::Value =
      serde_json::from_str(&transaction_review_info_json(&hex::encode(&cml_cbor)).unwrap())
        .unwrap();
    assert_eq!(
      review["auxiliaryData"]["metadata"][0]["basicConversionsJson"],
      r#"{"msg":["café | pipe",9007199254740993]}"#,
    );
    assert_eq!(review["auxiliaryData"]["metadata"][0]["json"]["msg"][0], "café | pipe");
    assert_eq!(
      review["auxiliaryData"]["metadata"][0]["json"]["msg"][1].as_u64(),
      Some(9_007_199_254_740_993),
    );

    assert!(review["auxiliaryData"]["metadata"][0]["label"] == "674");
    assert!(review["body"]["fee"].as_str().unwrap().parse::<u64>().unwrap() > 155381);
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
    let byron = "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3";
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let script_address = "addr_test1wzzfgjazt5ts34cstrhzaac4xav8x7z2m3vg76s8qmaztzglsw8k5";
    let args = format!(
      "{},0,{},10000000,-|{},2000000,-,inline~d87980|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32), byron, script_address, address,
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml = hex::decode(cml.rsplit_once('|').unwrap().0).unwrap();
    let review: serde_json::Value =
      serde_json::from_str(&transaction_review_info_json(&hex::encode(&cml)).unwrap()).unwrap();
    assert_eq!(review["body"]["inputs"][0]["transactionIdHex"], "01".repeat(32));
    assert_eq!(review["body"]["outputs"][0]["address"], script_address);
    assert_eq!(review["body"]["outputs"][0]["datum"]["kind"], "inline");
    assert_eq!(review["body"]["outputs"].as_array().unwrap().len(), 2);
    assert!(review["body"]["fee"].as_str().unwrap().parse::<u64>().unwrap() > 155381);
  }

  #[test]
  fn simple_payment_supports_omitted_ttl_manual_fee_and_explicit_change() {
    use cml_chain::{serialization::Deserialize, transaction::Transaction};
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = vec![
      format!("{},0,{},10000000,-,-,-", "01".repeat(32), address),
      format!("{address},2000000,-,-;{address},7800000,-,-"),
      address.to_owned(),
      "-".to_owned(),
      "44".to_owned(),
      "155381".to_owned(),
      "4310".to_owned(),
      "2000000".to_owned(),
      "500000000".to_owned(),
      "5000".to_owned(),
      "-".to_owned(),
      "-".to_owned(),
      "-".to_owned(),
      "-".to_owned(),
      "-".to_owned(),
      "-".to_owned(),
      "200000".to_owned(),
      "true".to_owned(),
    ]
    .join("|");
    let result = build_simple_payment_transaction_hex(&args).unwrap();
    let (tx_hex, fee) = result.rsplit_once('|').unwrap();
    assert_eq!(fee, "200000");
    let tx = Transaction::from_cbor_bytes(&hex::decode(tx_hex).unwrap()).unwrap();
    assert_eq!(tx.body.ttl, None);
    assert_eq!(tx.body.outputs.len(), 2);
    assert_eq!(tx.body.outputs[0].amount().coin, 2_000_000);
    assert_eq!(tx.body.outputs[1].amount().coin, 7_800_000);

    let invalid_fee = args.replace("|200000|true", "|1|true");
    assert!(build_simple_payment_transaction_hex(&invalid_fee)
      .unwrap_err()
      .contains("below protocol minimum"));
    let invalid_change = args.replace("7800000", "7799999");
    assert!(build_simple_payment_transaction_hex(&invalid_change)
      .unwrap_err()
      .contains("conserve value"));
  }

  #[test]
  fn normalized_recipe_supports_exact_manual_fee_withdrawal_funding_and_change_only() {
    use cml_chain::{serialization::Deserialize, transaction::Transaction};
    use cml_crypto::RawBytesEncoding;

    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let reward_address = cml_chain::address::RewardAddress::new(
      0,
      cml_chain::certs::Credential::new_pub_key(
        cml_chain::crypto::Ed25519KeyHash::from_raw_bytes(&[0xaa; 28]).unwrap(),
      ),
    )
    .to_address()
    .to_bech32(None)
    .unwrap();
    let base = serde_json::json!({
      "protocolParams": {
        "linearFee":{"coefficient":"44","constant":"155381"},
        "coinsPerUtxoByte":"4310","keyDeposit":"2000000","poolDeposit":"500000000",
        "maxValueSize":"5000"
      },
      "inputs":[{"txHashHex":"01".repeat(32),"index":"0","address":address,"lovelace":"10000000","assets":[]}],
      "outputs":[],"certificates":[],"withdrawals":[],"referenceInputs":[],"scriptInputs":[],
      "collateralInputs":[],"mints":[],"metadata":[],"options":{"ttl":"123456"}
    });

    // Without a change address, the builder may use an existing recipe address
    // internally, but exact manual conservation must prevent an extra output.
    let mut exact_fee = base.clone();
    exact_fee["outputs"] =
      serde_json::json!([{"address":address,"lovelace":"9800000","assets":[]}]);
    exact_fee["options"]["manualFee"] = serde_json::json!("200000");
    let exact_hex = build_transaction_recipe_cml_hex(&exact_fee.to_string()).unwrap();
    let exact_tx =
      Transaction::from_cbor_bytes(&hex::decode(exact_hex.split('|').next().unwrap()).unwrap())
        .unwrap();
    assert_eq!(exact_tx.body.outputs.len(), 1);
    assert_eq!(exact_tx.body.fee, 200_000);
    assert_eq!(exact_tx.body.outputs[0].amount().coin + exact_tx.body.fee, 10_000_000);

    // When change_address is omitted, residual input value must return to the
    // input address rather than increasing the recipient's output.
    let recipient =
      "addr_test1qqhchrw4umcrf90ew5ep85zefj9724c5jcfg6kp667qau789d6z307gnggrp3hgye75yzgh5q0w6unkqnvfxjfu7vxlswtaxme";
    let mut recipient_with_change = base.clone();
    recipient_with_change["outputs"] =
      serde_json::json!([{"address":recipient,"lovelace":"2000000","assets":[]}]);
    let recipient_tx_hex =
      build_transaction_recipe_cml_hex(&recipient_with_change.to_string()).unwrap();
    let recipient_tx = Transaction::from_cbor_bytes(
      &hex::decode(recipient_tx_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert_eq!(recipient_tx.body.outputs.len(), 2);
    assert_eq!(recipient_tx.body.outputs[0].address().to_bech32(None).unwrap(), recipient,);
    assert_eq!(recipient_tx.body.outputs[0].amount().coin, 2_000_000);
    assert_eq!(recipient_tx.body.outputs[1].address().to_bech32(None).unwrap(), address);

    // Withdrawals are ledger input value and can fund a transaction without
    // ordinary UTxOs. The remaining withdrawal value is emitted as change.
    let mut withdrawal_only = base.clone();
    withdrawal_only["inputs"] = serde_json::json!([]);
    withdrawal_only["outputs"] =
      serde_json::json!([{"address":address,"lovelace":"2000000","assets":[]}]);
    withdrawal_only["withdrawals"] =
      serde_json::json!([{"rewardAddress":reward_address,"amount":"3500000"}]);
    withdrawal_only["options"]["changeAddress"] = serde_json::json!(address);
    let withdrawal_hex = build_transaction_recipe_cml_hex(&withdrawal_only.to_string()).unwrap();
    let withdrawal_tx = Transaction::from_cbor_bytes(
      &hex::decode(withdrawal_hex.split('|').next().unwrap()).unwrap(),
    )
    .unwrap();
    assert!(withdrawal_tx.body.inputs.is_empty());
    assert_eq!(withdrawal_tx.body.withdrawals.as_ref().unwrap().len(), 1);
    assert_eq!(withdrawal_tx.body.outputs.len(), 2);
    assert_eq!(
      withdrawal_tx.body.outputs.iter().map(|output| output.amount().coin).sum::<u64>()
        + withdrawal_tx.body.fee,
      3_500_000
    );
    assert!(withdrawal_tx.body.fee > 155_381);

    // Input + change address with no recipient output is a valid change-only
    // transaction; it still pays the protocol minimum fee and conserves value.
    let mut change_only = base;
    change_only["options"]["changeAddress"] = serde_json::json!(address);
    let change_hex = build_transaction_recipe_cml_hex(&change_only.to_string()).unwrap();
    let change_tx =
      Transaction::from_cbor_bytes(&hex::decode(change_hex.split('|').next().unwrap()).unwrap())
        .unwrap();
    assert_eq!(change_tx.body.inputs.len(), 1);
    assert_eq!(change_tx.body.outputs.len(), 1);
    assert_eq!(change_tx.body.outputs[0].amount().coin + change_tx.body.fee, 10_000_000);
    assert!(change_tx.body.fee > 155_381);
  }

  #[test]
  fn simple_payment_estimates_fee_from_explicit_change_and_validates_byron_metadata() {
    use cml_chain::{byron::ByronAddress, serialization::Deserialize, transaction::Transaction};
    let byron = "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3";
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let raw_address_hex =
      hex::encode(ByronAddress::from_base58(byron).unwrap().to_address().to_raw_bytes());
    let input = format!("{},0,{byron},10000000,-,-,-,{raw_address_hex},true", "02".repeat(32));
    let args = format!(
      "{input}|{address},2000000,-,-|{address}|-|44|155381|4310|2000000|500000000|5000|-|-|-|-|-|-|-|false"
    );
    let tx = build_simple_payment_transaction_hex(&args).unwrap();
    let (tx_hex, fee) = tx.rsplit_once('|').unwrap();
    assert!(fee.parse::<u64>().unwrap() > 155_381);
    let tx = Transaction::from_cbor_bytes(&hex::decode(tx_hex).unwrap()).unwrap();
    assert_eq!(tx.body.ttl, None);

    let conflicting = args.replace(",true|", ",false|");
    assert!(build_simple_payment_transaction_hex(&conflicting)
      .unwrap_err()
      .contains("isBootstrap"));
    let other_raw_address_hex =
      hex::encode(cml_chain::address::Address::from_bech32(address).unwrap().to_raw_bytes());
    let conflicting_address = args.replace(&raw_address_hex, &other_raw_address_hex);
    assert!(build_simple_payment_transaction_hex(&conflicting_address)
      .unwrap_err()
      .contains("same address"));
  }

  #[test]
  fn multiple_native_script_inputs_and_required_signers_match_csl_fee() {
    use cml_chain::serialization::Deserialize;
    use cml_chain::transaction::NativeScript;

    let script_cbor = format!("8200581c{}", "ab".repeat(28));
    let second_script_cbor = format!("8200581c{}", "cd".repeat(28));
    let address_for_script = |script_cbor: &str| {
      let script = NativeScript::from_cbor_bytes(&hex::decode(script_cbor).unwrap()).unwrap();
      cml_chain::address::EnterpriseAddress::new(
        0,
        cml_chain::certs::Credential::new_script(script.hash()),
      )
      .to_address()
      .to_bech32(None)
      .unwrap()
    };
    let script_address = address_for_script(&script_cbor);
    let second_script_address = address_for_script(&second_script_cbor);
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = format!(
      "{},0,{},5000000,-,{},1;{},0,{},5000000,-,{},1|{},2000000,-,-|{}|123456|44|155381|4310|2000000|500000000|5000",
      "01".repeat(32), script_address, script_cbor,
      "02".repeat(32), second_script_address, second_script_cbor,
      address, address,
    );
    let result = build_simple_payment_transaction_hex(&args).unwrap();
    let cbor_hex = result.rsplit_once('|').unwrap().0;
    let review: serde_json::Value =
      serde_json::from_str(&transaction_review_info_json(cbor_hex).unwrap()).unwrap();
    assert_eq!(review["body"]["inputs"].as_array().unwrap().len(), 2);
    assert_eq!(review["witnessSet"]["nativeScripts"].as_array().unwrap().len(), 2);
    assert!(review["body"]["fee"].as_str().unwrap().parse::<u64>().unwrap() > 155381);
  }

  #[test]
  fn native_mint_and_token_output_match_csl_fee_and_witnesses() {
    use cml_chain::serialization::Deserialize;
    use cml_chain::transaction::NativeScript;
    use cml_crypto::RawBytesEncoding;
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let script_hex = format!("8200581c{}", "ab".repeat(28));
    let script = NativeScript::from_cbor_bytes(&hex::decode(&script_hex).unwrap()).unwrap();
    let policy_hex = hex::encode(script.hash().to_raw_bytes());
    let name_hex = "00ff";
    let args = format!(
      "{},0,{},10000000,-|{},5000000,{}~{}~1,-|{}|123456|44|155381|4310|2000000|500000000|5000|-|{},native,{},{}~1",
      "01".repeat(32), address, address, policy_hex, name_hex, address, policy_hex, script_hex, name_hex,
    );
    let cml = build_simple_payment_transaction_hex(&args).unwrap();
    let cml = hex::decode(cml.rsplit_once('|').unwrap().0).unwrap();

    let review: serde_json::Value =
      serde_json::from_str(&transaction_review_info_json(&hex::encode(&cml)).unwrap()).unwrap();
    assert!(review["body"]["mint"].is_object());
    assert_eq!(review["body"]["outputs"][0]["assets"][0]["policyIdHex"], policy_hex);
    assert_eq!(review["body"]["outputs"][0]["assets"][0]["assetNameHex"], name_hex);
    assert_eq!(review["body"]["outputs"][0]["assets"][0]["quantity"], "1");
    assert_eq!(review["witnessSet"]["nativeScripts"].as_array().unwrap().len(), 1);
    assert!(review["body"]["fee"].as_str().unwrap().parse::<u64>().unwrap() > 155381);
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
    let review: serde_json::Value =
      serde_json::from_str(&transaction_review_info_json(&hex::encode(&cml_cbor)).unwrap())
        .unwrap();
    assert_eq!(review["body"]["inputs"].as_array().unwrap().len(), 1);
    assert_eq!(review["body"]["inputs"][0]["transactionIdHex"], input_hash);
    assert_eq!(review["body"]["outputs"].as_array().unwrap().len(), 4);
    assert_eq!(review["body"]["outputs"][0]["assets"][0]["quantity"], asset_quantity);
    assert_eq!(review["body"]["outputs"][0]["datum"]["kind"], "inline");
    assert_eq!(review["body"]["outputs"][1]["datum"]["hashHex"], datum_hash_hex);
    assert_eq!(review["body"]["outputs"][2]["assets"][0]["quantity"], asset_quantity);
    assert!(
      review["body"]["outputs"][2]["lovelace"].as_str().unwrap().parse::<u64>().unwrap()
        > 1_000_000
    );
    assert!(review["body"]["outputs"][3]["assets"].as_array().unwrap().is_empty());
    let total_output_coin = review["body"]["outputs"]
      .as_array()
      .unwrap()
      .iter()
      .map(|output| output["lovelace"].as_str().unwrap().parse::<u64>().unwrap())
      .sum::<u64>();
    assert_eq!(
      total_output_coin + review["body"]["fee"].as_str().unwrap().parse::<u64>().unwrap(),
      10_000_000
    );
  }

  #[test]
  fn rejects_token_output_below_minimum_ada() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let policy = "ab".repeat(28);
    let minimum = minimum_coin_for_assets(&format!("{}|{}~00ff~1|4310", address, policy))
      .unwrap()
      .parse::<u64>()
      .unwrap();
    assert!(minimum > 1_000_000);
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
    assert_eq!(unsafe { CStr::from_ptr(result) }.to_str().unwrap(), SIGNED_TRANSACTION_HEX);
    unsafe {
      crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free(&mut result);
      if !error.is_null() {
        crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free(&mut error);
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
      crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free(&mut result);
      if !error.is_null() {
        crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free(&mut error);
      }
    }
  }
}
