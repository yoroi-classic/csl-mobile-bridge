use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_transaction::{
  build_escrow_redeem_transaction_hex, build_simple_payment_transaction_hex,
  build_transaction_recipe_cml_hex, derive_account_public_key_hex, derive_wallet_public_key_hex,
  empty_witness_transaction_hex, minimum_coin_for_assets, sign_transaction_hex, sign_wallet_data,
  sign_wallet_transaction_hex, sign_wallet_transaction_paths_hex, transaction_id_hex,
  transaction_review_info_json, transaction_signing_requirements_json,
  transaction_validation_info_json, transaction_witness_set_hex, wallet_root_key_hex_from_entropy,
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
pub unsafe extern "C" fn cml_bridge_wallet_root_key_hex_from_entropy(
  entropy_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if entropy_hex.is_null() {
    set_message(error, "mnemonic entropy is null".to_owned());
    return false;
  }
  let entropy_hex = match CStr::from_ptr(entropy_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("mnemonic entropy is not UTF-8: {err}"));
      return false;
    }
  };
  match wallet_root_key_hex_from_entropy(entropy_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_derive_account_public_key_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, "account-key arguments are null".to_owned());
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("account-key arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match derive_account_public_key_hex(args) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_sign_wallet_transaction_paths_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, "wallet path-signing arguments are null".to_owned());
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("wallet path-signing arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match sign_wallet_transaction_paths_hex(args) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_sign_wallet_data(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, "wallet-data signing arguments are null".to_owned());
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("wallet-data signing arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match sign_wallet_data(args) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_derive_wallet_public_key_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, "wallet public-key arguments are null".to_owned());
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("wallet public-key arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match derive_wallet_public_key_hex(args) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_id_hex(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if transaction_hex.is_null() {
    set_message(error, "transaction hex is null".to_owned());
    return false;
  }
  let transaction_hex = match CStr::from_ptr(transaction_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("transaction hex is not UTF-8: {err}"));
      return false;
    }
  };
  match transaction_id_hex(transaction_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_validation_info_json(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if transaction_hex.is_null() {
    set_message(error, "transaction hex is null".to_owned());
    return false;
  }
  let transaction_hex = match CStr::from_ptr(transaction_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("transaction hex is not UTF-8: {err}"));
      return false;
    }
  };
  match transaction_validation_info_json(transaction_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_review_info_json(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if transaction_hex.is_null() {
    set_message(error, "transaction hex is null".to_owned());
    return false;
  }
  let transaction_hex = match CStr::from_ptr(transaction_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("transaction hex is not UTF-8: {err}"));
      return false;
    }
  };
  match transaction_review_info_json(transaction_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_signing_requirements_json(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if transaction_hex.is_null() {
    set_message(error, "transaction hex is null".to_owned());
    return false;
  }
  let transaction_hex = match CStr::from_ptr(transaction_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("transaction hex is not UTF-8: {err}"));
      return false;
    }
  };
  match transaction_signing_requirements_json(transaction_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_witness_set_hex(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if transaction_hex.is_null() {
    set_message(error, "transaction hex is null".to_owned());
    return false;
  }
  let transaction_hex = match CStr::from_ptr(transaction_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("transaction hex is not UTF-8: {err}"));
      return false;
    }
  };
  match transaction_witness_set_hex(transaction_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_empty_witness_transaction_hex(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if transaction_hex.is_null() {
    set_message(error, "transaction hex is null".to_owned());
    return false;
  }
  let transaction_hex = match CStr::from_ptr(transaction_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("transaction hex is not UTF-8: {err}"));
      return false;
    }
  };
  match empty_witness_transaction_hex(transaction_hex) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
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
pub unsafe extern "C" fn cml_bridge_sign_wallet_transaction_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, "wallet-signing arguments are null".to_owned());
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("wallet-signing arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match sign_wallet_transaction_hex(args) {
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
pub unsafe extern "C" fn cml_bridge_build_transaction_recipe_cml_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, "transaction recipe arguments are null".to_owned());
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("transaction recipe arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match build_transaction_recipe_cml_hex(args) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_build_escrow_redeem_transaction_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, "escrow transaction arguments are null".to_owned());
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("escrow transaction arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match build_escrow_redeem_transaction_hex(args) {
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
