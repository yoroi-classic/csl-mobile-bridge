use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_reward::{
  address_info_from_address, address_to_hex, base_address_bech32_from_public_key_hashes,
  derive_public_key_from_account_path_hex, icarus_address_base58_from_account_public_key_hex,
  reward_address_details_json, reward_address_from_address,
  reward_address_hex_from_account_public_key, reward_address_hex_from_public_key_hash,
  stake_credential_hex_from_address,
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

unsafe fn cml_bridge_json_string(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr, name: &str,
  convert: fn(&str) -> Result<String, String>,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, format!("{name} arguments are null"));
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("{name} arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match convert(args) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_base_address_bech32_from_public_key_hashes(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  cml_bridge_json_string(
    args,
    result,
    error,
    "base address",
    base_address_bech32_from_public_key_hashes,
  )
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_reward_address_hex_from_public_key_hash(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  cml_bridge_json_string(
    args,
    result,
    error,
    "reward address",
    reward_address_hex_from_public_key_hash,
  )
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_icarus_address_base58_from_account_public_key_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  cml_bridge_json_string(
    args,
    result,
    error,
    "Icarus address",
    icarus_address_base58_from_account_public_key_hex,
  )
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_address_info_from_address(
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
  match address_info_from_address(address) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
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
  match reward_address_details_json(address) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}

/// C ABI wrapper for the CML reward-address helper. Returned strings are owned
/// by Rust and must be released with `cml_bridge_charptr_free`.
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

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_derive_public_key_from_account_path_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args.is_null() {
    set_message(error, "account public-key path arguments are null".to_owned());
    return false;
  }
  let args = match CStr::from_ptr(args).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("account public-key path arguments are not UTF-8: {err}"));
      return false;
    }
  };
  match derive_public_key_from_account_path_hex(args) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}
