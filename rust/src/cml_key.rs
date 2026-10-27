use cml_crypto::{PrivateKey, RawBytesEncoding};

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct CatalystKeyArgs {
  entropy_hex: String,
  password_hex: String,
}

pub fn catalyst_private_key_hex_from_entropy(args_json: &str) -> Result<String, String> {
  use cml_crypto::Bip32PrivateKey;
  let args: CatalystKeyArgs = serde_json::from_str(args_json)
    .map_err(|err| format!("invalid Catalyst key arguments: {err}"))?;
  let entropy =
    hex::decode(args.entropy_hex).map_err(|err| format!("invalid mnemonic entropy hex: {err}"))?;
  if !matches!(entropy.len(), 16 | 20 | 24 | 28 | 32) {
    return Err("BIP39 entropy must be 16, 20, 24, 28, or 32 bytes".to_owned());
  }
  let password = hex::decode(args.password_hex)
    .map_err(|err| format!("invalid mnemonic password hex: {err}"))?;
  let root = Bip32PrivateKey::from_bip39_entropy(&entropy, &password);
  Ok(hex::encode(root.to_raw_key().to_raw_bytes()))
}

fn parse_private_key(hex_key: &str) -> Result<PrivateKey, String> {
  let bytes = hex::decode(hex_key).map_err(|err| format!("invalid private key hex: {err}"))?;
  match bytes.len() {
    32 => {
      PrivateKey::from_normal_bytes(&bytes).map_err(|err| format!("invalid raw private key: {err}"))
    }
    64 => PrivateKey::from_extended_bytes(&bytes)
      .map_err(|err| format!("invalid extended private key: {err}")),
    size => Err(format!("private key must be exactly 32 raw or 64 extended bytes, got {size}")),
  }
}

pub fn public_key_hex_from_private_key_hex(hex_key: &str) -> Result<String, String> {
  let key = parse_private_key(hex_key)?;
  Ok(hex::encode(key.to_public().to_raw_bytes()))
}

pub fn sign_ed25519_message_hex(hex_key: &str, message_hex: &str) -> Result<String, String> {
  let key = parse_private_key(hex_key)?;
  let message = hex::decode(message_hex).map_err(|err| format!("invalid message hex: {err}"))?;
  Ok(hex::encode(key.sign(&message).to_raw_bytes()))
}

#[cfg(test)]
mod tests {
  use super::{
    catalyst_private_key_hex_from_entropy, public_key_hex_from_private_key_hex,
    sign_ed25519_message_hex,
  };
  use cml_crypto::{PrivateKey, RawBytesEncoding};

  const EXTENDED_PRIVATE_KEY: &str = "00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
  const RAW_PRIVATE_KEY: &str = "0000000000000000000000000000000000000000000000000000000000000000";
  const CATALYST_RAW_KEY_SHA256: &str =
    "5ee16c0fc68637ffe09f0023e5206e3fcad0cfe484f4149b75229002ab73e245";
  const CATALYST_PASSWORD_RAW_KEY_HEX: &str =
    "287d83e3481ab2ec197cb8ff0ae64debb217771a2ede486910ed4ff9fb532f4e638ef287d002cdb319059db276d35ceda13e35faf322e7470536e17118bdd2dd";
  const CATALYST_RAW_KEY_PUBLIC_HEX: &str =
    "26a0a7144417696537eafe6e942715a6a06e4257531023dba17b33f5a283f5cd";
  const RFC8032_PRIVATE_KEY: &str =
    "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60";
  const RFC8032_PUBLIC_KEY: &str =
    "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
  const RFC8032_EMPTY_MESSAGE_SIGNATURE: &str =
    "e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b";

  #[test]
  fn derives_public_key_and_signs_exact_message_bytes() {
    assert_eq!(
      public_key_hex_from_private_key_hex(RFC8032_PRIVATE_KEY).unwrap(),
      RFC8032_PUBLIC_KEY
    );
    assert_eq!(
      sign_ed25519_message_hex(RFC8032_PRIVATE_KEY, "").unwrap(),
      RFC8032_EMPTY_MESSAGE_SIGNATURE
    );
    let public_key = public_key_hex_from_private_key_hex(EXTENDED_PRIVATE_KEY).unwrap();
    assert_eq!(public_key.len(), 64);
    let signature = sign_ed25519_message_hex(EXTENDED_PRIVATE_KEY, "010203").unwrap();
    assert_eq!(signature.len(), 128);
    assert_eq!(signature, sign_ed25519_message_hex(EXTENDED_PRIVATE_KEY, "010203").unwrap());
    assert_ne!(signature, sign_ed25519_message_hex(EXTENDED_PRIVATE_KEY, "010204").unwrap());
    assert_eq!(public_key_hex_from_private_key_hex(RAW_PRIVATE_KEY).unwrap().len(), 64);
    assert_eq!(sign_ed25519_message_hex(RAW_PRIVATE_KEY, "010203").unwrap().len(), 128);
  }

  #[test]
  fn rejects_wrong_key_size_and_invalid_hex() {
    assert!(public_key_hex_from_private_key_hex("01")
      .unwrap_err()
      .contains("32 raw or 64 extended bytes"));
    assert!(sign_ed25519_message_hex(EXTENDED_PRIVATE_KEY, "gg")
      .unwrap_err()
      .contains("message hex"));
  }

  #[test]
  fn catalyst_key_uses_bip39_entropy_and_password_without_truncating_raw_key() {
    // Synthetic entropy, test-only; the digest/public key are frozen compatibility checks.
    let args =
      serde_json::json!({"entropyHex":"000102030405060708090a0b0c0d0e0f","passwordHex":""})
        .to_string();
    let raw_key = catalyst_private_key_hex_from_entropy(&args).unwrap();
    assert_eq!(raw_key.len(), 128);
    let decoded = hex::decode(&raw_key).unwrap();
    use sha2::{Digest, Sha256};
    assert_eq!(hex::encode(Sha256::digest(&decoded)), CATALYST_RAW_KEY_SHA256);
    let key = PrivateKey::from_extended_bytes(&decoded).unwrap();
    assert_eq!(hex::encode(key.to_public().to_raw_bytes()), CATALYST_RAW_KEY_PUBLIC_HEX);
    let password_args =
      serde_json::json!({"entropyHex":"000102030405060708090a0b0c0d0e0f","passwordHex":"01"})
        .to_string();
    let password_key = catalyst_private_key_hex_from_entropy(&password_args).unwrap();
    assert_eq!(password_key, CATALYST_PASSWORD_RAW_KEY_HEX);
    assert_ne!(
      hex::encode(Sha256::digest(&hex::decode(password_key).unwrap())),
      CATALYST_RAW_KEY_SHA256
    );
    let invalid_entropy = serde_json::json!({"entropyHex":"0001","passwordHex":""}).to_string();
    assert!(catalyst_private_key_hex_from_entropy(&invalid_entropy)
      .unwrap_err()
      .contains("BIP39 entropy"));
    let invalid_password = serde_json::json!({
      "entropyHex":"000102030405060708090a0b0c0d0e0f",
      "passwordHex":"gg"
    })
    .to_string();
    assert!(catalyst_private_key_hex_from_entropy(&invalid_password)
      .unwrap_err()
      .contains("password hex"));
  }
}
