use cml_crypto::Ed25519KeyHash;

/// Normalize a pool identifier or 28-byte key hash to pool bech32 and hex.
pub fn normalize_pool_identifier(pool_id_or_hash: &str) -> Result<(String, String), String> {
  let key_hash = if is_hex_key_hash(pool_id_or_hash) {
    Ed25519KeyHash::from_hex(pool_id_or_hash).map_err(|err| err.to_string())?
  } else {
    Ed25519KeyHash::from_bech32(pool_id_or_hash).map_err(|err| err.to_string())?
  };
  let id = key_hash.to_bech32("pool").map_err(|err| err.to_string())?;
  Ok((id, key_hash.to_hex()))
}

fn is_hex_key_hash(value: &str) -> bool {
  value.len() == 56 && value.bytes().all(|byte| byte.is_ascii_hexdigit())
}

#[cfg(test)]
mod tests {
  use super::normalize_pool_identifier;

  #[test]
  fn normalizes_pool_id_and_hash_with_cml() {
    let pool_id = "pool1pmm654jfx088td54ekkkd0j28x6r5gnjdhnutzggursrxjnpk2y";
    let (id, hash) = normalize_pool_identifier(pool_id).unwrap();
    assert_eq!(id, pool_id);
    assert_eq!(hash, "0ef7aa564933ce75b695cdad66be4a39b43a22726de7c58908e0e033");
    assert_eq!(normalize_pool_identifier(&hash).unwrap(), (id.clone(), hash.clone()));
    assert_eq!(normalize_pool_identifier(&hash.to_uppercase()).unwrap(), (id, hash),);
  }

  #[test]
  fn rejects_invalid_pool_identifiers_and_hashes() {
    assert!(normalize_pool_identifier("not-a-pool-id").is_err());
    assert!(normalize_pool_identifier(&"0a".repeat(27)).is_err());
  }
}
