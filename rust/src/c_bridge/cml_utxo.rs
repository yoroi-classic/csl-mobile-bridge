use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_utxo::transaction_unspent_output_hex;

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_unspent_output_hex(
  args_json: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args_json.is_null() {
    *error = CString::new("transaction unspent output arguments are null").unwrap().into_raw();
    return false;
  }
  let json = match CStr::from_ptr(args_json).to_str() {
    Ok(value) => value,
    Err(err) => {
      *error = CString::new(format!("transaction unspent output arguments are not UTF-8: {err}"))
        .unwrap()
        .into_raw();
      return false;
    }
  };
  match transaction_unspent_output_hex(json) {
    Ok(value) => {
      *result = CString::new(value).unwrap().into_raw();
      true
    }
    Err(err) => {
      *error = CString::new(err).unwrap().into_raw();
      false
    }
  }
}
