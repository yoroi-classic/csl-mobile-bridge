use cml_chain::serialization::Serialize;
use cml_chain::{
  assets::Value,
  builders::{output_builder::TransactionOutputBuilder, tx_builder::TransactionUnspentOutput},
  crypto::TransactionHash,
  transaction::TransactionInput,
};
use cml_crypto::RawBytesEncoding;
use crate::{cml_address::parse_payment_address, cml_assets::multiasset_from_hex_amounts};

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AssetArgs {
  policy_id_hex: String,
  asset_name_hex: String,
  quantity: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct UnspentOutputArgs {
  tx_hash_hex: String,
  index: String,
  address: String,
  lovelace: String,
  #[serde(default)]
  assets: Vec<AssetArgs>,
}

/// Serialize a CIP-30 TransactionUnspentOutput using CML. Quantities and index
/// cross the JS boundary as decimal strings to avoid number precision loss.
pub fn transaction_unspent_output_hex(args_json: &str) -> Result<String, String> {
  let args: UnspentOutputArgs = serde_json::from_str(args_json)
    .map_err(|err| format!("invalid transaction unspent output arguments: {err}"))?;
  let hash_bytes =
    hex::decode(&args.tx_hash_hex).map_err(|err| format!("invalid transaction hash hex: {err}"))?;
  let hash = TransactionHash::from_raw_bytes(&hash_bytes).map_err(|err| err.to_string())?;
  let index =
    args.index.parse::<u64>().map_err(|err| format!("invalid transaction output index: {err}"))?;
  let lovelace =
    args.lovelace.parse::<u64>().map_err(|err| format!("invalid lovelace quantity: {err}"))?;
  let assets = multiasset_from_hex_amounts(args.assets.iter().map(|asset| {
    (asset.policy_id_hex.as_str(), asset.asset_name_hex.as_str(), asset.quantity.as_str())
  }))?;
  let address = parse_payment_address(&args.address)?;
  let output = TransactionOutputBuilder::new()
    .with_address(address)
    .next()
    .map_err(|err| err.to_string())?
    .with_value(Value::new(lovelace, assets))
    .build()
    .map_err(|err| err.to_string())?
    .output;
  let unspent = TransactionUnspentOutput::new(TransactionInput::new(hash, index), output);
  Ok(format!(
    "82{}{}",
    hex::encode(unspent.input.to_cbor_bytes()),
    hex::encode(unspent.output.to_cbor_bytes()),
  ))
}

#[cfg(test)]
mod tests {
  use super::transaction_unspent_output_hex;

  const ADDRESS: &str = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";

  #[test]
  fn output_serialization_matches_frozen_cip30_multi_asset_vector() {
    let policy = "11".repeat(28);
    let args = serde_json::json!({
      "txHashHex": "22".repeat(32),
      "index": "2",
      "address": ADDRESS,
      "lovelace": "9007199254740993",
      "assets": [{"policyIdHex": policy, "assetNameHex": "4e49474854", "quantity": "123456789012345678"}],
    });
    let cml_hex = transaction_unspent_output_hex(&args.to_string()).unwrap();

    assert_eq!(cml_hex, "82825820222222222222222222222222222222222222222222222222222222222222222202825839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf821b0020000000000001a1581c11111111111111111111111111111111111111111111111111111111a1454e494748541b01b69b4ba630f34e");
  }

  #[test]
  fn rejects_invalid_hash_index_and_amount_strings() {
    let valid = serde_json::json!({
      "txHashHex": "22".repeat(32), "index": "0", "address": ADDRESS,
      "lovelace": "1", "assets": []
    });
    for (field, value) in [("txHashHex", "zz"), ("index", "-1"), ("lovelace", "1.2")] {
      let mut args = valid.clone();
      args[field] = serde_json::json!(value);
      assert!(
        transaction_unspent_output_hex(&args.to_string()).is_err(),
        "invalid {field} was accepted",
      );
    }
  }

  #[test]
  fn rejects_duplicate_assets_instead_of_overwriting_quantity() {
    let policy = "11".repeat(28);
    let args = serde_json::json!({
      "txHashHex": "22".repeat(32), "index": "0", "address": ADDRESS,
      "lovelace": "1000000", "assets": [
        {"policyIdHex": policy, "assetNameHex": "aa", "quantity": "1"},
        {"policyIdHex": policy.to_uppercase(), "assetNameHex": "AA", "quantity": "2"}
      ]
    });
    assert!(transaction_unspent_output_hex(&args.to_string()).unwrap_err().contains("duplicate asset"));
  }
}
