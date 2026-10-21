use cml_chain::{serialization::Deserialize, transaction::NativeScript};
use cml_crypto::RawBytesEncoding;
use std::collections::HashSet;

fn append_required_key_hashes(
  script: &NativeScript, seen: &mut HashSet<String>, hashes: &mut Vec<String>,
) {
  match script {
    NativeScript::ScriptPubkey(script) => {
      let hash = hex::encode(script.ed25519_key_hash.to_raw_bytes());
      if seen.insert(hash.clone()) {
        hashes.push(hash);
      }
    }
    NativeScript::ScriptAll(script) => {
      for child in &script.native_scripts {
        append_required_key_hashes(child, seen, hashes);
      }
    }
    NativeScript::ScriptAny(script) => {
      for child in &script.native_scripts {
        append_required_key_hashes(child, seen, hashes);
      }
    }
    NativeScript::ScriptNOfK(script) => {
      for child in &script.native_scripts {
        append_required_key_hashes(child, seen, hashes);
      }
    }
    NativeScript::ScriptInvalidBefore(_) | NativeScript::ScriptInvalidHereafter(_) => {}
  }
}

/// Return unique key hashes nested in a decoded native script, in traversal order.
pub(crate) fn native_script_required_key_hashes(script: &NativeScript) -> Vec<String> {
  let mut seen = HashSet::new();
  let mut hashes = Vec::new();
  append_required_key_hashes(script, &mut seen, &mut hashes);
  hashes
}

/// Return unique required key hashes in recursive native-script traversal order.
pub fn native_script_required_key_hashes_json(script_cbor_hex: &str) -> Result<String, String> {
  let bytes =
    hex::decode(script_cbor_hex).map_err(|err| format!("invalid native script CBOR hex: {err}"))?;
  let script = NativeScript::from_cbor_bytes(&bytes)
    .map_err(|err| format!("invalid native script CBOR: {err}"))?;
  serde_json::to_string(&native_script_required_key_hashes(&script)).map_err(|err| err.to_string())
}

#[cfg(test)]
mod tests {
  use super::native_script_required_key_hashes_json;

  const KEY_A: &str = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const KEY_B: &str = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

  #[test]
  fn returns_unique_recursive_key_hashes_in_traversal_order() {
    // ScriptAny([ScriptPubkey(A), ScriptAll([ScriptPubkey(B), ScriptPubkey(A)])])
    let script = format!("8202828200581c{KEY_A}8201818200581c{KEY_B}8200581c{KEY_A}");
    assert_eq!(
      native_script_required_key_hashes_json(&script).unwrap(),
      format!(r#"["{KEY_A}","{KEY_B}"]"#),
    );
  }

  #[test]
  fn timelocks_require_no_key_hashes() {
    // ScriptAll([InvalidBefore(1), InvalidHereafter(2)])
    assert_eq!(native_script_required_key_hashes_json("820182820401820502").unwrap(), "[]",);
  }

  #[test]
  fn rejects_invalid_hex_and_malformed_script_key_hashes() {
    assert!(native_script_required_key_hashes_json("zz").unwrap_err().contains("hex"));
    assert!(native_script_required_key_hashes_json("8200581caa").is_err());
  }
}
