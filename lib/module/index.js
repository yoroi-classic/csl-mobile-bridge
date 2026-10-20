// Generated TypeScript index file for CSL JSI Native State Bridge
// This file provides a convenient entry point for the bridge
// DO NOT EDIT - Generated automatically

import CslMobileBridge from './NativeCslMobileBridge';
export { AddressKind, BlockEra, ByronAddressType, CborContainerType, CborSetType, CertificateKind, CoinSelectionStrategyCIP2, CredKind, DRepKind, GovernanceActionKind, LanguageKind, MIRKind, MIRPot, MetadataJsonSchema, NativeScriptKind, NetworkIdKind, PlutusDataKind, PlutusDatumSchema, RedeemerTagKind, RelayKind, ScriptHashNamespace, ScriptSchema, TransactionMetadatumKind, TransactionSetsState, VoteKind, VoterKind } from './BridgeTypes';
let _cslBridge = null;
const getCslBridge = () => {
  if (_cslBridge === null) {
    _cslBridge = CslMobileBridge.install();
  }
  return _cslBridge;
};
const cslBridge = getCslBridge();
export default cslBridge;

/** Extract the canonical serialized stake credential from a base address using CML. */
export const stakeCredentialHexFromAddress = address => {
  const cmlBridge = cslBridge;
  return cmlBridge.stake_credential_hex_from_address(address);
};
export const rewardAddressDetailsFromAddress = address => {
  const cmlBridge = cslBridge;
  return cmlBridge.reward_address_details_from_address(address);
};
export const signTransactionHex = (transactionHex, privateKeyHex) => {
  const cmlBridge = cslBridge;
  return cmlBridge.sign_transaction_hex(transactionHex, privateKeyHex);
};
/** Derive wallet signing keys and sign entirely inside the CML native bridge. */
export const signWalletTransactionHex = args => {
  const cmlBridge = cslBridge;
  return cmlBridge.sign_wallet_transaction_hex(JSON.stringify(args));
};

/** Derive a Cardano BIP32 root key from BIP39 entropy inside the native CML bridge. */
export const walletRootKeyHexFromEntropy = entropyHex => {
  const cmlBridge = cslBridge;
  return cmlBridge.wallet_root_key_hex_from_entropy(entropyHex);
};
/** Derive an account public key in CML without exporting derived private keys. */
export const deriveAccountPublicKeyHex = args => {
  const cmlBridge = cslBridge;
  return cmlBridge.derive_account_public_key_hex(JSON.stringify(args));
};
/** Derive each wallet signing key and sign a transaction entirely in CML. */
export const signWalletTransactionPathsHex = args => {
  const cmlBridge = cslBridge;
  return cmlBridge.sign_wallet_transaction_paths_hex(JSON.stringify(args));
};
export const signWalletData = args => {
  const cmlBridge = cslBridge;
  return JSON.parse(cmlBridge.sign_wallet_data(JSON.stringify(args)));
};
export const deriveWalletPublicKeyHex = args => {
  const cmlBridge = cslBridge;
  return cmlBridge.derive_wallet_public_key_hex(JSON.stringify(args));
};

/** Compute the Cardano transaction ID from the transaction body's CML hash. */
export const transactionIdHex = transactionHex => {
  const cmlBridge = cslBridge;
  return cmlBridge.transaction_id_hex(transactionHex);
};

/** Parse transaction fields required by CIP-30 preflight validation. */
export const transactionValidationInfoJson = transactionHex => {
  const cmlBridge = cslBridge;
  return cmlBridge.transaction_validation_info_json(transactionHex);
};
export const buildEscrowRedeemTransactionCml = args => {
  const cmlBridge = cslBridge;
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
  const cmlBridge = cslBridge;
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
  const cmlBridge = cslBridge;
  const result = cmlBridge.build_simple_payment_transaction_hex([args.inputs.map(({
    transactionHashHex,
    index,
    address,
    lovelace,
    assets,
    nativeScriptCborHex,
    nativeScriptWitnessCount
  }) => [transactionHashHex, index, address, lovelace, (assets ?? []).map(({
    policyIdHex,
    assetNameHex,
    quantity
  }) => [policyIdHex, assetNameHex, quantity].join('~')).join('^') || '-', nativeScriptCborHex ?? '-', nativeScriptWitnessCount ?? '-'].join(',')).join(';'), args.outputs.map(({
    address,
    lovelace,
    assets,
    datum
  }) => [address, lovelace, (assets ?? []).map(({
    policyIdHex,
    assetNameHex,
    quantity
  }) => [policyIdHex, assetNameHex, quantity].join('~')).join('^') || '-', datum ? `${datum.kind}~${datum.hex}` : '-'].join(',')).join(';'), args.changeAddress, args.ttl, args.feeCoefficient, args.feeConstant, args.coinsPerUtxoByte, args.keyDeposit, args.poolDeposit, args.maxValueSize, args.metadata ? encodeURIComponent(JSON.stringify(args.metadata)) : '-', ((_args$nativeMints = args.nativeMints) === null || _args$nativeMints === void 0 ? void 0 : _args$nativeMints.map(({
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
  }) => [policyIdHex, assetNameHex, quantity].join('~')).join('^') || '-'].join(',')).join(';')) || '-'].join('|'));
  const separator = result.lastIndexOf('|');
  if (separator < 0) throw new Error('Malformed CML payment transaction result');
  return {
    cborHex: result.slice(0, separator),
    fee: result.slice(separator + 1)
  };
};

/** Parse a bech32 or hex address and return its raw bytes as hex using CML. */
export const addressToHex = address => {
  const cmlBridge = cslBridge;
  return cmlBridge.address_to_hex(address);
};

/** Parse an address with CML and return normalized bytes, network ID and bech32 when available. */
export const addressInfoFromAddress = address => {
  const cmlBridge = cslBridge;
  return JSON.parse(cmlBridge.address_info_from_address(address));
};

/** Hash serialized Plutus datum CBOR with the CML native bridge. */
export const hashPlutusDataCborHex = cborHex => {
  const cmlBridge = cslBridge;
  return cmlBridge.hash_plutus_data_cbor_hex(cborHex);
};

/** Decode serialized Plutus data into the Yoroi display structure with CML. */
export const decodePlutusDataCborHex = cborHex => {
  const cmlBridge = cslBridge;
  return cmlBridge.decode_plutus_data_cbor_hex(cborHex);
};

/** CML-native helper exposed alongside the legacy CSL object bridge. */
export const rewardAddressFromAddress = (address, network) => {
  const cmlBridge = cslBridge;
  return cmlBridge.reward_address_from_address(address, network);
};
export const rewardAddressHexFromAccountPublicKey = (accountPublicKeyHex, network, role, index) => {
  const cmlBridge = cslBridge;
  return cmlBridge.reward_address_hex_from_account_public_key(accountPublicKeyHex, network, role, index);
};

// Type aliases for class types

export const {
  Address,
  Anchor,
  AnchorDataHash,
  AssetName,
  AssetNames,
  Assets,
  AuxiliaryData,
  AuxiliaryDataHash,
  AuxiliaryDataSet,
  BaseAddress,
  BigInt,
  BigNum,
  Bip32PrivateKey,
  Bip32PublicKey,
  Block,
  BlockHash,
  BootstrapWitness,
  BootstrapWitnesses,
  ByronAddress,
  Certificate,
  Certificates,
  CertificatesBuilder,
  ChangeConfig,
  Committee,
  CommitteeColdResign,
  CommitteeHotAuth,
  Constitution,
  ConstrPlutusData,
  CostModel,
  Costmdls,
  Credential,
  Credentials,
  DNSRecordAorAAAA,
  DNSRecordSRV,
  DRep,
  DRepDeregistration,
  DRepRegistration,
  DRepUpdate,
  DRepVotingThresholds,
  DataCost,
  DataHash,
  DatumSource,
  Ed25519KeyHash,
  Ed25519KeyHashes,
  Ed25519Signature,
  EnterpriseAddress,
  ExUnitPrices,
  ExUnits,
  FixedBlock,
  FixedTransaction,
  FixedTransactionBodies,
  FixedTransactionBody,
  FixedTxWitnessesSet,
  FixedVersionedBlock,
  GeneralTransactionMetadata,
  GenesisDelegateHash,
  GenesisHash,
  GenesisHashes,
  GenesisKeyDelegation,
  GovernanceAction,
  GovernanceActionId,
  GovernanceActionIds,
  HardForkInitiationAction,
  Header,
  HeaderBody,
  InfoAction,
  Int,
  Ipv4,
  Ipv6,
  KESSignature,
  KESVKey,
  Language,
  Languages,
  LegacyDaedalusPrivateKey,
  LinearFee,
  MIRToStakeCredentials,
  MalformedAddress,
  MetadataList,
  MetadataMap,
  Mint,
  MintAssets,
  MintBuilder,
  MintWitness,
  MintsAssets,
  MoveInstantaneousReward,
  MoveInstantaneousRewardsCert,
  MultiAsset,
  MultiHostName,
  NativeScript,
  NativeScriptSource,
  NativeScripts,
  NetworkId,
  NetworkInfo,
  NewConstitutionAction,
  NoConfidenceAction,
  Nonce,
  OperationalCert,
  OutputDatum,
  ParameterChangeAction,
  PlutusData,
  PlutusList,
  PlutusMap,
  PlutusMapValues,
  PlutusScript,
  PlutusScriptSource,
  PlutusScripts,
  PlutusWitness,
  PlutusWitnesses,
  Pointer,
  PointerAddress,
  PoolMetadata,
  PoolMetadataHash,
  PoolParams,
  PoolRegistration,
  PoolRetirement,
  PoolVotingThresholds,
  PrivateKey,
  ProposedProtocolParameterUpdates,
  ProtocolParamUpdate,
  ProtocolVersion,
  PublicKey,
  PublicKeys,
  Redeemer,
  RedeemerTag,
  Redeemers,
  Relay,
  Relays,
  RewardAddress,
  RewardAddresses,
  ScriptAll,
  ScriptAny,
  ScriptDataHash,
  ScriptHash,
  ScriptHashes,
  ScriptNOfK,
  ScriptPubkey,
  ScriptRef,
  SingleHostAddr,
  SingleHostName,
  StakeAndVoteDelegation,
  StakeDelegation,
  StakeDeregistration,
  StakeRegistration,
  StakeRegistrationAndDelegation,
  StakeVoteRegistrationAndDelegation,
  Strings,
  TimelockExpiry,
  TimelockStart,
  Transaction,
  TransactionBatch,
  TransactionBatchList,
  TransactionBodies,
  TransactionBody,
  TransactionBuilder,
  TransactionBuilderConfig,
  TransactionBuilderConfigBuilder,
  TransactionHash,
  TransactionInput,
  TransactionInputs,
  TransactionMetadatum,
  TransactionMetadatumLabels,
  TransactionOutput,
  TransactionOutputAmountBuilder,
  TransactionOutputBuilder,
  TransactionOutputs,
  TransactionUnspentOutput,
  TransactionUnspentOutputs,
  TransactionWitnessSet,
  TransactionWitnessSets,
  TreasuryWithdrawals,
  TreasuryWithdrawalsAction,
  TxInputsBuilder,
  URL,
  UnitInterval,
  Update,
  UpdateCommitteeAction,
  VRFCert,
  VRFKeyHash,
  VRFVKey,
  Value,
  VersionedBlock,
  Vkey,
  Vkeys,
  Vkeywitness,
  Vkeywitnesses,
  VoteDelegation,
  VoteRegistrationAndDelegation,
  Voter,
  Voters,
  VotingBuilder,
  VotingProcedure,
  VotingProcedures,
  VotingProposal,
  VotingProposalBuilder,
  VotingProposals,
  Withdrawals,
  WithdrawalsBuilder,
  calculate_ex_units_ceil_cost,
  create_send_all,
  decode_arbitrary_bytes_from_metadatum,
  decode_metadatum_to_json_str,
  decode_plutus_datum_to_json_str,
  decrypt_with_password,
  encode_arbitrary_bytes_as_metadatum,
  encode_json_str_to_metadatum,
  encode_json_str_to_native_script,
  encode_json_str_to_plutus_datum,
  encrypt_with_password,
  get_deposit,
  get_implicit_input,
  has_transaction_set_tag,
  hash_auxiliary_data,
  hash_plutus_data,
  hash_script_data,
  make_daedalus_bootstrap_witness,
  make_icarus_bootstrap_witness,
  make_vkey_witness,
  min_ada_for_output,
  min_fee,
  min_ref_script_fee,
  min_script_fee
} = cslBridge;
//# sourceMappingURL=index.js.map