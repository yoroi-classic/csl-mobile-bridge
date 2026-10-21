use super::bridge_tools::string::CharPtr;
use crate::cml_key::{
  catalyst_private_key_hex_from_entropy, public_key_hex_from_private_key_hex,
  sign_ed25519_message_hex,
};
use std::ffi::{CStr, CString};

fn set_message(target: &mut CharPtr, message: String) -> bool {
  match CString::new(message) {
    Ok(value) => {
      *target = value.into_raw();
      true
    }
    Err(_) => false,
  }
}
unsafe fn text<'a>(ptr: CharPtr, error: &mut CharPtr, label: &str) -> Option<&'a str> {
  if ptr.is_null() {
    set_message(error, format!("{label} is null"));
    return None;
  }
  match CStr::from_ptr(ptr).to_str() {
    Ok(value) => Some(value),
    Err(err) => {
      set_message(error, format!("{label} is not UTF-8: {err}"));
      None
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_public_key_hex_from_private_key_hex(
  key: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  let Some(key) = text(key, error, "private key hex") else {
    return false;
  };
  match public_key_hex_from_private_key_hex(key) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_sign_ed25519_message_hex(
  key: CharPtr, message: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  let Some(key) = text(key, error, "private key hex") else {
    return false;
  };
  let Some(message) = text(message, error, "message hex") else {
    return false;
  };
  match sign_ed25519_message_hex(key, message) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_catalyst_private_key_hex_from_entropy(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  let Some(args) = text(args, error, "Catalyst key arguments") else {
    return false;
  };
  match catalyst_private_key_hex_from_entropy(args) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}
