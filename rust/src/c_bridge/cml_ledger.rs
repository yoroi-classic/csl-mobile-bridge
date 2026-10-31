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

#[cfg(test)]
mod tests {
  use super::cml_bridge_ledger_signing_request_info_json;
  use crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free;
  use std::ffi::CString;

  #[test]
  fn malformed_witness_datum_returns_false_at_the_c_abi() {
    let args = CString::new(
      r#"{"transactionHex":"84a300d90102800180021a000f4240a10481d8799f01e0fff5f6","networkId":0,"protocolMagic":764824073,"senderUtxos":[],"changeAddresses":[]}"#,
    )
    .unwrap();
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();

    assert!(!unsafe {
      cml_bridge_ledger_signing_request_info_json(args.as_ptr(), &mut result, &mut error)
    });
    assert!(result.is_null());
    assert!(!error.is_null());
    unsafe { cml_bridge_charptr_free(&mut error) };
  }
}
