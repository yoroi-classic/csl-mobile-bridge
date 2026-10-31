use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_signature::{public_key_hash_hex_from_raw_hex, verify_ed25519_signature};

fn set_message(target: &mut CharPtr, message: String) -> bool {
  match CString::new(message) {
    Ok(value) => {
      *target = value.into_raw();
      true
    }
    Err(_) => false,
  }
}

fn arg<'a>(args: &'a serde_json::Value, name: &str) -> Result<&'a str, String> {
  match args.get(name) {
    None => Err(format!("missing {name}")),
    Some(value) => value.as_str().ok_or_else(|| format!("{name} must be a string")),
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_verify_ed25519_signature(
  args_json: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  let Some(ptr) = args_json.as_ref() else {
    set_message(error, "signature args are null".into());
    return false;
  };
  let args = match CStr::from_ptr(ptr)
    .to_str()
    .map_err(|err| err.to_string())
    .and_then(|s| serde_json::from_str::<serde_json::Value>(s).map_err(|err| err.to_string()))
  {
    Ok(args) => args,
    Err(err) => {
      set_message(error, err);
      return false;
    }
  };
  let result_value: Result<String, String> = (|| {
    Ok(
      verify_ed25519_signature(
        arg(&args, "publicKeyHex")?,
        arg(&args, "messageHex")?,
        arg(&args, "signatureHex")?,
      )?
      .to_string(),
    )
  })();
  match result_value {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_public_key_hash_hex_from_raw_hex(
  args_json: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  let Some(ptr) = args_json.as_ref() else {
    set_message(error, "public key args are null".into());
    return false;
  };
  let args = match CStr::from_ptr(ptr)
    .to_str()
    .map_err(|err| err.to_string())
    .and_then(|s| serde_json::from_str::<serde_json::Value>(s).map_err(|err| err.to_string()))
  {
    Ok(args) => args,
    Err(err) => {
      set_message(error, err);
      return false;
    }
  };
  match arg(&args, "publicKeyHex").and_then(public_key_hash_hex_from_raw_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}
