use cml_chain::{
  address::{Address, BaseAddress, EnterpriseAddress},
  certs::Credential,
  plutus::{ConstrPlutusData, PlutusData},
  serialization::{Deserialize, Serialize},
  utils::BigInteger,
};
use cml_crypto::{RawBytesEncoding, ScriptHash};
use std::str::FromStr;

fn parse_datum(cbor_hex: &str) -> Result<PlutusData, String> {
  let bytes = hex::decode(cbor_hex).map_err(|err| format!("invalid escrow datum hex: {err}"))?;
  PlutusData::from_cbor_bytes(&bytes).map_err(|err| format!("invalid escrow datum CBOR: {err}"))
}

fn datum_fields(datum: &PlutusData) -> Result<&[PlutusData], String> {
  let PlutusData::ConstrPlutusData(constr) = datum else {
    return Err("Invalid escrow datum: expected Constr(0, ...)".to_owned());
  };
  if constr.alternative != 0 {
    return Err("Invalid escrow datum: expected Constr(0, ...)".to_owned());
  }
  if constr.fields.len() != 5 {
    return Err(format!("Invalid escrow datum: expected 5 fields, got {}", constr.fields.len()));
  }
  Ok(&constr.fields)
}

fn constr_fields<'a>(
  data: &'a PlutusData, alternative: u64, label: &str,
) -> Result<&'a [PlutusData], String> {
  let PlutusData::ConstrPlutusData(constr) = data else {
    return Err(format!("Invalid escrow datum: {label}"));
  };
  if constr.alternative != alternative {
    return Err(format!("Invalid escrow datum: {label}"));
  }
  Ok(&constr.fields)
}

fn bytes_field(data: &PlutusData, label: &str) -> Result<String, String> {
  let PlutusData::Bytes { bytes, .. } = data else {
    return Err(format!("Invalid escrow datum: {label}"));
  };
  if bytes.len() != 28 {
    return Err(format!("Invalid escrow datum: {label} must be 28 bytes"));
  }
  Ok(hex::encode(bytes))
}

fn integer_field(data: &PlutusData, label: &str) -> Result<String, String> {
  let PlutusData::Integer(value) = data else {
    return Err(format!("Invalid escrow datum: {label} is not an integer"));
  };
  Ok(value.to_string())
}

/// Decode the escrow contract datum into a stable JSON DTO; integers remain strings.
pub fn escrow_datum_info_json(cbor_hex: &str) -> Result<String, String> {
  let datum = parse_datum(cbor_hex)?;
  let fields = datum_fields(&datum)?;
  let address_fields = constr_fields(&fields[0], 0, "address field")?;
  if !(1..=2).contains(&address_fields.len()) {
    return Err("Invalid escrow datum: address field count".to_owned());
  }
  let payment_fields = constr_fields(&address_fields[0], 0, "payment cred")?;
  if payment_fields.len() != 1 {
    return Err("Invalid escrow datum: payment cred field count".to_owned());
  }
  let payment_cred_hash = bytes_field(&payment_fields[0], "payment cred bytes")?;

  let staking_cred_hash = if address_fields.len() == 1 {
    None
  } else {
    let stake_fields = constr_fields(&address_fields[1], 0, "staking cred")?;
    if stake_fields.len() != 1 {
      return Err("Invalid escrow datum: staking cred field count".to_owned());
    }
    match &stake_fields[0] {
      PlutusData::ConstrPlutusData(nothing)
        if nothing.alternative == 1 && nothing.fields.is_empty() =>
      {
        None
      }
      some => {
        let just_fields = constr_fields(some, 0, "staking credential option")?;
        if just_fields.len() != 1 {
          return Err("Invalid escrow datum: staking credential option field count".to_owned());
        }
        let hash_fields = constr_fields(&just_fields[0], 0, "staking hash")?;
        if hash_fields.len() != 1 {
          return Err("Invalid escrow datum: staking hash field count".to_owned());
        }
        Some(bytes_field(&hash_fields[0], "staking cred bytes")?)
      }
    }
  };

  let info = serde_json::json!({
    "paymentCredHash": payment_cred_hash,
    "stakingCredHash": staking_cred_hash,
    "nightPerThaw": integer_field(&fields[1], "night_per_thaw")?,
    "nextThawTime": integer_field(&fields[2], "next_thaw_time")?,
    "thawsRemaining": integer_field(&fields[3], "thaws_remaining")?,
    "interval": integer_field(&fields[4], "interval")?,
  });
  serde_json::to_string(&info).map_err(|err| err.to_string())
}

/// Advance the next thaw time and decrement the remaining count.
pub fn updated_escrow_datum_cbor_hex(cbor_hex: &str) -> Result<String, String> {
  let datum = parse_datum(cbor_hex)?;
  let fields = datum_fields(&datum)?;
  escrow_datum_info_json(cbor_hex)?; // reject malformed nested address/field values
  let next = integer_field(&fields[2], "next_thaw_time")?
    .parse::<u64>()
    .map_err(|err| format!("Invalid escrow datum: next_thaw_time out of range: {err}"))?;
  let interval = integer_field(&fields[4], "interval")?
    .parse::<u64>()
    .map_err(|err| format!("Invalid escrow datum: interval out of range: {err}"))?;
  let remaining = integer_field(&fields[3], "thaws_remaining")?
    .parse::<u64>()
    .map_err(|err| format!("Invalid escrow datum: thaws_remaining out of range: {err}"))?;
  let new_next = next
    .checked_add(interval)
    .ok_or_else(|| "Invalid escrow datum: next_thaw_time overflow".to_owned())?;
  let new_remaining = remaining
    .checked_sub(1)
    .ok_or_else(|| "Invalid escrow datum: no thaws remaining".to_owned())?;

  let mut updated_fields = fields.to_vec();
  updated_fields[2] = PlutusData::new_integer(
    BigInteger::from_str(&new_next.to_string()).map_err(|err| err.to_string())?,
  );
  updated_fields[3] = PlutusData::new_integer(
    BigInteger::from_str(&new_remaining.to_string()).map_err(|err| err.to_string())?,
  );
  Ok(hex::encode(
    PlutusData::new_constr_plutus_data(ConstrPlutusData::new(0, updated_fields)).to_cbor_bytes(),
  ))
}

/// Derive escrow script address while retaining a base address's stake credential.
pub fn derive_escrow_address(
  eligible_address: &str, script_hash_hex: &str, network: u8,
) -> Result<String, String> {
  let address = Address::from_bech32(eligible_address).map_err(|err| err.to_string())?;
  let script_hash_bytes =
    hex::decode(script_hash_hex).map_err(|err| format!("invalid escrow script hash hex: {err}"))?;
  let script_hash =
    ScriptHash::from_raw_bytes(&script_hash_bytes).map_err(|err| err.to_string())?;
  let payment = Credential::new_script(script_hash);
  let escrow_address = match BaseAddress::from_address(&address) {
    Some(base) => BaseAddress::new(network, payment, base.stake).to_address(),
    None => EnterpriseAddress::new(network, payment).to_address(),
  };
  escrow_address.to_bech32(None).map_err(|err| err.to_string())
}

#[cfg(test)]
mod tests {
  use super::{derive_escrow_address, escrow_datum_info_json, updated_escrow_datum_cbor_hex};
  use cml_chain::{
    plutus::{ConstrPlutusData, PlutusData},
    serialization::Serialize,
  };

  const SCRIPT_HASH: &str = "5986bfcc0cbfc60dec8df87715cc95d03817aac386b0e9d33da03b39";
  const BASE: &str = "addr_test1qqhchrw4umcrf90ew5ep85zefj9724c5jcfg6kp667qau789d6z307gnggrp3hgye75yzgh5q0w6unkqnvfxjfu7vxlswtaxme";
  const ENTERPRISE: &str = "addr_test1vqhchrw4umcrf90ew5ep85zefj9724c5jcfg6kp667qau7qq338n3";

  fn constr(alternative: u64, fields: Vec<PlutusData>) -> PlutusData {
    PlutusData::new_constr_plutus_data(ConstrPlutusData::new(alternative, fields))
  }

  fn sample_datum(remaining: u64) -> String {
    let payment_hash = vec![0; 28];
    let stake_hash = vec![0x11; 28];
    let address = constr(
      0,
      vec![
        constr(0, vec![PlutusData::new_bytes(payment_hash)]),
        constr(0, vec![constr(0, vec![constr(0, vec![PlutusData::new_bytes(stake_hash)])])]),
      ],
    );
    let datum = constr(
      0,
      vec![
        address,
        PlutusData::new_integer("1000000".parse().unwrap()),
        PlutusData::new_integer("1000000".parse().unwrap()),
        PlutusData::new_integer(remaining.to_string().parse().unwrap()),
        PlutusData::new_integer("1000000".parse().unwrap()),
      ],
    );
    hex::encode(datum.to_cbor_bytes())
  }

  #[test]
  fn parses_and_updates_the_contract_datum_without_number_conversion() {
    let fixture = sample_datum(2);
    let info: serde_json::Value =
      serde_json::from_str(&escrow_datum_info_json(&fixture).unwrap()).unwrap();
    assert_eq!(info["paymentCredHash"], "00".repeat(28));
    assert_eq!(info["stakingCredHash"], "11".repeat(28));
    assert_eq!(info["nightPerThaw"], "1000000");
    assert_eq!(info["nextThawTime"], "1000000");
    assert_eq!(info["thawsRemaining"], "2");
    assert_eq!(info["interval"], "1000000");
    let updated = updated_escrow_datum_cbor_hex(&fixture).unwrap();
    let updated_info: serde_json::Value =
      serde_json::from_str(&escrow_datum_info_json(&updated).unwrap()).unwrap();
    assert_eq!(updated_info["nextThawTime"], "2000000");
    assert_eq!(updated_info["thawsRemaining"], "1");
    assert_eq!(updated_info["paymentCredHash"], info["paymentCredHash"]);
    assert_eq!(updated_info["stakingCredHash"], info["stakingCredHash"]);

    // CML emits definite-length Plutus lists while CSL emits indefinite-length
    // lists. The ledger datum structure is equivalent; assert its decoded
    // contract fields above rather than imposing a byte-format dependency.
  }

  #[test]
  fn rejects_invalid_or_exhausted_datum() {
    assert!(escrow_datum_info_json("zz").is_err());
    assert!(updated_escrow_datum_cbor_hex(&sample_datum(0))
      .unwrap_err()
      .contains("no thaws remaining"));
  }

  #[test]
  fn script_address_matches_frozen_base_and_enterprise_vectors() {
    assert_eq!(derive_escrow_address(BASE, SCRIPT_HASH, 0).unwrap(), "addr_test1zpvcd07vpjluvr0v3hu8w9wvjhgrs9a2cwrtp6wn8ksrkw09d6z307gnggrp3hgye75yzgh5q0w6unkqnvfxjfu7vxlslphzte");
    assert_eq!(
      derive_escrow_address(ENTERPRISE, SCRIPT_HASH, 0).unwrap(),
      "addr_test1wpvcd07vpjluvr0v3hu8w9wvjhgrs9a2cwrtp6wn8ksrkwg3xg088"
    );
  }
}
