const fixtures = {
  address:
    'addr_test1qpzv9cl75wq7v52z4s7z0f2f73vc0v5rd9gwd7s6t3kt7pg7n80wq3u',
  metadataJson: '{"674":{"msg":["yoroi-classic bridge fixture"]}}',
  privateKeyHex: '1'.repeat(64),
  transactionHashHex: '2'.repeat(64),
};

class AddressFixture {
  constructor(bech32) {
    this.bech32 = bech32;
  }

  static from_bech32(bech32) {
    if (!bech32.startsWith('addr_test1')) {
      throw new Error(`invalid bech32 address fixture: ${bech32}`);
    }

    return new AddressFixture(bech32);
  }

  to_bech32(prefix = 'addr_test') {
    return `${prefix}1${this.bech32.split('1')[1]}`;
  }

  network_id() {
    return 0;
  }
}

class BigNumFixture {
  constructor(value) {
    this.value = value;
  }

  static from_str(value) {
    if (!/^\d+$/.test(value)) {
      throw new Error(`invalid decimal fixture: ${value}`);
    }

    return new BigNumFixture(value);
  }

  static from_bytes(bytes) {
    return BigNumFixture.from_str(Buffer.from(bytes).toString('utf8'));
  }

  to_bytes() {
    return Uint8Array.from(Buffer.from(this.value, 'utf8'));
  }

  to_json() {
    return `"${this.value}"`;
  }

  to_str() {
    return this.value;
  }

  checked_add(other) {
    return new BigNumFixture(
      (global.BigInt(this.value) + global.BigInt(other.value)).toString()
    );
  }
}

class TransactionHashFixture {
  constructor(hex) {
    this.hex = hex;
  }

  static from_hex(hex) {
    if (!/^[0-9a-f]{64}$/.test(hex)) {
      throw new Error(`invalid transaction hash fixture: ${hex}`);
    }

    return new TransactionHashFixture(hex);
  }

  to_hex() {
    return this.hex;
  }
}

class PrivateKeyFixture {
  constructor(hex) {
    this.hex = hex;
  }

  static from_hex(hex) {
    if (!/^[0-9a-f]{64}$/.test(hex)) {
      throw new Error(`invalid private key fixture: ${hex}`);
    }

    return new PrivateKeyFixture(hex);
  }

  to_public() {
    return `vkey-${this.hex.slice(0, 8)}`;
  }
}

class VkeywitnessFixture {
  constructor(vkey, signature) {
    this.vkey = vkey;
    this.signature = signature;
  }

  to_json() {
    return JSON.stringify({
      'signature': this.signature,
      'vkey': this.vkey,
    });
  }
}

class TransactionMetadatumFixture {
  constructor(json, schema) {
    this.json = json;
    this.schema = schema;
  }

  to_json() {
    return this.json;
  }
}

const createBridgeFixture = () => {
  const bridge = {
    Address: AddressFixture,
    BigNum: BigNumFixture,
    PrivateKey: PrivateKeyFixture,
    TransactionHash: TransactionHashFixture,
    encode_json_str_to_metadatum: jest.fn(
      (json, schema) => new TransactionMetadatumFixture(json, schema)
    ),
    decode_metadatum_to_json_str: jest.fn((metadatum, schema) => {
      if (metadatum.schema !== schema) {
        throw new Error('metadata schema fixture mismatch');
      }

      return metadatum.to_json();
    }),
    make_vkey_witness: jest.fn((txBodyHash, privateKey) => {
      return new VkeywitnessFixture(
        privateKey.to_public(),
        `sig-${txBodyHash.to_hex().slice(0, 8)}-${privateKey.hex.slice(0, 8)}`
      );
    }),
    reward_address_from_address: jest.fn((address, network) => `${network}:${address}`),
    address_to_hex: jest.fn((address) => `hex:${address}`),
    address_info_from_address: jest.fn((address) => JSON.stringify({
      hex: `hex:${address}`,
      networkId: 0,
      bech32: address,
      isValid: true,
    })),
    stake_credential_hex_from_address: jest.fn((address) => `stake:${address}`),
    reward_address_details_from_address: jest.fn((address) => JSON.stringify({
      bech32: `bech32:${address}`,
      keyHashHex: 'ab'.repeat(28),
    })),
    resolve_cns_address_record: jest.fn((args) => JSON.stringify({
      paymentCredentialKind: 'key',
      paymentCredentialHashHex: 'ab'.repeat(28),
      stakingCredentialHashHex: null,
      addressBech32: `cns:${args}`,
    })),
    verify_ed25519_signature: jest.fn((args) => {
      const {messageHex, signatureHex} = JSON.parse(args);
      return `${messageHex === 'cafe' && signatureHex === 'bead'}`;
    }),
    public_key_hash_hex_from_raw_hex: jest.fn((args) => `hash:${JSON.parse(args).publicKeyHex}`),
    sign_transaction_hex: jest.fn((transactionHex, privateKeyHex) =>
      `${transactionHex}:${privateKeyHex}`
    ),
    sign_wallet_transaction_hex: jest.fn((args) => `wallet-signed:${args}`),
    wallet_root_key_hex_from_entropy: jest.fn((entropyHex) => `root:${entropyHex}`),
    derive_account_public_key_hex: jest.fn((args) => `account:${args}`),
    derive_public_key_from_account_path_hex: jest.fn((args) => `child-key:${args}`),
    sign_wallet_transaction_paths_hex: jest.fn((args) => `paths-signed:${args}`),
    sign_wallet_data: jest.fn((args) => JSON.stringify({signatureHex: args, publicKeyHex: 'aa'})),
    derive_wallet_public_key_hex: jest.fn((args) => `public:${args}`),
    transaction_id_hex: jest.fn((transactionHex) => `id:${transactionHex}`),
    transaction_review_info_json: jest.fn((transactionHex) => `review:${transactionHex}`),
    transaction_signing_requirements_json: jest.fn((transactionHex) => `signing-requirements:${transactionHex}`),
    empty_witness_transaction_hex: jest.fn((transactionHex) => `empty-witnesses:${transactionHex}`),
    escrow_datum_info_json: jest.fn((datumCborHex) => `datum-info:${datumCborHex}`),
    updated_escrow_datum_cbor_hex: jest.fn((datumCborHex) => `updated:${datumCborHex}`),
    derive_escrow_address: jest.fn((args) => `escrow-address:${args}`),
    transaction_unspent_output_hex: jest.fn((args) => `unspent:${args}`),
    value_from_hex_info_json: jest.fn((valueCborHex) => `value-info:${valueCborHex}`),
    value_from_amounts_hex: jest.fn((args) => `value-cbor:${args}`),
    native_script_key_hashes_json: jest.fn((scriptCborHex) => `hashes:${scriptCborHex}`),
    script_hash_hex_from_cbor: jest.fn((args) => `script-hash:${args}`),
    public_key_hex_from_private_key_hex: jest.fn((keyHex) => `public-key:${keyHex}`),
    sign_ed25519_message_hex: jest.fn((keyHex, messageHex) => `signature:${keyHex}:${messageHex}`),
    catalyst_private_key_hex_from_entropy: jest.fn((args) => `catalyst-key:${args}`),
    apply_ledger_witnesses_to_transaction_hex: jest.fn((args) => `ledger-witnesses:${args}`),
    ledger_signing_request_info_json: jest.fn((args) => `ledger-request:${args}`),
    build_simple_payment_transaction_hex: jest.fn((args) => `payment:${args}`),
    build_transaction_recipe_cml_hex: jest.fn((args) => `recipe:${args}|123`),
    build_escrow_redeem_transaction_hex: jest.fn((args) => `escrow:${args}|168581`),
    minimum_coin_for_assets: jest.fn(() => '1500000'),
    reward_address_hex_from_account_public_key: jest.fn(
      (accountPublicKeyHex, network, role, index) =>
        `${network}:${role}:${index}:${accountPublicKeyHex}`
    ),
    base_address_bech32_from_public_key_hashes: jest.fn((args) => `base:${args}`),
    reward_address_hex_from_public_key_hash: jest.fn((args) => `reward:${args}`),
    icarus_address_base58_from_account_public_key_hex: jest.fn((args) => `icarus:${args}`),
  };

  return bridge;
};

const loadBridge = ({ bridge = createBridgeFixture(), install } = {}) => {
  jest.resetModules();

  const nativeInstall = install || jest.fn(() => bridge);
  const getEnforcing = jest.fn(() => ({ install: nativeInstall }));

  jest.doMock(
    'react-native',
    () => ({
      TurboModuleRegistry: { getEnforcing },
    }),
    { virtual: true }
  );

  let moduleExports;

  jest.isolateModules(() => {
    moduleExports = require('../index');
  });

  return { bridge, getEnforcing, install: nativeInstall, moduleExports };
};

describe('CML mobile bridge source entrypoint', () => {
  it('installs the CML native bridge once without exporting generated CSL bindings', () => {
    const { bridge, getEnforcing, install, moduleExports } = loadBridge();

    expect(getEnforcing).toHaveBeenCalledTimes(1);
    expect(getEnforcing).toHaveBeenCalledWith('CmlMobileBridge');
    expect(install).toHaveBeenCalledTimes(1);

    expect(moduleExports.default).toBeUndefined();
    expect(moduleExports.Address).toBeUndefined();
    expect(moduleExports.BigNum).toBeUndefined();
    expect(moduleExports.PrivateKey).toBeUndefined();
    expect(moduleExports.TransactionHash).toBeUndefined();
    expect(moduleExports.stakeCredentialHexFromAddress('addr_test1fixture')).toBe(
      'stake:addr_test1fixture',
    );
    expect(bridge.stake_credential_hex_from_address).toHaveBeenCalledWith(
      'addr_test1fixture',
    );
  });

  it('exposes CML value, native-script, and Ed25519 helper contracts', () => {
    const {bridge, moduleExports} = loadBridge();
    const amounts = {coin: '42', assets: [{policyIdHex: 'aa'.repeat(28), assetNameHex: '01', quantity: '3'}]};

    expect(moduleExports.valueFromHexInfoJson('82182a')).toBe('value-info:82182a');
    expect(bridge.value_from_hex_info_json).toHaveBeenCalledWith('82182a');
    expect(moduleExports.valueFromAmountsHex(amounts)).toBe(`value-cbor:${JSON.stringify(amounts)}`);
    expect(moduleExports.nativeScriptKeyHashesJson('8200')).toBe('hashes:8200');
    expect(moduleExports.publicKeyHexFromPrivateKeyHex('ab'.repeat(32))).toBe(`public-key:${'ab'.repeat(32)}`);
    expect(moduleExports.signEd25519MessageHex('ab'.repeat(32), '010203')).toBe(
      `signature:${'ab'.repeat(32)}:010203`,
    );
    expect(moduleExports.catalystPrivateKeyHexFromEntropy('00'.repeat(16))).toBe(
      `catalyst-key:${JSON.stringify({entropyHex: '00'.repeat(16), passwordHex: ''})}`,
    );
  });

  it('passes the explicit script language to CML policy hash calculation', () => {
    const {bridge, moduleExports} = loadBridge();
    const expectedArgs = {scriptType: 'plutusV2', scriptCborHex: '40'};
    expect(moduleExports.scriptHashHexFromCbor('plutusV2', '40')).toBe(
      `script-hash:${JSON.stringify(expectedArgs)}`,
    );
    expect(bridge.script_hash_hex_from_cbor).toHaveBeenCalledWith(
      JSON.stringify(expectedArgs),
    );
  });

  it('serializes Ledger witness arguments losslessly through the CML bridge', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {
      transactionHex: '84a0a0f5f6',
      accountPublicKeyHex: 'ab'.repeat(64),
      purpose: '2147485500',
      coinType: '2147485463',
      accountIndex: '2147483655',
      witnesses: [{path: [2147485500, 2147485463, 2147483655, 0, 1], signatureHex: 'cd'.repeat(64)}],
      expectedTxIdHex: 'ef'.repeat(32),
      senderUtxos: [{
        txHashHex: '12'.repeat(32), outputIndex: 0, address: 'addr_test1fixture',
        addressHex: '01', path: [2147485500, 2147485463, 2147483655, 0, 1],
      }],
    };
    expect(moduleExports.applyLedgerWitnessesToTransactionHex(args)).toBe(
      `ledger-witnesses:${JSON.stringify(args)}`,
    );
    expect(bridge.apply_ledger_witnesses_to_transaction_hex).toHaveBeenCalledWith(
      JSON.stringify(args),
    );
  });

  it('forwards Ledger request source/change context without numeric address or token coercion', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {
      transactionHex: '84a0a0f5f6',
      networkId: 0,
      protocolMagic: 764824073,
      senderUtxos: [{
        txHashHex: '12'.repeat(32), outputIndex: 0, address: 'addr_test1fixture',
        path: [2147485500, 2147485463, 2147483655, 0, 1],
      }],
      changeAddresses: [{address: 'addr_test1change', path: [2147485500, 2147485463, 2147483655, 1, 0]}],
      stakingPath: [2147485500, 2147485463, 2147483655, 2, 0],
    };
    expect(moduleExports.ledgerSigningRequestInfoJson(args)).toBe(`ledger-request:${JSON.stringify(args)}`);
    expect(bridge.ledger_signing_request_info_json).toHaveBeenCalledWith(JSON.stringify(args));
  });

  it('forwards wallet signing derivation only through the CML native bridge', () => {
    const { bridge, moduleExports } = loadBridge();
    const args = {
      transactionHex: 'unsigned',
      masterKeyHex: 'fixture-master-key',
      purpose: '2147485500',
      coinType: '2147485463',
      accountIndex: '0',
      stakingRole: '2',
      stakingIndex: '0',
    };

    expect(moduleExports.signWalletTransactionHex(args)).toBe(
      `wallet-signed:${JSON.stringify(args)}`
    );
    expect(bridge.sign_wallet_transaction_hex).toHaveBeenCalledWith(
      JSON.stringify(args)
    );
  });

  it('generates wallet root keys through the CML native bridge', () => {
    const {bridge, moduleExports} = loadBridge();
    expect(moduleExports.walletRootKeyHexFromEntropy('11'.repeat(16))).toBe(
      `root:${'11'.repeat(16)}`,
    );
    expect(bridge.wallet_root_key_hex_from_entropy).toHaveBeenCalledWith(
      '11'.repeat(16),
    );
  });

  it('derives account public keys through the CML native bridge', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {
      masterKeyHex: 'fixture-master-key',
      purpose: '2147485500',
      coinType: '2147485463',
      accountIndex: '0',
    };
    expect(moduleExports.deriveAccountPublicKeyHex(args)).toBe(
      `account:${JSON.stringify(args)}`,
    );
    expect(bridge.derive_account_public_key_hex).toHaveBeenCalledWith(
      JSON.stringify(args),
    );
  });

  it('signs wallet transactions for multiple derivation paths through CML', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {
      transactionHex: 'unsigned-cbor',
      masterKeyHex: 'fixture-master-key',
      signerPaths: [[1, 2, 3, 4, 5], [1, 2, 3, 6, 7]],
    };
    expect(moduleExports.signWalletTransactionPathsHex(args)).toBe(
      `paths-signed:${JSON.stringify(args)}`,
    );
    expect(bridge.sign_wallet_transaction_paths_hex).toHaveBeenCalledWith(
      JSON.stringify(args),
    );
  });

  it('returns CIP-8 message signature and public key from CML', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {messageHex: 'abcd', masterKeyHex: 'fixture', signerPath: [1, 2, 3, 4, 5]};
    const result = moduleExports.signWalletData(args);
    expect(bridge.sign_wallet_data).toHaveBeenCalledWith(JSON.stringify(args));
    expect(result).toEqual({signatureHex: JSON.stringify(args), publicKeyHex: 'aa'});
  });

  it('derives CIP-8 public keys through CML', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {masterKeyHex: 'fixture', signerPath: [1, 2, 3, 4, 5]};
    expect(moduleExports.deriveWalletPublicKeyHex(args)).toBe(
      `public:${JSON.stringify(args)}`,
    );
    expect(bridge.derive_wallet_public_key_hex).toHaveBeenCalledWith(
      JSON.stringify(args),
    );
  });

  it('calculates transaction IDs through CML body hashing', () => {
    const {bridge, moduleExports} = loadBridge();
    expect(moduleExports.transactionIdHex('84cbor')).toBe('id:84cbor');
    expect(bridge.transaction_id_hex).toHaveBeenCalledWith('84cbor');
  });

  it('parses transaction review details through the CML native bridge', () => {
    const {bridge, moduleExports} = loadBridge();
    expect(moduleExports.transactionReviewInfoJson('84cbor')).toBe('review:84cbor');
    expect(bridge.transaction_review_info_json).toHaveBeenCalledWith('84cbor');
  });

  it('routes transaction signing requirements through the CML native bridge', () => {
    const {bridge, moduleExports} = loadBridge();
    expect(moduleExports.transactionSigningRequirementsJson('84cbor')).toBe('signing-requirements:84cbor');
    expect(bridge.transaction_signing_requirements_json).toHaveBeenCalledWith('84cbor');
  });

  it('clears transaction witnesses through the CML native bridge', () => {
    const {bridge, moduleExports} = loadBridge();
    expect(moduleExports.emptyWitnessTransactionHex('84cbor')).toBe('empty-witnesses:84cbor');
    expect(bridge.empty_witness_transaction_hex).toHaveBeenCalledWith('84cbor');
  });

  it('routes escrow datum parsing and updates through CML', () => {
    const {bridge, moduleExports} = loadBridge();
    expect(moduleExports.escrowDatumInfoJson('datum-cbor')).toBe('datum-info:datum-cbor');
    expect(moduleExports.updatedEscrowDatumCborHex('datum-cbor')).toBe('updated:datum-cbor');
    expect(bridge.escrow_datum_info_json).toHaveBeenCalledWith('datum-cbor');
    expect(bridge.updated_escrow_datum_cbor_hex).toHaveBeenCalledWith('datum-cbor');
  });

  it('routes escrow address derivation and UTxO serialization through CML', () => {
    const {bridge, moduleExports} = loadBridge();
    const addressArgs = {eligibleAddress: 'addr_test', scriptHashHex: 'ab'.repeat(28), networkId: 0};
    const utxoArgs = {txHashHex: 'cd'.repeat(32), index: '1', address: 'addr_test', lovelace: '9007199254740993', assets: []};
    expect(moduleExports.deriveEscrowAddress(addressArgs)).toBe(`escrow-address:${JSON.stringify(addressArgs)}`);
    expect(moduleExports.transactionUnspentOutputHex(utxoArgs)).toBe(`unspent:${JSON.stringify(utxoArgs)}`);
    expect(bridge.derive_escrow_address).toHaveBeenCalledWith(JSON.stringify(addressArgs));
    expect(bridge.transaction_unspent_output_hex).toHaveBeenCalledWith(JSON.stringify(utxoArgs));
  });

  it('routes CNS address record conversion through the CML helper', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {plutusAddressJson: '{"constructor":0,"fields":[]}', networkId: 1};
    expect(moduleExports.resolveCnsAddressRecord(args)).toEqual({
      paymentCredentialKind: 'key',
      paymentCredentialHashHex: 'ab'.repeat(28),
      stakingCredentialHashHex: null,
      addressBech32: `cns:${JSON.stringify(args)}`,
    });
    expect(bridge.resolve_cns_address_record).toHaveBeenCalledWith(JSON.stringify(args));
  });

  it('verifies CIP-8 signatures and hashes public keys through CML', () => {
    const {bridge, moduleExports} = loadBridge();
    const verificationArgs = {publicKeyHex: '11'.repeat(32), messageHex: 'cafe', signatureHex: 'bead'};
    expect(moduleExports.verifyEd25519Signature(verificationArgs)).toBe(true);
    expect(moduleExports.verifyEd25519Signature({...verificationArgs, signatureHex: '00'})).toBe(false);
    expect(moduleExports.publicKeyHashHexFromRawHex(verificationArgs.publicKeyHex)).toBe(`hash:${verificationArgs.publicKeyHex}`);
    expect(bridge.verify_ed25519_signature).toHaveBeenCalledWith(JSON.stringify(verificationArgs));
    expect(bridge.public_key_hash_hex_from_raw_hex).toHaveBeenCalledWith(JSON.stringify({publicKeyHex: verificationArgs.publicKeyHex}));
  });

  it('returns parsed address details from the CML native bridge', () => {
    const {bridge, moduleExports} = loadBridge();
    expect(moduleExports.addressInfoFromAddress(fixtures.address)).toEqual({
      hex: `hex:${fixtures.address}`,
      networkId: 0,
      bech32: fixtures.address,
      isValid: true,
    });
    expect(bridge.address_info_from_address).toHaveBeenCalledWith(fixtures.address);
  });

  it('keeps deterministic CML value serialization lossless', () => {
    const {bridge, moduleExports} = loadBridge();
    const value = {
      coin: '42000000',
      assets: [{policyIdHex: 'ab'.repeat(28), assetNameHex: '01', quantity: '9'}],
    };
    expect(moduleExports.valueFromAmountsHex(value)).toBe(
      `value-cbor:${JSON.stringify(value)}`,
    );
    expect(bridge.value_from_amounts_hex).toHaveBeenCalledWith(
      JSON.stringify(value),
    );
  });

  it('routes transaction signing through the CML bridge API', () => {
    const {bridge, moduleExports} = loadBridge();
    expect(moduleExports.signTransactionHex('cbor', 'private-key')).toBe(
      'cbor:private-key',
    );
    expect(bridge.sign_transaction_hex).toHaveBeenCalledWith(
      'cbor',
      'private-key',
    );
  });

  it('routes reward-address derivation to the native CML helper', () => {
    const { bridge, moduleExports } = loadBridge();

    expect(moduleExports.rewardAddressFromAddress(fixtures.address, 0)).toBe(
      `0:${fixtures.address}`
    );
    expect(bridge.reward_address_from_address).toHaveBeenCalledWith(
      fixtures.address,
      0
    );
  });

  it('routes address serialization to the native CML helper', () => {
    const { bridge, moduleExports } = loadBridge();

    expect(moduleExports.addressToHex(fixtures.address)).toBe(`hex:${fixtures.address}`);
    expect(bridge.address_to_hex).toHaveBeenCalledWith(fixtures.address);
  });

  it('routes stake credential extraction to the native CML helper', () => {
    const { bridge, moduleExports } = loadBridge();

    expect(moduleExports.stakeCredentialHexFromAddress(fixtures.address)).toBe(
      `stake:${fixtures.address}`
    );
    expect(bridge.stake_credential_hex_from_address).toHaveBeenCalledWith(
      fixtures.address
    );
  });

  it('routes reward-address details extraction to the native CML helper', () => {
    const { bridge, moduleExports } = loadBridge();

    expect(moduleExports.rewardAddressDetailsFromAddress(fixtures.address)).toEqual({
      bech32: `bech32:${fixtures.address}`,
      keyHashHex: 'ab'.repeat(28),
    });
    expect(bridge.reward_address_details_from_address).toHaveBeenCalledWith(
      fixtures.address
    );
  });

  it('routes transaction signing to the native CML helper', () => {
    const { bridge, moduleExports } = loadBridge();

    expect(moduleExports.signTransactionHex('cbor', 'private-key')).toBe(
      'cbor:private-key'
    );
    expect(bridge.sign_transaction_hex).toHaveBeenCalledWith('cbor', 'private-key');
  });

  it('routes simple-payment building to the native CML helper with exact decimal fields', () => {
    const { bridge, moduleExports } = loadBridge();
    const args = {
      inputs: [{
        transactionHashHex: '01'.repeat(32),
        index: '0',
        address: 'addr_test_input',
        lovelace: '10000000',
        assets: [{policyIdHex: 'ab'.repeat(28), assetNameHex: '00ff', quantity: '9007199254740993'}],
      }],
      outputs: [{address: 'addr_test_output', lovelace: '2000000', assets: []}],
      changeAddress: 'addr_test_change',
      ttl: '123456',
      feeCoefficient: '44',
      feeConstant: '155381',
      coinsPerUtxoByte: '4310',
      keyDeposit: '2000000',
      poolDeposit: '500000000',
      maxValueSize: '5000',
      certificates: [{kind: 'VoteDelegation', stakeCredentialKeyHashHex: 'aa'.repeat(28), drep: {KeyHash: 'bb'.repeat(28)}}],
      withdrawals: [{rewardAddress: 'stake_test1fixture', amount: '3500000'}],
      validityStart: '120000',
      referenceInputs: [{
        transactionHashHex: '02'.repeat(32),
        index: '1',
        address: 'addr_test_reference',
        lovelace: '1000000',
      }],
    };
    const packed = [
      '01'.repeat(32) + ',0,addr_test_input,10000000,' + 'ab'.repeat(28) + '%7E00ff%7E9007199254740993,-,-',
      'addr_test_output,2000000,-,-',
      'addr_test_change',
      '123456', '44', '155381', '4310', '2000000', '500000000', '5000', '-', '-',
      '%5B%7B%22kind%22%3A%22VoteDelegation%22%2C%22stakeCredentialKeyHashHex%22%3A%22aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa%22%2C%22drep%22%3A%7B%22KeyHash%22%3A%22bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb%22%7D%7D%5D',
      '%5B%7B%22rewardAddress%22%3A%22stake_test1fixture%22%2C%22amount%22%3A%223500000%22%7D%5D',
      '120000',
      '02'.repeat(32) + ',1,addr_test_reference,1000000,-',
    ].join('|');

    bridge.build_simple_payment_transaction_hex.mockReturnValue(`payment:${packed}|168581`);
    expect(moduleExports.buildSimplePaymentTransaction(args)).toEqual({
      cborHex: `payment:${packed}`,
      fee: '168581',
    });
    expect(bridge.build_simple_payment_transaction_hex).toHaveBeenCalledWith(packed);
  });

  it('percent-encodes address delimiters in the simple-payment wire format', () => {
    const {bridge, moduleExports} = loadBridge();
    const address = 'R,50000000,-,-;R';
    const encodedAddress = encodeURIComponent(address);
    bridge.build_simple_payment_transaction_hex.mockReturnValue('cbor|fee');
    moduleExports.buildSimplePaymentTransaction({
      inputs: [{
        transactionHashHex: '01'.repeat(32),
        index: '0',
        address,
        lovelace: '10000000',
      }],
      outputs: [{address, lovelace: '2000000', assets: []}],
      changeAddress: address,
      feeCoefficient: '44',
      feeConstant: '155381',
      coinsPerUtxoByte: '4310',
      keyDeposit: '2000000',
      poolDeposit: '500000000',
      maxValueSize: '5000',
      referenceInputs: [{
        transactionHashHex: '02'.repeat(32),
        index: '1',
        address,
        lovelace: '1000000',
      }],
    });

    const packed = bridge.build_simple_payment_transaction_hex.mock.calls[0][0];
    expect(packed.match(new RegExp(encodedAddress, 'g'))).toHaveLength(4);
    expect(packed).toContain(`${encodedAddress},2000000,-,-`);
  });

  it('encodes every output value before joining simple-payment delimiters', () => {
    const {bridge, moduleExports} = loadBridge();
    const attackerOutput = 'addr_test_attacker,50000000,-,-';
    const lovelace = `2000000,-,-;${attackerOutput}`;
    const quantity = `1;${attackerOutput}`;
    const datumHex = `d87980;${attackerOutput}`;
    const encodeField = value => encodeURIComponent(value).replace(/~/g, '%7E');
    bridge.build_simple_payment_transaction_hex.mockReturnValue('cbor|fee');

    moduleExports.buildSimplePaymentTransaction({
      inputs: [{transactionHashHex: '01'.repeat(32), index: '0', address: 'addr_test_input', lovelace: '10000000'}],
      outputs: [{
        address: 'addr_test_output',
        lovelace,
        assets: [{policyIdHex: 'ab'.repeat(28), assetNameHex: '00', quantity}],
        datum: {kind: 'inline', hex: datumHex},
      }],
      changeAddress: 'addr_test_change',
      feeCoefficient: '44', feeConstant: '155381', coinsPerUtxoByte: '4310',
      keyDeposit: '2000000', poolDeposit: '500000000', maxValueSize: '5000',
    });

    const packed = bridge.build_simple_payment_transaction_hex.mock.calls[0][0];
    const outputFields = packed.split('|')[1].split(';');
    expect(outputFields).toHaveLength(1);
    expect(outputFields[0].split(',')).toHaveLength(4);
    expect(outputFields[0]).toContain(encodeField(lovelace));
    expect(outputFields[0]).toContain(
      encodeField(`${'ab'.repeat(28)}~00~${encodeField(quantity)}`),
    );
    expect(outputFields[0]).toContain(encodeField(`inline~${datumHex}`));
  });

  it('encodes all scalar fields before joining the native bridge format', () => {
    const {bridge, moduleExports} = loadBridge();
    const encodeField = value => encodeURIComponent(value).replace(/~/g, '%7E');
    const scalarValues = [
      '01'.repeat(32) + '|input-hash',
      '0|input-index',
      'addr_test_input|input-address',
      '10000000|input-coin',
      'script|cbor',
      '2|witness-count',
      'addr_test_output|output-address',
      '2000000|output-coin',
      'd87980|datum',
      'addr_test_change|change-address',
      '123456|ttl',
      '44|fee-coefficient',
      '155381|fee-constant',
      '4310|coins-per-byte',
      '2000000|key-deposit',
      '500000000|pool-deposit',
      '5000|max-value-size',
      'ab'.repeat(28) + '|mint-policy',
      '82|mint-script',
      'cd'.repeat(32) + '|reference-hash',
      '0|reference-index',
      'addr_test_reference|reference-address',
      '3000000|reference-coin',
      '50000|manual-fee',
    ];
    const mintAssetName = '01|mint-asset-name';
    const mintQuantity = '1|mint-quantity';
    bridge.build_simple_payment_transaction_hex.mockReturnValue('cbor|fee');

    moduleExports.buildSimplePaymentTransaction({
      inputs: [{
        transactionHashHex: scalarValues[0], index: scalarValues[1], address: scalarValues[2],
        lovelace: scalarValues[3], nativeScriptCborHex: scalarValues[4],
        nativeScriptWitnessCount: scalarValues[5],
      }],
      outputs: [{
        address: scalarValues[6], lovelace: scalarValues[7],
        datum: {kind: 'inline', hex: scalarValues[8]},
      }],
      changeAddress: scalarValues[9], ttl: scalarValues[10],
      feeCoefficient: scalarValues[11], feeConstant: scalarValues[12],
      coinsPerUtxoByte: scalarValues[13], keyDeposit: scalarValues[14],
      poolDeposit: scalarValues[15], maxValueSize: scalarValues[16],
      nativeMints: [{
        policyIdHex: scalarValues[17], scriptCborHex: scalarValues[18],
        assets: [{assetNameHex: mintAssetName, quantity: mintQuantity}],
      }],
      referenceInputs: [{
        transactionHashHex: scalarValues[19], index: scalarValues[20],
        address: scalarValues[21], lovelace: scalarValues[22],
      }],
      manualFee: scalarValues[23],
    });

    const packed = bridge.build_simple_payment_transaction_hex.mock.calls[0][0];
    const fields = packed.split('|');
    expect(fields).toHaveLength(18);
    expect(fields[0].split(';')).toHaveLength(1);
    expect(fields[0].split(',')).toHaveLength(7);
    expect(fields[1].split(';')).toHaveLength(1);
    expect(fields[1].split(',')).toHaveLength(4);
    for (const value of scalarValues) expect(packed).toContain(encodeField(value));
    expect(fields[11]).toContain(
      encodeField(`${encodeField(mintAssetName)}~${encodeField(mintQuantity)}`),
    );
  });

  it('encodes asset components before joining their nested delimiters', () => {
    const {bridge, moduleExports} = loadBridge();
    const policyIdHex = 'ab'.repeat(28);
    const assetNameHex = '00~01^cd';
    const quantity = '1;addr_test_attacker,50000000,-,-';
    const encodeField = value => encodeURIComponent(value).replace(/~/g, '%7E');
    bridge.build_simple_payment_transaction_hex.mockReturnValue('cbor|fee');

    moduleExports.buildSimplePaymentTransaction({
      inputs: [{transactionHashHex: '01'.repeat(32), index: '0', address: 'addr_test_input', lovelace: '10000000'}],
      outputs: [{address: 'addr_test_output', lovelace: '2000000', assets: [{policyIdHex, assetNameHex, quantity}]}],
      changeAddress: 'addr_test_change', feeCoefficient: '44', feeConstant: '155381',
      coinsPerUtxoByte: '4310', keyDeposit: '2000000', poolDeposit: '500000000', maxValueSize: '5000',
    });

    const packed = bridge.build_simple_payment_transaction_hex.mock.calls[0][0];
    const nestedAsset = [
      encodeField(policyIdHex),
      encodeField(assetNameHex),
      encodeField(quantity),
    ].join('~');
    expect(packed).toContain(encodeField(nestedAsset));
    expect(packed.split('|')[1].split(';')).toHaveLength(1);
    expect(packed.split('|')[1].split(',')).toHaveLength(4);
  });

  it('serializes normalized transaction recipes losslessly through CML', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {
      protocolParams: {
        linearFee: {coefficient: '44', constant: '155381'},
        coinsPerUtxoByte: '4310',
        keyDeposit: '2000000',
        poolDeposit: '500000000',
        maxValueSize: '5000',
      },
      inputs: [{
        txHashHex: '11'.repeat(32), index: '0', address: 'addr_test',
        lovelace: '9007199254740993', assets: [], kind: 'paymentKey',
      }],
      outputs: [{address: 'addr_test', lovelace: '2', assets: []}],
      certificates: [], withdrawals: [], referenceInputs: [], scriptInputs: [],
      collateralInputs: [], mints: [], metadata: [],
      options: {changeAddress: 'addr_test', ttl: '0'},
    };
    expect(moduleExports.buildTransactionRecipeCml(args)).toEqual({
      cborHex: `recipe:${JSON.stringify(args)}`,
      fee: '123',
    });
    expect(bridge.build_transaction_recipe_cml_hex).toHaveBeenCalledWith(JSON.stringify(args));
  });

  it('routes the escrow Plutus recipe through the native CML helper', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {
      scriptInput: {txHashHex: '01'.repeat(32), index: '0', address: 'script', lovelace: '9000000', assets: [], inlineDatumCborHex: 'd87980'},
      additionalScriptInputs: [],
      referenceScriptInput: {txHashHex: '02'.repeat(32), index: '0', address: 'ref', lovelace: '2000000', assets: []},
      referenceInputs: [],
      referenceScriptCborHex: '4e010000',
      referenceScriptSize: '3',
      fundingInputs: [],
      collateralInput: {txHashHex: '03'.repeat(32), index: '0', address: 'collateral', lovelace: '5000000', assets: []},
      collateralReturn: {address: 'collateral', lovelace: '4000000', assets: []},
      outputs: [{address: 'destination', lovelace: '2000000', assets: []}],
      changeAddress: 'change', scriptHashHex: 'ab'.repeat(28), redeemerCborHex: 'd87980',
      redeemerMem: '100', redeemerSteps: '200', validityStart: '1', ttl: '100',
      feeCoefficient: '44', feeConstant: '155381', coinsPerUtxoByte: '4310',
      keyDeposit: '2000000', poolDeposit: '500000000', maxValueSize: '5000',
      refScriptCoinsPerByte: {numerator: '15', denominator: '1'},
      refScriptTierStepBytes: '25600', refScriptMultiplier: '1.2',
      plutusV3CostModel: [0],
    };

    expect(moduleExports.buildEscrowRedeemTransactionCml(args)).toEqual({
      cborHex: `escrow:${JSON.stringify(args)}`,
      fee: '168581',
    });
    expect(bridge.build_escrow_redeem_transaction_hex).toHaveBeenCalledWith(JSON.stringify(args));

    const explicitDatumArgs = {
      ...args,
      scriptInput: {txHashHex: '01'.repeat(32), index: '0', address: 'script', lovelace: '9000000', assets: [], datumCborHex: 'd87980'},
    };
    moduleExports.buildEscrowRedeemTransactionCml(explicitDatumArgs);
    expect(bridge.build_escrow_redeem_transaction_hex).toHaveBeenLastCalledWith(JSON.stringify(explicitDatumArgs));
  });

  it('packs a native script input and exact witness-count fee hint', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {
      inputs: [{
        transactionHashHex: '01'.repeat(32), index: '0', address: 'addr_test_script',
        lovelace: '10000000', nativeScriptCborHex: '8200581c' + 'ab'.repeat(28),
        nativeScriptWitnessCount: '1',
      }],
      outputs: [{address: 'addr_test_output', lovelace: '2000000'}],
      changeAddress: 'addr_test_change', ttl: '123456', feeCoefficient: '44',
      feeConstant: '155381', coinsPerUtxoByte: '4310', keyDeposit: '2000000',
      poolDeposit: '500000000', maxValueSize: '5000',
    };
    bridge.build_simple_payment_transaction_hex.mockReturnValue('cbor|fee');
    moduleExports.buildSimplePaymentTransaction(args);
    expect(bridge.build_simple_payment_transaction_hex).toHaveBeenCalledWith(
      expect.stringContaining('addr_test_script,10000000,-,8200581c' + 'ab'.repeat(28) + ',1'),
    );
  });

  it('packs native mint policy, script and signed exact asset quantities', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {
      inputs: [{transactionHashHex: '01'.repeat(32), index: '0', address: 'addr_test_input', lovelace: '10000000'}],
      outputs: [{address: 'addr_test_output', lovelace: '5000000'}],
      changeAddress: 'addr_test_change', ttl: '123456', feeCoefficient: '44',
      feeConstant: '155381', coinsPerUtxoByte: '4310', keyDeposit: '2000000',
      poolDeposit: '500000000', maxValueSize: '5000',
      nativeMints: [{
        policyIdHex: 'cd'.repeat(28), scriptCborHex: '8200581c' + 'ab'.repeat(28),
        assets: [{assetNameHex: '00ff', quantity: '-9007199254740993'}],
      }],
    };
    bridge.build_simple_payment_transaction_hex.mockReturnValue('cbor|fee');
    moduleExports.buildSimplePaymentTransaction(args);
    expect(bridge.build_simple_payment_transaction_hex).toHaveBeenCalledWith(
      expect.stringContaining('cd'.repeat(28) + ',native,8200581c' + 'ab'.repeat(28) + ',00ff%7E-9007199254740993'),
    );
  });

  it('rejects an empty native mint asset list before calling the bridge', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {
      inputs: [{transactionHashHex: '01'.repeat(32), index: '0', address: 'addr_test_input', lovelace: '10000000'}],
      outputs: [{address: 'addr_test_output', lovelace: '2000000'}],
      changeAddress: 'addr_test_change', ttl: '123456', feeCoefficient: '44',
      feeConstant: '155381', coinsPerUtxoByte: '4310', keyDeposit: '2000000',
      poolDeposit: '500000000', maxValueSize: '5000',
      nativeMints: [{policyIdHex: 'cd'.repeat(28), scriptCborHex: '40', assets: []}],
    };
    expect(() => moduleExports.buildSimplePaymentTransaction(args)).toThrow('Native mint assets must not be empty');
    expect(bridge.build_simple_payment_transaction_hex).not.toHaveBeenCalled();
  });

  it('routes minimum-coin-for-assets calculation through CML with exact quantities', () => {
    const { bridge, moduleExports } = loadBridge();
    const packed = `addr_test_change|${'ab'.repeat(28)}%7E00ff%7E9007199254740993|4310`;
    bridge.minimum_coin_for_assets.mockReturnValue('1500000');
    expect(moduleExports.minimumCoinForAssets(
      'addr_test_change',
      [{policyIdHex: 'ab'.repeat(28), assetNameHex: '00ff', quantity: '9007199254740993'}],
      '4310',
    )).toBe('1500000');
    expect(bridge.minimum_coin_for_assets).toHaveBeenCalledWith(packed);
  });

  it('percent-encodes metadata before crossing the delimited CML bridge', () => {
    const { bridge, moduleExports } = loadBridge();
    const args = {
      inputs: [{transactionHashHex: '01'.repeat(32), index: '0', address: 'addr_test_input', lovelace: '10000000'}],
      outputs: [{address: 'addr_test_output', lovelace: '2000000'}],
      changeAddress: 'addr_test_change',
      ttl: '123456', feeCoefficient: '44', feeConstant: '155381',
      coinsPerUtxoByte: '4310', keyDeposit: '2000000', poolDeposit: '500000000',
      maxValueSize: '5000', metadata: [{label: '674', data: {msg: ['value|separator']}}],
    };
    bridge.build_simple_payment_transaction_hex.mockReturnValue('cbor|fee');
    moduleExports.buildSimplePaymentTransaction(args);
    expect(bridge.build_simple_payment_transaction_hex).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(JSON.stringify(args.metadata))),
    );
  });

  it('rejects metadata integers already outside JavaScript safe precision', () => {
    const {moduleExports} = loadBridge();
    const args = {
      inputs: [{transactionHashHex: '01'.repeat(32), index: '0', address: 'addr_test_input', lovelace: '10000000'}],
      outputs: [{address: 'addr_test_output', lovelace: '2000000'}],
      changeAddress: 'addr_test_change',
      ttl: '123456', feeCoefficient: '44', feeConstant: '155381',
      coinsPerUtxoByte: '4310', keyDeposit: '2000000', poolDeposit: '500000000',
      maxValueSize: '5000', metadata: [{label: '674', data: {value: Number.MAX_SAFE_INTEGER + 1}}],
    };
    expect(() => moduleExports.buildSimplePaymentTransaction(args)).toThrow(
      'Metadata numbers must be finite and integers must be safe',
    );
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      args.metadata[0].data.value = value;
      expect(() => moduleExports.buildSimplePaymentTransaction(args)).toThrow('Metadata numbers must be finite');
    }
  });

  it('routes xpub reward-address derivation to the native CML helper', () => {
    const { bridge, moduleExports } = loadBridge();
    const accountPublicKeyHex = 'ab'.repeat(64);

    expect(
      moduleExports.rewardAddressHexFromAccountPublicKey(
        accountPublicKeyHex,
        0,
        2,
        0
      )
    ).toBe(`0:2:0:${accountPublicKeyHex}`);
    expect(bridge.reward_address_hex_from_account_public_key).toHaveBeenCalledWith(
      accountPublicKeyHex,
      0,
      2,
      0
    );
  });

  it('routes account public-key child derivation to the native CML helper', () => {
    const {bridge, moduleExports} = loadBridge();
    const accountPublicKeyHex = 'ab'.repeat(64);

    expect(
      moduleExports.derivePublicKeyFromAccountPathHex(accountPublicKeyHex, [3, 0]),
    ).toBe(`child-key:${JSON.stringify({accountPublicKeyHex, path: [3, 0]})}`);
    expect(bridge.derive_public_key_from_account_path_hex).toHaveBeenCalledWith(
      JSON.stringify({accountPublicKeyHex, path: [3, 0]}),
    );
  });

  it('routes account-manager address creation through the narrow CML helpers', () => {
    const {bridge, moduleExports} = loadBridge();
    const paymentKeyHashHex = 'aa'.repeat(28);
    const stakeKeyHashHex = 'bb'.repeat(28);
    const accountPublicKeyHex = 'cc'.repeat(64);

    expect(moduleExports.baseAddressBech32FromPublicKeyHashes(paymentKeyHashHex, stakeKeyHashHex, 0))
      .toBe(`base:${JSON.stringify({paymentKeyHashHex, stakeKeyHashHex, networkId: 0})}`);
    expect(moduleExports.rewardAddressHexFromPublicKeyHash(stakeKeyHashHex, 0))
      .toBe(`reward:${JSON.stringify({stakeKeyHashHex, networkId: 0})}`);
    expect(moduleExports.icarusAddressBase58FromAccountPublicKeyHex(accountPublicKeyHex, 0, 0, 764824073))
      .toBe(`icarus:${JSON.stringify({accountPublicKeyHex, role: 0, index: 0, protocolMagic: 764824073})}`);
    expect(bridge.base_address_bech32_from_public_key_hashes).toHaveBeenCalledTimes(1);
    expect(bridge.reward_address_hex_from_public_key_hash).toHaveBeenCalledTimes(1);
    expect(bridge.icarus_address_base58_from_account_public_key_hex).toHaveBeenCalledTimes(1);
  });

  it('propagates native install and bridge validation errors', () => {
    const install = jest.fn(() => {
      throw new Error('native bridge install failed');
    });

    expect(() => loadBridge({ install })).toThrow('native bridge install failed');
    expect(install).toHaveBeenCalledTimes(1);

    expect(loadBridge().moduleExports.Address).toBeUndefined();
  });
});
