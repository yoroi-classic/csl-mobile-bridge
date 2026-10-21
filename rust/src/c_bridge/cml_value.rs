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
