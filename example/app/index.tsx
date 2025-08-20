import { Text, View } from "react-native";
import { BigNum } from "@emurgo/csl-mobile-bridge";

const t = BigNum.from_str("12345678901234567890").then((bn) => bn.to_str());

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>hello {t}</Text>
    </View>
  );
}