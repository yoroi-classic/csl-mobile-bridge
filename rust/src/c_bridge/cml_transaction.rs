use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_transaction::{build_simple_payment_transaction_hex, minimum_coin_for_assets, sign_transaction_hex};

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
pub unsafe extern "C" fn cml_bridge_sign_transaction_hex(
  transaction_hex: CharPtr, private_key_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if transaction_hex.is_null() || private_key_hex.is_null() {
    set_message(error, "transaction or private key is null".to_owned());
    return false;
  }
  let transaction_hex = match CStr::from_ptr(transaction_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("transaction is not UTF-8: {err}"));
      return false;
    }
  };
  let private_key_hex = match CStr::from_ptr(private_key_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("private key is not UTF-8: {err}"));
      return false;
    }
  };
  match sign_transaction_hex(transaction_hex, private_key_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_build_simple_payment_transaction_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, "payment arguments are null".to_owned());
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("payment arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match build_simple_payment_transaction_hex(args) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_minimum_coin_for_assets(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, "minimum-coin arguments are null".to_owned());
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("minimum-coin arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match minimum_coin_for_assets(args) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}
