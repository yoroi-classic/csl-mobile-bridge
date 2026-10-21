use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_script_hash::script_hash_hex_from_cbor;

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
pub unsafe extern "C" fn cml_bridge_script_hash_hex_from_cbor(
  args_json: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args_json.is_null() {
    set_message(error, "script hash arguments are null".to_owned());
    return false;
  }
  let input = match CStr::from_ptr(args_json).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("script hash arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match script_hash_hex_from_cbor(input) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[cfg(test)]
mod tests {
  use super::cml_bridge_script_hash_hex_from_cbor;
  use crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free;
  use std::ffi::{CStr, CString};

  #[test]
  fn c_abi_returns_the_expected_plutus_v2_hash() {
    let args = CString::new(r#"{"scriptType":"plutusV2","scriptCborHex":"40"}"#).unwrap();
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();
    let ok =
      unsafe { cml_bridge_script_hash_hex_from_cbor(args.as_ptr(), &mut result, &mut error) };
    assert!(ok, "script hash C ABI failed: {}", unsafe { CStr::from_ptr(error).to_string_lossy() });
    assert_eq!(
      unsafe { CStr::from_ptr(result).to_str().unwrap() },
      "a646474b8f5431261506b6c273d307c7569a4eb6c96b42dd4a29520a",
    );
    unsafe { cml_bridge_charptr_free(&mut result) };
    if !error.is_null() {
      unsafe { cml_bridge_charptr_free(&mut error) };
    }
  }
}
