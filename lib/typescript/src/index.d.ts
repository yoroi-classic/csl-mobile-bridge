/** Extract the canonical serialized stake credential from a base address using CML. */
export declare const stakeCredentialHexFromAddress: (address: string) => string;
export declare const rewardAddressDetailsFromAddress: (address: string) => {
    bech32: string;
    keyHashHex: string;
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
export declare const escrowDatumInfoJson: (datumCborHex: string) => string;
/** Advance an escrow datum's thaw time and decrement its remaining count. */
export declare const updatedEscrowDatumCborHex: (datumCborHex: string) => string;
export type EscrowAddressArguments = {
    eligibleAddress: string;
    scriptHashHex: string;
    networkId: number;
};
/** Derive an escrow script address with CML, retaining base-address staking credentials. */
export declare const deriveEscrowAddress: (args: EscrowAddressArguments) => string;
/** Normalize a Cardano pool identifier or key hash using CML. */
export declare const normalizePoolIdentifier: (poolIdOrHash: string) => {
    id: string;
    hash: string;
};
export type CnsAddressRecordResult = {
    paymentCredentialKind: 'key' | 'script';
    paymentCredentialHashHex: string;
    stakingCredentialHashHex: string | null;
    addressBech32: string;
};
/** Resolve a CNS Plutus address record into normalized credential data and a CML address. */
export declare const resolveCnsAddressRecord: (args: {
    plutusAddressJson: string;
    networkId: number;
}) => CnsAddressRecordResult;
/** Verify the Ed25519 signature over caller-supplied bytes (CIP-8 Sig_structure for signData). */
export declare const verifyEd25519Signature: (args: {
    publicKeyHex: string;
    messageHex: string;
    signatureHex: string;
}) => boolean;
/** Derive the Cardano key hash from a raw Ed25519 public key. */
export declare const publicKeyHashHexFromRawHex: (publicKeyHex: string) => string;
export declare const signTransactionHex: (transactionHex: string, privateKeyHex: string) => string;
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
export declare const signWalletTransactionHex: (args: WalletTransactionSigningArguments) => string;
/** Derive a Cardano BIP32 root key from BIP39 entropy inside the native CML bridge. */
export declare const walletRootKeyHexFromEntropy: (entropyHex: string) => string;
export type AccountPublicKeyDerivationArguments = {
    masterKeyHex: string;
    purpose: string;
    coinType: string;
    accountIndex: string;
};
/** Derive an account public key in CML without exporting derived private keys. */
export declare const deriveAccountPublicKeyHex: (args: AccountPublicKeyDerivationArguments) => string;
/** Derive a raw child public key from an account extended public key and soft path. */
export declare const derivePublicKeyFromAccountPathHex: (accountPublicKeyHex: string, path: number[]) => string;
export declare const baseAddressBech32FromPublicKeyHashes: (paymentKeyHashHex: string, stakeKeyHashHex: string, networkId: number) => string;
export declare const rewardAddressHexFromPublicKeyHash: (stakeKeyHashHex: string, networkId: number) => string;
export declare const icarusAddressBase58FromAccountPublicKeyHex: (accountPublicKeyHex: string, role: number, index: number, protocolMagic: number) => string;
export type WalletPathSigningArguments = {
    transactionHex: string;
    masterKeyHex: string;
    signerPaths: number[][];
};
/** Derive each wallet signing key and sign a transaction entirely in CML. */
export declare const signWalletTransactionPathsHex: (args: WalletPathSigningArguments) => string;
export type WalletDataSigningArguments = {
    messageHex: string;
    masterKeyHex: string;
    signerPath: number[];
};
export declare const signWalletData: (args: WalletDataSigningArguments) => {
    signatureHex: string;
    publicKeyHex: string;
};
export declare const deriveWalletPublicKeyHex: (args: Pick<WalletDataSigningArguments, "masterKeyHex" | "signerPath">) => string;
/** Compute the Cardano transaction ID from the transaction body's CML hash. */
export declare const transactionIdHex: (transactionHex: string) => string;
/** Parse transaction fields required by CIP-30 preflight validation. */
export declare const transactionValidationInfoJson: (transactionHex: string) => string;
/** Parse a transaction into the CML-backed ReviewTx DTO (all quantities are strings). */
export declare const transactionReviewInfoJson: (transactionHex: string) => string;
/** Parse normalized body/witness fields used to determine required wallet signers. */
export declare const transactionSigningRequirementsJson: (transactionHex: string) => string;
/** Extract the serialized witness set from a signed transaction using CML. */
export declare const transactionWitnessSetHex: (transactionHex: string) => string;
/** Replace witnesses with an empty set while preserving transaction body and auxiliary data. */
export declare const emptyWitnessTransactionHex: (transactionHex: string) => string;
export type ValueAmountArguments = {
    coin: string;
    assets: CmlAssetQuantity[];
};
/** Decode CML Value CBOR into lossless decimal-string quantities. */
export declare const valueFromHexInfoJson: (valueCborHex: string) => string;
/** Encode decimal-string quantities as CML Value CBOR. */
export declare const valueFromAmountsHex: (args: ValueAmountArguments) => string;
/** Return unique key hashes in native-script traversal order. */
export declare const nativeScriptRequiredKeyHashesJson: (scriptCborHex: string) => string;
/** Derive a raw Ed25519 public key from a 32-byte raw or 64-byte extended private key. */
export declare const publicKeyHexFromPrivateKeyHex: (privateKeyHex: string) => string;
/** Sign exact message bytes with a 32-byte raw or 64-byte extended Ed25519 private key. */
export declare const signEd25519MessageHex: (privateKeyHex: string, messageHex: string) => string;
export type ScriptHashType = 'native' | 'plutusV1' | 'plutusV2' | 'plutusV3';
/** Calculate a policy/script hash; Plutus language must be explicit for correct namespacing. */
export declare const scriptHashHexFromCbor: (scriptType: ScriptHashType, scriptCborHex: string) => string;
/** Generate the legacy-compatible Catalyst raw private-key bytes from BIP39 entropy/password hex. */
export declare const catalystPrivateKeyHexFromEntropy: (entropyHex: string, passwordHex?: string) => string;
/** Add verified Ledger signatures to an unsigned transaction without changing its body. */
export declare const applyLedgerWitnessesToTransactionHex: (args: {
    transactionHex: string;
    accountPublicKeyHex: string;
    purpose: string;
    coinType: string;
    accountIndex: string;
    witnesses: Array<{
        path: number[];
        signatureHex: string;
    }>;
    expectedTxIdHex: string;
    plutusDataHexes?: string[];
    senderUtxos?: Array<{
        txHashHex: string;
        outputIndex: number;
        address: string;
        addressHex?: string;
        path: number[];
    }>;
}) => string;
/** Return CML-decoded transaction fields, validated source paths, and change output paths for Ledger mapping. */
export declare const ledgerSigningRequestInfoJson: (args: {
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
    changeAddresses: Array<{
        address: string;
        addressHex?: string;
        path: number[];
    }>;
    stakingPath?: number[];
}) => string;
export type SimplePaymentBuilderArguments = {
    inputs: Array<{
        transactionHashHex: string;
        index: string;
        address: string;
        addressHex?: string;
        isBootstrap?: boolean;
        lovelace: string;
        assets?: Array<{
            policyIdHex: string;
            assetNameHex: string;
            quantity: string;
        }>;
        nativeScriptCborHex?: string;
        nativeScriptWitnessCount?: string;
    }>;
    outputs: Array<{
        address: string;
        lovelace: string;
        assets?: Array<{
            policyIdHex: string;
            assetNameHex: string;
            quantity: string;
        }>;
        datum?: {
            kind: 'hash' | 'inline';
            hex: string;
        };
    }>;
    changeAddress: string;
    ttl?: string;
    manualFee?: string;
    manualChangeOutput?: {
        address: string;
        lovelace: string;
        assets: CmlAssetQuantity[];
        datum?: {
            kind: 'hash' | 'inline';
            hex: string;
        };
    };
    feeCoefficient: string;
    feeConstant: string;
    coinsPerUtxoByte: string;
    keyDeposit: string;
    poolDeposit: string;
    maxValueSize: string;
    metadata?: Array<{
        label: string;
        data: unknown;
    }>;
    nativeMints?: Array<{
        policyIdHex: string;
        scriptCborHex: string;
        assets: Array<{
            assetNameHex: string;
            quantity: string;
        }>;
    }>;
    certificates?: Array<{
        kind: 'StakeRegistration' | 'StakeDeregistration' | 'StakeDelegation' | 'VoteDelegation' | 'StakeAndVoteDelegation' | 'StakeRegistrationAndDelegation' | 'StakeVoteRegistrationAndDelegation' | 'VoteRegistrationAndDelegation';
        stakeCredentialKeyHashHex: string;
        poolKeyHash?: string;
        drep?: 'AlwaysAbstain' | 'AlwaysNoConfidence' | {
            KeyHash: string;
        } | {
            ScriptHash: string;
        };
    }>;
    withdrawals?: Array<{
        rewardAddress: string;
        amount: string;
    }>;
    validityStart?: string;
    referenceInputs?: Array<{
        transactionHashHex: string;
        index: string;
        address: string;
        lovelace: string;
        assets?: Array<{
            policyIdHex: string;
            assetNameHex: string;
            quantity: string;
        }>;
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
    referenceScript?: {
        hash: string;
        type?: string;
        size?: number;
        bytes?: string;
    };
    nativeScriptCborHex?: string;
    nativeScriptWitnessCount?: string;
};
export type CmlTransactionRecipeOutput = {
    address: string;
    lovelace: string;
    assets: CmlAssetQuantity[];
    datum?: {
        kind: 'hash' | 'inline';
        hex: string;
    };
};
export type CmlTransactionRecipeCertificate = NonNullable<SimplePaymentBuilderArguments['certificates']>[number] | {
    kind: 'PoolRegistration';
    poolParams: Record<string, unknown>;
} | {
    kind: 'PoolRetirement';
    poolKeyHash: string;
    epoch: string;
} | {
    kind: 'MoveInstantaneousRewardsCert';
    pot: 'reserves' | 'treasury';
    rewards: Array<{
        credential: {
            kind: 'key' | 'script';
            hashHex: string;
        };
        amount: string;
    }>;
} | {
    kind: 'GenesisKeyDelegation';
    genesisHashHex: string;
    genesisDelegateHashHex: string;
    vrfKeyHashHex: string;
} | {
    kind: 'CommitteeHotAuth';
    coldCredential: {
        kind: 'key' | 'script';
        hashHex: string;
    };
    hotCredential: {
        kind: 'key' | 'script';
        hashHex: string;
    };
} | {
    kind: 'CommitteeColdResign';
    coldCredential: {
        kind: 'key' | 'script';
        hashHex: string;
    };
    anchor?: {
        url: string;
        dataHashHex: string;
    };
} | {
    kind: 'DRepRegistration' | 'DRepDeregistration' | 'DRepUpdate';
    credential: {
        kind: 'key' | 'script';
        hashHex: string;
    };
    deposit?: string;
    anchor?: {
        url: string;
        dataHashHex: string;
    };
};
export type CmlTransactionRecipeArguments = {
    protocolParams: {
        linearFee: {
            coefficient: string;
            constant: string;
        };
        coinsPerUtxoByte: string;
        keyDeposit: string;
        poolDeposit: string;
        maxValueSize: string;
        maxTxSize?: string;
        collateralPercentage?: string;
        refScriptCoinsPerByte?: {
            numerator: string;
            denominator: string;
        };
        refScriptTierStepBytes?: string;
        refScriptMultiplier?: string;
        exUnitPricesMemory?: {
            numerator: string;
            denominator: string;
        };
        exUnitPricesSteps?: {
            numerator: string;
            denominator: string;
        };
        plutusV1CostModel?: number[];
        plutusV2CostModel?: number[];
        plutusV3CostModel?: number[];
    };
    inputs: Array<CmlTransactionRecipeUtxo & {
        kind?: 'paymentKey' | 'nativeScript';
    }>;
    outputs: CmlTransactionRecipeOutput[];
    certificates: CmlTransactionRecipeCertificate[];
    withdrawals: Array<{
        rewardAddress: string;
        amount: string;
    }>;
    referenceInputs: Array<Omit<CmlTransactionRecipeUtxo, 'inlineDatumCborHex' | 'datumHashHex' | 'nativeScriptCborHex' | 'nativeScriptWitnessCount'>>;
    scriptInputs: Array<{
        utxo: CmlTransactionRecipeUtxo;
        scriptHashHex?: string;
        plutusVersion: 'V1' | 'V2' | 'V3';
        inlineScriptCborHex?: string;
        redeemerCborHex: string;
        redeemerMem: string;
        redeemerSteps: string;
        datumSource: 'inline' | {
            kind: 'explicit';
            cborHex: string;
        };
        referenceScript?: {
            utxo: CmlTransactionRecipeUtxo;
            scriptCborHex: string;
            size: string;
        };
    }>;
    collateralInputs: CmlTransactionRecipeUtxo[];
    collateralReturn?: CmlTransactionRecipeOutput;
    totalCollateral?: string;
    mints: Array<{
        policyIdHex: string;
        scriptType: 'native' | 'plutusV1' | 'plutusV2' | 'plutusV3';
        scriptCborHex: string;
        assets: Array<{
            assetNameHex: string;
            quantity: string;
        }>;
        redeemerCborHex?: string;
        redeemerMem?: string;
        redeemerSteps?: string;
        referenceInput?: CmlTransactionRecipeUtxo;
    }>;
    metadata: Array<{
        label: string;
        data: unknown;
    }>;
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
    refScriptCoinsPerByte: {
        numerator: string;
        denominator: string;
    };
    refScriptTierStepBytes: string;
    refScriptMultiplier: string;
    exUnitPricesMemory: {
        numerator: string;
        denominator: string;
    };
    exUnitPricesSteps: {
        numerator: string;
        denominator: string;
    };
    plutusVersion?: 'V1' | 'V2' | 'V3';
    plutusV1CostModel?: number[];
    plutusV2CostModel?: number[];
    plutusV3CostModel: number[];
};
export declare const buildEscrowRedeemTransactionCml: (args: EscrowCmlTransactionArguments) => {
    cborHex: string;
    fee: string;
};
export declare const minimumCoinForAssets: (address: string, assets: CmlAssetQuantity[], coinsPerUtxoByte: string) => string;
/** Build a transaction with CML using ADA and multiasset value bundles. */
export declare const buildSimplePaymentTransaction: (args: SimplePaymentBuilderArguments) => {
    cborHex: string;
    fee: string;
};
/** Build a normalized decimal-string transaction recipe through the CML bridge. */
export declare const buildTransactionRecipeCml: (args: CmlTransactionRecipeArguments) => {
    cborHex: string;
    fee: string;
};
/** Parse a bech32 or hex address and return its raw bytes as hex using CML. */
export declare const addressToHex: (address: string) => string;
/** Parse an address with CML and return normalized bytes, network ID and bech32 when available. */
export declare const addressInfoFromAddress: (address: string) => {
    hex: string;
    networkId: number;
    bech32: string | null;
    isValid: true;
};
/** Hash serialized Plutus datum CBOR with the CML native bridge. */
export declare const hashPlutusDataCborHex: (cborHex: string) => string;
/** Decode serialized Plutus data into the Yoroi display structure with CML. */
export declare const decodePlutusDataCborHex: (cborHex: string) => string;
/** Extract inline datum/hash information from transaction-output CBOR. */
export declare const datumInfoFromOutputCborHex: (outputCborHex: string) => string;
export type TransactionUnspentOutputArguments = {
    txHashHex: string;
    index: string;
    address: string;
    lovelace: string;
    assets: CmlAssetQuantity[];
};
/** Serialize a CIP-30 TransactionUnspentOutput using CML. */
export declare const transactionUnspentOutputHex: (args: TransactionUnspentOutputArguments) => string;
/** Extract a reward address from a Cardano address using CML. */
export declare const rewardAddressFromAddress: (address: string, network: number) => string;
export declare const rewardAddressHexFromAccountPublicKey: (accountPublicKeyHex: string, network: number, role: number, index: number) => string;
//# sourceMappingURL=index.d.ts.map