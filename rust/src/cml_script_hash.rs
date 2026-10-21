use cml_chain::{
  plutus::{PlutusV1Script, PlutusV2Script, PlutusV3Script},
  serialization::Deserialize,
  transaction::NativeScript,
};
use cml_crypto::RawBytesEncoding;
use serde::Deserialize as SerdeDeserialize;

#[derive(SerdeDeserialize)]
#[serde(rename_all = "camelCase")]
struct ScriptHashArguments {
  script_type: String,
  script_cbor_hex: String,
}

/// Calculate a policy/script hash from serialized native or Plutus script CBOR.
/// Plutus language is explicit because the language namespace is part of its hash.
pub fn script_hash_hex_from_cbor(args_json: &str) -> Result<String, String> {
  let args: ScriptHashArguments = serde_json::from_str(args_json)
    .map_err(|err| format!("invalid script hash arguments: {err}"))?;
  let bytes =
    hex::decode(&args.script_cbor_hex).map_err(|err| format!("invalid script CBOR hex: {err}"))?;
  let hash = match args.script_type.as_str() {
    "native" => NativeScript::from_cbor_bytes(&bytes)
      .map_err(|err| format!("invalid native script CBOR: {err}"))?
      .hash()
      .to_raw_bytes()
      .to_vec(),
    "plutusV1" => PlutusV1Script::from_cbor_bytes(&bytes)
      .map_err(|err| format!("invalid Plutus V1 script CBOR: {err}"))?
      .hash()
      .to_raw_bytes()
      .to_vec(),
    "plutusV2" => PlutusV2Script::from_cbor_bytes(&bytes)
      .map_err(|err| format!("invalid Plutus V2 script CBOR: {err}"))?
      .hash()
      .to_raw_bytes()
      .to_vec(),
    "plutusV3" => PlutusV3Script::from_cbor_bytes(&bytes)
      .map_err(|err| format!("invalid Plutus V3 script CBOR: {err}"))?
      .hash()
      .to_raw_bytes()
      .to_vec(),
    unsupported => return Err(format!("unsupported script type: {unsupported}")),
  };
  Ok(hex::encode(hash))
}

#[cfg(test)]
mod tests {
  use super::script_hash_hex_from_cbor;

  #[test]
  fn hashes_native_and_versioned_plutus_scripts_with_distinct_namespaces() {
    let native = r#"{"scriptType":"native","scriptCborHex":"8200581c00000000000000000000000000000000000000000000000000000000"}"#;
    let plutus = r#"{"scriptCborHex":"40"}"#;
    let native_hash = script_hash_hex_from_cbor(native).unwrap();
    let v1 =
      script_hash_hex_from_cbor(&plutus.replace("}", ",\"scriptType\":\"plutusV1\"}")).unwrap();
    let v2 =
      script_hash_hex_from_cbor(&plutus.replace("}", ",\"scriptType\":\"plutusV2\"}")).unwrap();
    let v3 =
      script_hash_hex_from_cbor(&plutus.replace("}", ",\"scriptType\":\"plutusV3\"}")).unwrap();

    assert_eq!(native_hash, "9dcfe5a661b6bc3af0999d06416d95842ba7c693dc0e246f5e0a5e33");
    assert_eq!(v1, "e0a714319812c3f773ba04ec5d6b3ffcd5aad85006805b047b082541");
    assert_eq!(v2, "a646474b8f5431261506b6c273d307c7569a4eb6c96b42dd4a29520a");
    assert_eq!(v3, "b16b56f5ec064be6ac3cab6035efae86b366cc3dc4a0d571603d70e5");
    assert_ne!(v1, v2);
    assert_ne!(v2, v3);
    assert_ne!(v1, v3);
  }

  #[test]
  fn rejects_malformed_cbor_and_unknown_script_type() {
    assert!(script_hash_hex_from_cbor(r#"{"scriptType":"native","scriptCborHex":"zz"}"#)
      .unwrap_err()
      .contains("hex"));
    assert!(script_hash_hex_from_cbor(r#"{"scriptType":"native","scriptCborHex":"ff"}"#)
      .unwrap_err()
      .contains("CBOR"));
    assert!(script_hash_hex_from_cbor(r#"{"scriptType":"plutus","scriptCborHex":"40"}"#)
      .unwrap_err()
      .contains("unsupported script type"));
  }
}
