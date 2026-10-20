use cml_chain::{crypto::hash::hash_plutus_data, plutus::PlutusData, serialization::Deserialize};
use cml_crypto::RawBytesEncoding;

/// Hash serialized Plutus data with CML, accepting the CBOR hex used by Yoroi.
pub fn hash_plutus_data_cbor_hex(cbor_hex: &str) -> Result<String, String> {
  let data = parse_plutus_data_cbor_hex(cbor_hex)?;
  Ok(hash_plutus_data(&data).to_hex())
}

/// Decode Plutus CBOR into Yoroi's stable, lossless display structure.
pub fn decode_plutus_data_cbor_hex(cbor_hex: &str) -> Result<String, String> {
  fn decode(data: &PlutusData) -> serde_json::Value {
    match data {
      PlutusData::ConstrPlutusData(constr) => serde_json::json!({
        "type": "constructor",
        "index": constr.alternative,
        "fields": constr.fields.iter().map(decode).collect::<Vec<_>>(),
      }),
      PlutusData::Map(map) => serde_json::json!({
        "type": "map",
        "entries": map.entries.iter().map(|(key, value)| serde_json::json!({"key": decode(key), "value": decode(value)})).collect::<Vec<_>>(),
      }),
      PlutusData::List {list, ..} => serde_json::json!({"type": "list", "items": list.iter().map(decode).collect::<Vec<_>>()}),
      PlutusData::Integer(integer) => serde_json::json!({"type": "integer", "value": integer.to_string()}),
      PlutusData::Bytes {bytes, ..} => serde_json::json!({"type": "bytes", "value": hex::encode(bytes)}),
    }
  }
  let data = parse_plutus_data_cbor_hex(cbor_hex)?;
  serde_json::to_string(&decode(&data)).map_err(|err| err.to_string())
}

fn parse_plutus_data_cbor_hex(cbor_hex: &str) -> Result<PlutusData, String> {
  let bytes = hex::decode(cbor_hex).map_err(|err| format!("invalid Plutus data hex: {err}"))?;
  PlutusData::from_cbor_bytes(&bytes).map_err(|err| format!("invalid Plutus data CBOR: {err}"))
}

#[cfg(test)]
mod tests {
  use super::{decode_plutus_data_cbor_hex, hash_plutus_data_cbor_hex};
  use cardano_serialization_lib as csl;

  #[test]
  fn plutus_data_hash_matches_csl_for_common_and_nested_shapes() {
    for cbor in ["80", "d87980"] {
      let legacy = csl::hash_plutus_data(&csl::PlutusData::from_bytes(hex::decode(cbor).unwrap()).unwrap_or_else(|err| panic!("CSL rejected {}: {}", cbor, err))).to_hex();
      assert_eq!(hash_plutus_data_cbor_hex(cbor).unwrap(), legacy, "datum {cbor}");
    }
  }

  #[test]
  fn malformed_datum_cbor_is_rejected() {
    assert!(hash_plutus_data_cbor_hex("zz").unwrap_err().contains("invalid Plutus data hex"));
    assert!(hash_plutus_data_cbor_hex("ff").unwrap_err().contains("invalid Plutus data CBOR"));
  }

  #[test]
  fn decoder_preserves_constructor_integer_and_byte_shapes() {
    assert_eq!(serde_json::from_str::<serde_json::Value>(&decode_plutus_data_cbor_hex("d87980").unwrap()).unwrap(), serde_json::json!({"type":"constructor","index":0,"fields":[]}));
    assert_eq!(serde_json::from_str::<serde_json::Value>(&decode_plutus_data_cbor_hex("80").unwrap()).unwrap(), serde_json::json!({"type":"list","items":[]}));
    assert_eq!(serde_json::from_str::<serde_json::Value>(&decode_plutus_data_cbor_hex("4101").unwrap()).unwrap(), serde_json::json!({"type":"bytes","value":"01"}));
  }
}
