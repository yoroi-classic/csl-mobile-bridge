// Generated TypeScript index file for CSL JSI Native State Bridge
// This file provides a convenient entry point for the bridge
// DO NOT EDIT - Generated automatically

import CslMobileBridge from './NativeCslMobileBridge';
import * as bridgeTypes from './BridgeTypes';
export { AddressKind, BlockEra, ByronAddressType, CborContainerType, CborSetType, CertificateKind, CoinSelectionStrategyCIP2, CredKind, DRepKind, GovernanceActionKind, LanguageKind, MIRKind, MIRPot, MetadataJsonSchema, NativeScriptKind, NetworkIdKind, PlutusDataKind, PlutusDatumSchema, RedeemerTagKind, RelayKind, ScriptHashNamespace, ScriptSchema, TransactionMetadatumKind, TransactionSetsState, VoteKind, VoterKind } from './BridgeTypes';

let _cslBridge: typeof bridgeTypes | null = null;

const getCslBridge = (): typeof bridgeTypes => {
  if (_cslBridge === null) {
    _cslBridge = CslMobileBridge.install() as typeof bridgeTypes;
  }
  return _cslBridge;
};

const cslBridge: typeof bridgeTypes = getCslBridge();

export default cslBridge;

// Type aliases for class types
export type Address = bridgeTypes.Address;
export type Anchor = bridgeTypes.Anchor;
export type AnchorDataHash = bridgeTypes.AnchorDataHash;
export type AssetName = bridgeTypes.AssetName;
export type AssetNames = bridgeTypes.AssetNames;
export type Assets = bridgeTypes.Assets;
export type AuxiliaryData = bridgeTypes.AuxiliaryData;
export type AuxiliaryDataHash = bridgeTypes.AuxiliaryDataHash;
export type AuxiliaryDataSet = bridgeTypes.AuxiliaryDataSet;
export type BaseAddress = bridgeTypes.BaseAddress;
export type BigInt = bridgeTypes.BigInt;
export type BigNum = bridgeTypes.BigNum;
export type Bip32PrivateKey = bridgeTypes.Bip32PrivateKey;
export type Bip32PublicKey = bridgeTypes.Bip32PublicKey;
export type Block = bridgeTypes.Block;
export type BlockHash = bridgeTypes.BlockHash;
export type BootstrapWitness = bridgeTypes.BootstrapWitness;
export type BootstrapWitnesses = bridgeTypes.BootstrapWitnesses;
export type ByronAddress = bridgeTypes.ByronAddress;
export type Certificate = bridgeTypes.Certificate;
export type Certificates = bridgeTypes.Certificates;
export type CertificatesBuilder = bridgeTypes.CertificatesBuilder;
export type ChangeConfig = bridgeTypes.ChangeConfig;
export type Committee = bridgeTypes.Committee;
export type CommitteeColdResign = bridgeTypes.CommitteeColdResign;
export type CommitteeHotAuth = bridgeTypes.CommitteeHotAuth;
export type Constitution = bridgeTypes.Constitution;
export type ConstrPlutusData = bridgeTypes.ConstrPlutusData;
export type CostModel = bridgeTypes.CostModel;
export type Costmdls = bridgeTypes.Costmdls;
export type Credential = bridgeTypes.Credential;
export type Credentials = bridgeTypes.Credentials;
export type DNSRecordAorAAAA = bridgeTypes.DNSRecordAorAAAA;
export type DNSRecordSRV = bridgeTypes.DNSRecordSRV;
export type DRep = bridgeTypes.DRep;
export type DRepDeregistration = bridgeTypes.DRepDeregistration;
export type DRepRegistration = bridgeTypes.DRepRegistration;
export type DRepUpdate = bridgeTypes.DRepUpdate;
export type DRepVotingThresholds = bridgeTypes.DRepVotingThresholds;
export type DataCost = bridgeTypes.DataCost;
export type DataHash = bridgeTypes.DataHash;
export type DatumSource = bridgeTypes.DatumSource;
export type Ed25519KeyHash = bridgeTypes.Ed25519KeyHash;
export type Ed25519KeyHashes = bridgeTypes.Ed25519KeyHashes;
export type Ed25519Signature = bridgeTypes.Ed25519Signature;
export type EnterpriseAddress = bridgeTypes.EnterpriseAddress;
export type ExUnitPrices = bridgeTypes.ExUnitPrices;
export type ExUnits = bridgeTypes.ExUnits;
export type FixedBlock = bridgeTypes.FixedBlock;
export type FixedTransaction = bridgeTypes.FixedTransaction;
export type FixedTransactionBodies = bridgeTypes.FixedTransactionBodies;
export type FixedTransactionBody = bridgeTypes.FixedTransactionBody;
export type FixedTxWitnessesSet = bridgeTypes.FixedTxWitnessesSet;
export type FixedVersionedBlock = bridgeTypes.FixedVersionedBlock;
export type GeneralTransactionMetadata = bridgeTypes.GeneralTransactionMetadata;
export type GenesisDelegateHash = bridgeTypes.GenesisDelegateHash;
export type GenesisHash = bridgeTypes.GenesisHash;
export type GenesisHashes = bridgeTypes.GenesisHashes;
export type GenesisKeyDelegation = bridgeTypes.GenesisKeyDelegation;
export type GovernanceAction = bridgeTypes.GovernanceAction;
export type GovernanceActionId = bridgeTypes.GovernanceActionId;
export type GovernanceActionIds = bridgeTypes.GovernanceActionIds;
export type HardForkInitiationAction = bridgeTypes.HardForkInitiationAction;
export type Header = bridgeTypes.Header;
export type HeaderBody = bridgeTypes.HeaderBody;
export type InfoAction = bridgeTypes.InfoAction;
export type Int = bridgeTypes.Int;
export type Ipv4 = bridgeTypes.Ipv4;
export type Ipv6 = bridgeTypes.Ipv6;
export type KESSignature = bridgeTypes.KESSignature;
export type KESVKey = bridgeTypes.KESVKey;
export type Language = bridgeTypes.Language;
export type Languages = bridgeTypes.Languages;
export type LegacyDaedalusPrivateKey = bridgeTypes.LegacyDaedalusPrivateKey;
export type LinearFee = bridgeTypes.LinearFee;
export type MIRToStakeCredentials = bridgeTypes.MIRToStakeCredentials;
export type MalformedAddress = bridgeTypes.MalformedAddress;
export type MetadataList = bridgeTypes.MetadataList;
export type MetadataMap = bridgeTypes.MetadataMap;
export type Mint = bridgeTypes.Mint;
export type MintAssets = bridgeTypes.MintAssets;
export type MintBuilder = bridgeTypes.MintBuilder;
export type MintWitness = bridgeTypes.MintWitness;
export type MintsAssets = bridgeTypes.MintsAssets;
export type MoveInstantaneousReward = bridgeTypes.MoveInstantaneousReward;
export type MoveInstantaneousRewardsCert = bridgeTypes.MoveInstantaneousRewardsCert;
export type MultiAsset = bridgeTypes.MultiAsset;
export type MultiHostName = bridgeTypes.MultiHostName;
export type NativeScript = bridgeTypes.NativeScript;
export type NativeScriptSource = bridgeTypes.NativeScriptSource;
export type NativeScripts = bridgeTypes.NativeScripts;
export type NetworkId = bridgeTypes.NetworkId;
export type NetworkInfo = bridgeTypes.NetworkInfo;
export type NewConstitutionAction = bridgeTypes.NewConstitutionAction;
export type NoConfidenceAction = bridgeTypes.NoConfidenceAction;
export type Nonce = bridgeTypes.Nonce;
export type OperationalCert = bridgeTypes.OperationalCert;
export type OutputDatum = bridgeTypes.OutputDatum;
export type ParameterChangeAction = bridgeTypes.ParameterChangeAction;
export type PlutusData = bridgeTypes.PlutusData;
export type PlutusList = bridgeTypes.PlutusList;
export type PlutusMap = bridgeTypes.PlutusMap;
export type PlutusMapValues = bridgeTypes.PlutusMapValues;
export type PlutusScript = bridgeTypes.PlutusScript;
export type PlutusScriptSource = bridgeTypes.PlutusScriptSource;
export type PlutusScripts = bridgeTypes.PlutusScripts;
export type PlutusWitness = bridgeTypes.PlutusWitness;
export type PlutusWitnesses = bridgeTypes.PlutusWitnesses;
export type Pointer = bridgeTypes.Pointer;
export type PointerAddress = bridgeTypes.PointerAddress;
export type PoolMetadata = bridgeTypes.PoolMetadata;
export type PoolMetadataHash = bridgeTypes.PoolMetadataHash;
export type PoolParams = bridgeTypes.PoolParams;
export type PoolRegistration = bridgeTypes.PoolRegistration;
export type PoolRetirement = bridgeTypes.PoolRetirement;
export type PoolVotingThresholds = bridgeTypes.PoolVotingThresholds;
export type PrivateKey = bridgeTypes.PrivateKey;
export type ProposedProtocolParameterUpdates = bridgeTypes.ProposedProtocolParameterUpdates;
export type ProtocolParamUpdate = bridgeTypes.ProtocolParamUpdate;
export type ProtocolVersion = bridgeTypes.ProtocolVersion;
export type PublicKey = bridgeTypes.PublicKey;
export type PublicKeys = bridgeTypes.PublicKeys;
export type Redeemer = bridgeTypes.Redeemer;
export type RedeemerTag = bridgeTypes.RedeemerTag;
export type Redeemers = bridgeTypes.Redeemers;
export type Relay = bridgeTypes.Relay;
export type Relays = bridgeTypes.Relays;
export type RewardAddress = bridgeTypes.RewardAddress;
export type RewardAddresses = bridgeTypes.RewardAddresses;
export type ScriptAll = bridgeTypes.ScriptAll;
export type ScriptAny = bridgeTypes.ScriptAny;
export type ScriptDataHash = bridgeTypes.ScriptDataHash;
export type ScriptHash = bridgeTypes.ScriptHash;
export type ScriptHashes = bridgeTypes.ScriptHashes;
export type ScriptNOfK = bridgeTypes.ScriptNOfK;
export type ScriptPubkey = bridgeTypes.ScriptPubkey;
export type ScriptRef = bridgeTypes.ScriptRef;
export type SingleHostAddr = bridgeTypes.SingleHostAddr;
export type SingleHostName = bridgeTypes.SingleHostName;
export type StakeAndVoteDelegation = bridgeTypes.StakeAndVoteDelegation;
export type StakeDelegation = bridgeTypes.StakeDelegation;
export type StakeDeregistration = bridgeTypes.StakeDeregistration;
export type StakeRegistration = bridgeTypes.StakeRegistration;
export type StakeRegistrationAndDelegation = bridgeTypes.StakeRegistrationAndDelegation;
export type StakeVoteRegistrationAndDelegation = bridgeTypes.StakeVoteRegistrationAndDelegation;
export type Strings = bridgeTypes.Strings;
export type TimelockExpiry = bridgeTypes.TimelockExpiry;
export type TimelockStart = bridgeTypes.TimelockStart;
export type Transaction = bridgeTypes.Transaction;
export type TransactionBatch = bridgeTypes.TransactionBatch;
export type TransactionBatchList = bridgeTypes.TransactionBatchList;
export type TransactionBodies = bridgeTypes.TransactionBodies;
export type TransactionBody = bridgeTypes.TransactionBody;
export type TransactionBuilder = bridgeTypes.TransactionBuilder;
export type TransactionBuilderConfig = bridgeTypes.TransactionBuilderConfig;
export type TransactionBuilderConfigBuilder = bridgeTypes.TransactionBuilderConfigBuilder;
export type TransactionHash = bridgeTypes.TransactionHash;
export type TransactionInput = bridgeTypes.TransactionInput;
export type TransactionInputs = bridgeTypes.TransactionInputs;
export type TransactionMetadatum = bridgeTypes.TransactionMetadatum;
export type TransactionMetadatumLabels = bridgeTypes.TransactionMetadatumLabels;
export type TransactionOutput = bridgeTypes.TransactionOutput;
export type TransactionOutputAmountBuilder = bridgeTypes.TransactionOutputAmountBuilder;
export type TransactionOutputBuilder = bridgeTypes.TransactionOutputBuilder;
export type TransactionOutputs = bridgeTypes.TransactionOutputs;
export type TransactionUnspentOutput = bridgeTypes.TransactionUnspentOutput;
export type TransactionUnspentOutputs = bridgeTypes.TransactionUnspentOutputs;
export type TransactionWitnessSet = bridgeTypes.TransactionWitnessSet;
export type TransactionWitnessSets = bridgeTypes.TransactionWitnessSets;
export type TreasuryWithdrawals = bridgeTypes.TreasuryWithdrawals;
export type TreasuryWithdrawalsAction = bridgeTypes.TreasuryWithdrawalsAction;
export type TxInputsBuilder = bridgeTypes.TxInputsBuilder;
export type URL = bridgeTypes.URL;
export type UnitInterval = bridgeTypes.UnitInterval;
export type Update = bridgeTypes.Update;
export type UpdateCommitteeAction = bridgeTypes.UpdateCommitteeAction;
export type VRFCert = bridgeTypes.VRFCert;
export type VRFKeyHash = bridgeTypes.VRFKeyHash;
export type VRFVKey = bridgeTypes.VRFVKey;
export type Value = bridgeTypes.Value;
export type VersionedBlock = bridgeTypes.VersionedBlock;
export type Vkey = bridgeTypes.Vkey;
export type Vkeys = bridgeTypes.Vkeys;
export type Vkeywitness = bridgeTypes.Vkeywitness;
export type Vkeywitnesses = bridgeTypes.Vkeywitnesses;
export type VoteDelegation = bridgeTypes.VoteDelegation;
export type VoteRegistrationAndDelegation = bridgeTypes.VoteRegistrationAndDelegation;
export type Voter = bridgeTypes.Voter;
export type Voters = bridgeTypes.Voters;
export type VotingBuilder = bridgeTypes.VotingBuilder;
export type VotingProcedure = bridgeTypes.VotingProcedure;
export type VotingProcedures = bridgeTypes.VotingProcedures;
export type VotingProposal = bridgeTypes.VotingProposal;
export type VotingProposalBuilder = bridgeTypes.VotingProposalBuilder;
export type VotingProposals = bridgeTypes.VotingProposals;
export type Withdrawals = bridgeTypes.Withdrawals;
export type WithdrawalsBuilder = bridgeTypes.WithdrawalsBuilder;

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