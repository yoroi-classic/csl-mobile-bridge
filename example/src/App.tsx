import { Text, View, StyleSheet } from 'react-native';
import { BigNum } from '@emurgo/csl-mobile-bridge';

const result = BigNum.from_str('12345678901234567890');

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Result: {result.to_str()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
