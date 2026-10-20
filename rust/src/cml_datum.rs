use cml_chain::{crypto::hash::hash_plutus_data, plutus::PlutusData, serialization::{Deserialize, Serialize}};
use cml_chain::transaction::{DatumOption, TransactionOutput};
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

/// Extract datum hash/data from serialized transaction-output CBOR.
pub fn datum_info_from_output_cbor_hex(output_cbor_hex: &str) -> Result<String, String> {
  let bytes = hex::decode(output_cbor_hex)
    .map_err(|err| format!("invalid transaction output hex: {err}"))?;
  let output = TransactionOutput::from_cbor_bytes(&bytes)
    .map_err(|err| format!("invalid transaction output CBOR: {err}"))?;
  let datum = match output {
    TransactionOutput::AlonzoFormatTxOut(output) => output.datum_hash.map(|hash| {
      serde_json::json!({"type":"hash", "hash": hash.to_hex()})
    }),
    TransactionOutput::ConwayFormatTxOut(output) => output.datum_option.map(|datum| match datum {
      DatumOption::Hash {datum_hash, ..} => serde_json::json!({"type":"hash", "hash": datum_hash.to_hex()}),
      DatumOption::Datum {datum, ..} => {
        let data = hex::encode(datum.to_cbor_bytes());
        serde_json::json!({"type":"inline", "hash": hash_plutus_data(&datum).to_hex(), "data": data})
      },
    }),
  };
  serde_json::to_string(&datum).map_err(|err| err.to_string())
}

fn parse_plutus_data_cbor_hex(cbor_hex: &str) -> Result<PlutusData, String> {
  let bytes = hex::decode(cbor_hex).map_err(|err| format!("invalid Plutus data hex: {err}"))?;
  PlutusData::from_cbor_bytes(&bytes).map_err(|err| format!("invalid Plutus data CBOR: {err}"))
}

#[cfg(test)]
mod tests {
  use super::{datum_info_from_output_cbor_hex, decode_plutus_data_cbor_hex, hash_plutus_data_cbor_hex};
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

  #[test]
  fn output_datum_info_matches_csl_inline_and_hash_outputs() {
    use cardano_serialization_lib as csl;
    let address = csl::Address::from_bech32("addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam").unwrap();
    let data = csl::PlutusData::new_empty_constr_plutus_data(&csl::BigNum::zero());
    let mut inline_output = csl::TransactionOutput::new(&address, &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()));
    inline_output.set_plutus_data(&data);
    let inline_info: serde_json::Value = serde_json::from_str(
      &datum_info_from_output_cbor_hex(&hex::encode(inline_output.to_bytes())).unwrap(),
    ).unwrap();
    assert_eq!(inline_info["type"], "inline");
    assert_eq!(inline_info["hash"], csl::hash_plutus_data(&data).to_hex());
    assert_eq!(inline_info["data"], data.to_hex());

    let hash = csl::hash_plutus_data(&data);
    let mut hash_output = csl::TransactionOutput::new(&address, &csl::Value::new(&csl::BigNum::from_str("2000000").unwrap()));
    hash_output.set_data_hash(&csl::DataHash::from_bytes(hash.to_bytes()).unwrap());
    let hash_info: serde_json::Value = serde_json::from_str(
      &datum_info_from_output_cbor_hex(&hex::encode(hash_output.to_bytes())).unwrap(),
    ).unwrap();
    assert_eq!(hash_info, serde_json::json!({"type":"hash", "hash": hash.to_hex()}));
    assert_eq!(datum_info_from_output_cbor_hex("zz").unwrap_err().contains("invalid transaction output hex"), true);
    assert_eq!(datum_info_from_output_cbor_hex("ff").unwrap_err().contains("invalid transaction output CBOR"), true);
  }
}
