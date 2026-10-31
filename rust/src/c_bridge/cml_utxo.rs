use super::bridge_tools::string::{read_input, set_message, CharPtr};
use crate::cml_utxo::transaction_unspent_output_hex;

#[no_mangle]
pub unsafe extern "C" fn cml_bridge_transaction_unspent_output_hex(
  args_json: CharPtr, result: &mut CharPtr, error: &mut CharPtr,
) -> bool {
  *result = std::ptr::null();
  *error = std::ptr::null();
  let Some(json) = read_input(args_json, error, "transaction unspent output arguments") else {
    return false;
  };
  match transaction_unspent_output_hex(json) {
    Ok(value) => {
      set_message(result, value)
    }
    Err(err) => {
      set_message(error, err);
      false
    }
  }
}
