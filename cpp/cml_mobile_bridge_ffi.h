#pragma once

// cbindgen does not expand the guarded_export! macro, so these C ABI
// declarations are kept alongside the C++ module that calls them.
bool cml_bridge_wallet_root_key_hex_from_entropy(CharPtr entropy_hex,
                                                 CharPtr *result,
                                                 CharPtr *error);
bool cml_bridge_derive_account_public_key_hex(CharPtr args,
                                              CharPtr *result,
                                              CharPtr *error);
bool cml_bridge_sign_wallet_transaction_paths_hex(CharPtr args,
                                                   CharPtr *result,
                                                   CharPtr *error);
bool cml_bridge_sign_wallet_data(CharPtr args, CharPtr *result, CharPtr *error);
bool cml_bridge_derive_wallet_public_key_hex(CharPtr args,
                                            CharPtr *result,
                                            CharPtr *error);
bool cml_bridge_transaction_id_hex(CharPtr transaction_hex,
                                    CharPtr *result,
                                    CharPtr *error);
bool cml_bridge_transaction_validation_info_json(CharPtr transaction_hex,
                                                  CharPtr *result,
                                                  CharPtr *error);
bool cml_bridge_transaction_review_info_json(CharPtr transaction_hex,
                                             CharPtr *result,
                                             CharPtr *error);
bool cml_bridge_transaction_signing_requirements_json(CharPtr transaction_hex,
                                                       CharPtr *result,
                                                       CharPtr *error);
bool cml_bridge_transaction_witness_set_hex(CharPtr transaction_hex,
                                            CharPtr *result,
                                            CharPtr *error);
bool cml_bridge_empty_witness_transaction_hex(CharPtr transaction_hex,
                                              CharPtr *result,
                                              CharPtr *error);
bool cml_bridge_sign_transaction_hex(CharPtr transaction_hex,
                                     CharPtr private_key_hex,
                                     CharPtr *result,
                                     CharPtr *error);
bool cml_bridge_sign_wallet_transaction_hex(CharPtr args,
                                            CharPtr *result,
                                            CharPtr *error);
bool cml_bridge_build_simple_payment_transaction_hex(CharPtr args,
                                                     CharPtr *result,
                                                     CharPtr *error);
bool cml_bridge_build_transaction_recipe_cml_hex(CharPtr args,
                                                 CharPtr *result,
                                                 CharPtr *error);
bool cml_bridge_build_escrow_redeem_transaction_hex(CharPtr args,
                                                    CharPtr *result,
                                                    CharPtr *error);
bool cml_bridge_minimum_coin_for_assets(CharPtr args,
                                        CharPtr *result,
                                        CharPtr *error);
