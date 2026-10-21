use cml_crypto::{Ed25519Signature, PublicKey, RawBytesEncoding};

/// Verify a signature over the exact message bytes supplied by the caller.
pub fn verify_ed25519_signature(
  public_key_hex: &str, message_hex: &str, signature_hex: &str,
) -> Result<bool, String> {
  let public_key_bytes =
    hex::decode(public_key_hex).map_err(|err| format!("invalid public key hex: {err}"))?;
  let public_key = PublicKey::from_raw_bytes(&public_key_bytes)
    .map_err(|err| format!("invalid public key: {err}"))?;
  let message = hex::decode(message_hex).map_err(|err| format!("invalid message hex: {err}"))?;
  let signature_bytes =
    hex::decode(signature_hex).map_err(|err| format!("invalid signature hex: {err}"))?;
  let signature = Ed25519Signature::from_raw_bytes(&signature_bytes)
    .map_err(|err| format!("invalid signature: {err}"))?;
  Ok(public_key.verify(&message, &signature))
}

/// Hash a raw Ed25519 public key to its Cardano 28-byte key hash.
pub fn public_key_hash_hex_from_raw_hex(public_key_hex: &str) -> Result<String, String> {
  let public_key_bytes =
    hex::decode(public_key_hex).map_err(|err| format!("invalid public key hex: {err}"))?;
  let public_key = PublicKey::from_raw_bytes(&public_key_bytes)
    .map_err(|err| format!("invalid public key: {err}"))?;
  Ok(public_key.hash().to_hex())
}

#[cfg(test)]
mod tests {
  use super::{public_key_hash_hex_from_raw_hex, verify_ed25519_signature};

  const PUBLIC_KEY_HEX: &str = "e521dbb738431b454f5967e47f11c689ba0e3ad70bbdc2d5042ab078ebac3366";
  const MESSAGE_HEX: &str = "4349502d3820434f5345205369675f7374727563747572652066697874757265";
  const SIGNATURE_HEX: &str = "793b3ba5128d0ba85afa5a766d86342436027826227e1af047cc1c45ecadc245cdd01e6cea2a47035ab4b610c63d919e3b52182620e03947d8910a973908da02";

  #[test]
  fn verifies_cip8_signature_and_rejects_other_message() {
    assert!(verify_ed25519_signature(PUBLIC_KEY_HEX, MESSAGE_HEX, SIGNATURE_HEX).unwrap());
    assert!(!verify_ed25519_signature(PUBLIC_KEY_HEX, "00", SIGNATURE_HEX).unwrap());
  }

  #[test]
  fn hashes_public_key_to_frozen_cardano_key_hash() {
    assert_eq!(
      public_key_hash_hex_from_raw_hex(PUBLIC_KEY_HEX).unwrap(),
      "af5a8183f67cdf5fde00b60964aa26f10cfdb38dd3064fb6ff3fee50"
    );
  }
}
