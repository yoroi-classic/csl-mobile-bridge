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

#[cfg(test)]
mod tests {
  use super::cml_bridge_datum_info_from_output_cbor_hex;
  use crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free;
  use std::ffi::CString;

  #[test]
  fn malformed_inline_datum_returns_false_at_the_c_abi() {
    let output = CString::new(
      "a3005839000000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf0000b03c3aa052f51c086c54bd4059ead2d2e426ac89fa4b3ce41cbf011a001e8480028201d81846d8799f01e0ff",
    )
    .unwrap();
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();

    assert!(!unsafe {
      cml_bridge_datum_info_from_output_cbor_hex(output.as_ptr(), &mut result, &mut error)
    });
    assert!(result.is_null());
    assert!(!error.is_null());
    unsafe { cml_bridge_charptr_free(&mut error) };
  }
}
