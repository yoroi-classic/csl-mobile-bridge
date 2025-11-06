// Generated TypeScript type definitions for CSL JSI Native State Bridge
// This file provides type safety for the native bridge interface
// DO NOT EDIT - Generated automatically

export declare class Address {
  static from_bytes(data: Uint8Array): Address;
  to_json(): string;
  static from_json(json: string): Address;
  kind(): number;
  payment_cred(): Credential;
  is_malformed(): boolean;
  to_hex(): string;
  static from_hex(hex_str: string): Address;
  to_bytes(): Uint8Array;
  to_bech32(prefix?: string): string;
  static from_bech32(bech_str: string): Address;
  network_id(): number;
}

export declare class Anchor {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Anchor;
  to_hex(): string;
  static from_hex(hex_str: string): Anchor;
  to_json(): string;
  static from_json(json: string): Anchor;
  url(): URL;
  anchor_data_hash(): AnchorDataHash;
  static new(anchor_url: URL, anchor_data_hash: AnchorDataHash): Anchor;
}

export declare class AnchorDataHash {
  static from_bytes(bytes: Uint8Array): AnchorDataHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): AnchorDataHash;
  to_hex(): string;
  static from_hex(hex: string): AnchorDataHash;
}

export declare class AssetName {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): AssetName;
  to_hex(): string;
  static from_hex(hex_str: string): AssetName;
  to_json(): string;
  static from_json(json: string): AssetName;
  static new(name: Uint8Array): AssetName;
  name(): Uint8Array;
}

export declare class AssetNames {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): AssetNames;
  to_hex(): string;
  static from_hex(hex_str: string): AssetNames;
  to_json(): string;
  static from_json(json: string): AssetNames;
  static new(): AssetNames;
  len(): number;
  get(index: number): AssetName;
  add(elem: AssetName): void;
}

export declare class Assets {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Assets;
  to_hex(): string;
  static from_hex(hex_str: string): Assets;
  to_json(): string;
  static from_json(json: string): Assets;
  static new(): Assets;
  len(): number;
  insert(key: AssetName, value: BigNum): BigNum;
  get(key: AssetName): BigNum;
  keys(): AssetNames;
}

export declare class AuxiliaryData {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): AuxiliaryData;
  to_hex(): string;
  static from_hex(hex_str: string): AuxiliaryData;
  to_json(): string;
  static from_json(json: string): AuxiliaryData;
  static new(): AuxiliaryData;
  metadata(): GeneralTransactionMetadata;
  set_metadata(metadata: GeneralTransactionMetadata): void;
  native_scripts(): NativeScripts;
  set_native_scripts(native_scripts: NativeScripts): void;
  plutus_scripts(): PlutusScripts;
  set_plutus_scripts(plutus_scripts: PlutusScripts): void;
  prefer_alonzo_format(): boolean;
  set_prefer_alonzo_format(prefer: boolean): void;
}

export declare class AuxiliaryDataHash {
  static from_bytes(bytes: Uint8Array): AuxiliaryDataHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): AuxiliaryDataHash;
  to_hex(): string;
  static from_hex(hex: string): AuxiliaryDataHash;
}

export declare class AuxiliaryDataSet {
  static new(): AuxiliaryDataSet;
  len(): number;
  insert(tx_index: number, data: AuxiliaryData): AuxiliaryData;
  get(tx_index: number): AuxiliaryData;
  indices(): string;
}

export declare class BaseAddress {
  static new(network: number, payment: Credential, stake: Credential): BaseAddress;
  payment_cred(): Credential;
  stake_cred(): Credential;
  to_address(): Address;
  static from_address(addr: Address): BaseAddress;
  network_id(): number;
}

export declare class BigInt {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): BigInt;
  to_hex(): string;
  static from_hex(hex_str: string): BigInt;
  to_json(): string;
  static from_json(json: string): BigInt;
  is_zero(): boolean;
  as_u64(): BigNum;
  as_int(): number;
  static from_str(text: string): BigInt;
  to_str(): string;
  add(other: BigInt): BigInt;
  sub(other: BigInt): BigInt;
  mul(other: BigInt): BigInt;
  pow(exp: number): BigInt;
  static one(): BigInt;
  static zero(): BigInt;
  abs(): BigInt;
  increment(): BigInt;
  div_ceil(other: BigInt): BigInt;
  div_floor(other: BigInt): BigInt;
}

export declare class BigNum {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): BigNum;
  to_hex(): string;
  static from_hex(hex_str: string): BigNum;
  to_json(): string;
  static from_json(json: string): BigNum;
  static from_str(string: string): BigNum;
  to_str(): string;
  static zero(): BigNum;
  static one(): BigNum;
  is_zero(): boolean;
  div_floor(other: BigNum): BigNum;
  checked_mul(other: BigNum): BigNum;
  checked_add(other: BigNum): BigNum;
  checked_sub(other: BigNum): BigNum;
  clamped_sub(other: BigNum): BigNum;
  compare(rhs_value: BigNum): number;
  less_than(rhs_value: BigNum): boolean;
  static max_value(): BigNum;
  static max(a: BigNum, b: BigNum): BigNum;
}

export declare class Bip32PrivateKey {
  derive(index: number): Bip32PrivateKey;
  static from_128_xprv(bytes: Uint8Array): Bip32PrivateKey;
  to_128_xprv(): Uint8Array;
  static generate_ed25519_bip32(): Bip32PrivateKey;
  to_raw_key(): PrivateKey;
  to_public(): Bip32PublicKey;
  static from_bytes(bytes: Uint8Array): Bip32PrivateKey;
  as_bytes(): Uint8Array;
  static from_bech32(bech32_str: string): Bip32PrivateKey;
  to_bech32(): string;
  static from_bip39_entropy(entropy: Uint8Array, password: Uint8Array): Bip32PrivateKey;
  chaincode(): Uint8Array;
  to_hex(): string;
  static from_hex(hex_str: string): Bip32PrivateKey;
}

export declare class Bip32PublicKey {
  derive(index: number): Bip32PublicKey;
  to_raw_key(): PublicKey;
  static from_bytes(bytes: Uint8Array): Bip32PublicKey;
  as_bytes(): Uint8Array;
  static from_bech32(bech32_str: string): Bip32PublicKey;
  to_bech32(): string;
  chaincode(): Uint8Array;
  to_hex(): string;
  static from_hex(hex_str: string): Bip32PublicKey;
}

export declare class Block {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Block;
  to_hex(): string;
  static from_hex(hex_str: string): Block;
  to_json(): string;
  static from_json(json: string): Block;
  header(): Header;
  transaction_bodies(): TransactionBodies;
  transaction_witness_sets(): TransactionWitnessSets;
  auxiliary_data_set(): AuxiliaryDataSet;
  invalid_transactions(): string;
  static new(header: Header, transaction_bodies: TransactionBodies, transaction_witness_sets: TransactionWitnessSets, auxiliary_data_set: AuxiliaryDataSet, invalid_transactions: string): Block;
}

export declare class BlockHash {
  static from_bytes(bytes: Uint8Array): BlockHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): BlockHash;
  to_hex(): string;
  static from_hex(hex: string): BlockHash;
}

export declare class BootstrapWitness {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): BootstrapWitness;
  to_hex(): string;
  static from_hex(hex_str: string): BootstrapWitness;
  to_json(): string;
  static from_json(json: string): BootstrapWitness;
  vkey(): Vkey;
  signature(): Ed25519Signature;
  chain_code(): Uint8Array;
  attributes(): Uint8Array;
  static new(vkey: Vkey, signature: Ed25519Signature, chain_code: Uint8Array, attributes: Uint8Array): BootstrapWitness;
}

export declare class BootstrapWitnesses {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): BootstrapWitnesses;
  to_hex(): string;
  static from_hex(hex_str: string): BootstrapWitnesses;
  to_json(): string;
  static from_json(json: string): BootstrapWitnesses;
  static new(): BootstrapWitnesses;
  len(): number;
  get(index: number): BootstrapWitness;
  add(witness: BootstrapWitness): boolean;
}

export declare class ByronAddress {
  to_base58(): string;
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ByronAddress;
  byron_protocol_magic(): number;
  byron_address_kind(): number;
  attributes(): Uint8Array;
  network_id(): number;
  static from_base58(s: string): ByronAddress;
  static icarus_from_key(key: Bip32PublicKey, protocol_magic: number): ByronAddress;
  static is_valid(s: string): boolean;
  to_address(): Address;
  static from_address(addr: Address): ByronAddress;
}

export declare class Certificate {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Certificate;
  to_hex(): string;
  static from_hex(hex_str: string): Certificate;
  to_json(): string;
  static from_json(json: string): Certificate;
  static new_stake_registration(stake_registration: StakeRegistration): Certificate;
  static new_reg_cert(stake_registration: StakeRegistration): Certificate;
  static new_stake_deregistration(stake_deregistration: StakeDeregistration): Certificate;
  static new_unreg_cert(stake_deregistration: StakeDeregistration): Certificate;
  static new_stake_delegation(stake_delegation: StakeDelegation): Certificate;
  static new_pool_registration(pool_registration: PoolRegistration): Certificate;
  static new_pool_retirement(pool_retirement: PoolRetirement): Certificate;
  static new_genesis_key_delegation(genesis_key_delegation: GenesisKeyDelegation): Certificate;
  static new_move_instantaneous_rewards_cert(move_instantaneous_rewards_cert: MoveInstantaneousRewardsCert): Certificate;
  static new_committee_hot_auth(committee_hot_auth: CommitteeHotAuth): Certificate;
  static new_committee_cold_resign(committee_cold_resign: CommitteeColdResign): Certificate;
  static new_drep_deregistration(drep_deregistration: DRepDeregistration): Certificate;
  static new_drep_registration(drep_registration: DRepRegistration): Certificate;
  static new_drep_update(drep_update: DRepUpdate): Certificate;
  static new_stake_and_vote_delegation(stake_and_vote_delegation: StakeAndVoteDelegation): Certificate;
  static new_stake_registration_and_delegation(stake_registration_and_delegation: StakeRegistrationAndDelegation): Certificate;
  static new_stake_vote_registration_and_delegation(stake_vote_registration_and_delegation: StakeVoteRegistrationAndDelegation): Certificate;
  static new_vote_delegation(vote_delegation: VoteDelegation): Certificate;
  static new_vote_registration_and_delegation(vote_registration_and_delegation: VoteRegistrationAndDelegation): Certificate;
  kind(): number;
  as_stake_registration(): StakeRegistration;
  as_reg_cert(): StakeRegistration;
  as_stake_deregistration(): StakeDeregistration;
  as_unreg_cert(): StakeDeregistration;
  as_stake_delegation(): StakeDelegation;
  as_pool_registration(): PoolRegistration;
  as_pool_retirement(): PoolRetirement;
  as_genesis_key_delegation(): GenesisKeyDelegation;
  as_move_instantaneous_rewards_cert(): MoveInstantaneousRewardsCert;
  as_committee_hot_auth(): CommitteeHotAuth;
  as_committee_cold_resign(): CommitteeColdResign;
  as_drep_deregistration(): DRepDeregistration;
  as_drep_registration(): DRepRegistration;
  as_drep_update(): DRepUpdate;
  as_stake_and_vote_delegation(): StakeAndVoteDelegation;
  as_stake_registration_and_delegation(): StakeRegistrationAndDelegation;
  as_stake_vote_registration_and_delegation(): StakeVoteRegistrationAndDelegation;
  as_vote_delegation(): VoteDelegation;
  as_vote_registration_and_delegation(): VoteRegistrationAndDelegation;
  has_required_script_witness(): boolean;
}

export declare class Certificates {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Certificates;
  to_hex(): string;
  static from_hex(hex_str: string): Certificates;
  to_json(): string;
  static from_json(json: string): Certificates;
  static new(): Certificates;
  len(): number;
  get(index: number): Certificate;
  add(elem: Certificate): boolean;
}

export declare class CertificatesBuilder {
  static new(): CertificatesBuilder;
  add(cert: Certificate): void;
  add_with_plutus_witness(cert: Certificate, witness: PlutusWitness): void;
  add_with_native_script(cert: Certificate, native_script_source: NativeScriptSource): void;
  get_plutus_witnesses(): PlutusWitnesses;
  get_ref_inputs(): TransactionInputs;
  get_native_scripts(): NativeScripts;
  get_certificates_refund(pool_deposit: BigNum, key_deposit: BigNum): Value;
  get_certificates_deposit(pool_deposit: BigNum, key_deposit: BigNum): BigNum;
  has_plutus_scripts(): boolean;
  build(): Certificates;
}

export declare class ChangeConfig {
  static new(address: Address): ChangeConfig;
  change_address(address: Address): ChangeConfig;
  change_plutus_data(plutus_data: OutputDatum): ChangeConfig;
  change_script_ref(script_ref: ScriptRef): ChangeConfig;
}

export declare class Committee {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Committee;
  to_hex(): string;
  static from_hex(hex_str: string): Committee;
  to_json(): string;
  static from_json(json: string): Committee;
  static new(quorum_threshold: UnitInterval): Committee;
  members_keys(): Credentials;
  quorum_threshold(): UnitInterval;
  add_member(committee_cold_credential: Credential, epoch: number): void;
  get_member_epoch(committee_cold_credential: Credential): number;
}

export declare class CommitteeColdResign {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): CommitteeColdResign;
  to_hex(): string;
  static from_hex(hex_str: string): CommitteeColdResign;
  to_json(): string;
  static from_json(json: string): CommitteeColdResign;
  committee_cold_credential(): Credential;
  anchor(): Anchor;
  static new(committee_cold_credential: Credential): CommitteeColdResign;
  static new_with_anchor(committee_cold_credential: Credential, anchor: Anchor): CommitteeColdResign;
  has_script_credentials(): boolean;
}

export declare class CommitteeHotAuth {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): CommitteeHotAuth;
  to_hex(): string;
  static from_hex(hex_str: string): CommitteeHotAuth;
  to_json(): string;
  static from_json(json: string): CommitteeHotAuth;
  committee_cold_credential(): Credential;
  committee_hot_credential(): Credential;
  static new(committee_cold_credential: Credential, committee_hot_credential: Credential): CommitteeHotAuth;
  has_script_credentials(): boolean;
}

export declare class Constitution {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Constitution;
  to_hex(): string;
  static from_hex(hex_str: string): Constitution;
  to_json(): string;
  static from_json(json: string): Constitution;
  anchor(): Anchor;
  script_hash(): ScriptHash;
  static new(anchor: Anchor): Constitution;
  static new_with_script_hash(anchor: Anchor, script_hash: ScriptHash): Constitution;
}

export declare class ConstrPlutusData {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ConstrPlutusData;
  to_hex(): string;
  static from_hex(hex_str: string): ConstrPlutusData;
  alternative(): BigNum;
  data(): PlutusList;
  static new(alternative: BigNum, data: PlutusList): ConstrPlutusData;
}

export declare class CostModel {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): CostModel;
  to_hex(): string;
  static from_hex(hex_str: string): CostModel;
  to_json(): string;
  static from_json(json: string): CostModel;
  static new(): CostModel;
  set(operation: number, cost: Int): number;
  get(operation: number): number;
  len(): number;
}

export declare class Costmdls {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Costmdls;
  to_hex(): string;
  static from_hex(hex_str: string): Costmdls;
  to_json(): string;
  static from_json(json: string): Costmdls;
  static new(): Costmdls;
  len(): number;
  insert(key: Language, value: CostModel): CostModel;
  get(key: Language): CostModel;
  keys(): Languages;
  retain_language_versions(languages: Languages): Costmdls;
}

export declare class Credential {
  static from_keyhash(hash: Ed25519KeyHash): Credential;
  static from_scripthash(hash: ScriptHash): Credential;
  to_keyhash(): Ed25519KeyHash;
  to_scripthash(): ScriptHash;
  kind(): number;
  has_script_hash(): boolean;
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Credential;
  to_hex(): string;
  static from_hex(hex_str: string): Credential;
  to_json(): string;
  static from_json(json: string): Credential;
}

export declare class Credentials {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Credentials;
  to_hex(): string;
  static from_hex(hex_str: string): Credentials;
  to_json(): string;
  static from_json(json: string): Credentials;
  static new(): Credentials;
  len(): number;
  get(index: number): Credential;
  add(credential: Credential): boolean;
}

export declare class DNSRecordAorAAAA {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): DNSRecordAorAAAA;
  to_hex(): string;
  static from_hex(hex_str: string): DNSRecordAorAAAA;
  to_json(): string;
  static from_json(json: string): DNSRecordAorAAAA;
  static new(dns_name: string): DNSRecordAorAAAA;
  record(): string;
}

export declare class DNSRecordSRV {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): DNSRecordSRV;
  to_hex(): string;
  static from_hex(hex_str: string): DNSRecordSRV;
  to_json(): string;
  static from_json(json: string): DNSRecordSRV;
  static new(dns_name: string): DNSRecordSRV;
  record(): string;
}

export declare class DRep {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): DRep;
  to_hex(): string;
  static from_hex(hex_str: string): DRep;
  to_json(): string;
  static from_json(json: string): DRep;
  static new_key_hash(key_hash: Ed25519KeyHash): DRep;
  static new_script_hash(script_hash: ScriptHash): DRep;
  static new_always_abstain(): DRep;
  static new_always_no_confidence(): DRep;
  static new_from_credential(cred: Credential): DRep;
  kind(): number;
  to_key_hash(): Ed25519KeyHash;
  to_script_hash(): ScriptHash;
  to_bech32(cip_129_format: boolean): string;
  static from_bech32(bech32_str: string): DRep;
}

export declare class DRepDeregistration {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): DRepDeregistration;
  to_hex(): string;
  static from_hex(hex_str: string): DRepDeregistration;
  to_json(): string;
  static from_json(json: string): DRepDeregistration;
  voting_credential(): Credential;
  coin(): BigNum;
  static new(voting_credential: Credential, coin: BigNum): DRepDeregistration;
  has_script_credentials(): boolean;
}

export declare class DRepRegistration {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): DRepRegistration;
  to_hex(): string;
  static from_hex(hex_str: string): DRepRegistration;
  to_json(): string;
  static from_json(json: string): DRepRegistration;
  voting_credential(): Credential;
  coin(): BigNum;
  anchor(): Anchor;
  static new(voting_credential: Credential, coin: BigNum): DRepRegistration;
  static new_with_anchor(voting_credential: Credential, coin: BigNum, anchor: Anchor): DRepRegistration;
  has_script_credentials(): boolean;
}

export declare class DRepUpdate {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): DRepUpdate;
  to_hex(): string;
  static from_hex(hex_str: string): DRepUpdate;
  to_json(): string;
  static from_json(json: string): DRepUpdate;
  voting_credential(): Credential;
  anchor(): Anchor;
  static new(voting_credential: Credential): DRepUpdate;
  static new_with_anchor(voting_credential: Credential, anchor: Anchor): DRepUpdate;
  has_script_credentials(): boolean;
}

export declare class DRepVotingThresholds {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): DRepVotingThresholds;
  to_hex(): string;
  static from_hex(hex_str: string): DRepVotingThresholds;
  to_json(): string;
  static from_json(json: string): DRepVotingThresholds;
  static new(motion_no_confidence: UnitInterval, committee_normal: UnitInterval, committee_no_confidence: UnitInterval, update_constitution: UnitInterval, hard_fork_initiation: UnitInterval, pp_network_group: UnitInterval, pp_economic_group: UnitInterval, pp_technical_group: UnitInterval, pp_governance_group: UnitInterval, treasury_withdrawal: UnitInterval): DRepVotingThresholds;
  set_motion_no_confidence(motion_no_confidence: UnitInterval): void;
  set_committee_normal(committee_normal: UnitInterval): void;
  set_committee_no_confidence(committee_no_confidence: UnitInterval): void;
  set_update_constitution(update_constitution: UnitInterval): void;
  set_hard_fork_initiation(hard_fork_initiation: UnitInterval): void;
  set_pp_network_group(pp_network_group: UnitInterval): void;
  set_pp_economic_group(pp_economic_group: UnitInterval): void;
  set_pp_technical_group(pp_technical_group: UnitInterval): void;
  set_pp_governance_group(pp_governance_group: UnitInterval): void;
  set_treasury_withdrawal(treasury_withdrawal: UnitInterval): void;
  motion_no_confidence(): UnitInterval;
  committee_normal(): UnitInterval;
  committee_no_confidence(): UnitInterval;
  update_constitution(): UnitInterval;
  hard_fork_initiation(): UnitInterval;
  pp_network_group(): UnitInterval;
  pp_economic_group(): UnitInterval;
  pp_technical_group(): UnitInterval;
  pp_governance_group(): UnitInterval;
  treasury_withdrawal(): UnitInterval;
}

export declare class DataCost {
  static new_coins_per_byte(coins_per_byte: BigNum): DataCost;
  coins_per_byte(): BigNum;
}

export declare class DataHash {
  static from_bytes(bytes: Uint8Array): DataHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): DataHash;
  to_hex(): string;
  static from_hex(hex: string): DataHash;
}

export declare class DatumSource {
  static new(datum: PlutusData): DatumSource;
  static new_ref_input(input: TransactionInput): DatumSource;
}

export declare class Ed25519KeyHash {
  static from_bytes(bytes: Uint8Array): Ed25519KeyHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): Ed25519KeyHash;
  to_hex(): string;
  static from_hex(hex: string): Ed25519KeyHash;
}

export declare class Ed25519KeyHashes {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Ed25519KeyHashes;
  to_hex(): string;
  static from_hex(hex_str: string): Ed25519KeyHashes;
  to_json(): string;
  static from_json(json: string): Ed25519KeyHashes;
  static new(): Ed25519KeyHashes;
  len(): number;
  get(index: number): Ed25519KeyHash;
  add(keyhash: Ed25519KeyHash): boolean;
  contains(elem: Ed25519KeyHash): boolean;
  to_option(): Ed25519KeyHashes;
}

export declare class Ed25519Signature {
  to_bytes(): Uint8Array;
  to_bech32(): string;
  to_hex(): string;
  static from_bech32(bech32_str: string): Ed25519Signature;
  static from_hex(input: string): Ed25519Signature;
  static from_bytes(bytes: Uint8Array): Ed25519Signature;
}

export declare class EnterpriseAddress {
  static new(network: number, payment: Credential): EnterpriseAddress;
  payment_cred(): Credential;
  to_address(): Address;
  static from_address(addr: Address): EnterpriseAddress;
  network_id(): number;
}

export declare class ExUnitPrices {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ExUnitPrices;
  to_hex(): string;
  static from_hex(hex_str: string): ExUnitPrices;
  to_json(): string;
  static from_json(json: string): ExUnitPrices;
  mem_price(): UnitInterval;
  step_price(): UnitInterval;
  static new(mem_price: UnitInterval, step_price: UnitInterval): ExUnitPrices;
}

export declare class ExUnits {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ExUnits;
  to_hex(): string;
  static from_hex(hex_str: string): ExUnits;
  to_json(): string;
  static from_json(json: string): ExUnits;
  mem(): BigNum;
  steps(): BigNum;
  static new(mem: BigNum, steps: BigNum): ExUnits;
}

export declare class FixedBlock {
  static from_bytes(bytes: Uint8Array): FixedBlock;
  static from_hex(hex_str: string): FixedBlock;
  header(): Header;
  transaction_bodies(): FixedTransactionBodies;
  transaction_witness_sets(): TransactionWitnessSets;
  auxiliary_data_set(): AuxiliaryDataSet;
  invalid_transactions(): string;
  block_hash(): BlockHash;
}

export declare class FixedTransaction {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): FixedTransaction;
  to_hex(): string;
  static from_hex(hex_str: string): FixedTransaction;
  static new(raw_body: Uint8Array, raw_witness_set: Uint8Array, is_valid: boolean): FixedTransaction;
  static new_with_auxiliary(raw_body: Uint8Array, raw_witness_set: Uint8Array, raw_auxiliary_data: Uint8Array, is_valid: boolean): FixedTransaction;
  static new_from_body_bytes(raw_body: Uint8Array): FixedTransaction;
  body(): TransactionBody;
  raw_body(): Uint8Array;
  set_body(raw_body: number): void;
  set_witness_set(raw_witness_set: number): void;
  witness_set(): TransactionWitnessSet;
  raw_witness_set(): Uint8Array;
  set_is_valid(valid: boolean): void;
  is_valid(): boolean;
  set_auxiliary_data(raw_auxiliary_data: number): void;
  auxiliary_data(): AuxiliaryData;
  raw_auxiliary_data(): Uint8Array;
  transaction_hash(): TransactionHash;
  add_vkey_witness(vkey_witness: Vkeywitness): void;
  add_bootstrap_witness(bootstrap_witness: BootstrapWitness): void;
  sign_and_add_vkey_signature(private_key: PrivateKey): void;
  sign_and_add_icarus_bootstrap_signature(addr: ByronAddress, private_key: Bip32PrivateKey): void;
  sign_and_add_daedalus_bootstrap_signature(addr: ByronAddress, private_key: LegacyDaedalusPrivateKey): void;
}

export declare class FixedTransactionBodies {
  static from_bytes(bytes: Uint8Array): FixedTransactionBodies;
  static from_hex(hex_str: string): FixedTransactionBodies;
  static new(): FixedTransactionBodies;
  len(): number;
  get(index: number): FixedTransactionBody;
  add(elem: FixedTransactionBody): void;
}

export declare class FixedTransactionBody {
  static from_bytes(bytes: Uint8Array): FixedTransactionBody;
  static from_hex(hex_str: string): FixedTransactionBody;
  transaction_body(): TransactionBody;
  tx_hash(): TransactionHash;
  original_bytes(): Uint8Array;
}

export declare class FixedTxWitnessesSet {
  tx_witnesses_set(): TransactionWitnessSet;
  add_vkey_witness(vkey_witness: Vkeywitness): void;
  add_bootstrap_witness(bootstrap_witness: BootstrapWitness): void;
  to_bytes(): Uint8Array;
  static from_bytes(data: Uint8Array): FixedTxWitnessesSet;
}

export declare class FixedVersionedBlock {
  static from_bytes(bytes: Uint8Array): FixedVersionedBlock;
  static from_hex(hex_str: string): FixedVersionedBlock;
  block(): FixedBlock;
  era(): number;
}

export declare class GeneralTransactionMetadata {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): GeneralTransactionMetadata;
  to_hex(): string;
  static from_hex(hex_str: string): GeneralTransactionMetadata;
  to_json(): string;
  static from_json(json: string): GeneralTransactionMetadata;
  static new(): GeneralTransactionMetadata;
  len(): number;
  insert(key: BigNum, value: TransactionMetadatum): TransactionMetadatum;
  get(key: BigNum): TransactionMetadatum;
  keys(): TransactionMetadatumLabels;
}

export declare class GenesisDelegateHash {
  static from_bytes(bytes: Uint8Array): GenesisDelegateHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): GenesisDelegateHash;
  to_hex(): string;
  static from_hex(hex: string): GenesisDelegateHash;
}

export declare class GenesisHash {
  static from_bytes(bytes: Uint8Array): GenesisHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): GenesisHash;
  to_hex(): string;
  static from_hex(hex: string): GenesisHash;
}

export declare class GenesisHashes {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): GenesisHashes;
  to_hex(): string;
  static from_hex(hex_str: string): GenesisHashes;
  to_json(): string;
  static from_json(json: string): GenesisHashes;
  static new(): GenesisHashes;
  len(): number;
  get(index: number): GenesisHash;
  add(elem: GenesisHash): void;
}

export declare class GenesisKeyDelegation {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): GenesisKeyDelegation;
  to_hex(): string;
  static from_hex(hex_str: string): GenesisKeyDelegation;
  to_json(): string;
  static from_json(json: string): GenesisKeyDelegation;
  genesishash(): GenesisHash;
  genesis_delegate_hash(): GenesisDelegateHash;
  vrf_keyhash(): VRFKeyHash;
  static new(genesishash: GenesisHash, genesis_delegate_hash: GenesisDelegateHash, vrf_keyhash: VRFKeyHash): GenesisKeyDelegation;
}

export declare class GovernanceAction {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): GovernanceAction;
  to_hex(): string;
  static from_hex(hex_str: string): GovernanceAction;
  to_json(): string;
  static from_json(json: string): GovernanceAction;
  static new_parameter_change_action(parameter_change_action: ParameterChangeAction): GovernanceAction;
  static new_hard_fork_initiation_action(hard_fork_initiation_action: HardForkInitiationAction): GovernanceAction;
  static new_treasury_withdrawals_action(treasury_withdrawals_action: TreasuryWithdrawalsAction): GovernanceAction;
  static new_no_confidence_action(no_confidence_action: NoConfidenceAction): GovernanceAction;
  static new_new_committee_action(new_committee_action: UpdateCommitteeAction): GovernanceAction;
  static new_new_constitution_action(new_constitution_action: NewConstitutionAction): GovernanceAction;
  static new_info_action(info_action: InfoAction): GovernanceAction;
  kind(): number;
  as_parameter_change_action(): ParameterChangeAction;
  as_hard_fork_initiation_action(): HardForkInitiationAction;
  as_treasury_withdrawals_action(): TreasuryWithdrawalsAction;
  as_no_confidence_action(): NoConfidenceAction;
  as_new_committee_action(): UpdateCommitteeAction;
  as_new_constitution_action(): NewConstitutionAction;
  as_info_action(): InfoAction;
}

export declare class GovernanceActionId {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): GovernanceActionId;
  to_hex(): string;
  static from_hex(hex_str: string): GovernanceActionId;
  to_json(): string;
  static from_json(json: string): GovernanceActionId;
  transaction_id(): TransactionHash;
  index(): number;
  static new(transaction_id: TransactionHash, index: number): GovernanceActionId;
}

export declare class GovernanceActionIds {
  to_json(): string;
  static from_json(json: string): GovernanceActionIds;
  static new(): GovernanceActionIds;
  add(governance_action_id: GovernanceActionId): void;
  get(index: number): GovernanceActionId;
  len(): number;
}

export declare class HardForkInitiationAction {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): HardForkInitiationAction;
  to_hex(): string;
  static from_hex(hex_str: string): HardForkInitiationAction;
  to_json(): string;
  static from_json(json: string): HardForkInitiationAction;
  gov_action_id(): GovernanceActionId;
  protocol_version(): ProtocolVersion;
  static new(protocol_version: ProtocolVersion): HardForkInitiationAction;
  static new_with_action_id(gov_action_id: GovernanceActionId, protocol_version: ProtocolVersion): HardForkInitiationAction;
}

export declare class Header {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Header;
  to_hex(): string;
  static from_hex(hex_str: string): Header;
  to_json(): string;
  static from_json(json: string): Header;
  header_body(): HeaderBody;
  body_signature(): KESSignature;
  static new(header_body: HeaderBody, body_signature: KESSignature): Header;
}

export declare class HeaderBody {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): HeaderBody;
  to_hex(): string;
  static from_hex(hex_str: string): HeaderBody;
  to_json(): string;
  static from_json(json: string): HeaderBody;
  block_number(): number;
  slot(): number;
  slot_bignum(): BigNum;
  prev_hash(): BlockHash;
  issuer_vkey(): Vkey;
  vrf_vkey(): VRFVKey;
  has_nonce_and_leader_vrf(): boolean;
  nonce_vrf_or_nothing(): VRFCert;
  leader_vrf_or_nothing(): VRFCert;
  has_vrf_result(): boolean;
  vrf_result_or_nothing(): VRFCert;
  block_body_size(): number;
  block_body_hash(): BlockHash;
  operational_cert(): OperationalCert;
  protocol_version(): ProtocolVersion;
  static new(block_number: number, slot: number, prev_hash: BlockHash | undefined, issuer_vkey: Vkey, vrf_vkey: VRFVKey, vrf_result: VRFCert, block_body_size: number, block_body_hash: BlockHash, operational_cert: OperationalCert, protocol_version: ProtocolVersion): HeaderBody;
  static new_headerbody(block_number: number, slot: BigNum, prev_hash: BlockHash | undefined, issuer_vkey: Vkey, vrf_vkey: VRFVKey, vrf_result: VRFCert, block_body_size: number, block_body_hash: BlockHash, operational_cert: OperationalCert, protocol_version: ProtocolVersion): HeaderBody;
}

export declare class InfoAction {
  static new(): InfoAction;
}

export declare class Int {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Int;
  to_hex(): string;
  static from_hex(hex_str: string): Int;
  to_json(): string;
  static from_json(json: string): Int;
  static new(x: BigNum): Int;
  static new_negative(x: BigNum): Int;
  static new_i32(x: number): Int;
  is_positive(): boolean;
  as_positive(): BigNum;
  as_negative(): BigNum;
  as_i32(): number;
  as_i32_or_nothing(): number;
  as_i32_or_fail(): number;
  to_str(): string;
  static from_str(string: string): Int;
}

export declare class Ipv4 {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Ipv4;
  to_hex(): string;
  static from_hex(hex_str: string): Ipv4;
  to_json(): string;
  static from_json(json: string): Ipv4;
  static new(data: Uint8Array): Ipv4;
  ip(): Uint8Array;
}

export declare class Ipv6 {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Ipv6;
  to_hex(): string;
  static from_hex(hex_str: string): Ipv6;
  to_json(): string;
  static from_json(json: string): Ipv6;
  static new(data: Uint8Array): Ipv6;
  ip(): Uint8Array;
}

export declare class KESSignature {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): KESSignature;
}

export declare class KESVKey {
  static from_bytes(bytes: Uint8Array): KESVKey;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): KESVKey;
  to_hex(): string;
  static from_hex(hex: string): KESVKey;
}

export declare class Language {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Language;
  to_hex(): string;
  static from_hex(hex_str: string): Language;
  to_json(): string;
  static from_json(json: string): Language;
  static new_plutus_v1(): Language;
  static new_plutus_v2(): Language;
  static new_plutus_v3(): Language;
  kind(): number;
}

export declare class Languages {
  static new(): Languages;
  len(): number;
  get(index: number): Language;
  add(elem: Language): void;
  static list(): Languages;
}

export declare class LegacyDaedalusPrivateKey {
  static from_bytes(bytes: Uint8Array): LegacyDaedalusPrivateKey;
  as_bytes(): Uint8Array;
  chaincode(): Uint8Array;
}

export declare class LinearFee {
  constant(): BigNum;
  coefficient(): BigNum;
  static new(coefficient: BigNum, constant: BigNum): LinearFee;
}

export declare class MIRToStakeCredentials {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): MIRToStakeCredentials;
  to_hex(): string;
  static from_hex(hex_str: string): MIRToStakeCredentials;
  to_json(): string;
  static from_json(json: string): MIRToStakeCredentials;
  static new(): MIRToStakeCredentials;
  len(): number;
  insert(cred: Credential, delta: Int): number;
  get(cred: Credential): number;
  keys(): Credentials;
}

export declare class MalformedAddress {
  original_bytes(): Uint8Array;
  to_address(): Address;
  static from_address(addr: Address): MalformedAddress;
}

export declare class MetadataList {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): MetadataList;
  to_hex(): string;
  static from_hex(hex_str: string): MetadataList;
  static new(): MetadataList;
  len(): number;
  get(index: number): TransactionMetadatum;
  add(elem: TransactionMetadatum): void;
}

export declare class MetadataMap {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): MetadataMap;
  to_hex(): string;
  static from_hex(hex_str: string): MetadataMap;
  static new(): MetadataMap;
  len(): number;
  insert(key: TransactionMetadatum, value: TransactionMetadatum): TransactionMetadatum;
  insert_str(key: string, value: TransactionMetadatum): TransactionMetadatum;
  insert_i32(key: number, value: TransactionMetadatum): TransactionMetadatum;
  get(key: TransactionMetadatum): TransactionMetadatum;
  get_str(key: string): TransactionMetadatum;
  get_i32(key: number): TransactionMetadatum;
  has(key: TransactionMetadatum): boolean;
  keys(): MetadataList;
}

export declare class Mint {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Mint;
  to_hex(): string;
  static from_hex(hex_str: string): Mint;
  to_json(): string;
  static from_json(json: string): Mint;
  static new(): Mint;
  static new_from_entry(key: ScriptHash, value: MintAssets): Mint;
  len(): number;
  insert(key: ScriptHash, value: MintAssets): MintAssets;
  get(key: ScriptHash): MintsAssets;
  keys(): ScriptHashes;
  as_positive_multiasset(): MultiAsset;
  as_negative_multiasset(): MultiAsset;
}

export declare class MintAssets {
  static new(): MintAssets;
  static new_from_entry(key: AssetName, value: Int): MintAssets;
  len(): number;
  insert(key: AssetName, value: Int): number;
  get(key: AssetName): number;
  keys(): AssetNames;
}

export declare class MintBuilder {
  static new(): MintBuilder;
  add_asset(mint: MintWitness, asset_name: AssetName, amount: Int): void;
  set_asset(mint: MintWitness, asset_name: AssetName, amount: Int): void;
  build(): Mint;
  get_native_scripts(): NativeScripts;
  get_plutus_witnesses(): PlutusWitnesses;
  get_ref_inputs(): TransactionInputs;
  get_redeemers(): Redeemers;
  has_plutus_scripts(): boolean;
  has_native_scripts(): boolean;
}

export declare class MintWitness {
  static new_native_script(native_script: NativeScriptSource): MintWitness;
  static new_plutus_script(plutus_script: PlutusScriptSource, redeemer: Redeemer): MintWitness;
}

export declare class MintsAssets {
  to_json(): string;
  static from_json(json: string): MintsAssets;
  static new(): MintsAssets;
  add(mint_assets: MintAssets): void;
  get(index: number): MintAssets;
  len(): number;
}

export declare class MoveInstantaneousReward {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): MoveInstantaneousReward;
  to_hex(): string;
  static from_hex(hex_str: string): MoveInstantaneousReward;
  to_json(): string;
  static from_json(json: string): MoveInstantaneousReward;
  static new_to_other_pot(pot: number, amount: BigNum): MoveInstantaneousReward;
  static new_to_stake_creds(pot: number, amounts: MIRToStakeCredentials): MoveInstantaneousReward;
  pot(): number;
  kind(): number;
  as_to_other_pot(): BigNum;
  as_to_stake_creds(): MIRToStakeCredentials;
}

export declare class MoveInstantaneousRewardsCert {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): MoveInstantaneousRewardsCert;
  to_hex(): string;
  static from_hex(hex_str: string): MoveInstantaneousRewardsCert;
  to_json(): string;
  static from_json(json: string): MoveInstantaneousRewardsCert;
  move_instantaneous_reward(): MoveInstantaneousReward;
  static new(move_instantaneous_reward: MoveInstantaneousReward): MoveInstantaneousRewardsCert;
}

export declare class MultiAsset {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): MultiAsset;
  to_hex(): string;
  static from_hex(hex_str: string): MultiAsset;
  to_json(): string;
  static from_json(json: string): MultiAsset;
  static new(): MultiAsset;
  len(): number;
  insert(policy_id: ScriptHash, assets: Assets): Assets;
  get(policy_id: ScriptHash): Assets;
  set_asset(policy_id: ScriptHash, asset_name: AssetName, value: BigNum): BigNum;
  get_asset(policy_id: ScriptHash, asset_name: AssetName): BigNum;
  keys(): ScriptHashes;
  sub(rhs_ma: MultiAsset): MultiAsset;
}

export declare class MultiHostName {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): MultiHostName;
  to_hex(): string;
  static from_hex(hex_str: string): MultiHostName;
  to_json(): string;
  static from_json(json: string): MultiHostName;
  dns_name(): DNSRecordSRV;
  static new(dns_name: DNSRecordSRV): MultiHostName;
}

export declare class NativeScript {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): NativeScript;
  to_hex(): string;
  static from_hex(hex_str: string): NativeScript;
  to_json(): string;
  static from_json(json: string): NativeScript;
  hash(): ScriptHash;
  static new_script_pubkey(script_pubkey: ScriptPubkey): NativeScript;
  static new_script_all(script_all: ScriptAll): NativeScript;
  static new_script_any(script_any: ScriptAny): NativeScript;
  static new_script_n_of_k(script_n_of_k: ScriptNOfK): NativeScript;
  static new_timelock_start(timelock_start: TimelockStart): NativeScript;
  static new_timelock_expiry(timelock_expiry: TimelockExpiry): NativeScript;
  kind(): number;
  as_script_pubkey(): ScriptPubkey;
  as_script_all(): ScriptAll;
  as_script_any(): ScriptAny;
  as_script_n_of_k(): ScriptNOfK;
  as_timelock_start(): TimelockStart;
  as_timelock_expiry(): TimelockExpiry;
  get_required_signers(): Ed25519KeyHashes;
}

export declare class NativeScriptSource {
  static new(script: NativeScript): NativeScriptSource;
  static new_ref_input(script_hash: ScriptHash, input: TransactionInput, script_size: number): NativeScriptSource;
  set_required_signers(key_hashes: Ed25519KeyHashes): void;
  get_ref_script_size(): number;
}

export declare class NativeScripts {
  static new(): NativeScripts;
  len(): number;
  get(index: number): NativeScript;
  add(elem: NativeScript): void;
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): NativeScripts;
  to_hex(): string;
  static from_hex(hex_str: string): NativeScripts;
  to_json(): string;
  static from_json(json: string): NativeScripts;
}

export declare class NetworkId {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): NetworkId;
  to_hex(): string;
  static from_hex(hex_str: string): NetworkId;
  to_json(): string;
  static from_json(json: string): NetworkId;
  static testnet(): NetworkId;
  static mainnet(): NetworkId;
  kind(): number;
}

export declare class NetworkInfo {
  static new(network_id: number, protocol_magic: number): NetworkInfo;
  network_id(): number;
  protocol_magic(): number;
  static testnet_preview(): NetworkInfo;
  static testnet_preprod(): NetworkInfo;
  static mainnet(): NetworkInfo;
}

export declare class NewConstitutionAction {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): NewConstitutionAction;
  to_hex(): string;
  static from_hex(hex_str: string): NewConstitutionAction;
  to_json(): string;
  static from_json(json: string): NewConstitutionAction;
  gov_action_id(): GovernanceActionId;
  constitution(): Constitution;
  static new(constitution: Constitution): NewConstitutionAction;
  static new_with_action_id(gov_action_id: GovernanceActionId, constitution: Constitution): NewConstitutionAction;
  has_script_hash(): boolean;
}

export declare class NoConfidenceAction {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): NoConfidenceAction;
  to_hex(): string;
  static from_hex(hex_str: string): NoConfidenceAction;
  to_json(): string;
  static from_json(json: string): NoConfidenceAction;
  gov_action_id(): GovernanceActionId;
  static new(): NoConfidenceAction;
  static new_with_action_id(gov_action_id: GovernanceActionId): NoConfidenceAction;
}

export declare class Nonce {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Nonce;
  to_hex(): string;
  static from_hex(hex_str: string): Nonce;
  to_json(): string;
  static from_json(json: string): Nonce;
  static new_identity(): Nonce;
  static new_from_hash(hash: Uint8Array): Nonce;
  get_hash(): Uint8Array;
}

export declare class OperationalCert {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): OperationalCert;
  to_hex(): string;
  static from_hex(hex_str: string): OperationalCert;
  to_json(): string;
  static from_json(json: string): OperationalCert;
  hot_vkey(): KESVKey;
  sequence_number(): number;
  kes_period(): number;
  sigma(): Ed25519Signature;
  static new(hot_vkey: KESVKey, sequence_number: number, kes_period: number, sigma: Ed25519Signature): OperationalCert;
}

export declare class OutputDatum {
  static new_data_hash(data_hash: DataHash): OutputDatum;
  static new_data(data: PlutusData): OutputDatum;
  data_hash(): DataHash;
  data(): PlutusData;
}

export declare class ParameterChangeAction {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ParameterChangeAction;
  to_hex(): string;
  static from_hex(hex_str: string): ParameterChangeAction;
  to_json(): string;
  static from_json(json: string): ParameterChangeAction;
  gov_action_id(): GovernanceActionId;
  protocol_param_updates(): ProtocolParamUpdate;
  policy_hash(): ScriptHash;
  static new(protocol_param_updates: ProtocolParamUpdate): ParameterChangeAction;
  static new_with_action_id(gov_action_id: GovernanceActionId, protocol_param_updates: ProtocolParamUpdate): ParameterChangeAction;
  static new_with_policy_hash(protocol_param_updates: ProtocolParamUpdate, policy_hash: ScriptHash): ParameterChangeAction;
  static new_with_policy_hash_and_action_id(gov_action_id: GovernanceActionId, protocol_param_updates: ProtocolParamUpdate, policy_hash: ScriptHash): ParameterChangeAction;
}

export declare class PlutusData {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PlutusData;
  to_hex(): string;
  static from_hex(hex_str: string): PlutusData;
  static new_constr_plutus_data(constr_plutus_data: ConstrPlutusData): PlutusData;
  static new_empty_constr_plutus_data(alternative: BigNum): PlutusData;
  static new_single_value_constr_plutus_data(alternative: BigNum, plutus_data: PlutusData): PlutusData;
  static new_map(map: PlutusMap): PlutusData;
  static new_list(list: PlutusList): PlutusData;
  static new_integer(integer: BigInt): PlutusData;
  static new_bytes(bytes: Uint8Array): PlutusData;
  kind(): number;
  as_constr_plutus_data(): ConstrPlutusData;
  as_map(): PlutusMap;
  as_list(): PlutusList;
  as_integer(): BigInt;
  as_bytes(): Uint8Array;
  to_json(schema: string): string;
  static from_json(json: string, schema: number): PlutusData;
  static from_address(address: Address): PlutusData;
  as_address(network: NetworkInfo): Address;
}

export declare class PlutusList {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PlutusList;
  to_hex(): string;
  static from_hex(hex_str: string): PlutusList;
  static new(): PlutusList;
  len(): number;
  get(index: number): PlutusData;
  add(elem: PlutusData): void;
}

export declare class PlutusMap {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PlutusMap;
  to_hex(): string;
  static from_hex(hex_str: string): PlutusMap;
  static new(): PlutusMap;
  len(): number;
  insert(key: PlutusData, values: PlutusMapValues): PlutusMapValues;
  get(key: PlutusData): PlutusMapValues;
  keys(): PlutusList;
}

export declare class PlutusMapValues {
  static new(): PlutusMapValues;
  len(): number;
  get(index: number): PlutusData;
  add(elem: PlutusData): void;
}

export declare class PlutusScript {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PlutusScript;
  to_hex(): string;
  static from_hex(hex_str: string): PlutusScript;
  static new(bytes: Uint8Array): PlutusScript;
  static new_v2(bytes: Uint8Array): PlutusScript;
  static new_v3(bytes: Uint8Array): PlutusScript;
  static new_with_version(bytes: Uint8Array, language: Language): PlutusScript;
  bytes(): Uint8Array;
  static from_bytes_v2(bytes: Uint8Array): PlutusScript;
  static from_bytes_v3(bytes: Uint8Array): PlutusScript;
  static from_bytes_with_version(bytes: Uint8Array, language: Language): PlutusScript;
  static from_hex_with_version(hex_str: string, language: Language): PlutusScript;
  hash(): ScriptHash;
  language_version(): Language;
}

export declare class PlutusScriptSource {
  static new(script: PlutusScript): PlutusScriptSource;
  static new_ref_input(script_hash: ScriptHash, input: TransactionInput, lang_ver: Language, script_size: number): PlutusScriptSource;
  set_required_signers(key_hashes: Ed25519KeyHashes): void;
  get_ref_script_size(): number;
}

export declare class PlutusScripts {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PlutusScripts;
  to_hex(): string;
  static from_hex(hex_str: string): PlutusScripts;
  to_json(): string;
  static from_json(json: string): PlutusScripts;
  static new(): PlutusScripts;
  len(): number;
  get(index: number): PlutusScript;
  add(elem: PlutusScript): void;
}

export declare class PlutusWitness {
  static new(script: PlutusScript, datum: PlutusData, redeemer: Redeemer): PlutusWitness;
  static new_with_ref(script: PlutusScriptSource, datum: DatumSource, redeemer: Redeemer): PlutusWitness;
  static new_without_datum(script: PlutusScript, redeemer: Redeemer): PlutusWitness;
  static new_with_ref_without_datum(script: PlutusScriptSource, redeemer: Redeemer): PlutusWitness;
  script(): PlutusScript;
  datum(): PlutusData;
  redeemer(): Redeemer;
}

export declare class PlutusWitnesses {
  static new(): PlutusWitnesses;
  len(): number;
  get(index: number): PlutusWitness;
  add(elem: PlutusWitness): void;
}

export declare class Pointer {
  static new(slot: number, tx_index: number, cert_index: number): Pointer;
  static new_pointer(slot: BigNum, tx_index: BigNum, cert_index: BigNum): Pointer;
  slot(): number;
  tx_index(): number;
  cert_index(): number;
  slot_bignum(): BigNum;
  tx_index_bignum(): BigNum;
  cert_index_bignum(): BigNum;
}

export declare class PointerAddress {
  static new(network: number, payment: Credential, stake: Pointer): PointerAddress;
  payment_cred(): Credential;
  stake_pointer(): Pointer;
  to_address(): Address;
  static from_address(addr: Address): PointerAddress;
  network_id(): number;
}

export declare class PoolMetadata {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PoolMetadata;
  to_hex(): string;
  static from_hex(hex_str: string): PoolMetadata;
  to_json(): string;
  static from_json(json: string): PoolMetadata;
  url(): URL;
  pool_metadata_hash(): PoolMetadataHash;
  static new(url: URL, pool_metadata_hash: PoolMetadataHash): PoolMetadata;
}

export declare class PoolMetadataHash {
  static from_bytes(bytes: Uint8Array): PoolMetadataHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): PoolMetadataHash;
  to_hex(): string;
  static from_hex(hex: string): PoolMetadataHash;
}

export declare class PoolParams {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PoolParams;
  to_hex(): string;
  static from_hex(hex_str: string): PoolParams;
  to_json(): string;
  static from_json(json: string): PoolParams;
  operator(): Ed25519KeyHash;
  vrf_keyhash(): VRFKeyHash;
  pledge(): BigNum;
  cost(): BigNum;
  margin(): UnitInterval;
  reward_account(): RewardAddress;
  pool_owners(): Ed25519KeyHashes;
  relays(): Relays;
  pool_metadata(): PoolMetadata;
  static new(operator: Ed25519KeyHash, vrf_keyhash: VRFKeyHash, pledge: BigNum, cost: BigNum, margin: UnitInterval, reward_account: RewardAddress, pool_owners: Ed25519KeyHashes, relays: Relays, pool_metadata?: PoolMetadata): PoolParams;
}

export declare class PoolRegistration {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PoolRegistration;
  to_hex(): string;
  static from_hex(hex_str: string): PoolRegistration;
  to_json(): string;
  static from_json(json: string): PoolRegistration;
  pool_params(): PoolParams;
  static new(pool_params: PoolParams): PoolRegistration;
}

export declare class PoolRetirement {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PoolRetirement;
  to_hex(): string;
  static from_hex(hex_str: string): PoolRetirement;
  to_json(): string;
  static from_json(json: string): PoolRetirement;
  pool_keyhash(): Ed25519KeyHash;
  epoch(): number;
  static new(pool_keyhash: Ed25519KeyHash, epoch: number): PoolRetirement;
}

export declare class PoolVotingThresholds {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PoolVotingThresholds;
  to_hex(): string;
  static from_hex(hex_str: string): PoolVotingThresholds;
  to_json(): string;
  static from_json(json: string): PoolVotingThresholds;
  static new(motion_no_confidence: UnitInterval, committee_normal: UnitInterval, committee_no_confidence: UnitInterval, hard_fork_initiation: UnitInterval, security_relevant_threshold: UnitInterval): PoolVotingThresholds;
  motion_no_confidence(): UnitInterval;
  committee_normal(): UnitInterval;
  committee_no_confidence(): UnitInterval;
  hard_fork_initiation(): UnitInterval;
  security_relevant_threshold(): UnitInterval;
}

export declare class PrivateKey {
  to_public(): PublicKey;
  static generate_ed25519(): PrivateKey;
  static generate_ed25519extended(): PrivateKey;
  static from_bech32(bech32_str: string): PrivateKey;
  to_bech32(): string;
  as_bytes(): Uint8Array;
  static from_extended_bytes(bytes: Uint8Array): PrivateKey;
  static from_normal_bytes(bytes: Uint8Array): PrivateKey;
  sign(message: number): Ed25519Signature;
  to_hex(): string;
  static from_hex(hex_str: string): PrivateKey;
}

export declare class ProposedProtocolParameterUpdates {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ProposedProtocolParameterUpdates;
  to_hex(): string;
  static from_hex(hex_str: string): ProposedProtocolParameterUpdates;
  to_json(): string;
  static from_json(json: string): ProposedProtocolParameterUpdates;
  static new(): ProposedProtocolParameterUpdates;
  len(): number;
  insert(key: GenesisHash, value: ProtocolParamUpdate): ProtocolParamUpdate;
  get(key: GenesisHash): ProtocolParamUpdate;
  keys(): GenesisHashes;
}

export declare class ProtocolParamUpdate {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ProtocolParamUpdate;
  to_hex(): string;
  static from_hex(hex_str: string): ProtocolParamUpdate;
  to_json(): string;
  static from_json(json: string): ProtocolParamUpdate;
  set_minfee_a(minfee_a: BigNum): void;
  minfee_a(): BigNum;
  set_minfee_b(minfee_b: BigNum): void;
  minfee_b(): BigNum;
  set_max_block_body_size(max_block_body_size: number): void;
  max_block_body_size(): number;
  set_max_tx_size(max_tx_size: number): void;
  max_tx_size(): number;
  set_max_block_header_size(max_block_header_size: number): void;
  max_block_header_size(): number;
  set_key_deposit(key_deposit: BigNum): void;
  key_deposit(): BigNum;
  set_pool_deposit(pool_deposit: BigNum): void;
  pool_deposit(): BigNum;
  set_max_epoch(max_epoch: number): void;
  max_epoch(): number;
  set_n_opt(n_opt: number): void;
  n_opt(): number;
  set_pool_pledge_influence(pool_pledge_influence: UnitInterval): void;
  pool_pledge_influence(): UnitInterval;
  set_expansion_rate(expansion_rate: UnitInterval): void;
  expansion_rate(): UnitInterval;
  set_treasury_growth_rate(treasury_growth_rate: UnitInterval): void;
  treasury_growth_rate(): UnitInterval;
  d(): UnitInterval;
  extra_entropy(): Nonce;
  set_protocol_version(protocol_version: ProtocolVersion): void;
  protocol_version(): ProtocolVersion;
  set_min_pool_cost(min_pool_cost: BigNum): void;
  min_pool_cost(): BigNum;
  set_ada_per_utxo_byte(ada_per_utxo_byte: BigNum): void;
  ada_per_utxo_byte(): BigNum;
  set_cost_models(cost_models: Costmdls): void;
  cost_models(): Costmdls;
  set_execution_costs(execution_costs: ExUnitPrices): void;
  execution_costs(): ExUnitPrices;
  set_max_tx_ex_units(max_tx_ex_units: ExUnits): void;
  max_tx_ex_units(): ExUnits;
  set_max_block_ex_units(max_block_ex_units: ExUnits): void;
  max_block_ex_units(): ExUnits;
  set_max_value_size(max_value_size: number): void;
  max_value_size(): number;
  set_collateral_percentage(collateral_percentage: number): void;
  collateral_percentage(): number;
  set_max_collateral_inputs(max_collateral_inputs: number): void;
  max_collateral_inputs(): number;
  set_pool_voting_thresholds(pool_voting_thresholds: PoolVotingThresholds): void;
  pool_voting_thresholds(): PoolVotingThresholds;
  set_drep_voting_thresholds(drep_voting_thresholds: DRepVotingThresholds): void;
  drep_voting_thresholds(): DRepVotingThresholds;
  set_min_committee_size(min_committee_size: number): void;
  min_committee_size(): number;
  set_committee_term_limit(committee_term_limit: number): void;
  committee_term_limit(): number;
  set_governance_action_validity_period(governance_action_validity_period: number): void;
  governance_action_validity_period(): number;
  set_governance_action_deposit(governance_action_deposit: BigNum): void;
  governance_action_deposit(): BigNum;
  set_drep_deposit(drep_deposit: BigNum): void;
  drep_deposit(): BigNum;
  set_drep_inactivity_period(drep_inactivity_period: number): void;
  drep_inactivity_period(): number;
  set_ref_script_coins_per_byte(ref_script_coins_per_byte: UnitInterval): void;
  ref_script_coins_per_byte(): UnitInterval;
  static new(): ProtocolParamUpdate;
}

export declare class ProtocolVersion {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ProtocolVersion;
  to_hex(): string;
  static from_hex(hex_str: string): ProtocolVersion;
  to_json(): string;
  static from_json(json: string): ProtocolVersion;
  major(): number;
  minor(): number;
  static new(major: number, minor: number): ProtocolVersion;
}

export declare class PublicKey {
  static from_bech32(bech32_str: string): PublicKey;
  to_bech32(): string;
  as_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): PublicKey;
  verify(data: number, signature: Ed25519Signature): boolean;
  hash(): Ed25519KeyHash;
  to_hex(): string;
  static from_hex(hex_str: string): PublicKey;
}

export declare class PublicKeys {
  static new(): PublicKeys;
  size(): number;
  get(index: number): PublicKey;
  add(key: PublicKey): void;
}

export declare class Redeemer {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Redeemer;
  to_hex(): string;
  static from_hex(hex_str: string): Redeemer;
  to_json(): string;
  static from_json(json: string): Redeemer;
  tag(): RedeemerTag;
  index(): BigNum;
  data(): PlutusData;
  ex_units(): ExUnits;
  static new(tag: RedeemerTag, index: BigNum, data: PlutusData, ex_units: ExUnits): Redeemer;
}

export declare class RedeemerTag {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): RedeemerTag;
  to_hex(): string;
  static from_hex(hex_str: string): RedeemerTag;
  to_json(): string;
  static from_json(json: string): RedeemerTag;
  static new_spend(): RedeemerTag;
  static new_mint(): RedeemerTag;
  static new_cert(): RedeemerTag;
  static new_reward(): RedeemerTag;
  static new_vote(): RedeemerTag;
  static new_voting_proposal(): RedeemerTag;
  kind(): number;
}

export declare class Redeemers {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Redeemers;
  to_hex(): string;
  static from_hex(hex_str: string): Redeemers;
  to_json(): string;
  static from_json(json: string): Redeemers;
  static new(): Redeemers;
  len(): number;
  get(index: number): Redeemer;
  add(elem: Redeemer): void;
  get_container_type(): number;
  total_ex_units(): ExUnits;
}

export declare class Relay {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Relay;
  to_hex(): string;
  static from_hex(hex_str: string): Relay;
  to_json(): string;
  static from_json(json: string): Relay;
  static new_single_host_addr(single_host_addr: SingleHostAddr): Relay;
  static new_single_host_name(single_host_name: SingleHostName): Relay;
  static new_multi_host_name(multi_host_name: MultiHostName): Relay;
  kind(): number;
  as_single_host_addr(): SingleHostAddr;
  as_single_host_name(): SingleHostName;
  as_multi_host_name(): MultiHostName;
}

export declare class Relays {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Relays;
  to_hex(): string;
  static from_hex(hex_str: string): Relays;
  to_json(): string;
  static from_json(json: string): Relays;
  static new(): Relays;
  len(): number;
  get(index: number): Relay;
  add(elem: Relay): void;
}

export declare class RewardAddress {
  static new(network: number, payment: Credential): RewardAddress;
  payment_cred(): Credential;
  to_address(): Address;
  static from_address(addr: Address): RewardAddress;
  network_id(): number;
}

export declare class RewardAddresses {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): RewardAddresses;
  to_hex(): string;
  static from_hex(hex_str: string): RewardAddresses;
  to_json(): string;
  static from_json(json: string): RewardAddresses;
  static new(): RewardAddresses;
  len(): number;
  get(index: number): RewardAddress;
  add(elem: RewardAddress): void;
}

export declare class ScriptAll {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ScriptAll;
  to_hex(): string;
  static from_hex(hex_str: string): ScriptAll;
  to_json(): string;
  static from_json(json: string): ScriptAll;
  native_scripts(): NativeScripts;
  static new(native_scripts: NativeScripts): ScriptAll;
}

export declare class ScriptAny {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ScriptAny;
  to_hex(): string;
  static from_hex(hex_str: string): ScriptAny;
  to_json(): string;
  static from_json(json: string): ScriptAny;
  native_scripts(): NativeScripts;
  static new(native_scripts: NativeScripts): ScriptAny;
}

export declare class ScriptDataHash {
  static from_bytes(bytes: Uint8Array): ScriptDataHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): ScriptDataHash;
  to_hex(): string;
  static from_hex(hex: string): ScriptDataHash;
}

export declare class ScriptHash {
  static from_bytes(bytes: Uint8Array): ScriptHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): ScriptHash;
  to_hex(): string;
  static from_hex(hex: string): ScriptHash;
}

export declare class ScriptHashes {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ScriptHashes;
  to_hex(): string;
  static from_hex(hex_str: string): ScriptHashes;
  to_json(): string;
  static from_json(json: string): ScriptHashes;
  static new(): ScriptHashes;
  len(): number;
  get(index: number): ScriptHash;
  add(elem: ScriptHash): void;
}

export declare class ScriptNOfK {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ScriptNOfK;
  to_hex(): string;
  static from_hex(hex_str: string): ScriptNOfK;
  to_json(): string;
  static from_json(json: string): ScriptNOfK;
  n(): number;
  native_scripts(): NativeScripts;
  static new(n: number, native_scripts: NativeScripts): ScriptNOfK;
}

export declare class ScriptPubkey {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ScriptPubkey;
  to_hex(): string;
  static from_hex(hex_str: string): ScriptPubkey;
  to_json(): string;
  static from_json(json: string): ScriptPubkey;
  addr_keyhash(): Ed25519KeyHash;
  static new(addr_keyhash: Ed25519KeyHash): ScriptPubkey;
}

export declare class ScriptRef {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): ScriptRef;
  to_hex(): string;
  static from_hex(hex_str: string): ScriptRef;
  to_json(): string;
  static from_json(json: string): ScriptRef;
  static new_native_script(native_script: NativeScript): ScriptRef;
  static new_plutus_script(plutus_script: PlutusScript): ScriptRef;
  is_native_script(): boolean;
  is_plutus_script(): boolean;
  native_script(): NativeScript;
  plutus_script(): PlutusScript;
  to_unwrapped_bytes(): Uint8Array;
}

export declare class SingleHostAddr {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): SingleHostAddr;
  to_hex(): string;
  static from_hex(hex_str: string): SingleHostAddr;
  to_json(): string;
  static from_json(json: string): SingleHostAddr;
  port(): number;
  ipv4(): Ipv4;
  ipv6(): Ipv6;
  static new(port?: number, ipv4?: Ipv4, ipv6?: Ipv6): SingleHostAddr;
}

export declare class SingleHostName {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): SingleHostName;
  to_hex(): string;
  static from_hex(hex_str: string): SingleHostName;
  to_json(): string;
  static from_json(json: string): SingleHostName;
  port(): number;
  dns_name(): DNSRecordAorAAAA;
  static new(port: number | undefined, dns_name: DNSRecordAorAAAA): SingleHostName;
}

export declare class StakeAndVoteDelegation {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): StakeAndVoteDelegation;
  to_hex(): string;
  static from_hex(hex_str: string): StakeAndVoteDelegation;
  to_json(): string;
  static from_json(json: string): StakeAndVoteDelegation;
  stake_credential(): Credential;
  pool_keyhash(): Ed25519KeyHash;
  drep(): DRep;
  static new(stake_credential: Credential, pool_keyhash: Ed25519KeyHash, drep: DRep): StakeAndVoteDelegation;
  has_script_credentials(): boolean;
}

export declare class StakeDelegation {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): StakeDelegation;
  to_hex(): string;
  static from_hex(hex_str: string): StakeDelegation;
  to_json(): string;
  static from_json(json: string): StakeDelegation;
  stake_credential(): Credential;
  pool_keyhash(): Ed25519KeyHash;
  static new(stake_credential: Credential, pool_keyhash: Ed25519KeyHash): StakeDelegation;
  has_script_credentials(): boolean;
}

export declare class StakeDeregistration {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): StakeDeregistration;
  to_hex(): string;
  static from_hex(hex_str: string): StakeDeregistration;
  to_json(): string;
  static from_json(json: string): StakeDeregistration;
  stake_credential(): Credential;
  coin(): BigNum;
  static new(stake_credential: Credential): StakeDeregistration;
  static new_with_explicit_refund(stake_credential: Credential, coin: BigNum): StakeDeregistration;
  has_script_credentials(): boolean;
}

export declare class StakeRegistration {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): StakeRegistration;
  to_hex(): string;
  static from_hex(hex_str: string): StakeRegistration;
  to_json(): string;
  static from_json(json: string): StakeRegistration;
  stake_credential(): Credential;
  coin(): BigNum;
  static new(stake_credential: Credential): StakeRegistration;
  static new_with_explicit_deposit(stake_credential: Credential, coin: BigNum): StakeRegistration;
  has_script_credentials(): boolean;
}

export declare class StakeRegistrationAndDelegation {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): StakeRegistrationAndDelegation;
  to_hex(): string;
  static from_hex(hex_str: string): StakeRegistrationAndDelegation;
  to_json(): string;
  static from_json(json: string): StakeRegistrationAndDelegation;
  stake_credential(): Credential;
  pool_keyhash(): Ed25519KeyHash;
  coin(): BigNum;
  static new(stake_credential: Credential, pool_keyhash: Ed25519KeyHash, coin: BigNum): StakeRegistrationAndDelegation;
  has_script_credentials(): boolean;
}

export declare class StakeVoteRegistrationAndDelegation {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): StakeVoteRegistrationAndDelegation;
  to_hex(): string;
  static from_hex(hex_str: string): StakeVoteRegistrationAndDelegation;
  to_json(): string;
  static from_json(json: string): StakeVoteRegistrationAndDelegation;
  stake_credential(): Credential;
  pool_keyhash(): Ed25519KeyHash;
  drep(): DRep;
  coin(): BigNum;
  static new(stake_credential: Credential, pool_keyhash: Ed25519KeyHash, drep: DRep, coin: BigNum): StakeVoteRegistrationAndDelegation;
  has_script_credentials(): boolean;
}

export declare class Strings {
  static new(): Strings;
  len(): number;
  get(index: number): string;
  add(elem: string): void;
}

export declare class TimelockExpiry {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TimelockExpiry;
  to_hex(): string;
  static from_hex(hex_str: string): TimelockExpiry;
  to_json(): string;
  static from_json(json: string): TimelockExpiry;
  slot(): number;
  slot_bignum(): BigNum;
  static new(slot: number): TimelockExpiry;
  static new_timelockexpiry(slot: BigNum): TimelockExpiry;
}

export declare class TimelockStart {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TimelockStart;
  to_hex(): string;
  static from_hex(hex_str: string): TimelockStart;
  to_json(): string;
  static from_json(json: string): TimelockStart;
  slot(): number;
  slot_bignum(): BigNum;
  static new(slot: number): TimelockStart;
  static new_timelockstart(slot: BigNum): TimelockStart;
}

export declare class Transaction {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Transaction;
  to_hex(): string;
  static from_hex(hex_str: string): Transaction;
  to_json(): string;
  static from_json(json: string): Transaction;
  body(): TransactionBody;
  witness_set(): TransactionWitnessSet;
  is_valid(): boolean;
  auxiliary_data(): AuxiliaryData;
  set_is_valid(valid: boolean): void;
  static new(body: TransactionBody, witness_set: TransactionWitnessSet, auxiliary_data?: AuxiliaryData): Transaction;
}

export declare class TransactionBatch {
  len(): number;
  get(index: number): Transaction;
}

export declare class TransactionBatchList {
  len(): number;
  get(index: number): TransactionBatch;
}

export declare class TransactionBodies {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionBodies;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionBodies;
  to_json(): string;
  static from_json(json: string): TransactionBodies;
  static new(): TransactionBodies;
  len(): number;
  get(index: number): TransactionBody;
  add(elem: TransactionBody): void;
}

export declare class TransactionBody {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionBody;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionBody;
  to_json(): string;
  static from_json(json: string): TransactionBody;
  inputs(): TransactionInputs;
  outputs(): TransactionOutputs;
  fee(): BigNum;
  ttl(): number;
  ttl_bignum(): BigNum;
  set_ttl(ttl: BigNum): void;
  remove_ttl(): void;
  set_certs(certs: Certificates): void;
  certs(): Certificates;
  set_withdrawals(withdrawals: Withdrawals): void;
  withdrawals(): Withdrawals;
  set_update(update: Update): void;
  update(): Update;
  set_auxiliary_data_hash(auxiliary_data_hash: AuxiliaryDataHash): void;
  auxiliary_data_hash(): AuxiliaryDataHash;
  set_validity_start_interval(validity_start_interval: number): void;
  set_validity_start_interval_bignum(validity_start_interval: BigNum): void;
  validity_start_interval_bignum(): BigNum;
  validity_start_interval(): number;
  set_mint(mint: Mint): void;
  mint(): Mint;
  set_reference_inputs(reference_inputs: TransactionInputs): void;
  reference_inputs(): TransactionInputs;
  set_script_data_hash(script_data_hash: ScriptDataHash): void;
  script_data_hash(): ScriptDataHash;
  set_collateral(collateral: TransactionInputs): void;
  collateral(): TransactionInputs;
  set_required_signers(required_signers: Ed25519KeyHashes): void;
  required_signers(): Ed25519KeyHashes;
  set_network_id(network_id: NetworkId): void;
  network_id(): NetworkId;
  set_collateral_return(collateral_return: TransactionOutput): void;
  collateral_return(): TransactionOutput;
  set_total_collateral(total_collateral: BigNum): void;
  total_collateral(): BigNum;
  set_voting_procedures(voting_procedures: VotingProcedures): void;
  voting_procedures(): VotingProcedures;
  set_voting_proposals(voting_proposals: VotingProposals): void;
  voting_proposals(): VotingProposals;
  set_donation(donation: BigNum): void;
  donation(): BigNum;
  set_current_treasury_value(current_treasury_value: BigNum): void;
  current_treasury_value(): BigNum;
  static new(inputs: TransactionInputs, outputs: TransactionOutputs, fee: BigNum, ttl?: number): TransactionBody;
  static new_tx_body(inputs: TransactionInputs, outputs: TransactionOutputs, fee: BigNum): TransactionBody;
}

export declare class TransactionBuilder {
  add_inputs_from(inputs: TransactionUnspentOutputs, strategy: number): void;
  set_inputs(inputs: TxInputsBuilder): void;
  set_collateral(collateral: TxInputsBuilder): void;
  set_collateral_return(collateral_return: TransactionOutput): void;
  remove_collateral_return(): void;
  set_collateral_return_and_total(collateral_return: TransactionOutput): void;
  set_total_collateral(total_collateral: BigNum): void;
  remove_total_collateral(): void;
  set_total_collateral_and_return(total_collateral: BigNum, return_address: Address): void;
  add_reference_input(reference_input: TransactionInput): void;
  add_script_reference_input(reference_input: TransactionInput, script_size: number): void;
  add_key_input(hash: Ed25519KeyHash, input: TransactionInput, amount: Value): void;
  add_native_script_input(script: NativeScript, input: TransactionInput, amount: Value): void;
  add_plutus_script_input(witness: PlutusWitness, input: TransactionInput, amount: Value): void;
  add_bootstrap_input(hash: ByronAddress, input: TransactionInput, amount: Value): void;
  add_regular_input(address: Address, input: TransactionInput, amount: Value): void;
  add_inputs_from_and_change(inputs: TransactionUnspentOutputs, strategy: number, change_config: ChangeConfig): boolean;
  add_inputs_from_and_change_with_collateral_return(inputs: TransactionUnspentOutputs, strategy: number, change_config: ChangeConfig, collateral_percentage: BigNum): void;
  get_native_input_scripts(): NativeScripts;
  get_plutus_input_scripts(): PlutusWitnesses;
  fee_for_input(address: Address, input: TransactionInput, amount: Value): BigNum;
  add_output(output: TransactionOutput): void;
  fee_for_output(output: TransactionOutput): BigNum;
  set_fee(fee: BigNum): void;
  set_min_fee(fee: BigNum): void;
  set_ttl(ttl: number): void;
  set_ttl_bignum(ttl: BigNum): void;
  remove_ttl(): void;
  set_validity_start_interval(validity_start_interval: number): void;
  set_validity_start_interval_bignum(validity_start_interval: BigNum): void;
  remove_validity_start_interval(): void;
  set_certs(certs: Certificates): void;
  remove_certs(): void;
  set_certs_builder(certs: CertificatesBuilder): void;
  set_withdrawals(withdrawals: Withdrawals): void;
  set_withdrawals_builder(withdrawals: WithdrawalsBuilder): void;
  set_voting_builder(voting_builder: VotingBuilder): void;
  set_voting_proposal_builder(voting_proposal_builder: VotingProposalBuilder): void;
  remove_withdrawals(): void;
  get_auxiliary_data(): AuxiliaryData;
  set_auxiliary_data(auxiliary_data: AuxiliaryData): void;
  remove_auxiliary_data(): void;
  set_metadata(metadata: GeneralTransactionMetadata): void;
  add_metadatum(key: BigNum, val: TransactionMetadatum): void;
  add_json_metadatum(key: BigNum, val: string): void;
  add_json_metadatum_with_schema(key: BigNum, val: string, schema: number): void;
  set_mint_builder(mint_builder: MintBuilder): void;
  remove_mint_builder(): void;
  get_mint_builder(): MintBuilder;
  set_mint(mint: Mint, mint_scripts: NativeScripts): void;
  get_mint(): Mint;
  get_mint_scripts(): NativeScripts;
  set_mint_asset(policy_script: NativeScript, mint_assets: MintAssets): void;
  add_mint_asset(policy_script: NativeScript, asset_name: AssetName, amount: Int): void;
  add_mint_asset_and_output(policy_script: NativeScript, asset_name: AssetName, amount: Int, output_builder: TransactionOutputAmountBuilder, output_coin: BigNum): void;
  add_mint_asset_and_output_min_required_coin(policy_script: NativeScript, asset_name: AssetName, amount: Int, output_builder: TransactionOutputAmountBuilder): void;
  add_extra_witness_datum(datum: PlutusData): void;
  get_extra_witness_datums(): PlutusList;
  set_donation(donation: BigNum): void;
  get_donation(): BigNum;
  set_current_treasury_value(current_treasury_value: BigNum): void;
  get_current_treasury_value(): BigNum;
  static new(cfg: TransactionBuilderConfig): TransactionBuilder;
  get_reference_inputs(): TransactionInputs;
  get_explicit_input(): Value;
  get_implicit_input(): Value;
  get_total_input(): Value;
  get_total_output(): Value;
  get_explicit_output(): Value;
  get_deposit(): BigNum;
  get_fee_if_set(): BigNum;
  add_change_if_needed(address: Address): boolean;
  add_change_if_needed_with_datum(address: Address, plutus_data: OutputDatum): boolean;
  calc_script_data_hash(cost_models: Costmdls): void;
  set_script_data_hash(hash: ScriptDataHash): void;
  remove_script_data_hash(): void;
  add_required_signer(key: Ed25519KeyHash): void;
  full_size(): number;
  output_sizes(): string;
  build(): TransactionBody;
  build_tx(): Transaction;
  build_tx_unsafe(): Transaction;
  min_fee(): BigNum;
}

export declare class TransactionBuilderConfig {
  // No methods available
}

export declare class TransactionBuilderConfigBuilder {
  static new(): TransactionBuilderConfigBuilder;
  fee_algo(fee_algo: LinearFee): TransactionBuilderConfigBuilder;
  coins_per_utxo_byte(coins_per_utxo_byte: BigNum): TransactionBuilderConfigBuilder;
  ex_unit_prices(ex_unit_prices: ExUnitPrices): TransactionBuilderConfigBuilder;
  pool_deposit(pool_deposit: BigNum): TransactionBuilderConfigBuilder;
  key_deposit(key_deposit: BigNum): TransactionBuilderConfigBuilder;
  max_value_size(max_value_size: number): TransactionBuilderConfigBuilder;
  max_tx_size(max_tx_size: number): TransactionBuilderConfigBuilder;
  ref_script_coins_per_byte(ref_script_coins_per_byte: UnitInterval): TransactionBuilderConfigBuilder;
  prefer_pure_change(prefer_pure_change: boolean): TransactionBuilderConfigBuilder;
  deduplicate_explicit_ref_inputs_with_regular_inputs(deduplicate_explicit_ref_inputs_with_regular_inputs: boolean): TransactionBuilderConfigBuilder;
  do_not_burn_extra_change(do_not_burn_extra_change: boolean): TransactionBuilderConfigBuilder;
  build(): TransactionBuilderConfig;
}

export declare class TransactionHash {
  static from_bytes(bytes: Uint8Array): TransactionHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): TransactionHash;
  to_hex(): string;
  static from_hex(hex: string): TransactionHash;
}

export declare class TransactionInput {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionInput;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionInput;
  to_json(): string;
  static from_json(json: string): TransactionInput;
  transaction_id(): TransactionHash;
  index(): number;
  static new(transaction_id: TransactionHash, index: number): TransactionInput;
}

export declare class TransactionInputs {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionInputs;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionInputs;
  to_json(): string;
  static from_json(json: string): TransactionInputs;
  static new(): TransactionInputs;
  len(): number;
  get(index: number): TransactionInput;
  add(input: TransactionInput): boolean;
  to_option(): TransactionInputs;
}

export declare class TransactionMetadatum {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionMetadatum;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionMetadatum;
  static new_map(map: MetadataMap): TransactionMetadatum;
  static new_list(list: MetadataList): TransactionMetadatum;
  static new_int(int_value: Int): TransactionMetadatum;
  static new_bytes(bytes: Uint8Array): TransactionMetadatum;
  static new_text(text: string): TransactionMetadatum;
  kind(): number;
  as_map(): MetadataMap;
  as_list(): MetadataList;
  as_int(): number;
  as_bytes(): Uint8Array;
  as_text(): string;
}

export declare class TransactionMetadatumLabels {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionMetadatumLabels;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionMetadatumLabels;
  static new(): TransactionMetadatumLabels;
  len(): number;
  get(index: number): BigNum;
  add(elem: BigNum): void;
}

export declare class TransactionOutput {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionOutput;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionOutput;
  to_json(): string;
  static from_json(json: string): TransactionOutput;
  address(): Address;
  amount(): Value;
  data_hash(): DataHash;
  plutus_data(): PlutusData;
  script_ref(): ScriptRef;
  set_script_ref(script_ref: ScriptRef): void;
  set_plutus_data(data: PlutusData): void;
  set_data_hash(data_hash: DataHash): void;
  has_plutus_data(): boolean;
  has_data_hash(): boolean;
  has_script_ref(): boolean;
  static new(address: Address, amount: Value): TransactionOutput;
  serialization_format(): number;
}

export declare class TransactionOutputAmountBuilder {
  with_value(amount: Value): TransactionOutputAmountBuilder;
  with_coin(coin: BigNum): TransactionOutputAmountBuilder;
  with_coin_and_asset(coin: BigNum, multiasset: MultiAsset): TransactionOutputAmountBuilder;
  with_asset_and_min_required_coin_by_utxo_cost(multiasset: MultiAsset, data_cost: DataCost): TransactionOutputAmountBuilder;
  build(): TransactionOutput;
}

export declare class TransactionOutputBuilder {
  static new(): TransactionOutputBuilder;
  with_address(address: Address): TransactionOutputBuilder;
  with_data_hash(data_hash: DataHash): TransactionOutputBuilder;
  with_plutus_data(data: PlutusData): TransactionOutputBuilder;
  with_script_ref(script_ref: ScriptRef): TransactionOutputBuilder;
  next(): TransactionOutputAmountBuilder;
}

export declare class TransactionOutputs {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionOutputs;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionOutputs;
  to_json(): string;
  static from_json(json: string): TransactionOutputs;
  static new(): TransactionOutputs;
  len(): number;
  get(index: number): TransactionOutput;
  add(elem: TransactionOutput): void;
}

export declare class TransactionUnspentOutput {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionUnspentOutput;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionUnspentOutput;
  to_json(): string;
  static from_json(json: string): TransactionUnspentOutput;
  static new(input: TransactionInput, output: TransactionOutput): TransactionUnspentOutput;
  input(): TransactionInput;
  output(): TransactionOutput;
}

export declare class TransactionUnspentOutputs {
  to_json(): string;
  static from_json(json: string): TransactionUnspentOutputs;
  static new(): TransactionUnspentOutputs;
  len(): number;
  get(index: number): TransactionUnspentOutput;
  add(elem: TransactionUnspentOutput): void;
}

export declare class TransactionWitnessSet {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionWitnessSet;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionWitnessSet;
  to_json(): string;
  static from_json(json: string): TransactionWitnessSet;
  set_vkeys(vkeys: Vkeywitnesses): void;
  vkeys(): Vkeywitnesses;
  set_native_scripts(native_scripts: NativeScripts): void;
  native_scripts(): NativeScripts;
  set_bootstraps(bootstraps: BootstrapWitnesses): void;
  bootstraps(): BootstrapWitnesses;
  set_plutus_scripts(plutus_scripts: PlutusScripts): void;
  plutus_scripts(): PlutusScripts;
  set_plutus_data(plutus_data: PlutusList): void;
  plutus_data(): PlutusList;
  set_redeemers(redeemers: Redeemers): void;
  redeemers(): Redeemers;
  static new(): TransactionWitnessSet;
}

export declare class TransactionWitnessSets {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TransactionWitnessSets;
  to_hex(): string;
  static from_hex(hex_str: string): TransactionWitnessSets;
  to_json(): string;
  static from_json(json: string): TransactionWitnessSets;
  static new(): TransactionWitnessSets;
  len(): number;
  get(index: number): TransactionWitnessSet;
  add(elem: TransactionWitnessSet): void;
}

export declare class TreasuryWithdrawals {
  to_json(): string;
  static from_json(json: string): TreasuryWithdrawals;
  static new(): TreasuryWithdrawals;
  get(key: RewardAddress): BigNum;
  insert(key: RewardAddress, value: BigNum): void;
  keys(): RewardAddresses;
  len(): number;
}

export declare class TreasuryWithdrawalsAction {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): TreasuryWithdrawalsAction;
  to_hex(): string;
  static from_hex(hex_str: string): TreasuryWithdrawalsAction;
  to_json(): string;
  static from_json(json: string): TreasuryWithdrawalsAction;
  withdrawals(): TreasuryWithdrawals;
  policy_hash(): ScriptHash;
  static new(withdrawals: TreasuryWithdrawals): TreasuryWithdrawalsAction;
  static new_with_policy_hash(withdrawals: TreasuryWithdrawals, policy_hash: ScriptHash): TreasuryWithdrawalsAction;
}

export declare class TxInputsBuilder {
  static new(): TxInputsBuilder;
  add_regular_utxo(utxo: TransactionUnspentOutput): void;
  add_plutus_script_utxo(utxo: TransactionUnspentOutput, witness: PlutusWitness): void;
  add_native_script_utxo(utxo: TransactionUnspentOutput, witness: NativeScriptSource): void;
  add_key_input(hash: Ed25519KeyHash, input: TransactionInput, amount: Value): void;
  add_native_script_input(script: NativeScriptSource, input: TransactionInput, amount: Value): void;
  add_plutus_script_input(witness: PlutusWitness, input: TransactionInput, amount: Value): void;
  add_bootstrap_input(address: ByronAddress, input: TransactionInput, amount: Value): void;
  add_regular_input(address: Address, input: TransactionInput, amount: Value): void;
  get_ref_inputs(): TransactionInputs;
  get_native_input_scripts(): NativeScripts;
  get_plutus_input_scripts(): PlutusWitnesses;
  len(): number;
  add_required_signer(key: Ed25519KeyHash): void;
  add_required_signers(keys: Ed25519KeyHashes): void;
  total_value(): Value;
  inputs(): TransactionInputs;
  inputs_option(): TransactionInputs;
}

export declare class URL {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): URL;
  to_hex(): string;
  static from_hex(hex_str: string): URL;
  to_json(): string;
  static from_json(json: string): URL;
  static new(url: string): URL;
  url(): string;
}

export declare class UnitInterval {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): UnitInterval;
  to_hex(): string;
  static from_hex(hex_str: string): UnitInterval;
  to_json(): string;
  static from_json(json: string): UnitInterval;
  numerator(): BigNum;
  denominator(): BigNum;
  static new(numerator: BigNum, denominator: BigNum): UnitInterval;
}

export declare class Update {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Update;
  to_hex(): string;
  static from_hex(hex_str: string): Update;
  to_json(): string;
  static from_json(json: string): Update;
  proposed_protocol_parameter_updates(): ProposedProtocolParameterUpdates;
  epoch(): number;
  static new(proposed_protocol_parameter_updates: ProposedProtocolParameterUpdates, epoch: number): Update;
}

export declare class UpdateCommitteeAction {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): UpdateCommitteeAction;
  to_hex(): string;
  static from_hex(hex_str: string): UpdateCommitteeAction;
  to_json(): string;
  static from_json(json: string): UpdateCommitteeAction;
  gov_action_id(): GovernanceActionId;
  committee(): Committee;
  members_to_remove(): Credentials;
  static new(committee: Committee, members_to_remove: Credentials): UpdateCommitteeAction;
  static new_with_action_id(gov_action_id: GovernanceActionId, committee: Committee, members_to_remove: Credentials): UpdateCommitteeAction;
}

export declare class VRFCert {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): VRFCert;
  to_hex(): string;
  static from_hex(hex_str: string): VRFCert;
  to_json(): string;
  static from_json(json: string): VRFCert;
  output(): Uint8Array;
  proof(): Uint8Array;
  static new(output: Uint8Array, proof: Uint8Array): VRFCert;
}

export declare class VRFKeyHash {
  static from_bytes(bytes: Uint8Array): VRFKeyHash;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): VRFKeyHash;
  to_hex(): string;
  static from_hex(hex: string): VRFKeyHash;
}

export declare class VRFVKey {
  static from_bytes(bytes: Uint8Array): VRFVKey;
  to_bytes(): Uint8Array;
  to_bech32(prefix: string): string;
  static from_bech32(bech_str: string): VRFVKey;
  to_hex(): string;
  static from_hex(hex: string): VRFVKey;
}

export declare class Value {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Value;
  to_hex(): string;
  static from_hex(hex_str: string): Value;
  to_json(): string;
  static from_json(json: string): Value;
  static new(coin: BigNum): Value;
  static new_from_assets(multiasset: MultiAsset): Value;
  static new_with_assets(coin: BigNum, multiasset: MultiAsset): Value;
  static zero(): Value;
  is_zero(): boolean;
  coin(): BigNum;
  set_coin(coin: BigNum): void;
  multiasset(): MultiAsset;
  set_multiasset(multiasset: MultiAsset): void;
  checked_add(rhs: Value): Value;
  checked_sub(rhs_value: Value): Value;
  clamped_sub(rhs_value: Value): Value;
  compare(rhs_value: Value): number;
}

export declare class VersionedBlock {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): VersionedBlock;
  to_hex(): string;
  static from_hex(hex_str: string): VersionedBlock;
  to_json(): string;
  static from_json(json: string): VersionedBlock;
  static new(block: Block, era_code: number): VersionedBlock;
  block(): Block;
  era(): number;
}

export declare class Vkey {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Vkey;
  to_hex(): string;
  static from_hex(hex_str: string): Vkey;
  to_json(): string;
  static from_json(json: string): Vkey;
  static new(pk: PublicKey): Vkey;
  public_key(): PublicKey;
}

export declare class Vkeys {
  static new(): Vkeys;
  len(): number;
  get(index: number): Vkey;
  add(elem: Vkey): void;
}

export declare class Vkeywitness {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Vkeywitness;
  to_hex(): string;
  static from_hex(hex_str: string): Vkeywitness;
  to_json(): string;
  static from_json(json: string): Vkeywitness;
  static new(vkey: Vkey, signature: Ed25519Signature): Vkeywitness;
  vkey(): Vkey;
  signature(): Ed25519Signature;
}

export declare class Vkeywitnesses {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Vkeywitnesses;
  to_hex(): string;
  static from_hex(hex_str: string): Vkeywitnesses;
  to_json(): string;
  static from_json(json: string): Vkeywitnesses;
  static new(): Vkeywitnesses;
  len(): number;
  get(index: number): Vkeywitness;
  add(witness: Vkeywitness): boolean;
}

export declare class VoteDelegation {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): VoteDelegation;
  to_hex(): string;
  static from_hex(hex_str: string): VoteDelegation;
  to_json(): string;
  static from_json(json: string): VoteDelegation;
  stake_credential(): Credential;
  drep(): DRep;
  static new(stake_credential: Credential, drep: DRep): VoteDelegation;
  has_script_credentials(): boolean;
}

export declare class VoteRegistrationAndDelegation {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): VoteRegistrationAndDelegation;
  to_hex(): string;
  static from_hex(hex_str: string): VoteRegistrationAndDelegation;
  to_json(): string;
  static from_json(json: string): VoteRegistrationAndDelegation;
  stake_credential(): Credential;
  drep(): DRep;
  coin(): BigNum;
  static new(stake_credential: Credential, drep: DRep, coin: BigNum): VoteRegistrationAndDelegation;
  has_script_credentials(): boolean;
}

export declare class Voter {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Voter;
  to_hex(): string;
  static from_hex(hex_str: string): Voter;
  to_json(): string;
  static from_json(json: string): Voter;
  static new_constitutional_committee_hot_credential(cred: Credential): Voter;
  static new_drep_credential(cred: Credential): Voter;
  static new_stake_pool_key_hash(key_hash: Ed25519KeyHash): Voter;
  kind(): number;
  to_constitutional_committee_hot_credential(): Credential;
  to_drep_credential(): Credential;
  to_stake_pool_key_hash(): Ed25519KeyHash;
  has_script_credentials(): boolean;
  to_key_hash(): Ed25519KeyHash;
}

export declare class Voters {
  to_json(): string;
  static from_json(json: string): Voters;
  static new(): Voters;
  add(voter: Voter): void;
  get(index: number): Voter;
  len(): number;
}

export declare class VotingBuilder {
  static new(): VotingBuilder;
  add(voter: Voter, gov_action_id: GovernanceActionId, voting_procedure: VotingProcedure): void;
  add_with_plutus_witness(voter: Voter, gov_action_id: GovernanceActionId, voting_procedure: VotingProcedure, witness: PlutusWitness): void;
  add_with_native_script(voter: Voter, gov_action_id: GovernanceActionId, voting_procedure: VotingProcedure, native_script_source: NativeScriptSource): void;
  get_plutus_witnesses(): PlutusWitnesses;
  get_ref_inputs(): TransactionInputs;
  get_native_scripts(): NativeScripts;
  has_plutus_scripts(): boolean;
  build(): VotingProcedures;
}

export declare class VotingProcedure {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): VotingProcedure;
  to_hex(): string;
  static from_hex(hex_str: string): VotingProcedure;
  to_json(): string;
  static from_json(json: string): VotingProcedure;
  static new(vote: number): VotingProcedure;
  static new_with_anchor(vote: number, anchor: Anchor): VotingProcedure;
  vote_kind(): number;
  anchor(): Anchor;
}

export declare class VotingProcedures {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): VotingProcedures;
  to_hex(): string;
  static from_hex(hex_str: string): VotingProcedures;
  to_json(): string;
  static from_json(json: string): VotingProcedures;
  static new(): VotingProcedures;
  insert(voter: Voter, governance_action_id: GovernanceActionId, voting_procedure: VotingProcedure): void;
  get(voter: Voter, governance_action_id: GovernanceActionId): VotingProcedure;
  get_voters(): Voters;
  get_governance_action_ids_by_voter(voter: Voter): GovernanceActionIds;
}

export declare class VotingProposal {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): VotingProposal;
  to_hex(): string;
  static from_hex(hex_str: string): VotingProposal;
  to_json(): string;
  static from_json(json: string): VotingProposal;
  governance_action(): GovernanceAction;
  anchor(): Anchor;
  reward_account(): RewardAddress;
  deposit(): BigNum;
  static new(governance_action: GovernanceAction, anchor: Anchor, reward_account: RewardAddress, deposit: BigNum): VotingProposal;
}

export declare class VotingProposalBuilder {
  static new(): VotingProposalBuilder;
  add(proposal: VotingProposal): void;
  add_with_plutus_witness(proposal: VotingProposal, witness: PlutusWitness): void;
  get_plutus_witnesses(): PlutusWitnesses;
  get_ref_inputs(): TransactionInputs;
  has_plutus_scripts(): boolean;
  build(): VotingProposals;
}

export declare class VotingProposals {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): VotingProposals;
  to_hex(): string;
  static from_hex(hex_str: string): VotingProposals;
  to_json(): string;
  static from_json(json: string): VotingProposals;
  static new(): VotingProposals;
  len(): number;
  get(index: number): VotingProposal;
  add(proposal: VotingProposal): boolean;
  contains(elem: VotingProposal): boolean;
  to_option(): VotingProposals;
}

export declare class Withdrawals {
  to_bytes(): Uint8Array;
  static from_bytes(bytes: Uint8Array): Withdrawals;
  to_hex(): string;
  static from_hex(hex_str: string): Withdrawals;
  to_json(): string;
  static from_json(json: string): Withdrawals;
  static new(): Withdrawals;
  len(): number;
  insert(key: RewardAddress, value: BigNum): BigNum;
  get(key: RewardAddress): BigNum;
  keys(): RewardAddresses;
}

export declare class WithdrawalsBuilder {
  static new(): WithdrawalsBuilder;
  add(address: RewardAddress, coin: BigNum): void;
  add_with_plutus_witness(address: RewardAddress, coin: BigNum, witness: PlutusWitness): void;
  add_with_native_script(address: RewardAddress, coin: BigNum, native_script_source: NativeScriptSource): void;
  get_plutus_witnesses(): PlutusWitnesses;
  get_ref_inputs(): TransactionInputs;
  get_native_scripts(): NativeScripts;
  get_total_withdrawals(): Value;
  has_plutus_scripts(): boolean;
  build(): Withdrawals;
}

// Standalone functions
export declare function calculate_ex_units_ceil_cost(ex_units: ExUnits, ex_unit_prices: ExUnitPrices): BigNum;
export declare function create_send_all(address: Address, utxos: TransactionUnspentOutputs, config: TransactionBuilderConfig): TransactionBatchList;
export declare function decode_arbitrary_bytes_from_metadatum(metadata: TransactionMetadatum): Uint8Array;
export declare function decode_metadatum_to_json_str(metadatum: TransactionMetadatum, schema: number): string;
export declare function decode_plutus_datum_to_json_str(datum: PlutusData, schema: number): string;
export declare function decrypt_with_password(password: string, data: string): string;
export declare function encode_arbitrary_bytes_as_metadatum(bytes: Uint8Array): TransactionMetadatum;
export declare function encode_json_str_to_metadatum(json: string, schema: number): TransactionMetadatum;
export declare function encode_json_str_to_native_script(json: string, self_xpub: string, schema: number): NativeScript;
export declare function encode_json_str_to_plutus_datum(json: string, schema: number): PlutusData;
export declare function encrypt_with_password(password: string, salt: string, nonce: string, data: string): string;
export declare function get_deposit(txbody: TransactionBody, pool_deposit: BigNum, key_deposit: BigNum): BigNum;
export declare function get_implicit_input(txbody: TransactionBody, pool_deposit: BigNum, key_deposit: BigNum): Value;
export declare function has_transaction_set_tag(tx_bytes: Uint8Array): number;
export declare function hash_auxiliary_data(auxiliary_data: AuxiliaryData): AuxiliaryDataHash;
export declare function hash_plutus_data(plutus_data: PlutusData): DataHash;
export declare function hash_script_data(redeemers: Redeemers, cost_models: Costmdls, datums?: PlutusList): ScriptDataHash;
export declare function make_daedalus_bootstrap_witness(tx_body_hash: TransactionHash, addr: ByronAddress, key: LegacyDaedalusPrivateKey): BootstrapWitness;
export declare function make_icarus_bootstrap_witness(tx_body_hash: TransactionHash, addr: ByronAddress, key: Bip32PrivateKey): BootstrapWitness;
export declare function make_vkey_witness(tx_body_hash: TransactionHash, sk: PrivateKey): Vkeywitness;
export declare function min_ada_for_output(output: TransactionOutput, data_cost: DataCost): BigNum;
export declare function min_fee(tx: Transaction, linear_fee: LinearFee): BigNum;
export declare function min_ref_script_fee(total_ref_scripts_size: number, ref_script_coins_per_byte: UnitInterval): BigNum;
export declare function min_script_fee(tx: Transaction, ex_unit_prices: ExUnitPrices): BigNum;