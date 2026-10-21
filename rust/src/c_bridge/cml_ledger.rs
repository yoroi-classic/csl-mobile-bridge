use super::bridge_tools::string::CharPtr;
use crate::cml_ledger::{
  apply_ledger_witnesses_to_transaction_hex, ledger_signing_request_info_json,
};
use std::ffi::{CStr, CString};

unsafe fn text_result(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
  function: fn(&str) -> Result<String, String>, label: &str,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    if let Ok(value) = CString::new(format!("{label} arguments are null")) {
      *error = value.into_raw();
    }
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      if let Ok(value) = CString::new(format!("{label} arguments are not UTF-8: {err}")) {
        *error = value.into_raw();
      }
      return false;
    }
  };
  match function(args) {
    Ok(value) => match CString::new(value) {
      Ok(value) => {
        *result = value.into_raw();
        true
      }
      Err(_) => false,
    },
    Err(err) => {
      if let Ok(value) = CString::new(err) {
        *error = value.into_raw();
      }
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_ledger_signing_request_info_json(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  text_result(args, result, error, ledger_signing_request_info_json, "Ledger request")
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_apply_ledger_witnesses_to_transaction_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  text_result(args, result, error, apply_ledger_witnesses_to_transaction_hex, "Ledger witness")
}
