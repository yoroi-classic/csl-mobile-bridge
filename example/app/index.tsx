import { Text, ScrollView, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { BigNum } from "@emurgo/csl-mobile-bridge";

export default function Index() {
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    try {
      const results: string[] = [];
      
      // Basic creation
      const bn1 = BigNum.from_str("12345678901234567890");
      results.push(`from_str: ${bn1.to_str()}`);
      
      // Static methods
      const zero = BigNum.zero();
      const one = BigNum.one();
      results.push(`zero: ${zero.to_str()}`);
      results.push(`one: ${one.to_str()}`);
      
      // Arithmetic operations
      const bn2 = BigNum.from_str("1000000000000000000");
      const sum = bn1.checked_add(bn2);
      results.push(`12345678901234567890 + 1000000000000000000 = ${sum.to_str()}`);
      
      const product = bn1.checked_mul(BigNum.from_str("2"));
      results.push(`12345678901234567890 * 2 = ${product.to_str()}`);
      
      // Comparison
      const isLess = bn1.less_than(product);
      results.push(`bn1 < product: ${isLess}`);
      
      const isZero = zero.is_zero();
      results.push(`zero.is_zero(): ${isZero}`);
      
      // Conversions
      const hex = bn1.to_hex();
      results.push(`hex: ${hex}`);
      
      const bytes = bn1.to_bytes();
      results.push(`bytes length: ${bytes.length}`);
      
      // From hex
      const fromHex = BigNum.from_hex(hex);
      results.push(`from_hex: ${fromHex.to_str()}`);
      
      setResults(results);
    } catch (error) {
      console.error("Error with BigNum:", error);
      setResults([`Error: ${error instanceof Error ? error.message : String(error)}`]);
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>CSL Mobile Bridge Demo</Text>
      {results.map((result, index) => (
        <Text key={index} style={styles.result}>{result}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  result: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
});
