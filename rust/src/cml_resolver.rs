use cml_chain::{
  address::{BaseAddress, EnterpriseAddress},
  certs::Credential,
  plutus::PlutusData,
};
use cml_crypto::{Ed25519KeyHash, RawBytesEncoding, ScriptHash};
use crate::panic::handle_exception_result;

fn constr_fields<'a>(
  data: &'a PlutusData, alternative: u64, label: &str,
) -> Result<&'a [PlutusData], String> {
  let PlutusData::ConstrPlutusData(constr) = data else {
    return Err(format!("Invalid CNS address record: expected {label} constructor"));
  };
  if constr.alternative != alternative {
    return Err(format!("Invalid CNS address record: unexpected {label} constructor"));
  }
  Ok(&constr.fields)
}

fn single_field<'a>(fields: &'a [PlutusData], label: &str) -> Result<&'a PlutusData, String> {
  if fields.len() != 1 {
    return Err(format!("Invalid CNS address record: {label} field count"));
  }
  Ok(&fields[0])
}

fn credential_hash(data: &PlutusData, label: &str) -> Result<Vec<u8>, String> {
  let PlutusData::Bytes { bytes, .. } = data else {
    return Err(format!("Invalid CNS address record: {label} is not bytes"));
  };
  if bytes.len() != 28 {
    return Err(format!("Invalid CNS address record: {label} must be 28 bytes"));
  }
  Ok(bytes.clone())
}

/// Convert a CNS address record's DetailedSchema JSON to CML address data.
/// The input shape is the two-field Plutus Address used by the CNS registry:
/// payment credential plus Maybe staking credential.
pub fn resolve_cns_address_record(
  plutus_address_json: &str, network: u8,
) -> Result<String, String> {
  handle_exception_result(|| resolve_cns_address_record_inner(plutus_address_json, network))
}

fn resolve_cns_address_record_inner(
  plutus_address_json: &str, network: u8,
) -> Result<String, String> {
  if network > 15 {
    return Err("Invalid CNS address record: network ID must be 0..=15".to_owned());
  }
  let data: PlutusData = serde_json::from_str(plutus_address_json)
    .map_err(|err| format!("Invalid CNS address record JSON: {err}"))?;
  let address_fields = constr_fields(&data, 0, "address")?;
  if address_fields.len() != 2 {
    return Err("Invalid CNS address record: address field count".to_owned());
  }

  let (payment_kind, payment_fields) = match &address_fields[0] {
    PlutusData::ConstrPlutusData(constr) if constr.alternative == 0 => ("key", &constr.fields),
    PlutusData::ConstrPlutusData(constr) if constr.alternative == 1 => ("script", &constr.fields),
    _ => return Err("Invalid CNS address record: payment credential constructor".to_owned()),
  };
  let payment_hash_bytes = credential_hash(
    single_field(payment_fields, "payment credential")?,
    "payment credential hash",
  )?;
  let payment = if payment_kind == "key" {
    Credential::new_pub_key(
      Ed25519KeyHash::from_raw_bytes(&payment_hash_bytes).map_err(|err| err.to_string())?,
    )
  } else {
    Credential::new_script(
      ScriptHash::from_raw_bytes(&payment_hash_bytes).map_err(|err| err.to_string())?,
    )
  };

  let (staking_kind, stake_hash_bytes) = match &address_fields[1] {
    PlutusData::ConstrPlutusData(nothing)
      if nothing.alternative == 1 && nothing.fields.is_empty() =>
    {
      (None, None)
    }
    some => {
      let just_fields = constr_fields(some, 0, "staking option")?;
      let staking_credential = single_field(just_fields, "staking option")?;
      let staking_hash_fields = constr_fields(staking_credential, 0, "staking credential")?;
      let hash_wrapper = single_field(staking_hash_fields, "staking credential")?;
      let (kind, hash_fields) = match hash_wrapper {
        PlutusData::ConstrPlutusData(constr) if constr.alternative == 0 => ("key", &constr.fields),
        PlutusData::ConstrPlutusData(constr) if constr.alternative == 1 => ("script", &constr.fields),
        _ => return Err("Invalid CNS address record: staking credential constructor".to_owned()),
      };
      (Some(kind), Some(credential_hash(single_field(hash_fields, "staking hash")?, "staking credential hash")?))
    }
  };

  let (address, staking_hash_hex) = match (staking_kind, stake_hash_bytes) {
    (Some(kind), Some(bytes)) => {
      let staking = if kind == "key" {
        Credential::new_pub_key(Ed25519KeyHash::from_raw_bytes(&bytes).map_err(|err| err.to_string())?)
      } else {
        Credential::new_script(ScriptHash::from_raw_bytes(&bytes).map_err(|err| err.to_string())?)
      };
      let addr = BaseAddress::new(network, payment, staking).to_address();
      (addr.to_bech32(None).map_err(|err| err.to_string())?, Some(hex::encode(bytes)))
    }
    (None, None) => {
      let addr = EnterpriseAddress::new(network, payment).to_address();
      (addr.to_bech32(None).map_err(|err| err.to_string())?, None)
    }
    _ => return Err("Invalid CNS address record: incomplete staking credential".to_owned()),
  };

  serde_json::to_string(&serde_json::json!({
    "paymentCredentialKind": payment_kind,
    "paymentCredentialHashHex": hex::encode(payment_hash_bytes),
    "stakingCredentialKind": staking_kind,
    "stakingCredentialHashHex": staking_hash_hex,
    "addressBech32": address,
  }))
  .map_err(|err| err.to_string())
}

#[cfg(test)]
mod tests {
  use super::resolve_cns_address_record;

  const KEY_ADDRESS: &str = r#"{"constructor":0,"fields":[{"constructor":0,"fields":[{"bytes":"a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84"}]},{"constructor":0,"fields":[{"constructor":0,"fields":[{"constructor":0,"fields":[{"bytes":"e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df"}]}]}]}]}"#;
  const SCRIPT_ADDRESS: &str = r#"{"constructor":0,"fields":[{"constructor":1,"fields":[{"bytes":"a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84"}]},{"constructor":0,"fields":[{"constructor":0,"fields":[{"constructor":0,"fields":[{"bytes":"e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df"}]}]}]}]}"#;
  const SCRIPT_STAKE_ADDRESS: &str = r#"{"constructor":0,"fields":[{"constructor":0,"fields":[{"bytes":"a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84"}]},{"constructor":0,"fields":[{"constructor":0,"fields":[{"constructor":1,"fields":[{"bytes":"e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df"}]}]}]}]}"#;
  const NO_STAKE: &str = r#"{"constructor":0,"fields":[{"constructor":0,"fields":[{"bytes":"a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84"}]},{"constructor":1,"fields":[]}] }"#;

  #[test]
  fn resolves_key_and_script_base_addresses_to_golden_vectors() {
    let key: serde_json::Value =
      serde_json::from_str(&resolve_cns_address_record(KEY_ADDRESS, 1).unwrap()).unwrap();
    assert_eq!(key["paymentCredentialKind"], "key");
    assert_eq!(
      key["paymentCredentialHashHex"],
      "a5644bcb8cd82b5e0478657e2c8feea865682a5b20db45d095807d84"
    );
    assert_eq!(
      key["stakingCredentialHashHex"],
      "e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df"
    );
    assert_eq!(key["addressBech32"], "addr1qxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80sqfylvs");

    let script: serde_json::Value =
      serde_json::from_str(&resolve_cns_address_record(SCRIPT_ADDRESS, 1).unwrap()).unwrap();
    assert_eq!(script["paymentCredentialKind"], "script");
    assert_eq!(script["addressBech32"], "addr1zxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mp8yqjptk3jgl32tllqxzawy48jly69hpkj5hak7f44dw80s0xayjy");
    let script_stake: serde_json::Value = serde_json::from_str(
      &resolve_cns_address_record(SCRIPT_STAKE_ADDRESS, 1).unwrap(),
    ).unwrap();
    assert_eq!(script_stake["stakingCredentialKind"], "script");
    assert_eq!(script_stake["stakingCredentialHashHex"], "e40482bb4648fc54bffc06175c4a9e5f268b70da54bf6de4d6ad71df");
  }

  #[test]
  fn resolves_missing_stake_as_enterprise_address() {
    let result: serde_json::Value =
      serde_json::from_str(&resolve_cns_address_record(NO_STAKE, 1).unwrap()).unwrap();
    assert_eq!(result["stakingCredentialHashHex"], serde_json::Value::Null);
    assert_eq!(
      result["addressBech32"],
      "addr1vxjkgj7t3nvzkhsy0pjhuty0a65x26p2tvsdk3wsjkq8mpqv9ggga"
    );
  }

  #[test]
  fn rejects_malformed_record_and_network() {
    assert!(resolve_cns_address_record("{}", 1).is_err());
    assert!(resolve_cns_address_record(KEY_ADDRESS, 16).is_err());
  }
}
