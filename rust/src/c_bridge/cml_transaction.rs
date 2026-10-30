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

fn catch_ffi_panic(operation: impl FnOnce() -> bool) -> bool {
  match std::panic::catch_unwind(std::panic::AssertUnwindSafe(operation)) {
    Ok(value) => value,
    Err(_) => false,
  }
}

unsafe fn cml_bridge_wallet_root_key_hex_from_entropy_impl(
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

unsafe fn cml_bridge_derive_account_public_key_hex_impl(
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

unsafe fn cml_bridge_sign_wallet_transaction_paths_hex_impl(
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

unsafe fn cml_bridge_sign_wallet_data_impl(
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

unsafe fn cml_bridge_derive_wallet_public_key_hex_impl(
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

unsafe fn cml_bridge_transaction_id_hex_impl(
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

unsafe fn cml_bridge_transaction_validation_info_json_impl(
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

unsafe fn cml_bridge_transaction_review_info_json_impl(
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

unsafe fn cml_bridge_transaction_signing_requirements_json_impl(
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

unsafe fn cml_bridge_transaction_witness_set_hex_impl(
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

unsafe fn cml_bridge_empty_witness_transaction_hex_impl(
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

unsafe fn cml_bridge_sign_transaction_hex_impl(
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

unsafe fn cml_bridge_sign_wallet_transaction_hex_impl(
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

unsafe fn cml_bridge_build_simple_payment_transaction_hex_impl(
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

unsafe fn cml_bridge_build_transaction_recipe_cml_hex_impl(
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

unsafe fn cml_bridge_build_escrow_redeem_transaction_hex_impl(
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

unsafe fn cml_bridge_minimum_coin_for_assets_impl(
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

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_wallet_root_key_hex_from_entropy(
  entropy_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_wallet_root_key_hex_from_entropy_impl(entropy_hex, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_derive_account_public_key_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe { cml_bridge_derive_account_public_key_hex_impl(args, result, error) })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_sign_wallet_transaction_paths_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_sign_wallet_transaction_paths_hex_impl(args, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_sign_wallet_data(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe { cml_bridge_sign_wallet_data_impl(args, result, error) })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_derive_wallet_public_key_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe { cml_bridge_derive_wallet_public_key_hex_impl(args, result, error) })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_id_hex(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe { cml_bridge_transaction_id_hex_impl(transaction_hex, result, error) })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_validation_info_json(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_transaction_validation_info_json_impl(transaction_hex, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_review_info_json(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_transaction_review_info_json_impl(transaction_hex, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_signing_requirements_json(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_transaction_signing_requirements_json_impl(transaction_hex, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_witness_set_hex(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_transaction_witness_set_hex_impl(transaction_hex, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_empty_witness_transaction_hex(
  transaction_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_empty_witness_transaction_hex_impl(transaction_hex, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_sign_transaction_hex(
  transaction_hex: CharPtr, private_key_hex: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_sign_transaction_hex_impl(transaction_hex, private_key_hex, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_sign_wallet_transaction_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe { cml_bridge_sign_wallet_transaction_hex_impl(args, result, error) })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_build_simple_payment_transaction_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_build_simple_payment_transaction_hex_impl(args, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_build_transaction_recipe_cml_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_build_transaction_recipe_cml_hex_impl(args, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_build_escrow_redeem_transaction_hex(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe {
    cml_bridge_build_escrow_redeem_transaction_hex_impl(args, result, error)
  })
}

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_minimum_coin_for_assets(
  args: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  catch_ffi_panic(|| unsafe { cml_bridge_minimum_coin_for_assets_impl(args, result, error) })
}

#[cfg(test)]
mod tests {
  use super::{
    cml_bridge_build_simple_payment_transaction_hex, cml_bridge_build_transaction_recipe_cml_hex,
    cml_bridge_build_escrow_redeem_transaction_hex,
    cml_bridge_empty_witness_transaction_hex, cml_bridge_sign_transaction_hex,
    cml_bridge_sign_wallet_transaction_hex, cml_bridge_sign_wallet_transaction_paths_hex,
    cml_bridge_transaction_id_hex, cml_bridge_transaction_review_info_json,
    cml_bridge_transaction_signing_requirements_json, cml_bridge_transaction_validation_info_json,
    cml_bridge_transaction_witness_set_hex,
  };
  use crate::c_bridge::bridge_tools::string::{cml_bridge_charptr_free, CharPtr};
  use crate::cml_transaction::wallet_root_key_hex_from_entropy;
  use std::ffi::CString;

  type StringExport = unsafe extern "C" fn(CharPtr, &mut CharPtr, &mut CharPtr) -> bool;

  unsafe fn assert_export_catches_panic(export: StringExport, input: CharPtr) {
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();
    assert!(!export(input, &mut result, &mut error));
    assert!(error.is_null(), "expected the input to exercise the panic guard");
    unsafe {
      cml_bridge_charptr_free(&mut result);
      cml_bridge_charptr_free(&mut error);
    }
  }

  unsafe fn assert_export_returns_error(export: StringExport, input: CharPtr) {
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();
    assert!(!export(input, &mut result, &mut error));
    assert!(!error.is_null());
    unsafe {
      cml_bridge_charptr_free(&mut result);
      cml_bridge_charptr_free(&mut error);
    }
  }

  #[test]
  fn transaction_id_export_returns_error_for_invalid_cbor() {
    let transaction = CString::new("not-cbor").unwrap();
    unsafe { assert_export_returns_error(cml_bridge_transaction_id_hex, transaction.as_ptr()) };
  }

  #[test]
  fn transaction_exports_return_false_instead_of_unwinding_across_ffi() {
    let transaction = CString::new("84a300d90102800180021a000f4240a10481d8799f01e0fff5f6").unwrap();
    for export in [
      cml_bridge_transaction_id_hex,
      cml_bridge_transaction_review_info_json,
      cml_bridge_transaction_signing_requirements_json,
      cml_bridge_transaction_validation_info_json,
      cml_bridge_transaction_witness_set_hex,
      cml_bridge_empty_witness_transaction_hex,
    ] {
      unsafe { assert_export_catches_panic(export, transaction.as_ptr()) };
    }
  }

  #[test]
  fn signing_exports_return_false_instead_of_unwinding_across_ffi() {
    let transaction = CString::new("84a300d90102800180021a000f4240a10481d8799f01e0fff5f6").unwrap();
    let private_key = CString::new("11".repeat(32)).unwrap();
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();

    assert!(!unsafe {
      cml_bridge_sign_transaction_hex(
        transaction.as_ptr(),
        private_key.as_ptr(),
        &mut result,
        &mut error,
      )
    });
    unsafe {
      cml_bridge_charptr_free(&mut result);
      cml_bridge_charptr_free(&mut error);
    }

    let master_key_hex = wallet_root_key_hex_from_entropy(&"11".repeat(16)).unwrap();
    for (export, args) in [
      (
        cml_bridge_sign_wallet_transaction_hex as StringExport,
        serde_json::json!({
          "transactionHex": transaction.to_str().unwrap(),
          "masterKeyHex": master_key_hex.clone(),
          "purpose": "1852",
          "coinType": "1815",
          "accountIndex": "0"
        }),
      ),
      (
        cml_bridge_sign_wallet_transaction_paths_hex as StringExport,
        serde_json::json!({
          "transactionHex": transaction.to_str().unwrap(),
          "masterKeyHex": master_key_hex,
          "signerPaths": []
        }),
      ),
    ] {
      let args = CString::new(args.to_string()).unwrap();
      unsafe { assert_export_catches_panic(export, args.as_ptr()) };
    }
  }

  #[test]
  fn payment_exports_return_false_instead_of_unwinding_across_ffi() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let tx_hash = "01".repeat(32);
    let args = format!(
      "{tx_hash},0,{address},10000000,-|{address},2000000,-,inline~d8799f01e0ff|{address}|123456|44|155381|4310|2000000|500000000|5000"
    );
    let args = CString::new(args).unwrap();
    unsafe {
      assert_export_catches_panic(cml_bridge_build_simple_payment_transaction_hex, args.as_ptr())
    };

    let recipe = serde_json::json!({
      "protocolParams": {
        "linearFee": {"coefficient": "44", "constant": "155381"},
        "coinsPerUtxoByte": "4310", "keyDeposit": "2000000",
        "poolDeposit": "500000000", "maxValueSize": "5000"
      },
      "inputs": [{"txHashHex": tx_hash, "index": "0", "address": address, "lovelace": "10000000", "assets": []}],
      "outputs": [{"address": address, "lovelace": "2000000", "assets": [], "datum": {"kind": "inline", "hex": "d8799f01e0ff"}}],
      "options": {"changeAddress": address, "ttl": "123456"}
    });
    let recipe = CString::new(recipe.to_string()).unwrap();
    unsafe {
      assert_export_catches_panic(cml_bridge_build_transaction_recipe_cml_hex, recipe.as_ptr())
    };
  }

  #[test]
  fn escrow_redeem_export_returns_false_instead_of_unwinding_across_ffi() {
    use cml_chain::{
      address::EnterpriseAddress,
      certs::Credential,
      crypto::ScriptHash,
      plutus::PlutusV3Script,
      Script,
    };
    use cml_crypto::RawBytesEncoding;

    let script_bytes = vec![1, 0, 0];
    let script = Script::new_plutus_v3(PlutusV3Script::new(script_bytes.clone()));
    let script_hash_hex = hex::encode(script.hash().to_raw_bytes());
    let script_address = EnterpriseAddress::new(
      0,
      Credential::new_script(ScriptHash::from_raw_bytes(&hex::decode(&script_hash_hex).unwrap()).unwrap()),
    )
    .to_address()
    .to_bech32(None)
    .unwrap();
    let key_address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let args = serde_json::json!({
      "scriptInput": {
        "txHashHex": "01".repeat(32), "index": "0", "address": script_address,
        "lovelace": "5000000", "assets": [], "inlineDatumCborHex": "d8799f01e0ff"
      },
      "referenceScriptInput": {
        "txHashHex": "02".repeat(32), "index": "0", "address": key_address,
        "lovelace": "2000000", "assets": []
      },
      "referenceScriptCborHex": hex::encode(&script_bytes), "referenceScriptSize": "3",
      "fundingInputs": [{
        "txHashHex": "03".repeat(32), "index": "0", "address": key_address,
        "lovelace": "10000000", "assets": []
      }],
      "collateralInput": {
        "txHashHex": "04".repeat(32), "index": "0", "address": key_address,
        "lovelace": "5000000", "assets": []
      },
      "collateralReturn": {"address": key_address, "lovelace": "4000000", "assets": []},
      "outputs": [{"address": key_address, "lovelace": "2000000", "assets": []}],
      "changeAddress": key_address, "scriptHashHex": script_hash_hex,
      "redeemerCborHex": "d87980", "redeemerMem": "900000", "redeemerSteps": "250000000",
      "validityStart": "100", "ttl": "1000", "feeCoefficient": "44", "feeConstant": "155381",
      "coinsPerUtxoByte": "4310", "keyDeposit": "2000000", "poolDeposit": "500000000",
      "maxValueSize": "5000", "maxTxSize": "16384", "collateralPercentage": "150",
      "refScriptCoinsPerByte": {"numerator": "15", "denominator": "1"},
      "refScriptTierStepBytes": "25600", "refScriptMultiplier": "1.2",
      "exUnitPricesMemory": {"numerator": "577", "denominator": "10000"},
      "exUnitPricesSteps": {"numerator": "721", "denominator": "10000000"},
      "plutusV3CostModel": [0]
    });
    let args = CString::new(args.to_string()).unwrap();
    unsafe {
      assert_export_catches_panic(cml_bridge_build_escrow_redeem_transaction_hex, args.as_ptr())
    };
  }
}
