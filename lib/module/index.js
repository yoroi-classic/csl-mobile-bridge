import CmlMobileBridge from './NativeCmlMobileBridge';
const bridgeTypes = {};
const nativeCmlBridge = CmlMobileBridge.install();

/** Extract the canonical serialized stake credential from a base address using CML. */
export const stakeCredentialHexFromAddress = address => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.stake_credential_hex_from_address(address);
};
export const rewardAddressDetailsFromAddress = address => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.reward_address_details_from_address(address);
};
/** Decode the escrow datum using CML; all integer fields are decimal strings. */
export const escrowDatumInfoJson = datumCborHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.escrow_datum_info_json(datumCborHex);
};

/** Advance an escrow datum's thaw time and decrement its remaining count. */
export const updatedEscrowDatumCborHex = datumCborHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.updated_escrow_datum_cbor_hex(datumCborHex);
};
/** Derive an escrow script address with CML, retaining base-address staking credentials. */
export const deriveEscrowAddress = args => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.derive_escrow_address(JSON.stringify(args));
};

/** Normalize a Cardano pool identifier or key hash using CML. */
export const normalizePoolIdentifier = poolIdOrHash => {
  const cmlBridge = nativeCmlBridge;
  const [id, hash] = cmlBridge.normalize_pool_identifier(poolIdOrHash).split('\n');
  if (!id || !hash) throw new Error('Invalid CML pool identifier response');
  return {
    id,
    hash
  };
};
/** Resolve a CNS Plutus address record into normalized credential data and a CML address. */
export const resolveCnsAddressRecord = args => {
  const cmlBridge = nativeCmlBridge;
  return JSON.parse(cmlBridge.resolve_cns_address_record(JSON.stringify(args)));
};

/** Verify the Ed25519 signature over caller-supplied bytes (CIP-8 Sig_structure for signData). */
export const verifyEd25519Signature = args => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.verify_ed25519_signature(JSON.stringify(args)) === 'true';
};

/** Derive the Cardano key hash from a raw Ed25519 public key. */
export const publicKeyHashHexFromRawHex = publicKeyHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.public_key_hash_hex_from_raw_hex(JSON.stringify({
    publicKeyHex
  }));
};
export const signTransactionHex = (transactionHex, privateKeyHex) => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.sign_transaction_hex(transactionHex, privateKeyHex);
};
/** Derive wallet signing keys and sign entirely inside the CML native bridge. */
export const signWalletTransactionHex = args => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.sign_wallet_transaction_hex(JSON.stringify(args));
};

/** Derive a Cardano BIP32 root key from BIP39 entropy inside the native CML bridge. */
export const walletRootKeyHexFromEntropy = entropyHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.wallet_root_key_hex_from_entropy(entropyHex);
};
/** Derive an account public key in CML without exporting derived private keys. */
export const deriveAccountPublicKeyHex = args => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.derive_account_public_key_hex(JSON.stringify(args));
};

/** Derive a raw child public key from an account extended public key and soft path. */
export const derivePublicKeyFromAccountPathHex = (accountPublicKeyHex, path) => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.derive_public_key_from_account_path_hex(JSON.stringify({
    accountPublicKeyHex,
    path
  }));
};
export const baseAddressBech32FromPublicKeyHashes = (paymentKeyHashHex, stakeKeyHashHex, networkId) => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.base_address_bech32_from_public_key_hashes(JSON.stringify({
    paymentKeyHashHex,
    stakeKeyHashHex,
    networkId
  }));
};
export const rewardAddressHexFromPublicKeyHash = (stakeKeyHashHex, networkId) => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.reward_address_hex_from_public_key_hash(JSON.stringify({
    stakeKeyHashHex,
    networkId
  }));
};
export const icarusAddressBase58FromAccountPublicKeyHex = (accountPublicKeyHex, role, index, protocolMagic) => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.icarus_address_base58_from_account_public_key_hex(JSON.stringify({
    accountPublicKeyHex,
    role,
    index,
    protocolMagic
  }));
};
/** Derive each wallet signing key and sign a transaction entirely in CML. */
export const signWalletTransactionPathsHex = args => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.sign_wallet_transaction_paths_hex(JSON.stringify(args));
};
export const signWalletData = args => {
  const cmlBridge = nativeCmlBridge;
  return JSON.parse(cmlBridge.sign_wallet_data(JSON.stringify(args)));
};
export const deriveWalletPublicKeyHex = args => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.derive_wallet_public_key_hex(JSON.stringify(args));
};

/** Compute the Cardano transaction ID from the transaction body's CML hash. */
export const transactionIdHex = transactionHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.transaction_id_hex(transactionHex);
};

/** Parse transaction fields required by CIP-30 preflight validation. */
export const transactionValidationInfoJson = transactionHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.transaction_validation_info_json(transactionHex);
};

/** Parse a transaction into the CML-backed ReviewTx DTO (all quantities are strings). */
export const transactionReviewInfoJson = transactionHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.transaction_review_info_json(transactionHex);
};

/** Parse normalized body/witness fields used to determine required wallet signers. */
export const transactionSigningRequirementsJson = transactionHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.transaction_signing_requirements_json(transactionHex);
};

/** Extract the serialized witness set from a signed transaction using CML. */
export const transactionWitnessSetHex = transactionHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.transaction_witness_set_hex(transactionHex);
};

/** Replace witnesses with an empty set while preserving transaction body and auxiliary data. */
export const emptyWitnessTransactionHex = transactionHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.empty_witness_transaction_hex(transactionHex);
};
/** Decode CML Value CBOR into lossless decimal-string quantities. */
export const valueFromHexInfoJson = valueCborHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.value_from_hex_info_json(valueCborHex);
};

/** Encode decimal-string quantities as CML Value CBOR. */
export const valueFromAmountsHex = args => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.value_from_amounts_hex(JSON.stringify(args));
};

/** Return unique key hashes in native-script traversal order. */
export const nativeScriptRequiredKeyHashesJson = scriptCborHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.native_script_required_key_hashes_json(scriptCborHex);
};

/** Derive a raw Ed25519 public key from a 32-byte raw or 64-byte extended private key. */
export const publicKeyHexFromPrivateKeyHex = privateKeyHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.public_key_hex_from_private_key_hex(privateKeyHex);
};

/** Sign exact message bytes with a 32-byte raw or 64-byte extended Ed25519 private key. */
export const signEd25519MessageHex = (privateKeyHex, messageHex) => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.sign_ed25519_message_hex(privateKeyHex, messageHex);
};
/** Calculate a policy/script hash; Plutus language must be explicit for correct namespacing. */
export const scriptHashHexFromCbor = (scriptType, scriptCborHex) => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.script_hash_hex_from_cbor(JSON.stringify({
    scriptType,
    scriptCborHex
  }));
};

/** Generate the legacy-compatible Catalyst raw private-key bytes from BIP39 entropy/password hex. */
export const catalystPrivateKeyHexFromEntropy = (entropyHex, passwordHex = '') => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.catalyst_private_key_hex_from_entropy(JSON.stringify({
    entropyHex,
    passwordHex
  }));
};

/** Add verified Ledger signatures to an unsigned transaction without changing its body. */
export const applyLedgerWitnessesToTransactionHex = args => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.apply_ledger_witnesses_to_transaction_hex(JSON.stringify(args));
};

/** Return CML-decoded transaction fields, validated source paths, and change output paths for Ledger mapping. */
export const ledgerSigningRequestInfoJson = args => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.ledger_signing_request_info_json(JSON.stringify(args));
};
export const buildEscrowRedeemTransactionCml = args => {
  const cmlBridge = nativeCmlBridge;
  const [cborHex, fee] = cmlBridge.build_escrow_redeem_transaction_hex(JSON.stringify(args)).split('|');
  if (!cborHex || !fee || !/^\d+$/.test(fee)) {
    throw new Error('CML escrow transaction builder returned an invalid result');
  }
  return {
    cborHex,
    fee
  };
};
const assertSafeMetadataNumbers = value => {
  if (typeof value === 'number' && Number.isInteger(value) && !Number.isSafeInteger(value)) {
    throw new RangeError('Metadata integers must be safe JavaScript integers');
  }
  if (Array.isArray(value)) {
    value.forEach(assertSafeMetadataNumbers);
  } else if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(assertSafeMetadataNumbers);
  }
};
export const minimumCoinForAssets = (address, assets, coinsPerUtxoByte) => {
  const cmlBridge = nativeCmlBridge;
  const packedAssets = assets.map(({
    policyIdHex,
    assetNameHex,
    quantity
  }) => [policyIdHex, assetNameHex, quantity].join('~')).join('^') || '-';
  return cmlBridge.minimum_coin_for_assets([address, packedAssets, coinsPerUtxoByte].join('|'));
};

/** Build a transaction with CML using ADA and multiasset value bundles. */
export const buildSimplePaymentTransaction = args => {
  var _args$metadata, _args$nativeMints, _args$certificates, _args$withdrawals, _args$referenceInputs;
  (_args$metadata = args.metadata) === null || _args$metadata === void 0 || _args$metadata.forEach(({
    data
  }) => assertSafeMetadataNumbers(data));
  const cmlBridge = nativeCmlBridge;
  const result = cmlBridge.build_simple_payment_transaction_hex([args.inputs.map(({
    transactionHashHex,
    index,
    address,
    addressHex,
    isBootstrap,
    lovelace,
    assets,
    nativeScriptCborHex,
    nativeScriptWitnessCount
  }) => [transactionHashHex, index, address, lovelace, (assets ?? []).map(({
    policyIdHex,
    assetNameHex,
    quantity
  }) => [policyIdHex, assetNameHex, quantity].join('~')).join('^') || '-', nativeScriptCborHex ?? '-', nativeScriptWitnessCount ?? '-', ...(addressHex !== undefined || isBootstrap !== undefined ? [addressHex ?? '-', isBootstrap === undefined ? '-' : String(isBootstrap)] : [])].join(',')).join(';'), [...args.outputs, ...(args.manualChangeOutput ? [args.manualChangeOutput] : [])].map(({
    address,
    lovelace,
    assets,
    datum
  }) => [address, lovelace, (assets ?? []).map(({
    policyIdHex,
    assetNameHex,
    quantity
  }) => [policyIdHex, assetNameHex, quantity].join('~')).join('^') || '-', datum ? `${datum.kind}~${datum.hex}` : '-'].join(',')).join(';'), args.changeAddress, args.ttl ?? '-', args.feeCoefficient, args.feeConstant, args.coinsPerUtxoByte, args.keyDeposit, args.poolDeposit, args.maxValueSize, args.metadata ? encodeURIComponent(JSON.stringify(args.metadata)) : '-', ((_args$nativeMints = args.nativeMints) === null || _args$nativeMints === void 0 ? void 0 : _args$nativeMints.map(({
    policyIdHex,
    scriptCborHex,
    assets
  }) => [policyIdHex, 'native', scriptCborHex, assets.map(({
    assetNameHex,
    quantity
  }) => [assetNameHex, quantity].join('~')).join('^')].join(',')).join(';')) || '-', (_args$certificates = args.certificates) !== null && _args$certificates !== void 0 && _args$certificates.length ? encodeURIComponent(JSON.stringify(args.certificates)) : '-', (_args$withdrawals = args.withdrawals) !== null && _args$withdrawals !== void 0 && _args$withdrawals.length ? encodeURIComponent(JSON.stringify(args.withdrawals)) : '-', args.validityStart ?? '-', ((_args$referenceInputs = args.referenceInputs) === null || _args$referenceInputs === void 0 ? void 0 : _args$referenceInputs.map(({
    transactionHashHex,
    index,
    address,
    lovelace,
    assets
  }) => [transactionHashHex, index, address, lovelace, (assets ?? []).map(({
    policyIdHex,
    assetNameHex,
    quantity
  }) => [policyIdHex, assetNameHex, quantity].join('~')).join('^') || '-'].join(',')).join(';')) || '-', ...(args.manualFee !== undefined || args.manualChangeOutput !== undefined ? [args.manualFee ?? '-', String(Boolean(args.manualChangeOutput))] : [])].join('|'));
  const separator = result.lastIndexOf('|');
  if (separator < 0) throw new Error('Malformed CML payment transaction result');
  return {
    cborHex: result.slice(0, separator),
    fee: result.slice(separator + 1)
  };
};

/** Build a normalized decimal-string transaction recipe through the CML bridge. */
export const buildTransactionRecipeCml = args => {
  args.metadata.forEach(({
    data
  }) => assertSafeMetadataNumbers(data));
  const cmlBridge = nativeCmlBridge;
  const result = cmlBridge.build_transaction_recipe_cml_hex(JSON.stringify(args));
  const separator = result.lastIndexOf('|');
  if (separator < 0) throw new Error('Malformed CML transaction recipe result');
  return {
    cborHex: result.slice(0, separator),
    fee: result.slice(separator + 1)
  };
};

/** Parse a bech32 or hex address and return its raw bytes as hex using CML. */
export const addressToHex = address => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.address_to_hex(address);
};

/** Parse an address with CML and return normalized bytes, network ID and bech32 when available. */
export const addressInfoFromAddress = address => {
  const cmlBridge = nativeCmlBridge;
  return JSON.parse(cmlBridge.address_info_from_address(address));
};

/** Hash serialized Plutus datum CBOR with the CML native bridge. */
export const hashPlutusDataCborHex = cborHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.hash_plutus_data_cbor_hex(cborHex);
};

/** Decode serialized Plutus data into the Yoroi display structure with CML. */
export const decodePlutusDataCborHex = cborHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.decode_plutus_data_cbor_hex(cborHex);
};

/** Extract inline datum/hash information from transaction-output CBOR. */
export const datumInfoFromOutputCborHex = outputCborHex => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.datum_info_from_output_cbor_hex(outputCborHex);
};
/** Serialize a CIP-30 TransactionUnspentOutput using CML. */
export const transactionUnspentOutputHex = args => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.transaction_unspent_output_hex(JSON.stringify(args));
};

/** Extract a reward address from a Cardano address using CML. */
export const rewardAddressFromAddress = (address, network) => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.reward_address_from_address(address, network);
};
export const rewardAddressHexFromAccountPublicKey = (accountPublicKeyHex, network, role, index) => {
  const cmlBridge = nativeCmlBridge;
  return cmlBridge.reward_address_hex_from_account_public_key(accountPublicKeyHex, network, role, index);
};
//# sourceMappingURL=index.js.map