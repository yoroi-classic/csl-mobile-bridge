use cml_chain::{
  assets::{AssetName, MultiAsset, Value},
  serialization::{Deserialize, Serialize},
  PolicyId,
};
use cml_crypto::RawBytesEncoding;
use serde::Deserialize as SerdeDeserialize;
use std::collections::HashSet;

#[derive(SerdeDeserialize)]
#[serde(rename_all = "camelCase")]
struct AssetAmount {
  policy_id_hex: String,
  asset_name_hex: String,
  quantity: String,
}

#[derive(SerdeDeserialize)]
#[serde(rename_all = "camelCase")]
struct ValueAmounts {
  coin: String,
  assets: Vec<AssetAmount>,
}

fn parse_decimal_u64(value: &str, name: &str) -> Result<u64, String> {
  if value.is_empty() || !value.bytes().all(|byte| byte.is_ascii_digit()) {
    return Err(format!("{name} must be an unsigned decimal string"));
  }
  value.parse::<u64>().map_err(|err| format!("invalid {name}: {err}"))
}

fn value_from_amounts(args: ValueAmounts) -> Result<Value, String> {
  let coin = parse_decimal_u64(&args.coin, "coin")?;
  let mut assets = MultiAsset::new();
  let mut seen = HashSet::new();
  for asset in args.assets {
    let policy_bytes = hex::decode(&asset.policy_id_hex)
      .map_err(|err| format!("invalid asset policy ID hex: {err}"))?;
    let policy = PolicyId::from_raw_bytes(&policy_bytes)
      .map_err(|err| format!("invalid asset policy ID: {err}"))?;
    let asset_name_bytes =
      hex::decode(&asset.asset_name_hex).map_err(|err| format!("invalid asset name hex: {err}"))?;
    let asset_name =
      AssetName::new(asset_name_bytes).map_err(|err| format!("invalid asset name: {err}"))?;
    let quantity = parse_decimal_u64(&asset.quantity, "asset quantity")?;
    let identity =
      (asset.policy_id_hex.to_ascii_lowercase(), asset.asset_name_hex.to_ascii_lowercase());
    if !seen.insert(identity) {
      return Err("duplicate asset in value arguments".to_owned());
    }
    assets.set(policy, asset_name, quantity);
  }
  Ok(Value::new(coin, assets))
}

/// Decode a CML Value from canonical CBOR hex into lossless JSON quantities.
pub fn value_from_hex_info_json(value_cbor_hex: &str) -> Result<String, String> {
  let bytes =
    hex::decode(value_cbor_hex).map_err(|err| format!("invalid value CBOR hex: {err}"))?;
  let value = Value::from_cbor_bytes(&bytes).map_err(|err| format!("invalid value CBOR: {err}"))?;
  let mut assets = Vec::new();
  for (policy_id, names) in value.multiasset.iter() {
    for (asset_name, quantity) in names.iter() {
      assets.push(serde_json::json!({
        "policyIdHex": hex::encode(policy_id.to_raw_bytes()),
        "assetNameHex": hex::encode(asset_name.to_raw_bytes()),
        "quantity": quantity.to_string(),
      }));
    }
  }
  Ok(
    serde_json::json!({
      "coin": value.coin.to_string(),
      "assets": assets,
    })
    .to_string(),
  )
}

/// Build canonical CML Value CBOR from decimal-string quantities.
pub fn value_from_amounts_hex(args_json: &str) -> Result<String, String> {
  let args: ValueAmounts =
    serde_json::from_str(args_json).map_err(|err| format!("invalid value arguments: {err}"))?;
  let value = value_from_amounts(args)?;
  Ok(hex::encode(value.to_cbor_bytes()))
}

#[cfg(test)]
mod tests {
  use super::{value_from_amounts_hex, value_from_hex_info_json};

  const POLICY_HEX: &str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const MULTIASSET_VALUE_HEX: &str =
    concat!("82182aa1581c", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "a1410103");

  #[test]
  fn decodes_multiasset_value_with_decimal_string_quantities() {
    let decoded: serde_json::Value =
      serde_json::from_str(&value_from_hex_info_json(MULTIASSET_VALUE_HEX).unwrap()).unwrap();
    assert_eq!(decoded["coin"], "42");
    assert_eq!(decoded["assets"][0]["policyIdHex"], POLICY_HEX);
    assert_eq!(decoded["assets"][0]["assetNameHex"], "01");
    assert_eq!(decoded["assets"][0]["quantity"], "3");
  }

  #[test]
  fn builds_value_matching_frozen_cbor_vector() {
    let args = serde_json::json!({
      "coin": "42",
      "assets": [{
        "policyIdHex": POLICY_HEX,
        "assetNameHex": "01",
        "quantity": "3"
      }]
    })
    .to_string();
    assert_eq!(value_from_amounts_hex(&args).unwrap(), MULTIASSET_VALUE_HEX);
  }

  #[test]
  fn rejects_invalid_cbor_hex_assets_and_quantities() {
    assert!(value_from_hex_info_json("zz").unwrap_err().contains("CBOR hex"));
    assert!(value_from_hex_info_json("ff").unwrap_err().contains("CBOR"));
    let invalid = serde_json::json!({"coin":"18446744073709551616", "assets": []}).to_string();
    assert!(value_from_amounts_hex(&invalid).unwrap_err().contains("coin"));
    let signed = serde_json::json!({"coin":"1", "assets":[{
      "policyIdHex": POLICY_HEX, "assetNameHex":"", "quantity":"-1"
    }]})
    .to_string();
    assert!(value_from_amounts_hex(&signed).unwrap_err().contains("quantity"));
    let invalid_policy = serde_json::json!({"coin":"1", "assets":[{
      "policyIdHex":"aa", "assetNameHex":"", "quantity":"1"
    }]})
    .to_string();
    assert!(value_from_amounts_hex(&invalid_policy).is_err());
  }
}
