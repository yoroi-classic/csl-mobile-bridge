use cml_chain::{crypto::hash::hash_plutus_data, plutus::PlutusData, serialization::Deserialize};
use cml_crypto::RawBytesEncoding;

/// Hash serialized Plutus data with CML, accepting the CBOR hex used by Yoroi.
pub fn hash_plutus_data_cbor_hex(cbor_hex: &str) -> Result<String, String> {
  let bytes = hex::decode(cbor_hex).map_err(|err| format!("invalid Plutus data hex: {err}"))?;
  let data = PlutusData::from_cbor_bytes(&bytes).map_err(|err| format!("invalid Plutus data CBOR: {err}"))?;
  Ok(hash_plutus_data(&data).to_hex())
}

#[cfg(test)]
mod tests {
  use super::hash_plutus_data_cbor_hex;
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
}
