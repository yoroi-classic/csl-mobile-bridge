use super::bridge_tools::string::{read_input, set_message, CharPtr};
use crate::cml_value::{value_from_amounts_hex, value_from_hex_info_json};

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_value_from_hex_info_json(
  value_cbor_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  let Some(value_cbor_hex) = read_input(value_cbor_hex, error, "value CBOR hex") else {
    return false;
  };
  match value_from_hex_info_json(value_cbor_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_value_from_amounts_hex(
  args_json: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  let Some(args_json) = read_input(args_json, error, "value arguments") else {
    return false;
  };
  match value_from_amounts_hex(args_json) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[cfg(test)]
mod tests {
  use super::cml_bridge_value_from_hex_info_json;
  use crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free;
  use std::ffi::CString;

  #[test]
  fn malformed_value_cbor_returns_false_without_unwinding() {
    let input = CString::new("8200a1f640").unwrap();
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();
    assert!(!unsafe {
      cml_bridge_value_from_hex_info_json(input.as_ptr(), &mut result, &mut error)
    });
    assert!(result.is_null());
    assert!(!error.is_null());
    unsafe { cml_bridge_charptr_free(&mut error) };
  }
}
