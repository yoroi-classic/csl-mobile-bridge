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
    stake_credential_hex_from_address: jest.fn((address) => `stake:${address}`),
    reward_address_details_from_address: jest.fn((address) => ({
      bech32: `bech32:${address}`,
      keyHashHex: 'ab'.repeat(28),
    })),
    sign_transaction_hex: jest.fn((transactionHex, privateKeyHex) =>
      `${transactionHex}:${privateKeyHex}`
    ),
    build_simple_payment_transaction_hex: jest.fn((args) => `payment:${args}`),
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
      }],
      outputs: [{address: 'addr_test_output', lovelace: '2000000'}],
      changeAddress: 'addr_test_change',
      ttl: '123456',
      feeCoefficient: '44',
      feeConstant: '155381',
      coinsPerUtxoByte: '4310',
      keyDeposit: '2000000',
      poolDeposit: '500000000',
      maxValueSize: '5000',
    };
    const packed = [
      '01'.repeat(32) + ',0,addr_test_input,10000000',
      'addr_test_output,2000000',
      'addr_test_change',
      '123456', '44', '155381', '4310', '2000000', '500000000', '5000',
    ].join('|');

    bridge.build_simple_payment_transaction_hex.mockReturnValue(`payment:${packed}|168581`);
    expect(moduleExports.buildSimplePaymentTransaction(args)).toEqual({
      cborHex: `payment:${packed}`,
      fee: '168581',
    });
    expect(bridge.build_simple_payment_transaction_hex).toHaveBeenCalledWith(packed);
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
