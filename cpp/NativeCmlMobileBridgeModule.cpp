#include "NativeCslMobileBridgeModule.h"

#include <jsi/jsi.h>
#include <memory>
#include <string>

extern "C" {
#include "react_native_haskell_shelley.h"
}

namespace cslmobilebridge {
namespace {
struct ScopedCharPtr {
  CharPtr ptr = nullptr;
  ~ScopedCharPtr() {
    if (ptr) csl_bridge_charptr_free(&ptr);
  }
};

using StringFunction = bool (*)(CharPtr, CharPtr *, CharPtr *);

void installStringFunction(facebook::jsi::Runtime &rt,
                           facebook::jsi::Object &exports,
                           const char *name,
                           StringFunction function,
                           const char *failure) {
  exports.setProperty(
      rt, name,
      facebook::jsi::Function::createFromHostFunction(
          rt, facebook::jsi::PropNameID::forAscii(rt, name), 1,
          [function, failure](facebook::jsi::Runtime &runtime,
                              const facebook::jsi::Value &,
                              const facebook::jsi::Value *args,
                              size_t count) -> facebook::jsi::Value {
            if (count < 1 || !args[0].isString()) {
              throw facebook::jsi::JSError(runtime,
                                           std::string(failure) + ": expected a string");
            }
            const std::string input = args[0].asString(runtime).utf8(runtime);
            ScopedCharPtr result;
            ScopedCharPtr error;
            if (!function(input.c_str(), &result.ptr, &error.ptr)) {
              throw facebook::jsi::JSError(runtime,
                                           error.ptr ? error.ptr : failure);
            }
            if (!result.ptr) {
              throw facebook::jsi::JSError(runtime,
                                           std::string(failure) + ": returned no result");
            }
            return facebook::jsi::String::createFromUtf8(runtime, result.ptr);
          }));
}

facebook::jsi::Object installCmlExports(facebook::jsi::Runtime &rt) {
  facebook::jsi::Object exports(rt);
#define INSTALL_STRING(name, function) \
  installStringFunction(rt, exports, #name, function, #name)
  INSTALL_STRING(stake_credential_hex_from_address,
                 cml_bridge_stake_credential_hex_from_address);
  INSTALL_STRING(reward_address_details_from_address,
                 cml_bridge_reward_address_details_from_address);
  INSTALL_STRING(sign_wallet_transaction_hex,
                 cml_bridge_sign_wallet_transaction_hex);
  INSTALL_STRING(wallet_root_key_hex_from_entropy,
                 cml_bridge_wallet_root_key_hex_from_entropy);
  INSTALL_STRING(derive_account_public_key_hex,
                 cml_bridge_derive_account_public_key_hex);
  INSTALL_STRING(sign_wallet_transaction_paths_hex,
                 cml_bridge_sign_wallet_transaction_paths_hex);
  INSTALL_STRING(sign_wallet_data, cml_bridge_sign_wallet_data);
  INSTALL_STRING(derive_wallet_public_key_hex,
                 cml_bridge_derive_wallet_public_key_hex);
  INSTALL_STRING(transaction_id_hex, cml_bridge_transaction_id_hex);
  INSTALL_STRING(transaction_validation_info_json,
                 cml_bridge_transaction_validation_info_json);
  INSTALL_STRING(transaction_witness_set_hex,
                 cml_bridge_transaction_witness_set_hex);
  INSTALL_STRING(build_simple_payment_transaction_hex,
                 cml_bridge_build_simple_payment_transaction_hex);
  INSTALL_STRING(build_escrow_redeem_transaction_hex,
                 cml_bridge_build_escrow_redeem_transaction_hex);
  INSTALL_STRING(minimum_coin_for_assets,
                 cml_bridge_minimum_coin_for_assets);
  INSTALL_STRING(address_to_hex, cml_bridge_address_to_hex);
  INSTALL_STRING(address_info_from_address,
                 cml_bridge_address_info_from_address);
  INSTALL_STRING(hash_plutus_data_cbor_hex,
                 cml_bridge_hash_plutus_data_cbor_hex);
  INSTALL_STRING(decode_plutus_data_cbor_hex,
                 cml_bridge_decode_plutus_data_cbor_hex);
  INSTALL_STRING(datum_info_from_output_cbor_hex,
                 cml_bridge_datum_info_from_output_cbor_hex);
#undef INSTALL_STRING
  exports.setProperty(
      rt, "sign_transaction_hex",
      facebook::jsi::Function::createFromHostFunction(
          rt, facebook::jsi::PropNameID::forAscii(rt, "sign_transaction_hex"), 2,
          [](facebook::jsi::Runtime &runtime, const facebook::jsi::Value &,
             const facebook::jsi::Value *args, size_t count) -> facebook::jsi::Value {
            if (count < 2 || !args[0].isString() || !args[1].isString()) {
              throw facebook::jsi::JSError(runtime,
                  "sign_transaction_hex: expected transaction and private key strings");
            }
            const std::string tx = args[0].asString(runtime).utf8(runtime);
            const std::string key = args[1].asString(runtime).utf8(runtime);
            ScopedCharPtr result;
            ScopedCharPtr error;
            if (!cml_bridge_sign_transaction_hex(tx.c_str(), key.c_str(),
                                                  &result.ptr, &error.ptr)) {
              throw facebook::jsi::JSError(runtime,
                                           error.ptr ? error.ptr : "CML signing failed");
            }
            return facebook::jsi::String::createFromUtf8(runtime, result.ptr);
          }));
  exports.setProperty(
      rt, "reward_address_from_address",
      facebook::jsi::Function::createFromHostFunction(
          rt, facebook::jsi::PropNameID::forAscii(rt, "reward_address_from_address"), 2,
          [](facebook::jsi::Runtime &runtime, const facebook::jsi::Value &,
             const facebook::jsi::Value *args, size_t count) -> facebook::jsi::Value {
            if (count < 2 || !args[0].isString() || !args[1].isNumber()) {
              throw facebook::jsi::JSError(runtime,
                  "reward_address_from_address: expected address and network number");
            }
            const auto network = args[1].asNumber();
            if (network < 0 || network > 255 || network != static_cast<uint32_t>(network)) {
              throw facebook::jsi::JSError(runtime, "network must be an integer from 0 to 255");
            }
            const std::string address = args[0].asString(runtime).utf8(runtime);
            ScopedCharPtr result;
            ScopedCharPtr error;
            if (!cml_bridge_reward_address_from_address(address.c_str(),
                    static_cast<uint8_t>(network), &result.ptr, &error.ptr)) {
              throw facebook::jsi::JSError(runtime,
                                           error.ptr ? error.ptr : "CML reward address failed");
            }
            return facebook::jsi::String::createFromUtf8(runtime, result.ptr);
          }));
  exports.setProperty(
      rt, "reward_address_hex_from_account_public_key",
      facebook::jsi::Function::createFromHostFunction(
          rt, facebook::jsi::PropNameID::forAscii(rt,
              "reward_address_hex_from_account_public_key"), 4,
          [](facebook::jsi::Runtime &runtime, const facebook::jsi::Value &,
             const facebook::jsi::Value *args, size_t count) -> facebook::jsi::Value {
            if (count < 4 || !args[0].isString() || !args[1].isNumber() ||
                !args[2].isNumber() || !args[3].isNumber()) {
              throw facebook::jsi::JSError(runtime,
                  "reward_address_hex_from_account_public_key: invalid arguments");
            }
            const auto network = args[1].asNumber();
            const auto role = args[2].asNumber();
            const auto index = args[3].asNumber();
            if (network < 0 || network > 255 || network != static_cast<uint32_t>(network) ||
                role < 0 || role > UINT32_MAX || role != static_cast<uint32_t>(role) ||
                index < 0 || index > UINT32_MAX || index != static_cast<uint32_t>(index)) {
              throw facebook::jsi::JSError(runtime, "reward address path values are out of range");
            }
            const std::string key = args[0].asString(runtime).utf8(runtime);
            ScopedCharPtr result;
            ScopedCharPtr error;
            if (!cml_bridge_reward_address_hex_from_account_public_key(
                    key.c_str(), static_cast<uint8_t>(network),
                    static_cast<uint32_t>(role), static_cast<uint32_t>(index),
                    &result.ptr, &error.ptr)) {
              throw facebook::jsi::JSError(runtime,
                  error.ptr ? error.ptr : "CML reward address derivation failed");
            }
            return facebook::jsi::String::createFromUtf8(runtime, result.ptr);
          }));
  return exports;
}
} // namespace

NativeCslMobileBridgeModule::NativeCslMobileBridgeModule(
    std::shared_ptr<facebook::react::CallInvoker> jsInvoker)
    : facebook::react::NativeCslMobileBridgeCxxSpec<NativeCslMobileBridgeModule>(
          std::move(jsInvoker)) {}

facebook::jsi::Object NativeCslMobileBridgeModule::install(
    facebook::jsi::Runtime &rt) {
  return installCmlExports(rt);
}
} // namespace cslmobilebridge
