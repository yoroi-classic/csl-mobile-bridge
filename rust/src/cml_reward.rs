use cml_chain::address::{Address, BaseAddress, RewardAddress};
use cml_chain::byron::{AddressContent, ByronAddress, ProtocolMagic};
use cml_chain::certs::Credential;
use cml_chain::serialization::Serialize;
use cml_crypto::{Bip32PublicKey, RawBytesEncoding};
use serde::Deserialize;

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

/// Parse an address represented as bech32 or hex and return its serialized
/// bytes as lower-case hex.
pub fn address_to_hex(address: &str) -> Result<String, String> {
  let parsed = parse_address(address)?;
  Ok(parsed.to_hex())
}

/// Parse Shelley or Byron address forms and return normalized primitive info.
/// `bech32` is null for Byron addresses, matching CSL's `to_bech32` behavior.
pub fn address_info_from_address(address: &str) -> Result<String, String> {
  let parsed = parse_address(address)?;
  let bech32 = match &parsed {
    Address::Byron(_) => None,
    _ => parsed.to_bech32(None).ok(),
  };
  let info = serde_json::json!({
    "hex": parsed.to_hex(),
    "networkId": parsed.network_id().map_err(|err| err.to_string())?,
    "bech32": bech32,
    "isValid": true,
  });
  serde_json::to_string(&info).map_err(|err| err.to_string())
}

fn parse_address(address: &str) -> Result<Address, String> {
  if is_hex_address(address) {
    return Address::from_hex(address).map_err(|err| err.to_string());
  }
  match Address::from_bech32(address) {
    Ok(parsed) => Ok(parsed),
    Err(bech32_error) => ByronAddress::from_base58(address)
      .map(ByronAddress::to_address)
      .map_err(|byron_error| format!("{bech32_error}; {byron_error}")),
  }
}

/// Return the serialized stake credential from a base address as hex.
pub fn stake_credential_hex_from_address(address: &str) -> Result<String, String> {
  let parsed = if is_hex_address(address) {
    Address::from_hex(address).map_err(|err| err.to_string())
  } else {
    Address::from_bech32(address).map_err(|err| err.to_string())
  }?;
  let base =
    BaseAddress::from_address(&parsed).ok_or_else(|| "Address is not a base address".to_owned())?;
  Ok(hex::encode(base.stake.to_cbor_bytes()))
}

/// Return the normalized bech32 reward address and its key-hash credential.
pub fn reward_address_details_from_address(address: &str) -> Result<(String, String), String> {
  let parsed = if is_hex_address(address) {
    Address::from_hex(address).map_err(|err| err.to_string())
  } else {
    Address::from_bech32(address).map_err(|err| err.to_string())
  }?;
  let reward = RewardAddress::from_address(&parsed)
    .ok_or_else(|| "Address is not a reward address".to_owned())?;
  let key_hash = match reward.payment {
    Credential::PubKey { hash, .. } => hash.to_hex(),
    Credential::Script { .. } => {
      return Err("Reward address credential is not a key hash".to_owned())
    }
  };
  let bech32 = parsed.to_bech32(None).map_err(|err| err.to_string())?;
  Ok((bech32, key_hash))
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

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PublicKeyHashesAddressArgs {
  payment_key_hash_hex: String,
  stake_key_hash_hex: String,
  network_id: u8,
}

/// Construct a Shelley base address from payment/stake key hashes.
pub fn base_address_bech32_from_public_key_hashes(args_json: &str) -> Result<String, String> {
  use cml_crypto::Ed25519KeyHash;
  let args: PublicKeyHashesAddressArgs = serde_json::from_str(args_json)
    .map_err(|err| format!("invalid base address arguments: {err}"))?;
  let payment = Ed25519KeyHash::from_raw_bytes(
    &hex::decode(args.payment_key_hash_hex)
      .map_err(|err| format!("invalid payment key hash: {err}"))?,
  )
  .map_err(|err| err.to_string())?;
  let stake = Ed25519KeyHash::from_raw_bytes(
    &hex::decode(args.stake_key_hash_hex)
      .map_err(|err| format!("invalid stake key hash: {err}"))?,
  )
  .map_err(|err| err.to_string())?;
  BaseAddress::new(
    args.network_id,
    Credential::new_pub_key(payment),
    Credential::new_pub_key(stake),
  )
  .to_address()
  .to_bech32(None)
  .map_err(|err| err.to_string())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RewardAddressFromHashArgs {
  stake_key_hash_hex: String,
  network_id: u8,
}

/// Construct the serialized reward address from a stake key hash.
pub fn reward_address_hex_from_public_key_hash(args_json: &str) -> Result<String, String> {
  use cml_crypto::Ed25519KeyHash;
  let args: RewardAddressFromHashArgs = serde_json::from_str(args_json)
    .map_err(|err| format!("invalid reward address arguments: {err}"))?;
  let stake = Ed25519KeyHash::from_raw_bytes(
    &hex::decode(args.stake_key_hash_hex)
      .map_err(|err| format!("invalid stake key hash: {err}"))?,
  )
  .map_err(|err| err.to_string())?;
  Ok(RewardAddress::new(args.network_id, Credential::new_pub_key(stake)).to_address().to_hex())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct IcarusAddressArgs {
  account_public_key_hex: String,
  role: u32,
  index: u32,
  protocol_magic: u32,
}

/// Derive an Icarus Byron address from an account xpub and soft role/index path.
pub fn icarus_address_base58_from_account_public_key_hex(
  args_json: &str,
) -> Result<String, String> {
  use cml_crypto::Bip32PublicKey;
  let args: IcarusAddressArgs = serde_json::from_str(args_json)
    .map_err(|err| format!("invalid Icarus address arguments: {err}"))?;
  let account = Bip32PublicKey::from_raw_hex(&args.account_public_key_hex)
    .map_err(|err| format!("invalid account public key: {err}"))?;
  let child = account
    .derive(args.role)
    .map_err(|err| format!("cannot derive address role: {err:?}"))?
    .derive(args.index)
    .map_err(|err| format!("cannot derive address index: {err:?}"))?;
  let content = AddressContent::icarus_from_key(child, ProtocolMagic::from(args.protocol_magic));
  Ok(ByronAddress::from(content).to_base58())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct AccountPublicKeyPathArgs {
  account_public_key_hex: String,
  path: Vec<u32>,
}

/// Derive a raw public key from an account extended public key and a soft
/// derivation path. This keeps key derivation in the CML bridge without
/// exposing or reconstructing private key material.
pub fn derive_public_key_from_account_path_hex(args_json: &str) -> Result<String, String> {
  let args: AccountPublicKeyPathArgs = serde_json::from_str(args_json)
    .map_err(|err| format!("invalid account public-key path arguments: {err}"))?;
  if args.path.is_empty() {
    return Err("account public-key path must not be empty".to_owned());
  }
  let account_key = Bip32PublicKey::from_raw_hex(&args.account_public_key_hex)
    .map_err(|err| format!("invalid account public key: {err}"))?;
  let mut derived_key = account_key;
  for (position, index) in args.path.into_iter().enumerate() {
    if index >= 0x8000_0000 {
      return Err(format!("path index {position} must be a soft derivation index"));
    }
    derived_key = derived_key
      .derive(index)
      .map_err(|err| format!("cannot derive account public-key path index {position}: {err:?}"))?;
  }
  Ok(hex::encode(derived_key.to_raw_key().to_raw_bytes()))
}

fn is_hex_address(value: &str) -> bool {
  value.len() % 2 == 0 && value.bytes().all(|byte| byte.is_ascii_hexdigit())
}

#[cfg(test)]
mod tests {
  use super::{
    address_info_from_address, address_to_hex, base_address_bech32_from_public_key_hashes,
    derive_public_key_from_account_path_hex, icarus_address_base58_from_account_public_key_hex,
    reward_address_details_from_address, reward_address_from_address,
    reward_address_hex_from_account_public_key, reward_address_hex_from_public_key_hash,
    stake_credential_hex_from_address,
  };

  const BASE_BECH32: &str = "addr_test1qqhchrw4umcrf90ew5ep85zefj9724c5jcfg6kp667qau789d6z307gnggrp3hgye75yzgh5q0w6unkqnvfxjfu7vxlswtaxme";
  const BASE_HEX: &str = "002f8b8dd5e6f03495f9753213d0594c8be5571496128d583ad781de78e56e8517f913420618dd04cfa84122f403ddae4ec09b1269279e61bf";
  const REWARD_TESTNET: &str = "stake_test1urjkapghlyf5ypscm5zvl2zpyt6q8hdwfmqfkynfy70xr0cjjefxa";
  const ACCOUNT_PUBLIC_KEY_HEX: &str = "7cc9d816f272eb78a2db936a839d3bf53fa960dd470ddbaadabb6a7bf2019b837d20b2cd13cbb22b6f6938abea40d425f5539b6bb1fe0813ccb4c21676a7fd6b";
  const STAKE_CREDENTIAL_HEX: &str =
    "8200581ce56e8517f913420618dd04cfa84122f403ddae4ec09b1269279e61bf";
  const REWARD_ADDRESS_HEX: &str = "e042d6429c72c0dc1c873923e1afe475ad614cf6d3aec61ddbceeefe40";

  #[test]
  fn derives_expected_reward_address_from_bech32_or_hex() {
    assert_eq!(reward_address_from_address(BASE_BECH32, 0).unwrap(), REWARD_TESTNET);
    assert_eq!(reward_address_from_address(BASE_HEX, 0).unwrap(), REWARD_TESTNET);
  }

  #[test]
  fn derives_expected_public_key_from_account_drep_path() {
    let args = serde_json::json!({
      "accountPublicKeyHex": ACCOUNT_PUBLIC_KEY_HEX,
      "path": [3, 0],
    });
    assert_eq!(
      derive_public_key_from_account_path_hex(&args.to_string()).unwrap(),
      "128d503f283abab8ab21325b164db691eb042f39516b705dbd45e245c9a10d43",
    );
  }

  #[test]
  fn constructs_legacy_shelley_and_icarus_address_vectors() {
    let payment = &BASE_HEX[2..58];
    let stake = &BASE_HEX[58..];
    let base_args = serde_json::json!({
      "paymentKeyHashHex": payment,
      "stakeKeyHashHex": stake,
      "networkId": 0,
    });
    assert_eq!(
      base_address_bech32_from_public_key_hashes(&base_args.to_string()).unwrap(),
      BASE_BECH32,
    );
    let reward_args = serde_json::json!({"stakeKeyHashHex": stake, "networkId": 0});
    assert_eq!(
      reward_address_hex_from_public_key_hash(&reward_args.to_string()).unwrap(),
      "e0e56e8517f913420618dd04cfa84122f403ddae4ec09b1269279e61bf",
    );
    let byron_args = serde_json::json!({
      "accountPublicKeyHex": ACCOUNT_PUBLIC_KEY_HEX,
      "role": 0,
      "index": 0,
      "protocolMagic": 764824073,
    });
    assert_eq!(
      icarus_address_base58_from_account_public_key_hex(&byron_args.to_string()).unwrap(),
      "Ae2tdPwUPEZ7B3QpsbH63nqB4BUyh8L9iFtuo3CrcYd35HXBnXb3KJFkszb",
    );
    let invalid_hash = serde_json::json!({
      "paymentKeyHashHex": "aa",
      "stakeKeyHashHex": stake,
      "networkId": 0,
    });
    assert!(base_address_bech32_from_public_key_hashes(&invalid_hash.to_string()).is_err());
    let hardened_path = serde_json::json!({
      "accountPublicKeyHex": ACCOUNT_PUBLIC_KEY_HEX,
      "role": 2147483648u32,
      "index": 0,
      "protocolMagic": 764824073,
    });
    assert!(icarus_address_base58_from_account_public_key_hex(&hardened_path.to_string()).is_err());
  }

  #[test]
  fn rejects_invalid_public_key_paths() {
    let args =
      serde_json::json!({"accountPublicKeyHex": ACCOUNT_PUBLIC_KEY_HEX, "path": [0x8000_0000u32]});
    assert!(derive_public_key_from_account_path_hex(&args.to_string())
      .unwrap_err()
      .contains("soft derivation index"));
  }

  #[test]
  fn address_hex_matches_bech32_and_hex_inputs() {
    assert_eq!(address_to_hex(BASE_BECH32).unwrap(), BASE_HEX);
    assert_eq!(address_to_hex(BASE_HEX).unwrap(), BASE_HEX);
  }

  #[test]
  fn parses_byron_address_and_rejects_invalid_base58_cbor() {
    let byron = "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3";
    let info: serde_json::Value =
      serde_json::from_str(&address_info_from_address(byron).unwrap()).unwrap();
    assert_eq!(
      info["hex"],
      "82d818582183581c5b4689cfcfe43d8a89e2c9197dbc0913a5828c742168709039260ed2a0001a71b1c85a"
    );
    assert_eq!(info["networkId"], 1);
    assert_eq!(
      info["bech32"], serde_json::Value::Null
    );
    assert_eq!(info["isValid"], true);
    assert!(address_info_from_address(
      "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd4"
    )
    .is_err());
  }

  #[test]
  fn stake_credential_serialization_matches_csl_fixture() {
    assert_eq!(stake_credential_hex_from_address(BASE_BECH32).unwrap(), STAKE_CREDENTIAL_HEX);
    assert_eq!(stake_credential_hex_from_address(BASE_HEX).unwrap(), STAKE_CREDENTIAL_HEX);
  }

  #[test]
  fn extracts_normalized_reward_address_and_key_hash() {
    assert_eq!(
      reward_address_details_from_address(REWARD_ADDRESS_HEX).unwrap(),
      (
        "stake_test1uppdvs5uwtqdc8y88y37rtlywkkkzn8k6whvv8wmemh0usqdl9tqk".to_owned(),
        "42d6429c72c0dc1c873923e1afe475ad614cf6d3aec61ddbceeefe40".to_owned()
      )
    );
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
      crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free(&mut result);
      if !error.is_null() {
        crate::c_bridge::bridge_tools::string::cml_bridge_charptr_free(&mut error);
      }
    }
  }
}
