use cml_chain::assets::{AssetName, MultiAsset};
use cml_chain::PolicyId;
use cml_crypto::RawBytesEncoding;
use std::collections::HashSet;

/// Parse policy/name/quantity triples into a CML multi-asset value.
/// Duplicate assets are rejected instead of silently replacing quantities.
pub fn multiasset_from_hex_amounts<'a>(
  assets: impl IntoIterator<Item = (&'a str, &'a str, &'a str)>,
) -> Result<MultiAsset, String> {
  let mut result = MultiAsset::default();
  let mut seen = HashSet::new();
  for (policy_hex, name_hex, quantity) in assets {
    let policy_bytes =
      hex::decode(policy_hex).map_err(|err| format!("invalid asset policy hex: {err}"))?;
    let policy = PolicyId::from_raw_bytes(&policy_bytes)
      .map_err(|err| format!("invalid asset policy ID: {err}"))?;
    let name_bytes =
      hex::decode(name_hex).map_err(|err| format!("invalid asset name hex: {err}"))?;
    let name =
      AssetName::new(name_bytes.clone()).map_err(|err| format!("invalid asset name: {err}"))?;
    let quantity =
      quantity.parse::<u64>().map_err(|err| format!("invalid asset quantity: {err}"))?;
    if !seen.insert((policy.to_raw_bytes().to_vec(), name_bytes)) {
      return Err("duplicate asset identifier".to_owned());
    }
    result.set(policy, name, quantity);
  }
  Ok(result)
}
