// Generated TypeScript type definitions for CSL JSI Native State Bridge
// This file provides type safety for the native bridge interface
// DO NOT EDIT - Generated automatically

export let AddressKind = /*#__PURE__*/function (AddressKind) {
  AddressKind[AddressKind["Base"] = 0] = "Base";
  AddressKind[AddressKind["Pointer"] = 1] = "Pointer";
  AddressKind[AddressKind["Enterprise"] = 2] = "Enterprise";
  AddressKind[AddressKind["Reward"] = 3] = "Reward";
  AddressKind[AddressKind["Byron"] = 4] = "Byron";
  AddressKind[AddressKind["Malformed"] = 5] = "Malformed";
  return AddressKind;
}({});
export let BlockEra = /*#__PURE__*/function (BlockEra) {
  BlockEra[BlockEra["Byron"] = 0] = "Byron";
  BlockEra[BlockEra["Shelley"] = 1] = "Shelley";
  BlockEra[BlockEra["Allegra"] = 2] = "Allegra";
  BlockEra[BlockEra["Mary"] = 3] = "Mary";
  BlockEra[BlockEra["Alonzo"] = 4] = "Alonzo";
  BlockEra[BlockEra["Babbage"] = 5] = "Babbage";
  BlockEra[BlockEra["Conway"] = 6] = "Conway";
  BlockEra[BlockEra["Unknown"] = 7] = "Unknown";
  return BlockEra;
}({});
export let ByronAddressType = /*#__PURE__*/function (ByronAddressType) {
  ByronAddressType[ByronAddressType["ATPubKey"] = 0] = "ATPubKey";
  ByronAddressType[ByronAddressType["ATScript"] = 1] = "ATScript";
  ByronAddressType[ByronAddressType["ATRedeem"] = 2] = "ATRedeem";
  return ByronAddressType;
}({});
export let CborContainerType = /*#__PURE__*/function (CborContainerType) {
  CborContainerType[CborContainerType["Array"] = 0] = "Array";
  CborContainerType[CborContainerType["Map"] = 1] = "Map";
  return CborContainerType;
}({});
export let CborSetType = /*#__PURE__*/function (CborSetType) {
  CborSetType[CborSetType["Tagged"] = 0] = "Tagged";
  CborSetType[CborSetType["Untagged"] = 1] = "Untagged";
  return CborSetType;
}({});
export let CertificateKind = /*#__PURE__*/function (CertificateKind) {
  CertificateKind[CertificateKind["StakeRegistration"] = 0] = "StakeRegistration";
  CertificateKind[CertificateKind["StakeDeregistration"] = 1] = "StakeDeregistration";
  CertificateKind[CertificateKind["StakeDelegation"] = 2] = "StakeDelegation";
  CertificateKind[CertificateKind["PoolRegistration"] = 3] = "PoolRegistration";
  CertificateKind[CertificateKind["PoolRetirement"] = 4] = "PoolRetirement";
  CertificateKind[CertificateKind["GenesisKeyDelegation"] = 5] = "GenesisKeyDelegation";
  CertificateKind[CertificateKind["MoveInstantaneousRewardsCert"] = 6] = "MoveInstantaneousRewardsCert";
  CertificateKind[CertificateKind["CommitteeHotAuth"] = 7] = "CommitteeHotAuth";
  CertificateKind[CertificateKind["CommitteeColdResign"] = 8] = "CommitteeColdResign";
  CertificateKind[CertificateKind["DRepDeregistration"] = 9] = "DRepDeregistration";
  CertificateKind[CertificateKind["DRepRegistration"] = 10] = "DRepRegistration";
  CertificateKind[CertificateKind["DRepUpdate"] = 11] = "DRepUpdate";
  CertificateKind[CertificateKind["StakeAndVoteDelegation"] = 12] = "StakeAndVoteDelegation";
  CertificateKind[CertificateKind["StakeRegistrationAndDelegation"] = 13] = "StakeRegistrationAndDelegation";
  CertificateKind[CertificateKind["StakeVoteRegistrationAndDelegation"] = 14] = "StakeVoteRegistrationAndDelegation";
  CertificateKind[CertificateKind["VoteDelegation"] = 15] = "VoteDelegation";
  CertificateKind[CertificateKind["VoteRegistrationAndDelegation"] = 16] = "VoteRegistrationAndDelegation";
  return CertificateKind;
}({});
export let CoinSelectionStrategyCIP2 = /*#__PURE__*/function (CoinSelectionStrategyCIP2) {
  CoinSelectionStrategyCIP2[CoinSelectionStrategyCIP2["LargestFirst"] = 0] = "LargestFirst";
  CoinSelectionStrategyCIP2[CoinSelectionStrategyCIP2["RandomImprove"] = 1] = "RandomImprove";
  CoinSelectionStrategyCIP2[CoinSelectionStrategyCIP2["LargestFirstMultiAsset"] = 2] = "LargestFirstMultiAsset";
  CoinSelectionStrategyCIP2[CoinSelectionStrategyCIP2["RandomImproveMultiAsset"] = 3] = "RandomImproveMultiAsset";
  return CoinSelectionStrategyCIP2;
}({});
export let CredKind = /*#__PURE__*/function (CredKind) {
  CredKind[CredKind["Key"] = 0] = "Key";
  CredKind[CredKind["Script"] = 1] = "Script";
  return CredKind;
}({});
export let DRepKind = /*#__PURE__*/function (DRepKind) {
  DRepKind[DRepKind["KeyHash"] = 0] = "KeyHash";
  DRepKind[DRepKind["ScriptHash"] = 1] = "ScriptHash";
  DRepKind[DRepKind["AlwaysAbstain"] = 2] = "AlwaysAbstain";
  DRepKind[DRepKind["AlwaysNoConfidence"] = 3] = "AlwaysNoConfidence";
  return DRepKind;
}({});
export let GovernanceActionKind = /*#__PURE__*/function (GovernanceActionKind) {
  GovernanceActionKind[GovernanceActionKind["ParameterChangeAction"] = 0] = "ParameterChangeAction";
  GovernanceActionKind[GovernanceActionKind["HardForkInitiationAction"] = 1] = "HardForkInitiationAction";
  GovernanceActionKind[GovernanceActionKind["TreasuryWithdrawalsAction"] = 2] = "TreasuryWithdrawalsAction";
  GovernanceActionKind[GovernanceActionKind["NoConfidenceAction"] = 3] = "NoConfidenceAction";
  GovernanceActionKind[GovernanceActionKind["UpdateCommitteeAction"] = 4] = "UpdateCommitteeAction";
  GovernanceActionKind[GovernanceActionKind["NewConstitutionAction"] = 5] = "NewConstitutionAction";
  GovernanceActionKind[GovernanceActionKind["InfoAction"] = 6] = "InfoAction";
  return GovernanceActionKind;
}({});
export let LanguageKind = /*#__PURE__*/function (LanguageKind) {
  LanguageKind[LanguageKind["PlutusV1"] = 0] = "PlutusV1";
  LanguageKind[LanguageKind["PlutusV2"] = 1] = "PlutusV2";
  LanguageKind[LanguageKind["PlutusV3"] = 2] = "PlutusV3";
  return LanguageKind;
}({});
export let MIRKind = /*#__PURE__*/function (MIRKind) {
  MIRKind[MIRKind["ToOtherPot"] = 0] = "ToOtherPot";
  MIRKind[MIRKind["ToStakeCredentials"] = 1] = "ToStakeCredentials";
  return MIRKind;
}({});
export let MIRPot = /*#__PURE__*/function (MIRPot) {
  MIRPot[MIRPot["Reserves"] = 0] = "Reserves";
  MIRPot[MIRPot["Treasury"] = 1] = "Treasury";
  return MIRPot;
}({});
export let MetadataJsonSchema = /*#__PURE__*/function (MetadataJsonSchema) {
  MetadataJsonSchema[MetadataJsonSchema["NoConversions"] = 0] = "NoConversions";
  MetadataJsonSchema[MetadataJsonSchema["BasicConversions"] = 1] = "BasicConversions";
  MetadataJsonSchema[MetadataJsonSchema["DetailedSchema"] = 2] = "DetailedSchema";
  return MetadataJsonSchema;
}({});
export let NativeScriptKind = /*#__PURE__*/function (NativeScriptKind) {
  NativeScriptKind[NativeScriptKind["ScriptPubkey"] = 0] = "ScriptPubkey";
  NativeScriptKind[NativeScriptKind["ScriptAll"] = 1] = "ScriptAll";
  NativeScriptKind[NativeScriptKind["ScriptAny"] = 2] = "ScriptAny";
  NativeScriptKind[NativeScriptKind["ScriptNOfK"] = 3] = "ScriptNOfK";
  NativeScriptKind[NativeScriptKind["TimelockStart"] = 4] = "TimelockStart";
  NativeScriptKind[NativeScriptKind["TimelockExpiry"] = 5] = "TimelockExpiry";
  return NativeScriptKind;
}({});
export let NetworkIdKind = /*#__PURE__*/function (NetworkIdKind) {
  NetworkIdKind[NetworkIdKind["Testnet"] = 0] = "Testnet";
  NetworkIdKind[NetworkIdKind["Mainnet"] = 1] = "Mainnet";
  return NetworkIdKind;
}({});
export let PlutusDataKind = /*#__PURE__*/function (PlutusDataKind) {
  PlutusDataKind[PlutusDataKind["ConstrPlutusData"] = 0] = "ConstrPlutusData";
  PlutusDataKind[PlutusDataKind["Map"] = 1] = "Map";
  PlutusDataKind[PlutusDataKind["List"] = 2] = "List";
  PlutusDataKind[PlutusDataKind["Integer"] = 3] = "Integer";
  PlutusDataKind[PlutusDataKind["Bytes"] = 4] = "Bytes";
  return PlutusDataKind;
}({});
export let PlutusDatumSchema = /*#__PURE__*/function (PlutusDatumSchema) {
  PlutusDatumSchema[PlutusDatumSchema["BasicConversions"] = 0] = "BasicConversions";
  PlutusDatumSchema[PlutusDatumSchema["DetailedSchema"] = 1] = "DetailedSchema";
  return PlutusDatumSchema;
}({});
export let RedeemerTagKind = /*#__PURE__*/function (RedeemerTagKind) {
  RedeemerTagKind[RedeemerTagKind["Spend"] = 0] = "Spend";
  RedeemerTagKind[RedeemerTagKind["Mint"] = 1] = "Mint";
  RedeemerTagKind[RedeemerTagKind["Cert"] = 2] = "Cert";
  RedeemerTagKind[RedeemerTagKind["Reward"] = 3] = "Reward";
  RedeemerTagKind[RedeemerTagKind["Vote"] = 4] = "Vote";
  RedeemerTagKind[RedeemerTagKind["VotingProposal"] = 5] = "VotingProposal";
  return RedeemerTagKind;
}({});
export let RelayKind = /*#__PURE__*/function (RelayKind) {
  RelayKind[RelayKind["SingleHostAddr"] = 0] = "SingleHostAddr";
  RelayKind[RelayKind["SingleHostName"] = 1] = "SingleHostName";
  RelayKind[RelayKind["MultiHostName"] = 2] = "MultiHostName";
  return RelayKind;
}({});
export let ScriptHashNamespace = /*#__PURE__*/function (ScriptHashNamespace) {
  ScriptHashNamespace[ScriptHashNamespace["NativeScript"] = 0] = "NativeScript";
  ScriptHashNamespace[ScriptHashNamespace["PlutusScript"] = 1] = "PlutusScript";
  ScriptHashNamespace[ScriptHashNamespace["PlutusScriptV2"] = 2] = "PlutusScriptV2";
  ScriptHashNamespace[ScriptHashNamespace["PlutusScriptV3"] = 3] = "PlutusScriptV3";
  return ScriptHashNamespace;
}({});
export let ScriptSchema = /*#__PURE__*/function (ScriptSchema) {
  ScriptSchema[ScriptSchema["Wallet"] = 0] = "Wallet";
  ScriptSchema[ScriptSchema["Node"] = 1] = "Node";
  return ScriptSchema;
}({});
export let TransactionMetadatumKind = /*#__PURE__*/function (TransactionMetadatumKind) {
  TransactionMetadatumKind[TransactionMetadatumKind["MetadataMap"] = 0] = "MetadataMap";
  TransactionMetadatumKind[TransactionMetadatumKind["MetadataList"] = 1] = "MetadataList";
  TransactionMetadatumKind[TransactionMetadatumKind["Int"] = 2] = "Int";
  TransactionMetadatumKind[TransactionMetadatumKind["Bytes"] = 3] = "Bytes";
  TransactionMetadatumKind[TransactionMetadatumKind["Text"] = 4] = "Text";
  return TransactionMetadatumKind;
}({});
export let TransactionSetsState = /*#__PURE__*/function (TransactionSetsState) {
  TransactionSetsState[TransactionSetsState["AllSetsHaveTag"] = 0] = "AllSetsHaveTag";
  TransactionSetsState[TransactionSetsState["AllSetsHaveNoTag"] = 1] = "AllSetsHaveNoTag";
  TransactionSetsState[TransactionSetsState["MixedSets"] = 2] = "MixedSets";
  return TransactionSetsState;
}({});
export let VoteKind = /*#__PURE__*/function (VoteKind) {
  VoteKind[VoteKind["No"] = 0] = "No";
  VoteKind[VoteKind["Yes"] = 1] = "Yes";
  VoteKind[VoteKind["Abstain"] = 2] = "Abstain";
  return VoteKind;
}({});
export let VoterKind = /*#__PURE__*/function (VoterKind) {
  VoterKind[VoterKind["ConstitutionalCommitteeHotKeyHash"] = 0] = "ConstitutionalCommitteeHotKeyHash";
  VoterKind[VoterKind["ConstitutionalCommitteeHotScriptHash"] = 1] = "ConstitutionalCommitteeHotScriptHash";
  VoterKind[VoterKind["DRepKeyHash"] = 2] = "DRepKeyHash";
  VoterKind[VoterKind["DRepScriptHash"] = 3] = "DRepScriptHash";
  VoterKind[VoterKind["StakingPoolKeyHash"] = 4] = "StakingPoolKeyHash";
  return VoterKind;
}({});

// Standalone functions
//# sourceMappingURL=BridgeTypes.js.map