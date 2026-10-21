use std::{
  convert::TryFrom,
  ffi::{CStr, CString},
};

use super::bridge_tools::string::CharPtr;
use crate::cml_resolver::resolve_cns_address_record;

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
pub unsafe extern "C" fn cml_bridge_resolve_cns_address_record(
  args_json: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if args_json.is_null() {
    set_message(error, "CNS address record arguments are null".to_owned());
    return false;
  }
  let args_json = match CStr::from_ptr(args_json).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("CNS address record arguments are not UTF-8: {err}"));
      return false;
    }
  };
  let args: serde_json::Value = match serde_json::from_str(args_json) {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("Invalid CNS address record arguments: {err}"));
      return false;
    }
  };
  let Some(plutus_json) = args.get("plutusAddressJson").and_then(serde_json::Value::as_str) else {
    set_message(error, "CNS address record JSON is missing".to_owned());
    return false;
  };
  let Some(network_id) = args.get("networkId").and_then(serde_json::Value::as_u64) else {
    set_message(error, "CNS address record network ID is invalid".to_owned());
    return false;
  };
  let network_id = match u8::try_from(network_id) {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("CNS address record network ID is invalid: {err}"));
      return false;
    }
  };
  match resolve_cns_address_record(plutus_json, network_id) {
    Ok(value) => set_message(result, value),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}
