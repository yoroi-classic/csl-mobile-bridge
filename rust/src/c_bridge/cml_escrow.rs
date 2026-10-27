use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_escrow::{
  derive_escrow_address, escrow_datum_info_json, updated_escrow_datum_cbor_hex,
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

unsafe fn input_string<'a>(value: CharPtr, name: &str, error: &mut CharPtr) -> Option<&'a str> {
  if value.is_null() {
    set_message(error, format!("{name} is null"));
    return None;
  }
  match CStr::from_ptr(value).to_str() {
    Ok(value) => Some(value),
    Err(err) => {
      set_message(error, format!("{name} is not UTF-8: {err}"));
      None
    }
  }
}

unsafe fn run(
  input: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
  operation: impl FnOnce(&str) -> Result<String, String>,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  let Some(input) = input_string(input, "escrow argument", error) else {
    return false;
  };
  match operation(input) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_escrow_datum_info_json(
  cbor_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  run(cbor_hex, result, error, escrow_datum_info_json)
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_updated_escrow_datum_cbor_hex(
  cbor_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  run(cbor_hex, result, error, updated_escrow_datum_cbor_hex)
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct AddressArgs {
  eligible_address: String,
  script_hash_hex: String,
  network_id: u8,
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_derive_escrow_address(
  args_json: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  run(args_json, result, error, |json| {
    let args: AddressArgs = serde_json::from_str(json)
      .map_err(|err| format!("invalid escrow address arguments: {err}"))?;
    derive_escrow_address(&args.eligible_address, &args.script_hash_hex, args.network_id)
  })
}

#[cfg(test)]
mod tests {
  use super::{cml_bridge_escrow_datum_info_json, cml_bridge_updated_escrow_datum_cbor_hex};
  use crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free;
  use std::ffi::CString;

  #[test]
  fn malformed_escrow_datum_returns_false_at_the_c_abi() {
    let input = CString::new("d8799f01e0ff").unwrap();
    for export in [cml_bridge_escrow_datum_info_json, cml_bridge_updated_escrow_datum_cbor_hex] {
      let mut result = std::ptr::null();
      let mut error = std::ptr::null();
      assert!(!unsafe { export(input.as_ptr(), &mut result, &mut error) });
      assert!(result.is_null());
      unsafe { cml_bridge_charptr_free(&mut error) };
    }
  }
}
