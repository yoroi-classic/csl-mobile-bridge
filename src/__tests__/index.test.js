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
    reward_address_details_from_address: jest.fn((address) => ({
      bech32: `bech32:${address}`,
      keyHashHex: 'ab'.repeat(28),
    })),
    sign_transaction_hex: jest.fn((transactionHex, privateKeyHex) =>
      `${transactionHex}:${privateKeyHex}`
    ),
    sign_wallet_transaction_hex: jest.fn((args) => `wallet-signed:${args}`),
    wallet_root_key_hex_from_entropy: jest.fn((entropyHex) => `root:${entropyHex}`),
    derive_account_public_key_hex: jest.fn((args) => `account:${args}`),
    sign_wallet_transaction_paths_hex: jest.fn((args) => `paths-signed:${args}`),
    sign_wallet_data: jest.fn((args) => JSON.stringify({signatureHex: args, publicKeyHex: 'aa'})),
    derive_wallet_public_key_hex: jest.fn((args) => `public:${args}`),
    transaction_id_hex: jest.fn((transactionHex) => `id:${transactionHex}`),
    build_simple_payment_transaction_hex: jest.fn((args) => `payment:${args}`),
    build_escrow_redeem_transaction_hex: jest.fn((args) => `escrow:${args}|168581`),
    minimum_coin_for_assets: jest.fn(() => '1500000'),
    reward_address_hex_from_account_public_key: jest.fn(
      (accountPublicKeyHex, network, role, index) =>
        `${network}:${role}:${index}:${accountPublicKeyHex}`
    ),
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

describe('CSL mobile bridge source entrypoint', () => {
  it('installs the native bridge once and exposes wallet flow APIs', () => {
    const { bridge, getEnforcing, install, moduleExports } = loadBridge();

    expect(getEnforcing).toHaveBeenCalledTimes(1);
    expect(getEnforcing).toHaveBeenCalledWith('CslMobileBridge');
    expect(install).toHaveBeenCalledTimes(1);

    expect(moduleExports.default).toBe(bridge);
    expect(moduleExports.Address).toBe(bridge.Address);
    expect(moduleExports.BigNum).toBe(bridge.BigNum);
    expect(moduleExports.PrivateKey).toBe(bridge.PrivateKey);
    expect(moduleExports.TransactionHash).toBe(bridge.TransactionHash);
    expect(moduleExports.make_vkey_witness).toBe(bridge.make_vkey_witness);
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

  it('keeps deterministic serialization outputs for bridge fixtures', () => {
    const { moduleExports: csl } = loadBridge();

    const parsedAddress = csl.Address.from_bech32(fixtures.address);
    const coin = csl.BigNum.from_str('42000000');
    const restoredCoin = csl.BigNum.from_bytes(coin.to_bytes());
    const metadata = csl.encode_json_str_to_metadatum(
      fixtures.metadataJson,
      csl.MetadataJsonSchema.BasicConversions
    );

    expect(parsedAddress.network_id()).toBe(0);
    expect(parsedAddress.to_bech32()).toBe(fixtures.address);
    expect(Array.from(coin.to_bytes())).toEqual([
      52, 50, 48, 48, 48, 48, 48, 48,
    ]);
    expect(restoredCoin.to_json()).toBe('"42000000"');
    expect(coin.checked_add(csl.BigNum.from_str('8')).to_str()).toBe(
      '42000008'
    );
    expect(metadata.to_json()).toBe(fixtures.metadataJson);
    expect(
      csl.decode_metadatum_to_json_str(
        metadata,
        csl.MetadataJsonSchema.BasicConversions
      )
    ).toBe(fixtures.metadataJson);
  });

  it('returns deterministic witness data through the signing bridge API', () => {
    const { moduleExports: csl } = loadBridge();
    const txHash = csl.TransactionHash.from_hex(fixtures.transactionHashHex);
    const privateKey = csl.PrivateKey.from_hex(fixtures.privateKeyHex);

    const witness = csl.make_vkey_witness(txHash, privateKey);

    expect(csl.make_vkey_witness).toHaveBeenCalledWith(txHash, privateKey);
    expect(witness.to_json()).toBe(
      '{"signature":"sig-22222222-11111111","vkey":"vkey-11111111"}'
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
      '01'.repeat(32) + ',0,addr_test_input,10000000,' + 'ab'.repeat(28) + '~00ff~9007199254740993,-,-',
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

  it('routes the escrow Plutus recipe through the native CML helper', () => {
    const {bridge, moduleExports} = loadBridge();
    const args = {
      scriptInput: {txHashHex: '01'.repeat(32), index: '0', address: 'script', lovelace: '9000000', assets: [], inlineDatumCborHex: 'd87980'},
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
      expect.stringContaining('cd'.repeat(28) + ',native,8200581c' + 'ab'.repeat(28) + ',00ff~-9007199254740993'),
    );
  });

  it('routes minimum-coin-for-assets calculation through CML with exact quantities', () => {
    const { bridge, moduleExports } = loadBridge();
    const packed = `addr_test_change|${'ab'.repeat(28)}~00ff~9007199254740993|4310`;
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
      'Metadata integers must be safe JavaScript integers',
    );
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

  it('propagates native install and bridge validation errors', () => {
    const install = jest.fn(() => {
      throw new Error('native bridge install failed');
    });

    expect(() => loadBridge({ install })).toThrow('native bridge install failed');
    expect(install).toHaveBeenCalledTimes(1);

    const { moduleExports: csl } = loadBridge();

    expect(() => csl.Address.from_bech32('not-an-address')).toThrow(
      'invalid bech32 address fixture: not-an-address'
    );
  });
});
