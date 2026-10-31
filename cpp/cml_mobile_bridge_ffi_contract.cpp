#include <type_traits>

extern "C" {
#include "react_native_haskell_shelley.h"
}

using SingleStringExport = bool (*)(CharPtr, CharPtr *, CharPtr *);
using TwoStringExport = bool (*)(CharPtr, CharPtr, CharPtr *, CharPtr *);

#define ASSERT_SINGLE_STRING_EXPORT(name) \
  static_assert(std::is_same_v<decltype(&name), SingleStringExport>)

ASSERT_SINGLE_STRING_EXPORT(cml_bridge_wallet_root_key_hex_from_entropy);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_derive_account_public_key_hex);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_sign_wallet_transaction_paths_hex);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_sign_wallet_data);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_derive_wallet_public_key_hex);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_transaction_id_hex);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_transaction_validation_info_json);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_transaction_review_info_json);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_transaction_signing_requirements_json);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_transaction_witness_set_hex);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_empty_witness_transaction_hex);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_sign_wallet_transaction_hex);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_build_simple_payment_transaction_hex);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_build_transaction_recipe_cml_hex);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_build_escrow_redeem_transaction_hex);
ASSERT_SINGLE_STRING_EXPORT(cml_bridge_minimum_coin_for_assets);

static_assert(std::is_same_v<decltype(&cml_bridge_sign_transaction_hex), TwoStringExport>);

#undef ASSERT_SINGLE_STRING_EXPORT
