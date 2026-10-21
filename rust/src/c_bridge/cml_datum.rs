use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_datum::{
  datum_info_from_output_cbor_hex, decode_plutus_data_cbor_hex, hash_plutus_data_cbor_hex,
};

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
pub unsafe extern "C" fn cml_bridge_hash_plutus_data_cbor_hex(
  cbor_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if cbor_hex.is_null() {
    set_message(error, "Plutus data CBOR hex is null".to_owned());
    return false;
  }
  let cbor_hex = match CStr::from_ptr(cbor_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("Plutus data CBOR hex is not UTF-8: {err}"));
      return false;
    }
  };
  match hash_plutus_data_cbor_hex(cbor_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_decode_plutus_data_cbor_hex(
  cbor_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if cbor_hex.is_null() {
    set_message(error, "Plutus data CBOR hex is null".to_owned());
    return false;
  }
  let cbor_hex = match CStr::from_ptr(cbor_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("Plutus data CBOR hex is not UTF-8: {err}"));
      return false;
    }
  };
  match decode_plutus_data_cbor_hex(cbor_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_datum_info_from_output_cbor_hex(
  output_cbor_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if output_cbor_hex.is_null() {
    set_message(error, "transaction output CBOR hex is null".to_owned());
    return false;
  }
  let output_cbor_hex = match CStr::from_ptr(output_cbor_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("transaction output CBOR hex is not UTF-8: {err}"));
      return false;
    }
  };
  match datum_info_from_output_cbor_hex(output_cbor_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}
