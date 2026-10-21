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
