use cml_chain::address::{Address, BaseAddress, RewardAddress};
use cml_chain::certs::Credential;
use cml_crypto::{Bip32PublicKey, RawBytesEncoding};

/// Derive a reward address from a base address, preserving the stake credential
/// while using the caller-selected network ID (the behavior used by Yoroi).
pub fn reward_address_from_address(address: &str, network: u8) -> Result<String, String> {
  let parsed = if is_hex_address(address) {
    Address::from_hex(address).map_err(|err| err.to_string())
  } else {
    Address::from_bech32(address).map_err(|err| err.to_string())
  }?;

  let base =
    BaseAddress::from_address(&parsed).ok_or_else(|| "Address is not a base address".to_owned())?;
  RewardAddress::new(network, base.stake)
    .to_address()
    .to_bech32(None)
    .map_err(|err| err.to_string())
}

/// Derive a reward address from an account extended public key and soft
/// staking path, returning its serialized address bytes as lower-case hex.
pub fn reward_address_hex_from_account_public_key(
  account_public_key_hex: &str, network: u8, role: u32, index: u32,
) -> Result<String, String> {
  let account_public_key =
    Bip32PublicKey::from_raw_hex(account_public_key_hex).map_err(|err| err.to_string())?;
  let staking_public_key = account_public_key
    .derive(role)
    .map_err(|err| format!("cannot derive staking role {role}: {err:?}"))?
    .derive(index)
    .map_err(|err| format!("cannot derive staking index {index}: {err:?}"))?
    .to_raw_key();
  let credential = Credential::new_pub_key(staking_public_key.hash());
  Ok(RewardAddress::new(network, credential).to_address().to_hex())
}

fn is_hex_address(value: &str) -> bool {
  value.len() % 2 == 0 && value.bytes().all(|byte| byte.is_ascii_hexdigit())
}

#[cfg(test)]
mod tests {
  use super::{reward_address_from_address, reward_address_hex_from_account_public_key};

  const BASE_BECH32: &str = "addr_test1qqhchrw4umcrf90ew5ep85zefj9724c5jcfg6kp667qau789d6z307gnggrp3hgye75yzgh5q0w6unkqnvfxjfu7vxlswtaxme";
  const BASE_HEX: &str = "002f8b8dd5e6f03495f9753213d0594c8be5571496128d583ad781de78e56e8517f913420618dd04cfa84122f403ddae4ec09b1269279e61bf";
  const REWARD_TESTNET: &str = "stake_test1urjkapghlyf5ypscm5zvl2zpyt6q8hdwfmqfkynfy70xr0cjjefxa";
  const ACCOUNT_PUBLIC_KEY_HEX: &str = "7cc9d816f272eb78a2db936a839d3bf53fa960dd470ddbaadabb6a7bf2019b837d20b2cd13cbb22b6f6938abea40d425f5539b6bb1fe0813ccb4c21676a7fd6b";
  const REWARD_ADDRESS_HEX: &str = "e042d6429c72c0dc1c873923e1afe475ad614cf6d3aec61ddbceeefe40";

  #[test]
  fn derives_expected_reward_address_from_bech32_or_hex() {
    assert_eq!(reward_address_from_address(BASE_BECH32, 0).unwrap(), REWARD_TESTNET);
    assert_eq!(reward_address_from_address(BASE_HEX, 0).unwrap(), REWARD_TESTNET);
  }

  #[test]
  fn rejects_malformed_and_non_base_addresses() {
    assert!(reward_address_from_address("not-an-address", 0).is_err());
    assert_eq!(
      reward_address_from_address(
        "addr_test1vqhchrw4umcrf90ew5ep85zefj9724c5jcfg6kp667qau7qq338n3",
        0
      )
      .unwrap_err(),
      "Address is not a base address",
    );
  }

  #[test]
  fn derives_reward_address_from_account_public_key() {
    assert_eq!(
      reward_address_hex_from_account_public_key(ACCOUNT_PUBLIC_KEY_HEX, 0, 2, 0).unwrap(),
      REWARD_ADDRESS_HEX,
    );
  }

  #[test]
  fn rejects_hardened_public_key_derivation() {
    assert!(reward_address_hex_from_account_public_key(ACCOUNT_PUBLIC_KEY_HEX, 0, 0x8000_0000, 0,)
      .is_err());
  }

  #[test]
  fn c_abi_returns_owned_result_string() {
    use std::ffi::{CStr, CString};

    let input = CString::new(BASE_BECH32).unwrap();
    let mut result = std::ptr::null();
    let mut error = std::ptr::null();
    let succeeded = unsafe {
      crate::c_bridge::cml_reward::cml_bridge_reward_address_from_address(
        input.as_ptr(),
        0,
        &mut result,
        &mut error,
      )
    };

    assert!(succeeded, "{}", unsafe { CStr::from_ptr(error) }.to_string_lossy());
    assert_eq!(unsafe { CStr::from_ptr(result) }.to_str().unwrap(), REWARD_TESTNET);
    unsafe {
      crate::c_bridge::bridge_tools::string::csl_bridge_charptr_free(&mut result);
      if !error.is_null() {
        crate::c_bridge::bridge_tools::string::csl_bridge_charptr_free(&mut error);
      }
    }
  }
}
