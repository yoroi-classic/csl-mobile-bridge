/* eslint-disable max-len */
import CslMobileBridge from './NativeCslMobileBridge';
import { decode as base64_decode, encode as base64_encode } from 'base-64';

export type Optional<T> = T | undefined;

function uint8ArrayFromB64(base64_string: string): Uint8Array {
  return Uint8Array.from(base64_decode(base64_string), c => c.charCodeAt(0));
}

function b64FromUint8Array(uint8Array: Uint8Array): string {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return base64_encode(String.fromCharCode.apply(null, uint8Array));
}

function uint32ArrayToBase64(uint32Array: Uint32Array): string {
  const uint8Array = new Uint8Array(uint32Array.length * 4);
  const dataView = new DataView(uint8Array.buffer);
  for (const [i, uint32] of uint32Array.entries()) {
    dataView.setUint32(i * 4, uint32, true);
  }
  return b64FromUint8Array(uint8Array);
}

function base64ToUint32Array(base64String: string): Uint32Array {
  const uint8Array = uint8ArrayFromB64(base64String);
  const dataView = new DataView(uint8Array.buffer);
  const uint32Array = new Uint32Array(uint8Array.length / 4);
  for (let i = 0; i < uint32Array.length; i++) {
    uint32Array[i] = dataView.getUint32(i * 4, true);
  }
  return uint32Array;
}

class Ptr {
  ptr: string;
  static _wrap(ptr: string | undefined, klass: typeof Ptr): any {
    if (ptr === '0' || ptr == null) {
      return undefined;
    }
    const obj = Object.create(klass.prototype);
    obj.ptr = ptr;
    return obj;
  }

  static _assertClass(obj: any, klass: typeof Ptr): string {
    if (!(obj instanceof klass)) {
      throw new Error(`expected instance of ${klass.name}`);
    }
    return obj.ptr;
  }

  static _assertOptionalClass(obj: any, klass: typeof Ptr): Optional<string> {
    if (obj == null) {
      return obj;
    }
    if (!(obj instanceof klass)) {
      throw new Error(`expected instance of ${klass.name}`);
    }
    return obj.ptr;
  }

  constructor() {
    throw new Error("Can't be initialized with constructor");
  }

  /**
   * Frees the pointer
   * @returns {Promise<void>}
   */
  free() {
    if (!this.ptr) {
      return;
    }
    const ptr = this.ptr;
    this.ptr = '0';
    CslMobileBridge.csl_bridge_ptr_free_jsi(ptr);
  }
}

export const init = () => {
  CslMobileBridge.csl_bridge_init_jsi();
};

export const calculate_ex_units_ceil_cost = (ex_units: ExUnits, ex_unit_prices: ExUnitPrices): BigNum => {
  const ex_unitsPtr = Ptr._assertClass(ex_units, ExUnits);
  const ex_unit_pricesPtr = Ptr._assertClass(ex_unit_prices, ExUnitPrices);
  const ret = CslMobileBridge.csl_bridge_calculate_ex_units_ceil_cost_jsi(ex_unitsPtr, ex_unit_pricesPtr);
  return Ptr._wrap(ret, BigNum);
};

export const create_send_all = (address: Address, utxos: TransactionUnspentOutputs, config: TransactionBuilderConfig): TransactionBatchList => {
  const addressPtr = Ptr._assertClass(address, Address);
  const utxosPtr = Ptr._assertClass(utxos, TransactionUnspentOutputs);
  const configPtr = Ptr._assertClass(config, TransactionBuilderConfig);
  const ret = CslMobileBridge.csl_bridge_create_send_all_jsi(addressPtr, utxosPtr, configPtr);
  return Ptr._wrap(ret, TransactionBatchList);
};

export const decode_arbitrary_bytes_from_metadatum = (metadata: TransactionMetadatum): Uint8Array => {
  const metadataPtr = Ptr._assertClass(metadata, TransactionMetadatum);
  const ret = CslMobileBridge.csl_bridge_decode_arbitrary_bytes_from_metadatum_jsi(metadataPtr);
  return uint8ArrayFromB64(ret);
};

export const decode_metadatum_to_json_str = (metadatum: TransactionMetadatum, schema: MetadataJsonSchema): string => {
  const metadatumPtr = Ptr._assertClass(metadatum, TransactionMetadatum);
  const ret = CslMobileBridge.csl_bridge_decode_metadatum_to_json_str_jsi(metadatumPtr, schema);
  return ret;
};

export const decode_plutus_datum_to_json_str = (datum: PlutusData, schema: PlutusDatumSchema): string => {
  const datumPtr = Ptr._assertClass(datum, PlutusData);
  const ret = CslMobileBridge.csl_bridge_decode_plutus_datum_to_json_str_jsi(datumPtr, schema);
  return ret;
};

export const decrypt_with_password = (password: string, data: string): string => {
  const ret = CslMobileBridge.csl_bridge_decrypt_with_password_jsi(password, data);
  return ret;
};

export const encode_arbitrary_bytes_as_metadatum = (bytes: Uint8Array): TransactionMetadatum => {
  const ret = CslMobileBridge.csl_bridge_encode_arbitrary_bytes_as_metadatum_jsi(b64FromUint8Array(bytes));
  return Ptr._wrap(ret, TransactionMetadatum);
};

export const encode_json_str_to_metadatum = (json: string, schema: MetadataJsonSchema): TransactionMetadatum => {
  const ret = CslMobileBridge.csl_bridge_encode_json_str_to_metadatum_jsi(json, schema);
  return Ptr._wrap(ret, TransactionMetadatum);
};

export const encode_json_str_to_native_script = (json: string, self_xpub: string, schema: ScriptSchema): NativeScript => {
  const ret = CslMobileBridge.csl_bridge_encode_json_str_to_native_script_jsi(json, self_xpub, schema);
  return Ptr._wrap(ret, NativeScript);
};

export const encode_json_str_to_plutus_datum = (json: string, schema: PlutusDatumSchema): PlutusData => {
  const ret = CslMobileBridge.csl_bridge_encode_json_str_to_plutus_datum_jsi(json, schema);
  return Ptr._wrap(ret, PlutusData);
};

export const encrypt_with_password = (password: string, salt: string, nonce: string, data: string): string => {
  const ret = CslMobileBridge.csl_bridge_encrypt_with_password_jsi(password, salt, nonce, data);
  return ret;
};

export const get_deposit = (txbody: TransactionBody, pool_deposit: BigNum, key_deposit: BigNum): BigNum => {
  const txbodyPtr = Ptr._assertClass(txbody, TransactionBody);
  const pool_depositPtr = Ptr._assertClass(pool_deposit, BigNum);
  const key_depositPtr = Ptr._assertClass(key_deposit, BigNum);
  const ret = CslMobileBridge.csl_bridge_get_deposit_jsi(txbodyPtr, pool_depositPtr, key_depositPtr);
  return Ptr._wrap(ret, BigNum);
};

export const get_implicit_input = (txbody: TransactionBody, pool_deposit: BigNum, key_deposit: BigNum): Value => {
  const txbodyPtr = Ptr._assertClass(txbody, TransactionBody);
  const pool_depositPtr = Ptr._assertClass(pool_deposit, BigNum);
  const key_depositPtr = Ptr._assertClass(key_deposit, BigNum);
  const ret = CslMobileBridge.csl_bridge_get_implicit_input_jsi(txbodyPtr, pool_depositPtr, key_depositPtr);
  return Ptr._wrap(ret, Value);
};

export const has_transaction_set_tag = (tx_bytes: Uint8Array): TransactionSetsState => {
  const ret = CslMobileBridge.csl_bridge_has_transaction_set_tag_jsi(b64FromUint8Array(tx_bytes));
  return ret;
};

export const hash_auxiliary_data = (auxiliary_data: AuxiliaryData): AuxiliaryDataHash => {
  const auxiliary_dataPtr = Ptr._assertClass(auxiliary_data, AuxiliaryData);
  const ret = CslMobileBridge.csl_bridge_hash_auxiliary_data_jsi(auxiliary_dataPtr);
  return Ptr._wrap(ret, AuxiliaryDataHash);
};

export const hash_plutus_data = (plutus_data: PlutusData): DataHash => {
  const plutus_dataPtr = Ptr._assertClass(plutus_data, PlutusData);
  const ret = CslMobileBridge.csl_bridge_hash_plutus_data_jsi(plutus_dataPtr);
  return Ptr._wrap(ret, DataHash);
};

export const hash_script_data = (redeemers: Redeemers, cost_models: Costmdls, datums: Optional<PlutusList>): ScriptDataHash => {
  const redeemersPtr = Ptr._assertClass(redeemers, Redeemers);
  const cost_modelsPtr = Ptr._assertClass(cost_models, Costmdls);
  const datumsPtr = Ptr._assertOptionalClass(datums, PlutusList);
  if(datums == null) {
    const ret = CslMobileBridge.csl_bridge_hash_script_data_jsi(redeemersPtr, cost_modelsPtr);
    return Ptr._wrap(ret, ScriptDataHash);
  }
  if(datums != null) {
    const ret = CslMobileBridge.csl_bridge_hash_script_data_with_datums_jsi(redeemersPtr, cost_modelsPtr, datumsPtr!);
    return Ptr._wrap(ret, ScriptDataHash);
  }
  else {
    throw new Error('Unreachable code. Check the codegen.');
  }
};

export const make_daedalus_bootstrap_witness = (tx_body_hash: TransactionHash, addr: ByronAddress, key: LegacyDaedalusPrivateKey): BootstrapWitness => {
  const tx_body_hashPtr = Ptr._assertClass(tx_body_hash, TransactionHash);
  const addrPtr = Ptr._assertClass(addr, ByronAddress);
  const keyPtr = Ptr._assertClass(key, LegacyDaedalusPrivateKey);
  const ret = CslMobileBridge.csl_bridge_make_daedalus_bootstrap_witness_jsi(tx_body_hashPtr, addrPtr, keyPtr);
  return Ptr._wrap(ret, BootstrapWitness);
};

export const make_icarus_bootstrap_witness = (tx_body_hash: TransactionHash, addr: ByronAddress, key: Bip32PrivateKey): BootstrapWitness => {
  const tx_body_hashPtr = Ptr._assertClass(tx_body_hash, TransactionHash);
  const addrPtr = Ptr._assertClass(addr, ByronAddress);
  const keyPtr = Ptr._assertClass(key, Bip32PrivateKey);
  const ret = CslMobileBridge.csl_bridge_make_icarus_bootstrap_witness_jsi(tx_body_hashPtr, addrPtr, keyPtr);
  return Ptr._wrap(ret, BootstrapWitness);
};

export const make_vkey_witness = (tx_body_hash: TransactionHash, sk: PrivateKey): Vkeywitness => {
  const tx_body_hashPtr = Ptr._assertClass(tx_body_hash, TransactionHash);
  const skPtr = Ptr._assertClass(sk, PrivateKey);
  const ret = CslMobileBridge.csl_bridge_make_vkey_witness_jsi(tx_body_hashPtr, skPtr);
  return Ptr._wrap(ret, Vkeywitness);
};

export const min_ada_for_output = (output: TransactionOutput, data_cost: DataCost): BigNum => {
  const outputPtr = Ptr._assertClass(output, TransactionOutput);
  const data_costPtr = Ptr._assertClass(data_cost, DataCost);
  const ret = CslMobileBridge.csl_bridge_min_ada_for_output_jsi(outputPtr, data_costPtr);
  return Ptr._wrap(ret, BigNum);
};

export const min_fee = (tx: Transaction, linear_fee: LinearFee): BigNum => {
  const txPtr = Ptr._assertClass(tx, Transaction);
  const linear_feePtr = Ptr._assertClass(linear_fee, LinearFee);
  const ret = CslMobileBridge.csl_bridge_min_fee_jsi(txPtr, linear_feePtr);
  return Ptr._wrap(ret, BigNum);
};

export const min_ref_script_fee = (total_ref_scripts_size: number, ref_script_coins_per_byte: UnitInterval): BigNum => {
  const ref_script_coins_per_bytePtr = Ptr._assertClass(ref_script_coins_per_byte, UnitInterval);
  const ret = CslMobileBridge.csl_bridge_min_ref_script_fee_jsi(total_ref_scripts_size, ref_script_coins_per_bytePtr);
  return Ptr._wrap(ret, BigNum);
};

export const min_script_fee = (tx: Transaction, ex_unit_prices: ExUnitPrices): BigNum => {
  const txPtr = Ptr._assertClass(tx, Transaction);
  const ex_unit_pricesPtr = Ptr._assertClass(ex_unit_prices, ExUnitPrices);
  const ret = CslMobileBridge.csl_bridge_min_script_fee_jsi(txPtr, ex_unit_pricesPtr);
  return Ptr._wrap(ret, BigNum);
};

export class Address extends Ptr {
  static from_bytes(data: Uint8Array): Address {
    const ret = CslMobileBridge.csl_bridge_address_from_bytes_jsi(b64FromUint8Array(data));
    return Ptr._wrap(ret, Address);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_address_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Address {
    const ret = CslMobileBridge.csl_bridge_address_from_json_jsi(json);
    return Ptr._wrap(ret, Address);
  }

  kind(): AddressKind {
    const ret = CslMobileBridge.csl_bridge_address_kind_jsi(this.ptr);
    return ret;
  }

  payment_cred(): Optional<Credential> {
    const ret = CslMobileBridge.csl_bridge_address_payment_cred_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  is_malformed(): boolean {
    const ret = CslMobileBridge.csl_bridge_address_is_malformed_jsi(this.ptr);
    return ret;
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_address_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Address {
    const ret = CslMobileBridge.csl_bridge_address_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Address);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_address_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: Optional<string>): string {
    if(prefix == null) {
      const ret = CslMobileBridge.csl_bridge_address_to_bech32_jsi(this.ptr);
      return ret;
    }
    if(prefix != null) {
      const ret = CslMobileBridge.csl_bridge_address_to_bech32_with_prefix_jsi(this.ptr, prefix!);
      return ret;
    }
    else {
      throw new Error('Unreachable code. Check the codegen.');
    }
  }

  static from_bech32(bech_str: string): Address {
    const ret = CslMobileBridge.csl_bridge_address_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, Address);
  }

  network_id(): number {
    const ret = CslMobileBridge.csl_bridge_address_network_id_jsi(this.ptr);
    return ret;
  }

}

export class Anchor extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_anchor_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Anchor {
    const ret = CslMobileBridge.csl_bridge_anchor_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Anchor);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_anchor_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Anchor {
    const ret = CslMobileBridge.csl_bridge_anchor_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Anchor);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_anchor_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Anchor {
    const ret = CslMobileBridge.csl_bridge_anchor_from_json_jsi(json);
    return Ptr._wrap(ret, Anchor);
  }

  url(): URL {
    const ret = CslMobileBridge.csl_bridge_anchor_url_jsi(this.ptr);
    return Ptr._wrap(ret, URL);
  }

  anchor_data_hash(): AnchorDataHash {
    const ret = CslMobileBridge.csl_bridge_anchor_anchor_data_hash_jsi(this.ptr);
    return Ptr._wrap(ret, AnchorDataHash);
  }

  static new(anchor_url: URL, anchor_data_hash: AnchorDataHash): Anchor {
    const anchor_urlPtr = Ptr._assertClass(anchor_url, URL);
    const anchor_data_hashPtr = Ptr._assertClass(anchor_data_hash, AnchorDataHash);
    const ret = CslMobileBridge.csl_bridge_anchor_new_jsi(anchor_urlPtr, anchor_data_hashPtr);
    return Ptr._wrap(ret, Anchor);
  }

}

export class AnchorDataHash extends Ptr {
  static from_bytes(bytes: Uint8Array): AnchorDataHash {
    const ret = CslMobileBridge.csl_bridge_anchor_data_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, AnchorDataHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_anchor_data_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_anchor_data_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): AnchorDataHash {
    const ret = CslMobileBridge.csl_bridge_anchor_data_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, AnchorDataHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_anchor_data_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): AnchorDataHash {
    const ret = CslMobileBridge.csl_bridge_anchor_data_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, AnchorDataHash);
  }

}

export class AssetName extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_asset_name_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): AssetName {
    const ret = CslMobileBridge.csl_bridge_asset_name_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, AssetName);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_asset_name_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): AssetName {
    const ret = CslMobileBridge.csl_bridge_asset_name_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, AssetName);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_asset_name_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): AssetName {
    const ret = CslMobileBridge.csl_bridge_asset_name_from_json_jsi(json);
    return Ptr._wrap(ret, AssetName);
  }

  static new(name: Uint8Array): AssetName {
    const ret = CslMobileBridge.csl_bridge_asset_name_new_jsi(b64FromUint8Array(name));
    return Ptr._wrap(ret, AssetName);
  }

  name(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_asset_name_name_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

}

export class AssetNames extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_asset_names_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): AssetNames {
    const ret = CslMobileBridge.csl_bridge_asset_names_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, AssetNames);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_asset_names_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): AssetNames {
    const ret = CslMobileBridge.csl_bridge_asset_names_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, AssetNames);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_asset_names_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): AssetNames {
    const ret = CslMobileBridge.csl_bridge_asset_names_from_json_jsi(json);
    return Ptr._wrap(ret, AssetNames);
  }

  static new(): AssetNames {
    const ret = CslMobileBridge.csl_bridge_asset_names_new_jsi();
    return Ptr._wrap(ret, AssetNames);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_asset_names_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): AssetName {
    const ret = CslMobileBridge.csl_bridge_asset_names_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, AssetName);
  }

  add(elem: AssetName): void {
    const elemPtr = Ptr._assertClass(elem, AssetName);
    const ret = CslMobileBridge.csl_bridge_asset_names_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class Assets extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_assets_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Assets {
    const ret = CslMobileBridge.csl_bridge_assets_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Assets);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_assets_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Assets {
    const ret = CslMobileBridge.csl_bridge_assets_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Assets);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_assets_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Assets {
    const ret = CslMobileBridge.csl_bridge_assets_from_json_jsi(json);
    return Ptr._wrap(ret, Assets);
  }

  static new(): Assets {
    const ret = CslMobileBridge.csl_bridge_assets_new_jsi();
    return Ptr._wrap(ret, Assets);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_assets_len_jsi(this.ptr);
    return ret;
  }

  insert(key: AssetName, value: BigNum): Optional<BigNum> {
    const keyPtr = Ptr._assertClass(key, AssetName);
    const valuePtr = Ptr._assertClass(value, BigNum);
    const ret = CslMobileBridge.csl_bridge_assets_insert_jsi(this.ptr, keyPtr, valuePtr);
    return Ptr._wrap(ret, BigNum);
  }

  get(key: AssetName): Optional<BigNum> {
    const keyPtr = Ptr._assertClass(key, AssetName);
    const ret = CslMobileBridge.csl_bridge_assets_get_jsi(this.ptr, keyPtr);
    return Ptr._wrap(ret, BigNum);
  }

  keys(): AssetNames {
    const ret = CslMobileBridge.csl_bridge_assets_keys_jsi(this.ptr);
    return Ptr._wrap(ret, AssetNames);
  }

}

export class AuxiliaryData extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): AuxiliaryData {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, AuxiliaryData);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): AuxiliaryData {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, AuxiliaryData);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): AuxiliaryData {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_from_json_jsi(json);
    return Ptr._wrap(ret, AuxiliaryData);
  }

  static new(): AuxiliaryData {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_new_jsi();
    return Ptr._wrap(ret, AuxiliaryData);
  }

  metadata(): Optional<GeneralTransactionMetadata> {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_metadata_jsi(this.ptr);
    return Ptr._wrap(ret, GeneralTransactionMetadata);
  }

  set_metadata(metadata: GeneralTransactionMetadata): void {
    const metadataPtr = Ptr._assertClass(metadata, GeneralTransactionMetadata);
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_set_metadata_jsi(this.ptr, metadataPtr);
    return ret;
  }

  native_scripts(): Optional<NativeScripts> {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_native_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  set_native_scripts(native_scripts: NativeScripts): void {
    const native_scriptsPtr = Ptr._assertClass(native_scripts, NativeScripts);
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_set_native_scripts_jsi(this.ptr, native_scriptsPtr);
    return ret;
  }

  plutus_scripts(): Optional<PlutusScripts> {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_plutus_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusScripts);
  }

  set_plutus_scripts(plutus_scripts: PlutusScripts): void {
    const plutus_scriptsPtr = Ptr._assertClass(plutus_scripts, PlutusScripts);
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_set_plutus_scripts_jsi(this.ptr, plutus_scriptsPtr);
    return ret;
  }

  prefer_alonzo_format(): boolean {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_prefer_alonzo_format_jsi(this.ptr);
    return ret;
  }

  set_prefer_alonzo_format(prefer: boolean): void {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_set_prefer_alonzo_format_jsi(this.ptr, prefer);
    return ret;
  }

}

export class AuxiliaryDataHash extends Ptr {
  static from_bytes(bytes: Uint8Array): AuxiliaryDataHash {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, AuxiliaryDataHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): AuxiliaryDataHash {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, AuxiliaryDataHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): AuxiliaryDataHash {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, AuxiliaryDataHash);
  }

}

export class AuxiliaryDataSet extends Ptr {
  static new(): AuxiliaryDataSet {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_set_new_jsi();
    return Ptr._wrap(ret, AuxiliaryDataSet);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_set_len_jsi(this.ptr);
    return ret;
  }

  insert(tx_index: number, data: AuxiliaryData): Optional<AuxiliaryData> {
    const dataPtr = Ptr._assertClass(data, AuxiliaryData);
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_set_insert_jsi(this.ptr, tx_index, dataPtr);
    return Ptr._wrap(ret, AuxiliaryData);
  }

  get(tx_index: number): Optional<AuxiliaryData> {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_set_get_jsi(this.ptr, tx_index);
    return Ptr._wrap(ret, AuxiliaryData);
  }

  indices(): Uint32Array {
    const ret = CslMobileBridge.csl_bridge_auxiliary_data_set_indices_jsi(this.ptr);
    return base64ToUint32Array(ret);
  }

}

export class BaseAddress extends Ptr {
  static new(network: number, payment: Credential, stake: Credential): BaseAddress {
    const paymentPtr = Ptr._assertClass(payment, Credential);
    const stakePtr = Ptr._assertClass(stake, Credential);
    const ret = CslMobileBridge.csl_bridge_base_address_new_jsi(network, paymentPtr, stakePtr);
    return Ptr._wrap(ret, BaseAddress);
  }

  payment_cred(): Credential {
    const ret = CslMobileBridge.csl_bridge_base_address_payment_cred_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  stake_cred(): Credential {
    const ret = CslMobileBridge.csl_bridge_base_address_stake_cred_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  to_address(): Address {
    const ret = CslMobileBridge.csl_bridge_base_address_to_address_jsi(this.ptr);
    return Ptr._wrap(ret, Address);
  }

  static from_address(addr: Address): Optional<BaseAddress> {
    const addrPtr = Ptr._assertClass(addr, Address);
    const ret = CslMobileBridge.csl_bridge_base_address_from_address_jsi(addrPtr);
    return Ptr._wrap(ret, BaseAddress);
  }

  network_id(): number {
    const ret = CslMobileBridge.csl_bridge_base_address_network_id_jsi(this.ptr);
    return ret;
  }

}

export class BigInt extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_big_int_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): BigInt {
    const ret = CslMobileBridge.csl_bridge_big_int_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, BigInt);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_big_int_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): BigInt {
    const ret = CslMobileBridge.csl_bridge_big_int_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, BigInt);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_big_int_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): BigInt {
    const ret = CslMobileBridge.csl_bridge_big_int_from_json_jsi(json);
    return Ptr._wrap(ret, BigInt);
  }

  is_zero(): boolean {
    const ret = CslMobileBridge.csl_bridge_big_int_is_zero_jsi(this.ptr);
    return ret;
  }

  as_u64(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_big_int_as_u64_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  as_int(): Optional<Int> {
    const ret = CslMobileBridge.csl_bridge_big_int_as_int_jsi(this.ptr);
    return Ptr._wrap(ret, Int);
  }

  static from_str(text: string): BigInt {
    const ret = CslMobileBridge.csl_bridge_big_int_from_str_jsi(text);
    return Ptr._wrap(ret, BigInt);
  }

  to_str(): string {
    const ret = CslMobileBridge.csl_bridge_big_int_to_str_jsi(this.ptr);
    return ret;
  }

  add(other: BigInt): BigInt {
    const otherPtr = Ptr._assertClass(other, BigInt);
    const ret = CslMobileBridge.csl_bridge_big_int_add_jsi(this.ptr, otherPtr);
    return Ptr._wrap(ret, BigInt);
  }

  sub(other: BigInt): BigInt {
    const otherPtr = Ptr._assertClass(other, BigInt);
    const ret = CslMobileBridge.csl_bridge_big_int_sub_jsi(this.ptr, otherPtr);
    return Ptr._wrap(ret, BigInt);
  }

  mul(other: BigInt): BigInt {
    const otherPtr = Ptr._assertClass(other, BigInt);
    const ret = CslMobileBridge.csl_bridge_big_int_mul_jsi(this.ptr, otherPtr);
    return Ptr._wrap(ret, BigInt);
  }

  pow(exp: number): BigInt {
    const ret = CslMobileBridge.csl_bridge_big_int_pow_jsi(this.ptr, exp);
    return Ptr._wrap(ret, BigInt);
  }

  static one(): BigInt {
    const ret = CslMobileBridge.csl_bridge_big_int_one_jsi();
    return Ptr._wrap(ret, BigInt);
  }

  static zero(): BigInt {
    const ret = CslMobileBridge.csl_bridge_big_int_zero_jsi();
    return Ptr._wrap(ret, BigInt);
  }

  abs(): BigInt {
    const ret = CslMobileBridge.csl_bridge_big_int_abs_jsi(this.ptr);
    return Ptr._wrap(ret, BigInt);
  }

  increment(): BigInt {
    const ret = CslMobileBridge.csl_bridge_big_int_increment_jsi(this.ptr);
    return Ptr._wrap(ret, BigInt);
  }

  div_ceil(other: BigInt): BigInt {
    const otherPtr = Ptr._assertClass(other, BigInt);
    const ret = CslMobileBridge.csl_bridge_big_int_div_ceil_jsi(this.ptr, otherPtr);
    return Ptr._wrap(ret, BigInt);
  }

  div_floor(other: BigInt): BigInt {
    const otherPtr = Ptr._assertClass(other, BigInt);
    const ret = CslMobileBridge.csl_bridge_big_int_div_floor_jsi(this.ptr, otherPtr);
    return Ptr._wrap(ret, BigInt);
  }

}

export class BigNum extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_big_num_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): BigNum {
    const ret = CslMobileBridge.csl_bridge_big_num_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, BigNum);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_big_num_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): BigNum {
    const ret = CslMobileBridge.csl_bridge_big_num_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, BigNum);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_big_num_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): BigNum {
    const ret = CslMobileBridge.csl_bridge_big_num_from_json_jsi(json);
    return Ptr._wrap(ret, BigNum);
  }

  static from_str(string: string): BigNum {
    const ret = CslMobileBridge.csl_bridge_big_num_from_str_jsi(string);
    return Ptr._wrap(ret, BigNum);
  }

  to_str(): string {
    const ret = CslMobileBridge.csl_bridge_big_num_to_str_jsi(this.ptr);
    return ret;
  }

  static zero(): BigNum {
    const ret = CslMobileBridge.csl_bridge_big_num_zero_jsi();
    return Ptr._wrap(ret, BigNum);
  }

  static one(): BigNum {
    const ret = CslMobileBridge.csl_bridge_big_num_one_jsi();
    return Ptr._wrap(ret, BigNum);
  }

  is_zero(): boolean {
    const ret = CslMobileBridge.csl_bridge_big_num_is_zero_jsi(this.ptr);
    return ret;
  }

  div_floor(other: BigNum): BigNum {
    const otherPtr = Ptr._assertClass(other, BigNum);
    const ret = CslMobileBridge.csl_bridge_big_num_div_floor_jsi(this.ptr, otherPtr);
    return Ptr._wrap(ret, BigNum);
  }

  checked_mul(other: BigNum): BigNum {
    const otherPtr = Ptr._assertClass(other, BigNum);
    const ret = CslMobileBridge.csl_bridge_big_num_checked_mul_jsi(this.ptr, otherPtr);
    return Ptr._wrap(ret, BigNum);
  }

  checked_add(other: BigNum): BigNum {
    const otherPtr = Ptr._assertClass(other, BigNum);
    const ret = CslMobileBridge.csl_bridge_big_num_checked_add_jsi(this.ptr, otherPtr);
    return Ptr._wrap(ret, BigNum);
  }

  checked_sub(other: BigNum): BigNum {
    const otherPtr = Ptr._assertClass(other, BigNum);
    const ret = CslMobileBridge.csl_bridge_big_num_checked_sub_jsi(this.ptr, otherPtr);
    return Ptr._wrap(ret, BigNum);
  }

  clamped_sub(other: BigNum): BigNum {
    const otherPtr = Ptr._assertClass(other, BigNum);
    const ret = CslMobileBridge.csl_bridge_big_num_clamped_sub_jsi(this.ptr, otherPtr);
    return Ptr._wrap(ret, BigNum);
  }

  compare(rhs_value: BigNum): number {
    const rhs_valuePtr = Ptr._assertClass(rhs_value, BigNum);
    const ret = CslMobileBridge.csl_bridge_big_num_compare_jsi(this.ptr, rhs_valuePtr);
    return ret;
  }

  less_than(rhs_value: BigNum): boolean {
    const rhs_valuePtr = Ptr._assertClass(rhs_value, BigNum);
    const ret = CslMobileBridge.csl_bridge_big_num_less_than_jsi(this.ptr, rhs_valuePtr);
    return ret;
  }

  static max_value(): BigNum {
    const ret = CslMobileBridge.csl_bridge_big_num_max_value_jsi();
    return Ptr._wrap(ret, BigNum);
  }

  static max(a: BigNum, b: BigNum): BigNum {
    const aPtr = Ptr._assertClass(a, BigNum);
    const bPtr = Ptr._assertClass(b, BigNum);
    const ret = CslMobileBridge.csl_bridge_big_num_max_jsi(aPtr, bPtr);
    return Ptr._wrap(ret, BigNum);
  }

}

export class Bip32PrivateKey extends Ptr {
  derive(index: number): Bip32PrivateKey {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_derive_jsi(this.ptr, index);
    return Ptr._wrap(ret, Bip32PrivateKey);
  }

  static from_128_xprv(bytes: Uint8Array): Bip32PrivateKey {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_from_128_xprv_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Bip32PrivateKey);
  }

  to_128_xprv(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_to_128_xprv_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static generate_ed25519_bip32(): Bip32PrivateKey {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_generate_ed25519_bip32_jsi();
    return Ptr._wrap(ret, Bip32PrivateKey);
  }

  to_raw_key(): PrivateKey {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_to_raw_key_jsi(this.ptr);
    return Ptr._wrap(ret, PrivateKey);
  }

  to_public(): Bip32PublicKey {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_to_public_jsi(this.ptr);
    return Ptr._wrap(ret, Bip32PublicKey);
  }

  static from_bytes(bytes: Uint8Array): Bip32PrivateKey {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Bip32PrivateKey);
  }

  as_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_as_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bech32(bech32_str: string): Bip32PrivateKey {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_from_bech32_jsi(bech32_str);
    return Ptr._wrap(ret, Bip32PrivateKey);
  }

  to_bech32(): string {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_to_bech32_jsi(this.ptr);
    return ret;
  }

  static from_bip39_entropy(entropy: Uint8Array, password: Uint8Array): Bip32PrivateKey {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_from_bip39_entropy_jsi(b64FromUint8Array(entropy), b64FromUint8Array(password));
    return Ptr._wrap(ret, Bip32PrivateKey);
  }

  chaincode(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_chaincode_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Bip32PrivateKey {
    const ret = CslMobileBridge.csl_bridge_bip32_private_key_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Bip32PrivateKey);
  }

}

export class Bip32PublicKey extends Ptr {
  derive(index: number): Bip32PublicKey {
    const ret = CslMobileBridge.csl_bridge_bip32_public_key_derive_jsi(this.ptr, index);
    return Ptr._wrap(ret, Bip32PublicKey);
  }

  to_raw_key(): PublicKey {
    const ret = CslMobileBridge.csl_bridge_bip32_public_key_to_raw_key_jsi(this.ptr);
    return Ptr._wrap(ret, PublicKey);
  }

  static from_bytes(bytes: Uint8Array): Bip32PublicKey {
    const ret = CslMobileBridge.csl_bridge_bip32_public_key_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Bip32PublicKey);
  }

  as_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_bip32_public_key_as_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bech32(bech32_str: string): Bip32PublicKey {
    const ret = CslMobileBridge.csl_bridge_bip32_public_key_from_bech32_jsi(bech32_str);
    return Ptr._wrap(ret, Bip32PublicKey);
  }

  to_bech32(): string {
    const ret = CslMobileBridge.csl_bridge_bip32_public_key_to_bech32_jsi(this.ptr);
    return ret;
  }

  chaincode(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_bip32_public_key_chaincode_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_bip32_public_key_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Bip32PublicKey {
    const ret = CslMobileBridge.csl_bridge_bip32_public_key_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Bip32PublicKey);
  }

}

export class Block extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_block_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Block {
    const ret = CslMobileBridge.csl_bridge_block_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Block);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_block_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Block {
    const ret = CslMobileBridge.csl_bridge_block_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Block);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_block_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Block {
    const ret = CslMobileBridge.csl_bridge_block_from_json_jsi(json);
    return Ptr._wrap(ret, Block);
  }

  header(): Header {
    const ret = CslMobileBridge.csl_bridge_block_header_jsi(this.ptr);
    return Ptr._wrap(ret, Header);
  }

  transaction_bodies(): TransactionBodies {
    const ret = CslMobileBridge.csl_bridge_block_transaction_bodies_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionBodies);
  }

  transaction_witness_sets(): TransactionWitnessSets {
    const ret = CslMobileBridge.csl_bridge_block_transaction_witness_sets_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionWitnessSets);
  }

  auxiliary_data_set(): AuxiliaryDataSet {
    const ret = CslMobileBridge.csl_bridge_block_auxiliary_data_set_jsi(this.ptr);
    return Ptr._wrap(ret, AuxiliaryDataSet);
  }

  invalid_transactions(): Uint32Array {
    const ret = CslMobileBridge.csl_bridge_block_invalid_transactions_jsi(this.ptr);
    return base64ToUint32Array(ret);
  }

  static new(header: Header, transaction_bodies: TransactionBodies, transaction_witness_sets: TransactionWitnessSets, auxiliary_data_set: AuxiliaryDataSet, invalid_transactions: Uint32Array): Block {
    const headerPtr = Ptr._assertClass(header, Header);
    const transaction_bodiesPtr = Ptr._assertClass(transaction_bodies, TransactionBodies);
    const transaction_witness_setsPtr = Ptr._assertClass(transaction_witness_sets, TransactionWitnessSets);
    const auxiliary_data_setPtr = Ptr._assertClass(auxiliary_data_set, AuxiliaryDataSet);
    const ret = CslMobileBridge.csl_bridge_block_new_jsi(headerPtr, transaction_bodiesPtr, transaction_witness_setsPtr, auxiliary_data_setPtr, uint32ArrayToBase64(invalid_transactions));
    return Ptr._wrap(ret, Block);
  }

}

export class BlockHash extends Ptr {
  static from_bytes(bytes: Uint8Array): BlockHash {
    const ret = CslMobileBridge.csl_bridge_block_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, BlockHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_block_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_block_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): BlockHash {
    const ret = CslMobileBridge.csl_bridge_block_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, BlockHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_block_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): BlockHash {
    const ret = CslMobileBridge.csl_bridge_block_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, BlockHash);
  }

}

export class BootstrapWitness extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): BootstrapWitness {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, BootstrapWitness);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): BootstrapWitness {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, BootstrapWitness);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): BootstrapWitness {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_from_json_jsi(json);
    return Ptr._wrap(ret, BootstrapWitness);
  }

  vkey(): Vkey {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_vkey_jsi(this.ptr);
    return Ptr._wrap(ret, Vkey);
  }

  signature(): Ed25519Signature {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_signature_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519Signature);
  }

  chain_code(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_chain_code_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  attributes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_attributes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static new(vkey: Vkey, signature: Ed25519Signature, chain_code: Uint8Array, attributes: Uint8Array): BootstrapWitness {
    const vkeyPtr = Ptr._assertClass(vkey, Vkey);
    const signaturePtr = Ptr._assertClass(signature, Ed25519Signature);
    const ret = CslMobileBridge.csl_bridge_bootstrap_witness_new_jsi(vkeyPtr, signaturePtr, b64FromUint8Array(chain_code), b64FromUint8Array(attributes));
    return Ptr._wrap(ret, BootstrapWitness);
  }

}

export class BootstrapWitnesses extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witnesses_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): BootstrapWitnesses {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witnesses_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, BootstrapWitnesses);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witnesses_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): BootstrapWitnesses {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witnesses_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, BootstrapWitnesses);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witnesses_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): BootstrapWitnesses {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witnesses_from_json_jsi(json);
    return Ptr._wrap(ret, BootstrapWitnesses);
  }

  static new(): BootstrapWitnesses {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witnesses_new_jsi();
    return Ptr._wrap(ret, BootstrapWitnesses);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witnesses_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): BootstrapWitness {
    const ret = CslMobileBridge.csl_bridge_bootstrap_witnesses_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, BootstrapWitness);
  }

  add(witness: BootstrapWitness): boolean {
    const witnessPtr = Ptr._assertClass(witness, BootstrapWitness);
    const ret = CslMobileBridge.csl_bridge_bootstrap_witnesses_add_jsi(this.ptr, witnessPtr);
    return ret;
  }

}

export class ByronAddress extends Ptr {
  to_base58(): string {
    const ret = CslMobileBridge.csl_bridge_byron_address_to_base58_jsi(this.ptr);
    return ret;
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_byron_address_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ByronAddress {
    const ret = CslMobileBridge.csl_bridge_byron_address_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ByronAddress);
  }

  byron_protocol_magic(): number {
    const ret = CslMobileBridge.csl_bridge_byron_address_byron_protocol_magic_jsi(this.ptr);
    return ret;
  }

  byron_address_kind(): ByronAddressType {
    const ret = CslMobileBridge.csl_bridge_byron_address_byron_address_kind_jsi(this.ptr);
    return ret;
  }

  attributes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_byron_address_attributes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  network_id(): number {
    const ret = CslMobileBridge.csl_bridge_byron_address_network_id_jsi(this.ptr);
    return ret;
  }

  static from_base58(s: string): ByronAddress {
    const ret = CslMobileBridge.csl_bridge_byron_address_from_base58_jsi(s);
    return Ptr._wrap(ret, ByronAddress);
  }

  static icarus_from_key(key: Bip32PublicKey, protocol_magic: number): ByronAddress {
    const keyPtr = Ptr._assertClass(key, Bip32PublicKey);
    const ret = CslMobileBridge.csl_bridge_byron_address_icarus_from_key_jsi(keyPtr, protocol_magic);
    return Ptr._wrap(ret, ByronAddress);
  }

  static is_valid(s: string): boolean {
    const ret = CslMobileBridge.csl_bridge_byron_address_is_valid_jsi(s);
    return ret;
  }

  to_address(): Address {
    const ret = CslMobileBridge.csl_bridge_byron_address_to_address_jsi(this.ptr);
    return Ptr._wrap(ret, Address);
  }

  static from_address(addr: Address): Optional<ByronAddress> {
    const addrPtr = Ptr._assertClass(addr, Address);
    const ret = CslMobileBridge.csl_bridge_byron_address_from_address_jsi(addrPtr);
    return Ptr._wrap(ret, ByronAddress);
  }

}

export class Certificate extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_certificate_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Certificate {
    const ret = CslMobileBridge.csl_bridge_certificate_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Certificate);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_certificate_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Certificate {
    const ret = CslMobileBridge.csl_bridge_certificate_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Certificate);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_certificate_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Certificate {
    const ret = CslMobileBridge.csl_bridge_certificate_from_json_jsi(json);
    return Ptr._wrap(ret, Certificate);
  }

  static new_stake_registration(stake_registration: StakeRegistration): Certificate {
    const stake_registrationPtr = Ptr._assertClass(stake_registration, StakeRegistration);
    const ret = CslMobileBridge.csl_bridge_certificate_new_stake_registration_jsi(stake_registrationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_reg_cert(stake_registration: StakeRegistration): Certificate {
    const stake_registrationPtr = Ptr._assertClass(stake_registration, StakeRegistration);
    const ret = CslMobileBridge.csl_bridge_certificate_new_reg_cert_jsi(stake_registrationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_stake_deregistration(stake_deregistration: StakeDeregistration): Certificate {
    const stake_deregistrationPtr = Ptr._assertClass(stake_deregistration, StakeDeregistration);
    const ret = CslMobileBridge.csl_bridge_certificate_new_stake_deregistration_jsi(stake_deregistrationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_unreg_cert(stake_deregistration: StakeDeregistration): Certificate {
    const stake_deregistrationPtr = Ptr._assertClass(stake_deregistration, StakeDeregistration);
    const ret = CslMobileBridge.csl_bridge_certificate_new_unreg_cert_jsi(stake_deregistrationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_stake_delegation(stake_delegation: StakeDelegation): Certificate {
    const stake_delegationPtr = Ptr._assertClass(stake_delegation, StakeDelegation);
    const ret = CslMobileBridge.csl_bridge_certificate_new_stake_delegation_jsi(stake_delegationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_pool_registration(pool_registration: PoolRegistration): Certificate {
    const pool_registrationPtr = Ptr._assertClass(pool_registration, PoolRegistration);
    const ret = CslMobileBridge.csl_bridge_certificate_new_pool_registration_jsi(pool_registrationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_pool_retirement(pool_retirement: PoolRetirement): Certificate {
    const pool_retirementPtr = Ptr._assertClass(pool_retirement, PoolRetirement);
    const ret = CslMobileBridge.csl_bridge_certificate_new_pool_retirement_jsi(pool_retirementPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_genesis_key_delegation(genesis_key_delegation: GenesisKeyDelegation): Certificate {
    const genesis_key_delegationPtr = Ptr._assertClass(genesis_key_delegation, GenesisKeyDelegation);
    const ret = CslMobileBridge.csl_bridge_certificate_new_genesis_key_delegation_jsi(genesis_key_delegationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_move_instantaneous_rewards_cert(move_instantaneous_rewards_cert: MoveInstantaneousRewardsCert): Certificate {
    const move_instantaneous_rewards_certPtr = Ptr._assertClass(move_instantaneous_rewards_cert, MoveInstantaneousRewardsCert);
    const ret = CslMobileBridge.csl_bridge_certificate_new_move_instantaneous_rewards_cert_jsi(move_instantaneous_rewards_certPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_committee_hot_auth(committee_hot_auth: CommitteeHotAuth): Certificate {
    const committee_hot_authPtr = Ptr._assertClass(committee_hot_auth, CommitteeHotAuth);
    const ret = CslMobileBridge.csl_bridge_certificate_new_committee_hot_auth_jsi(committee_hot_authPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_committee_cold_resign(committee_cold_resign: CommitteeColdResign): Certificate {
    const committee_cold_resignPtr = Ptr._assertClass(committee_cold_resign, CommitteeColdResign);
    const ret = CslMobileBridge.csl_bridge_certificate_new_committee_cold_resign_jsi(committee_cold_resignPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_drep_deregistration(drep_deregistration: DRepDeregistration): Certificate {
    const drep_deregistrationPtr = Ptr._assertClass(drep_deregistration, DRepDeregistration);
    const ret = CslMobileBridge.csl_bridge_certificate_new_drep_deregistration_jsi(drep_deregistrationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_drep_registration(drep_registration: DRepRegistration): Certificate {
    const drep_registrationPtr = Ptr._assertClass(drep_registration, DRepRegistration);
    const ret = CslMobileBridge.csl_bridge_certificate_new_drep_registration_jsi(drep_registrationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_drep_update(drep_update: DRepUpdate): Certificate {
    const drep_updatePtr = Ptr._assertClass(drep_update, DRepUpdate);
    const ret = CslMobileBridge.csl_bridge_certificate_new_drep_update_jsi(drep_updatePtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_stake_and_vote_delegation(stake_and_vote_delegation: StakeAndVoteDelegation): Certificate {
    const stake_and_vote_delegationPtr = Ptr._assertClass(stake_and_vote_delegation, StakeAndVoteDelegation);
    const ret = CslMobileBridge.csl_bridge_certificate_new_stake_and_vote_delegation_jsi(stake_and_vote_delegationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_stake_registration_and_delegation(stake_registration_and_delegation: StakeRegistrationAndDelegation): Certificate {
    const stake_registration_and_delegationPtr = Ptr._assertClass(stake_registration_and_delegation, StakeRegistrationAndDelegation);
    const ret = CslMobileBridge.csl_bridge_certificate_new_stake_registration_and_delegation_jsi(stake_registration_and_delegationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_stake_vote_registration_and_delegation(stake_vote_registration_and_delegation: StakeVoteRegistrationAndDelegation): Certificate {
    const stake_vote_registration_and_delegationPtr = Ptr._assertClass(stake_vote_registration_and_delegation, StakeVoteRegistrationAndDelegation);
    const ret = CslMobileBridge.csl_bridge_certificate_new_stake_vote_registration_and_delegation_jsi(stake_vote_registration_and_delegationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_vote_delegation(vote_delegation: VoteDelegation): Certificate {
    const vote_delegationPtr = Ptr._assertClass(vote_delegation, VoteDelegation);
    const ret = CslMobileBridge.csl_bridge_certificate_new_vote_delegation_jsi(vote_delegationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  static new_vote_registration_and_delegation(vote_registration_and_delegation: VoteRegistrationAndDelegation): Certificate {
    const vote_registration_and_delegationPtr = Ptr._assertClass(vote_registration_and_delegation, VoteRegistrationAndDelegation);
    const ret = CslMobileBridge.csl_bridge_certificate_new_vote_registration_and_delegation_jsi(vote_registration_and_delegationPtr);
    return Ptr._wrap(ret, Certificate);
  }

  kind(): CertificateKind {
    const ret = CslMobileBridge.csl_bridge_certificate_kind_jsi(this.ptr);
    return ret;
  }

  as_stake_registration(): Optional<StakeRegistration> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_stake_registration_jsi(this.ptr);
    return Ptr._wrap(ret, StakeRegistration);
  }

  as_reg_cert(): Optional<StakeRegistration> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_reg_cert_jsi(this.ptr);
    return Ptr._wrap(ret, StakeRegistration);
  }

  as_stake_deregistration(): Optional<StakeDeregistration> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_stake_deregistration_jsi(this.ptr);
    return Ptr._wrap(ret, StakeDeregistration);
  }

  as_unreg_cert(): Optional<StakeDeregistration> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_unreg_cert_jsi(this.ptr);
    return Ptr._wrap(ret, StakeDeregistration);
  }

  as_stake_delegation(): Optional<StakeDelegation> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_stake_delegation_jsi(this.ptr);
    return Ptr._wrap(ret, StakeDelegation);
  }

  as_pool_registration(): Optional<PoolRegistration> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_pool_registration_jsi(this.ptr);
    return Ptr._wrap(ret, PoolRegistration);
  }

  as_pool_retirement(): Optional<PoolRetirement> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_pool_retirement_jsi(this.ptr);
    return Ptr._wrap(ret, PoolRetirement);
  }

  as_genesis_key_delegation(): Optional<GenesisKeyDelegation> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_genesis_key_delegation_jsi(this.ptr);
    return Ptr._wrap(ret, GenesisKeyDelegation);
  }

  as_move_instantaneous_rewards_cert(): Optional<MoveInstantaneousRewardsCert> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_move_instantaneous_rewards_cert_jsi(this.ptr);
    return Ptr._wrap(ret, MoveInstantaneousRewardsCert);
  }

  as_committee_hot_auth(): Optional<CommitteeHotAuth> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_committee_hot_auth_jsi(this.ptr);
    return Ptr._wrap(ret, CommitteeHotAuth);
  }

  as_committee_cold_resign(): Optional<CommitteeColdResign> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_committee_cold_resign_jsi(this.ptr);
    return Ptr._wrap(ret, CommitteeColdResign);
  }

  as_drep_deregistration(): Optional<DRepDeregistration> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_drep_deregistration_jsi(this.ptr);
    return Ptr._wrap(ret, DRepDeregistration);
  }

  as_drep_registration(): Optional<DRepRegistration> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_drep_registration_jsi(this.ptr);
    return Ptr._wrap(ret, DRepRegistration);
  }

  as_drep_update(): Optional<DRepUpdate> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_drep_update_jsi(this.ptr);
    return Ptr._wrap(ret, DRepUpdate);
  }

  as_stake_and_vote_delegation(): Optional<StakeAndVoteDelegation> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_stake_and_vote_delegation_jsi(this.ptr);
    return Ptr._wrap(ret, StakeAndVoteDelegation);
  }

  as_stake_registration_and_delegation(): Optional<StakeRegistrationAndDelegation> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_stake_registration_and_delegation_jsi(this.ptr);
    return Ptr._wrap(ret, StakeRegistrationAndDelegation);
  }

  as_stake_vote_registration_and_delegation(): Optional<StakeVoteRegistrationAndDelegation> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_stake_vote_registration_and_delegation_jsi(this.ptr);
    return Ptr._wrap(ret, StakeVoteRegistrationAndDelegation);
  }

  as_vote_delegation(): Optional<VoteDelegation> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_vote_delegation_jsi(this.ptr);
    return Ptr._wrap(ret, VoteDelegation);
  }

  as_vote_registration_and_delegation(): Optional<VoteRegistrationAndDelegation> {
    const ret = CslMobileBridge.csl_bridge_certificate_as_vote_registration_and_delegation_jsi(this.ptr);
    return Ptr._wrap(ret, VoteRegistrationAndDelegation);
  }

  has_required_script_witness(): boolean {
    const ret = CslMobileBridge.csl_bridge_certificate_has_required_script_witness_jsi(this.ptr);
    return ret;
  }

}

export class Certificates extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_certificates_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Certificates {
    const ret = CslMobileBridge.csl_bridge_certificates_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Certificates);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_certificates_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Certificates {
    const ret = CslMobileBridge.csl_bridge_certificates_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Certificates);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_certificates_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Certificates {
    const ret = CslMobileBridge.csl_bridge_certificates_from_json_jsi(json);
    return Ptr._wrap(ret, Certificates);
  }

  static new(): Certificates {
    const ret = CslMobileBridge.csl_bridge_certificates_new_jsi();
    return Ptr._wrap(ret, Certificates);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_certificates_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): Certificate {
    const ret = CslMobileBridge.csl_bridge_certificates_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, Certificate);
  }

  add(elem: Certificate): boolean {
    const elemPtr = Ptr._assertClass(elem, Certificate);
    const ret = CslMobileBridge.csl_bridge_certificates_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class CertificatesBuilder extends Ptr {
  static new(): CertificatesBuilder {
    const ret = CslMobileBridge.csl_bridge_certificates_builder_new_jsi();
    return Ptr._wrap(ret, CertificatesBuilder);
  }

  add(cert: Certificate): void {
    const certPtr = Ptr._assertClass(cert, Certificate);
    const ret = CslMobileBridge.csl_bridge_certificates_builder_add_jsi(this.ptr, certPtr);
    return ret;
  }

  add_with_plutus_witness(cert: Certificate, witness: PlutusWitness): void {
    const certPtr = Ptr._assertClass(cert, Certificate);
    const witnessPtr = Ptr._assertClass(witness, PlutusWitness);
    const ret = CslMobileBridge.csl_bridge_certificates_builder_add_with_plutus_witness_jsi(this.ptr, certPtr, witnessPtr);
    return ret;
  }

  add_with_native_script(cert: Certificate, native_script_source: NativeScriptSource): void {
    const certPtr = Ptr._assertClass(cert, Certificate);
    const native_script_sourcePtr = Ptr._assertClass(native_script_source, NativeScriptSource);
    const ret = CslMobileBridge.csl_bridge_certificates_builder_add_with_native_script_jsi(this.ptr, certPtr, native_script_sourcePtr);
    return ret;
  }

  get_plutus_witnesses(): PlutusWitnesses {
    const ret = CslMobileBridge.csl_bridge_certificates_builder_get_plutus_witnesses_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusWitnesses);
  }

  get_ref_inputs(): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_certificates_builder_get_ref_inputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  get_native_scripts(): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_certificates_builder_get_native_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  get_certificates_refund(pool_deposit: BigNum, key_deposit: BigNum): Value {
    const pool_depositPtr = Ptr._assertClass(pool_deposit, BigNum);
    const key_depositPtr = Ptr._assertClass(key_deposit, BigNum);
    const ret = CslMobileBridge.csl_bridge_certificates_builder_get_certificates_refund_jsi(this.ptr, pool_depositPtr, key_depositPtr);
    return Ptr._wrap(ret, Value);
  }

  get_certificates_deposit(pool_deposit: BigNum, key_deposit: BigNum): BigNum {
    const pool_depositPtr = Ptr._assertClass(pool_deposit, BigNum);
    const key_depositPtr = Ptr._assertClass(key_deposit, BigNum);
    const ret = CslMobileBridge.csl_bridge_certificates_builder_get_certificates_deposit_jsi(this.ptr, pool_depositPtr, key_depositPtr);
    return Ptr._wrap(ret, BigNum);
  }

  has_plutus_scripts(): boolean {
    const ret = CslMobileBridge.csl_bridge_certificates_builder_has_plutus_scripts_jsi(this.ptr);
    return ret;
  }

  build(): Certificates {
    const ret = CslMobileBridge.csl_bridge_certificates_builder_build_jsi(this.ptr);
    return Ptr._wrap(ret, Certificates);
  }

}

export class ChangeConfig extends Ptr {
  static new(address: Address): ChangeConfig {
    const addressPtr = Ptr._assertClass(address, Address);
    const ret = CslMobileBridge.csl_bridge_change_config_new_jsi(addressPtr);
    return Ptr._wrap(ret, ChangeConfig);
  }

  change_address(address: Address): ChangeConfig {
    const addressPtr = Ptr._assertClass(address, Address);
    const ret = CslMobileBridge.csl_bridge_change_config_change_address_jsi(this.ptr, addressPtr);
    return Ptr._wrap(ret, ChangeConfig);
  }

  change_plutus_data(plutus_data: OutputDatum): ChangeConfig {
    const plutus_dataPtr = Ptr._assertClass(plutus_data, OutputDatum);
    const ret = CslMobileBridge.csl_bridge_change_config_change_plutus_data_jsi(this.ptr, plutus_dataPtr);
    return Ptr._wrap(ret, ChangeConfig);
  }

  change_script_ref(script_ref: ScriptRef): ChangeConfig {
    const script_refPtr = Ptr._assertClass(script_ref, ScriptRef);
    const ret = CslMobileBridge.csl_bridge_change_config_change_script_ref_jsi(this.ptr, script_refPtr);
    return Ptr._wrap(ret, ChangeConfig);
  }

}

export class Committee extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_committee_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Committee {
    const ret = CslMobileBridge.csl_bridge_committee_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Committee);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_committee_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Committee {
    const ret = CslMobileBridge.csl_bridge_committee_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Committee);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_committee_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Committee {
    const ret = CslMobileBridge.csl_bridge_committee_from_json_jsi(json);
    return Ptr._wrap(ret, Committee);
  }

  static new(quorum_threshold: UnitInterval): Committee {
    const quorum_thresholdPtr = Ptr._assertClass(quorum_threshold, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_committee_new_jsi(quorum_thresholdPtr);
    return Ptr._wrap(ret, Committee);
  }

  members_keys(): Credentials {
    const ret = CslMobileBridge.csl_bridge_committee_members_keys_jsi(this.ptr);
    return Ptr._wrap(ret, Credentials);
  }

  quorum_threshold(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_committee_quorum_threshold_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  add_member(committee_cold_credential: Credential, epoch: number): void {
    const committee_cold_credentialPtr = Ptr._assertClass(committee_cold_credential, Credential);
    const ret = CslMobileBridge.csl_bridge_committee_add_member_jsi(this.ptr, committee_cold_credentialPtr, epoch);
    return ret;
  }

  get_member_epoch(committee_cold_credential: Credential): Optional<number> {
    const committee_cold_credentialPtr = Ptr._assertClass(committee_cold_credential, Credential);
    const ret = CslMobileBridge.csl_bridge_committee_get_member_epoch_jsi(this.ptr, committee_cold_credentialPtr);
    return ret;
  }

}

export class CommitteeColdResign extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): CommitteeColdResign {
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, CommitteeColdResign);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): CommitteeColdResign {
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, CommitteeColdResign);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): CommitteeColdResign {
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_from_json_jsi(json);
    return Ptr._wrap(ret, CommitteeColdResign);
  }

  committee_cold_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_committee_cold_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  anchor(): Optional<Anchor> {
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_anchor_jsi(this.ptr);
    return Ptr._wrap(ret, Anchor);
  }

  static new(committee_cold_credential: Credential): CommitteeColdResign {
    const committee_cold_credentialPtr = Ptr._assertClass(committee_cold_credential, Credential);
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_new_jsi(committee_cold_credentialPtr);
    return Ptr._wrap(ret, CommitteeColdResign);
  }

  static new_with_anchor(committee_cold_credential: Credential, anchor: Anchor): CommitteeColdResign {
    const committee_cold_credentialPtr = Ptr._assertClass(committee_cold_credential, Credential);
    const anchorPtr = Ptr._assertClass(anchor, Anchor);
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_new_with_anchor_jsi(committee_cold_credentialPtr, anchorPtr);
    return Ptr._wrap(ret, CommitteeColdResign);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_committee_cold_resign_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class CommitteeHotAuth extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_committee_hot_auth_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): CommitteeHotAuth {
    const ret = CslMobileBridge.csl_bridge_committee_hot_auth_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, CommitteeHotAuth);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_committee_hot_auth_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): CommitteeHotAuth {
    const ret = CslMobileBridge.csl_bridge_committee_hot_auth_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, CommitteeHotAuth);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_committee_hot_auth_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): CommitteeHotAuth {
    const ret = CslMobileBridge.csl_bridge_committee_hot_auth_from_json_jsi(json);
    return Ptr._wrap(ret, CommitteeHotAuth);
  }

  committee_cold_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_committee_hot_auth_committee_cold_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  committee_hot_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_committee_hot_auth_committee_hot_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  static new(committee_cold_credential: Credential, committee_hot_credential: Credential): CommitteeHotAuth {
    const committee_cold_credentialPtr = Ptr._assertClass(committee_cold_credential, Credential);
    const committee_hot_credentialPtr = Ptr._assertClass(committee_hot_credential, Credential);
    const ret = CslMobileBridge.csl_bridge_committee_hot_auth_new_jsi(committee_cold_credentialPtr, committee_hot_credentialPtr);
    return Ptr._wrap(ret, CommitteeHotAuth);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_committee_hot_auth_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class Constitution extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_constitution_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Constitution {
    const ret = CslMobileBridge.csl_bridge_constitution_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Constitution);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_constitution_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Constitution {
    const ret = CslMobileBridge.csl_bridge_constitution_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Constitution);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_constitution_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Constitution {
    const ret = CslMobileBridge.csl_bridge_constitution_from_json_jsi(json);
    return Ptr._wrap(ret, Constitution);
  }

  anchor(): Anchor {
    const ret = CslMobileBridge.csl_bridge_constitution_anchor_jsi(this.ptr);
    return Ptr._wrap(ret, Anchor);
  }

  script_hash(): Optional<ScriptHash> {
    const ret = CslMobileBridge.csl_bridge_constitution_script_hash_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptHash);
  }

  static new(anchor: Anchor): Constitution {
    const anchorPtr = Ptr._assertClass(anchor, Anchor);
    const ret = CslMobileBridge.csl_bridge_constitution_new_jsi(anchorPtr);
    return Ptr._wrap(ret, Constitution);
  }

  static new_with_script_hash(anchor: Anchor, script_hash: ScriptHash): Constitution {
    const anchorPtr = Ptr._assertClass(anchor, Anchor);
    const script_hashPtr = Ptr._assertClass(script_hash, ScriptHash);
    const ret = CslMobileBridge.csl_bridge_constitution_new_with_script_hash_jsi(anchorPtr, script_hashPtr);
    return Ptr._wrap(ret, Constitution);
  }

}

export class ConstrPlutusData extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_constr_plutus_data_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ConstrPlutusData {
    const ret = CslMobileBridge.csl_bridge_constr_plutus_data_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ConstrPlutusData);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_constr_plutus_data_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ConstrPlutusData {
    const ret = CslMobileBridge.csl_bridge_constr_plutus_data_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ConstrPlutusData);
  }

  alternative(): BigNum {
    const ret = CslMobileBridge.csl_bridge_constr_plutus_data_alternative_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  data(): PlutusList {
    const ret = CslMobileBridge.csl_bridge_constr_plutus_data_data_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusList);
  }

  static new(alternative: BigNum, data: PlutusList): ConstrPlutusData {
    const alternativePtr = Ptr._assertClass(alternative, BigNum);
    const dataPtr = Ptr._assertClass(data, PlutusList);
    const ret = CslMobileBridge.csl_bridge_constr_plutus_data_new_jsi(alternativePtr, dataPtr);
    return Ptr._wrap(ret, ConstrPlutusData);
  }

}

export class CostModel extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_cost_model_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): CostModel {
    const ret = CslMobileBridge.csl_bridge_cost_model_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, CostModel);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_cost_model_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): CostModel {
    const ret = CslMobileBridge.csl_bridge_cost_model_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, CostModel);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_cost_model_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): CostModel {
    const ret = CslMobileBridge.csl_bridge_cost_model_from_json_jsi(json);
    return Ptr._wrap(ret, CostModel);
  }

  static new(): CostModel {
    const ret = CslMobileBridge.csl_bridge_cost_model_new_jsi();
    return Ptr._wrap(ret, CostModel);
  }

  set(operation: number, cost: Int): Int {
    const costPtr = Ptr._assertClass(cost, Int);
    const ret = CslMobileBridge.csl_bridge_cost_model_set_jsi(this.ptr, operation, costPtr);
    return Ptr._wrap(ret, Int);
  }

  get(operation: number): Int {
    const ret = CslMobileBridge.csl_bridge_cost_model_get_jsi(this.ptr, operation);
    return Ptr._wrap(ret, Int);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_cost_model_len_jsi(this.ptr);
    return ret;
  }

}

export class Costmdls extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_costmdls_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Costmdls {
    const ret = CslMobileBridge.csl_bridge_costmdls_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Costmdls);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_costmdls_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Costmdls {
    const ret = CslMobileBridge.csl_bridge_costmdls_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Costmdls);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_costmdls_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Costmdls {
    const ret = CslMobileBridge.csl_bridge_costmdls_from_json_jsi(json);
    return Ptr._wrap(ret, Costmdls);
  }

  static new(): Costmdls {
    const ret = CslMobileBridge.csl_bridge_costmdls_new_jsi();
    return Ptr._wrap(ret, Costmdls);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_costmdls_len_jsi(this.ptr);
    return ret;
  }

  insert(key: Language, value: CostModel): Optional<CostModel> {
    const keyPtr = Ptr._assertClass(key, Language);
    const valuePtr = Ptr._assertClass(value, CostModel);
    const ret = CslMobileBridge.csl_bridge_costmdls_insert_jsi(this.ptr, keyPtr, valuePtr);
    return Ptr._wrap(ret, CostModel);
  }

  get(key: Language): Optional<CostModel> {
    const keyPtr = Ptr._assertClass(key, Language);
    const ret = CslMobileBridge.csl_bridge_costmdls_get_jsi(this.ptr, keyPtr);
    return Ptr._wrap(ret, CostModel);
  }

  keys(): Languages {
    const ret = CslMobileBridge.csl_bridge_costmdls_keys_jsi(this.ptr);
    return Ptr._wrap(ret, Languages);
  }

  retain_language_versions(languages: Languages): Costmdls {
    const languagesPtr = Ptr._assertClass(languages, Languages);
    const ret = CslMobileBridge.csl_bridge_costmdls_retain_language_versions_jsi(this.ptr, languagesPtr);
    return Ptr._wrap(ret, Costmdls);
  }

}

export class Credential extends Ptr {
  static from_keyhash(hash: Ed25519KeyHash): Credential {
    const hashPtr = Ptr._assertClass(hash, Ed25519KeyHash);
    const ret = CslMobileBridge.csl_bridge_credential_from_keyhash_jsi(hashPtr);
    return Ptr._wrap(ret, Credential);
  }

  static from_scripthash(hash: ScriptHash): Credential {
    const hashPtr = Ptr._assertClass(hash, ScriptHash);
    const ret = CslMobileBridge.csl_bridge_credential_from_scripthash_jsi(hashPtr);
    return Ptr._wrap(ret, Credential);
  }

  to_keyhash(): Optional<Ed25519KeyHash> {
    const ret = CslMobileBridge.csl_bridge_credential_to_keyhash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  to_scripthash(): Optional<ScriptHash> {
    const ret = CslMobileBridge.csl_bridge_credential_to_scripthash_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptHash);
  }

  kind(): CredKind {
    const ret = CslMobileBridge.csl_bridge_credential_kind_jsi(this.ptr);
    return ret;
  }

  has_script_hash(): boolean {
    const ret = CslMobileBridge.csl_bridge_credential_has_script_hash_jsi(this.ptr);
    return ret;
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_credential_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Credential {
    const ret = CslMobileBridge.csl_bridge_credential_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Credential);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_credential_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Credential {
    const ret = CslMobileBridge.csl_bridge_credential_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Credential);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_credential_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Credential {
    const ret = CslMobileBridge.csl_bridge_credential_from_json_jsi(json);
    return Ptr._wrap(ret, Credential);
  }

}

export class Credentials extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_credentials_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Credentials {
    const ret = CslMobileBridge.csl_bridge_credentials_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Credentials);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_credentials_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Credentials {
    const ret = CslMobileBridge.csl_bridge_credentials_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Credentials);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_credentials_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Credentials {
    const ret = CslMobileBridge.csl_bridge_credentials_from_json_jsi(json);
    return Ptr._wrap(ret, Credentials);
  }

  static new(): Credentials {
    const ret = CslMobileBridge.csl_bridge_credentials_new_jsi();
    return Ptr._wrap(ret, Credentials);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_credentials_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): Credential {
    const ret = CslMobileBridge.csl_bridge_credentials_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, Credential);
  }

  add(credential: Credential): boolean {
    const credentialPtr = Ptr._assertClass(credential, Credential);
    const ret = CslMobileBridge.csl_bridge_credentials_add_jsi(this.ptr, credentialPtr);
    return ret;
  }

}

export class DNSRecordAorAAAA extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_aor_a_a_a_a_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): DNSRecordAorAAAA {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_aor_a_a_a_a_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, DNSRecordAorAAAA);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_aor_a_a_a_a_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): DNSRecordAorAAAA {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_aor_a_a_a_a_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, DNSRecordAorAAAA);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_aor_a_a_a_a_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): DNSRecordAorAAAA {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_aor_a_a_a_a_from_json_jsi(json);
    return Ptr._wrap(ret, DNSRecordAorAAAA);
  }

  static new(dns_name: string): DNSRecordAorAAAA {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_aor_a_a_a_a_new_jsi(dns_name);
    return Ptr._wrap(ret, DNSRecordAorAAAA);
  }

  record(): string {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_aor_a_a_a_a_record_jsi(this.ptr);
    return ret;
  }

}

export class DNSRecordSRV extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_s_r_v_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): DNSRecordSRV {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_s_r_v_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, DNSRecordSRV);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_s_r_v_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): DNSRecordSRV {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_s_r_v_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, DNSRecordSRV);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_s_r_v_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): DNSRecordSRV {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_s_r_v_from_json_jsi(json);
    return Ptr._wrap(ret, DNSRecordSRV);
  }

  static new(dns_name: string): DNSRecordSRV {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_s_r_v_new_jsi(dns_name);
    return Ptr._wrap(ret, DNSRecordSRV);
  }

  record(): string {
    const ret = CslMobileBridge.csl_bridge_d_n_s_record_s_r_v_record_jsi(this.ptr);
    return ret;
  }

}

export class DRep extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_d_rep_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): DRep {
    const ret = CslMobileBridge.csl_bridge_d_rep_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, DRep);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): DRep {
    const ret = CslMobileBridge.csl_bridge_d_rep_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, DRep);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): DRep {
    const ret = CslMobileBridge.csl_bridge_d_rep_from_json_jsi(json);
    return Ptr._wrap(ret, DRep);
  }

  static new_key_hash(key_hash: Ed25519KeyHash): DRep {
    const key_hashPtr = Ptr._assertClass(key_hash, Ed25519KeyHash);
    const ret = CslMobileBridge.csl_bridge_d_rep_new_key_hash_jsi(key_hashPtr);
    return Ptr._wrap(ret, DRep);
  }

  static new_script_hash(script_hash: ScriptHash): DRep {
    const script_hashPtr = Ptr._assertClass(script_hash, ScriptHash);
    const ret = CslMobileBridge.csl_bridge_d_rep_new_script_hash_jsi(script_hashPtr);
    return Ptr._wrap(ret, DRep);
  }

  static new_always_abstain(): DRep {
    const ret = CslMobileBridge.csl_bridge_d_rep_new_always_abstain_jsi();
    return Ptr._wrap(ret, DRep);
  }

  static new_always_no_confidence(): DRep {
    const ret = CslMobileBridge.csl_bridge_d_rep_new_always_no_confidence_jsi();
    return Ptr._wrap(ret, DRep);
  }

  static new_from_credential(cred: Credential): DRep {
    const credPtr = Ptr._assertClass(cred, Credential);
    const ret = CslMobileBridge.csl_bridge_d_rep_new_from_credential_jsi(credPtr);
    return Ptr._wrap(ret, DRep);
  }

  kind(): DRepKind {
    const ret = CslMobileBridge.csl_bridge_d_rep_kind_jsi(this.ptr);
    return ret;
  }

  to_key_hash(): Optional<Ed25519KeyHash> {
    const ret = CslMobileBridge.csl_bridge_d_rep_to_key_hash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  to_script_hash(): Optional<ScriptHash> {
    const ret = CslMobileBridge.csl_bridge_d_rep_to_script_hash_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptHash);
  }

  to_bech32(cip_129_format: boolean): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_to_bech32_jsi(this.ptr, cip_129_format);
    return ret;
  }

  static from_bech32(bech32_str: string): DRep {
    const ret = CslMobileBridge.csl_bridge_d_rep_from_bech32_jsi(bech32_str);
    return Ptr._wrap(ret, DRep);
  }

}

export class DRepDeregistration extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_d_rep_deregistration_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): DRepDeregistration {
    const ret = CslMobileBridge.csl_bridge_d_rep_deregistration_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, DRepDeregistration);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_deregistration_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): DRepDeregistration {
    const ret = CslMobileBridge.csl_bridge_d_rep_deregistration_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, DRepDeregistration);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_deregistration_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): DRepDeregistration {
    const ret = CslMobileBridge.csl_bridge_d_rep_deregistration_from_json_jsi(json);
    return Ptr._wrap(ret, DRepDeregistration);
  }

  voting_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_d_rep_deregistration_voting_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  coin(): BigNum {
    const ret = CslMobileBridge.csl_bridge_d_rep_deregistration_coin_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(voting_credential: Credential, coin: BigNum): DRepDeregistration {
    const voting_credentialPtr = Ptr._assertClass(voting_credential, Credential);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_d_rep_deregistration_new_jsi(voting_credentialPtr, coinPtr);
    return Ptr._wrap(ret, DRepDeregistration);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_d_rep_deregistration_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class DRepRegistration extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): DRepRegistration {
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, DRepRegistration);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): DRepRegistration {
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, DRepRegistration);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): DRepRegistration {
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_from_json_jsi(json);
    return Ptr._wrap(ret, DRepRegistration);
  }

  voting_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_voting_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  coin(): BigNum {
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_coin_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  anchor(): Optional<Anchor> {
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_anchor_jsi(this.ptr);
    return Ptr._wrap(ret, Anchor);
  }

  static new(voting_credential: Credential, coin: BigNum): DRepRegistration {
    const voting_credentialPtr = Ptr._assertClass(voting_credential, Credential);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_new_jsi(voting_credentialPtr, coinPtr);
    return Ptr._wrap(ret, DRepRegistration);
  }

  static new_with_anchor(voting_credential: Credential, coin: BigNum, anchor: Anchor): DRepRegistration {
    const voting_credentialPtr = Ptr._assertClass(voting_credential, Credential);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const anchorPtr = Ptr._assertClass(anchor, Anchor);
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_new_with_anchor_jsi(voting_credentialPtr, coinPtr, anchorPtr);
    return Ptr._wrap(ret, DRepRegistration);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_d_rep_registration_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class DRepUpdate extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_d_rep_update_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): DRepUpdate {
    const ret = CslMobileBridge.csl_bridge_d_rep_update_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, DRepUpdate);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_update_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): DRepUpdate {
    const ret = CslMobileBridge.csl_bridge_d_rep_update_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, DRepUpdate);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_update_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): DRepUpdate {
    const ret = CslMobileBridge.csl_bridge_d_rep_update_from_json_jsi(json);
    return Ptr._wrap(ret, DRepUpdate);
  }

  voting_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_d_rep_update_voting_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  anchor(): Optional<Anchor> {
    const ret = CslMobileBridge.csl_bridge_d_rep_update_anchor_jsi(this.ptr);
    return Ptr._wrap(ret, Anchor);
  }

  static new(voting_credential: Credential): DRepUpdate {
    const voting_credentialPtr = Ptr._assertClass(voting_credential, Credential);
    const ret = CslMobileBridge.csl_bridge_d_rep_update_new_jsi(voting_credentialPtr);
    return Ptr._wrap(ret, DRepUpdate);
  }

  static new_with_anchor(voting_credential: Credential, anchor: Anchor): DRepUpdate {
    const voting_credentialPtr = Ptr._assertClass(voting_credential, Credential);
    const anchorPtr = Ptr._assertClass(anchor, Anchor);
    const ret = CslMobileBridge.csl_bridge_d_rep_update_new_with_anchor_jsi(voting_credentialPtr, anchorPtr);
    return Ptr._wrap(ret, DRepUpdate);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_d_rep_update_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class DRepVotingThresholds extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): DRepVotingThresholds {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, DRepVotingThresholds);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): DRepVotingThresholds {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, DRepVotingThresholds);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): DRepVotingThresholds {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_from_json_jsi(json);
    return Ptr._wrap(ret, DRepVotingThresholds);
  }

  static new(motion_no_confidence: UnitInterval, committee_normal: UnitInterval, committee_no_confidence: UnitInterval, update_constitution: UnitInterval, hard_fork_initiation: UnitInterval, pp_network_group: UnitInterval, pp_economic_group: UnitInterval, pp_technical_group: UnitInterval, pp_governance_group: UnitInterval, treasury_withdrawal: UnitInterval): DRepVotingThresholds {
    const motion_no_confidencePtr = Ptr._assertClass(motion_no_confidence, UnitInterval);
    const committee_normalPtr = Ptr._assertClass(committee_normal, UnitInterval);
    const committee_no_confidencePtr = Ptr._assertClass(committee_no_confidence, UnitInterval);
    const update_constitutionPtr = Ptr._assertClass(update_constitution, UnitInterval);
    const hard_fork_initiationPtr = Ptr._assertClass(hard_fork_initiation, UnitInterval);
    const pp_network_groupPtr = Ptr._assertClass(pp_network_group, UnitInterval);
    const pp_economic_groupPtr = Ptr._assertClass(pp_economic_group, UnitInterval);
    const pp_technical_groupPtr = Ptr._assertClass(pp_technical_group, UnitInterval);
    const pp_governance_groupPtr = Ptr._assertClass(pp_governance_group, UnitInterval);
    const treasury_withdrawalPtr = Ptr._assertClass(treasury_withdrawal, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_new_jsi(motion_no_confidencePtr, committee_normalPtr, committee_no_confidencePtr, update_constitutionPtr, hard_fork_initiationPtr, pp_network_groupPtr, pp_economic_groupPtr, pp_technical_groupPtr, pp_governance_groupPtr, treasury_withdrawalPtr);
    return Ptr._wrap(ret, DRepVotingThresholds);
  }

  set_motion_no_confidence(motion_no_confidence: UnitInterval): void {
    const motion_no_confidencePtr = Ptr._assertClass(motion_no_confidence, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_set_motion_no_confidence_jsi(this.ptr, motion_no_confidencePtr);
    return ret;
  }

  set_committee_normal(committee_normal: UnitInterval): void {
    const committee_normalPtr = Ptr._assertClass(committee_normal, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_set_committee_normal_jsi(this.ptr, committee_normalPtr);
    return ret;
  }

  set_committee_no_confidence(committee_no_confidence: UnitInterval): void {
    const committee_no_confidencePtr = Ptr._assertClass(committee_no_confidence, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_set_committee_no_confidence_jsi(this.ptr, committee_no_confidencePtr);
    return ret;
  }

  set_update_constitution(update_constitution: UnitInterval): void {
    const update_constitutionPtr = Ptr._assertClass(update_constitution, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_set_update_constitution_jsi(this.ptr, update_constitutionPtr);
    return ret;
  }

  set_hard_fork_initiation(hard_fork_initiation: UnitInterval): void {
    const hard_fork_initiationPtr = Ptr._assertClass(hard_fork_initiation, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_set_hard_fork_initiation_jsi(this.ptr, hard_fork_initiationPtr);
    return ret;
  }

  set_pp_network_group(pp_network_group: UnitInterval): void {
    const pp_network_groupPtr = Ptr._assertClass(pp_network_group, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_set_pp_network_group_jsi(this.ptr, pp_network_groupPtr);
    return ret;
  }

  set_pp_economic_group(pp_economic_group: UnitInterval): void {
    const pp_economic_groupPtr = Ptr._assertClass(pp_economic_group, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_set_pp_economic_group_jsi(this.ptr, pp_economic_groupPtr);
    return ret;
  }

  set_pp_technical_group(pp_technical_group: UnitInterval): void {
    const pp_technical_groupPtr = Ptr._assertClass(pp_technical_group, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_set_pp_technical_group_jsi(this.ptr, pp_technical_groupPtr);
    return ret;
  }

  set_pp_governance_group(pp_governance_group: UnitInterval): void {
    const pp_governance_groupPtr = Ptr._assertClass(pp_governance_group, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_set_pp_governance_group_jsi(this.ptr, pp_governance_groupPtr);
    return ret;
  }

  set_treasury_withdrawal(treasury_withdrawal: UnitInterval): void {
    const treasury_withdrawalPtr = Ptr._assertClass(treasury_withdrawal, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_set_treasury_withdrawal_jsi(this.ptr, treasury_withdrawalPtr);
    return ret;
  }

  motion_no_confidence(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_motion_no_confidence_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  committee_normal(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_committee_normal_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  committee_no_confidence(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_committee_no_confidence_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  update_constitution(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_update_constitution_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  hard_fork_initiation(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_hard_fork_initiation_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  pp_network_group(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_pp_network_group_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  pp_economic_group(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_pp_economic_group_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  pp_technical_group(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_pp_technical_group_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  pp_governance_group(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_pp_governance_group_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  treasury_withdrawal(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_d_rep_voting_thresholds_treasury_withdrawal_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

}

export class DataCost extends Ptr {
  static new_coins_per_byte(coins_per_byte: BigNum): DataCost {
    const coins_per_bytePtr = Ptr._assertClass(coins_per_byte, BigNum);
    const ret = CslMobileBridge.csl_bridge_data_cost_new_coins_per_byte_jsi(coins_per_bytePtr);
    return Ptr._wrap(ret, DataCost);
  }

  coins_per_byte(): BigNum {
    const ret = CslMobileBridge.csl_bridge_data_cost_coins_per_byte_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

}

export class DataHash extends Ptr {
  static from_bytes(bytes: Uint8Array): DataHash {
    const ret = CslMobileBridge.csl_bridge_data_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, DataHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_data_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_data_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): DataHash {
    const ret = CslMobileBridge.csl_bridge_data_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, DataHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_data_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): DataHash {
    const ret = CslMobileBridge.csl_bridge_data_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, DataHash);
  }

}

export class DatumSource extends Ptr {
  static new(datum: PlutusData): DatumSource {
    const datumPtr = Ptr._assertClass(datum, PlutusData);
    const ret = CslMobileBridge.csl_bridge_datum_source_new_jsi(datumPtr);
    return Ptr._wrap(ret, DatumSource);
  }

  static new_ref_input(input: TransactionInput): DatumSource {
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const ret = CslMobileBridge.csl_bridge_datum_source_new_ref_input_jsi(inputPtr);
    return Ptr._wrap(ret, DatumSource);
  }

}

export class Ed25519KeyHash extends Ptr {
  static from_bytes(bytes: Uint8Array): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

}

export class Ed25519KeyHashes extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Ed25519KeyHashes {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Ed25519KeyHashes);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Ed25519KeyHashes {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Ed25519KeyHashes);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Ed25519KeyHashes {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_from_json_jsi(json);
    return Ptr._wrap(ret, Ed25519KeyHashes);
  }

  static new(): Ed25519KeyHashes {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_new_jsi();
    return Ptr._wrap(ret, Ed25519KeyHashes);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  add(keyhash: Ed25519KeyHash): boolean {
    const keyhashPtr = Ptr._assertClass(keyhash, Ed25519KeyHash);
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_add_jsi(this.ptr, keyhashPtr);
    return ret;
  }

  contains(elem: Ed25519KeyHash): boolean {
    const elemPtr = Ptr._assertClass(elem, Ed25519KeyHash);
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_contains_jsi(this.ptr, elemPtr);
    return ret;
  }

  to_option(): Optional<Ed25519KeyHashes> {
    const ret = CslMobileBridge.csl_bridge_ed25519_key_hashes_to_option_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHashes);
  }

}

export class Ed25519Signature extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_ed25519_signature_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(): string {
    const ret = CslMobileBridge.csl_bridge_ed25519_signature_to_bech32_jsi(this.ptr);
    return ret;
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_ed25519_signature_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_bech32(bech32_str: string): Ed25519Signature {
    const ret = CslMobileBridge.csl_bridge_ed25519_signature_from_bech32_jsi(bech32_str);
    return Ptr._wrap(ret, Ed25519Signature);
  }

  static from_hex(input: string): Ed25519Signature {
    const ret = CslMobileBridge.csl_bridge_ed25519_signature_from_hex_jsi(input);
    return Ptr._wrap(ret, Ed25519Signature);
  }

  static from_bytes(bytes: Uint8Array): Ed25519Signature {
    const ret = CslMobileBridge.csl_bridge_ed25519_signature_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Ed25519Signature);
  }

}

export class EnterpriseAddress extends Ptr {
  static new(network: number, payment: Credential): EnterpriseAddress {
    const paymentPtr = Ptr._assertClass(payment, Credential);
    const ret = CslMobileBridge.csl_bridge_enterprise_address_new_jsi(network, paymentPtr);
    return Ptr._wrap(ret, EnterpriseAddress);
  }

  payment_cred(): Credential {
    const ret = CslMobileBridge.csl_bridge_enterprise_address_payment_cred_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  to_address(): Address {
    const ret = CslMobileBridge.csl_bridge_enterprise_address_to_address_jsi(this.ptr);
    return Ptr._wrap(ret, Address);
  }

  static from_address(addr: Address): Optional<EnterpriseAddress> {
    const addrPtr = Ptr._assertClass(addr, Address);
    const ret = CslMobileBridge.csl_bridge_enterprise_address_from_address_jsi(addrPtr);
    return Ptr._wrap(ret, EnterpriseAddress);
  }

  network_id(): number {
    const ret = CslMobileBridge.csl_bridge_enterprise_address_network_id_jsi(this.ptr);
    return ret;
  }

}

export class ExUnitPrices extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_ex_unit_prices_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ExUnitPrices {
    const ret = CslMobileBridge.csl_bridge_ex_unit_prices_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ExUnitPrices);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_ex_unit_prices_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ExUnitPrices {
    const ret = CslMobileBridge.csl_bridge_ex_unit_prices_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ExUnitPrices);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_ex_unit_prices_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ExUnitPrices {
    const ret = CslMobileBridge.csl_bridge_ex_unit_prices_from_json_jsi(json);
    return Ptr._wrap(ret, ExUnitPrices);
  }

  mem_price(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_ex_unit_prices_mem_price_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  step_price(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_ex_unit_prices_step_price_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  static new(mem_price: UnitInterval, step_price: UnitInterval): ExUnitPrices {
    const mem_pricePtr = Ptr._assertClass(mem_price, UnitInterval);
    const step_pricePtr = Ptr._assertClass(step_price, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_ex_unit_prices_new_jsi(mem_pricePtr, step_pricePtr);
    return Ptr._wrap(ret, ExUnitPrices);
  }

}

export class ExUnits extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_ex_units_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ExUnits {
    const ret = CslMobileBridge.csl_bridge_ex_units_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ExUnits);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_ex_units_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ExUnits {
    const ret = CslMobileBridge.csl_bridge_ex_units_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ExUnits);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_ex_units_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ExUnits {
    const ret = CslMobileBridge.csl_bridge_ex_units_from_json_jsi(json);
    return Ptr._wrap(ret, ExUnits);
  }

  mem(): BigNum {
    const ret = CslMobileBridge.csl_bridge_ex_units_mem_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  steps(): BigNum {
    const ret = CslMobileBridge.csl_bridge_ex_units_steps_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(mem: BigNum, steps: BigNum): ExUnits {
    const memPtr = Ptr._assertClass(mem, BigNum);
    const stepsPtr = Ptr._assertClass(steps, BigNum);
    const ret = CslMobileBridge.csl_bridge_ex_units_new_jsi(memPtr, stepsPtr);
    return Ptr._wrap(ret, ExUnits);
  }

}

export class FixedBlock extends Ptr {
  static from_bytes(bytes: Uint8Array): FixedBlock {
    const ret = CslMobileBridge.csl_bridge_fixed_block_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, FixedBlock);
  }

  static from_hex(hex_str: string): FixedBlock {
    const ret = CslMobileBridge.csl_bridge_fixed_block_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, FixedBlock);
  }

  header(): Header {
    const ret = CslMobileBridge.csl_bridge_fixed_block_header_jsi(this.ptr);
    return Ptr._wrap(ret, Header);
  }

  transaction_bodies(): FixedTransactionBodies {
    const ret = CslMobileBridge.csl_bridge_fixed_block_transaction_bodies_jsi(this.ptr);
    return Ptr._wrap(ret, FixedTransactionBodies);
  }

  transaction_witness_sets(): TransactionWitnessSets {
    const ret = CslMobileBridge.csl_bridge_fixed_block_transaction_witness_sets_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionWitnessSets);
  }

  auxiliary_data_set(): AuxiliaryDataSet {
    const ret = CslMobileBridge.csl_bridge_fixed_block_auxiliary_data_set_jsi(this.ptr);
    return Ptr._wrap(ret, AuxiliaryDataSet);
  }

  invalid_transactions(): Uint32Array {
    const ret = CslMobileBridge.csl_bridge_fixed_block_invalid_transactions_jsi(this.ptr);
    return base64ToUint32Array(ret);
  }

  block_hash(): BlockHash {
    const ret = CslMobileBridge.csl_bridge_fixed_block_block_hash_jsi(this.ptr);
    return Ptr._wrap(ret, BlockHash);
  }

}

export class FixedTransaction extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): FixedTransaction {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, FixedTransaction);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): FixedTransaction {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, FixedTransaction);
  }

  static new(raw_body: Uint8Array, raw_witness_set: Uint8Array, is_valid: boolean): FixedTransaction {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_new_jsi(b64FromUint8Array(raw_body), b64FromUint8Array(raw_witness_set), is_valid);
    return Ptr._wrap(ret, FixedTransaction);
  }

  static new_with_auxiliary(raw_body: Uint8Array, raw_witness_set: Uint8Array, raw_auxiliary_data: Uint8Array, is_valid: boolean): FixedTransaction {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_new_with_auxiliary_jsi(b64FromUint8Array(raw_body), b64FromUint8Array(raw_witness_set), b64FromUint8Array(raw_auxiliary_data), is_valid);
    return Ptr._wrap(ret, FixedTransaction);
  }

  static new_from_body_bytes(raw_body: Uint8Array): FixedTransaction {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_new_from_body_bytes_jsi(b64FromUint8Array(raw_body));
    return Ptr._wrap(ret, FixedTransaction);
  }

  body(): TransactionBody {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_body_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionBody);
  }

  raw_body(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_raw_body_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  set_body(raw_body: Uint8Array): void {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_set_body_jsi(this.ptr, b64FromUint8Array(raw_body));
    return ret;
  }

  set_witness_set(raw_witness_set: Uint8Array): void {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_set_witness_set_jsi(this.ptr, b64FromUint8Array(raw_witness_set));
    return ret;
  }

  witness_set(): TransactionWitnessSet {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_witness_set_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionWitnessSet);
  }

  raw_witness_set(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_raw_witness_set_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  set_is_valid(valid: boolean): void {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_set_is_valid_jsi(this.ptr, valid);
    return ret;
  }

  is_valid(): boolean {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_is_valid_jsi(this.ptr);
    return ret;
  }

  set_auxiliary_data(raw_auxiliary_data: Uint8Array): void {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_set_auxiliary_data_jsi(this.ptr, b64FromUint8Array(raw_auxiliary_data));
    return ret;
  }

  auxiliary_data(): Optional<AuxiliaryData> {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_auxiliary_data_jsi(this.ptr);
    return Ptr._wrap(ret, AuxiliaryData);
  }

  raw_auxiliary_data(): Optional<Uint8Array> {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_raw_auxiliary_data_jsi(this.ptr);
    return ret == null ? undefined : uint8ArrayFromB64(ret);
  }

  transaction_hash(): TransactionHash {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_transaction_hash_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionHash);
  }

  add_vkey_witness(vkey_witness: Vkeywitness): void {
    const vkey_witnessPtr = Ptr._assertClass(vkey_witness, Vkeywitness);
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_add_vkey_witness_jsi(this.ptr, vkey_witnessPtr);
    return ret;
  }

  add_bootstrap_witness(bootstrap_witness: BootstrapWitness): void {
    const bootstrap_witnessPtr = Ptr._assertClass(bootstrap_witness, BootstrapWitness);
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_add_bootstrap_witness_jsi(this.ptr, bootstrap_witnessPtr);
    return ret;
  }

  sign_and_add_vkey_signature(private_key: PrivateKey): void {
    const private_keyPtr = Ptr._assertClass(private_key, PrivateKey);
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_sign_and_add_vkey_signature_jsi(this.ptr, private_keyPtr);
    return ret;
  }

  sign_and_add_icarus_bootstrap_signature(addr: ByronAddress, private_key: Bip32PrivateKey): void {
    const addrPtr = Ptr._assertClass(addr, ByronAddress);
    const private_keyPtr = Ptr._assertClass(private_key, Bip32PrivateKey);
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_sign_and_add_icarus_bootstrap_signature_jsi(this.ptr, addrPtr, private_keyPtr);
    return ret;
  }

  sign_and_add_daedalus_bootstrap_signature(addr: ByronAddress, private_key: LegacyDaedalusPrivateKey): void {
    const addrPtr = Ptr._assertClass(addr, ByronAddress);
    const private_keyPtr = Ptr._assertClass(private_key, LegacyDaedalusPrivateKey);
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_sign_and_add_daedalus_bootstrap_signature_jsi(this.ptr, addrPtr, private_keyPtr);
    return ret;
  }

}

export class FixedTransactionBodies extends Ptr {
  static from_bytes(bytes: Uint8Array): FixedTransactionBodies {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_bodies_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, FixedTransactionBodies);
  }

  static from_hex(hex_str: string): FixedTransactionBodies {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_bodies_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, FixedTransactionBodies);
  }

  static new(): FixedTransactionBodies {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_bodies_new_jsi();
    return Ptr._wrap(ret, FixedTransactionBodies);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_bodies_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): FixedTransactionBody {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_bodies_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, FixedTransactionBody);
  }

  add(elem: FixedTransactionBody): void {
    const elemPtr = Ptr._assertClass(elem, FixedTransactionBody);
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_bodies_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class FixedTransactionBody extends Ptr {
  static from_bytes(bytes: Uint8Array): FixedTransactionBody {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_body_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, FixedTransactionBody);
  }

  static from_hex(hex_str: string): FixedTransactionBody {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_body_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, FixedTransactionBody);
  }

  transaction_body(): TransactionBody {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_body_transaction_body_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionBody);
  }

  tx_hash(): TransactionHash {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_body_tx_hash_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionHash);
  }

  original_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_fixed_transaction_body_original_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

}

export class FixedTxWitnessesSet extends Ptr {
  tx_witnesses_set(): TransactionWitnessSet {
    const ret = CslMobileBridge.csl_bridge_fixed_tx_witnesses_set_tx_witnesses_set_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionWitnessSet);
  }

  add_vkey_witness(vkey_witness: Vkeywitness): void {
    const vkey_witnessPtr = Ptr._assertClass(vkey_witness, Vkeywitness);
    const ret = CslMobileBridge.csl_bridge_fixed_tx_witnesses_set_add_vkey_witness_jsi(this.ptr, vkey_witnessPtr);
    return ret;
  }

  add_bootstrap_witness(bootstrap_witness: BootstrapWitness): void {
    const bootstrap_witnessPtr = Ptr._assertClass(bootstrap_witness, BootstrapWitness);
    const ret = CslMobileBridge.csl_bridge_fixed_tx_witnesses_set_add_bootstrap_witness_jsi(this.ptr, bootstrap_witnessPtr);
    return ret;
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_fixed_tx_witnesses_set_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(data: Uint8Array): FixedTxWitnessesSet {
    const ret = CslMobileBridge.csl_bridge_fixed_tx_witnesses_set_from_bytes_jsi(b64FromUint8Array(data));
    return Ptr._wrap(ret, FixedTxWitnessesSet);
  }

}

export class FixedVersionedBlock extends Ptr {
  static from_bytes(bytes: Uint8Array): FixedVersionedBlock {
    const ret = CslMobileBridge.csl_bridge_fixed_versioned_block_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, FixedVersionedBlock);
  }

  static from_hex(hex_str: string): FixedVersionedBlock {
    const ret = CslMobileBridge.csl_bridge_fixed_versioned_block_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, FixedVersionedBlock);
  }

  block(): FixedBlock {
    const ret = CslMobileBridge.csl_bridge_fixed_versioned_block_block_jsi(this.ptr);
    return Ptr._wrap(ret, FixedBlock);
  }

  era(): BlockEra {
    const ret = CslMobileBridge.csl_bridge_fixed_versioned_block_era_jsi(this.ptr);
    return ret;
  }

}

export class GeneralTransactionMetadata extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): GeneralTransactionMetadata {
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, GeneralTransactionMetadata);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): GeneralTransactionMetadata {
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, GeneralTransactionMetadata);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): GeneralTransactionMetadata {
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_from_json_jsi(json);
    return Ptr._wrap(ret, GeneralTransactionMetadata);
  }

  static new(): GeneralTransactionMetadata {
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_new_jsi();
    return Ptr._wrap(ret, GeneralTransactionMetadata);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_len_jsi(this.ptr);
    return ret;
  }

  insert(key: BigNum, value: TransactionMetadatum): Optional<TransactionMetadatum> {
    const keyPtr = Ptr._assertClass(key, BigNum);
    const valuePtr = Ptr._assertClass(value, TransactionMetadatum);
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_insert_jsi(this.ptr, keyPtr, valuePtr);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  get(key: BigNum): Optional<TransactionMetadatum> {
    const keyPtr = Ptr._assertClass(key, BigNum);
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_get_jsi(this.ptr, keyPtr);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  keys(): TransactionMetadatumLabels {
    const ret = CslMobileBridge.csl_bridge_general_transaction_metadata_keys_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionMetadatumLabels);
  }

}

export class GenesisDelegateHash extends Ptr {
  static from_bytes(bytes: Uint8Array): GenesisDelegateHash {
    const ret = CslMobileBridge.csl_bridge_genesis_delegate_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, GenesisDelegateHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_genesis_delegate_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_genesis_delegate_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): GenesisDelegateHash {
    const ret = CslMobileBridge.csl_bridge_genesis_delegate_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, GenesisDelegateHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_genesis_delegate_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): GenesisDelegateHash {
    const ret = CslMobileBridge.csl_bridge_genesis_delegate_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, GenesisDelegateHash);
  }

}

export class GenesisHash extends Ptr {
  static from_bytes(bytes: Uint8Array): GenesisHash {
    const ret = CslMobileBridge.csl_bridge_genesis_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, GenesisHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_genesis_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_genesis_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): GenesisHash {
    const ret = CslMobileBridge.csl_bridge_genesis_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, GenesisHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_genesis_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): GenesisHash {
    const ret = CslMobileBridge.csl_bridge_genesis_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, GenesisHash);
  }

}

export class GenesisHashes extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_genesis_hashes_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): GenesisHashes {
    const ret = CslMobileBridge.csl_bridge_genesis_hashes_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, GenesisHashes);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_genesis_hashes_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): GenesisHashes {
    const ret = CslMobileBridge.csl_bridge_genesis_hashes_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, GenesisHashes);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_genesis_hashes_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): GenesisHashes {
    const ret = CslMobileBridge.csl_bridge_genesis_hashes_from_json_jsi(json);
    return Ptr._wrap(ret, GenesisHashes);
  }

  static new(): GenesisHashes {
    const ret = CslMobileBridge.csl_bridge_genesis_hashes_new_jsi();
    return Ptr._wrap(ret, GenesisHashes);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_genesis_hashes_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): GenesisHash {
    const ret = CslMobileBridge.csl_bridge_genesis_hashes_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, GenesisHash);
  }

  add(elem: GenesisHash): void {
    const elemPtr = Ptr._assertClass(elem, GenesisHash);
    const ret = CslMobileBridge.csl_bridge_genesis_hashes_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class GenesisKeyDelegation extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_genesis_key_delegation_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): GenesisKeyDelegation {
    const ret = CslMobileBridge.csl_bridge_genesis_key_delegation_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, GenesisKeyDelegation);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_genesis_key_delegation_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): GenesisKeyDelegation {
    const ret = CslMobileBridge.csl_bridge_genesis_key_delegation_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, GenesisKeyDelegation);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_genesis_key_delegation_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): GenesisKeyDelegation {
    const ret = CslMobileBridge.csl_bridge_genesis_key_delegation_from_json_jsi(json);
    return Ptr._wrap(ret, GenesisKeyDelegation);
  }

  genesishash(): GenesisHash {
    const ret = CslMobileBridge.csl_bridge_genesis_key_delegation_genesishash_jsi(this.ptr);
    return Ptr._wrap(ret, GenesisHash);
  }

  genesis_delegate_hash(): GenesisDelegateHash {
    const ret = CslMobileBridge.csl_bridge_genesis_key_delegation_genesis_delegate_hash_jsi(this.ptr);
    return Ptr._wrap(ret, GenesisDelegateHash);
  }

  vrf_keyhash(): VRFKeyHash {
    const ret = CslMobileBridge.csl_bridge_genesis_key_delegation_vrf_keyhash_jsi(this.ptr);
    return Ptr._wrap(ret, VRFKeyHash);
  }

  static new(genesishash: GenesisHash, genesis_delegate_hash: GenesisDelegateHash, vrf_keyhash: VRFKeyHash): GenesisKeyDelegation {
    const genesishashPtr = Ptr._assertClass(genesishash, GenesisHash);
    const genesis_delegate_hashPtr = Ptr._assertClass(genesis_delegate_hash, GenesisDelegateHash);
    const vrf_keyhashPtr = Ptr._assertClass(vrf_keyhash, VRFKeyHash);
    const ret = CslMobileBridge.csl_bridge_genesis_key_delegation_new_jsi(genesishashPtr, genesis_delegate_hashPtr, vrf_keyhashPtr);
    return Ptr._wrap(ret, GenesisKeyDelegation);
  }

}

export class GovernanceAction extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_governance_action_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): GovernanceAction {
    const ret = CslMobileBridge.csl_bridge_governance_action_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, GovernanceAction);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_governance_action_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): GovernanceAction {
    const ret = CslMobileBridge.csl_bridge_governance_action_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, GovernanceAction);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_governance_action_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): GovernanceAction {
    const ret = CslMobileBridge.csl_bridge_governance_action_from_json_jsi(json);
    return Ptr._wrap(ret, GovernanceAction);
  }

  static new_parameter_change_action(parameter_change_action: ParameterChangeAction): GovernanceAction {
    const parameter_change_actionPtr = Ptr._assertClass(parameter_change_action, ParameterChangeAction);
    const ret = CslMobileBridge.csl_bridge_governance_action_new_parameter_change_action_jsi(parameter_change_actionPtr);
    return Ptr._wrap(ret, GovernanceAction);
  }

  static new_hard_fork_initiation_action(hard_fork_initiation_action: HardForkInitiationAction): GovernanceAction {
    const hard_fork_initiation_actionPtr = Ptr._assertClass(hard_fork_initiation_action, HardForkInitiationAction);
    const ret = CslMobileBridge.csl_bridge_governance_action_new_hard_fork_initiation_action_jsi(hard_fork_initiation_actionPtr);
    return Ptr._wrap(ret, GovernanceAction);
  }

  static new_treasury_withdrawals_action(treasury_withdrawals_action: TreasuryWithdrawalsAction): GovernanceAction {
    const treasury_withdrawals_actionPtr = Ptr._assertClass(treasury_withdrawals_action, TreasuryWithdrawalsAction);
    const ret = CslMobileBridge.csl_bridge_governance_action_new_treasury_withdrawals_action_jsi(treasury_withdrawals_actionPtr);
    return Ptr._wrap(ret, GovernanceAction);
  }

  static new_no_confidence_action(no_confidence_action: NoConfidenceAction): GovernanceAction {
    const no_confidence_actionPtr = Ptr._assertClass(no_confidence_action, NoConfidenceAction);
    const ret = CslMobileBridge.csl_bridge_governance_action_new_no_confidence_action_jsi(no_confidence_actionPtr);
    return Ptr._wrap(ret, GovernanceAction);
  }

  static new_new_committee_action(new_committee_action: UpdateCommitteeAction): GovernanceAction {
    const new_committee_actionPtr = Ptr._assertClass(new_committee_action, UpdateCommitteeAction);
    const ret = CslMobileBridge.csl_bridge_governance_action_new_new_committee_action_jsi(new_committee_actionPtr);
    return Ptr._wrap(ret, GovernanceAction);
  }

  static new_new_constitution_action(new_constitution_action: NewConstitutionAction): GovernanceAction {
    const new_constitution_actionPtr = Ptr._assertClass(new_constitution_action, NewConstitutionAction);
    const ret = CslMobileBridge.csl_bridge_governance_action_new_new_constitution_action_jsi(new_constitution_actionPtr);
    return Ptr._wrap(ret, GovernanceAction);
  }

  static new_info_action(info_action: InfoAction): GovernanceAction {
    const info_actionPtr = Ptr._assertClass(info_action, InfoAction);
    const ret = CslMobileBridge.csl_bridge_governance_action_new_info_action_jsi(info_actionPtr);
    return Ptr._wrap(ret, GovernanceAction);
  }

  kind(): GovernanceActionKind {
    const ret = CslMobileBridge.csl_bridge_governance_action_kind_jsi(this.ptr);
    return ret;
  }

  as_parameter_change_action(): Optional<ParameterChangeAction> {
    const ret = CslMobileBridge.csl_bridge_governance_action_as_parameter_change_action_jsi(this.ptr);
    return Ptr._wrap(ret, ParameterChangeAction);
  }

  as_hard_fork_initiation_action(): Optional<HardForkInitiationAction> {
    const ret = CslMobileBridge.csl_bridge_governance_action_as_hard_fork_initiation_action_jsi(this.ptr);
    return Ptr._wrap(ret, HardForkInitiationAction);
  }

  as_treasury_withdrawals_action(): Optional<TreasuryWithdrawalsAction> {
    const ret = CslMobileBridge.csl_bridge_governance_action_as_treasury_withdrawals_action_jsi(this.ptr);
    return Ptr._wrap(ret, TreasuryWithdrawalsAction);
  }

  as_no_confidence_action(): Optional<NoConfidenceAction> {
    const ret = CslMobileBridge.csl_bridge_governance_action_as_no_confidence_action_jsi(this.ptr);
    return Ptr._wrap(ret, NoConfidenceAction);
  }

  as_new_committee_action(): Optional<UpdateCommitteeAction> {
    const ret = CslMobileBridge.csl_bridge_governance_action_as_new_committee_action_jsi(this.ptr);
    return Ptr._wrap(ret, UpdateCommitteeAction);
  }

  as_new_constitution_action(): Optional<NewConstitutionAction> {
    const ret = CslMobileBridge.csl_bridge_governance_action_as_new_constitution_action_jsi(this.ptr);
    return Ptr._wrap(ret, NewConstitutionAction);
  }

  as_info_action(): Optional<InfoAction> {
    const ret = CslMobileBridge.csl_bridge_governance_action_as_info_action_jsi(this.ptr);
    return Ptr._wrap(ret, InfoAction);
  }

}

export class GovernanceActionId extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_governance_action_id_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): GovernanceActionId {
    const ret = CslMobileBridge.csl_bridge_governance_action_id_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, GovernanceActionId);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_governance_action_id_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): GovernanceActionId {
    const ret = CslMobileBridge.csl_bridge_governance_action_id_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, GovernanceActionId);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_governance_action_id_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): GovernanceActionId {
    const ret = CslMobileBridge.csl_bridge_governance_action_id_from_json_jsi(json);
    return Ptr._wrap(ret, GovernanceActionId);
  }

  transaction_id(): TransactionHash {
    const ret = CslMobileBridge.csl_bridge_governance_action_id_transaction_id_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionHash);
  }

  index(): number {
    const ret = CslMobileBridge.csl_bridge_governance_action_id_index_jsi(this.ptr);
    return ret;
  }

  static new(transaction_id: TransactionHash, index: number): GovernanceActionId {
    const transaction_idPtr = Ptr._assertClass(transaction_id, TransactionHash);
    const ret = CslMobileBridge.csl_bridge_governance_action_id_new_jsi(transaction_idPtr, index);
    return Ptr._wrap(ret, GovernanceActionId);
  }

}

export class GovernanceActionIds extends Ptr {
  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_governance_action_ids_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): GovernanceActionIds {
    const ret = CslMobileBridge.csl_bridge_governance_action_ids_from_json_jsi(json);
    return Ptr._wrap(ret, GovernanceActionIds);
  }

  static new(): GovernanceActionIds {
    const ret = CslMobileBridge.csl_bridge_governance_action_ids_new_jsi();
    return Ptr._wrap(ret, GovernanceActionIds);
  }

  add(governance_action_id: GovernanceActionId): void {
    const governance_action_idPtr = Ptr._assertClass(governance_action_id, GovernanceActionId);
    const ret = CslMobileBridge.csl_bridge_governance_action_ids_add_jsi(this.ptr, governance_action_idPtr);
    return ret;
  }

  get(index: number): Optional<GovernanceActionId> {
    const ret = CslMobileBridge.csl_bridge_governance_action_ids_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, GovernanceActionId);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_governance_action_ids_len_jsi(this.ptr);
    return ret;
  }

}

export class HardForkInitiationAction extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_hard_fork_initiation_action_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): HardForkInitiationAction {
    const ret = CslMobileBridge.csl_bridge_hard_fork_initiation_action_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, HardForkInitiationAction);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_hard_fork_initiation_action_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): HardForkInitiationAction {
    const ret = CslMobileBridge.csl_bridge_hard_fork_initiation_action_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, HardForkInitiationAction);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_hard_fork_initiation_action_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): HardForkInitiationAction {
    const ret = CslMobileBridge.csl_bridge_hard_fork_initiation_action_from_json_jsi(json);
    return Ptr._wrap(ret, HardForkInitiationAction);
  }

  gov_action_id(): Optional<GovernanceActionId> {
    const ret = CslMobileBridge.csl_bridge_hard_fork_initiation_action_gov_action_id_jsi(this.ptr);
    return Ptr._wrap(ret, GovernanceActionId);
  }

  protocol_version(): ProtocolVersion {
    const ret = CslMobileBridge.csl_bridge_hard_fork_initiation_action_protocol_version_jsi(this.ptr);
    return Ptr._wrap(ret, ProtocolVersion);
  }

  static new(protocol_version: ProtocolVersion): HardForkInitiationAction {
    const protocol_versionPtr = Ptr._assertClass(protocol_version, ProtocolVersion);
    const ret = CslMobileBridge.csl_bridge_hard_fork_initiation_action_new_jsi(protocol_versionPtr);
    return Ptr._wrap(ret, HardForkInitiationAction);
  }

  static new_with_action_id(gov_action_id: GovernanceActionId, protocol_version: ProtocolVersion): HardForkInitiationAction {
    const gov_action_idPtr = Ptr._assertClass(gov_action_id, GovernanceActionId);
    const protocol_versionPtr = Ptr._assertClass(protocol_version, ProtocolVersion);
    const ret = CslMobileBridge.csl_bridge_hard_fork_initiation_action_new_with_action_id_jsi(gov_action_idPtr, protocol_versionPtr);
    return Ptr._wrap(ret, HardForkInitiationAction);
  }

}

export class Header extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_header_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Header {
    const ret = CslMobileBridge.csl_bridge_header_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Header);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_header_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Header {
    const ret = CslMobileBridge.csl_bridge_header_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Header);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_header_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Header {
    const ret = CslMobileBridge.csl_bridge_header_from_json_jsi(json);
    return Ptr._wrap(ret, Header);
  }

  header_body(): HeaderBody {
    const ret = CslMobileBridge.csl_bridge_header_header_body_jsi(this.ptr);
    return Ptr._wrap(ret, HeaderBody);
  }

  body_signature(): KESSignature {
    const ret = CslMobileBridge.csl_bridge_header_body_signature_jsi(this.ptr);
    return Ptr._wrap(ret, KESSignature);
  }

  static new(header_body: HeaderBody, body_signature: KESSignature): Header {
    const header_bodyPtr = Ptr._assertClass(header_body, HeaderBody);
    const body_signaturePtr = Ptr._assertClass(body_signature, KESSignature);
    const ret = CslMobileBridge.csl_bridge_header_new_jsi(header_bodyPtr, body_signaturePtr);
    return Ptr._wrap(ret, Header);
  }

}

export class HeaderBody extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_header_body_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): HeaderBody {
    const ret = CslMobileBridge.csl_bridge_header_body_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, HeaderBody);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_header_body_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): HeaderBody {
    const ret = CslMobileBridge.csl_bridge_header_body_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, HeaderBody);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_header_body_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): HeaderBody {
    const ret = CslMobileBridge.csl_bridge_header_body_from_json_jsi(json);
    return Ptr._wrap(ret, HeaderBody);
  }

  block_number(): number {
    const ret = CslMobileBridge.csl_bridge_header_body_block_number_jsi(this.ptr);
    return ret;
  }

  slot(): number {
    const ret = CslMobileBridge.csl_bridge_header_body_slot_jsi(this.ptr);
    return ret;
  }

  slot_bignum(): BigNum {
    const ret = CslMobileBridge.csl_bridge_header_body_slot_bignum_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  prev_hash(): Optional<BlockHash> {
    const ret = CslMobileBridge.csl_bridge_header_body_prev_hash_jsi(this.ptr);
    return Ptr._wrap(ret, BlockHash);
  }

  issuer_vkey(): Vkey {
    const ret = CslMobileBridge.csl_bridge_header_body_issuer_vkey_jsi(this.ptr);
    return Ptr._wrap(ret, Vkey);
  }

  vrf_vkey(): VRFVKey {
    const ret = CslMobileBridge.csl_bridge_header_body_vrf_vkey_jsi(this.ptr);
    return Ptr._wrap(ret, VRFVKey);
  }

  has_nonce_and_leader_vrf(): boolean {
    const ret = CslMobileBridge.csl_bridge_header_body_has_nonce_and_leader_vrf_jsi(this.ptr);
    return ret;
  }

  nonce_vrf_or_nothing(): Optional<VRFCert> {
    const ret = CslMobileBridge.csl_bridge_header_body_nonce_vrf_or_nothing_jsi(this.ptr);
    return Ptr._wrap(ret, VRFCert);
  }

  leader_vrf_or_nothing(): Optional<VRFCert> {
    const ret = CslMobileBridge.csl_bridge_header_body_leader_vrf_or_nothing_jsi(this.ptr);
    return Ptr._wrap(ret, VRFCert);
  }

  has_vrf_result(): boolean {
    const ret = CslMobileBridge.csl_bridge_header_body_has_vrf_result_jsi(this.ptr);
    return ret;
  }

  vrf_result_or_nothing(): Optional<VRFCert> {
    const ret = CslMobileBridge.csl_bridge_header_body_vrf_result_or_nothing_jsi(this.ptr);
    return Ptr._wrap(ret, VRFCert);
  }

  block_body_size(): number {
    const ret = CslMobileBridge.csl_bridge_header_body_block_body_size_jsi(this.ptr);
    return ret;
  }

  block_body_hash(): BlockHash {
    const ret = CslMobileBridge.csl_bridge_header_body_block_body_hash_jsi(this.ptr);
    return Ptr._wrap(ret, BlockHash);
  }

  operational_cert(): OperationalCert {
    const ret = CslMobileBridge.csl_bridge_header_body_operational_cert_jsi(this.ptr);
    return Ptr._wrap(ret, OperationalCert);
  }

  protocol_version(): ProtocolVersion {
    const ret = CslMobileBridge.csl_bridge_header_body_protocol_version_jsi(this.ptr);
    return Ptr._wrap(ret, ProtocolVersion);
  }

  static new(block_number: number, slot: number, prev_hash: Optional<BlockHash>, issuer_vkey: Vkey, vrf_vkey: VRFVKey, vrf_result: VRFCert, block_body_size: number, block_body_hash: BlockHash, operational_cert: OperationalCert, protocol_version: ProtocolVersion): HeaderBody {
    const prev_hashPtr = Ptr._assertOptionalClass(prev_hash, BlockHash);
    const issuer_vkeyPtr = Ptr._assertClass(issuer_vkey, Vkey);
    const vrf_vkeyPtr = Ptr._assertClass(vrf_vkey, VRFVKey);
    const vrf_resultPtr = Ptr._assertClass(vrf_result, VRFCert);
    const block_body_hashPtr = Ptr._assertClass(block_body_hash, BlockHash);
    const operational_certPtr = Ptr._assertClass(operational_cert, OperationalCert);
    const protocol_versionPtr = Ptr._assertClass(protocol_version, ProtocolVersion);
    if(prev_hash == null) {
      const ret = CslMobileBridge.csl_bridge_header_body_new_jsi(block_number, slot, issuer_vkeyPtr, vrf_vkeyPtr, vrf_resultPtr, block_body_size, block_body_hashPtr, operational_certPtr, protocol_versionPtr);
      return Ptr._wrap(ret, HeaderBody);
    }
    if(prev_hash != null) {
      const ret = CslMobileBridge.csl_bridge_header_body_new_with_prev_hash_jsi(block_number, slot, prev_hashPtr!, issuer_vkeyPtr, vrf_vkeyPtr, vrf_resultPtr, block_body_size, block_body_hashPtr, operational_certPtr, protocol_versionPtr);
      return Ptr._wrap(ret, HeaderBody);
    }
    else {
      throw new Error('Unreachable code. Check the codegen.');
    }
  }

  static new_headerbody(block_number: number, slot: BigNum, prev_hash: Optional<BlockHash>, issuer_vkey: Vkey, vrf_vkey: VRFVKey, vrf_result: VRFCert, block_body_size: number, block_body_hash: BlockHash, operational_cert: OperationalCert, protocol_version: ProtocolVersion): HeaderBody {
    const slotPtr = Ptr._assertClass(slot, BigNum);
    const prev_hashPtr = Ptr._assertOptionalClass(prev_hash, BlockHash);
    const issuer_vkeyPtr = Ptr._assertClass(issuer_vkey, Vkey);
    const vrf_vkeyPtr = Ptr._assertClass(vrf_vkey, VRFVKey);
    const vrf_resultPtr = Ptr._assertClass(vrf_result, VRFCert);
    const block_body_hashPtr = Ptr._assertClass(block_body_hash, BlockHash);
    const operational_certPtr = Ptr._assertClass(operational_cert, OperationalCert);
    const protocol_versionPtr = Ptr._assertClass(protocol_version, ProtocolVersion);
    if(prev_hash == null) {
      const ret = CslMobileBridge.csl_bridge_header_body_new_headerbody_jsi(block_number, slotPtr, issuer_vkeyPtr, vrf_vkeyPtr, vrf_resultPtr, block_body_size, block_body_hashPtr, operational_certPtr, protocol_versionPtr);
      return Ptr._wrap(ret, HeaderBody);
    }
    if(prev_hash != null) {
      const ret = CslMobileBridge.csl_bridge_header_body_new_headerbody_with_prev_hash_jsi(block_number, slotPtr, prev_hashPtr!, issuer_vkeyPtr, vrf_vkeyPtr, vrf_resultPtr, block_body_size, block_body_hashPtr, operational_certPtr, protocol_versionPtr);
      return Ptr._wrap(ret, HeaderBody);
    }
    else {
      throw new Error('Unreachable code. Check the codegen.');
    }
  }

}

export class InfoAction extends Ptr {
  static new(): InfoAction {
    const ret = CslMobileBridge.csl_bridge_info_action_new_jsi();
    return Ptr._wrap(ret, InfoAction);
  }

}

export class Int extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_int_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Int {
    const ret = CslMobileBridge.csl_bridge_int_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Int);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_int_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Int {
    const ret = CslMobileBridge.csl_bridge_int_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Int);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_int_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Int {
    const ret = CslMobileBridge.csl_bridge_int_from_json_jsi(json);
    return Ptr._wrap(ret, Int);
  }

  static new(x: BigNum): Int {
    const xPtr = Ptr._assertClass(x, BigNum);
    const ret = CslMobileBridge.csl_bridge_int_new_jsi(xPtr);
    return Ptr._wrap(ret, Int);
  }

  static new_negative(x: BigNum): Int {
    const xPtr = Ptr._assertClass(x, BigNum);
    const ret = CslMobileBridge.csl_bridge_int_new_negative_jsi(xPtr);
    return Ptr._wrap(ret, Int);
  }

  static new_i32(x: number): Int {
    const ret = CslMobileBridge.csl_bridge_int_new_i32_jsi(x);
    return Ptr._wrap(ret, Int);
  }

  is_positive(): boolean {
    const ret = CslMobileBridge.csl_bridge_int_is_positive_jsi(this.ptr);
    return ret;
  }

  as_positive(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_int_as_positive_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  as_negative(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_int_as_negative_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  as_i32(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_int_as_i32_jsi(this.ptr);
    return ret;
  }

  as_i32_or_nothing(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_int_as_i32_or_nothing_jsi(this.ptr);
    return ret;
  }

  as_i32_or_fail(): number {
    const ret = CslMobileBridge.csl_bridge_int_as_i32_or_fail_jsi(this.ptr);
    return ret;
  }

  to_str(): string {
    const ret = CslMobileBridge.csl_bridge_int_to_str_jsi(this.ptr);
    return ret;
  }

  static from_str(string: string): Int {
    const ret = CslMobileBridge.csl_bridge_int_from_str_jsi(string);
    return Ptr._wrap(ret, Int);
  }

}

export class Ipv4 extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_ipv4_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Ipv4 {
    const ret = CslMobileBridge.csl_bridge_ipv4_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Ipv4);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_ipv4_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Ipv4 {
    const ret = CslMobileBridge.csl_bridge_ipv4_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Ipv4);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_ipv4_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Ipv4 {
    const ret = CslMobileBridge.csl_bridge_ipv4_from_json_jsi(json);
    return Ptr._wrap(ret, Ipv4);
  }

  static new(data: Uint8Array): Ipv4 {
    const ret = CslMobileBridge.csl_bridge_ipv4_new_jsi(b64FromUint8Array(data));
    return Ptr._wrap(ret, Ipv4);
  }

  ip(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_ipv4_ip_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

}

export class Ipv6 extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_ipv6_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Ipv6 {
    const ret = CslMobileBridge.csl_bridge_ipv6_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Ipv6);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_ipv6_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Ipv6 {
    const ret = CslMobileBridge.csl_bridge_ipv6_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Ipv6);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_ipv6_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Ipv6 {
    const ret = CslMobileBridge.csl_bridge_ipv6_from_json_jsi(json);
    return Ptr._wrap(ret, Ipv6);
  }

  static new(data: Uint8Array): Ipv6 {
    const ret = CslMobileBridge.csl_bridge_ipv6_new_jsi(b64FromUint8Array(data));
    return Ptr._wrap(ret, Ipv6);
  }

  ip(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_ipv6_ip_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

}

export class KESSignature extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_k_e_s_signature_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): KESSignature {
    const ret = CslMobileBridge.csl_bridge_k_e_s_signature_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, KESSignature);
  }

}

export class KESVKey extends Ptr {
  static from_bytes(bytes: Uint8Array): KESVKey {
    const ret = CslMobileBridge.csl_bridge_k_e_s_v_key_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, KESVKey);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_k_e_s_v_key_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_k_e_s_v_key_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): KESVKey {
    const ret = CslMobileBridge.csl_bridge_k_e_s_v_key_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, KESVKey);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_k_e_s_v_key_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): KESVKey {
    const ret = CslMobileBridge.csl_bridge_k_e_s_v_key_from_hex_jsi(hex);
    return Ptr._wrap(ret, KESVKey);
  }

}

export class Language extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_language_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Language {
    const ret = CslMobileBridge.csl_bridge_language_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Language);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_language_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Language {
    const ret = CslMobileBridge.csl_bridge_language_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Language);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_language_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Language {
    const ret = CslMobileBridge.csl_bridge_language_from_json_jsi(json);
    return Ptr._wrap(ret, Language);
  }

  static new_plutus_v1(): Language {
    const ret = CslMobileBridge.csl_bridge_language_new_plutus_v1_jsi();
    return Ptr._wrap(ret, Language);
  }

  static new_plutus_v2(): Language {
    const ret = CslMobileBridge.csl_bridge_language_new_plutus_v2_jsi();
    return Ptr._wrap(ret, Language);
  }

  static new_plutus_v3(): Language {
    const ret = CslMobileBridge.csl_bridge_language_new_plutus_v3_jsi();
    return Ptr._wrap(ret, Language);
  }

  kind(): LanguageKind {
    const ret = CslMobileBridge.csl_bridge_language_kind_jsi(this.ptr);
    return ret;
  }

}

export class Languages extends Ptr {
  static new(): Languages {
    const ret = CslMobileBridge.csl_bridge_languages_new_jsi();
    return Ptr._wrap(ret, Languages);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_languages_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): Language {
    const ret = CslMobileBridge.csl_bridge_languages_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, Language);
  }

  add(elem: Language): void {
    const elemPtr = Ptr._assertClass(elem, Language);
    const ret = CslMobileBridge.csl_bridge_languages_add_jsi(this.ptr, elemPtr);
    return ret;
  }

  static list(): Languages {
    const ret = CslMobileBridge.csl_bridge_languages_list_jsi();
    return Ptr._wrap(ret, Languages);
  }

}

export class LegacyDaedalusPrivateKey extends Ptr {
  static from_bytes(bytes: Uint8Array): LegacyDaedalusPrivateKey {
    const ret = CslMobileBridge.csl_bridge_legacy_daedalus_private_key_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, LegacyDaedalusPrivateKey);
  }

  as_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_legacy_daedalus_private_key_as_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  chaincode(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_legacy_daedalus_private_key_chaincode_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

}

export class LinearFee extends Ptr {
  constant(): BigNum {
    const ret = CslMobileBridge.csl_bridge_linear_fee_constant_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  coefficient(): BigNum {
    const ret = CslMobileBridge.csl_bridge_linear_fee_coefficient_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(coefficient: BigNum, constant: BigNum): LinearFee {
    const coefficientPtr = Ptr._assertClass(coefficient, BigNum);
    const constantPtr = Ptr._assertClass(constant, BigNum);
    const ret = CslMobileBridge.csl_bridge_linear_fee_new_jsi(coefficientPtr, constantPtr);
    return Ptr._wrap(ret, LinearFee);
  }

}

export class MIRToStakeCredentials extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): MIRToStakeCredentials {
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, MIRToStakeCredentials);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): MIRToStakeCredentials {
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, MIRToStakeCredentials);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): MIRToStakeCredentials {
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_from_json_jsi(json);
    return Ptr._wrap(ret, MIRToStakeCredentials);
  }

  static new(): MIRToStakeCredentials {
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_new_jsi();
    return Ptr._wrap(ret, MIRToStakeCredentials);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_len_jsi(this.ptr);
    return ret;
  }

  insert(cred: Credential, delta: Int): Optional<Int> {
    const credPtr = Ptr._assertClass(cred, Credential);
    const deltaPtr = Ptr._assertClass(delta, Int);
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_insert_jsi(this.ptr, credPtr, deltaPtr);
    return Ptr._wrap(ret, Int);
  }

  get(cred: Credential): Optional<Int> {
    const credPtr = Ptr._assertClass(cred, Credential);
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_get_jsi(this.ptr, credPtr);
    return Ptr._wrap(ret, Int);
  }

  keys(): Credentials {
    const ret = CslMobileBridge.csl_bridge_m_i_r_to_stake_credentials_keys_jsi(this.ptr);
    return Ptr._wrap(ret, Credentials);
  }

}

export class MalformedAddress extends Ptr {
  original_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_malformed_address_original_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_address(): Address {
    const ret = CslMobileBridge.csl_bridge_malformed_address_to_address_jsi(this.ptr);
    return Ptr._wrap(ret, Address);
  }

  static from_address(addr: Address): Optional<MalformedAddress> {
    const addrPtr = Ptr._assertClass(addr, Address);
    const ret = CslMobileBridge.csl_bridge_malformed_address_from_address_jsi(addrPtr);
    return Ptr._wrap(ret, MalformedAddress);
  }

}

export class MetadataList extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_metadata_list_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): MetadataList {
    const ret = CslMobileBridge.csl_bridge_metadata_list_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, MetadataList);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_metadata_list_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): MetadataList {
    const ret = CslMobileBridge.csl_bridge_metadata_list_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, MetadataList);
  }

  static new(): MetadataList {
    const ret = CslMobileBridge.csl_bridge_metadata_list_new_jsi();
    return Ptr._wrap(ret, MetadataList);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_metadata_list_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): TransactionMetadatum {
    const ret = CslMobileBridge.csl_bridge_metadata_list_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  add(elem: TransactionMetadatum): void {
    const elemPtr = Ptr._assertClass(elem, TransactionMetadatum);
    const ret = CslMobileBridge.csl_bridge_metadata_list_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class MetadataMap extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_metadata_map_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): MetadataMap {
    const ret = CslMobileBridge.csl_bridge_metadata_map_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, MetadataMap);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_metadata_map_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): MetadataMap {
    const ret = CslMobileBridge.csl_bridge_metadata_map_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, MetadataMap);
  }

  static new(): MetadataMap {
    const ret = CslMobileBridge.csl_bridge_metadata_map_new_jsi();
    return Ptr._wrap(ret, MetadataMap);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_metadata_map_len_jsi(this.ptr);
    return ret;
  }

  insert(key: TransactionMetadatum, value: TransactionMetadatum): Optional<TransactionMetadatum> {
    const keyPtr = Ptr._assertClass(key, TransactionMetadatum);
    const valuePtr = Ptr._assertClass(value, TransactionMetadatum);
    const ret = CslMobileBridge.csl_bridge_metadata_map_insert_jsi(this.ptr, keyPtr, valuePtr);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  insert_str(key: string, value: TransactionMetadatum): Optional<TransactionMetadatum> {
    const valuePtr = Ptr._assertClass(value, TransactionMetadatum);
    const ret = CslMobileBridge.csl_bridge_metadata_map_insert_str_jsi(this.ptr, key, valuePtr);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  insert_i32(key: number, value: TransactionMetadatum): Optional<TransactionMetadatum> {
    const valuePtr = Ptr._assertClass(value, TransactionMetadatum);
    const ret = CslMobileBridge.csl_bridge_metadata_map_insert_i32_jsi(this.ptr, key, valuePtr);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  get(key: TransactionMetadatum): TransactionMetadatum {
    const keyPtr = Ptr._assertClass(key, TransactionMetadatum);
    const ret = CslMobileBridge.csl_bridge_metadata_map_get_jsi(this.ptr, keyPtr);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  get_str(key: string): TransactionMetadatum {
    const ret = CslMobileBridge.csl_bridge_metadata_map_get_str_jsi(this.ptr, key);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  get_i32(key: number): TransactionMetadatum {
    const ret = CslMobileBridge.csl_bridge_metadata_map_get_i32_jsi(this.ptr, key);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  has(key: TransactionMetadatum): boolean {
    const keyPtr = Ptr._assertClass(key, TransactionMetadatum);
    const ret = CslMobileBridge.csl_bridge_metadata_map_has_jsi(this.ptr, keyPtr);
    return ret;
  }

  keys(): MetadataList {
    const ret = CslMobileBridge.csl_bridge_metadata_map_keys_jsi(this.ptr);
    return Ptr._wrap(ret, MetadataList);
  }

}

export class Mint extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_mint_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Mint {
    const ret = CslMobileBridge.csl_bridge_mint_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Mint);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_mint_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Mint {
    const ret = CslMobileBridge.csl_bridge_mint_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Mint);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_mint_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Mint {
    const ret = CslMobileBridge.csl_bridge_mint_from_json_jsi(json);
    return Ptr._wrap(ret, Mint);
  }

  static new(): Mint {
    const ret = CslMobileBridge.csl_bridge_mint_new_jsi();
    return Ptr._wrap(ret, Mint);
  }

  static new_from_entry(key: ScriptHash, value: MintAssets): Mint {
    const keyPtr = Ptr._assertClass(key, ScriptHash);
    const valuePtr = Ptr._assertClass(value, MintAssets);
    const ret = CslMobileBridge.csl_bridge_mint_new_from_entry_jsi(keyPtr, valuePtr);
    return Ptr._wrap(ret, Mint);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_mint_len_jsi(this.ptr);
    return ret;
  }

  insert(key: ScriptHash, value: MintAssets): Optional<MintAssets> {
    const keyPtr = Ptr._assertClass(key, ScriptHash);
    const valuePtr = Ptr._assertClass(value, MintAssets);
    const ret = CslMobileBridge.csl_bridge_mint_insert_jsi(this.ptr, keyPtr, valuePtr);
    return Ptr._wrap(ret, MintAssets);
  }

  get(key: ScriptHash): Optional<MintsAssets> {
    const keyPtr = Ptr._assertClass(key, ScriptHash);
    const ret = CslMobileBridge.csl_bridge_mint_get_jsi(this.ptr, keyPtr);
    return Ptr._wrap(ret, MintsAssets);
  }

  keys(): ScriptHashes {
    const ret = CslMobileBridge.csl_bridge_mint_keys_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptHashes);
  }

  as_positive_multiasset(): MultiAsset {
    const ret = CslMobileBridge.csl_bridge_mint_as_positive_multiasset_jsi(this.ptr);
    return Ptr._wrap(ret, MultiAsset);
  }

  as_negative_multiasset(): MultiAsset {
    const ret = CslMobileBridge.csl_bridge_mint_as_negative_multiasset_jsi(this.ptr);
    return Ptr._wrap(ret, MultiAsset);
  }

}

export class MintAssets extends Ptr {
  static new(): MintAssets {
    const ret = CslMobileBridge.csl_bridge_mint_assets_new_jsi();
    return Ptr._wrap(ret, MintAssets);
  }

  static new_from_entry(key: AssetName, value: Int): MintAssets {
    const keyPtr = Ptr._assertClass(key, AssetName);
    const valuePtr = Ptr._assertClass(value, Int);
    const ret = CslMobileBridge.csl_bridge_mint_assets_new_from_entry_jsi(keyPtr, valuePtr);
    return Ptr._wrap(ret, MintAssets);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_mint_assets_len_jsi(this.ptr);
    return ret;
  }

  insert(key: AssetName, value: Int): Optional<Int> {
    const keyPtr = Ptr._assertClass(key, AssetName);
    const valuePtr = Ptr._assertClass(value, Int);
    const ret = CslMobileBridge.csl_bridge_mint_assets_insert_jsi(this.ptr, keyPtr, valuePtr);
    return Ptr._wrap(ret, Int);
  }

  get(key: AssetName): Optional<Int> {
    const keyPtr = Ptr._assertClass(key, AssetName);
    const ret = CslMobileBridge.csl_bridge_mint_assets_get_jsi(this.ptr, keyPtr);
    return Ptr._wrap(ret, Int);
  }

  keys(): AssetNames {
    const ret = CslMobileBridge.csl_bridge_mint_assets_keys_jsi(this.ptr);
    return Ptr._wrap(ret, AssetNames);
  }

}

export class MintBuilder extends Ptr {
  static new(): MintBuilder {
    const ret = CslMobileBridge.csl_bridge_mint_builder_new_jsi();
    return Ptr._wrap(ret, MintBuilder);
  }

  add_asset(mint: MintWitness, asset_name: AssetName, amount: Int): void {
    const mintPtr = Ptr._assertClass(mint, MintWitness);
    const asset_namePtr = Ptr._assertClass(asset_name, AssetName);
    const amountPtr = Ptr._assertClass(amount, Int);
    const ret = CslMobileBridge.csl_bridge_mint_builder_add_asset_jsi(this.ptr, mintPtr, asset_namePtr, amountPtr);
    return ret;
  }

  set_asset(mint: MintWitness, asset_name: AssetName, amount: Int): void {
    const mintPtr = Ptr._assertClass(mint, MintWitness);
    const asset_namePtr = Ptr._assertClass(asset_name, AssetName);
    const amountPtr = Ptr._assertClass(amount, Int);
    const ret = CslMobileBridge.csl_bridge_mint_builder_set_asset_jsi(this.ptr, mintPtr, asset_namePtr, amountPtr);
    return ret;
  }

  build(): Mint {
    const ret = CslMobileBridge.csl_bridge_mint_builder_build_jsi(this.ptr);
    return Ptr._wrap(ret, Mint);
  }

  get_native_scripts(): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_mint_builder_get_native_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  get_plutus_witnesses(): PlutusWitnesses {
    const ret = CslMobileBridge.csl_bridge_mint_builder_get_plutus_witnesses_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusWitnesses);
  }

  get_ref_inputs(): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_mint_builder_get_ref_inputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  get_redeemers(): Redeemers {
    const ret = CslMobileBridge.csl_bridge_mint_builder_get_redeemers_jsi(this.ptr);
    return Ptr._wrap(ret, Redeemers);
  }

  has_plutus_scripts(): boolean {
    const ret = CslMobileBridge.csl_bridge_mint_builder_has_plutus_scripts_jsi(this.ptr);
    return ret;
  }

  has_native_scripts(): boolean {
    const ret = CslMobileBridge.csl_bridge_mint_builder_has_native_scripts_jsi(this.ptr);
    return ret;
  }

}

export class MintWitness extends Ptr {
  static new_native_script(native_script: NativeScriptSource): MintWitness {
    const native_scriptPtr = Ptr._assertClass(native_script, NativeScriptSource);
    const ret = CslMobileBridge.csl_bridge_mint_witness_new_native_script_jsi(native_scriptPtr);
    return Ptr._wrap(ret, MintWitness);
  }

  static new_plutus_script(plutus_script: PlutusScriptSource, redeemer: Redeemer): MintWitness {
    const plutus_scriptPtr = Ptr._assertClass(plutus_script, PlutusScriptSource);
    const redeemerPtr = Ptr._assertClass(redeemer, Redeemer);
    const ret = CslMobileBridge.csl_bridge_mint_witness_new_plutus_script_jsi(plutus_scriptPtr, redeemerPtr);
    return Ptr._wrap(ret, MintWitness);
  }

}

export class MintsAssets extends Ptr {
  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_mints_assets_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): MintsAssets {
    const ret = CslMobileBridge.csl_bridge_mints_assets_from_json_jsi(json);
    return Ptr._wrap(ret, MintsAssets);
  }

  static new(): MintsAssets {
    const ret = CslMobileBridge.csl_bridge_mints_assets_new_jsi();
    return Ptr._wrap(ret, MintsAssets);
  }

  add(mint_assets: MintAssets): void {
    const mint_assetsPtr = Ptr._assertClass(mint_assets, MintAssets);
    const ret = CslMobileBridge.csl_bridge_mints_assets_add_jsi(this.ptr, mint_assetsPtr);
    return ret;
  }

  get(index: number): Optional<MintAssets> {
    const ret = CslMobileBridge.csl_bridge_mints_assets_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, MintAssets);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_mints_assets_len_jsi(this.ptr);
    return ret;
  }

}

export class MoveInstantaneousReward extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): MoveInstantaneousReward {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, MoveInstantaneousReward);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): MoveInstantaneousReward {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, MoveInstantaneousReward);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): MoveInstantaneousReward {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_from_json_jsi(json);
    return Ptr._wrap(ret, MoveInstantaneousReward);
  }

  static new_to_other_pot(pot: MIRPot, amount: BigNum): MoveInstantaneousReward {
    const amountPtr = Ptr._assertClass(amount, BigNum);
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_new_to_other_pot_jsi(pot, amountPtr);
    return Ptr._wrap(ret, MoveInstantaneousReward);
  }

  static new_to_stake_creds(pot: MIRPot, amounts: MIRToStakeCredentials): MoveInstantaneousReward {
    const amountsPtr = Ptr._assertClass(amounts, MIRToStakeCredentials);
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_new_to_stake_creds_jsi(pot, amountsPtr);
    return Ptr._wrap(ret, MoveInstantaneousReward);
  }

  pot(): MIRPot {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_pot_jsi(this.ptr);
    return ret;
  }

  kind(): MIRKind {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_kind_jsi(this.ptr);
    return ret;
  }

  as_to_other_pot(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_as_to_other_pot_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  as_to_stake_creds(): Optional<MIRToStakeCredentials> {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_reward_as_to_stake_creds_jsi(this.ptr);
    return Ptr._wrap(ret, MIRToStakeCredentials);
  }

}

export class MoveInstantaneousRewardsCert extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_rewards_cert_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): MoveInstantaneousRewardsCert {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_rewards_cert_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, MoveInstantaneousRewardsCert);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_rewards_cert_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): MoveInstantaneousRewardsCert {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_rewards_cert_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, MoveInstantaneousRewardsCert);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_rewards_cert_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): MoveInstantaneousRewardsCert {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_rewards_cert_from_json_jsi(json);
    return Ptr._wrap(ret, MoveInstantaneousRewardsCert);
  }

  move_instantaneous_reward(): MoveInstantaneousReward {
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_rewards_cert_move_instantaneous_reward_jsi(this.ptr);
    return Ptr._wrap(ret, MoveInstantaneousReward);
  }

  static new(move_instantaneous_reward: MoveInstantaneousReward): MoveInstantaneousRewardsCert {
    const move_instantaneous_rewardPtr = Ptr._assertClass(move_instantaneous_reward, MoveInstantaneousReward);
    const ret = CslMobileBridge.csl_bridge_move_instantaneous_rewards_cert_new_jsi(move_instantaneous_rewardPtr);
    return Ptr._wrap(ret, MoveInstantaneousRewardsCert);
  }

}

export class MultiAsset extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_multi_asset_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): MultiAsset {
    const ret = CslMobileBridge.csl_bridge_multi_asset_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, MultiAsset);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_multi_asset_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): MultiAsset {
    const ret = CslMobileBridge.csl_bridge_multi_asset_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, MultiAsset);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_multi_asset_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): MultiAsset {
    const ret = CslMobileBridge.csl_bridge_multi_asset_from_json_jsi(json);
    return Ptr._wrap(ret, MultiAsset);
  }

  static new(): MultiAsset {
    const ret = CslMobileBridge.csl_bridge_multi_asset_new_jsi();
    return Ptr._wrap(ret, MultiAsset);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_multi_asset_len_jsi(this.ptr);
    return ret;
  }

  insert(policy_id: ScriptHash, assets: Assets): Optional<Assets> {
    const policy_idPtr = Ptr._assertClass(policy_id, ScriptHash);
    const assetsPtr = Ptr._assertClass(assets, Assets);
    const ret = CslMobileBridge.csl_bridge_multi_asset_insert_jsi(this.ptr, policy_idPtr, assetsPtr);
    return Ptr._wrap(ret, Assets);
  }

  get(policy_id: ScriptHash): Optional<Assets> {
    const policy_idPtr = Ptr._assertClass(policy_id, ScriptHash);
    const ret = CslMobileBridge.csl_bridge_multi_asset_get_jsi(this.ptr, policy_idPtr);
    return Ptr._wrap(ret, Assets);
  }

  set_asset(policy_id: ScriptHash, asset_name: AssetName, value: BigNum): Optional<BigNum> {
    const policy_idPtr = Ptr._assertClass(policy_id, ScriptHash);
    const asset_namePtr = Ptr._assertClass(asset_name, AssetName);
    const valuePtr = Ptr._assertClass(value, BigNum);
    const ret = CslMobileBridge.csl_bridge_multi_asset_set_asset_jsi(this.ptr, policy_idPtr, asset_namePtr, valuePtr);
    return Ptr._wrap(ret, BigNum);
  }

  get_asset(policy_id: ScriptHash, asset_name: AssetName): BigNum {
    const policy_idPtr = Ptr._assertClass(policy_id, ScriptHash);
    const asset_namePtr = Ptr._assertClass(asset_name, AssetName);
    const ret = CslMobileBridge.csl_bridge_multi_asset_get_asset_jsi(this.ptr, policy_idPtr, asset_namePtr);
    return Ptr._wrap(ret, BigNum);
  }

  keys(): ScriptHashes {
    const ret = CslMobileBridge.csl_bridge_multi_asset_keys_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptHashes);
  }

  sub(rhs_ma: MultiAsset): MultiAsset {
    const rhs_maPtr = Ptr._assertClass(rhs_ma, MultiAsset);
    const ret = CslMobileBridge.csl_bridge_multi_asset_sub_jsi(this.ptr, rhs_maPtr);
    return Ptr._wrap(ret, MultiAsset);
  }

}

export class MultiHostName extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_multi_host_name_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): MultiHostName {
    const ret = CslMobileBridge.csl_bridge_multi_host_name_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, MultiHostName);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_multi_host_name_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): MultiHostName {
    const ret = CslMobileBridge.csl_bridge_multi_host_name_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, MultiHostName);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_multi_host_name_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): MultiHostName {
    const ret = CslMobileBridge.csl_bridge_multi_host_name_from_json_jsi(json);
    return Ptr._wrap(ret, MultiHostName);
  }

  dns_name(): DNSRecordSRV {
    const ret = CslMobileBridge.csl_bridge_multi_host_name_dns_name_jsi(this.ptr);
    return Ptr._wrap(ret, DNSRecordSRV);
  }

  static new(dns_name: DNSRecordSRV): MultiHostName {
    const dns_namePtr = Ptr._assertClass(dns_name, DNSRecordSRV);
    const ret = CslMobileBridge.csl_bridge_multi_host_name_new_jsi(dns_namePtr);
    return Ptr._wrap(ret, MultiHostName);
  }

}

export class NativeScript extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_native_script_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): NativeScript {
    const ret = CslMobileBridge.csl_bridge_native_script_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, NativeScript);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_native_script_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): NativeScript {
    const ret = CslMobileBridge.csl_bridge_native_script_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, NativeScript);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_native_script_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): NativeScript {
    const ret = CslMobileBridge.csl_bridge_native_script_from_json_jsi(json);
    return Ptr._wrap(ret, NativeScript);
  }

  hash(): ScriptHash {
    const ret = CslMobileBridge.csl_bridge_native_script_hash_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptHash);
  }

  static new_script_pubkey(script_pubkey: ScriptPubkey): NativeScript {
    const script_pubkeyPtr = Ptr._assertClass(script_pubkey, ScriptPubkey);
    const ret = CslMobileBridge.csl_bridge_native_script_new_script_pubkey_jsi(script_pubkeyPtr);
    return Ptr._wrap(ret, NativeScript);
  }

  static new_script_all(script_all: ScriptAll): NativeScript {
    const script_allPtr = Ptr._assertClass(script_all, ScriptAll);
    const ret = CslMobileBridge.csl_bridge_native_script_new_script_all_jsi(script_allPtr);
    return Ptr._wrap(ret, NativeScript);
  }

  static new_script_any(script_any: ScriptAny): NativeScript {
    const script_anyPtr = Ptr._assertClass(script_any, ScriptAny);
    const ret = CslMobileBridge.csl_bridge_native_script_new_script_any_jsi(script_anyPtr);
    return Ptr._wrap(ret, NativeScript);
  }

  static new_script_n_of_k(script_n_of_k: ScriptNOfK): NativeScript {
    const script_n_of_kPtr = Ptr._assertClass(script_n_of_k, ScriptNOfK);
    const ret = CslMobileBridge.csl_bridge_native_script_new_script_n_of_k_jsi(script_n_of_kPtr);
    return Ptr._wrap(ret, NativeScript);
  }

  static new_timelock_start(timelock_start: TimelockStart): NativeScript {
    const timelock_startPtr = Ptr._assertClass(timelock_start, TimelockStart);
    const ret = CslMobileBridge.csl_bridge_native_script_new_timelock_start_jsi(timelock_startPtr);
    return Ptr._wrap(ret, NativeScript);
  }

  static new_timelock_expiry(timelock_expiry: TimelockExpiry): NativeScript {
    const timelock_expiryPtr = Ptr._assertClass(timelock_expiry, TimelockExpiry);
    const ret = CslMobileBridge.csl_bridge_native_script_new_timelock_expiry_jsi(timelock_expiryPtr);
    return Ptr._wrap(ret, NativeScript);
  }

  kind(): NativeScriptKind {
    const ret = CslMobileBridge.csl_bridge_native_script_kind_jsi(this.ptr);
    return ret;
  }

  as_script_pubkey(): Optional<ScriptPubkey> {
    const ret = CslMobileBridge.csl_bridge_native_script_as_script_pubkey_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptPubkey);
  }

  as_script_all(): Optional<ScriptAll> {
    const ret = CslMobileBridge.csl_bridge_native_script_as_script_all_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptAll);
  }

  as_script_any(): Optional<ScriptAny> {
    const ret = CslMobileBridge.csl_bridge_native_script_as_script_any_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptAny);
  }

  as_script_n_of_k(): Optional<ScriptNOfK> {
    const ret = CslMobileBridge.csl_bridge_native_script_as_script_n_of_k_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptNOfK);
  }

  as_timelock_start(): Optional<TimelockStart> {
    const ret = CslMobileBridge.csl_bridge_native_script_as_timelock_start_jsi(this.ptr);
    return Ptr._wrap(ret, TimelockStart);
  }

  as_timelock_expiry(): Optional<TimelockExpiry> {
    const ret = CslMobileBridge.csl_bridge_native_script_as_timelock_expiry_jsi(this.ptr);
    return Ptr._wrap(ret, TimelockExpiry);
  }

  get_required_signers(): Ed25519KeyHashes {
    const ret = CslMobileBridge.csl_bridge_native_script_get_required_signers_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHashes);
  }

}

export class NativeScriptSource extends Ptr {
  static new(script: NativeScript): NativeScriptSource {
    const scriptPtr = Ptr._assertClass(script, NativeScript);
    const ret = CslMobileBridge.csl_bridge_native_script_source_new_jsi(scriptPtr);
    return Ptr._wrap(ret, NativeScriptSource);
  }

  static new_ref_input(script_hash: ScriptHash, input: TransactionInput, script_size: number): NativeScriptSource {
    const script_hashPtr = Ptr._assertClass(script_hash, ScriptHash);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const ret = CslMobileBridge.csl_bridge_native_script_source_new_ref_input_jsi(script_hashPtr, inputPtr, script_size);
    return Ptr._wrap(ret, NativeScriptSource);
  }

  set_required_signers(key_hashes: Ed25519KeyHashes): void {
    const key_hashesPtr = Ptr._assertClass(key_hashes, Ed25519KeyHashes);
    const ret = CslMobileBridge.csl_bridge_native_script_source_set_required_signers_jsi(this.ptr, key_hashesPtr);
    return ret;
  }

  get_ref_script_size(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_native_script_source_get_ref_script_size_jsi(this.ptr);
    return ret;
  }

}

export class NativeScripts extends Ptr {
  static new(): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_native_scripts_new_jsi();
    return Ptr._wrap(ret, NativeScripts);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_native_scripts_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): NativeScript {
    const ret = CslMobileBridge.csl_bridge_native_scripts_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, NativeScript);
  }

  add(elem: NativeScript): void {
    const elemPtr = Ptr._assertClass(elem, NativeScript);
    const ret = CslMobileBridge.csl_bridge_native_scripts_add_jsi(this.ptr, elemPtr);
    return ret;
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_native_scripts_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_native_scripts_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, NativeScripts);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_native_scripts_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_native_scripts_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, NativeScripts);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_native_scripts_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_native_scripts_from_json_jsi(json);
    return Ptr._wrap(ret, NativeScripts);
  }

}

export class NetworkId extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_network_id_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): NetworkId {
    const ret = CslMobileBridge.csl_bridge_network_id_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, NetworkId);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_network_id_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): NetworkId {
    const ret = CslMobileBridge.csl_bridge_network_id_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, NetworkId);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_network_id_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): NetworkId {
    const ret = CslMobileBridge.csl_bridge_network_id_from_json_jsi(json);
    return Ptr._wrap(ret, NetworkId);
  }

  static testnet(): NetworkId {
    const ret = CslMobileBridge.csl_bridge_network_id_testnet_jsi();
    return Ptr._wrap(ret, NetworkId);
  }

  static mainnet(): NetworkId {
    const ret = CslMobileBridge.csl_bridge_network_id_mainnet_jsi();
    return Ptr._wrap(ret, NetworkId);
  }

  kind(): NetworkIdKind {
    const ret = CslMobileBridge.csl_bridge_network_id_kind_jsi(this.ptr);
    return ret;
  }

}

export class NetworkInfo extends Ptr {
  static new(network_id: number, protocol_magic: number): NetworkInfo {
    const ret = CslMobileBridge.csl_bridge_network_info_new_jsi(network_id, protocol_magic);
    return Ptr._wrap(ret, NetworkInfo);
  }

  network_id(): number {
    const ret = CslMobileBridge.csl_bridge_network_info_network_id_jsi(this.ptr);
    return ret;
  }

  protocol_magic(): number {
    const ret = CslMobileBridge.csl_bridge_network_info_protocol_magic_jsi(this.ptr);
    return ret;
  }

  static testnet_preview(): NetworkInfo {
    const ret = CslMobileBridge.csl_bridge_network_info_testnet_preview_jsi();
    return Ptr._wrap(ret, NetworkInfo);
  }

  static testnet_preprod(): NetworkInfo {
    const ret = CslMobileBridge.csl_bridge_network_info_testnet_preprod_jsi();
    return Ptr._wrap(ret, NetworkInfo);
  }

  static mainnet(): NetworkInfo {
    const ret = CslMobileBridge.csl_bridge_network_info_mainnet_jsi();
    return Ptr._wrap(ret, NetworkInfo);
  }

}

export class NewConstitutionAction extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): NewConstitutionAction {
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, NewConstitutionAction);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): NewConstitutionAction {
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, NewConstitutionAction);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): NewConstitutionAction {
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_from_json_jsi(json);
    return Ptr._wrap(ret, NewConstitutionAction);
  }

  gov_action_id(): Optional<GovernanceActionId> {
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_gov_action_id_jsi(this.ptr);
    return Ptr._wrap(ret, GovernanceActionId);
  }

  constitution(): Constitution {
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_constitution_jsi(this.ptr);
    return Ptr._wrap(ret, Constitution);
  }

  static new(constitution: Constitution): NewConstitutionAction {
    const constitutionPtr = Ptr._assertClass(constitution, Constitution);
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_new_jsi(constitutionPtr);
    return Ptr._wrap(ret, NewConstitutionAction);
  }

  static new_with_action_id(gov_action_id: GovernanceActionId, constitution: Constitution): NewConstitutionAction {
    const gov_action_idPtr = Ptr._assertClass(gov_action_id, GovernanceActionId);
    const constitutionPtr = Ptr._assertClass(constitution, Constitution);
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_new_with_action_id_jsi(gov_action_idPtr, constitutionPtr);
    return Ptr._wrap(ret, NewConstitutionAction);
  }

  has_script_hash(): boolean {
    const ret = CslMobileBridge.csl_bridge_new_constitution_action_has_script_hash_jsi(this.ptr);
    return ret;
  }

}

export class NoConfidenceAction extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_no_confidence_action_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): NoConfidenceAction {
    const ret = CslMobileBridge.csl_bridge_no_confidence_action_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, NoConfidenceAction);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_no_confidence_action_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): NoConfidenceAction {
    const ret = CslMobileBridge.csl_bridge_no_confidence_action_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, NoConfidenceAction);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_no_confidence_action_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): NoConfidenceAction {
    const ret = CslMobileBridge.csl_bridge_no_confidence_action_from_json_jsi(json);
    return Ptr._wrap(ret, NoConfidenceAction);
  }

  gov_action_id(): Optional<GovernanceActionId> {
    const ret = CslMobileBridge.csl_bridge_no_confidence_action_gov_action_id_jsi(this.ptr);
    return Ptr._wrap(ret, GovernanceActionId);
  }

  static new(): NoConfidenceAction {
    const ret = CslMobileBridge.csl_bridge_no_confidence_action_new_jsi();
    return Ptr._wrap(ret, NoConfidenceAction);
  }

  static new_with_action_id(gov_action_id: GovernanceActionId): NoConfidenceAction {
    const gov_action_idPtr = Ptr._assertClass(gov_action_id, GovernanceActionId);
    const ret = CslMobileBridge.csl_bridge_no_confidence_action_new_with_action_id_jsi(gov_action_idPtr);
    return Ptr._wrap(ret, NoConfidenceAction);
  }

}

export class Nonce extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_nonce_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Nonce {
    const ret = CslMobileBridge.csl_bridge_nonce_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Nonce);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_nonce_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Nonce {
    const ret = CslMobileBridge.csl_bridge_nonce_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Nonce);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_nonce_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Nonce {
    const ret = CslMobileBridge.csl_bridge_nonce_from_json_jsi(json);
    return Ptr._wrap(ret, Nonce);
  }

  static new_identity(): Nonce {
    const ret = CslMobileBridge.csl_bridge_nonce_new_identity_jsi();
    return Ptr._wrap(ret, Nonce);
  }

  static new_from_hash(hash: Uint8Array): Nonce {
    const ret = CslMobileBridge.csl_bridge_nonce_new_from_hash_jsi(b64FromUint8Array(hash));
    return Ptr._wrap(ret, Nonce);
  }

  get_hash(): Optional<Uint8Array> {
    const ret = CslMobileBridge.csl_bridge_nonce_get_hash_jsi(this.ptr);
    return ret == null ? undefined : uint8ArrayFromB64(ret);
  }

}

export class OperationalCert extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_operational_cert_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): OperationalCert {
    const ret = CslMobileBridge.csl_bridge_operational_cert_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, OperationalCert);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_operational_cert_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): OperationalCert {
    const ret = CslMobileBridge.csl_bridge_operational_cert_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, OperationalCert);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_operational_cert_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): OperationalCert {
    const ret = CslMobileBridge.csl_bridge_operational_cert_from_json_jsi(json);
    return Ptr._wrap(ret, OperationalCert);
  }

  hot_vkey(): KESVKey {
    const ret = CslMobileBridge.csl_bridge_operational_cert_hot_vkey_jsi(this.ptr);
    return Ptr._wrap(ret, KESVKey);
  }

  sequence_number(): number {
    const ret = CslMobileBridge.csl_bridge_operational_cert_sequence_number_jsi(this.ptr);
    return ret;
  }

  kes_period(): number {
    const ret = CslMobileBridge.csl_bridge_operational_cert_kes_period_jsi(this.ptr);
    return ret;
  }

  sigma(): Ed25519Signature {
    const ret = CslMobileBridge.csl_bridge_operational_cert_sigma_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519Signature);
  }

  static new(hot_vkey: KESVKey, sequence_number: number, kes_period: number, sigma: Ed25519Signature): OperationalCert {
    const hot_vkeyPtr = Ptr._assertClass(hot_vkey, KESVKey);
    const sigmaPtr = Ptr._assertClass(sigma, Ed25519Signature);
    const ret = CslMobileBridge.csl_bridge_operational_cert_new_jsi(hot_vkeyPtr, sequence_number, kes_period, sigmaPtr);
    return Ptr._wrap(ret, OperationalCert);
  }

}

export class OutputDatum extends Ptr {
  static new_data_hash(data_hash: DataHash): OutputDatum {
    const data_hashPtr = Ptr._assertClass(data_hash, DataHash);
    const ret = CslMobileBridge.csl_bridge_output_datum_new_data_hash_jsi(data_hashPtr);
    return Ptr._wrap(ret, OutputDatum);
  }

  static new_data(data: PlutusData): OutputDatum {
    const dataPtr = Ptr._assertClass(data, PlutusData);
    const ret = CslMobileBridge.csl_bridge_output_datum_new_data_jsi(dataPtr);
    return Ptr._wrap(ret, OutputDatum);
  }

  data_hash(): Optional<DataHash> {
    const ret = CslMobileBridge.csl_bridge_output_datum_data_hash_jsi(this.ptr);
    return Ptr._wrap(ret, DataHash);
  }

  data(): Optional<PlutusData> {
    const ret = CslMobileBridge.csl_bridge_output_datum_data_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusData);
  }

}

export class ParameterChangeAction extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ParameterChangeAction {
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ParameterChangeAction);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ParameterChangeAction {
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ParameterChangeAction);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ParameterChangeAction {
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_from_json_jsi(json);
    return Ptr._wrap(ret, ParameterChangeAction);
  }

  gov_action_id(): Optional<GovernanceActionId> {
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_gov_action_id_jsi(this.ptr);
    return Ptr._wrap(ret, GovernanceActionId);
  }

  protocol_param_updates(): ProtocolParamUpdate {
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_protocol_param_updates_jsi(this.ptr);
    return Ptr._wrap(ret, ProtocolParamUpdate);
  }

  policy_hash(): Optional<ScriptHash> {
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_policy_hash_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptHash);
  }

  static new(protocol_param_updates: ProtocolParamUpdate): ParameterChangeAction {
    const protocol_param_updatesPtr = Ptr._assertClass(protocol_param_updates, ProtocolParamUpdate);
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_new_jsi(protocol_param_updatesPtr);
    return Ptr._wrap(ret, ParameterChangeAction);
  }

  static new_with_action_id(gov_action_id: GovernanceActionId, protocol_param_updates: ProtocolParamUpdate): ParameterChangeAction {
    const gov_action_idPtr = Ptr._assertClass(gov_action_id, GovernanceActionId);
    const protocol_param_updatesPtr = Ptr._assertClass(protocol_param_updates, ProtocolParamUpdate);
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_new_with_action_id_jsi(gov_action_idPtr, protocol_param_updatesPtr);
    return Ptr._wrap(ret, ParameterChangeAction);
  }

  static new_with_policy_hash(protocol_param_updates: ProtocolParamUpdate, policy_hash: ScriptHash): ParameterChangeAction {
    const protocol_param_updatesPtr = Ptr._assertClass(protocol_param_updates, ProtocolParamUpdate);
    const policy_hashPtr = Ptr._assertClass(policy_hash, ScriptHash);
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_new_with_policy_hash_jsi(protocol_param_updatesPtr, policy_hashPtr);
    return Ptr._wrap(ret, ParameterChangeAction);
  }

  static new_with_policy_hash_and_action_id(gov_action_id: GovernanceActionId, protocol_param_updates: ProtocolParamUpdate, policy_hash: ScriptHash): ParameterChangeAction {
    const gov_action_idPtr = Ptr._assertClass(gov_action_id, GovernanceActionId);
    const protocol_param_updatesPtr = Ptr._assertClass(protocol_param_updates, ProtocolParamUpdate);
    const policy_hashPtr = Ptr._assertClass(policy_hash, ScriptHash);
    const ret = CslMobileBridge.csl_bridge_parameter_change_action_new_with_policy_hash_and_action_id_jsi(gov_action_idPtr, protocol_param_updatesPtr, policy_hashPtr);
    return Ptr._wrap(ret, ParameterChangeAction);
  }

}

export class PlutusData extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_plutus_data_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PlutusData {
    const ret = CslMobileBridge.csl_bridge_plutus_data_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusData);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_plutus_data_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PlutusData {
    const ret = CslMobileBridge.csl_bridge_plutus_data_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PlutusData);
  }

  static new_constr_plutus_data(constr_plutus_data: ConstrPlutusData): PlutusData {
    const constr_plutus_dataPtr = Ptr._assertClass(constr_plutus_data, ConstrPlutusData);
    const ret = CslMobileBridge.csl_bridge_plutus_data_new_constr_plutus_data_jsi(constr_plutus_dataPtr);
    return Ptr._wrap(ret, PlutusData);
  }

  static new_empty_constr_plutus_data(alternative: BigNum): PlutusData {
    const alternativePtr = Ptr._assertClass(alternative, BigNum);
    const ret = CslMobileBridge.csl_bridge_plutus_data_new_empty_constr_plutus_data_jsi(alternativePtr);
    return Ptr._wrap(ret, PlutusData);
  }

  static new_single_value_constr_plutus_data(alternative: BigNum, plutus_data: PlutusData): PlutusData {
    const alternativePtr = Ptr._assertClass(alternative, BigNum);
    const plutus_dataPtr = Ptr._assertClass(plutus_data, PlutusData);
    const ret = CslMobileBridge.csl_bridge_plutus_data_new_single_value_constr_plutus_data_jsi(alternativePtr, plutus_dataPtr);
    return Ptr._wrap(ret, PlutusData);
  }

  static new_map(map: PlutusMap): PlutusData {
    const mapPtr = Ptr._assertClass(map, PlutusMap);
    const ret = CslMobileBridge.csl_bridge_plutus_data_new_map_jsi(mapPtr);
    return Ptr._wrap(ret, PlutusData);
  }

  static new_list(list: PlutusList): PlutusData {
    const listPtr = Ptr._assertClass(list, PlutusList);
    const ret = CslMobileBridge.csl_bridge_plutus_data_new_list_jsi(listPtr);
    return Ptr._wrap(ret, PlutusData);
  }

  static new_integer(integer: BigInt): PlutusData {
    const integerPtr = Ptr._assertClass(integer, BigInt);
    const ret = CslMobileBridge.csl_bridge_plutus_data_new_integer_jsi(integerPtr);
    return Ptr._wrap(ret, PlutusData);
  }

  static new_bytes(bytes: Uint8Array): PlutusData {
    const ret = CslMobileBridge.csl_bridge_plutus_data_new_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusData);
  }

  kind(): PlutusDataKind {
    const ret = CslMobileBridge.csl_bridge_plutus_data_kind_jsi(this.ptr);
    return ret;
  }

  as_constr_plutus_data(): Optional<ConstrPlutusData> {
    const ret = CslMobileBridge.csl_bridge_plutus_data_as_constr_plutus_data_jsi(this.ptr);
    return Ptr._wrap(ret, ConstrPlutusData);
  }

  as_map(): Optional<PlutusMap> {
    const ret = CslMobileBridge.csl_bridge_plutus_data_as_map_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusMap);
  }

  as_list(): Optional<PlutusList> {
    const ret = CslMobileBridge.csl_bridge_plutus_data_as_list_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusList);
  }

  as_integer(): Optional<BigInt> {
    const ret = CslMobileBridge.csl_bridge_plutus_data_as_integer_jsi(this.ptr);
    return Ptr._wrap(ret, BigInt);
  }

  as_bytes(): Optional<Uint8Array> {
    const ret = CslMobileBridge.csl_bridge_plutus_data_as_bytes_jsi(this.ptr);
    return ret == null ? undefined : uint8ArrayFromB64(ret);
  }

  to_json(schema: PlutusDatumSchema): string {
    const ret = CslMobileBridge.csl_bridge_plutus_data_to_json_jsi(this.ptr, schema);
    return ret;
  }

  static from_json(json: string, schema: PlutusDatumSchema): PlutusData {
    const ret = CslMobileBridge.csl_bridge_plutus_data_from_json_jsi(json, schema);
    return Ptr._wrap(ret, PlutusData);
  }

  static from_address(address: Address): PlutusData {
    const addressPtr = Ptr._assertClass(address, Address);
    const ret = CslMobileBridge.csl_bridge_plutus_data_from_address_jsi(addressPtr);
    return Ptr._wrap(ret, PlutusData);
  }

  as_address(network: NetworkInfo): Address {
    const networkPtr = Ptr._assertClass(network, NetworkInfo);
    const ret = CslMobileBridge.csl_bridge_plutus_data_as_address_jsi(this.ptr, networkPtr);
    return Ptr._wrap(ret, Address);
  }

}

export class PlutusList extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_plutus_list_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PlutusList {
    const ret = CslMobileBridge.csl_bridge_plutus_list_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusList);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_plutus_list_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PlutusList {
    const ret = CslMobileBridge.csl_bridge_plutus_list_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PlutusList);
  }

  static new(): PlutusList {
    const ret = CslMobileBridge.csl_bridge_plutus_list_new_jsi();
    return Ptr._wrap(ret, PlutusList);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_plutus_list_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): PlutusData {
    const ret = CslMobileBridge.csl_bridge_plutus_list_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, PlutusData);
  }

  add(elem: PlutusData): void {
    const elemPtr = Ptr._assertClass(elem, PlutusData);
    const ret = CslMobileBridge.csl_bridge_plutus_list_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class PlutusMap extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_plutus_map_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PlutusMap {
    const ret = CslMobileBridge.csl_bridge_plutus_map_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusMap);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_plutus_map_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PlutusMap {
    const ret = CslMobileBridge.csl_bridge_plutus_map_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PlutusMap);
  }

  static new(): PlutusMap {
    const ret = CslMobileBridge.csl_bridge_plutus_map_new_jsi();
    return Ptr._wrap(ret, PlutusMap);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_plutus_map_len_jsi(this.ptr);
    return ret;
  }

  insert(key: PlutusData, values: PlutusMapValues): Optional<PlutusMapValues> {
    const keyPtr = Ptr._assertClass(key, PlutusData);
    const valuesPtr = Ptr._assertClass(values, PlutusMapValues);
    const ret = CslMobileBridge.csl_bridge_plutus_map_insert_jsi(this.ptr, keyPtr, valuesPtr);
    return Ptr._wrap(ret, PlutusMapValues);
  }

  get(key: PlutusData): Optional<PlutusMapValues> {
    const keyPtr = Ptr._assertClass(key, PlutusData);
    const ret = CslMobileBridge.csl_bridge_plutus_map_get_jsi(this.ptr, keyPtr);
    return Ptr._wrap(ret, PlutusMapValues);
  }

  keys(): PlutusList {
    const ret = CslMobileBridge.csl_bridge_plutus_map_keys_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusList);
  }

}

export class PlutusMapValues extends Ptr {
  static new(): PlutusMapValues {
    const ret = CslMobileBridge.csl_bridge_plutus_map_values_new_jsi();
    return Ptr._wrap(ret, PlutusMapValues);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_plutus_map_values_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): Optional<PlutusData> {
    const ret = CslMobileBridge.csl_bridge_plutus_map_values_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, PlutusData);
  }

  add(elem: PlutusData): void {
    const elemPtr = Ptr._assertClass(elem, PlutusData);
    const ret = CslMobileBridge.csl_bridge_plutus_map_values_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class PlutusScript extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_plutus_script_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PlutusScript {
    const ret = CslMobileBridge.csl_bridge_plutus_script_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusScript);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_plutus_script_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PlutusScript {
    const ret = CslMobileBridge.csl_bridge_plutus_script_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PlutusScript);
  }

  static new(bytes: Uint8Array): PlutusScript {
    const ret = CslMobileBridge.csl_bridge_plutus_script_new_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusScript);
  }

  static new_v2(bytes: Uint8Array): PlutusScript {
    const ret = CslMobileBridge.csl_bridge_plutus_script_new_v2_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusScript);
  }

  static new_v3(bytes: Uint8Array): PlutusScript {
    const ret = CslMobileBridge.csl_bridge_plutus_script_new_v3_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusScript);
  }

  static new_with_version(bytes: Uint8Array, language: Language): PlutusScript {
    const languagePtr = Ptr._assertClass(language, Language);
    const ret = CslMobileBridge.csl_bridge_plutus_script_new_with_version_jsi(b64FromUint8Array(bytes), languagePtr);
    return Ptr._wrap(ret, PlutusScript);
  }

  bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_plutus_script_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes_v2(bytes: Uint8Array): PlutusScript {
    const ret = CslMobileBridge.csl_bridge_plutus_script_from_bytes_v2_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusScript);
  }

  static from_bytes_v3(bytes: Uint8Array): PlutusScript {
    const ret = CslMobileBridge.csl_bridge_plutus_script_from_bytes_v3_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusScript);
  }

  static from_bytes_with_version(bytes: Uint8Array, language: Language): PlutusScript {
    const languagePtr = Ptr._assertClass(language, Language);
    const ret = CslMobileBridge.csl_bridge_plutus_script_from_bytes_with_version_jsi(b64FromUint8Array(bytes), languagePtr);
    return Ptr._wrap(ret, PlutusScript);
  }

  static from_hex_with_version(hex_str: string, language: Language): PlutusScript {
    const languagePtr = Ptr._assertClass(language, Language);
    const ret = CslMobileBridge.csl_bridge_plutus_script_from_hex_with_version_jsi(hex_str, languagePtr);
    return Ptr._wrap(ret, PlutusScript);
  }

  hash(): ScriptHash {
    const ret = CslMobileBridge.csl_bridge_plutus_script_hash_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptHash);
  }

  language_version(): Language {
    const ret = CslMobileBridge.csl_bridge_plutus_script_language_version_jsi(this.ptr);
    return Ptr._wrap(ret, Language);
  }

}

export class PlutusScriptSource extends Ptr {
  static new(script: PlutusScript): PlutusScriptSource {
    const scriptPtr = Ptr._assertClass(script, PlutusScript);
    const ret = CslMobileBridge.csl_bridge_plutus_script_source_new_jsi(scriptPtr);
    return Ptr._wrap(ret, PlutusScriptSource);
  }

  static new_ref_input(script_hash: ScriptHash, input: TransactionInput, lang_ver: Language, script_size: number): PlutusScriptSource {
    const script_hashPtr = Ptr._assertClass(script_hash, ScriptHash);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const lang_verPtr = Ptr._assertClass(lang_ver, Language);
    const ret = CslMobileBridge.csl_bridge_plutus_script_source_new_ref_input_jsi(script_hashPtr, inputPtr, lang_verPtr, script_size);
    return Ptr._wrap(ret, PlutusScriptSource);
  }

  set_required_signers(key_hashes: Ed25519KeyHashes): void {
    const key_hashesPtr = Ptr._assertClass(key_hashes, Ed25519KeyHashes);
    const ret = CslMobileBridge.csl_bridge_plutus_script_source_set_required_signers_jsi(this.ptr, key_hashesPtr);
    return ret;
  }

  get_ref_script_size(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_plutus_script_source_get_ref_script_size_jsi(this.ptr);
    return ret;
  }

}

export class PlutusScripts extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_plutus_scripts_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PlutusScripts {
    const ret = CslMobileBridge.csl_bridge_plutus_scripts_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PlutusScripts);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_plutus_scripts_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PlutusScripts {
    const ret = CslMobileBridge.csl_bridge_plutus_scripts_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PlutusScripts);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_plutus_scripts_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): PlutusScripts {
    const ret = CslMobileBridge.csl_bridge_plutus_scripts_from_json_jsi(json);
    return Ptr._wrap(ret, PlutusScripts);
  }

  static new(): PlutusScripts {
    const ret = CslMobileBridge.csl_bridge_plutus_scripts_new_jsi();
    return Ptr._wrap(ret, PlutusScripts);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_plutus_scripts_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): PlutusScript {
    const ret = CslMobileBridge.csl_bridge_plutus_scripts_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, PlutusScript);
  }

  add(elem: PlutusScript): void {
    const elemPtr = Ptr._assertClass(elem, PlutusScript);
    const ret = CslMobileBridge.csl_bridge_plutus_scripts_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class PlutusWitness extends Ptr {
  static new(script: PlutusScript, datum: PlutusData, redeemer: Redeemer): PlutusWitness {
    const scriptPtr = Ptr._assertClass(script, PlutusScript);
    const datumPtr = Ptr._assertClass(datum, PlutusData);
    const redeemerPtr = Ptr._assertClass(redeemer, Redeemer);
    const ret = CslMobileBridge.csl_bridge_plutus_witness_new_jsi(scriptPtr, datumPtr, redeemerPtr);
    return Ptr._wrap(ret, PlutusWitness);
  }

  static new_with_ref(script: PlutusScriptSource, datum: DatumSource, redeemer: Redeemer): PlutusWitness {
    const scriptPtr = Ptr._assertClass(script, PlutusScriptSource);
    const datumPtr = Ptr._assertClass(datum, DatumSource);
    const redeemerPtr = Ptr._assertClass(redeemer, Redeemer);
    const ret = CslMobileBridge.csl_bridge_plutus_witness_new_with_ref_jsi(scriptPtr, datumPtr, redeemerPtr);
    return Ptr._wrap(ret, PlutusWitness);
  }

  static new_without_datum(script: PlutusScript, redeemer: Redeemer): PlutusWitness {
    const scriptPtr = Ptr._assertClass(script, PlutusScript);
    const redeemerPtr = Ptr._assertClass(redeemer, Redeemer);
    const ret = CslMobileBridge.csl_bridge_plutus_witness_new_without_datum_jsi(scriptPtr, redeemerPtr);
    return Ptr._wrap(ret, PlutusWitness);
  }

  static new_with_ref_without_datum(script: PlutusScriptSource, redeemer: Redeemer): PlutusWitness {
    const scriptPtr = Ptr._assertClass(script, PlutusScriptSource);
    const redeemerPtr = Ptr._assertClass(redeemer, Redeemer);
    const ret = CslMobileBridge.csl_bridge_plutus_witness_new_with_ref_without_datum_jsi(scriptPtr, redeemerPtr);
    return Ptr._wrap(ret, PlutusWitness);
  }

  script(): Optional<PlutusScript> {
    const ret = CslMobileBridge.csl_bridge_plutus_witness_script_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusScript);
  }

  datum(): Optional<PlutusData> {
    const ret = CslMobileBridge.csl_bridge_plutus_witness_datum_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusData);
  }

  redeemer(): Redeemer {
    const ret = CslMobileBridge.csl_bridge_plutus_witness_redeemer_jsi(this.ptr);
    return Ptr._wrap(ret, Redeemer);
  }

}

export class PlutusWitnesses extends Ptr {
  static new(): PlutusWitnesses {
    const ret = CslMobileBridge.csl_bridge_plutus_witnesses_new_jsi();
    return Ptr._wrap(ret, PlutusWitnesses);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_plutus_witnesses_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): PlutusWitness {
    const ret = CslMobileBridge.csl_bridge_plutus_witnesses_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, PlutusWitness);
  }

  add(elem: PlutusWitness): void {
    const elemPtr = Ptr._assertClass(elem, PlutusWitness);
    const ret = CslMobileBridge.csl_bridge_plutus_witnesses_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class Pointer extends Ptr {
  static new(slot: number, tx_index: number, cert_index: number): Pointer {
    const ret = CslMobileBridge.csl_bridge_pointer_new_jsi(slot, tx_index, cert_index);
    return Ptr._wrap(ret, Pointer);
  }

  static new_pointer(slot: BigNum, tx_index: BigNum, cert_index: BigNum): Pointer {
    const slotPtr = Ptr._assertClass(slot, BigNum);
    const tx_indexPtr = Ptr._assertClass(tx_index, BigNum);
    const cert_indexPtr = Ptr._assertClass(cert_index, BigNum);
    const ret = CslMobileBridge.csl_bridge_pointer_new_pointer_jsi(slotPtr, tx_indexPtr, cert_indexPtr);
    return Ptr._wrap(ret, Pointer);
  }

  slot(): number {
    const ret = CslMobileBridge.csl_bridge_pointer_slot_jsi(this.ptr);
    return ret;
  }

  tx_index(): number {
    const ret = CslMobileBridge.csl_bridge_pointer_tx_index_jsi(this.ptr);
    return ret;
  }

  cert_index(): number {
    const ret = CslMobileBridge.csl_bridge_pointer_cert_index_jsi(this.ptr);
    return ret;
  }

  slot_bignum(): BigNum {
    const ret = CslMobileBridge.csl_bridge_pointer_slot_bignum_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  tx_index_bignum(): BigNum {
    const ret = CslMobileBridge.csl_bridge_pointer_tx_index_bignum_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  cert_index_bignum(): BigNum {
    const ret = CslMobileBridge.csl_bridge_pointer_cert_index_bignum_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

}

export class PointerAddress extends Ptr {
  static new(network: number, payment: Credential, stake: Pointer): PointerAddress {
    const paymentPtr = Ptr._assertClass(payment, Credential);
    const stakePtr = Ptr._assertClass(stake, Pointer);
    const ret = CslMobileBridge.csl_bridge_pointer_address_new_jsi(network, paymentPtr, stakePtr);
    return Ptr._wrap(ret, PointerAddress);
  }

  payment_cred(): Credential {
    const ret = CslMobileBridge.csl_bridge_pointer_address_payment_cred_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  stake_pointer(): Pointer {
    const ret = CslMobileBridge.csl_bridge_pointer_address_stake_pointer_jsi(this.ptr);
    return Ptr._wrap(ret, Pointer);
  }

  to_address(): Address {
    const ret = CslMobileBridge.csl_bridge_pointer_address_to_address_jsi(this.ptr);
    return Ptr._wrap(ret, Address);
  }

  static from_address(addr: Address): Optional<PointerAddress> {
    const addrPtr = Ptr._assertClass(addr, Address);
    const ret = CslMobileBridge.csl_bridge_pointer_address_from_address_jsi(addrPtr);
    return Ptr._wrap(ret, PointerAddress);
  }

  network_id(): number {
    const ret = CslMobileBridge.csl_bridge_pointer_address_network_id_jsi(this.ptr);
    return ret;
  }

}

export class PoolMetadata extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PoolMetadata {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PoolMetadata);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PoolMetadata {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PoolMetadata);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): PoolMetadata {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_from_json_jsi(json);
    return Ptr._wrap(ret, PoolMetadata);
  }

  url(): URL {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_url_jsi(this.ptr);
    return Ptr._wrap(ret, URL);
  }

  pool_metadata_hash(): PoolMetadataHash {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_pool_metadata_hash_jsi(this.ptr);
    return Ptr._wrap(ret, PoolMetadataHash);
  }

  static new(url: URL, pool_metadata_hash: PoolMetadataHash): PoolMetadata {
    const urlPtr = Ptr._assertClass(url, URL);
    const pool_metadata_hashPtr = Ptr._assertClass(pool_metadata_hash, PoolMetadataHash);
    const ret = CslMobileBridge.csl_bridge_pool_metadata_new_jsi(urlPtr, pool_metadata_hashPtr);
    return Ptr._wrap(ret, PoolMetadata);
  }

}

export class PoolMetadataHash extends Ptr {
  static from_bytes(bytes: Uint8Array): PoolMetadataHash {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PoolMetadataHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): PoolMetadataHash {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, PoolMetadataHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): PoolMetadataHash {
    const ret = CslMobileBridge.csl_bridge_pool_metadata_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, PoolMetadataHash);
  }

}

export class PoolParams extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_pool_params_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PoolParams {
    const ret = CslMobileBridge.csl_bridge_pool_params_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PoolParams);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_pool_params_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PoolParams {
    const ret = CslMobileBridge.csl_bridge_pool_params_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PoolParams);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_pool_params_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): PoolParams {
    const ret = CslMobileBridge.csl_bridge_pool_params_from_json_jsi(json);
    return Ptr._wrap(ret, PoolParams);
  }

  operator(): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_pool_params_operator_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  vrf_keyhash(): VRFKeyHash {
    const ret = CslMobileBridge.csl_bridge_pool_params_vrf_keyhash_jsi(this.ptr);
    return Ptr._wrap(ret, VRFKeyHash);
  }

  pledge(): BigNum {
    const ret = CslMobileBridge.csl_bridge_pool_params_pledge_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  cost(): BigNum {
    const ret = CslMobileBridge.csl_bridge_pool_params_cost_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  margin(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_pool_params_margin_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  reward_account(): RewardAddress {
    const ret = CslMobileBridge.csl_bridge_pool_params_reward_account_jsi(this.ptr);
    return Ptr._wrap(ret, RewardAddress);
  }

  pool_owners(): Ed25519KeyHashes {
    const ret = CslMobileBridge.csl_bridge_pool_params_pool_owners_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHashes);
  }

  relays(): Relays {
    const ret = CslMobileBridge.csl_bridge_pool_params_relays_jsi(this.ptr);
    return Ptr._wrap(ret, Relays);
  }

  pool_metadata(): Optional<PoolMetadata> {
    const ret = CslMobileBridge.csl_bridge_pool_params_pool_metadata_jsi(this.ptr);
    return Ptr._wrap(ret, PoolMetadata);
  }

  static new(operator_arg: Ed25519KeyHash, vrf_keyhash: VRFKeyHash, pledge: BigNum, cost: BigNum, margin: UnitInterval, reward_account: RewardAddress, pool_owners: Ed25519KeyHashes, relays: Relays, pool_metadata: Optional<PoolMetadata>): PoolParams {
    const operator_argPtr = Ptr._assertClass(operator_arg, Ed25519KeyHash);
    const vrf_keyhashPtr = Ptr._assertClass(vrf_keyhash, VRFKeyHash);
    const pledgePtr = Ptr._assertClass(pledge, BigNum);
    const costPtr = Ptr._assertClass(cost, BigNum);
    const marginPtr = Ptr._assertClass(margin, UnitInterval);
    const reward_accountPtr = Ptr._assertClass(reward_account, RewardAddress);
    const pool_ownersPtr = Ptr._assertClass(pool_owners, Ed25519KeyHashes);
    const relaysPtr = Ptr._assertClass(relays, Relays);
    const pool_metadataPtr = Ptr._assertOptionalClass(pool_metadata, PoolMetadata);
    if(pool_metadata == null) {
      const ret = CslMobileBridge.csl_bridge_pool_params_new_jsi(operator_argPtr, vrf_keyhashPtr, pledgePtr, costPtr, marginPtr, reward_accountPtr, pool_ownersPtr, relaysPtr);
      return Ptr._wrap(ret, PoolParams);
    }
    if(pool_metadata != null) {
      const ret = CslMobileBridge.csl_bridge_pool_params_new_with_pool_metadata_jsi(operator_argPtr, vrf_keyhashPtr, pledgePtr, costPtr, marginPtr, reward_accountPtr, pool_ownersPtr, relaysPtr, pool_metadataPtr!);
      return Ptr._wrap(ret, PoolParams);
    }
    else {
      throw new Error('Unreachable code. Check the codegen.');
    }
  }

}

export class PoolRegistration extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_pool_registration_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PoolRegistration {
    const ret = CslMobileBridge.csl_bridge_pool_registration_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PoolRegistration);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_pool_registration_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PoolRegistration {
    const ret = CslMobileBridge.csl_bridge_pool_registration_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PoolRegistration);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_pool_registration_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): PoolRegistration {
    const ret = CslMobileBridge.csl_bridge_pool_registration_from_json_jsi(json);
    return Ptr._wrap(ret, PoolRegistration);
  }

  pool_params(): PoolParams {
    const ret = CslMobileBridge.csl_bridge_pool_registration_pool_params_jsi(this.ptr);
    return Ptr._wrap(ret, PoolParams);
  }

  static new(pool_params: PoolParams): PoolRegistration {
    const pool_paramsPtr = Ptr._assertClass(pool_params, PoolParams);
    const ret = CslMobileBridge.csl_bridge_pool_registration_new_jsi(pool_paramsPtr);
    return Ptr._wrap(ret, PoolRegistration);
  }

}

export class PoolRetirement extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_pool_retirement_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PoolRetirement {
    const ret = CslMobileBridge.csl_bridge_pool_retirement_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PoolRetirement);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_pool_retirement_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PoolRetirement {
    const ret = CslMobileBridge.csl_bridge_pool_retirement_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PoolRetirement);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_pool_retirement_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): PoolRetirement {
    const ret = CslMobileBridge.csl_bridge_pool_retirement_from_json_jsi(json);
    return Ptr._wrap(ret, PoolRetirement);
  }

  pool_keyhash(): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_pool_retirement_pool_keyhash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  epoch(): number {
    const ret = CslMobileBridge.csl_bridge_pool_retirement_epoch_jsi(this.ptr);
    return ret;
  }

  static new(pool_keyhash: Ed25519KeyHash, epoch: number): PoolRetirement {
    const pool_keyhashPtr = Ptr._assertClass(pool_keyhash, Ed25519KeyHash);
    const ret = CslMobileBridge.csl_bridge_pool_retirement_new_jsi(pool_keyhashPtr, epoch);
    return Ptr._wrap(ret, PoolRetirement);
  }

}

export class PoolVotingThresholds extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PoolVotingThresholds {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PoolVotingThresholds);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PoolVotingThresholds {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PoolVotingThresholds);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): PoolVotingThresholds {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_from_json_jsi(json);
    return Ptr._wrap(ret, PoolVotingThresholds);
  }

  static new(motion_no_confidence: UnitInterval, committee_normal: UnitInterval, committee_no_confidence: UnitInterval, hard_fork_initiation: UnitInterval, security_relevant_threshold: UnitInterval): PoolVotingThresholds {
    const motion_no_confidencePtr = Ptr._assertClass(motion_no_confidence, UnitInterval);
    const committee_normalPtr = Ptr._assertClass(committee_normal, UnitInterval);
    const committee_no_confidencePtr = Ptr._assertClass(committee_no_confidence, UnitInterval);
    const hard_fork_initiationPtr = Ptr._assertClass(hard_fork_initiation, UnitInterval);
    const security_relevant_thresholdPtr = Ptr._assertClass(security_relevant_threshold, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_new_jsi(motion_no_confidencePtr, committee_normalPtr, committee_no_confidencePtr, hard_fork_initiationPtr, security_relevant_thresholdPtr);
    return Ptr._wrap(ret, PoolVotingThresholds);
  }

  motion_no_confidence(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_motion_no_confidence_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  committee_normal(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_committee_normal_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  committee_no_confidence(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_committee_no_confidence_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  hard_fork_initiation(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_hard_fork_initiation_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  security_relevant_threshold(): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_pool_voting_thresholds_security_relevant_threshold_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

}

export class PrivateKey extends Ptr {
  to_public(): PublicKey {
    const ret = CslMobileBridge.csl_bridge_private_key_to_public_jsi(this.ptr);
    return Ptr._wrap(ret, PublicKey);
  }

  static generate_ed25519(): PrivateKey {
    const ret = CslMobileBridge.csl_bridge_private_key_generate_ed25519_jsi();
    return Ptr._wrap(ret, PrivateKey);
  }

  static generate_ed25519extended(): PrivateKey {
    const ret = CslMobileBridge.csl_bridge_private_key_generate_ed25519extended_jsi();
    return Ptr._wrap(ret, PrivateKey);
  }

  static from_bech32(bech32_str: string): PrivateKey {
    const ret = CslMobileBridge.csl_bridge_private_key_from_bech32_jsi(bech32_str);
    return Ptr._wrap(ret, PrivateKey);
  }

  to_bech32(): string {
    const ret = CslMobileBridge.csl_bridge_private_key_to_bech32_jsi(this.ptr);
    return ret;
  }

  as_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_private_key_as_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_extended_bytes(bytes: Uint8Array): PrivateKey {
    const ret = CslMobileBridge.csl_bridge_private_key_from_extended_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PrivateKey);
  }

  static from_normal_bytes(bytes: Uint8Array): PrivateKey {
    const ret = CslMobileBridge.csl_bridge_private_key_from_normal_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PrivateKey);
  }

  sign(message: Uint8Array): Ed25519Signature {
    const ret = CslMobileBridge.csl_bridge_private_key_sign_jsi(this.ptr, b64FromUint8Array(message));
    return Ptr._wrap(ret, Ed25519Signature);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_private_key_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PrivateKey {
    const ret = CslMobileBridge.csl_bridge_private_key_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PrivateKey);
  }

}

export class ProposedProtocolParameterUpdates extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ProposedProtocolParameterUpdates {
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ProposedProtocolParameterUpdates);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ProposedProtocolParameterUpdates {
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ProposedProtocolParameterUpdates);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ProposedProtocolParameterUpdates {
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_from_json_jsi(json);
    return Ptr._wrap(ret, ProposedProtocolParameterUpdates);
  }

  static new(): ProposedProtocolParameterUpdates {
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_new_jsi();
    return Ptr._wrap(ret, ProposedProtocolParameterUpdates);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_len_jsi(this.ptr);
    return ret;
  }

  insert(key: GenesisHash, value: ProtocolParamUpdate): Optional<ProtocolParamUpdate> {
    const keyPtr = Ptr._assertClass(key, GenesisHash);
    const valuePtr = Ptr._assertClass(value, ProtocolParamUpdate);
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_insert_jsi(this.ptr, keyPtr, valuePtr);
    return Ptr._wrap(ret, ProtocolParamUpdate);
  }

  get(key: GenesisHash): Optional<ProtocolParamUpdate> {
    const keyPtr = Ptr._assertClass(key, GenesisHash);
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_get_jsi(this.ptr, keyPtr);
    return Ptr._wrap(ret, ProtocolParamUpdate);
  }

  keys(): GenesisHashes {
    const ret = CslMobileBridge.csl_bridge_proposed_protocol_parameter_updates_keys_jsi(this.ptr);
    return Ptr._wrap(ret, GenesisHashes);
  }

}

export class ProtocolParamUpdate extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ProtocolParamUpdate {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ProtocolParamUpdate);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ProtocolParamUpdate {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ProtocolParamUpdate);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ProtocolParamUpdate {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_from_json_jsi(json);
    return Ptr._wrap(ret, ProtocolParamUpdate);
  }

  set_minfee_a(minfee_a: BigNum): void {
    const minfee_aPtr = Ptr._assertClass(minfee_a, BigNum);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_minfee_a_jsi(this.ptr, minfee_aPtr);
    return ret;
  }

  minfee_a(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_minfee_a_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_minfee_b(minfee_b: BigNum): void {
    const minfee_bPtr = Ptr._assertClass(minfee_b, BigNum);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_minfee_b_jsi(this.ptr, minfee_bPtr);
    return ret;
  }

  minfee_b(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_minfee_b_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_max_block_body_size(max_block_body_size: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_max_block_body_size_jsi(this.ptr, max_block_body_size);
    return ret;
  }

  max_block_body_size(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_max_block_body_size_jsi(this.ptr);
    return ret;
  }

  set_max_tx_size(max_tx_size: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_max_tx_size_jsi(this.ptr, max_tx_size);
    return ret;
  }

  max_tx_size(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_max_tx_size_jsi(this.ptr);
    return ret;
  }

  set_max_block_header_size(max_block_header_size: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_max_block_header_size_jsi(this.ptr, max_block_header_size);
    return ret;
  }

  max_block_header_size(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_max_block_header_size_jsi(this.ptr);
    return ret;
  }

  set_key_deposit(key_deposit: BigNum): void {
    const key_depositPtr = Ptr._assertClass(key_deposit, BigNum);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_key_deposit_jsi(this.ptr, key_depositPtr);
    return ret;
  }

  key_deposit(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_key_deposit_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_pool_deposit(pool_deposit: BigNum): void {
    const pool_depositPtr = Ptr._assertClass(pool_deposit, BigNum);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_pool_deposit_jsi(this.ptr, pool_depositPtr);
    return ret;
  }

  pool_deposit(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_pool_deposit_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_max_epoch(max_epoch: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_max_epoch_jsi(this.ptr, max_epoch);
    return ret;
  }

  max_epoch(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_max_epoch_jsi(this.ptr);
    return ret;
  }

  set_n_opt(n_opt: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_n_opt_jsi(this.ptr, n_opt);
    return ret;
  }

  n_opt(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_n_opt_jsi(this.ptr);
    return ret;
  }

  set_pool_pledge_influence(pool_pledge_influence: UnitInterval): void {
    const pool_pledge_influencePtr = Ptr._assertClass(pool_pledge_influence, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_pool_pledge_influence_jsi(this.ptr, pool_pledge_influencePtr);
    return ret;
  }

  pool_pledge_influence(): Optional<UnitInterval> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_pool_pledge_influence_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  set_expansion_rate(expansion_rate: UnitInterval): void {
    const expansion_ratePtr = Ptr._assertClass(expansion_rate, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_expansion_rate_jsi(this.ptr, expansion_ratePtr);
    return ret;
  }

  expansion_rate(): Optional<UnitInterval> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_expansion_rate_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  set_treasury_growth_rate(treasury_growth_rate: UnitInterval): void {
    const treasury_growth_ratePtr = Ptr._assertClass(treasury_growth_rate, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_treasury_growth_rate_jsi(this.ptr, treasury_growth_ratePtr);
    return ret;
  }

  treasury_growth_rate(): Optional<UnitInterval> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_treasury_growth_rate_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  d(): Optional<UnitInterval> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_d_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  extra_entropy(): Optional<Nonce> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_extra_entropy_jsi(this.ptr);
    return Ptr._wrap(ret, Nonce);
  }

  set_protocol_version(protocol_version: ProtocolVersion): void {
    const protocol_versionPtr = Ptr._assertClass(protocol_version, ProtocolVersion);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_protocol_version_jsi(this.ptr, protocol_versionPtr);
    return ret;
  }

  protocol_version(): Optional<ProtocolVersion> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_protocol_version_jsi(this.ptr);
    return Ptr._wrap(ret, ProtocolVersion);
  }

  set_min_pool_cost(min_pool_cost: BigNum): void {
    const min_pool_costPtr = Ptr._assertClass(min_pool_cost, BigNum);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_min_pool_cost_jsi(this.ptr, min_pool_costPtr);
    return ret;
  }

  min_pool_cost(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_min_pool_cost_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_ada_per_utxo_byte(ada_per_utxo_byte: BigNum): void {
    const ada_per_utxo_bytePtr = Ptr._assertClass(ada_per_utxo_byte, BigNum);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_ada_per_utxo_byte_jsi(this.ptr, ada_per_utxo_bytePtr);
    return ret;
  }

  ada_per_utxo_byte(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_ada_per_utxo_byte_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_cost_models(cost_models: Costmdls): void {
    const cost_modelsPtr = Ptr._assertClass(cost_models, Costmdls);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_cost_models_jsi(this.ptr, cost_modelsPtr);
    return ret;
  }

  cost_models(): Optional<Costmdls> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_cost_models_jsi(this.ptr);
    return Ptr._wrap(ret, Costmdls);
  }

  set_execution_costs(execution_costs: ExUnitPrices): void {
    const execution_costsPtr = Ptr._assertClass(execution_costs, ExUnitPrices);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_execution_costs_jsi(this.ptr, execution_costsPtr);
    return ret;
  }

  execution_costs(): Optional<ExUnitPrices> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_execution_costs_jsi(this.ptr);
    return Ptr._wrap(ret, ExUnitPrices);
  }

  set_max_tx_ex_units(max_tx_ex_units: ExUnits): void {
    const max_tx_ex_unitsPtr = Ptr._assertClass(max_tx_ex_units, ExUnits);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_max_tx_ex_units_jsi(this.ptr, max_tx_ex_unitsPtr);
    return ret;
  }

  max_tx_ex_units(): Optional<ExUnits> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_max_tx_ex_units_jsi(this.ptr);
    return Ptr._wrap(ret, ExUnits);
  }

  set_max_block_ex_units(max_block_ex_units: ExUnits): void {
    const max_block_ex_unitsPtr = Ptr._assertClass(max_block_ex_units, ExUnits);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_max_block_ex_units_jsi(this.ptr, max_block_ex_unitsPtr);
    return ret;
  }

  max_block_ex_units(): Optional<ExUnits> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_max_block_ex_units_jsi(this.ptr);
    return Ptr._wrap(ret, ExUnits);
  }

  set_max_value_size(max_value_size: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_max_value_size_jsi(this.ptr, max_value_size);
    return ret;
  }

  max_value_size(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_max_value_size_jsi(this.ptr);
    return ret;
  }

  set_collateral_percentage(collateral_percentage: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_collateral_percentage_jsi(this.ptr, collateral_percentage);
    return ret;
  }

  collateral_percentage(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_collateral_percentage_jsi(this.ptr);
    return ret;
  }

  set_max_collateral_inputs(max_collateral_inputs: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_max_collateral_inputs_jsi(this.ptr, max_collateral_inputs);
    return ret;
  }

  max_collateral_inputs(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_max_collateral_inputs_jsi(this.ptr);
    return ret;
  }

  set_pool_voting_thresholds(pool_voting_thresholds: PoolVotingThresholds): void {
    const pool_voting_thresholdsPtr = Ptr._assertClass(pool_voting_thresholds, PoolVotingThresholds);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_pool_voting_thresholds_jsi(this.ptr, pool_voting_thresholdsPtr);
    return ret;
  }

  pool_voting_thresholds(): Optional<PoolVotingThresholds> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_pool_voting_thresholds_jsi(this.ptr);
    return Ptr._wrap(ret, PoolVotingThresholds);
  }

  set_drep_voting_thresholds(drep_voting_thresholds: DRepVotingThresholds): void {
    const drep_voting_thresholdsPtr = Ptr._assertClass(drep_voting_thresholds, DRepVotingThresholds);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_drep_voting_thresholds_jsi(this.ptr, drep_voting_thresholdsPtr);
    return ret;
  }

  drep_voting_thresholds(): Optional<DRepVotingThresholds> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_drep_voting_thresholds_jsi(this.ptr);
    return Ptr._wrap(ret, DRepVotingThresholds);
  }

  set_min_committee_size(min_committee_size: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_min_committee_size_jsi(this.ptr, min_committee_size);
    return ret;
  }

  min_committee_size(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_min_committee_size_jsi(this.ptr);
    return ret;
  }

  set_committee_term_limit(committee_term_limit: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_committee_term_limit_jsi(this.ptr, committee_term_limit);
    return ret;
  }

  committee_term_limit(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_committee_term_limit_jsi(this.ptr);
    return ret;
  }

  set_governance_action_validity_period(governance_action_validity_period: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_governance_action_validity_period_jsi(this.ptr, governance_action_validity_period);
    return ret;
  }

  governance_action_validity_period(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_governance_action_validity_period_jsi(this.ptr);
    return ret;
  }

  set_governance_action_deposit(governance_action_deposit: BigNum): void {
    const governance_action_depositPtr = Ptr._assertClass(governance_action_deposit, BigNum);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_governance_action_deposit_jsi(this.ptr, governance_action_depositPtr);
    return ret;
  }

  governance_action_deposit(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_governance_action_deposit_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_drep_deposit(drep_deposit: BigNum): void {
    const drep_depositPtr = Ptr._assertClass(drep_deposit, BigNum);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_drep_deposit_jsi(this.ptr, drep_depositPtr);
    return ret;
  }

  drep_deposit(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_drep_deposit_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_drep_inactivity_period(drep_inactivity_period: number): void {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_drep_inactivity_period_jsi(this.ptr, drep_inactivity_period);
    return ret;
  }

  drep_inactivity_period(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_drep_inactivity_period_jsi(this.ptr);
    return ret;
  }

  set_ref_script_coins_per_byte(ref_script_coins_per_byte: UnitInterval): void {
    const ref_script_coins_per_bytePtr = Ptr._assertClass(ref_script_coins_per_byte, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_set_ref_script_coins_per_byte_jsi(this.ptr, ref_script_coins_per_bytePtr);
    return ret;
  }

  ref_script_coins_per_byte(): Optional<UnitInterval> {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_ref_script_coins_per_byte_jsi(this.ptr);
    return Ptr._wrap(ret, UnitInterval);
  }

  static new(): ProtocolParamUpdate {
    const ret = CslMobileBridge.csl_bridge_protocol_param_update_new_jsi();
    return Ptr._wrap(ret, ProtocolParamUpdate);
  }

}

export class ProtocolVersion extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_protocol_version_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ProtocolVersion {
    const ret = CslMobileBridge.csl_bridge_protocol_version_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ProtocolVersion);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_protocol_version_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ProtocolVersion {
    const ret = CslMobileBridge.csl_bridge_protocol_version_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ProtocolVersion);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_protocol_version_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ProtocolVersion {
    const ret = CslMobileBridge.csl_bridge_protocol_version_from_json_jsi(json);
    return Ptr._wrap(ret, ProtocolVersion);
  }

  major(): number {
    const ret = CslMobileBridge.csl_bridge_protocol_version_major_jsi(this.ptr);
    return ret;
  }

  minor(): number {
    const ret = CslMobileBridge.csl_bridge_protocol_version_minor_jsi(this.ptr);
    return ret;
  }

  static new(major: number, minor: number): ProtocolVersion {
    const ret = CslMobileBridge.csl_bridge_protocol_version_new_jsi(major, minor);
    return Ptr._wrap(ret, ProtocolVersion);
  }

}

export class PublicKey extends Ptr {
  static from_bech32(bech32_str: string): PublicKey {
    const ret = CslMobileBridge.csl_bridge_public_key_from_bech32_jsi(bech32_str);
    return Ptr._wrap(ret, PublicKey);
  }

  to_bech32(): string {
    const ret = CslMobileBridge.csl_bridge_public_key_to_bech32_jsi(this.ptr);
    return ret;
  }

  as_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_public_key_as_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): PublicKey {
    const ret = CslMobileBridge.csl_bridge_public_key_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, PublicKey);
  }

  verify(data: Uint8Array, signature: Ed25519Signature): boolean {
    const signaturePtr = Ptr._assertClass(signature, Ed25519Signature);
    const ret = CslMobileBridge.csl_bridge_public_key_verify_jsi(this.ptr, b64FromUint8Array(data), signaturePtr);
    return ret;
  }

  hash(): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_public_key_hash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_public_key_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): PublicKey {
    const ret = CslMobileBridge.csl_bridge_public_key_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, PublicKey);
  }

}

export class PublicKeys extends Ptr {
  static new(): PublicKeys {
    const ret = CslMobileBridge.csl_bridge_public_keys_new_jsi();
    return Ptr._wrap(ret, PublicKeys);
  }

  size(): number {
    const ret = CslMobileBridge.csl_bridge_public_keys_size_jsi(this.ptr);
    return ret;
  }

  get(index: number): PublicKey {
    const ret = CslMobileBridge.csl_bridge_public_keys_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, PublicKey);
  }

  add(key: PublicKey): void {
    const keyPtr = Ptr._assertClass(key, PublicKey);
    const ret = CslMobileBridge.csl_bridge_public_keys_add_jsi(this.ptr, keyPtr);
    return ret;
  }

}

export class Redeemer extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_redeemer_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Redeemer {
    const ret = CslMobileBridge.csl_bridge_redeemer_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Redeemer);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_redeemer_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Redeemer {
    const ret = CslMobileBridge.csl_bridge_redeemer_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Redeemer);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_redeemer_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Redeemer {
    const ret = CslMobileBridge.csl_bridge_redeemer_from_json_jsi(json);
    return Ptr._wrap(ret, Redeemer);
  }

  tag(): RedeemerTag {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_jsi(this.ptr);
    return Ptr._wrap(ret, RedeemerTag);
  }

  index(): BigNum {
    const ret = CslMobileBridge.csl_bridge_redeemer_index_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  data(): PlutusData {
    const ret = CslMobileBridge.csl_bridge_redeemer_data_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusData);
  }

  ex_units(): ExUnits {
    const ret = CslMobileBridge.csl_bridge_redeemer_ex_units_jsi(this.ptr);
    return Ptr._wrap(ret, ExUnits);
  }

  static new(tag: RedeemerTag, index: BigNum, data: PlutusData, ex_units: ExUnits): Redeemer {
    const tagPtr = Ptr._assertClass(tag, RedeemerTag);
    const indexPtr = Ptr._assertClass(index, BigNum);
    const dataPtr = Ptr._assertClass(data, PlutusData);
    const ex_unitsPtr = Ptr._assertClass(ex_units, ExUnits);
    const ret = CslMobileBridge.csl_bridge_redeemer_new_jsi(tagPtr, indexPtr, dataPtr, ex_unitsPtr);
    return Ptr._wrap(ret, Redeemer);
  }

}

export class RedeemerTag extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): RedeemerTag {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, RedeemerTag);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): RedeemerTag {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, RedeemerTag);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): RedeemerTag {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_from_json_jsi(json);
    return Ptr._wrap(ret, RedeemerTag);
  }

  static new_spend(): RedeemerTag {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_new_spend_jsi();
    return Ptr._wrap(ret, RedeemerTag);
  }

  static new_mint(): RedeemerTag {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_new_mint_jsi();
    return Ptr._wrap(ret, RedeemerTag);
  }

  static new_cert(): RedeemerTag {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_new_cert_jsi();
    return Ptr._wrap(ret, RedeemerTag);
  }

  static new_reward(): RedeemerTag {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_new_reward_jsi();
    return Ptr._wrap(ret, RedeemerTag);
  }

  static new_vote(): RedeemerTag {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_new_vote_jsi();
    return Ptr._wrap(ret, RedeemerTag);
  }

  static new_voting_proposal(): RedeemerTag {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_new_voting_proposal_jsi();
    return Ptr._wrap(ret, RedeemerTag);
  }

  kind(): RedeemerTagKind {
    const ret = CslMobileBridge.csl_bridge_redeemer_tag_kind_jsi(this.ptr);
    return ret;
  }

}

export class Redeemers extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_redeemers_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Redeemers {
    const ret = CslMobileBridge.csl_bridge_redeemers_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Redeemers);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_redeemers_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Redeemers {
    const ret = CslMobileBridge.csl_bridge_redeemers_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Redeemers);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_redeemers_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Redeemers {
    const ret = CslMobileBridge.csl_bridge_redeemers_from_json_jsi(json);
    return Ptr._wrap(ret, Redeemers);
  }

  static new(): Redeemers {
    const ret = CslMobileBridge.csl_bridge_redeemers_new_jsi();
    return Ptr._wrap(ret, Redeemers);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_redeemers_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): Redeemer {
    const ret = CslMobileBridge.csl_bridge_redeemers_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, Redeemer);
  }

  add(elem: Redeemer): void {
    const elemPtr = Ptr._assertClass(elem, Redeemer);
    const ret = CslMobileBridge.csl_bridge_redeemers_add_jsi(this.ptr, elemPtr);
    return ret;
  }

  get_container_type(): CborContainerType {
    const ret = CslMobileBridge.csl_bridge_redeemers_get_container_type_jsi(this.ptr);
    return ret;
  }

  total_ex_units(): ExUnits {
    const ret = CslMobileBridge.csl_bridge_redeemers_total_ex_units_jsi(this.ptr);
    return Ptr._wrap(ret, ExUnits);
  }

}

export class Relay extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_relay_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Relay {
    const ret = CslMobileBridge.csl_bridge_relay_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Relay);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_relay_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Relay {
    const ret = CslMobileBridge.csl_bridge_relay_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Relay);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_relay_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Relay {
    const ret = CslMobileBridge.csl_bridge_relay_from_json_jsi(json);
    return Ptr._wrap(ret, Relay);
  }

  static new_single_host_addr(single_host_addr: SingleHostAddr): Relay {
    const single_host_addrPtr = Ptr._assertClass(single_host_addr, SingleHostAddr);
    const ret = CslMobileBridge.csl_bridge_relay_new_single_host_addr_jsi(single_host_addrPtr);
    return Ptr._wrap(ret, Relay);
  }

  static new_single_host_name(single_host_name: SingleHostName): Relay {
    const single_host_namePtr = Ptr._assertClass(single_host_name, SingleHostName);
    const ret = CslMobileBridge.csl_bridge_relay_new_single_host_name_jsi(single_host_namePtr);
    return Ptr._wrap(ret, Relay);
  }

  static new_multi_host_name(multi_host_name: MultiHostName): Relay {
    const multi_host_namePtr = Ptr._assertClass(multi_host_name, MultiHostName);
    const ret = CslMobileBridge.csl_bridge_relay_new_multi_host_name_jsi(multi_host_namePtr);
    return Ptr._wrap(ret, Relay);
  }

  kind(): RelayKind {
    const ret = CslMobileBridge.csl_bridge_relay_kind_jsi(this.ptr);
    return ret;
  }

  as_single_host_addr(): Optional<SingleHostAddr> {
    const ret = CslMobileBridge.csl_bridge_relay_as_single_host_addr_jsi(this.ptr);
    return Ptr._wrap(ret, SingleHostAddr);
  }

  as_single_host_name(): Optional<SingleHostName> {
    const ret = CslMobileBridge.csl_bridge_relay_as_single_host_name_jsi(this.ptr);
    return Ptr._wrap(ret, SingleHostName);
  }

  as_multi_host_name(): Optional<MultiHostName> {
    const ret = CslMobileBridge.csl_bridge_relay_as_multi_host_name_jsi(this.ptr);
    return Ptr._wrap(ret, MultiHostName);
  }

}

export class Relays extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_relays_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Relays {
    const ret = CslMobileBridge.csl_bridge_relays_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Relays);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_relays_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Relays {
    const ret = CslMobileBridge.csl_bridge_relays_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Relays);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_relays_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Relays {
    const ret = CslMobileBridge.csl_bridge_relays_from_json_jsi(json);
    return Ptr._wrap(ret, Relays);
  }

  static new(): Relays {
    const ret = CslMobileBridge.csl_bridge_relays_new_jsi();
    return Ptr._wrap(ret, Relays);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_relays_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): Relay {
    const ret = CslMobileBridge.csl_bridge_relays_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, Relay);
  }

  add(elem: Relay): void {
    const elemPtr = Ptr._assertClass(elem, Relay);
    const ret = CslMobileBridge.csl_bridge_relays_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class RewardAddress extends Ptr {
  static new(network: number, payment: Credential): RewardAddress {
    const paymentPtr = Ptr._assertClass(payment, Credential);
    const ret = CslMobileBridge.csl_bridge_reward_address_new_jsi(network, paymentPtr);
    return Ptr._wrap(ret, RewardAddress);
  }

  payment_cred(): Credential {
    const ret = CslMobileBridge.csl_bridge_reward_address_payment_cred_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  to_address(): Address {
    const ret = CslMobileBridge.csl_bridge_reward_address_to_address_jsi(this.ptr);
    return Ptr._wrap(ret, Address);
  }

  static from_address(addr: Address): Optional<RewardAddress> {
    const addrPtr = Ptr._assertClass(addr, Address);
    const ret = CslMobileBridge.csl_bridge_reward_address_from_address_jsi(addrPtr);
    return Ptr._wrap(ret, RewardAddress);
  }

  network_id(): number {
    const ret = CslMobileBridge.csl_bridge_reward_address_network_id_jsi(this.ptr);
    return ret;
  }

}

export class RewardAddresses extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_reward_addresses_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): RewardAddresses {
    const ret = CslMobileBridge.csl_bridge_reward_addresses_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, RewardAddresses);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_reward_addresses_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): RewardAddresses {
    const ret = CslMobileBridge.csl_bridge_reward_addresses_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, RewardAddresses);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_reward_addresses_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): RewardAddresses {
    const ret = CslMobileBridge.csl_bridge_reward_addresses_from_json_jsi(json);
    return Ptr._wrap(ret, RewardAddresses);
  }

  static new(): RewardAddresses {
    const ret = CslMobileBridge.csl_bridge_reward_addresses_new_jsi();
    return Ptr._wrap(ret, RewardAddresses);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_reward_addresses_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): RewardAddress {
    const ret = CslMobileBridge.csl_bridge_reward_addresses_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, RewardAddress);
  }

  add(elem: RewardAddress): void {
    const elemPtr = Ptr._assertClass(elem, RewardAddress);
    const ret = CslMobileBridge.csl_bridge_reward_addresses_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class ScriptAll extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_script_all_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ScriptAll {
    const ret = CslMobileBridge.csl_bridge_script_all_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ScriptAll);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_script_all_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ScriptAll {
    const ret = CslMobileBridge.csl_bridge_script_all_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ScriptAll);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_script_all_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ScriptAll {
    const ret = CslMobileBridge.csl_bridge_script_all_from_json_jsi(json);
    return Ptr._wrap(ret, ScriptAll);
  }

  native_scripts(): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_script_all_native_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  static new(native_scripts: NativeScripts): ScriptAll {
    const native_scriptsPtr = Ptr._assertClass(native_scripts, NativeScripts);
    const ret = CslMobileBridge.csl_bridge_script_all_new_jsi(native_scriptsPtr);
    return Ptr._wrap(ret, ScriptAll);
  }

}

export class ScriptAny extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_script_any_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ScriptAny {
    const ret = CslMobileBridge.csl_bridge_script_any_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ScriptAny);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_script_any_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ScriptAny {
    const ret = CslMobileBridge.csl_bridge_script_any_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ScriptAny);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_script_any_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ScriptAny {
    const ret = CslMobileBridge.csl_bridge_script_any_from_json_jsi(json);
    return Ptr._wrap(ret, ScriptAny);
  }

  native_scripts(): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_script_any_native_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  static new(native_scripts: NativeScripts): ScriptAny {
    const native_scriptsPtr = Ptr._assertClass(native_scripts, NativeScripts);
    const ret = CslMobileBridge.csl_bridge_script_any_new_jsi(native_scriptsPtr);
    return Ptr._wrap(ret, ScriptAny);
  }

}

export class ScriptDataHash extends Ptr {
  static from_bytes(bytes: Uint8Array): ScriptDataHash {
    const ret = CslMobileBridge.csl_bridge_script_data_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ScriptDataHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_script_data_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_script_data_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): ScriptDataHash {
    const ret = CslMobileBridge.csl_bridge_script_data_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, ScriptDataHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_script_data_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): ScriptDataHash {
    const ret = CslMobileBridge.csl_bridge_script_data_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, ScriptDataHash);
  }

}

export class ScriptHash extends Ptr {
  static from_bytes(bytes: Uint8Array): ScriptHash {
    const ret = CslMobileBridge.csl_bridge_script_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ScriptHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_script_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_script_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): ScriptHash {
    const ret = CslMobileBridge.csl_bridge_script_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, ScriptHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_script_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): ScriptHash {
    const ret = CslMobileBridge.csl_bridge_script_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, ScriptHash);
  }

}

export class ScriptHashes extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_script_hashes_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ScriptHashes {
    const ret = CslMobileBridge.csl_bridge_script_hashes_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ScriptHashes);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_script_hashes_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ScriptHashes {
    const ret = CslMobileBridge.csl_bridge_script_hashes_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ScriptHashes);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_script_hashes_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ScriptHashes {
    const ret = CslMobileBridge.csl_bridge_script_hashes_from_json_jsi(json);
    return Ptr._wrap(ret, ScriptHashes);
  }

  static new(): ScriptHashes {
    const ret = CslMobileBridge.csl_bridge_script_hashes_new_jsi();
    return Ptr._wrap(ret, ScriptHashes);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_script_hashes_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): ScriptHash {
    const ret = CslMobileBridge.csl_bridge_script_hashes_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, ScriptHash);
  }

  add(elem: ScriptHash): void {
    const elemPtr = Ptr._assertClass(elem, ScriptHash);
    const ret = CslMobileBridge.csl_bridge_script_hashes_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class ScriptNOfK extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_script_n_of_k_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ScriptNOfK {
    const ret = CslMobileBridge.csl_bridge_script_n_of_k_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ScriptNOfK);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_script_n_of_k_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ScriptNOfK {
    const ret = CslMobileBridge.csl_bridge_script_n_of_k_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ScriptNOfK);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_script_n_of_k_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ScriptNOfK {
    const ret = CslMobileBridge.csl_bridge_script_n_of_k_from_json_jsi(json);
    return Ptr._wrap(ret, ScriptNOfK);
  }

  n(): number {
    const ret = CslMobileBridge.csl_bridge_script_n_of_k_n_jsi(this.ptr);
    return ret;
  }

  native_scripts(): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_script_n_of_k_native_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  static new(n: number, native_scripts: NativeScripts): ScriptNOfK {
    const native_scriptsPtr = Ptr._assertClass(native_scripts, NativeScripts);
    const ret = CslMobileBridge.csl_bridge_script_n_of_k_new_jsi(n, native_scriptsPtr);
    return Ptr._wrap(ret, ScriptNOfK);
  }

}

export class ScriptPubkey extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_script_pubkey_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ScriptPubkey {
    const ret = CslMobileBridge.csl_bridge_script_pubkey_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ScriptPubkey);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_script_pubkey_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ScriptPubkey {
    const ret = CslMobileBridge.csl_bridge_script_pubkey_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ScriptPubkey);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_script_pubkey_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ScriptPubkey {
    const ret = CslMobileBridge.csl_bridge_script_pubkey_from_json_jsi(json);
    return Ptr._wrap(ret, ScriptPubkey);
  }

  addr_keyhash(): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_script_pubkey_addr_keyhash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  static new(addr_keyhash: Ed25519KeyHash): ScriptPubkey {
    const addr_keyhashPtr = Ptr._assertClass(addr_keyhash, Ed25519KeyHash);
    const ret = CslMobileBridge.csl_bridge_script_pubkey_new_jsi(addr_keyhashPtr);
    return Ptr._wrap(ret, ScriptPubkey);
  }

}

export class ScriptRef extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_script_ref_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): ScriptRef {
    const ret = CslMobileBridge.csl_bridge_script_ref_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, ScriptRef);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_script_ref_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): ScriptRef {
    const ret = CslMobileBridge.csl_bridge_script_ref_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, ScriptRef);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_script_ref_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): ScriptRef {
    const ret = CslMobileBridge.csl_bridge_script_ref_from_json_jsi(json);
    return Ptr._wrap(ret, ScriptRef);
  }

  static new_native_script(native_script: NativeScript): ScriptRef {
    const native_scriptPtr = Ptr._assertClass(native_script, NativeScript);
    const ret = CslMobileBridge.csl_bridge_script_ref_new_native_script_jsi(native_scriptPtr);
    return Ptr._wrap(ret, ScriptRef);
  }

  static new_plutus_script(plutus_script: PlutusScript): ScriptRef {
    const plutus_scriptPtr = Ptr._assertClass(plutus_script, PlutusScript);
    const ret = CslMobileBridge.csl_bridge_script_ref_new_plutus_script_jsi(plutus_scriptPtr);
    return Ptr._wrap(ret, ScriptRef);
  }

  is_native_script(): boolean {
    const ret = CslMobileBridge.csl_bridge_script_ref_is_native_script_jsi(this.ptr);
    return ret;
  }

  is_plutus_script(): boolean {
    const ret = CslMobileBridge.csl_bridge_script_ref_is_plutus_script_jsi(this.ptr);
    return ret;
  }

  native_script(): Optional<NativeScript> {
    const ret = CslMobileBridge.csl_bridge_script_ref_native_script_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScript);
  }

  plutus_script(): Optional<PlutusScript> {
    const ret = CslMobileBridge.csl_bridge_script_ref_plutus_script_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusScript);
  }

  to_unwrapped_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_script_ref_to_unwrapped_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

}

export class SingleHostAddr extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_single_host_addr_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): SingleHostAddr {
    const ret = CslMobileBridge.csl_bridge_single_host_addr_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, SingleHostAddr);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_single_host_addr_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): SingleHostAddr {
    const ret = CslMobileBridge.csl_bridge_single_host_addr_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, SingleHostAddr);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_single_host_addr_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): SingleHostAddr {
    const ret = CslMobileBridge.csl_bridge_single_host_addr_from_json_jsi(json);
    return Ptr._wrap(ret, SingleHostAddr);
  }

  port(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_single_host_addr_port_jsi(this.ptr);
    return ret;
  }

  ipv4(): Optional<Ipv4> {
    const ret = CslMobileBridge.csl_bridge_single_host_addr_ipv4_jsi(this.ptr);
    return Ptr._wrap(ret, Ipv4);
  }

  ipv6(): Optional<Ipv6> {
    const ret = CslMobileBridge.csl_bridge_single_host_addr_ipv6_jsi(this.ptr);
    return Ptr._wrap(ret, Ipv6);
  }

  static new(port: Optional<number>, ipv4: Optional<Ipv4>, ipv6: Optional<Ipv6>): SingleHostAddr {
    const ipv4Ptr = Ptr._assertOptionalClass(ipv4, Ipv4);
    const ipv6Ptr = Ptr._assertOptionalClass(ipv6, Ipv6);
    if(port == null && ipv4 == null && ipv6 == null) {
      const ret = CslMobileBridge.csl_bridge_single_host_addr_new_jsi();
      return Ptr._wrap(ret, SingleHostAddr);
    }
    if(port != null && ipv4 == null && ipv6 == null) {
      const ret = CslMobileBridge.csl_bridge_single_host_addr_new_with_port_jsi(port!);
      return Ptr._wrap(ret, SingleHostAddr);
    }
    if(port == null && ipv4 != null && ipv6 == null) {
      const ret = CslMobileBridge.csl_bridge_single_host_addr_new_with_ipv4_jsi(ipv4Ptr!);
      return Ptr._wrap(ret, SingleHostAddr);
    }
    if(port != null && ipv4 != null && ipv6 == null) {
      const ret = CslMobileBridge.csl_bridge_single_host_addr_new_with_port_ipv4_jsi(port!, ipv4Ptr!);
      return Ptr._wrap(ret, SingleHostAddr);
    }
    if(port == null && ipv4 == null && ipv6 != null) {
      const ret = CslMobileBridge.csl_bridge_single_host_addr_new_with_ipv6_jsi(ipv6Ptr!);
      return Ptr._wrap(ret, SingleHostAddr);
    }
    if(port != null && ipv4 == null && ipv6 != null) {
      const ret = CslMobileBridge.csl_bridge_single_host_addr_new_with_port_ipv6_jsi(port!, ipv6Ptr!);
      return Ptr._wrap(ret, SingleHostAddr);
    }
    if(port == null && ipv4 != null && ipv6 != null) {
      const ret = CslMobileBridge.csl_bridge_single_host_addr_new_with_ipv4_ipv6_jsi(ipv4Ptr!, ipv6Ptr!);
      return Ptr._wrap(ret, SingleHostAddr);
    }
    if(port != null && ipv4 != null && ipv6 != null) {
      const ret = CslMobileBridge.csl_bridge_single_host_addr_new_with_port_ipv4_ipv6_jsi(port!, ipv4Ptr!, ipv6Ptr!);
      return Ptr._wrap(ret, SingleHostAddr);
    }
    else {
      throw new Error('Unreachable code. Check the codegen.');
    }
  }

}

export class SingleHostName extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_single_host_name_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): SingleHostName {
    const ret = CslMobileBridge.csl_bridge_single_host_name_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, SingleHostName);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_single_host_name_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): SingleHostName {
    const ret = CslMobileBridge.csl_bridge_single_host_name_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, SingleHostName);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_single_host_name_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): SingleHostName {
    const ret = CslMobileBridge.csl_bridge_single_host_name_from_json_jsi(json);
    return Ptr._wrap(ret, SingleHostName);
  }

  port(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_single_host_name_port_jsi(this.ptr);
    return ret;
  }

  dns_name(): DNSRecordAorAAAA {
    const ret = CslMobileBridge.csl_bridge_single_host_name_dns_name_jsi(this.ptr);
    return Ptr._wrap(ret, DNSRecordAorAAAA);
  }

  static new(port: Optional<number>, dns_name: DNSRecordAorAAAA): SingleHostName {
    const dns_namePtr = Ptr._assertClass(dns_name, DNSRecordAorAAAA);
    if(port == null) {
      const ret = CslMobileBridge.csl_bridge_single_host_name_new_jsi(dns_namePtr);
      return Ptr._wrap(ret, SingleHostName);
    }
    if(port != null) {
      const ret = CslMobileBridge.csl_bridge_single_host_name_new_with_port_jsi(port!, dns_namePtr);
      return Ptr._wrap(ret, SingleHostName);
    }
    else {
      throw new Error('Unreachable code. Check the codegen.');
    }
  }

}

export class StakeAndVoteDelegation extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): StakeAndVoteDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, StakeAndVoteDelegation);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): StakeAndVoteDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, StakeAndVoteDelegation);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): StakeAndVoteDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_from_json_jsi(json);
    return Ptr._wrap(ret, StakeAndVoteDelegation);
  }

  stake_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_stake_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  pool_keyhash(): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_pool_keyhash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  drep(): DRep {
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_drep_jsi(this.ptr);
    return Ptr._wrap(ret, DRep);
  }

  static new(stake_credential: Credential, pool_keyhash: Ed25519KeyHash, drep: DRep): StakeAndVoteDelegation {
    const stake_credentialPtr = Ptr._assertClass(stake_credential, Credential);
    const pool_keyhashPtr = Ptr._assertClass(pool_keyhash, Ed25519KeyHash);
    const drepPtr = Ptr._assertClass(drep, DRep);
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_new_jsi(stake_credentialPtr, pool_keyhashPtr, drepPtr);
    return Ptr._wrap(ret, StakeAndVoteDelegation);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_stake_and_vote_delegation_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class StakeDelegation extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_stake_delegation_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): StakeDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_delegation_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, StakeDelegation);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_stake_delegation_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): StakeDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_delegation_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, StakeDelegation);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_stake_delegation_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): StakeDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_delegation_from_json_jsi(json);
    return Ptr._wrap(ret, StakeDelegation);
  }

  stake_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_stake_delegation_stake_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  pool_keyhash(): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_stake_delegation_pool_keyhash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  static new(stake_credential: Credential, pool_keyhash: Ed25519KeyHash): StakeDelegation {
    const stake_credentialPtr = Ptr._assertClass(stake_credential, Credential);
    const pool_keyhashPtr = Ptr._assertClass(pool_keyhash, Ed25519KeyHash);
    const ret = CslMobileBridge.csl_bridge_stake_delegation_new_jsi(stake_credentialPtr, pool_keyhashPtr);
    return Ptr._wrap(ret, StakeDelegation);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_stake_delegation_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class StakeDeregistration extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): StakeDeregistration {
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, StakeDeregistration);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): StakeDeregistration {
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, StakeDeregistration);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): StakeDeregistration {
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_from_json_jsi(json);
    return Ptr._wrap(ret, StakeDeregistration);
  }

  stake_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_stake_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  coin(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_coin_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(stake_credential: Credential): StakeDeregistration {
    const stake_credentialPtr = Ptr._assertClass(stake_credential, Credential);
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_new_jsi(stake_credentialPtr);
    return Ptr._wrap(ret, StakeDeregistration);
  }

  static new_with_explicit_refund(stake_credential: Credential, coin: BigNum): StakeDeregistration {
    const stake_credentialPtr = Ptr._assertClass(stake_credential, Credential);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_new_with_explicit_refund_jsi(stake_credentialPtr, coinPtr);
    return Ptr._wrap(ret, StakeDeregistration);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_stake_deregistration_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class StakeRegistration extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_stake_registration_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): StakeRegistration {
    const ret = CslMobileBridge.csl_bridge_stake_registration_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, StakeRegistration);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_stake_registration_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): StakeRegistration {
    const ret = CslMobileBridge.csl_bridge_stake_registration_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, StakeRegistration);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_stake_registration_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): StakeRegistration {
    const ret = CslMobileBridge.csl_bridge_stake_registration_from_json_jsi(json);
    return Ptr._wrap(ret, StakeRegistration);
  }

  stake_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_stake_registration_stake_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  coin(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_stake_registration_coin_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(stake_credential: Credential): StakeRegistration {
    const stake_credentialPtr = Ptr._assertClass(stake_credential, Credential);
    const ret = CslMobileBridge.csl_bridge_stake_registration_new_jsi(stake_credentialPtr);
    return Ptr._wrap(ret, StakeRegistration);
  }

  static new_with_explicit_deposit(stake_credential: Credential, coin: BigNum): StakeRegistration {
    const stake_credentialPtr = Ptr._assertClass(stake_credential, Credential);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_stake_registration_new_with_explicit_deposit_jsi(stake_credentialPtr, coinPtr);
    return Ptr._wrap(ret, StakeRegistration);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_stake_registration_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class StakeRegistrationAndDelegation extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): StakeRegistrationAndDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, StakeRegistrationAndDelegation);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): StakeRegistrationAndDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, StakeRegistrationAndDelegation);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): StakeRegistrationAndDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_from_json_jsi(json);
    return Ptr._wrap(ret, StakeRegistrationAndDelegation);
  }

  stake_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_stake_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  pool_keyhash(): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_pool_keyhash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  coin(): BigNum {
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_coin_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(stake_credential: Credential, pool_keyhash: Ed25519KeyHash, coin: BigNum): StakeRegistrationAndDelegation {
    const stake_credentialPtr = Ptr._assertClass(stake_credential, Credential);
    const pool_keyhashPtr = Ptr._assertClass(pool_keyhash, Ed25519KeyHash);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_new_jsi(stake_credentialPtr, pool_keyhashPtr, coinPtr);
    return Ptr._wrap(ret, StakeRegistrationAndDelegation);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_stake_registration_and_delegation_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class StakeVoteRegistrationAndDelegation extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): StakeVoteRegistrationAndDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, StakeVoteRegistrationAndDelegation);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): StakeVoteRegistrationAndDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, StakeVoteRegistrationAndDelegation);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): StakeVoteRegistrationAndDelegation {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_from_json_jsi(json);
    return Ptr._wrap(ret, StakeVoteRegistrationAndDelegation);
  }

  stake_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_stake_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  pool_keyhash(): Ed25519KeyHash {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_pool_keyhash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  drep(): DRep {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_drep_jsi(this.ptr);
    return Ptr._wrap(ret, DRep);
  }

  coin(): BigNum {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_coin_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(stake_credential: Credential, pool_keyhash: Ed25519KeyHash, drep: DRep, coin: BigNum): StakeVoteRegistrationAndDelegation {
    const stake_credentialPtr = Ptr._assertClass(stake_credential, Credential);
    const pool_keyhashPtr = Ptr._assertClass(pool_keyhash, Ed25519KeyHash);
    const drepPtr = Ptr._assertClass(drep, DRep);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_new_jsi(stake_credentialPtr, pool_keyhashPtr, drepPtr, coinPtr);
    return Ptr._wrap(ret, StakeVoteRegistrationAndDelegation);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_stake_vote_registration_and_delegation_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class Strings extends Ptr {
  static new(): Strings {
    const ret = CslMobileBridge.csl_bridge_strings_new_jsi();
    return Ptr._wrap(ret, Strings);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_strings_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): string {
    const ret = CslMobileBridge.csl_bridge_strings_get_jsi(this.ptr, index);
    return ret;
  }

  add(elem: string): void {
    const ret = CslMobileBridge.csl_bridge_strings_add_jsi(this.ptr, elem);
    return ret;
  }

}

export class TimelockExpiry extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_timelock_expiry_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TimelockExpiry {
    const ret = CslMobileBridge.csl_bridge_timelock_expiry_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TimelockExpiry);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_timelock_expiry_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TimelockExpiry {
    const ret = CslMobileBridge.csl_bridge_timelock_expiry_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TimelockExpiry);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_timelock_expiry_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TimelockExpiry {
    const ret = CslMobileBridge.csl_bridge_timelock_expiry_from_json_jsi(json);
    return Ptr._wrap(ret, TimelockExpiry);
  }

  slot(): number {
    const ret = CslMobileBridge.csl_bridge_timelock_expiry_slot_jsi(this.ptr);
    return ret;
  }

  slot_bignum(): BigNum {
    const ret = CslMobileBridge.csl_bridge_timelock_expiry_slot_bignum_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(slot: number): TimelockExpiry {
    const ret = CslMobileBridge.csl_bridge_timelock_expiry_new_jsi(slot);
    return Ptr._wrap(ret, TimelockExpiry);
  }

  static new_timelockexpiry(slot: BigNum): TimelockExpiry {
    const slotPtr = Ptr._assertClass(slot, BigNum);
    const ret = CslMobileBridge.csl_bridge_timelock_expiry_new_timelockexpiry_jsi(slotPtr);
    return Ptr._wrap(ret, TimelockExpiry);
  }

}

export class TimelockStart extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_timelock_start_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TimelockStart {
    const ret = CslMobileBridge.csl_bridge_timelock_start_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TimelockStart);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_timelock_start_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TimelockStart {
    const ret = CslMobileBridge.csl_bridge_timelock_start_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TimelockStart);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_timelock_start_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TimelockStart {
    const ret = CslMobileBridge.csl_bridge_timelock_start_from_json_jsi(json);
    return Ptr._wrap(ret, TimelockStart);
  }

  slot(): number {
    const ret = CslMobileBridge.csl_bridge_timelock_start_slot_jsi(this.ptr);
    return ret;
  }

  slot_bignum(): BigNum {
    const ret = CslMobileBridge.csl_bridge_timelock_start_slot_bignum_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(slot: number): TimelockStart {
    const ret = CslMobileBridge.csl_bridge_timelock_start_new_jsi(slot);
    return Ptr._wrap(ret, TimelockStart);
  }

  static new_timelockstart(slot: BigNum): TimelockStart {
    const slotPtr = Ptr._assertClass(slot, BigNum);
    const ret = CslMobileBridge.csl_bridge_timelock_start_new_timelockstart_jsi(slotPtr);
    return Ptr._wrap(ret, TimelockStart);
  }

}

export class Transaction extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Transaction {
    const ret = CslMobileBridge.csl_bridge_transaction_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Transaction);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Transaction {
    const ret = CslMobileBridge.csl_bridge_transaction_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Transaction);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Transaction {
    const ret = CslMobileBridge.csl_bridge_transaction_from_json_jsi(json);
    return Ptr._wrap(ret, Transaction);
  }

  body(): TransactionBody {
    const ret = CslMobileBridge.csl_bridge_transaction_body_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionBody);
  }

  witness_set(): TransactionWitnessSet {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionWitnessSet);
  }

  is_valid(): boolean {
    const ret = CslMobileBridge.csl_bridge_transaction_is_valid_jsi(this.ptr);
    return ret;
  }

  auxiliary_data(): Optional<AuxiliaryData> {
    const ret = CslMobileBridge.csl_bridge_transaction_auxiliary_data_jsi(this.ptr);
    return Ptr._wrap(ret, AuxiliaryData);
  }

  set_is_valid(valid: boolean): void {
    const ret = CslMobileBridge.csl_bridge_transaction_set_is_valid_jsi(this.ptr, valid);
    return ret;
  }

  static new(body: TransactionBody, witness_set: TransactionWitnessSet, auxiliary_data: Optional<AuxiliaryData>): Transaction {
    const bodyPtr = Ptr._assertClass(body, TransactionBody);
    const witness_setPtr = Ptr._assertClass(witness_set, TransactionWitnessSet);
    const auxiliary_dataPtr = Ptr._assertOptionalClass(auxiliary_data, AuxiliaryData);
    if(auxiliary_data == null) {
      const ret = CslMobileBridge.csl_bridge_transaction_new_jsi(bodyPtr, witness_setPtr);
      return Ptr._wrap(ret, Transaction);
    }
    if(auxiliary_data != null) {
      const ret = CslMobileBridge.csl_bridge_transaction_new_with_auxiliary_data_jsi(bodyPtr, witness_setPtr, auxiliary_dataPtr!);
      return Ptr._wrap(ret, Transaction);
    }
    else {
      throw new Error('Unreachable code. Check the codegen.');
    }
  }

}

export class TransactionBatch extends Ptr {
  len(): number {
    const ret = CslMobileBridge.csl_bridge_transaction_batch_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): Transaction {
    const ret = CslMobileBridge.csl_bridge_transaction_batch_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, Transaction);
  }

}

export class TransactionBatchList extends Ptr {
  len(): number {
    const ret = CslMobileBridge.csl_bridge_transaction_batch_list_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): TransactionBatch {
    const ret = CslMobileBridge.csl_bridge_transaction_batch_list_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, TransactionBatch);
  }

}

export class TransactionBodies extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_bodies_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionBodies {
    const ret = CslMobileBridge.csl_bridge_transaction_bodies_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionBodies);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_bodies_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionBodies {
    const ret = CslMobileBridge.csl_bridge_transaction_bodies_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionBodies);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_bodies_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TransactionBodies {
    const ret = CslMobileBridge.csl_bridge_transaction_bodies_from_json_jsi(json);
    return Ptr._wrap(ret, TransactionBodies);
  }

  static new(): TransactionBodies {
    const ret = CslMobileBridge.csl_bridge_transaction_bodies_new_jsi();
    return Ptr._wrap(ret, TransactionBodies);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_transaction_bodies_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): TransactionBody {
    const ret = CslMobileBridge.csl_bridge_transaction_bodies_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, TransactionBody);
  }

  add(elem: TransactionBody): void {
    const elemPtr = Ptr._assertClass(elem, TransactionBody);
    const ret = CslMobileBridge.csl_bridge_transaction_bodies_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class TransactionBody extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_body_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionBody {
    const ret = CslMobileBridge.csl_bridge_transaction_body_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionBody);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_body_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionBody {
    const ret = CslMobileBridge.csl_bridge_transaction_body_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionBody);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_body_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TransactionBody {
    const ret = CslMobileBridge.csl_bridge_transaction_body_from_json_jsi(json);
    return Ptr._wrap(ret, TransactionBody);
  }

  inputs(): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_transaction_body_inputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  outputs(): TransactionOutputs {
    const ret = CslMobileBridge.csl_bridge_transaction_body_outputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionOutputs);
  }

  fee(): BigNum {
    const ret = CslMobileBridge.csl_bridge_transaction_body_fee_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  ttl(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_ttl_jsi(this.ptr);
    return ret;
  }

  ttl_bignum(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_ttl_bignum_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_ttl(ttl: BigNum): void {
    const ttlPtr = Ptr._assertClass(ttl, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_ttl_jsi(this.ptr, ttlPtr);
    return ret;
  }

  remove_ttl(): void {
    const ret = CslMobileBridge.csl_bridge_transaction_body_remove_ttl_jsi(this.ptr);
    return ret;
  }

  set_certs(certs: Certificates): void {
    const certsPtr = Ptr._assertClass(certs, Certificates);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_certs_jsi(this.ptr, certsPtr);
    return ret;
  }

  certs(): Optional<Certificates> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_certs_jsi(this.ptr);
    return Ptr._wrap(ret, Certificates);
  }

  set_withdrawals(withdrawals: Withdrawals): void {
    const withdrawalsPtr = Ptr._assertClass(withdrawals, Withdrawals);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_withdrawals_jsi(this.ptr, withdrawalsPtr);
    return ret;
  }

  withdrawals(): Optional<Withdrawals> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_withdrawals_jsi(this.ptr);
    return Ptr._wrap(ret, Withdrawals);
  }

  set_update(update: Update): void {
    const updatePtr = Ptr._assertClass(update, Update);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_update_jsi(this.ptr, updatePtr);
    return ret;
  }

  update(): Optional<Update> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_update_jsi(this.ptr);
    return Ptr._wrap(ret, Update);
  }

  set_auxiliary_data_hash(auxiliary_data_hash: AuxiliaryDataHash): void {
    const auxiliary_data_hashPtr = Ptr._assertClass(auxiliary_data_hash, AuxiliaryDataHash);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_auxiliary_data_hash_jsi(this.ptr, auxiliary_data_hashPtr);
    return ret;
  }

  auxiliary_data_hash(): Optional<AuxiliaryDataHash> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_auxiliary_data_hash_jsi(this.ptr);
    return Ptr._wrap(ret, AuxiliaryDataHash);
  }

  set_validity_start_interval(validity_start_interval: number): void {
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_validity_start_interval_jsi(this.ptr, validity_start_interval);
    return ret;
  }

  set_validity_start_interval_bignum(validity_start_interval: BigNum): void {
    const validity_start_intervalPtr = Ptr._assertClass(validity_start_interval, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_validity_start_interval_bignum_jsi(this.ptr, validity_start_intervalPtr);
    return ret;
  }

  validity_start_interval_bignum(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_validity_start_interval_bignum_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  validity_start_interval(): Optional<number> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_validity_start_interval_jsi(this.ptr);
    return ret;
  }

  set_mint(mint: Mint): void {
    const mintPtr = Ptr._assertClass(mint, Mint);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_mint_jsi(this.ptr, mintPtr);
    return ret;
  }

  mint(): Optional<Mint> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_mint_jsi(this.ptr);
    return Ptr._wrap(ret, Mint);
  }

  set_reference_inputs(reference_inputs: TransactionInputs): void {
    const reference_inputsPtr = Ptr._assertClass(reference_inputs, TransactionInputs);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_reference_inputs_jsi(this.ptr, reference_inputsPtr);
    return ret;
  }

  reference_inputs(): Optional<TransactionInputs> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_reference_inputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  set_script_data_hash(script_data_hash: ScriptDataHash): void {
    const script_data_hashPtr = Ptr._assertClass(script_data_hash, ScriptDataHash);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_script_data_hash_jsi(this.ptr, script_data_hashPtr);
    return ret;
  }

  script_data_hash(): Optional<ScriptDataHash> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_script_data_hash_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptDataHash);
  }

  set_collateral(collateral: TransactionInputs): void {
    const collateralPtr = Ptr._assertClass(collateral, TransactionInputs);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_collateral_jsi(this.ptr, collateralPtr);
    return ret;
  }

  collateral(): Optional<TransactionInputs> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_collateral_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  set_required_signers(required_signers: Ed25519KeyHashes): void {
    const required_signersPtr = Ptr._assertClass(required_signers, Ed25519KeyHashes);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_required_signers_jsi(this.ptr, required_signersPtr);
    return ret;
  }

  required_signers(): Optional<Ed25519KeyHashes> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_required_signers_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHashes);
  }

  set_network_id(network_id: NetworkId): void {
    const network_idPtr = Ptr._assertClass(network_id, NetworkId);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_network_id_jsi(this.ptr, network_idPtr);
    return ret;
  }

  network_id(): Optional<NetworkId> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_network_id_jsi(this.ptr);
    return Ptr._wrap(ret, NetworkId);
  }

  set_collateral_return(collateral_return: TransactionOutput): void {
    const collateral_returnPtr = Ptr._assertClass(collateral_return, TransactionOutput);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_collateral_return_jsi(this.ptr, collateral_returnPtr);
    return ret;
  }

  collateral_return(): Optional<TransactionOutput> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_collateral_return_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionOutput);
  }

  set_total_collateral(total_collateral: BigNum): void {
    const total_collateralPtr = Ptr._assertClass(total_collateral, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_total_collateral_jsi(this.ptr, total_collateralPtr);
    return ret;
  }

  total_collateral(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_total_collateral_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_voting_procedures(voting_procedures: VotingProcedures): void {
    const voting_proceduresPtr = Ptr._assertClass(voting_procedures, VotingProcedures);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_voting_procedures_jsi(this.ptr, voting_proceduresPtr);
    return ret;
  }

  voting_procedures(): Optional<VotingProcedures> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_voting_procedures_jsi(this.ptr);
    return Ptr._wrap(ret, VotingProcedures);
  }

  set_voting_proposals(voting_proposals: VotingProposals): void {
    const voting_proposalsPtr = Ptr._assertClass(voting_proposals, VotingProposals);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_voting_proposals_jsi(this.ptr, voting_proposalsPtr);
    return ret;
  }

  voting_proposals(): Optional<VotingProposals> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_voting_proposals_jsi(this.ptr);
    return Ptr._wrap(ret, VotingProposals);
  }

  set_donation(donation: BigNum): void {
    const donationPtr = Ptr._assertClass(donation, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_donation_jsi(this.ptr, donationPtr);
    return ret;
  }

  donation(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_donation_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_current_treasury_value(current_treasury_value: BigNum): void {
    const current_treasury_valuePtr = Ptr._assertClass(current_treasury_value, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_body_set_current_treasury_value_jsi(this.ptr, current_treasury_valuePtr);
    return ret;
  }

  current_treasury_value(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_transaction_body_current_treasury_value_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(inputs: TransactionInputs, outputs: TransactionOutputs, fee: BigNum, ttl: Optional<number>): TransactionBody {
    const inputsPtr = Ptr._assertClass(inputs, TransactionInputs);
    const outputsPtr = Ptr._assertClass(outputs, TransactionOutputs);
    const feePtr = Ptr._assertClass(fee, BigNum);
    if(ttl == null) {
      const ret = CslMobileBridge.csl_bridge_transaction_body_new_jsi(inputsPtr, outputsPtr, feePtr);
      return Ptr._wrap(ret, TransactionBody);
    }
    if(ttl != null) {
      const ret = CslMobileBridge.csl_bridge_transaction_body_new_with_ttl_jsi(inputsPtr, outputsPtr, feePtr, ttl!);
      return Ptr._wrap(ret, TransactionBody);
    }
    else {
      throw new Error('Unreachable code. Check the codegen.');
    }
  }

  static new_tx_body(inputs: TransactionInputs, outputs: TransactionOutputs, fee: BigNum): TransactionBody {
    const inputsPtr = Ptr._assertClass(inputs, TransactionInputs);
    const outputsPtr = Ptr._assertClass(outputs, TransactionOutputs);
    const feePtr = Ptr._assertClass(fee, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_body_new_tx_body_jsi(inputsPtr, outputsPtr, feePtr);
    return Ptr._wrap(ret, TransactionBody);
  }

}

export class TransactionBuilder extends Ptr {
  add_inputs_from(inputs: TransactionUnspentOutputs, strategy: CoinSelectionStrategyCIP2): void {
    const inputsPtr = Ptr._assertClass(inputs, TransactionUnspentOutputs);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_inputs_from_jsi(this.ptr, inputsPtr, strategy);
    return ret;
  }

  set_inputs(inputs: TxInputsBuilder): void {
    const inputsPtr = Ptr._assertClass(inputs, TxInputsBuilder);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_inputs_jsi(this.ptr, inputsPtr);
    return ret;
  }

  set_collateral(collateral: TxInputsBuilder): void {
    const collateralPtr = Ptr._assertClass(collateral, TxInputsBuilder);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_collateral_jsi(this.ptr, collateralPtr);
    return ret;
  }

  set_collateral_return(collateral_return: TransactionOutput): void {
    const collateral_returnPtr = Ptr._assertClass(collateral_return, TransactionOutput);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_collateral_return_jsi(this.ptr, collateral_returnPtr);
    return ret;
  }

  remove_collateral_return(): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_remove_collateral_return_jsi(this.ptr);
    return ret;
  }

  set_collateral_return_and_total(collateral_return: TransactionOutput): void {
    const collateral_returnPtr = Ptr._assertClass(collateral_return, TransactionOutput);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_collateral_return_and_total_jsi(this.ptr, collateral_returnPtr);
    return ret;
  }

  set_total_collateral(total_collateral: BigNum): void {
    const total_collateralPtr = Ptr._assertClass(total_collateral, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_total_collateral_jsi(this.ptr, total_collateralPtr);
    return ret;
  }

  remove_total_collateral(): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_remove_total_collateral_jsi(this.ptr);
    return ret;
  }

  set_total_collateral_and_return(total_collateral: BigNum, return_address: Address): void {
    const total_collateralPtr = Ptr._assertClass(total_collateral, BigNum);
    const return_addressPtr = Ptr._assertClass(return_address, Address);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_total_collateral_and_return_jsi(this.ptr, total_collateralPtr, return_addressPtr);
    return ret;
  }

  add_reference_input(reference_input: TransactionInput): void {
    const reference_inputPtr = Ptr._assertClass(reference_input, TransactionInput);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_reference_input_jsi(this.ptr, reference_inputPtr);
    return ret;
  }

  add_script_reference_input(reference_input: TransactionInput, script_size: number): void {
    const reference_inputPtr = Ptr._assertClass(reference_input, TransactionInput);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_script_reference_input_jsi(this.ptr, reference_inputPtr, script_size);
    return ret;
  }

  add_key_input(hash: Ed25519KeyHash, input: TransactionInput, amount: Value): void {
    const hashPtr = Ptr._assertClass(hash, Ed25519KeyHash);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_key_input_jsi(this.ptr, hashPtr, inputPtr, amountPtr);
    return ret;
  }

  add_native_script_input(script: NativeScript, input: TransactionInput, amount: Value): void {
    const scriptPtr = Ptr._assertClass(script, NativeScript);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_native_script_input_jsi(this.ptr, scriptPtr, inputPtr, amountPtr);
    return ret;
  }

  add_plutus_script_input(witness: PlutusWitness, input: TransactionInput, amount: Value): void {
    const witnessPtr = Ptr._assertClass(witness, PlutusWitness);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_plutus_script_input_jsi(this.ptr, witnessPtr, inputPtr, amountPtr);
    return ret;
  }

  add_bootstrap_input(hash: ByronAddress, input: TransactionInput, amount: Value): void {
    const hashPtr = Ptr._assertClass(hash, ByronAddress);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_bootstrap_input_jsi(this.ptr, hashPtr, inputPtr, amountPtr);
    return ret;
  }

  add_regular_input(address: Address, input: TransactionInput, amount: Value): void {
    const addressPtr = Ptr._assertClass(address, Address);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_regular_input_jsi(this.ptr, addressPtr, inputPtr, amountPtr);
    return ret;
  }

  add_inputs_from_and_change(inputs: TransactionUnspentOutputs, strategy: CoinSelectionStrategyCIP2, change_config: ChangeConfig): boolean {
    const inputsPtr = Ptr._assertClass(inputs, TransactionUnspentOutputs);
    const change_configPtr = Ptr._assertClass(change_config, ChangeConfig);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_inputs_from_and_change_jsi(this.ptr, inputsPtr, strategy, change_configPtr);
    return ret;
  }

  add_inputs_from_and_change_with_collateral_return(inputs: TransactionUnspentOutputs, strategy: CoinSelectionStrategyCIP2, change_config: ChangeConfig, collateral_percentage: BigNum): void {
    const inputsPtr = Ptr._assertClass(inputs, TransactionUnspentOutputs);
    const change_configPtr = Ptr._assertClass(change_config, ChangeConfig);
    const collateral_percentagePtr = Ptr._assertClass(collateral_percentage, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_inputs_from_and_change_with_collateral_return_jsi(this.ptr, inputsPtr, strategy, change_configPtr, collateral_percentagePtr);
    return ret;
  }

  get_native_input_scripts(): Optional<NativeScripts> {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_native_input_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  get_plutus_input_scripts(): Optional<PlutusWitnesses> {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_plutus_input_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusWitnesses);
  }

  fee_for_input(address: Address, input: TransactionInput, amount: Value): BigNum {
    const addressPtr = Ptr._assertClass(address, Address);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_fee_for_input_jsi(this.ptr, addressPtr, inputPtr, amountPtr);
    return Ptr._wrap(ret, BigNum);
  }

  add_output(output: TransactionOutput): void {
    const outputPtr = Ptr._assertClass(output, TransactionOutput);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_output_jsi(this.ptr, outputPtr);
    return ret;
  }

  fee_for_output(output: TransactionOutput): BigNum {
    const outputPtr = Ptr._assertClass(output, TransactionOutput);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_fee_for_output_jsi(this.ptr, outputPtr);
    return Ptr._wrap(ret, BigNum);
  }

  set_fee(fee: BigNum): void {
    const feePtr = Ptr._assertClass(fee, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_fee_jsi(this.ptr, feePtr);
    return ret;
  }

  set_min_fee(fee: BigNum): void {
    const feePtr = Ptr._assertClass(fee, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_min_fee_jsi(this.ptr, feePtr);
    return ret;
  }

  set_ttl(ttl: number): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_ttl_jsi(this.ptr, ttl);
    return ret;
  }

  set_ttl_bignum(ttl: BigNum): void {
    const ttlPtr = Ptr._assertClass(ttl, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_ttl_bignum_jsi(this.ptr, ttlPtr);
    return ret;
  }

  remove_ttl(): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_remove_ttl_jsi(this.ptr);
    return ret;
  }

  set_validity_start_interval(validity_start_interval: number): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_validity_start_interval_jsi(this.ptr, validity_start_interval);
    return ret;
  }

  set_validity_start_interval_bignum(validity_start_interval: BigNum): void {
    const validity_start_intervalPtr = Ptr._assertClass(validity_start_interval, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_validity_start_interval_bignum_jsi(this.ptr, validity_start_intervalPtr);
    return ret;
  }

  remove_validity_start_interval(): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_remove_validity_start_interval_jsi(this.ptr);
    return ret;
  }

  set_certs(certs: Certificates): void {
    const certsPtr = Ptr._assertClass(certs, Certificates);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_certs_jsi(this.ptr, certsPtr);
    return ret;
  }

  remove_certs(): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_remove_certs_jsi(this.ptr);
    return ret;
  }

  set_certs_builder(certs: CertificatesBuilder): void {
    const certsPtr = Ptr._assertClass(certs, CertificatesBuilder);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_certs_builder_jsi(this.ptr, certsPtr);
    return ret;
  }

  set_withdrawals(withdrawals: Withdrawals): void {
    const withdrawalsPtr = Ptr._assertClass(withdrawals, Withdrawals);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_withdrawals_jsi(this.ptr, withdrawalsPtr);
    return ret;
  }

  set_withdrawals_builder(withdrawals: WithdrawalsBuilder): void {
    const withdrawalsPtr = Ptr._assertClass(withdrawals, WithdrawalsBuilder);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_withdrawals_builder_jsi(this.ptr, withdrawalsPtr);
    return ret;
  }

  set_voting_builder(voting_builder: VotingBuilder): void {
    const voting_builderPtr = Ptr._assertClass(voting_builder, VotingBuilder);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_voting_builder_jsi(this.ptr, voting_builderPtr);
    return ret;
  }

  set_voting_proposal_builder(voting_proposal_builder: VotingProposalBuilder): void {
    const voting_proposal_builderPtr = Ptr._assertClass(voting_proposal_builder, VotingProposalBuilder);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_voting_proposal_builder_jsi(this.ptr, voting_proposal_builderPtr);
    return ret;
  }

  remove_withdrawals(): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_remove_withdrawals_jsi(this.ptr);
    return ret;
  }

  get_auxiliary_data(): Optional<AuxiliaryData> {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_auxiliary_data_jsi(this.ptr);
    return Ptr._wrap(ret, AuxiliaryData);
  }

  set_auxiliary_data(auxiliary_data: AuxiliaryData): void {
    const auxiliary_dataPtr = Ptr._assertClass(auxiliary_data, AuxiliaryData);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_auxiliary_data_jsi(this.ptr, auxiliary_dataPtr);
    return ret;
  }

  remove_auxiliary_data(): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_remove_auxiliary_data_jsi(this.ptr);
    return ret;
  }

  set_metadata(metadata: GeneralTransactionMetadata): void {
    const metadataPtr = Ptr._assertClass(metadata, GeneralTransactionMetadata);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_metadata_jsi(this.ptr, metadataPtr);
    return ret;
  }

  add_metadatum(key: BigNum, val: TransactionMetadatum): void {
    const keyPtr = Ptr._assertClass(key, BigNum);
    const valPtr = Ptr._assertClass(val, TransactionMetadatum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_metadatum_jsi(this.ptr, keyPtr, valPtr);
    return ret;
  }

  add_json_metadatum(key: BigNum, val: string): void {
    const keyPtr = Ptr._assertClass(key, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_json_metadatum_jsi(this.ptr, keyPtr, val);
    return ret;
  }

  add_json_metadatum_with_schema(key: BigNum, val: string, schema: MetadataJsonSchema): void {
    const keyPtr = Ptr._assertClass(key, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_json_metadatum_with_schema_jsi(this.ptr, keyPtr, val, schema);
    return ret;
  }

  set_mint_builder(mint_builder: MintBuilder): void {
    const mint_builderPtr = Ptr._assertClass(mint_builder, MintBuilder);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_mint_builder_jsi(this.ptr, mint_builderPtr);
    return ret;
  }

  remove_mint_builder(): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_remove_mint_builder_jsi(this.ptr);
    return ret;
  }

  get_mint_builder(): Optional<MintBuilder> {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_mint_builder_jsi(this.ptr);
    return Ptr._wrap(ret, MintBuilder);
  }

  set_mint(mint: Mint, mint_scripts: NativeScripts): void {
    const mintPtr = Ptr._assertClass(mint, Mint);
    const mint_scriptsPtr = Ptr._assertClass(mint_scripts, NativeScripts);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_mint_jsi(this.ptr, mintPtr, mint_scriptsPtr);
    return ret;
  }

  get_mint(): Optional<Mint> {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_mint_jsi(this.ptr);
    return Ptr._wrap(ret, Mint);
  }

  get_mint_scripts(): Optional<NativeScripts> {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_mint_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  set_mint_asset(policy_script: NativeScript, mint_assets: MintAssets): void {
    const policy_scriptPtr = Ptr._assertClass(policy_script, NativeScript);
    const mint_assetsPtr = Ptr._assertClass(mint_assets, MintAssets);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_mint_asset_jsi(this.ptr, policy_scriptPtr, mint_assetsPtr);
    return ret;
  }

  add_mint_asset(policy_script: NativeScript, asset_name: AssetName, amount: Int): void {
    const policy_scriptPtr = Ptr._assertClass(policy_script, NativeScript);
    const asset_namePtr = Ptr._assertClass(asset_name, AssetName);
    const amountPtr = Ptr._assertClass(amount, Int);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_mint_asset_jsi(this.ptr, policy_scriptPtr, asset_namePtr, amountPtr);
    return ret;
  }

  add_mint_asset_and_output(policy_script: NativeScript, asset_name: AssetName, amount: Int, output_builder: TransactionOutputAmountBuilder, output_coin: BigNum): void {
    const policy_scriptPtr = Ptr._assertClass(policy_script, NativeScript);
    const asset_namePtr = Ptr._assertClass(asset_name, AssetName);
    const amountPtr = Ptr._assertClass(amount, Int);
    const output_builderPtr = Ptr._assertClass(output_builder, TransactionOutputAmountBuilder);
    const output_coinPtr = Ptr._assertClass(output_coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_mint_asset_and_output_jsi(this.ptr, policy_scriptPtr, asset_namePtr, amountPtr, output_builderPtr, output_coinPtr);
    return ret;
  }

  add_mint_asset_and_output_min_required_coin(policy_script: NativeScript, asset_name: AssetName, amount: Int, output_builder: TransactionOutputAmountBuilder): void {
    const policy_scriptPtr = Ptr._assertClass(policy_script, NativeScript);
    const asset_namePtr = Ptr._assertClass(asset_name, AssetName);
    const amountPtr = Ptr._assertClass(amount, Int);
    const output_builderPtr = Ptr._assertClass(output_builder, TransactionOutputAmountBuilder);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_mint_asset_and_output_min_required_coin_jsi(this.ptr, policy_scriptPtr, asset_namePtr, amountPtr, output_builderPtr);
    return ret;
  }

  add_extra_witness_datum(datum: PlutusData): void {
    const datumPtr = Ptr._assertClass(datum, PlutusData);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_extra_witness_datum_jsi(this.ptr, datumPtr);
    return ret;
  }

  get_extra_witness_datums(): Optional<PlutusList> {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_extra_witness_datums_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusList);
  }

  set_donation(donation: BigNum): void {
    const donationPtr = Ptr._assertClass(donation, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_donation_jsi(this.ptr, donationPtr);
    return ret;
  }

  get_donation(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_donation_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_current_treasury_value(current_treasury_value: BigNum): void {
    const current_treasury_valuePtr = Ptr._assertClass(current_treasury_value, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_current_treasury_value_jsi(this.ptr, current_treasury_valuePtr);
    return ret;
  }

  get_current_treasury_value(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_current_treasury_value_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(cfg: TransactionBuilderConfig): TransactionBuilder {
    const cfgPtr = Ptr._assertClass(cfg, TransactionBuilderConfig);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_new_jsi(cfgPtr);
    return Ptr._wrap(ret, TransactionBuilder);
  }

  get_reference_inputs(): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_reference_inputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  get_explicit_input(): Value {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_explicit_input_jsi(this.ptr);
    return Ptr._wrap(ret, Value);
  }

  get_implicit_input(): Value {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_implicit_input_jsi(this.ptr);
    return Ptr._wrap(ret, Value);
  }

  get_total_input(): Value {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_total_input_jsi(this.ptr);
    return Ptr._wrap(ret, Value);
  }

  get_total_output(): Value {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_total_output_jsi(this.ptr);
    return Ptr._wrap(ret, Value);
  }

  get_explicit_output(): Value {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_explicit_output_jsi(this.ptr);
    return Ptr._wrap(ret, Value);
  }

  get_deposit(): BigNum {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_deposit_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  get_fee_if_set(): Optional<BigNum> {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_get_fee_if_set_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  add_change_if_needed(address: Address): boolean {
    const addressPtr = Ptr._assertClass(address, Address);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_change_if_needed_jsi(this.ptr, addressPtr);
    return ret;
  }

  add_change_if_needed_with_datum(address: Address, plutus_data: OutputDatum): boolean {
    const addressPtr = Ptr._assertClass(address, Address);
    const plutus_dataPtr = Ptr._assertClass(plutus_data, OutputDatum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_change_if_needed_with_datum_jsi(this.ptr, addressPtr, plutus_dataPtr);
    return ret;
  }

  calc_script_data_hash(cost_models: Costmdls): void {
    const cost_modelsPtr = Ptr._assertClass(cost_models, Costmdls);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_calc_script_data_hash_jsi(this.ptr, cost_modelsPtr);
    return ret;
  }

  set_script_data_hash(hash: ScriptDataHash): void {
    const hashPtr = Ptr._assertClass(hash, ScriptDataHash);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_set_script_data_hash_jsi(this.ptr, hashPtr);
    return ret;
  }

  remove_script_data_hash(): void {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_remove_script_data_hash_jsi(this.ptr);
    return ret;
  }

  add_required_signer(key: Ed25519KeyHash): void {
    const keyPtr = Ptr._assertClass(key, Ed25519KeyHash);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_add_required_signer_jsi(this.ptr, keyPtr);
    return ret;
  }

  full_size(): number {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_full_size_jsi(this.ptr);
    return ret;
  }

  output_sizes(): Uint32Array {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_output_sizes_jsi(this.ptr);
    return base64ToUint32Array(ret);
  }

  build(): TransactionBody {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_build_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionBody);
  }

  build_tx(): Transaction {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_build_tx_jsi(this.ptr);
    return Ptr._wrap(ret, Transaction);
  }

  build_tx_unsafe(): Transaction {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_build_tx_unsafe_jsi(this.ptr);
    return Ptr._wrap(ret, Transaction);
  }

  min_fee(): BigNum {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_min_fee_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

}

export class TransactionBuilderConfig extends Ptr {
}

export class TransactionBuilderConfigBuilder extends Ptr {
  static new(): TransactionBuilderConfigBuilder {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_new_jsi();
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  fee_algo(fee_algo: LinearFee): TransactionBuilderConfigBuilder {
    const fee_algoPtr = Ptr._assertClass(fee_algo, LinearFee);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_fee_algo_jsi(this.ptr, fee_algoPtr);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  coins_per_utxo_byte(coins_per_utxo_byte: BigNum): TransactionBuilderConfigBuilder {
    const coins_per_utxo_bytePtr = Ptr._assertClass(coins_per_utxo_byte, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_coins_per_utxo_byte_jsi(this.ptr, coins_per_utxo_bytePtr);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  ex_unit_prices(ex_unit_prices: ExUnitPrices): TransactionBuilderConfigBuilder {
    const ex_unit_pricesPtr = Ptr._assertClass(ex_unit_prices, ExUnitPrices);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_ex_unit_prices_jsi(this.ptr, ex_unit_pricesPtr);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  pool_deposit(pool_deposit: BigNum): TransactionBuilderConfigBuilder {
    const pool_depositPtr = Ptr._assertClass(pool_deposit, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_pool_deposit_jsi(this.ptr, pool_depositPtr);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  key_deposit(key_deposit: BigNum): TransactionBuilderConfigBuilder {
    const key_depositPtr = Ptr._assertClass(key_deposit, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_key_deposit_jsi(this.ptr, key_depositPtr);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  max_value_size(max_value_size: number): TransactionBuilderConfigBuilder {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_max_value_size_jsi(this.ptr, max_value_size);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  max_tx_size(max_tx_size: number): TransactionBuilderConfigBuilder {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_max_tx_size_jsi(this.ptr, max_tx_size);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  ref_script_coins_per_byte(ref_script_coins_per_byte: UnitInterval): TransactionBuilderConfigBuilder {
    const ref_script_coins_per_bytePtr = Ptr._assertClass(ref_script_coins_per_byte, UnitInterval);
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_ref_script_coins_per_byte_jsi(this.ptr, ref_script_coins_per_bytePtr);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  prefer_pure_change(prefer_pure_change: boolean): TransactionBuilderConfigBuilder {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_prefer_pure_change_jsi(this.ptr, prefer_pure_change);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  deduplicate_explicit_ref_inputs_with_regular_inputs(deduplicate_explicit_ref_inputs_with_regular_inputs: boolean): TransactionBuilderConfigBuilder {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_deduplicate_explicit_ref_inputs_with_regular_inputs_jsi(this.ptr, deduplicate_explicit_ref_inputs_with_regular_inputs);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  do_not_burn_extra_change(do_not_burn_extra_change: boolean): TransactionBuilderConfigBuilder {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_do_not_burn_extra_change_jsi(this.ptr, do_not_burn_extra_change);
    return Ptr._wrap(ret, TransactionBuilderConfigBuilder);
  }

  build(): TransactionBuilderConfig {
    const ret = CslMobileBridge.csl_bridge_transaction_builder_config_builder_build_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionBuilderConfig);
  }

}

export class TransactionHash extends Ptr {
  static from_bytes(bytes: Uint8Array): TransactionHash {
    const ret = CslMobileBridge.csl_bridge_transaction_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_transaction_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): TransactionHash {
    const ret = CslMobileBridge.csl_bridge_transaction_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, TransactionHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): TransactionHash {
    const ret = CslMobileBridge.csl_bridge_transaction_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, TransactionHash);
  }

}

export class TransactionInput extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_input_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionInput {
    const ret = CslMobileBridge.csl_bridge_transaction_input_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionInput);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_input_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionInput {
    const ret = CslMobileBridge.csl_bridge_transaction_input_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionInput);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_input_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TransactionInput {
    const ret = CslMobileBridge.csl_bridge_transaction_input_from_json_jsi(json);
    return Ptr._wrap(ret, TransactionInput);
  }

  transaction_id(): TransactionHash {
    const ret = CslMobileBridge.csl_bridge_transaction_input_transaction_id_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionHash);
  }

  index(): number {
    const ret = CslMobileBridge.csl_bridge_transaction_input_index_jsi(this.ptr);
    return ret;
  }

  static new(transaction_id: TransactionHash, index: number): TransactionInput {
    const transaction_idPtr = Ptr._assertClass(transaction_id, TransactionHash);
    const ret = CslMobileBridge.csl_bridge_transaction_input_new_jsi(transaction_idPtr, index);
    return Ptr._wrap(ret, TransactionInput);
  }

}

export class TransactionInputs extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionInputs);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionInputs);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_from_json_jsi(json);
    return Ptr._wrap(ret, TransactionInputs);
  }

  static new(): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_new_jsi();
    return Ptr._wrap(ret, TransactionInputs);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): TransactionInput {
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, TransactionInput);
  }

  add(input: TransactionInput): boolean {
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_add_jsi(this.ptr, inputPtr);
    return ret;
  }

  to_option(): Optional<TransactionInputs> {
    const ret = CslMobileBridge.csl_bridge_transaction_inputs_to_option_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

}

export class TransactionMetadatum extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionMetadatum {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionMetadatum {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  static new_map(map: MetadataMap): TransactionMetadatum {
    const mapPtr = Ptr._assertClass(map, MetadataMap);
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_new_map_jsi(mapPtr);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  static new_list(list: MetadataList): TransactionMetadatum {
    const listPtr = Ptr._assertClass(list, MetadataList);
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_new_list_jsi(listPtr);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  static new_int(int_value: Int): TransactionMetadatum {
    const int_valuePtr = Ptr._assertClass(int_value, Int);
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_new_int_jsi(int_valuePtr);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  static new_bytes(bytes: Uint8Array): TransactionMetadatum {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_new_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  static new_text(text: string): TransactionMetadatum {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_new_text_jsi(text);
    return Ptr._wrap(ret, TransactionMetadatum);
  }

  kind(): TransactionMetadatumKind {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_kind_jsi(this.ptr);
    return ret;
  }

  as_map(): MetadataMap {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_as_map_jsi(this.ptr);
    return Ptr._wrap(ret, MetadataMap);
  }

  as_list(): MetadataList {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_as_list_jsi(this.ptr);
    return Ptr._wrap(ret, MetadataList);
  }

  as_int(): Int {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_as_int_jsi(this.ptr);
    return Ptr._wrap(ret, Int);
  }

  as_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_as_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  as_text(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_as_text_jsi(this.ptr);
    return ret;
  }

}

export class TransactionMetadatumLabels extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_labels_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionMetadatumLabels {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_labels_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionMetadatumLabels);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_labels_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionMetadatumLabels {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_labels_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionMetadatumLabels);
  }

  static new(): TransactionMetadatumLabels {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_labels_new_jsi();
    return Ptr._wrap(ret, TransactionMetadatumLabels);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_labels_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): BigNum {
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_labels_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, BigNum);
  }

  add(elem: BigNum): void {
    const elemPtr = Ptr._assertClass(elem, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_metadatum_labels_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class TransactionOutput extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_output_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionOutput {
    const ret = CslMobileBridge.csl_bridge_transaction_output_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionOutput);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_output_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionOutput {
    const ret = CslMobileBridge.csl_bridge_transaction_output_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionOutput);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_output_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TransactionOutput {
    const ret = CslMobileBridge.csl_bridge_transaction_output_from_json_jsi(json);
    return Ptr._wrap(ret, TransactionOutput);
  }

  address(): Address {
    const ret = CslMobileBridge.csl_bridge_transaction_output_address_jsi(this.ptr);
    return Ptr._wrap(ret, Address);
  }

  amount(): Value {
    const ret = CslMobileBridge.csl_bridge_transaction_output_amount_jsi(this.ptr);
    return Ptr._wrap(ret, Value);
  }

  data_hash(): Optional<DataHash> {
    const ret = CslMobileBridge.csl_bridge_transaction_output_data_hash_jsi(this.ptr);
    return Ptr._wrap(ret, DataHash);
  }

  plutus_data(): Optional<PlutusData> {
    const ret = CslMobileBridge.csl_bridge_transaction_output_plutus_data_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusData);
  }

  script_ref(): Optional<ScriptRef> {
    const ret = CslMobileBridge.csl_bridge_transaction_output_script_ref_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptRef);
  }

  set_script_ref(script_ref: ScriptRef): void {
    const script_refPtr = Ptr._assertClass(script_ref, ScriptRef);
    const ret = CslMobileBridge.csl_bridge_transaction_output_set_script_ref_jsi(this.ptr, script_refPtr);
    return ret;
  }

  set_plutus_data(data: PlutusData): void {
    const dataPtr = Ptr._assertClass(data, PlutusData);
    const ret = CslMobileBridge.csl_bridge_transaction_output_set_plutus_data_jsi(this.ptr, dataPtr);
    return ret;
  }

  set_data_hash(data_hash: DataHash): void {
    const data_hashPtr = Ptr._assertClass(data_hash, DataHash);
    const ret = CslMobileBridge.csl_bridge_transaction_output_set_data_hash_jsi(this.ptr, data_hashPtr);
    return ret;
  }

  has_plutus_data(): boolean {
    const ret = CslMobileBridge.csl_bridge_transaction_output_has_plutus_data_jsi(this.ptr);
    return ret;
  }

  has_data_hash(): boolean {
    const ret = CslMobileBridge.csl_bridge_transaction_output_has_data_hash_jsi(this.ptr);
    return ret;
  }

  has_script_ref(): boolean {
    const ret = CslMobileBridge.csl_bridge_transaction_output_has_script_ref_jsi(this.ptr);
    return ret;
  }

  static new(address: Address, amount: Value): TransactionOutput {
    const addressPtr = Ptr._assertClass(address, Address);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_transaction_output_new_jsi(addressPtr, amountPtr);
    return Ptr._wrap(ret, TransactionOutput);
  }

  serialization_format(): Optional<CborContainerType> {
    const ret = CslMobileBridge.csl_bridge_transaction_output_serialization_format_jsi(this.ptr);
    return ret;
  }

}

export class TransactionOutputAmountBuilder extends Ptr {
  with_value(amount: Value): TransactionOutputAmountBuilder {
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_transaction_output_amount_builder_with_value_jsi(this.ptr, amountPtr);
    return Ptr._wrap(ret, TransactionOutputAmountBuilder);
  }

  with_coin(coin: BigNum): TransactionOutputAmountBuilder {
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_transaction_output_amount_builder_with_coin_jsi(this.ptr, coinPtr);
    return Ptr._wrap(ret, TransactionOutputAmountBuilder);
  }

  with_coin_and_asset(coin: BigNum, multiasset: MultiAsset): TransactionOutputAmountBuilder {
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const multiassetPtr = Ptr._assertClass(multiasset, MultiAsset);
    const ret = CslMobileBridge.csl_bridge_transaction_output_amount_builder_with_coin_and_asset_jsi(this.ptr, coinPtr, multiassetPtr);
    return Ptr._wrap(ret, TransactionOutputAmountBuilder);
  }

  with_asset_and_min_required_coin_by_utxo_cost(multiasset: MultiAsset, data_cost: DataCost): TransactionOutputAmountBuilder {
    const multiassetPtr = Ptr._assertClass(multiasset, MultiAsset);
    const data_costPtr = Ptr._assertClass(data_cost, DataCost);
    const ret = CslMobileBridge.csl_bridge_transaction_output_amount_builder_with_asset_and_min_required_coin_by_utxo_cost_jsi(this.ptr, multiassetPtr, data_costPtr);
    return Ptr._wrap(ret, TransactionOutputAmountBuilder);
  }

  build(): TransactionOutput {
    const ret = CslMobileBridge.csl_bridge_transaction_output_amount_builder_build_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionOutput);
  }

}

export class TransactionOutputBuilder extends Ptr {
  static new(): TransactionOutputBuilder {
    const ret = CslMobileBridge.csl_bridge_transaction_output_builder_new_jsi();
    return Ptr._wrap(ret, TransactionOutputBuilder);
  }

  with_address(address: Address): TransactionOutputBuilder {
    const addressPtr = Ptr._assertClass(address, Address);
    const ret = CslMobileBridge.csl_bridge_transaction_output_builder_with_address_jsi(this.ptr, addressPtr);
    return Ptr._wrap(ret, TransactionOutputBuilder);
  }

  with_data_hash(data_hash: DataHash): TransactionOutputBuilder {
    const data_hashPtr = Ptr._assertClass(data_hash, DataHash);
    const ret = CslMobileBridge.csl_bridge_transaction_output_builder_with_data_hash_jsi(this.ptr, data_hashPtr);
    return Ptr._wrap(ret, TransactionOutputBuilder);
  }

  with_plutus_data(data: PlutusData): TransactionOutputBuilder {
    const dataPtr = Ptr._assertClass(data, PlutusData);
    const ret = CslMobileBridge.csl_bridge_transaction_output_builder_with_plutus_data_jsi(this.ptr, dataPtr);
    return Ptr._wrap(ret, TransactionOutputBuilder);
  }

  with_script_ref(script_ref: ScriptRef): TransactionOutputBuilder {
    const script_refPtr = Ptr._assertClass(script_ref, ScriptRef);
    const ret = CslMobileBridge.csl_bridge_transaction_output_builder_with_script_ref_jsi(this.ptr, script_refPtr);
    return Ptr._wrap(ret, TransactionOutputBuilder);
  }

  next(): TransactionOutputAmountBuilder {
    const ret = CslMobileBridge.csl_bridge_transaction_output_builder_next_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionOutputAmountBuilder);
  }

}

export class TransactionOutputs extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_outputs_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionOutputs {
    const ret = CslMobileBridge.csl_bridge_transaction_outputs_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionOutputs);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_outputs_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionOutputs {
    const ret = CslMobileBridge.csl_bridge_transaction_outputs_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionOutputs);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_outputs_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TransactionOutputs {
    const ret = CslMobileBridge.csl_bridge_transaction_outputs_from_json_jsi(json);
    return Ptr._wrap(ret, TransactionOutputs);
  }

  static new(): TransactionOutputs {
    const ret = CslMobileBridge.csl_bridge_transaction_outputs_new_jsi();
    return Ptr._wrap(ret, TransactionOutputs);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_transaction_outputs_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): TransactionOutput {
    const ret = CslMobileBridge.csl_bridge_transaction_outputs_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, TransactionOutput);
  }

  add(elem: TransactionOutput): void {
    const elemPtr = Ptr._assertClass(elem, TransactionOutput);
    const ret = CslMobileBridge.csl_bridge_transaction_outputs_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class TransactionUnspentOutput extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_output_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionUnspentOutput {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_output_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionUnspentOutput);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_output_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionUnspentOutput {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_output_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionUnspentOutput);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_output_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TransactionUnspentOutput {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_output_from_json_jsi(json);
    return Ptr._wrap(ret, TransactionUnspentOutput);
  }

  static new(input: TransactionInput, output: TransactionOutput): TransactionUnspentOutput {
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const outputPtr = Ptr._assertClass(output, TransactionOutput);
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_output_new_jsi(inputPtr, outputPtr);
    return Ptr._wrap(ret, TransactionUnspentOutput);
  }

  input(): TransactionInput {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_output_input_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInput);
  }

  output(): TransactionOutput {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_output_output_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionOutput);
  }

}

export class TransactionUnspentOutputs extends Ptr {
  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_outputs_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TransactionUnspentOutputs {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_outputs_from_json_jsi(json);
    return Ptr._wrap(ret, TransactionUnspentOutputs);
  }

  static new(): TransactionUnspentOutputs {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_outputs_new_jsi();
    return Ptr._wrap(ret, TransactionUnspentOutputs);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_outputs_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): TransactionUnspentOutput {
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_outputs_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, TransactionUnspentOutput);
  }

  add(elem: TransactionUnspentOutput): void {
    const elemPtr = Ptr._assertClass(elem, TransactionUnspentOutput);
    const ret = CslMobileBridge.csl_bridge_transaction_unspent_outputs_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class TransactionWitnessSet extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionWitnessSet {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionWitnessSet);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionWitnessSet {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionWitnessSet);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TransactionWitnessSet {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_from_json_jsi(json);
    return Ptr._wrap(ret, TransactionWitnessSet);
  }

  set_vkeys(vkeys: Vkeywitnesses): void {
    const vkeysPtr = Ptr._assertClass(vkeys, Vkeywitnesses);
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_set_vkeys_jsi(this.ptr, vkeysPtr);
    return ret;
  }

  vkeys(): Optional<Vkeywitnesses> {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_vkeys_jsi(this.ptr);
    return Ptr._wrap(ret, Vkeywitnesses);
  }

  set_native_scripts(native_scripts: NativeScripts): void {
    const native_scriptsPtr = Ptr._assertClass(native_scripts, NativeScripts);
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_set_native_scripts_jsi(this.ptr, native_scriptsPtr);
    return ret;
  }

  native_scripts(): Optional<NativeScripts> {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_native_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  set_bootstraps(bootstraps: BootstrapWitnesses): void {
    const bootstrapsPtr = Ptr._assertClass(bootstraps, BootstrapWitnesses);
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_set_bootstraps_jsi(this.ptr, bootstrapsPtr);
    return ret;
  }

  bootstraps(): Optional<BootstrapWitnesses> {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_bootstraps_jsi(this.ptr);
    return Ptr._wrap(ret, BootstrapWitnesses);
  }

  set_plutus_scripts(plutus_scripts: PlutusScripts): void {
    const plutus_scriptsPtr = Ptr._assertClass(plutus_scripts, PlutusScripts);
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_set_plutus_scripts_jsi(this.ptr, plutus_scriptsPtr);
    return ret;
  }

  plutus_scripts(): Optional<PlutusScripts> {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_plutus_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusScripts);
  }

  set_plutus_data(plutus_data: PlutusList): void {
    const plutus_dataPtr = Ptr._assertClass(plutus_data, PlutusList);
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_set_plutus_data_jsi(this.ptr, plutus_dataPtr);
    return ret;
  }

  plutus_data(): Optional<PlutusList> {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_plutus_data_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusList);
  }

  set_redeemers(redeemers: Redeemers): void {
    const redeemersPtr = Ptr._assertClass(redeemers, Redeemers);
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_set_redeemers_jsi(this.ptr, redeemersPtr);
    return ret;
  }

  redeemers(): Optional<Redeemers> {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_redeemers_jsi(this.ptr);
    return Ptr._wrap(ret, Redeemers);
  }

  static new(): TransactionWitnessSet {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_set_new_jsi();
    return Ptr._wrap(ret, TransactionWitnessSet);
  }

}

export class TransactionWitnessSets extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_sets_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TransactionWitnessSets {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_sets_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TransactionWitnessSets);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_sets_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TransactionWitnessSets {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_sets_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TransactionWitnessSets);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_sets_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TransactionWitnessSets {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_sets_from_json_jsi(json);
    return Ptr._wrap(ret, TransactionWitnessSets);
  }

  static new(): TransactionWitnessSets {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_sets_new_jsi();
    return Ptr._wrap(ret, TransactionWitnessSets);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_sets_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): TransactionWitnessSet {
    const ret = CslMobileBridge.csl_bridge_transaction_witness_sets_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, TransactionWitnessSet);
  }

  add(elem: TransactionWitnessSet): void {
    const elemPtr = Ptr._assertClass(elem, TransactionWitnessSet);
    const ret = CslMobileBridge.csl_bridge_transaction_witness_sets_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class TreasuryWithdrawals extends Ptr {
  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TreasuryWithdrawals {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_from_json_jsi(json);
    return Ptr._wrap(ret, TreasuryWithdrawals);
  }

  static new(): TreasuryWithdrawals {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_new_jsi();
    return Ptr._wrap(ret, TreasuryWithdrawals);
  }

  get(key: RewardAddress): Optional<BigNum> {
    const keyPtr = Ptr._assertClass(key, RewardAddress);
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_get_jsi(this.ptr, keyPtr);
    return Ptr._wrap(ret, BigNum);
  }

  insert(key: RewardAddress, value: BigNum): void {
    const keyPtr = Ptr._assertClass(key, RewardAddress);
    const valuePtr = Ptr._assertClass(value, BigNum);
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_insert_jsi(this.ptr, keyPtr, valuePtr);
    return ret;
  }

  keys(): RewardAddresses {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_keys_jsi(this.ptr);
    return Ptr._wrap(ret, RewardAddresses);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_len_jsi(this.ptr);
    return ret;
  }

}

export class TreasuryWithdrawalsAction extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_action_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): TreasuryWithdrawalsAction {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_action_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, TreasuryWithdrawalsAction);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_action_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): TreasuryWithdrawalsAction {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_action_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, TreasuryWithdrawalsAction);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_action_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): TreasuryWithdrawalsAction {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_action_from_json_jsi(json);
    return Ptr._wrap(ret, TreasuryWithdrawalsAction);
  }

  withdrawals(): TreasuryWithdrawals {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_action_withdrawals_jsi(this.ptr);
    return Ptr._wrap(ret, TreasuryWithdrawals);
  }

  policy_hash(): Optional<ScriptHash> {
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_action_policy_hash_jsi(this.ptr);
    return Ptr._wrap(ret, ScriptHash);
  }

  static new(withdrawals: TreasuryWithdrawals): TreasuryWithdrawalsAction {
    const withdrawalsPtr = Ptr._assertClass(withdrawals, TreasuryWithdrawals);
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_action_new_jsi(withdrawalsPtr);
    return Ptr._wrap(ret, TreasuryWithdrawalsAction);
  }

  static new_with_policy_hash(withdrawals: TreasuryWithdrawals, policy_hash: ScriptHash): TreasuryWithdrawalsAction {
    const withdrawalsPtr = Ptr._assertClass(withdrawals, TreasuryWithdrawals);
    const policy_hashPtr = Ptr._assertClass(policy_hash, ScriptHash);
    const ret = CslMobileBridge.csl_bridge_treasury_withdrawals_action_new_with_policy_hash_jsi(withdrawalsPtr, policy_hashPtr);
    return Ptr._wrap(ret, TreasuryWithdrawalsAction);
  }

}

export class TxInputsBuilder extends Ptr {
  static new(): TxInputsBuilder {
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_new_jsi();
    return Ptr._wrap(ret, TxInputsBuilder);
  }

  add_regular_utxo(utxo: TransactionUnspentOutput): void {
    const utxoPtr = Ptr._assertClass(utxo, TransactionUnspentOutput);
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_add_regular_utxo_jsi(this.ptr, utxoPtr);
    return ret;
  }

  add_plutus_script_utxo(utxo: TransactionUnspentOutput, witness: PlutusWitness): void {
    const utxoPtr = Ptr._assertClass(utxo, TransactionUnspentOutput);
    const witnessPtr = Ptr._assertClass(witness, PlutusWitness);
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_add_plutus_script_utxo_jsi(this.ptr, utxoPtr, witnessPtr);
    return ret;
  }

  add_native_script_utxo(utxo: TransactionUnspentOutput, witness: NativeScriptSource): void {
    const utxoPtr = Ptr._assertClass(utxo, TransactionUnspentOutput);
    const witnessPtr = Ptr._assertClass(witness, NativeScriptSource);
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_add_native_script_utxo_jsi(this.ptr, utxoPtr, witnessPtr);
    return ret;
  }

  add_key_input(hash: Ed25519KeyHash, input: TransactionInput, amount: Value): void {
    const hashPtr = Ptr._assertClass(hash, Ed25519KeyHash);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_add_key_input_jsi(this.ptr, hashPtr, inputPtr, amountPtr);
    return ret;
  }

  add_native_script_input(script: NativeScriptSource, input: TransactionInput, amount: Value): void {
    const scriptPtr = Ptr._assertClass(script, NativeScriptSource);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_add_native_script_input_jsi(this.ptr, scriptPtr, inputPtr, amountPtr);
    return ret;
  }

  add_plutus_script_input(witness: PlutusWitness, input: TransactionInput, amount: Value): void {
    const witnessPtr = Ptr._assertClass(witness, PlutusWitness);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_add_plutus_script_input_jsi(this.ptr, witnessPtr, inputPtr, amountPtr);
    return ret;
  }

  add_bootstrap_input(address: ByronAddress, input: TransactionInput, amount: Value): void {
    const addressPtr = Ptr._assertClass(address, ByronAddress);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_add_bootstrap_input_jsi(this.ptr, addressPtr, inputPtr, amountPtr);
    return ret;
  }

  add_regular_input(address: Address, input: TransactionInput, amount: Value): void {
    const addressPtr = Ptr._assertClass(address, Address);
    const inputPtr = Ptr._assertClass(input, TransactionInput);
    const amountPtr = Ptr._assertClass(amount, Value);
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_add_regular_input_jsi(this.ptr, addressPtr, inputPtr, amountPtr);
    return ret;
  }

  get_ref_inputs(): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_get_ref_inputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  get_native_input_scripts(): Optional<NativeScripts> {
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_get_native_input_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  get_plutus_input_scripts(): Optional<PlutusWitnesses> {
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_get_plutus_input_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusWitnesses);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_len_jsi(this.ptr);
    return ret;
  }

  add_required_signer(key: Ed25519KeyHash): void {
    const keyPtr = Ptr._assertClass(key, Ed25519KeyHash);
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_add_required_signer_jsi(this.ptr, keyPtr);
    return ret;
  }

  add_required_signers(keys: Ed25519KeyHashes): void {
    const keysPtr = Ptr._assertClass(keys, Ed25519KeyHashes);
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_add_required_signers_jsi(this.ptr, keysPtr);
    return ret;
  }

  total_value(): Value {
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_total_value_jsi(this.ptr);
    return Ptr._wrap(ret, Value);
  }

  inputs(): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_inputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  inputs_option(): Optional<TransactionInputs> {
    const ret = CslMobileBridge.csl_bridge_tx_inputs_builder_inputs_option_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

}

export class URL extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_u_r_l_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): URL {
    const ret = CslMobileBridge.csl_bridge_u_r_l_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, URL);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_u_r_l_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): URL {
    const ret = CslMobileBridge.csl_bridge_u_r_l_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, URL);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_u_r_l_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): URL {
    const ret = CslMobileBridge.csl_bridge_u_r_l_from_json_jsi(json);
    return Ptr._wrap(ret, URL);
  }

  static new(url: string): URL {
    const ret = CslMobileBridge.csl_bridge_u_r_l_new_jsi(url);
    return Ptr._wrap(ret, URL);
  }

  url(): string {
    const ret = CslMobileBridge.csl_bridge_u_r_l_url_jsi(this.ptr);
    return ret;
  }

}

export class UnitInterval extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_unit_interval_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_unit_interval_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, UnitInterval);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_unit_interval_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_unit_interval_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, UnitInterval);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_unit_interval_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): UnitInterval {
    const ret = CslMobileBridge.csl_bridge_unit_interval_from_json_jsi(json);
    return Ptr._wrap(ret, UnitInterval);
  }

  numerator(): BigNum {
    const ret = CslMobileBridge.csl_bridge_unit_interval_numerator_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  denominator(): BigNum {
    const ret = CslMobileBridge.csl_bridge_unit_interval_denominator_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(numerator: BigNum, denominator: BigNum): UnitInterval {
    const numeratorPtr = Ptr._assertClass(numerator, BigNum);
    const denominatorPtr = Ptr._assertClass(denominator, BigNum);
    const ret = CslMobileBridge.csl_bridge_unit_interval_new_jsi(numeratorPtr, denominatorPtr);
    return Ptr._wrap(ret, UnitInterval);
  }

}

export class Update extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_update_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Update {
    const ret = CslMobileBridge.csl_bridge_update_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Update);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_update_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Update {
    const ret = CslMobileBridge.csl_bridge_update_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Update);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_update_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Update {
    const ret = CslMobileBridge.csl_bridge_update_from_json_jsi(json);
    return Ptr._wrap(ret, Update);
  }

  proposed_protocol_parameter_updates(): ProposedProtocolParameterUpdates {
    const ret = CslMobileBridge.csl_bridge_update_proposed_protocol_parameter_updates_jsi(this.ptr);
    return Ptr._wrap(ret, ProposedProtocolParameterUpdates);
  }

  epoch(): number {
    const ret = CslMobileBridge.csl_bridge_update_epoch_jsi(this.ptr);
    return ret;
  }

  static new(proposed_protocol_parameter_updates: ProposedProtocolParameterUpdates, epoch: number): Update {
    const proposed_protocol_parameter_updatesPtr = Ptr._assertClass(proposed_protocol_parameter_updates, ProposedProtocolParameterUpdates);
    const ret = CslMobileBridge.csl_bridge_update_new_jsi(proposed_protocol_parameter_updatesPtr, epoch);
    return Ptr._wrap(ret, Update);
  }

}

export class UpdateCommitteeAction extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_update_committee_action_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): UpdateCommitteeAction {
    const ret = CslMobileBridge.csl_bridge_update_committee_action_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, UpdateCommitteeAction);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_update_committee_action_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): UpdateCommitteeAction {
    const ret = CslMobileBridge.csl_bridge_update_committee_action_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, UpdateCommitteeAction);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_update_committee_action_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): UpdateCommitteeAction {
    const ret = CslMobileBridge.csl_bridge_update_committee_action_from_json_jsi(json);
    return Ptr._wrap(ret, UpdateCommitteeAction);
  }

  gov_action_id(): Optional<GovernanceActionId> {
    const ret = CslMobileBridge.csl_bridge_update_committee_action_gov_action_id_jsi(this.ptr);
    return Ptr._wrap(ret, GovernanceActionId);
  }

  committee(): Committee {
    const ret = CslMobileBridge.csl_bridge_update_committee_action_committee_jsi(this.ptr);
    return Ptr._wrap(ret, Committee);
  }

  members_to_remove(): Credentials {
    const ret = CslMobileBridge.csl_bridge_update_committee_action_members_to_remove_jsi(this.ptr);
    return Ptr._wrap(ret, Credentials);
  }

  static new(committee: Committee, members_to_remove: Credentials): UpdateCommitteeAction {
    const committeePtr = Ptr._assertClass(committee, Committee);
    const members_to_removePtr = Ptr._assertClass(members_to_remove, Credentials);
    const ret = CslMobileBridge.csl_bridge_update_committee_action_new_jsi(committeePtr, members_to_removePtr);
    return Ptr._wrap(ret, UpdateCommitteeAction);
  }

  static new_with_action_id(gov_action_id: GovernanceActionId, committee: Committee, members_to_remove: Credentials): UpdateCommitteeAction {
    const gov_action_idPtr = Ptr._assertClass(gov_action_id, GovernanceActionId);
    const committeePtr = Ptr._assertClass(committee, Committee);
    const members_to_removePtr = Ptr._assertClass(members_to_remove, Credentials);
    const ret = CslMobileBridge.csl_bridge_update_committee_action_new_with_action_id_jsi(gov_action_idPtr, committeePtr, members_to_removePtr);
    return Ptr._wrap(ret, UpdateCommitteeAction);
  }

}

export class VRFCert extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_v_r_f_cert_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): VRFCert {
    const ret = CslMobileBridge.csl_bridge_v_r_f_cert_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, VRFCert);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_v_r_f_cert_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): VRFCert {
    const ret = CslMobileBridge.csl_bridge_v_r_f_cert_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, VRFCert);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_v_r_f_cert_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): VRFCert {
    const ret = CslMobileBridge.csl_bridge_v_r_f_cert_from_json_jsi(json);
    return Ptr._wrap(ret, VRFCert);
  }

  output(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_v_r_f_cert_output_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  proof(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_v_r_f_cert_proof_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static new(output: Uint8Array, proof: Uint8Array): VRFCert {
    const ret = CslMobileBridge.csl_bridge_v_r_f_cert_new_jsi(b64FromUint8Array(output), b64FromUint8Array(proof));
    return Ptr._wrap(ret, VRFCert);
  }

}

export class VRFKeyHash extends Ptr {
  static from_bytes(bytes: Uint8Array): VRFKeyHash {
    const ret = CslMobileBridge.csl_bridge_v_r_f_key_hash_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, VRFKeyHash);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_v_r_f_key_hash_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_v_r_f_key_hash_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): VRFKeyHash {
    const ret = CslMobileBridge.csl_bridge_v_r_f_key_hash_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, VRFKeyHash);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_v_r_f_key_hash_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): VRFKeyHash {
    const ret = CslMobileBridge.csl_bridge_v_r_f_key_hash_from_hex_jsi(hex);
    return Ptr._wrap(ret, VRFKeyHash);
  }

}

export class VRFVKey extends Ptr {
  static from_bytes(bytes: Uint8Array): VRFVKey {
    const ret = CslMobileBridge.csl_bridge_v_r_f_v_key_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, VRFVKey);
  }

  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_v_r_f_v_key_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  to_bech32(prefix: string): string {
    const ret = CslMobileBridge.csl_bridge_v_r_f_v_key_to_bech32_jsi(this.ptr, prefix);
    return ret;
  }

  static from_bech32(bech_str: string): VRFVKey {
    const ret = CslMobileBridge.csl_bridge_v_r_f_v_key_from_bech32_jsi(bech_str);
    return Ptr._wrap(ret, VRFVKey);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_v_r_f_v_key_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex: string): VRFVKey {
    const ret = CslMobileBridge.csl_bridge_v_r_f_v_key_from_hex_jsi(hex);
    return Ptr._wrap(ret, VRFVKey);
  }

}

export class Value extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_value_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Value {
    const ret = CslMobileBridge.csl_bridge_value_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Value);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_value_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Value {
    const ret = CslMobileBridge.csl_bridge_value_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Value);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_value_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Value {
    const ret = CslMobileBridge.csl_bridge_value_from_json_jsi(json);
    return Ptr._wrap(ret, Value);
  }

  static new(coin: BigNum): Value {
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_value_new_jsi(coinPtr);
    return Ptr._wrap(ret, Value);
  }

  static new_from_assets(multiasset: MultiAsset): Value {
    const multiassetPtr = Ptr._assertClass(multiasset, MultiAsset);
    const ret = CslMobileBridge.csl_bridge_value_new_from_assets_jsi(multiassetPtr);
    return Ptr._wrap(ret, Value);
  }

  static new_with_assets(coin: BigNum, multiasset: MultiAsset): Value {
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const multiassetPtr = Ptr._assertClass(multiasset, MultiAsset);
    const ret = CslMobileBridge.csl_bridge_value_new_with_assets_jsi(coinPtr, multiassetPtr);
    return Ptr._wrap(ret, Value);
  }

  static zero(): Value {
    const ret = CslMobileBridge.csl_bridge_value_zero_jsi();
    return Ptr._wrap(ret, Value);
  }

  is_zero(): boolean {
    const ret = CslMobileBridge.csl_bridge_value_is_zero_jsi(this.ptr);
    return ret;
  }

  coin(): BigNum {
    const ret = CslMobileBridge.csl_bridge_value_coin_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  set_coin(coin: BigNum): void {
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_value_set_coin_jsi(this.ptr, coinPtr);
    return ret;
  }

  multiasset(): Optional<MultiAsset> {
    const ret = CslMobileBridge.csl_bridge_value_multiasset_jsi(this.ptr);
    return Ptr._wrap(ret, MultiAsset);
  }

  set_multiasset(multiasset: MultiAsset): void {
    const multiassetPtr = Ptr._assertClass(multiasset, MultiAsset);
    const ret = CslMobileBridge.csl_bridge_value_set_multiasset_jsi(this.ptr, multiassetPtr);
    return ret;
  }

  checked_add(rhs: Value): Value {
    const rhsPtr = Ptr._assertClass(rhs, Value);
    const ret = CslMobileBridge.csl_bridge_value_checked_add_jsi(this.ptr, rhsPtr);
    return Ptr._wrap(ret, Value);
  }

  checked_sub(rhs_value: Value): Value {
    const rhs_valuePtr = Ptr._assertClass(rhs_value, Value);
    const ret = CslMobileBridge.csl_bridge_value_checked_sub_jsi(this.ptr, rhs_valuePtr);
    return Ptr._wrap(ret, Value);
  }

  clamped_sub(rhs_value: Value): Value {
    const rhs_valuePtr = Ptr._assertClass(rhs_value, Value);
    const ret = CslMobileBridge.csl_bridge_value_clamped_sub_jsi(this.ptr, rhs_valuePtr);
    return Ptr._wrap(ret, Value);
  }

  compare(rhs_value: Value): Optional<number> {
    const rhs_valuePtr = Ptr._assertClass(rhs_value, Value);
    const ret = CslMobileBridge.csl_bridge_value_compare_jsi(this.ptr, rhs_valuePtr);
    return ret;
  }

}

export class VersionedBlock extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_versioned_block_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): VersionedBlock {
    const ret = CslMobileBridge.csl_bridge_versioned_block_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, VersionedBlock);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_versioned_block_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): VersionedBlock {
    const ret = CslMobileBridge.csl_bridge_versioned_block_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, VersionedBlock);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_versioned_block_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): VersionedBlock {
    const ret = CslMobileBridge.csl_bridge_versioned_block_from_json_jsi(json);
    return Ptr._wrap(ret, VersionedBlock);
  }

  static new(block: Block, era_code: number): VersionedBlock {
    const blockPtr = Ptr._assertClass(block, Block);
    const ret = CslMobileBridge.csl_bridge_versioned_block_new_jsi(blockPtr, era_code);
    return Ptr._wrap(ret, VersionedBlock);
  }

  block(): Block {
    const ret = CslMobileBridge.csl_bridge_versioned_block_block_jsi(this.ptr);
    return Ptr._wrap(ret, Block);
  }

  era(): BlockEra {
    const ret = CslMobileBridge.csl_bridge_versioned_block_era_jsi(this.ptr);
    return ret;
  }

}

export class Vkey extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_vkey_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Vkey {
    const ret = CslMobileBridge.csl_bridge_vkey_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Vkey);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_vkey_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Vkey {
    const ret = CslMobileBridge.csl_bridge_vkey_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Vkey);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_vkey_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Vkey {
    const ret = CslMobileBridge.csl_bridge_vkey_from_json_jsi(json);
    return Ptr._wrap(ret, Vkey);
  }

  static new(pk: PublicKey): Vkey {
    const pkPtr = Ptr._assertClass(pk, PublicKey);
    const ret = CslMobileBridge.csl_bridge_vkey_new_jsi(pkPtr);
    return Ptr._wrap(ret, Vkey);
  }

  public_key(): PublicKey {
    const ret = CslMobileBridge.csl_bridge_vkey_public_key_jsi(this.ptr);
    return Ptr._wrap(ret, PublicKey);
  }

}

export class Vkeys extends Ptr {
  static new(): Vkeys {
    const ret = CslMobileBridge.csl_bridge_vkeys_new_jsi();
    return Ptr._wrap(ret, Vkeys);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_vkeys_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): Vkey {
    const ret = CslMobileBridge.csl_bridge_vkeys_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, Vkey);
  }

  add(elem: Vkey): void {
    const elemPtr = Ptr._assertClass(elem, Vkey);
    const ret = CslMobileBridge.csl_bridge_vkeys_add_jsi(this.ptr, elemPtr);
    return ret;
  }

}

export class Vkeywitness extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_vkeywitness_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Vkeywitness {
    const ret = CslMobileBridge.csl_bridge_vkeywitness_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Vkeywitness);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_vkeywitness_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Vkeywitness {
    const ret = CslMobileBridge.csl_bridge_vkeywitness_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Vkeywitness);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_vkeywitness_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Vkeywitness {
    const ret = CslMobileBridge.csl_bridge_vkeywitness_from_json_jsi(json);
    return Ptr._wrap(ret, Vkeywitness);
  }

  static new(vkey: Vkey, signature: Ed25519Signature): Vkeywitness {
    const vkeyPtr = Ptr._assertClass(vkey, Vkey);
    const signaturePtr = Ptr._assertClass(signature, Ed25519Signature);
    const ret = CslMobileBridge.csl_bridge_vkeywitness_new_jsi(vkeyPtr, signaturePtr);
    return Ptr._wrap(ret, Vkeywitness);
  }

  vkey(): Vkey {
    const ret = CslMobileBridge.csl_bridge_vkeywitness_vkey_jsi(this.ptr);
    return Ptr._wrap(ret, Vkey);
  }

  signature(): Ed25519Signature {
    const ret = CslMobileBridge.csl_bridge_vkeywitness_signature_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519Signature);
  }

}

export class Vkeywitnesses extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_vkeywitnesses_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Vkeywitnesses {
    const ret = CslMobileBridge.csl_bridge_vkeywitnesses_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Vkeywitnesses);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_vkeywitnesses_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Vkeywitnesses {
    const ret = CslMobileBridge.csl_bridge_vkeywitnesses_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Vkeywitnesses);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_vkeywitnesses_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Vkeywitnesses {
    const ret = CslMobileBridge.csl_bridge_vkeywitnesses_from_json_jsi(json);
    return Ptr._wrap(ret, Vkeywitnesses);
  }

  static new(): Vkeywitnesses {
    const ret = CslMobileBridge.csl_bridge_vkeywitnesses_new_jsi();
    return Ptr._wrap(ret, Vkeywitnesses);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_vkeywitnesses_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): Vkeywitness {
    const ret = CslMobileBridge.csl_bridge_vkeywitnesses_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, Vkeywitness);
  }

  add(witness: Vkeywitness): boolean {
    const witnessPtr = Ptr._assertClass(witness, Vkeywitness);
    const ret = CslMobileBridge.csl_bridge_vkeywitnesses_add_jsi(this.ptr, witnessPtr);
    return ret;
  }

}

export class VoteDelegation extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_vote_delegation_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): VoteDelegation {
    const ret = CslMobileBridge.csl_bridge_vote_delegation_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, VoteDelegation);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_vote_delegation_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): VoteDelegation {
    const ret = CslMobileBridge.csl_bridge_vote_delegation_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, VoteDelegation);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_vote_delegation_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): VoteDelegation {
    const ret = CslMobileBridge.csl_bridge_vote_delegation_from_json_jsi(json);
    return Ptr._wrap(ret, VoteDelegation);
  }

  stake_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_vote_delegation_stake_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  drep(): DRep {
    const ret = CslMobileBridge.csl_bridge_vote_delegation_drep_jsi(this.ptr);
    return Ptr._wrap(ret, DRep);
  }

  static new(stake_credential: Credential, drep: DRep): VoteDelegation {
    const stake_credentialPtr = Ptr._assertClass(stake_credential, Credential);
    const drepPtr = Ptr._assertClass(drep, DRep);
    const ret = CslMobileBridge.csl_bridge_vote_delegation_new_jsi(stake_credentialPtr, drepPtr);
    return Ptr._wrap(ret, VoteDelegation);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_vote_delegation_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class VoteRegistrationAndDelegation extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): VoteRegistrationAndDelegation {
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, VoteRegistrationAndDelegation);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): VoteRegistrationAndDelegation {
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, VoteRegistrationAndDelegation);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): VoteRegistrationAndDelegation {
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_from_json_jsi(json);
    return Ptr._wrap(ret, VoteRegistrationAndDelegation);
  }

  stake_credential(): Credential {
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_stake_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  drep(): DRep {
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_drep_jsi(this.ptr);
    return Ptr._wrap(ret, DRep);
  }

  coin(): BigNum {
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_coin_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(stake_credential: Credential, drep: DRep, coin: BigNum): VoteRegistrationAndDelegation {
    const stake_credentialPtr = Ptr._assertClass(stake_credential, Credential);
    const drepPtr = Ptr._assertClass(drep, DRep);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_new_jsi(stake_credentialPtr, drepPtr, coinPtr);
    return Ptr._wrap(ret, VoteRegistrationAndDelegation);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_vote_registration_and_delegation_has_script_credentials_jsi(this.ptr);
    return ret;
  }

}

export class Voter extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_voter_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Voter {
    const ret = CslMobileBridge.csl_bridge_voter_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Voter);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_voter_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Voter {
    const ret = CslMobileBridge.csl_bridge_voter_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Voter);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_voter_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Voter {
    const ret = CslMobileBridge.csl_bridge_voter_from_json_jsi(json);
    return Ptr._wrap(ret, Voter);
  }

  static new_constitutional_committee_hot_credential(cred: Credential): Voter {
    const credPtr = Ptr._assertClass(cred, Credential);
    const ret = CslMobileBridge.csl_bridge_voter_new_constitutional_committee_hot_credential_jsi(credPtr);
    return Ptr._wrap(ret, Voter);
  }

  static new_drep_credential(cred: Credential): Voter {
    const credPtr = Ptr._assertClass(cred, Credential);
    const ret = CslMobileBridge.csl_bridge_voter_new_drep_credential_jsi(credPtr);
    return Ptr._wrap(ret, Voter);
  }

  static new_stake_pool_key_hash(key_hash: Ed25519KeyHash): Voter {
    const key_hashPtr = Ptr._assertClass(key_hash, Ed25519KeyHash);
    const ret = CslMobileBridge.csl_bridge_voter_new_stake_pool_key_hash_jsi(key_hashPtr);
    return Ptr._wrap(ret, Voter);
  }

  kind(): VoterKind {
    const ret = CslMobileBridge.csl_bridge_voter_kind_jsi(this.ptr);
    return ret;
  }

  to_constitutional_committee_hot_credential(): Optional<Credential> {
    const ret = CslMobileBridge.csl_bridge_voter_to_constitutional_committee_hot_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  to_drep_credential(): Optional<Credential> {
    const ret = CslMobileBridge.csl_bridge_voter_to_drep_credential_jsi(this.ptr);
    return Ptr._wrap(ret, Credential);
  }

  to_stake_pool_key_hash(): Optional<Ed25519KeyHash> {
    const ret = CslMobileBridge.csl_bridge_voter_to_stake_pool_key_hash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

  has_script_credentials(): boolean {
    const ret = CslMobileBridge.csl_bridge_voter_has_script_credentials_jsi(this.ptr);
    return ret;
  }

  to_key_hash(): Optional<Ed25519KeyHash> {
    const ret = CslMobileBridge.csl_bridge_voter_to_key_hash_jsi(this.ptr);
    return Ptr._wrap(ret, Ed25519KeyHash);
  }

}

export class Voters extends Ptr {
  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_voters_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Voters {
    const ret = CslMobileBridge.csl_bridge_voters_from_json_jsi(json);
    return Ptr._wrap(ret, Voters);
  }

  static new(): Voters {
    const ret = CslMobileBridge.csl_bridge_voters_new_jsi();
    return Ptr._wrap(ret, Voters);
  }

  add(voter: Voter): void {
    const voterPtr = Ptr._assertClass(voter, Voter);
    const ret = CslMobileBridge.csl_bridge_voters_add_jsi(this.ptr, voterPtr);
    return ret;
  }

  get(index: number): Optional<Voter> {
    const ret = CslMobileBridge.csl_bridge_voters_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, Voter);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_voters_len_jsi(this.ptr);
    return ret;
  }

}

export class VotingBuilder extends Ptr {
  static new(): VotingBuilder {
    const ret = CslMobileBridge.csl_bridge_voting_builder_new_jsi();
    return Ptr._wrap(ret, VotingBuilder);
  }

  add(voter: Voter, gov_action_id: GovernanceActionId, voting_procedure: VotingProcedure): void {
    const voterPtr = Ptr._assertClass(voter, Voter);
    const gov_action_idPtr = Ptr._assertClass(gov_action_id, GovernanceActionId);
    const voting_procedurePtr = Ptr._assertClass(voting_procedure, VotingProcedure);
    const ret = CslMobileBridge.csl_bridge_voting_builder_add_jsi(this.ptr, voterPtr, gov_action_idPtr, voting_procedurePtr);
    return ret;
  }

  add_with_plutus_witness(voter: Voter, gov_action_id: GovernanceActionId, voting_procedure: VotingProcedure, witness: PlutusWitness): void {
    const voterPtr = Ptr._assertClass(voter, Voter);
    const gov_action_idPtr = Ptr._assertClass(gov_action_id, GovernanceActionId);
    const voting_procedurePtr = Ptr._assertClass(voting_procedure, VotingProcedure);
    const witnessPtr = Ptr._assertClass(witness, PlutusWitness);
    const ret = CslMobileBridge.csl_bridge_voting_builder_add_with_plutus_witness_jsi(this.ptr, voterPtr, gov_action_idPtr, voting_procedurePtr, witnessPtr);
    return ret;
  }

  add_with_native_script(voter: Voter, gov_action_id: GovernanceActionId, voting_procedure: VotingProcedure, native_script_source: NativeScriptSource): void {
    const voterPtr = Ptr._assertClass(voter, Voter);
    const gov_action_idPtr = Ptr._assertClass(gov_action_id, GovernanceActionId);
    const voting_procedurePtr = Ptr._assertClass(voting_procedure, VotingProcedure);
    const native_script_sourcePtr = Ptr._assertClass(native_script_source, NativeScriptSource);
    const ret = CslMobileBridge.csl_bridge_voting_builder_add_with_native_script_jsi(this.ptr, voterPtr, gov_action_idPtr, voting_procedurePtr, native_script_sourcePtr);
    return ret;
  }

  get_plutus_witnesses(): PlutusWitnesses {
    const ret = CslMobileBridge.csl_bridge_voting_builder_get_plutus_witnesses_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusWitnesses);
  }

  get_ref_inputs(): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_voting_builder_get_ref_inputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  get_native_scripts(): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_voting_builder_get_native_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  has_plutus_scripts(): boolean {
    const ret = CslMobileBridge.csl_bridge_voting_builder_has_plutus_scripts_jsi(this.ptr);
    return ret;
  }

  build(): VotingProcedures {
    const ret = CslMobileBridge.csl_bridge_voting_builder_build_jsi(this.ptr);
    return Ptr._wrap(ret, VotingProcedures);
  }

}

export class VotingProcedure extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_voting_procedure_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): VotingProcedure {
    const ret = CslMobileBridge.csl_bridge_voting_procedure_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, VotingProcedure);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_voting_procedure_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): VotingProcedure {
    const ret = CslMobileBridge.csl_bridge_voting_procedure_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, VotingProcedure);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_voting_procedure_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): VotingProcedure {
    const ret = CslMobileBridge.csl_bridge_voting_procedure_from_json_jsi(json);
    return Ptr._wrap(ret, VotingProcedure);
  }

  static new(vote: VoteKind): VotingProcedure {
    const ret = CslMobileBridge.csl_bridge_voting_procedure_new_jsi(vote);
    return Ptr._wrap(ret, VotingProcedure);
  }

  static new_with_anchor(vote: VoteKind, anchor: Anchor): VotingProcedure {
    const anchorPtr = Ptr._assertClass(anchor, Anchor);
    const ret = CslMobileBridge.csl_bridge_voting_procedure_new_with_anchor_jsi(vote, anchorPtr);
    return Ptr._wrap(ret, VotingProcedure);
  }

  vote_kind(): VoteKind {
    const ret = CslMobileBridge.csl_bridge_voting_procedure_vote_kind_jsi(this.ptr);
    return ret;
  }

  anchor(): Optional<Anchor> {
    const ret = CslMobileBridge.csl_bridge_voting_procedure_anchor_jsi(this.ptr);
    return Ptr._wrap(ret, Anchor);
  }

}

export class VotingProcedures extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_voting_procedures_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): VotingProcedures {
    const ret = CslMobileBridge.csl_bridge_voting_procedures_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, VotingProcedures);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_voting_procedures_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): VotingProcedures {
    const ret = CslMobileBridge.csl_bridge_voting_procedures_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, VotingProcedures);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_voting_procedures_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): VotingProcedures {
    const ret = CslMobileBridge.csl_bridge_voting_procedures_from_json_jsi(json);
    return Ptr._wrap(ret, VotingProcedures);
  }

  static new(): VotingProcedures {
    const ret = CslMobileBridge.csl_bridge_voting_procedures_new_jsi();
    return Ptr._wrap(ret, VotingProcedures);
  }

  insert(voter: Voter, governance_action_id: GovernanceActionId, voting_procedure: VotingProcedure): void {
    const voterPtr = Ptr._assertClass(voter, Voter);
    const governance_action_idPtr = Ptr._assertClass(governance_action_id, GovernanceActionId);
    const voting_procedurePtr = Ptr._assertClass(voting_procedure, VotingProcedure);
    const ret = CslMobileBridge.csl_bridge_voting_procedures_insert_jsi(this.ptr, voterPtr, governance_action_idPtr, voting_procedurePtr);
    return ret;
  }

  get(voter: Voter, governance_action_id: GovernanceActionId): Optional<VotingProcedure> {
    const voterPtr = Ptr._assertClass(voter, Voter);
    const governance_action_idPtr = Ptr._assertClass(governance_action_id, GovernanceActionId);
    const ret = CslMobileBridge.csl_bridge_voting_procedures_get_jsi(this.ptr, voterPtr, governance_action_idPtr);
    return Ptr._wrap(ret, VotingProcedure);
  }

  get_voters(): Voters {
    const ret = CslMobileBridge.csl_bridge_voting_procedures_get_voters_jsi(this.ptr);
    return Ptr._wrap(ret, Voters);
  }

  get_governance_action_ids_by_voter(voter: Voter): GovernanceActionIds {
    const voterPtr = Ptr._assertClass(voter, Voter);
    const ret = CslMobileBridge.csl_bridge_voting_procedures_get_governance_action_ids_by_voter_jsi(this.ptr, voterPtr);
    return Ptr._wrap(ret, GovernanceActionIds);
  }

}

export class VotingProposal extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): VotingProposal {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, VotingProposal);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): VotingProposal {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, VotingProposal);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): VotingProposal {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_from_json_jsi(json);
    return Ptr._wrap(ret, VotingProposal);
  }

  governance_action(): GovernanceAction {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_governance_action_jsi(this.ptr);
    return Ptr._wrap(ret, GovernanceAction);
  }

  anchor(): Anchor {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_anchor_jsi(this.ptr);
    return Ptr._wrap(ret, Anchor);
  }

  reward_account(): RewardAddress {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_reward_account_jsi(this.ptr);
    return Ptr._wrap(ret, RewardAddress);
  }

  deposit(): BigNum {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_deposit_jsi(this.ptr);
    return Ptr._wrap(ret, BigNum);
  }

  static new(governance_action: GovernanceAction, anchor: Anchor, reward_account: RewardAddress, deposit: BigNum): VotingProposal {
    const governance_actionPtr = Ptr._assertClass(governance_action, GovernanceAction);
    const anchorPtr = Ptr._assertClass(anchor, Anchor);
    const reward_accountPtr = Ptr._assertClass(reward_account, RewardAddress);
    const depositPtr = Ptr._assertClass(deposit, BigNum);
    const ret = CslMobileBridge.csl_bridge_voting_proposal_new_jsi(governance_actionPtr, anchorPtr, reward_accountPtr, depositPtr);
    return Ptr._wrap(ret, VotingProposal);
  }

}

export class VotingProposalBuilder extends Ptr {
  static new(): VotingProposalBuilder {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_builder_new_jsi();
    return Ptr._wrap(ret, VotingProposalBuilder);
  }

  add(proposal: VotingProposal): void {
    const proposalPtr = Ptr._assertClass(proposal, VotingProposal);
    const ret = CslMobileBridge.csl_bridge_voting_proposal_builder_add_jsi(this.ptr, proposalPtr);
    return ret;
  }

  add_with_plutus_witness(proposal: VotingProposal, witness: PlutusWitness): void {
    const proposalPtr = Ptr._assertClass(proposal, VotingProposal);
    const witnessPtr = Ptr._assertClass(witness, PlutusWitness);
    const ret = CslMobileBridge.csl_bridge_voting_proposal_builder_add_with_plutus_witness_jsi(this.ptr, proposalPtr, witnessPtr);
    return ret;
  }

  get_plutus_witnesses(): PlutusWitnesses {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_builder_get_plutus_witnesses_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusWitnesses);
  }

  get_ref_inputs(): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_builder_get_ref_inputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  has_plutus_scripts(): boolean {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_builder_has_plutus_scripts_jsi(this.ptr);
    return ret;
  }

  build(): VotingProposals {
    const ret = CslMobileBridge.csl_bridge_voting_proposal_builder_build_jsi(this.ptr);
    return Ptr._wrap(ret, VotingProposals);
  }

}

export class VotingProposals extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_voting_proposals_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): VotingProposals {
    const ret = CslMobileBridge.csl_bridge_voting_proposals_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, VotingProposals);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_voting_proposals_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): VotingProposals {
    const ret = CslMobileBridge.csl_bridge_voting_proposals_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, VotingProposals);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_voting_proposals_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): VotingProposals {
    const ret = CslMobileBridge.csl_bridge_voting_proposals_from_json_jsi(json);
    return Ptr._wrap(ret, VotingProposals);
  }

  static new(): VotingProposals {
    const ret = CslMobileBridge.csl_bridge_voting_proposals_new_jsi();
    return Ptr._wrap(ret, VotingProposals);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_voting_proposals_len_jsi(this.ptr);
    return ret;
  }

  get(index: number): VotingProposal {
    const ret = CslMobileBridge.csl_bridge_voting_proposals_get_jsi(this.ptr, index);
    return Ptr._wrap(ret, VotingProposal);
  }

  add(proposal: VotingProposal): boolean {
    const proposalPtr = Ptr._assertClass(proposal, VotingProposal);
    const ret = CslMobileBridge.csl_bridge_voting_proposals_add_jsi(this.ptr, proposalPtr);
    return ret;
  }

  contains(elem: VotingProposal): boolean {
    const elemPtr = Ptr._assertClass(elem, VotingProposal);
    const ret = CslMobileBridge.csl_bridge_voting_proposals_contains_jsi(this.ptr, elemPtr);
    return ret;
  }

  to_option(): Optional<VotingProposals> {
    const ret = CslMobileBridge.csl_bridge_voting_proposals_to_option_jsi(this.ptr);
    return Ptr._wrap(ret, VotingProposals);
  }

}

export class Withdrawals extends Ptr {
  to_bytes(): Uint8Array {
    const ret = CslMobileBridge.csl_bridge_withdrawals_to_bytes_jsi(this.ptr);
    return uint8ArrayFromB64(ret);
  }

  static from_bytes(bytes: Uint8Array): Withdrawals {
    const ret = CslMobileBridge.csl_bridge_withdrawals_from_bytes_jsi(b64FromUint8Array(bytes));
    return Ptr._wrap(ret, Withdrawals);
  }

  to_hex(): string {
    const ret = CslMobileBridge.csl_bridge_withdrawals_to_hex_jsi(this.ptr);
    return ret;
  }

  static from_hex(hex_str: string): Withdrawals {
    const ret = CslMobileBridge.csl_bridge_withdrawals_from_hex_jsi(hex_str);
    return Ptr._wrap(ret, Withdrawals);
  }

  to_json(): string {
    const ret = CslMobileBridge.csl_bridge_withdrawals_to_json_jsi(this.ptr);
    return ret;
  }

  static from_json(json: string): Withdrawals {
    const ret = CslMobileBridge.csl_bridge_withdrawals_from_json_jsi(json);
    return Ptr._wrap(ret, Withdrawals);
  }

  static new(): Withdrawals {
    const ret = CslMobileBridge.csl_bridge_withdrawals_new_jsi();
    return Ptr._wrap(ret, Withdrawals);
  }

  len(): number {
    const ret = CslMobileBridge.csl_bridge_withdrawals_len_jsi(this.ptr);
    return ret;
  }

  insert(key: RewardAddress, value: BigNum): Optional<BigNum> {
    const keyPtr = Ptr._assertClass(key, RewardAddress);
    const valuePtr = Ptr._assertClass(value, BigNum);
    const ret = CslMobileBridge.csl_bridge_withdrawals_insert_jsi(this.ptr, keyPtr, valuePtr);
    return Ptr._wrap(ret, BigNum);
  }

  get(key: RewardAddress): Optional<BigNum> {
    const keyPtr = Ptr._assertClass(key, RewardAddress);
    const ret = CslMobileBridge.csl_bridge_withdrawals_get_jsi(this.ptr, keyPtr);
    return Ptr._wrap(ret, BigNum);
  }

  keys(): RewardAddresses {
    const ret = CslMobileBridge.csl_bridge_withdrawals_keys_jsi(this.ptr);
    return Ptr._wrap(ret, RewardAddresses);
  }

}

export class WithdrawalsBuilder extends Ptr {
  static new(): WithdrawalsBuilder {
    const ret = CslMobileBridge.csl_bridge_withdrawals_builder_new_jsi();
    return Ptr._wrap(ret, WithdrawalsBuilder);
  }

  add(address: RewardAddress, coin: BigNum): void {
    const addressPtr = Ptr._assertClass(address, RewardAddress);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const ret = CslMobileBridge.csl_bridge_withdrawals_builder_add_jsi(this.ptr, addressPtr, coinPtr);
    return ret;
  }

  add_with_plutus_witness(address: RewardAddress, coin: BigNum, witness: PlutusWitness): void {
    const addressPtr = Ptr._assertClass(address, RewardAddress);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const witnessPtr = Ptr._assertClass(witness, PlutusWitness);
    const ret = CslMobileBridge.csl_bridge_withdrawals_builder_add_with_plutus_witness_jsi(this.ptr, addressPtr, coinPtr, witnessPtr);
    return ret;
  }

  add_with_native_script(address: RewardAddress, coin: BigNum, native_script_source: NativeScriptSource): void {
    const addressPtr = Ptr._assertClass(address, RewardAddress);
    const coinPtr = Ptr._assertClass(coin, BigNum);
    const native_script_sourcePtr = Ptr._assertClass(native_script_source, NativeScriptSource);
    const ret = CslMobileBridge.csl_bridge_withdrawals_builder_add_with_native_script_jsi(this.ptr, addressPtr, coinPtr, native_script_sourcePtr);
    return ret;
  }

  get_plutus_witnesses(): PlutusWitnesses {
    const ret = CslMobileBridge.csl_bridge_withdrawals_builder_get_plutus_witnesses_jsi(this.ptr);
    return Ptr._wrap(ret, PlutusWitnesses);
  }

  get_ref_inputs(): TransactionInputs {
    const ret = CslMobileBridge.csl_bridge_withdrawals_builder_get_ref_inputs_jsi(this.ptr);
    return Ptr._wrap(ret, TransactionInputs);
  }

  get_native_scripts(): NativeScripts {
    const ret = CslMobileBridge.csl_bridge_withdrawals_builder_get_native_scripts_jsi(this.ptr);
    return Ptr._wrap(ret, NativeScripts);
  }

  get_total_withdrawals(): Value {
    const ret = CslMobileBridge.csl_bridge_withdrawals_builder_get_total_withdrawals_jsi(this.ptr);
    return Ptr._wrap(ret, Value);
  }

  has_plutus_scripts(): boolean {
    const ret = CslMobileBridge.csl_bridge_withdrawals_builder_has_plutus_scripts_jsi(this.ptr);
    return ret;
  }

  build(): Withdrawals {
    const ret = CslMobileBridge.csl_bridge_withdrawals_builder_build_jsi(this.ptr);
    return Ptr._wrap(ret, Withdrawals);
  }

}

export enum AddressKind {
  Base = 0,
  Pointer = 1,
  Enterprise = 2,
  Reward = 3,
  Byron = 4,
  Malformed = 5,
}

export enum BlockEra {
  Byron = 0,
  Shelley = 1,
  Allegra = 2,
  Mary = 3,
  Alonzo = 4,
  Babbage = 5,
  Conway = 6,
  Unknown = 7,
}

export enum ByronAddressType {
  ATPubKey = 0,
  ATScript = 1,
  ATRedeem = 2,
}

export enum CborContainerType {
  Array = 0,
  Map = 1,
}

export enum CborSetType {
  Tagged = 0,
  Untagged = 1,
}

export enum CertificateKind {
  StakeRegistration = 0,
  StakeDeregistration = 1,
  StakeDelegation = 2,
  PoolRegistration = 3,
  PoolRetirement = 4,
  GenesisKeyDelegation = 5,
  MoveInstantaneousRewardsCert = 6,
  CommitteeHotAuth = 7,
  CommitteeColdResign = 8,
  DRepDeregistration = 9,
  DRepRegistration = 10,
  DRepUpdate = 11,
  StakeAndVoteDelegation = 12,
  StakeRegistrationAndDelegation = 13,
  StakeVoteRegistrationAndDelegation = 14,
  VoteDelegation = 15,
  VoteRegistrationAndDelegation = 16,
}

export enum CoinSelectionStrategyCIP2 {
  LargestFirst = 0,
  RandomImprove = 1,
  LargestFirstMultiAsset = 2,
  RandomImproveMultiAsset = 3,
}

export enum CredKind {
  Key = 0,
  Script = 1,
}

export enum DRepKind {
  KeyHash = 0,
  ScriptHash = 1,
  AlwaysAbstain = 2,
  AlwaysNoConfidence = 3,
}

export enum GovernanceActionKind {
  ParameterChangeAction = 0,
  HardForkInitiationAction = 1,
  TreasuryWithdrawalsAction = 2,
  NoConfidenceAction = 3,
  UpdateCommitteeAction = 4,
  NewConstitutionAction = 5,
  InfoAction = 6,
}

export enum LanguageKind {
  PlutusV1 = 0,
  PlutusV2 = 1,
  PlutusV3 = 2,
}

export enum MIRKind {
  ToOtherPot = 0,
  ToStakeCredentials = 1,
}

export enum MIRPot {
  Reserves = 0,
  Treasury = 1,
}

export enum MetadataJsonSchema {
  NoConversions = 0,
  BasicConversions = 1,
  DetailedSchema = 2,
}

export enum NativeScriptKind {
  ScriptPubkey = 0,
  ScriptAll = 1,
  ScriptAny = 2,
  ScriptNOfK = 3,
  TimelockStart = 4,
  TimelockExpiry = 5,
}

export enum NetworkIdKind {
  Testnet = 0,
  Mainnet = 1,
}

export enum PlutusDataKind {
  ConstrPlutusData = 0,
  Map = 1,
  List = 2,
  Integer = 3,
  Bytes = 4,
}

export enum PlutusDatumSchema {
  BasicConversions = 0,
  DetailedSchema = 1,
}

export enum RedeemerTagKind {
  Spend = 0,
  Mint = 1,
  Cert = 2,
  Reward = 3,
  Vote = 4,
  VotingProposal = 5,
}

export enum RelayKind {
  SingleHostAddr = 0,
  SingleHostName = 1,
  MultiHostName = 2,
}

export enum ScriptHashNamespace {
  NativeScript = 0,
  PlutusScript = 1,
  PlutusScriptV2 = 2,
  PlutusScriptV3 = 3,
}

export enum ScriptSchema {
  Wallet = 0,
  Node = 1,
}

export enum TransactionMetadatumKind {
  MetadataMap = 0,
  MetadataList = 1,
  Int = 2,
  Bytes = 3,
  Text = 4,
}

export enum TransactionSetsState {
  AllSetsHaveTag = 0,
  AllSetsHaveNoTag = 1,
  MixedSets = 2,
}

export enum VoteKind {
  No = 0,
  Yes = 1,
  Abstain = 2,
}

export enum VoterKind {
  ConstitutionalCommitteeHotKeyHash = 0,
  ConstitutionalCommitteeHotScriptHash = 1,
  DRepKeyHash = 2,
  DRepScriptHash = 3,
  StakingPoolKeyHash = 4,
}

