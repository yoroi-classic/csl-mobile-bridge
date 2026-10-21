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

#[cfg(test)]
mod tests {
  use super::cml_bridge_native_script_key_hashes_json;
  use crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free;
  use std::ffi::CString;

  #[test]
  fn malformed_native_script_returns_false_without_unwinding() {
    let input = CString::new("820181f6").unwrap();
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();
    assert!(!unsafe { cml_bridge_native_script_key_hashes_json(input.as_ptr(), &mut result, &mut error) });
    assert!(result.is_null());
    assert!(!error.is_null());
    unsafe { cml_bridge_charptr_free(&mut error) };
  }
}
