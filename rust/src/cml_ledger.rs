use crate::panic::handle_exception_result;
use cml_chain::address::Address;
use cml_chain::byron::{AddrAttributes, ByronAddress};
use cml_chain::crypto::{BootstrapWitness, Ed25519Signature, Vkeywitness};
use cml_chain::plutus::PlutusData;
use cml_chain::serialization::{Deserialize, Serialize};
use cml_chain::transaction::Transaction;
use cml_chain::utils::NonemptySet;
use cml_crypto::{Bip32PublicKey, RawBytesEncoding, TransactionHash};

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ApplyWitnessesArgs {
  transaction_hex: String,
  account_public_key_hex: String,
  purpose: String,
  coin_type: String,
  account_index: String,
  witnesses: Vec<LedgerWitness>,
  expected_tx_id_hex: String,
  #[serde(default)]
  sender_utxos: Vec<SenderUtxo>,
  #[serde(default)]
  plutus_data_hexes: Vec<String>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct LedgerWitness {
  path: Vec<u32>,
  signature_hex: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct SenderUtxo {
  tx_hash_hex: String,
  output_index: u64,
  address: String,
  address_hex: Option<String>,
  path: Vec<u32>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct LedgerRequestArgs {
  transaction_hex: String,
  network_id: u8,
  protocol_magic: u64,
  sender_utxos: Vec<SenderUtxo>,
  change_addresses: Vec<ChangeAddress>,
  staking_path: Option<Vec<u32>>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
struct ChangeAddress {
  address: String,
  address_hex: Option<String>,
  path: Vec<u32>,
}

/// Produce the CML-normalized Ledger request input. The returned DTO contains
/// the parsed body/witness/auxiliary fields plus validated input paths and
/// output change paths; callers map these plain fields to Ledger SDK enums.
pub fn ledger_signing_request_info_json(args_json: &str) -> Result<String, String> {
  handle_exception_result(|| ledger_signing_request_info_json_inner(args_json))
}

fn ledger_signing_request_info_json_inner(args_json: &str) -> Result<String, String> {
  let args: LedgerRequestArgs = serde_json::from_str(args_json)
    .map_err(|err| format!("invalid Ledger request arguments: {err}"))?;
  let transaction_bytes =
    hex::decode(&args.transaction_hex).map_err(|err| format!("invalid transaction hex: {err}"))?;
  let transaction = Transaction::from_cbor_bytes(&transaction_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  for address in &args.change_addresses {
    validate_ledger_path(&address.path)?;
  }
  let parsed_change_addresses = args
    .change_addresses
    .iter()
    .map(|change| {
      Ok((change, parse_address_bytes(&change.address, change.address_hex.as_deref())?))
    })
    .collect::<Result<Vec<_>, String>>()?;
  if let Some(path) = &args.staking_path {
    validate_ledger_path(path)?;
  }
  let inputs = transaction
    .body
    .inputs
    .iter()
    .map(|input| {
      let tx_hash = hex::encode(input.transaction_id.to_raw_bytes());
      let matching = args
        .sender_utxos
        .iter()
        .find(|source| {
          source.tx_hash_hex.eq_ignore_ascii_case(&tx_hash) && source.output_index == input.index
        })
        .ok_or_else(|| format!("no sender UTxO mapping for input {tx_hash}#{}", input.index))?;
      validate_ledger_path(&matching.path)?;
      Ok(serde_json::json!({
        "txHashHex": tx_hash,
        "outputIndex": input.index.to_string(),
        "path": matching.path,
        "address": matching.address,
        "addressHex": matching.address_hex,
      }))
    })
    .collect::<Result<Vec<_>, String>>()?;
  let mut outputs = Vec::with_capacity(transaction.body.outputs.len());
  for output in &transaction.body.outputs {
    let address_bytes = output.address().to_raw_bytes();
    let matching_change = parsed_change_addresses
      .iter()
      .find(|(_, change_bytes)| change_bytes.as_slice() == address_bytes.as_slice())
      .map(|(change, _)| *change);
    let mut data = crate::cml_transaction::review_output_json(output);
    if let Some(change) = matching_change {
      data["deviceOwnedPath"] = serde_json::json!(change.path);
      data["deviceOwnedAddress"] = serde_json::Value::Bool(true);
    } else {
      data["deviceOwnedAddress"] = serde_json::Value::Bool(false);
    }
    outputs.push(data);
  }
  let review: serde_json::Value = serde_json::from_str(
    &crate::cml_transaction::transaction_review_info_json(&args.transaction_hex)?,
  )
  .map_err(|err| format!("cannot serialize CML transaction review: {err}"))?;
  let mut result = serde_json::json!({
    "signingMode": "ordinary_transaction",
    "network": {"networkId": args.network_id, "protocolMagic": args.protocol_magic},
    "inputs": inputs,
    "outputs": outputs,
    "stakingPath": args.staking_path,
    "transaction": review.clone(),
  });
  let body = &review["body"];
  result["ttl"] = body["ttl"].clone();
  result["fee"] = body["fee"].clone();
  result["withdrawals"] = body["withdrawals"].clone();
  result["certificates"] = body["certificates"].clone();
  result["auxiliaryData"] = review["auxiliaryData"].clone();
  result["validityIntervalStart"] = body["validityIntervalStart"].clone();
  result["scriptDataHashHex"] = body["scriptDataHashHex"].clone();
  Ok(result.to_string())
}

fn validate_ledger_path(path: &[u32]) -> Result<(), String> {
  if path.len() != 5
    || path[0] < 0x8000_0000
    || path[1] < 0x8000_0000
    || path[2] < 0x8000_0000
    || path[3] >= 0x8000_0000
    || path[4] >= 0x8000_0000
  {
    return Err(
      "Ledger addressing path must be a full BIP44 path from purpose through address index"
        .to_owned(),
    );
  }
  Ok(())
}

fn parse_address_bytes(address: &str, address_hex: Option<&str>) -> Result<Vec<u8>, String> {
  if let Some(address_hex) = address_hex {
    let bytes = hex::decode(address_hex).map_err(|err| format!("invalid address hex: {err}"))?;
    let parsed =
      Address::from_raw_bytes(&bytes).map_err(|err| format!("invalid address bytes: {err}"))?;
    if !address.is_empty() {
      let matches = match &parsed {
        Address::Byron(byron) => byron.to_base58() == address,
        other => other.to_bech32(None).ok().as_deref() == Some(address),
      };
      if !matches {
        return Err("address string and serialized bytes disagree".to_owned());
      }
    }
    Ok(bytes)
  } else if let Ok(parsed) = Address::from_bech32(address) {
    Ok(parsed.to_raw_bytes())
  } else {
    let byron =
      ByronAddress::from_base58(address).map_err(|err| format!("invalid address: {err}"))?;
    Ok(byron.to_address().to_raw_bytes())
  }
}

/// Merge Ledger-produced signatures into a CML transaction. The transaction
/// body is never changed; the supplied tx id is checked before any bytes return.
pub fn apply_ledger_witnesses_to_transaction_hex(args_json: &str) -> Result<String, String> {
  handle_exception_result(|| apply_ledger_witnesses_to_transaction_hex_inner(args_json))
}

fn apply_ledger_witnesses_to_transaction_hex_inner(args_json: &str) -> Result<String, String> {
  let args: ApplyWitnessesArgs = serde_json::from_str(args_json)
    .map_err(|err| format!("invalid Ledger witness arguments: {err}"))?;
  let tx_bytes =
    hex::decode(&args.transaction_hex).map_err(|err| format!("invalid transaction hex: {err}"))?;
  let mut transaction = Transaction::from_cbor_bytes(&tx_bytes)
    .map_err(|err| format!("invalid transaction CBOR: {err}"))?;
  let expected = decode_hash(&args.expected_tx_id_hex)?;
  if transaction.body.hash().to_raw_bytes() != expected {
    return Err("transaction body hash does not match expected Ledger transaction id".to_owned());
  }
  let xpub_bytes = hex::decode(&args.account_public_key_hex)
    .map_err(|err| format!("invalid account public key hex: {err}"))?;
  let account = Bip32PublicKey::from_raw_bytes(&xpub_bytes)
    .map_err(|err| format!("invalid account public key: {err}"))?;
  let input_keys = transaction
    .body
    .inputs
    .iter()
    .map(|input| format!("{}#{}", hex::encode(input.transaction_id.to_raw_bytes()), input.index))
    .collect::<std::collections::HashSet<_>>();
  let mut mapped_inputs = std::collections::HashSet::new();
  for utxo in &args.sender_utxos {
    if utxo.address.is_empty() && utxo.address_hex.is_none() {
      return Err("sender UTxO is missing its source address".to_owned());
    }
    let key = format!("{}#{}", utxo.tx_hash_hex.to_ascii_lowercase(), utxo.output_index);
    if !input_keys.contains(&key) {
      return Err("sender UTxO mapping does not match a transaction input".to_owned());
    }
    if !mapped_inputs.insert(key) {
      return Err("duplicate sender UTxO mapping".to_owned());
    }
  }
  let root_path = [
    parse_hardened_index(&args.purpose, "purpose")?,
    parse_hardened_index(&args.coin_type, "coin type")?,
    parse_hardened_index(&args.account_index, "account index")?,
  ];
  let mut vkeys = transaction.witness_set.vkeywitnesses.take().map(Vec::from).unwrap_or_default();
  let mut bootstraps =
    transaction.witness_set.bootstrap_witnesses.take().map(Vec::from).unwrap_or_default();

  for witness in args.witnesses {
    if witness.path.is_empty() || witness.path.len() > 13 {
      return Err("Ledger witness path must contain between 1 and 13 indexes".to_owned());
    }
    let relative_path = if witness.path.len() >= 3 && witness.path[..3] == root_path {
      &witness.path[3..]
    } else if witness.path.iter().any(|index| *index >= 0x8000_0000) {
      return Err("Ledger witness path does not match the supplied account path".to_owned());
    } else {
      witness.path.as_slice()
    };
    if relative_path.is_empty()
      || relative_path.len() > 10
      || relative_path.iter().any(|index| *index >= 0x8000_0000)
    {
      return Err(
        "Ledger witness path must contain between 1 and 10 soft indexes after the account path"
          .to_owned(),
      );
    }
    let source =
      args.sender_utxos.iter().find(|utxo| utxo.path == witness.path || utxo.path == relative_path);
    if source.is_none() && matches!(relative_path.first(), Some(0 | 1)) {
      return Err("Ledger payment witness is missing its sender UTxO mapping".to_owned());
    }
    let mut child = account.clone();
    for index in relative_path {
      child =
        child.derive(*index).map_err(|err| format!("cannot derive Ledger witness key: {err}"))?;
    }
    let public_key = child.to_raw_key();
    let signature_bytes = hex::decode(&witness.signature_hex)
      .map_err(|err| format!("invalid Ledger signature hex: {err}"))?;
    let signature = Ed25519Signature::from_raw_bytes(&signature_bytes)
      .map_err(|err| format!("invalid Ledger signature: {err}"))?;
    let body_hash = transaction.body.hash();
    if !public_key.verify(body_hash.to_raw_bytes(), &signature) {
      return Err("Ledger signature does not verify against transaction body hash".to_owned());
    }

    let byron = source.map(parse_sender_byron).transpose()?.flatten();
    if let Some(attributes) = byron {
      let chain_code = child.chaincode();
      let bootstrap = BootstrapWitness::new(public_key.clone(), signature, chain_code, attributes)
        .map_err(|err| format!("cannot create Byron bootstrap witness: {err}"))?;
      let duplicate = bootstraps.iter().any(|existing| {
        existing.public_key.to_raw_bytes() == bootstrap.public_key.to_raw_bytes()
          && existing.signature.to_raw_bytes() == bootstrap.signature.to_raw_bytes()
      });
      if !duplicate {
        bootstraps.push(bootstrap);
      }
    } else {
      let vkey = Vkeywitness::new(public_key, signature);
      if !vkeys.iter().any(|existing| existing.vkey.to_raw_bytes() == vkey.vkey.to_raw_bytes()) {
        vkeys.push(vkey);
      }
    }
  }

  if !vkeys.is_empty() {
    transaction.witness_set.vkeywitnesses = Some(NonemptySet::from(vkeys));
  }
  if !bootstraps.is_empty() {
    transaction.witness_set.bootstrap_witnesses = Some(NonemptySet::from(bootstraps));
  }
  let mut plutus_data =
    transaction.witness_set.plutus_datums.take().map(Vec::from).unwrap_or_default();
  for datum_hex in args.plutus_data_hexes {
    let datum_bytes =
      hex::decode(&datum_hex).map_err(|err| format!("invalid Plutus datum hex: {err}"))?;
    let datum = PlutusData::from_cbor_bytes(&datum_bytes)
      .map_err(|err| format!("invalid Plutus datum CBOR: {err}"))?;
    if !plutus_data.iter().any(|existing| existing.to_cbor_bytes() == datum.to_cbor_bytes()) {
      plutus_data.push(datum);
    }
  }
  if !plutus_data.is_empty() {
    transaction.witness_set.plutus_datums = Some(NonemptySet::from(plutus_data));
  }
  let resulting_hash = transaction.body.hash();
  if resulting_hash.to_raw_bytes() != expected {
    return Err("transaction body hash changed while applying Ledger witnesses".to_owned());
  }
  Ok(hex::encode(transaction.to_cbor_bytes()))
}

fn decode_hash(value: &str) -> Result<Vec<u8>, String> {
  let bytes =
    hex::decode(value).map_err(|err| format!("invalid expected transaction id hex: {err}"))?;
  TransactionHash::from_raw_bytes(&bytes)
    .map_err(|err| format!("invalid expected transaction id: {err}"))?;
  Ok(bytes)
}

fn parse_hardened_index(value: &str, label: &str) -> Result<u32, String> {
  let index = value.parse::<u32>().map_err(|err| format!("invalid {label}: {err}"))?;
  if index < 0x8000_0000 {
    return Err(format!("{label} must be hardened"));
  }
  Ok(index)
}

fn parse_sender_byron(utxo: &SenderUtxo) -> Result<Option<AddrAttributes>, String> {
  let address = if let Some(address_hex) = &utxo.address_hex {
    let bytes =
      hex::decode(address_hex).map_err(|err| format!("invalid sender address hex: {err}"))?;
    let parsed =
      Address::from_raw_bytes(&bytes).map_err(|err| format!("invalid sender address: {err}"))?;
    parsed
  } else if let Ok(byron) = ByronAddress::from_base58(&utxo.address) {
    Address::Byron(byron)
  } else {
    Address::from_bech32(&utxo.address).map_err(|err| format!("invalid sender address: {err}"))?
  };
  match address {
    Address::Byron(byron) => {
      if !utxo.address.is_empty() && byron.to_base58() != utxo.address {
        return Err("sender address and serialized address disagree".to_owned());
      }
      Ok(Some(byron.content.addr_attributes.clone()))
    }
    other => {
      if !utxo.address.is_empty()
        && other.to_bech32(None).ok().as_deref() != Some(utxo.address.as_str())
      {
        return Err("sender address and serialized address disagree".to_owned());
      }
      Ok(None)
    }
  }
}

#[cfg(test)]
mod tests {
  use super::{apply_ledger_witnesses_to_transaction_hex, ledger_signing_request_info_json};
  use crate::cml_transaction::build_simple_payment_transaction_hex;
  use cml_chain::serialization::Deserialize;
  use cml_chain::transaction::Transaction;
  use cml_crypto::{Bip32PrivateKey, RawBytesEncoding};

  const UNSIGNED: &str = "84a300d90102800180021a000f4240a0f5f6";

  #[test]
  fn ledger_path_rejects_every_invalid_hardened_boundary() {
    let hardened = 0x8000_0000;
    for path in [
      vec![1, hardened, hardened, 0, 0],
      vec![hardened, 1, hardened, 0, 0],
      vec![hardened, hardened, 1, 0, 0],
      vec![hardened, hardened, hardened, hardened, 0],
      vec![hardened, hardened, hardened, 0, hardened],
      vec![hardened, hardened, hardened, 0],
      vec![hardened, hardened, hardened, 0, 0, 0],
    ] {
      assert!(super::validate_ledger_path(&path).is_err(), "path {:?}", path);
    }
  }

  fn make_args(expected_id: &str) -> String {
    make_args_for_account(expected_id, 0x8000_0007)
  }

  fn make_args_for_account(expected_id: &str, account_index: u32) -> String {
    let root = Bip32PrivateKey::from_bip39_entropy(&[0x11; 16], b"");
    let account = root.derive(0x8000_073c).derive(0x8000_0717).derive(account_index);
    let account_xpub = account.to_public();
    let child = account.derive(2).derive(0);
    let unsigned = Transaction::from_cbor_bytes(&hex::decode(UNSIGNED).unwrap()).unwrap();
    let signature = child.to_raw_key().sign(&unsigned.body.hash().to_raw_bytes());
    serde_json::json!({
      "transactionHex": UNSIGNED,
      "accountPublicKeyHex": hex::encode(account_xpub.to_raw_bytes()),
      "purpose":"2147485500",
      "coinType":"2147485463",
      "accountIndex":account_index.to_string(),
      "witnesses": [{"path":[2,0],"signatureHex":hex::encode(signature.to_raw_bytes())}],
      "expectedTxIdHex": expected_id,
      "senderUtxos": []
    })
    .to_string()
  }

  #[test]
  fn accepts_account_zero_for_ledger_witness_application() {
    let transaction = Transaction::from_cbor_bytes(&hex::decode(UNSIGNED).unwrap()).unwrap();
    let expected_id = hex::encode(transaction.body.hash().to_raw_bytes());
    let args = make_args_for_account(&expected_id, 0x8000_0000);

    let signed_hex = apply_ledger_witnesses_to_transaction_hex(&args).unwrap();
    let signed = Transaction::from_cbor_bytes(&hex::decode(signed_hex).unwrap()).unwrap();

    assert_eq!(signed.witness_set.vkeywitnesses.unwrap().len(), 1);
  }

  #[test]
  fn malformed_cbor_is_reported_without_panicking() {
    let args = serde_json::json!({
      "transactionHex": "d8799f01e0ff",
      "networkId": 0,
      "protocolMagic": 764824073,
      "senderUtxos": [],
      "changeAddresses": [],
    })
    .to_string();
    assert!(ledger_signing_request_info_json(&args).is_err());
    let error = apply_ledger_witnesses_to_transaction_hex(
      &serde_json::json!({
        "transactionHex": "d8799f01e0ff",
        "accountPublicKeyHex": "",
        "purpose": "2147485500",
        "coinType": "2147485463",
        "accountIndex": "2147483655",
        "witnesses": [],
        "expectedTxIdHex": "00",
      })
      .to_string(),
    )
    .unwrap_err();
    assert!(error.starts_with("invalid transaction CBOR:"), "unexpected parse error: {error}");
  }

  #[test]
  fn malformed_ledger_plutus_data_is_reported_without_unwinding() {
    let transaction = Transaction::from_cbor_bytes(&hex::decode(UNSIGNED).unwrap()).unwrap();
    let expected = hex::encode(transaction.body.hash().to_raw_bytes());
    let mut args: serde_json::Value = serde_json::from_str(&make_args(&expected)).unwrap();
    args["plutusDataHexes"] = serde_json::json!(["d8799f01e0ff"]);
    let error = apply_ledger_witnesses_to_transaction_hex(&args.to_string()).unwrap_err();
    assert!(!error.is_empty());
  }

  #[test]
  fn merges_valid_ledger_vkey_witness_without_changing_body_hash() {
    let transaction = Transaction::from_cbor_bytes(&hex::decode(UNSIGNED).unwrap()).unwrap();
    let expected_id = hex::encode(transaction.body.hash().to_raw_bytes());
    let mut args: serde_json::Value = serde_json::from_str(&make_args(&expected_id)).unwrap();
    args["plutusDataHexes"] = serde_json::json!(["d87980"]);
    let signed_hex = apply_ledger_witnesses_to_transaction_hex(&args.to_string()).unwrap();
    let signed = Transaction::from_cbor_bytes(&hex::decode(signed_hex).unwrap()).unwrap();
    assert_eq!(hex::encode(signed.body.hash().to_raw_bytes()), expected_id);
    let witnesses = signed.witness_set.vkeywitnesses.unwrap();
    assert_eq!(witnesses.len(), 1);
    assert!(witnesses[0]
      .vkey
      .verify(&signed.body.hash().to_raw_bytes(), &witnesses[0].ed25519_signature,));
    assert_eq!(signed.witness_set.plutus_datums.as_ref().unwrap().len(), 1);
  }

  #[test]
  fn rejects_ledger_body_hash_mismatch_before_returning_serialized_bytes() {
    let err = apply_ledger_witnesses_to_transaction_hex(&make_args(&"00".repeat(32))).unwrap_err();
    assert!(err.contains("does not match expected Ledger transaction id"));
  }

  #[test]
  fn rejects_payment_witness_without_source_mapping_and_bad_signature() {
    let transaction = Transaction::from_cbor_bytes(&hex::decode(UNSIGNED).unwrap()).unwrap();
    let expected = hex::encode(transaction.body.hash().to_raw_bytes());
    let mut args: serde_json::Value = serde_json::from_str(&make_args(&expected)).unwrap();
    args["witnesses"][0]["path"] = serde_json::json!([0, 0]);
    assert!(apply_ledger_witnesses_to_transaction_hex(&args.to_string())
      .unwrap_err()
      .contains("missing its sender UTxO"));
    args["witnesses"][0]["path"] = serde_json::json!([2, 0]);
    args["witnesses"][0]["signatureHex"] = serde_json::json!("00".repeat(64));
    assert!(apply_ledger_witnesses_to_transaction_hex(&args.to_string())
      .unwrap_err()
      .contains("does not verify"));
  }

  #[test]
  fn rejects_mismatched_and_duplicate_sender_input_mappings() {
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let tx_hash = "00".repeat(32);
    let recipe = format!(
      "{tx_hash},0,{address},10000000,-|{address},2000000,-,-|{address}|-|44|155381|4310|2000000|500000000|5000"
    );
    let built = build_simple_payment_transaction_hex(&recipe).unwrap();
    let unsigned_hex = built.rsplit_once('|').unwrap().0;
    let transaction = Transaction::from_cbor_bytes(&hex::decode(unsigned_hex).unwrap()).unwrap();
    let expected = hex::encode(transaction.body.hash().to_raw_bytes());
    let mut args: serde_json::Value = serde_json::from_str(&make_args(&expected)).unwrap();
    args["transactionHex"] = serde_json::json!(unsigned_hex);
    let utxo = serde_json::json!({
      "txHashHex":"ff".repeat(32), "outputIndex":0, "address":"addr_test1fixture", "path":[0,0]
    });
    args["senderUtxos"] = serde_json::json!([utxo.clone()]);
    assert!(apply_ledger_witnesses_to_transaction_hex(&args.to_string())
      .unwrap_err()
      .contains("does not match a transaction input"));
    let matched = serde_json::json!({
      "txHashHex":tx_hash, "outputIndex":0, "address":address, "path":[0,0]
    });
    args["senderUtxos"] = serde_json::json!([matched.clone(), matched]);
    assert!(apply_ledger_witnesses_to_transaction_hex(&args.to_string())
      .unwrap_err()
      .contains("duplicate sender UTxO"));
  }

  #[test]
  fn creates_byron_bootstrap_witness_with_parsed_attributes_and_child_chain_code() {
    use cml_chain::byron::ByronAddress;

    let byron = "Ae2tdPwUPEZ5uzkzh1o2DHECiUi3iugvnnKHRisPgRRP3CTF4KCMvy54Xd3";
    let address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let tx_hash = "01".repeat(32);
    let address_hex =
      hex::encode(ByronAddress::from_base58(byron).unwrap().to_address().to_raw_bytes());
    let recipe = format!(
      "{tx_hash},0,{byron},10000000,-,-,-,{address_hex},true|{address},2000000,-,-|{address}|-|44|155381|4310|2000000|500000000|5000|-|-|-|-|-|-|-|false"
    );
    let built = build_simple_payment_transaction_hex(&recipe).unwrap();
    let unsigned_hex = built.rsplit_once('|').unwrap().0;
    let unsigned = Transaction::from_cbor_bytes(&hex::decode(unsigned_hex).unwrap()).unwrap();
    let expected_id = hex::encode(unsigned.body.hash().to_raw_bytes());
    let root = Bip32PrivateKey::from_bip39_entropy(&[0x11; 16], b"");
    let account = root.derive(0x8000_073c).derive(0x8000_0717).derive(0x8000_0007);
    let child = account.derive(0).derive(0);
    let signature = child.to_raw_key().sign(&unsigned.body.hash().to_raw_bytes());
    let args = serde_json::json!({
      "transactionHex": unsigned_hex,
      "accountPublicKeyHex": hex::encode(account.to_public().to_raw_bytes()),
      "purpose":"2147485500", "coinType":"2147485463", "accountIndex":"2147483655",
      "witnesses":[{"path":[0,0],"signatureHex":hex::encode(signature.to_raw_bytes())}],
      "expectedTxIdHex":expected_id,
      "senderUtxos":[{"txHashHex":tx_hash,"outputIndex":0,"address":byron,"addressHex":address_hex,"path":[0,0]}]
    }).to_string();
    let signed_hex = apply_ledger_witnesses_to_transaction_hex(&args).unwrap();
    let signed = Transaction::from_cbor_bytes(&hex::decode(signed_hex).unwrap()).unwrap();
    assert_eq!(hex::encode(signed.body.hash().to_raw_bytes()), expected_id);
    let bootstrap = &signed.witness_set.bootstrap_witnesses.as_ref().unwrap()[0];
    let parsed_address = ByronAddress::from_base58(byron).unwrap();
    assert_eq!(bootstrap.attributes, parsed_address.content.addr_attributes);
    assert_eq!(bootstrap.chain_code, child.chaincode());
    assert_eq!(bootstrap.public_key.to_raw_bytes(), child.to_public().to_raw_key().to_raw_bytes());
    assert!(bootstrap.public_key.verify(&signed.body.hash().to_raw_bytes(), &bootstrap.signature));
  }

  #[test]
  fn ledger_request_info_maps_ordered_inputs_and_change_by_address_bytes() {
    let sender_address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let recipient_address = "addr_test1wzzfgjazt5ts34cstrhzaac4xav8x7z2m3vg76s8qmaztzglsw8k5";
    let tx_hash = "03".repeat(32);
    let recipe = format!(
      "{tx_hash},0,{sender_address},10000000,-|{recipient_address},2000000,-,-|{sender_address}|123456|44|155381|4310|2000000|500000000|5000"
    );
    let built = build_simple_payment_transaction_hex(&recipe).unwrap();
    let transaction_hex = built.rsplit_once('|').unwrap().0;
    let purpose = 2_147_485_500_u32;
    let coin = 2_147_485_463_u32;
    let account = 2_147_483_655_u32;
    let path = vec![purpose, coin, account, 0_u32, 1_u32];
    let args = serde_json::json!({
      "transactionHex": transaction_hex,
      "networkId": 0,
      "protocolMagic": 764824073_u64,
      "senderUtxos": [{"txHashHex":tx_hash,"outputIndex":0,"address":sender_address,"path":path}],
      "changeAddresses": [{"address":sender_address,"path":[purpose,coin,account,1_u32,0_u32]}],
      "stakingPath": [purpose,coin,account,2_u32,0_u32]
    })
    .to_string();
    let info: serde_json::Value =
      serde_json::from_str(&ledger_signing_request_info_json(&args).unwrap()).unwrap();
    assert_eq!(info["inputs"][0]["txHashHex"], tx_hash);
    assert_eq!(info["inputs"][0]["path"], serde_json::json!(path));
    assert_eq!(info["outputs"][0]["deviceOwnedAddress"], false);
    assert_eq!(info["outputs"][1]["deviceOwnedAddress"], true);
    assert_eq!(
      info["outputs"][1]["deviceOwnedPath"],
      serde_json::json!([purpose, coin, account, 1_u32, 0_u32])
    );
    assert_eq!(info["network"]["protocolMagic"], 764824073_u64);
    let mut invalid_change: serde_json::Value = serde_json::from_str(&args).unwrap();
    invalid_change["changeAddresses"][0]["address"] = serde_json::json!("not-an-address");
    assert!(ledger_signing_request_info_json(&invalid_change.to_string())
      .unwrap_err()
      .to_lowercase()
      .contains("address"));
  }

  #[test]
  fn ledger_request_info_accepts_account_zero_paths() {
    let sender_address = "addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam";
    let recipient_address = "addr_test1wzzfgjazt5ts34cstrhzaac4xav8x7z2m3vg76s8qmaztzglsw8k5";
    let tx_hash = "04".repeat(32);
    let recipe = format!(
      "{tx_hash},0,{sender_address},10000000,-|{recipient_address},2000000,-,-|{sender_address}|-|44|155381|4310|2000000|500000000|5000"
    );
    let built = build_simple_payment_transaction_hex(&recipe).unwrap();
    let transaction_hex = built.rsplit_once('|').unwrap().0;
    let purpose = 0x8000_073c_u32;
    let coin_type = 0x8000_0717_u32;
    let account = 0x8000_0000_u32;
    let path = vec![purpose, coin_type, account, 0, 0];
    let args = serde_json::json!({
      "transactionHex": transaction_hex,
      "networkId": 0,
      "protocolMagic": 764824073_u64,
      "senderUtxos": [{"txHashHex": tx_hash, "outputIndex": 0, "address": sender_address, "path": path}],
      "changeAddresses": [],
      "stakingPath": path
    })
    .to_string();

    let info: serde_json::Value =
      serde_json::from_str(&ledger_signing_request_info_json(&args).unwrap()).unwrap();
    assert_eq!(info["inputs"][0]["path"], serde_json::json!(path));
  }
}
