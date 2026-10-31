use cml_chain::{address::Address, byron::ByronAddress};

/// Parse an address as bech32, Byron base58, or serialized-address hex.
pub fn parse_payment_address(raw: &str) -> Result<Address, String> {
  match Address::from_bech32(raw) {
    Ok(address) => Ok(address),
    Err(bech32_error) => match ByronAddress::from_base58(raw) {
      Ok(address) => Ok(address.to_address()),
      Err(byron_error) => {
        let raw_bytes = hex::decode(raw).map_err(|_| {
          format!("invalid bech32 ({bech32_error}) or Byron ({byron_error}) address")
        })?;
        Address::from_raw_bytes(&raw_bytes)
          .map_err(|err| format!("invalid serialized address hex: {err}"))
      }
    },
  }
}

#[cfg(test)]
mod tests {
  use super::parse_payment_address;
  use cml_crypto::RawBytesEncoding;

  const BECH32: &str = "addr_test1qqhchrw4umcrf90ew5ep85zefj9724c5jcfg6kp667qau789d6z307gnggrp3hgye75yzgh5q0w6unkqnvfxjfu7vxlswtaxme";
  const ADDRESS_HEX: &str = "002f8b8dd5e6f03495f9753213d0594c8be5571496128d583ad781de78e56e8517f913420618dd04cfa84122f403ddae4ec09b1269279e61bf";
  const BYRON: &str = "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3";

  #[test]
  fn parses_bech32_byron_and_serialized_hex_addresses() {
    let bech32 = parse_payment_address(BECH32).unwrap();
    let byron = parse_payment_address(BYRON).unwrap();
    let parsed_hex = parse_payment_address(ADDRESS_HEX).unwrap();

    assert_eq!(hex::encode(bech32.to_raw_bytes()), ADDRESS_HEX);
    assert!(matches!(byron, cml_chain::address::Address::Byron(_)));
    assert_eq!(hex::encode(parsed_hex.to_raw_bytes()), ADDRESS_HEX);
  }

  #[test]
  fn rejects_invalid_addresses() {
    assert!(parse_payment_address("not-an-address").is_err());
  }
}
