#include "NativeCslMobileBridgeModule.h"

extern "C" {
#include "react_native_haskell_shelley.h" // provides RPtr, CharPtr, DataPtr and csl_bridge_* functions
}

#include <jsi/jsi.h>
#include <ReactCommon/CallInvoker.h>
#include <memory>
#include <string>
#include <vector>
#include <functional>

using namespace facebook;
using namespace facebook::jsi;

namespace cslmobilebridge {

// ===== RAII Wrappers =====
struct ScopedCharPtr {
  CharPtr ptr = nullptr;
  ~ScopedCharPtr() { if (ptr) csl_bridge_charptr_free(&ptr); }
};

struct ScopedDataPtr {
  DataPtr ptr{nullptr, 0};
  ~ScopedDataPtr() { if (ptr.ptr) csl_bridge_dataptr_free(&ptr); }
};

struct ScopedErrorPtr {
  CharPtr ptr = nullptr;
  ~ScopedErrorPtr() { if (ptr) csl_bridge_charptr_free(&ptr); }
};

// ===== NativeState for BigNum =====
class BigNumNativeState : public NativeState {
public:
  explicit BigNumNativeState(RPtr ptr) : ptr_(ptr) {}
  ~BigNumNativeState() { if (ptr_._0) csl_bridge_rptr_free(&ptr_); }
  [[nodiscard]] RPtr get() const { return ptr_; }
private:
  RPtr ptr_{nullptr};
};

// ===== Helpers =====
static Object createBigNum(Runtime& runtime, const RPtr& ptr) {
  auto obj = Object(runtime);
  auto nativeState = std::make_shared<BigNumNativeState>(ptr);
  obj.setNativeState(runtime, nativeState);
  return obj;
}

static const std::shared_ptr<BigNumNativeState>& getBigNumState(
    Runtime& runtime,
    const Object& val,
    const char* argName) {
  if (!val.hasNativeState<BigNumNativeState>(runtime)) {
    throw JSError(runtime, std::string("Expected BigNum for ") + argName);
  }
  return val.getNativeState<BigNumNativeState>(runtime);
}

static Array callCslArray(Runtime &runtime, std::function<bool(DataPtr *, CharPtr *)> fn) {
  ScopedDataPtr data;
  ScopedCharPtr error;

  if (!fn(&data.ptr, &error.ptr)) {
    throw JSError(runtime, error.ptr ? error.ptr : "Unknown CSL error");
  }

  Array arr(runtime, data.ptr.len);
  for (size_t i = 0; i < data.ptr.len; ++i) {
    arr.setValueAtIndex(runtime, i, Value(static_cast<double>(data.ptr.ptr[i])));
  }
  return arr;
}

static String callCslString(Runtime &runtime, std::function<bool(CharPtr *, CharPtr *)> fn) {
  ScopedCharPtr out;
  ScopedCharPtr err;
  if (!fn(&out.ptr, &err.ptr)) {
    throw JSError(runtime, err.ptr ? err.ptr : "Unknown CSL error");
  }
  return String::createFromUtf8(runtime, out.ptr);
}

static Object callCslBigNum(Runtime &runtime, std::function<bool(RPtr *, CharPtr *)> fn) {
  RPtr result;
  ScopedCharPtr err;
  if (!fn(&result, &err.ptr)) {
    throw JSError(runtime, err.ptr ? err.ptr : "Unknown CSL error");
  }
  return createBigNum(runtime, result);
}

static void callCsl(jsi::Runtime& runtime, std::function<bool(CharPtr*)> fn) {
  ScopedCharPtr err;
  if (!fn(&err.ptr)) {
    throw JSError(runtime, err.ptr ? err.ptr : "Unknown CSL error");
  }
}

// ===== TurboModule / JSI Implementation =====
NativeCslMobileBridgeModule::NativeCslMobileBridgeModule(
    std::shared_ptr<react::CallInvoker> jsInvoker)
    : facebook::react::NativeCslMobileBridgeCxxSpec<NativeCslMobileBridgeModule>(std::move(jsInvoker)) {}

// bigNumFromBytes(jsi::Array -> BigNum)
jsi::Object NativeCslMobileBridgeModule::bigNumFromBytes(jsi::Runtime &rt, jsi::Array bytes) {
  size_t length = bytes.size(rt);
  std::vector<uint8_t> buf(length);
  for (size_t i = 0; i < length; ++i) {
    buf[i] = static_cast<uint8_t>(bytes.getValueAtIndex(rt, i).asNumber());
  }
  return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
    return csl_bridge_big_num_from_bytes(buf.data(), buf.size(), out, e);
  });
}

// bigNumToBytes(BigNum -> jsi::Array)
jsi::Array NativeCslMobileBridgeModule::bigNumToBytes(jsi::Runtime& rt, jsi::Object bigNum) {
  auto bn = getBigNumState(rt, bigNum, "bigNum"); // shared_ptr<BigNumNativeState>
  return callCslArray(rt, [&](DataPtr* d, CharPtr* e) {
    return csl_bridge_big_num_to_bytes(bn->get(), d, e);
  });
}

// bigNumFromHex(String -> BigNum)
jsi::Object NativeCslMobileBridgeModule::bigNumFromHex(jsi::Runtime& rt, jsi::String hex) {
  auto s = hex.utf8(rt);
  return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
    return csl_bridge_big_num_from_hex(s.c_str(), out, e);
  });
}

// bigNumToHex(BigNum -> String)
jsi::String NativeCslMobileBridgeModule::bigNumToHex(jsi::Runtime& rt, jsi::Object bigNum) {
  auto bn = getBigNumState(rt, bigNum, "bigNum");
  return callCslString(rt, [&](CharPtr* c, CharPtr* e) {
    return csl_bridge_big_num_to_hex(bn->get(), c, e);
  });
}

// bigNumFromStr(String -> BigNum)
jsi::Object NativeCslMobileBridgeModule::bigNumFromStr(jsi::Runtime& rt, jsi::String value) {
  auto s = value.utf8(rt);
  RPtr result;
  ScopedCharPtr err;
  if (!csl_bridge_big_num_from_str(s.c_str(), &result, &err.ptr)) {
    throw JSError(rt, err.ptr ? err.ptr : "Unknown CSL error");
  }
  return createBigNum(rt, result);
}

// bigNumToStr(BigNum -> String)
jsi::String NativeCslMobileBridgeModule::bigNumToStr(jsi::Runtime& rt, jsi::Object bigNum) {
  auto bn = getBigNumState(rt, bigNum, "bigNum");
  return callCslString(rt, [&](CharPtr* c, CharPtr* e) {
    return csl_bridge_big_num_to_str(bn->get(), c, e);
  });
}

// bigNumToJson(BigNum -> String)
jsi::String NativeCslMobileBridgeModule::bigNumToJson(jsi::Runtime& rt, jsi::Object bigNum) {
  auto bn = getBigNumState(rt, bigNum, "bigNum");
  return callCslString(rt, [&](CharPtr* c, CharPtr* e) {
    return csl_bridge_big_num_to_json(bn->get(), c, e);
  });
}

// Arithmetic ops: return BigNum objects
jsi::Object NativeCslMobileBridgeModule::bigNumCheckedAdd(jsi::Runtime& rt, jsi::Object a, jsi::Object b) {
  auto A = getBigNumState(rt, a, "a");
  auto B = getBigNumState(rt, b, "b");
  return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
    return csl_bridge_big_num_checked_add(A->get(), B->get(), out, e);
  });
}

jsi::Object NativeCslMobileBridgeModule::bigNumCheckedSub(jsi::Runtime& rt, jsi::Object a, jsi::Object b) {
  auto A = getBigNumState(rt, a, "a");
  auto B = getBigNumState(rt, b, "b");
  return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
    return csl_bridge_big_num_checked_sub(A->get(), B->get(), out, e);
  });
}

jsi::Object NativeCslMobileBridgeModule::bigNumCheckedMul(jsi::Runtime& rt, jsi::Object a, jsi::Object b) {
  auto A = getBigNumState(rt, a, "a");
  auto B = getBigNumState(rt, b, "b");
  return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
    return csl_bridge_big_num_checked_mul(A->get(), B->get(), out, e);
  });
}

jsi::Object NativeCslMobileBridgeModule::bigNumClampedSub(jsi::Runtime& rt, jsi::Object a, jsi::Object b) {
  auto A = getBigNumState(rt, a, "a");
  auto B = getBigNumState(rt, b, "b");
  return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
    return csl_bridge_big_num_clamped_sub(A->get(), B->get(), out, e);
  });
}

jsi::Object NativeCslMobileBridgeModule::bigNumDivFloor(jsi::Runtime& rt, jsi::Object a, jsi::Object b) {
  auto A = getBigNumState(rt, a, "a");
  auto B = getBigNumState(rt, b, "b");
  return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) {
    return csl_bridge_big_num_div_floor(A->get(), B->get(), out, e);
  });
}

// Comparisons
double NativeCslMobileBridgeModule::bigNumCompare(jsi::Runtime& rt, jsi::Object a, jsi::Object b) {
  auto A = getBigNumState(rt, a, "a");
  auto B = getBigNumState(rt, b, "b");
  int64_t result = 0;
  callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_compare(A->get(), B->get(), &result, e); });
  return static_cast<double>(result);
}

bool NativeCslMobileBridgeModule::bigNumLessThan(jsi::Runtime& rt, jsi::Object a, jsi::Object b) {
  auto A = getBigNumState(rt, a, "a");
  auto B = getBigNumState(rt, b, "b");
  bool res = false;
  callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_less_than(A->get(), B->get(), &res, e); });
  return res;
}

bool NativeCslMobileBridgeModule::bigNumIsZero(jsi::Runtime& rt, jsi::Object a) {
  auto A = getBigNumState(rt, a, "a");
  bool res = false;
  callCsl(rt, [&](CharPtr* e) { return csl_bridge_big_num_is_zero(A->get(), &res, e); });
  return res;
}

// Constants
jsi::Object NativeCslMobileBridgeModule::bigNumZero(jsi::Runtime& rt) {
  return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) { return csl_bridge_big_num_zero(out, e); });
}

jsi::Object NativeCslMobileBridgeModule::bigNumOne(jsi::Runtime& rt) {
  return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) { return csl_bridge_big_num_one(out, e); });
}

jsi::Object NativeCslMobileBridgeModule::bigNumMaxValue(jsi::Runtime& rt) {
  return callCslBigNum(rt, [&](RPtr* out, CharPtr* e) { return csl_bridge_big_num_max_value(out, e); });
}

} // namespace cslmobilebridge
