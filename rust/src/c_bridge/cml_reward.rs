use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_reward::{
  address_to_hex, reward_address_from_address, reward_address_hex_from_account_public_key,
  reward_address_details_from_address, stake_credential_hex_from_address,
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
pub unsafe extern "C" fn cml_bridge_address_to_hex(
  address: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if address.is_null() {
    set_message(error, "address is null".to_owned());
    return false;
  }
  let address = match CStr::from_ptr(address).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("address is not UTF-8: {err}"));
      return false;
    }
  };
  match address_to_hex(address) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_stake_credential_hex_from_address(
  address: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if address.is_null() {
    set_message(error, "address is null".to_owned());
    return false;
  }
  let address = match CStr::from_ptr(address).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("address is not UTF-8: {err}"));
      return false;
    }
  };
  match stake_credential_hex_from_address(address) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_reward_address_details_from_address(
  address: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if address.is_null() {
    set_message(error, "address is null".to_owned());
    return false;
  }
  let address = match CStr::from_ptr(address).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("address is not UTF-8: {err}"));
      return false;
    }
  };
  match reward_address_details_from_address(address) {
    Ok((bech32, key_hash)) => set_message(result, format!("{bech32}\n{key_hash}")),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

/// C ABI wrapper for the CML reward-address helper. Returned strings are owned
/// by Rust and must be released with `csl_bridge_charptr_free`.
#[no_mangle]
pub unsafe extern "C" fn cml_bridge_reward_address_from_address(
  address: CharPtr, network: u8, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if address.is_null() {
    set_message(error, "address is null".to_owned());
    return false;
  }

  let address = match CStr::from_ptr(address).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("address is not UTF-8: {err}"));
      return false;
    }
  };
  match reward_address_from_address(address, network) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_reward_address_hex_from_account_public_key(
  account_public_key_hex: CharPtr, network: u8, role: u32, index: u32, result: &mut CharPtr,
  error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if account_public_key_hex.is_null() {
    set_message(error, "account public key is null".to_owned());
    return false;
  }
  let account_public_key_hex = match CStr::from_ptr(account_public_key_hex).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("account public key is not UTF-8: {err}"));
      return false;
    }
  };
  match reward_address_hex_from_account_public_key(account_public_key_hex, network, role, index) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}
