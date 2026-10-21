use std::ffi::{CStr, CString};

use super::bridge_tools::string::CharPtr;
use crate::cml_pool::normalize_pool_identifier;

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
pub unsafe extern "C" fn cml_bridge_normalize_pool_identifier(
  pool_id_or_hash: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  if pool_id_or_hash.is_null() {
    set_message(error, "pool identifier is null".to_owned());
    return false;
  }
  let pool_id_or_hash = match CStr::from_ptr(pool_id_or_hash).to_str() {
    Ok(value) => value,
    Err(err) => {
      set_message(error, format!("pool identifier is not UTF-8: {err}"));
      return false;
    }
  };
  match normalize_pool_identifier(pool_id_or_hash) {
    Ok((id, hash)) => set_message(result, format!("{id}\n{hash}")),
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}
