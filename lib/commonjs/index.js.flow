import CmlMobileBridge from './NativeCmlMobileBridge';

type CmlBridgeExports = Record<string, (...args: never[]) => unknown>;
const bridgeTypes = {} as CmlBridgeExports;
const nativeCmlBridge: CmlBridgeExports = CmlMobileBridge.install() as CmlBridgeExports;

/** Extract the canonical serialized stake credential from a base address using CML. */
export const stakeCredentialHexFromAddress = (address: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    stake_credential_hex_from_address: (address: string) => string;
  };
  return cmlBridge.stake_credential_hex_from_address(address);
};

export const rewardAddressDetailsFromAddress = (
  address: string,
): {bech32: string; keyHashHex: string} => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    reward_address_details_from_address: (
      address: string,
    ) => {bech32: string; keyHashHex: string};
  };
  return cmlBridge.reward_address_details_from_address(address);
};

export type EscrowDatumInfo = {
  paymentCredHash: string;
  stakingCredHash: string | null;
  nightPerThaw: string;
  nextThawTime: string;
  thawsRemaining: string;
  interval: string;
};

/** Decode the escrow datum using CML; all integer fields are decimal strings. */
export const escrowDatumInfoJson = (datumCborHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    escrow_datum_info_json: (datumCborHex: string) => string;
  };
  return cmlBridge.escrow_datum_info_json(datumCborHex);
};

/** Advance an escrow datum's thaw time and decrement its remaining count. */
export const updatedEscrowDatumCborHex = (datumCborHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    updated_escrow_datum_cbor_hex: (datumCborHex: string) => string;
  };
  return cmlBridge.updated_escrow_datum_cbor_hex(datumCborHex);
};

export type EscrowAddressArguments = {
  eligibleAddress: string;
  scriptHashHex: string;
  networkId: number;
};

/** Derive an escrow script address with CML, retaining base-address staking credentials. */
export const deriveEscrowAddress = (args: EscrowAddressArguments): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    derive_escrow_address: (argsJson: string) => string;
  };
  return cmlBridge.derive_escrow_address(JSON.stringify(args));
};

/** Normalize a Cardano pool identifier or key hash using CML. */
export const normalizePoolIdentifier = (
  poolIdOrHash: string,
): {id: string; hash: string} => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    normalize_pool_identifier: (poolIdOrHash: string) => string;
  };
  const [id, hash] = cmlBridge.normalize_pool_identifier(poolIdOrHash).split('\n');
  if (!id || !hash) throw new Error('Invalid CML pool identifier response');
  return {id, hash};
};

export type CnsAddressRecordResult = {
  paymentCredentialKind: 'key' | 'script';
  paymentCredentialHashHex: string;
  stakingCredentialHashHex: string | null;
  addressBech32: string;
};

/** Resolve a CNS Plutus address record into normalized credential data and a CML address. */
export const resolveCnsAddressRecord = (args: {
  plutusAddressJson: string;
  networkId: number;
}): CnsAddressRecordResult => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    resolve_cns_address_record: (argsJson: string) => string;
  };
  return JSON.parse(
    cmlBridge.resolve_cns_address_record(JSON.stringify(args)),
  ) as CnsAddressRecordResult;
};

/** Verify the Ed25519 signature over caller-supplied bytes (CIP-8 Sig_structure for signData). */
export const verifyEd25519Signature = (args: {
  publicKeyHex: string;
  messageHex: string;
  signatureHex: string;
}): boolean => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    verify_ed25519_signature: (argsJson: string) => string;
  };
  return cmlBridge.verify_ed25519_signature(JSON.stringify(args)) === 'true';
};

/** Derive the Cardano key hash from a raw Ed25519 public key. */
export const publicKeyHashHexFromRawHex = (publicKeyHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    public_key_hash_hex_from_raw_hex: (argsJson: string) => string;
  };
  return cmlBridge.public_key_hash_hex_from_raw_hex(JSON.stringify({publicKeyHex}));
};

export const signTransactionHex = (
  transactionHex: string,
  privateKeyHex: string,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    sign_transaction_hex: (
      transactionHex: string,
      privateKeyHex: string,
    ) => string;
  };
  return cmlBridge.sign_transaction_hex(transactionHex, privateKeyHex);
};

export type WalletTransactionSigningArguments = {
  transactionHex: string;
  masterKeyHex: string;
  purpose: string;
  coinType: string;
  accountIndex: string;
  stakingRole?: string;
  stakingIndex?: string;
};

/** Derive wallet signing keys and sign entirely inside the CML native bridge. */
export const signWalletTransactionHex = (
  args: WalletTransactionSigningArguments,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    sign_wallet_transaction_hex: (args: string) => string;
  };
  return cmlBridge.sign_wallet_transaction_hex(JSON.stringify(args));
};

/** Derive a Cardano BIP32 root key from BIP39 entropy inside the native CML bridge. */
export const walletRootKeyHexFromEntropy = (entropyHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    wallet_root_key_hex_from_entropy: (entropyHex: string) => string;
  };
  return cmlBridge.wallet_root_key_hex_from_entropy(entropyHex);
};

export type AccountPublicKeyDerivationArguments = {
  masterKeyHex: string;
  purpose: string;
  coinType: string;
  accountIndex: string;
};

/** Derive an account public key in CML without exporting derived private keys. */
export const deriveAccountPublicKeyHex = (
  args: AccountPublicKeyDerivationArguments,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    derive_account_public_key_hex: (args: string) => string;
  };
  return cmlBridge.derive_account_public_key_hex(JSON.stringify(args));
};

/** Derive a raw child public key from an account extended public key and soft path. */
export const derivePublicKeyFromAccountPathHex = (
  accountPublicKeyHex: string,
  path: number[],
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    derive_public_key_from_account_path_hex: (args: string) => string;
  };
  return cmlBridge.derive_public_key_from_account_path_hex(
    JSON.stringify({accountPublicKeyHex, path}),
  );
};

export const baseAddressBech32FromPublicKeyHashes = (
  paymentKeyHashHex: string,
  stakeKeyHashHex: string,
  networkId: number,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    base_address_bech32_from_public_key_hashes: (argsJson: string) => string;
  };
  return cmlBridge.base_address_bech32_from_public_key_hashes(
    JSON.stringify({paymentKeyHashHex, stakeKeyHashHex, networkId}),
  );
};

export const rewardAddressHexFromPublicKeyHash = (
  stakeKeyHashHex: string,
  networkId: number,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    reward_address_hex_from_public_key_hash: (argsJson: string) => string;
  };
  return cmlBridge.reward_address_hex_from_public_key_hash(
    JSON.stringify({stakeKeyHashHex, networkId}),
  );
};

export const icarusAddressBase58FromAccountPublicKeyHex = (
  accountPublicKeyHex: string,
  role: number,
  index: number,
  protocolMagic: number,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    icarus_address_base58_from_account_public_key_hex: (argsJson: string) => string;
  };
  return cmlBridge.icarus_address_base58_from_account_public_key_hex(
    JSON.stringify({accountPublicKeyHex, role, index, protocolMagic}),
  );
};

export type WalletPathSigningArguments = {
  transactionHex: string;
  masterKeyHex: string;
  signerPaths: number[][];
};

/** Derive each wallet signing key and sign a transaction entirely in CML. */
export const signWalletTransactionPathsHex = (
  args: WalletPathSigningArguments,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    sign_wallet_transaction_paths_hex: (args: string) => string;
  };
  return cmlBridge.sign_wallet_transaction_paths_hex(JSON.stringify(args));
};

export type WalletDataSigningArguments = {
  messageHex: string;
  masterKeyHex: string;
  signerPath: number[];
};

export const signWalletData = (
  args: WalletDataSigningArguments,
): {signatureHex: string; publicKeyHex: string} => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    sign_wallet_data: (args: string) => string;
  };
  return JSON.parse(cmlBridge.sign_wallet_data(JSON.stringify(args)));
};

export const deriveWalletPublicKeyHex = (
  args: Pick<WalletDataSigningArguments, 'masterKeyHex' | 'signerPath'>,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    derive_wallet_public_key_hex: (args: string) => string;
  };
  return cmlBridge.derive_wallet_public_key_hex(JSON.stringify(args));
};

/** Compute the Cardano transaction ID from the transaction body's CML hash. */
export const transactionIdHex = (transactionHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    transaction_id_hex: (transactionHex: string) => string;
  };
  return cmlBridge.transaction_id_hex(transactionHex);
};

/** Parse transaction fields required by CIP-30 preflight validation. */
export const transactionValidationInfoJson = (transactionHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    transaction_validation_info_json: (transactionHex: string) => string;
  };
  return cmlBridge.transaction_validation_info_json(transactionHex);
};

/** Parse a transaction into the CML-backed ReviewTx DTO (all quantities are strings). */
export const transactionReviewInfoJson = (transactionHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    transaction_review_info_json: (transactionHex: string) => string;
  };
  return cmlBridge.transaction_review_info_json(transactionHex);
};

/** Parse normalized body/witness fields used to determine required wallet signers. */
export const transactionSigningRequirementsJson = (transactionHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    transaction_signing_requirements_json: (transactionHex: string) => string;
  };
  return cmlBridge.transaction_signing_requirements_json(transactionHex);
};

/** Extract the serialized witness set from a signed transaction using CML. */
export const transactionWitnessSetHex = (transactionHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    transaction_witness_set_hex: (transactionHex: string) => string;
  };
  return cmlBridge.transaction_witness_set_hex(transactionHex);
};

/** Replace witnesses with an empty set while preserving transaction body and auxiliary data. */
export const emptyWitnessTransactionHex = (transactionHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    empty_witness_transaction_hex: (transactionHex: string) => string;
  };
  return cmlBridge.empty_witness_transaction_hex(transactionHex);
};

export type ValueAmountArguments = {
  coin: string;
  assets: CmlAssetQuantity[];
};

/** Decode CML Value CBOR into lossless decimal-string quantities. */
export const valueFromHexInfoJson = (valueCborHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    value_from_hex_info_json: (valueCborHex: string) => string;
  };
  return cmlBridge.value_from_hex_info_json(valueCborHex);
};

/** Encode decimal-string quantities as CML Value CBOR. */
export const valueFromAmountsHex = (args: ValueAmountArguments): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    value_from_amounts_hex: (argsJson: string) => string;
  };
  return cmlBridge.value_from_amounts_hex(JSON.stringify(args));
};

/** Return unique key hashes in native-script traversal order. */
export const nativeScriptRequiredKeyHashesJson = (scriptCborHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    native_script_required_key_hashes_json: (scriptCborHex: string) => string;
  };
  return cmlBridge.native_script_required_key_hashes_json(scriptCborHex);
};

/** Derive a raw Ed25519 public key from a 32-byte raw or 64-byte extended private key. */
export const publicKeyHexFromPrivateKeyHex = (privateKeyHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    public_key_hex_from_private_key_hex: (privateKeyHex: string) => string;
  };
  return cmlBridge.public_key_hex_from_private_key_hex(privateKeyHex);
};

/** Sign exact message bytes with a 32-byte raw or 64-byte extended Ed25519 private key. */
export const signEd25519MessageHex = (privateKeyHex: string, messageHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    sign_ed25519_message_hex: (privateKeyHex: string, messageHex: string) => string;
  };
  return cmlBridge.sign_ed25519_message_hex(privateKeyHex, messageHex);
};

export type ScriptHashType = 'native' | 'plutusV1' | 'plutusV2' | 'plutusV3';

/** Calculate a policy/script hash; Plutus language must be explicit for correct namespacing. */
export const scriptHashHexFromCbor = (
  scriptType: ScriptHashType,
  scriptCborHex: string,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    script_hash_hex_from_cbor: (argsJson: string) => string;
  };
  return cmlBridge.script_hash_hex_from_cbor(
    JSON.stringify({scriptType, scriptCborHex}),
  );
};

/** Generate the legacy-compatible Catalyst raw private-key bytes from BIP39 entropy/password hex. */
export const catalystPrivateKeyHexFromEntropy = (entropyHex: string, passwordHex = ''): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    catalyst_private_key_hex_from_entropy: (argsJson: string) => string;
  };
  return cmlBridge.catalyst_private_key_hex_from_entropy(
    JSON.stringify({entropyHex, passwordHex}),
  );
};

/** Add verified Ledger signatures to an unsigned transaction without changing its body. */
export const applyLedgerWitnessesToTransactionHex = (args: {
  transactionHex: string;
  accountPublicKeyHex: string;
  purpose: string;
  coinType: string;
  accountIndex: string;
  witnesses: Array<{path: number[]; signatureHex: string}>;
  expectedTxIdHex: string;
  plutusDataHexes?: string[];
  senderUtxos?: Array<{
    txHashHex: string;
    outputIndex: number;
    address: string;
    addressHex?: string;
    path: number[];
  }>;
}): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    apply_ledger_witnesses_to_transaction_hex: (argsJson: string) => string;
  };
  return cmlBridge.apply_ledger_witnesses_to_transaction_hex(JSON.stringify(args));
};

/** Return CML-decoded transaction fields, validated source paths, and change output paths for Ledger mapping. */
export const ledgerSigningRequestInfoJson = (args: {
  transactionHex: string;
  networkId: number;
  protocolMagic: number;
  senderUtxos: Array<{
    txHashHex: string;
    outputIndex: number;
    address: string;
    addressHex?: string;
    path: number[];
  }>;
  changeAddresses: Array<{address: string; addressHex?: string; path: number[]}>;
  stakingPath?: number[];
}): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    ledger_signing_request_info_json: (argsJson: string) => string;
  };
  return cmlBridge.ledger_signing_request_info_json(JSON.stringify(args));
};

export type SimplePaymentBuilderArguments = {
  inputs: Array<{
    transactionHashHex: string;
    index: string;
    address: string;
    addressHex?: string;
    isBootstrap?: boolean;
    lovelace: string;
    assets?: Array<{policyIdHex: string; assetNameHex: string; quantity: string}>;
    nativeScriptCborHex?: string;
    nativeScriptWitnessCount?: string;
  }>;
  outputs: Array<{
    address: string;
    lovelace: string;
    assets?: Array<{policyIdHex: string; assetNameHex: string; quantity: string}>;
    datum?: {kind: 'hash' | 'inline'; hex: string};
  }>;
  changeAddress: string;
  ttl?: string;
  manualFee?: string;
  manualChangeOutput?: {
    address: string;
    lovelace: string;
    assets: CmlAssetQuantity[];
    datum?: {kind: 'hash' | 'inline'; hex: string};
  };
  feeCoefficient: string;
  feeConstant: string;
  coinsPerUtxoByte: string;
  keyDeposit: string;
  poolDeposit: string;
  maxValueSize: string;
  metadata?: Array<{label: string; data: unknown}>;
  nativeMints?: Array<{
    policyIdHex: string;
    scriptCborHex: string;
    assets: Array<{assetNameHex: string; quantity: string}>;
  }>;
  certificates?: Array<{
    kind: 'StakeRegistration' | 'StakeDeregistration' | 'StakeDelegation' | 'VoteDelegation' | 'StakeAndVoteDelegation' | 'StakeRegistrationAndDelegation' | 'StakeVoteRegistrationAndDelegation' | 'VoteRegistrationAndDelegation';
    stakeCredentialKeyHashHex: string;
    poolKeyHash?: string;
    drep?: 'AlwaysAbstain' | 'AlwaysNoConfidence' | {KeyHash: string} | {ScriptHash: string};
  }>;
  withdrawals?: Array<{rewardAddress: string; amount: string}>;
  validityStart?: string;
  referenceInputs?: Array<{
    transactionHashHex: string;
    index: string;
    address: string;
    lovelace: string;
    assets?: Array<{policyIdHex: string; assetNameHex: string; quantity: string}>;
  }>;
};

export type CmlTransactionRecipeUtxo = {
  txHashHex: string;
  index: string;
  address: string;
  addressHex?: string;
  isBootstrap?: boolean;
  lovelace: string;
  assets: CmlAssetQuantity[];
  inlineDatumCborHex?: string;
  datumHashHex?: string;
  referenceScript?: {hash: string; type?: string; size?: number; bytes?: string};
  nativeScriptCborHex?: string;
  nativeScriptWitnessCount?: string;
};

export type CmlTransactionRecipeOutput = {
  address: string;
  lovelace: string;
  assets: CmlAssetQuantity[];
  datum?: {kind: 'hash' | 'inline'; hex: string};
};

export type CmlTransactionRecipeCertificate =
  | NonNullable<SimplePaymentBuilderArguments['certificates']>[number]
  | {kind: 'PoolRegistration'; poolParams: Record<string, unknown>}
  | {kind: 'PoolRetirement'; poolKeyHash: string; epoch: string}
  | {kind: 'MoveInstantaneousRewardsCert'; pot: 'reserves' | 'treasury'; rewards: Array<{credential: {kind: 'key' | 'script'; hashHex: string}; amount: string}>}
  | {kind: 'GenesisKeyDelegation'; genesisHashHex: string; genesisDelegateHashHex: string; vrfKeyHashHex: string}
  | {kind: 'CommitteeHotAuth'; coldCredential: {kind: 'key' | 'script'; hashHex: string}; hotCredential: {kind: 'key' | 'script'; hashHex: string}}
  | {kind: 'CommitteeColdResign'; coldCredential: {kind: 'key' | 'script'; hashHex: string}; anchor?: {url: string; dataHashHex: string}}
  | {kind: 'DRepRegistration' | 'DRepDeregistration' | 'DRepUpdate'; credential: {kind: 'key' | 'script'; hashHex: string}; deposit?: string; anchor?: {url: string; dataHashHex: string}};

export type CmlTransactionRecipeArguments = {
  protocolParams: {
    linearFee: {coefficient: string; constant: string};
    coinsPerUtxoByte: string;
    keyDeposit: string;
    poolDeposit: string;
    maxValueSize: string;
    maxTxSize?: string;
    collateralPercentage?: string;
    refScriptCoinsPerByte?: {numerator: string; denominator: string};
    refScriptTierStepBytes?: string;
    refScriptMultiplier?: string;
    exUnitPricesMemory?: {numerator: string; denominator: string};
    exUnitPricesSteps?: {numerator: string; denominator: string};
    plutusV1CostModel?: number[];
    plutusV2CostModel?: number[];
    plutusV3CostModel?: number[];
  };
  inputs: Array<CmlTransactionRecipeUtxo & {kind?: 'paymentKey' | 'nativeScript'}>;
  outputs: CmlTransactionRecipeOutput[];
  certificates: CmlTransactionRecipeCertificate[];
  withdrawals: Array<{rewardAddress: string; amount: string}>;
  referenceInputs: Array<Omit<CmlTransactionRecipeUtxo, 'inlineDatumCborHex' | 'datumHashHex' | 'nativeScriptCborHex' | 'nativeScriptWitnessCount'>>;
  scriptInputs: Array<{
    utxo: CmlTransactionRecipeUtxo;
    scriptHashHex?: string;
    plutusVersion: 'V1' | 'V2' | 'V3';
    inlineScriptCborHex?: string;
    redeemerCborHex: string;
    redeemerMem: string;
    redeemerSteps: string;
    datumSource: 'inline' | {kind: 'explicit'; cborHex: string};
    referenceScript?: {utxo: CmlTransactionRecipeUtxo; scriptCborHex: string; size: string};
  }>;
  collateralInputs: CmlTransactionRecipeUtxo[];
  collateralReturn?: CmlTransactionRecipeOutput;
  totalCollateral?: string;
  mints: Array<{
    policyIdHex: string;
    scriptType: 'native' | 'plutusV1' | 'plutusV2' | 'plutusV3';
    scriptCborHex: string;
    assets: Array<{assetNameHex: string; quantity: string}>;
    redeemerCborHex?: string;
    redeemerMem?: string;
    redeemerSteps?: string;
    referenceInput?: CmlTransactionRecipeUtxo;
  }>;
  metadata: Array<{label: string; data: unknown}>;
  options: {
    changeAddress?: string;
    ttl?: string;
    validityIntervalStart?: string;
    validityIntervalEnd?: string;
    manualFee?: string;
    manualChangeOutput?: CmlTransactionRecipeOutput;
  };
};

export type CmlAssetQuantity = {
  policyIdHex: string;
  assetNameHex: string;
  quantity: string;
};

export type EscrowCmlUtxo = {
  txHashHex: string;
  index: string;
  address: string;
  lovelace: string;
  assets: CmlAssetQuantity[];
  inlineDatumCborHex?: string;
  datumCborHex?: string;
};

export type EscrowCmlTransactionArguments = {
  scriptInput: EscrowCmlUtxo;
  additionalScriptInputs: Array<{
    scriptInput: EscrowCmlUtxo;
    scriptHashHex: string;
    plutusVersion?: 'V1' | 'V2' | 'V3';
    referenceScriptInput?: EscrowCmlUtxo;
    referenceScriptCborHex?: string;
    referenceScriptSize?: string;
    redeemerCborHex: string;
    redeemerMem: string;
    redeemerSteps: string;
  }>;
  referenceScriptInput: EscrowCmlUtxo;
  referenceInputs: EscrowCmlUtxo[];
  referenceScriptCborHex: string;
  referenceScriptSize: string;
  fundingInputs: EscrowCmlUtxo[];
  collateralInput: EscrowCmlUtxo;
  additionalCollateralInputs?: EscrowCmlUtxo[];
  collateralReturn?: {
    address: string;
    lovelace: string;
    assets: CmlAssetQuantity[];
  };
  outputs: Array<{
    address: string;
    lovelace: string;
    assets: CmlAssetQuantity[];
    datumCborHex?: string;
  }>;
  changeAddress: string;
  scriptHashHex: string;
  redeemerCborHex: string;
  redeemerMem: string;
  redeemerSteps: string;
  validityStart: string;
  ttl: string;
  feeCoefficient: string;
  feeConstant: string;
  coinsPerUtxoByte: string;
  keyDeposit: string;
  poolDeposit: string;
  maxValueSize: string;
  maxTxSize?: string;
  collateralPercentage?: string;
  refScriptCoinsPerByte: {numerator: string; denominator: string};
  refScriptTierStepBytes: string;
  refScriptMultiplier: string;
  exUnitPricesMemory: {numerator: string; denominator: string};
  exUnitPricesSteps: {numerator: string; denominator: string};
  plutusVersion?: 'V1' | 'V2' | 'V3';
  plutusV1CostModel?: number[];
  plutusV2CostModel?: number[];
  plutusV3CostModel: number[];
};

export const buildEscrowRedeemTransactionCml = (
  args: EscrowCmlTransactionArguments,
): {cborHex: string; fee: string} => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    build_escrow_redeem_transaction_hex: (args: string) => string;
  };
  const [cborHex, fee] = cmlBridge
    .build_escrow_redeem_transaction_hex(JSON.stringify(args))
    .split('|');
  if (!cborHex || !fee || !/^\d+$/.test(fee)) {
    throw new Error('CML escrow transaction builder returned an invalid result');
  }
  return {cborHex, fee};
};

const assertSafeMetadataNumbers = (value: unknown): void => {
  if (typeof value === 'number' && Number.isInteger(value) && !Number.isSafeInteger(value)) {
    throw new RangeError('Metadata integers must be safe JavaScript integers');
  }
  if (Array.isArray(value)) {
    value.forEach(assertSafeMetadataNumbers);
  } else if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(assertSafeMetadataNumbers);
  }
};

export const minimumCoinForAssets = (
  address: string,
  assets: CmlAssetQuantity[],
  coinsPerUtxoByte: string,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    minimum_coin_for_assets: (args: string) => string;
  };
  const packedAssets = assets
    .map(({policyIdHex, assetNameHex, quantity}) => [policyIdHex, assetNameHex, quantity].join('~'))
    .join('^') || '-';
  return cmlBridge.minimum_coin_for_assets([address, packedAssets, coinsPerUtxoByte].join('|'));
};

/** Build a transaction with CML using ADA and multiasset value bundles. */
export const buildSimplePaymentTransaction = (
  args: SimplePaymentBuilderArguments,
): {cborHex: string; fee: string} => {
  args.metadata?.forEach(({data}) => assertSafeMetadataNumbers(data));
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    build_simple_payment_transaction_hex: (args: string) => string;
  };
  const result = cmlBridge.build_simple_payment_transaction_hex(
    [
      args.inputs
        .map(({transactionHashHex, index, address, addressHex, isBootstrap, lovelace, assets, nativeScriptCborHex, nativeScriptWitnessCount}) =>
          [transactionHashHex, index, address, lovelace,
            (assets ?? [])
              .map(({policyIdHex, assetNameHex, quantity}) => [policyIdHex, assetNameHex, quantity].join('~')).join('^') || '-',
            nativeScriptCborHex ?? '-',
            nativeScriptWitnessCount ?? '-',
            ...(addressHex !== undefined || isBootstrap !== undefined
              ? [addressHex ?? '-', isBootstrap === undefined ? '-' : String(isBootstrap)]
              : []),
          ].join(','),
        )
        .join(';'),
      [...args.outputs, ...(args.manualChangeOutput ? [args.manualChangeOutput] : [])]
        .map(({address, lovelace, assets, datum}) => [
          address,
          lovelace,
          (assets ?? []).map(({policyIdHex, assetNameHex, quantity}) => [policyIdHex, assetNameHex, quantity].join('~')).join('^') || '-',
          datum ? `${datum.kind}~${datum.hex}` : '-',
        ].join(','))
        .join(';'),
      args.changeAddress,
      args.ttl ?? '-',
      args.feeCoefficient,
      args.feeConstant,
      args.coinsPerUtxoByte,
      args.keyDeposit,
      args.poolDeposit,
      args.maxValueSize,
      args.metadata ? encodeURIComponent(JSON.stringify(args.metadata)) : '-',
      args.nativeMints?.map(({policyIdHex, scriptCborHex, assets}) => [
        policyIdHex,
        'native',
        scriptCborHex,
        assets.map(({assetNameHex, quantity}) => [assetNameHex, quantity].join('~')).join('^'),
      ].join(',')).join(';') || '-',
      args.certificates?.length ? encodeURIComponent(JSON.stringify(args.certificates)) : '-',
      args.withdrawals?.length ? encodeURIComponent(JSON.stringify(args.withdrawals)) : '-',
      args.validityStart ?? '-',
      args.referenceInputs?.map(({transactionHashHex, index, address, lovelace, assets}) => [
        transactionHashHex,
        index,
        address,
        lovelace,
        (assets ?? []).map(({policyIdHex, assetNameHex, quantity}) =>
          [policyIdHex, assetNameHex, quantity].join('~'),
        ).join('^') || '-',
      ].join(',')).join(';') || '-',
      ...(args.manualFee !== undefined || args.manualChangeOutput !== undefined
        ? [args.manualFee ?? '-', String(Boolean(args.manualChangeOutput))]
        : []),
    ].join('|'),
  );
  const separator = result.lastIndexOf('|');
  if (separator < 0) throw new Error('Malformed CML payment transaction result');
  return {cborHex: result.slice(0, separator), fee: result.slice(separator + 1)};
};

/** Build a normalized decimal-string transaction recipe through the CML bridge. */
export const buildTransactionRecipeCml = (
  args: CmlTransactionRecipeArguments,
): {cborHex: string; fee: string} => {
  args.metadata.forEach(({data}) => assertSafeMetadataNumbers(data));
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    build_transaction_recipe_cml_hex: (argsJson: string) => string;
  };
  const result = cmlBridge.build_transaction_recipe_cml_hex(JSON.stringify(args));
  const separator = result.lastIndexOf('|');
  if (separator < 0) throw new Error('Malformed CML transaction recipe result');
  return {cborHex: result.slice(0, separator), fee: result.slice(separator + 1)};
};

/** Parse a bech32 or hex address and return its raw bytes as hex using CML. */
export const addressToHex = (address: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    address_to_hex: (address: string) => string;
  };
  return cmlBridge.address_to_hex(address);
};

/** Parse an address with CML and return normalized bytes, network ID and bech32 when available. */
export const addressInfoFromAddress = (
  address: string,
): {hex: string; networkId: number; bech32: string | null; isValid: true} => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    address_info_from_address: (address: string) => string;
  };
  return JSON.parse(cmlBridge.address_info_from_address(address));
};

/** Hash serialized Plutus datum CBOR with the CML native bridge. */
export const hashPlutusDataCborHex = (cborHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    hash_plutus_data_cbor_hex: (cborHex: string) => string;
  };
  return cmlBridge.hash_plutus_data_cbor_hex(cborHex);
};

/** Decode serialized Plutus data into the Yoroi display structure with CML. */
export const decodePlutusDataCborHex = (cborHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    decode_plutus_data_cbor_hex: (cborHex: string) => string;
  };
  return cmlBridge.decode_plutus_data_cbor_hex(cborHex);
};

/** Extract inline datum/hash information from transaction-output CBOR. */
export const datumInfoFromOutputCborHex = (outputCborHex: string): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    datum_info_from_output_cbor_hex: (outputCborHex: string) => string;
  };
  return cmlBridge.datum_info_from_output_cbor_hex(outputCborHex);
};

export type TransactionUnspentOutputArguments = {
  txHashHex: string;
  index: string;
  address: string;
  lovelace: string;
  assets: CmlAssetQuantity[];
};

/** Serialize a CIP-30 TransactionUnspentOutput using CML. */
export const transactionUnspentOutputHex = (
  args: TransactionUnspentOutputArguments,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    transaction_unspent_output_hex: (argsJson: string) => string;
  };
  return cmlBridge.transaction_unspent_output_hex(JSON.stringify(args));
};

/** Extract a reward address from a Cardano address using CML. */
export const rewardAddressFromAddress = (address: string, network: number): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    reward_address_from_address: (address: string, network: number) => string;
  };
  return cmlBridge.reward_address_from_address(address, network);
};

export const rewardAddressHexFromAccountPublicKey = (
  accountPublicKeyHex: string,
  network: number,
  role: number,
  index: number,
): string => {
  const cmlBridge = nativeCmlBridge as typeof bridgeTypes & {
    reward_address_hex_from_account_public_key: (
      accountPublicKeyHex: string,
      network: number,
      role: number,
      index: number,
    ) => string;
  };
  return cmlBridge.reward_address_hex_from_account_public_key(
    accountPublicKeyHex,
    network,
    role,
    index,
  );
};
