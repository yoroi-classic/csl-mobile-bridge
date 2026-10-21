use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_native_script::native_script_key_hashes_json;

fn set_message(target: &mut CharPtr, message: String) -> bool {
  match CString::new(message) {
    Ok(value) => {
      *target = value.into_raw();
      true
    }
    Err(_) => false,
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_native_script_key_hashes_json(
  script_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if script_hex.is_null() {
    set_message(error, "native script CBOR hex is null".to_owned());
    return false;
  }
  let input = match CStr::from_ptr(script_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("native script CBOR hex is not UTF-8: {err}"));
      return false;
    }
  };
  match native_script_key_hashes_json(input) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}
