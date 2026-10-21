import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {
  addressInfoFromAddress,
  decodePlutusDataCborHex,
  hashPlutusDataCborHex,
  valueFromAmountsHex,
  valueFromHexInfoJson,
} from '@yoroi-classic/cml-mobile-bridge';
import {ExampleSection} from './types';
import {styles} from './styles';

const TEST_ADDRESS =
  'addr_test1qqqqpvpu82s99aguppk9f02qt84d95hyy6kgn7jt8njpe0cqqzcrcw4q2t63czrv2j75qk026tfwgf4v38ayk08yrjls8jdlam';
const DATUM_CBOR_HEX = 'd87980';

function collectCmlExamples(): ExampleSection[] {
  const sections: ExampleSection[] = [];

  try {
    const address = addressInfoFromAddress(TEST_ADDRESS);
    sections.push({
      title: 'Address parsing',
      results: [
        `Network ID: ${address.networkId}`,
        `Address bytes: ${address.hex}`,
        `Bech32 round-trip: ${address.bech32 === TEST_ADDRESS ? 'passed' : 'failed'}`,
      ],
    });
  } catch (error) {
    sections.push({title: 'Address parsing', results: [], error: String(error)});
  }

  try {
    const value = {
      coin: '1234567890123',
      assets: [
        {
          policyIdHex: 'ab'.repeat(28),
          assetNameHex: '544f4b454e',
          quantity: '9007199254740993',
        },
      ],
    };
    const cborHex = valueFromAmountsHex(value);
    const decoded = JSON.parse(valueFromHexInfoJson(cborHex)) as typeof value;
    sections.push({
      title: 'Lossless multi-asset value',
      results: [
        `CBOR: ${cborHex}`,
        `Lovelace preserved: ${decoded.coin === value.coin ? 'passed' : 'failed'}`,
        `Large quantity preserved: ${decoded.assets[0]?.quantity === value.assets[0].quantity ? 'passed' : 'failed'}`,
      ],
    });
  } catch (error) {
    sections.push({title: 'Lossless multi-asset value', results: [], error: String(error)});
  }

  try {
    sections.push({
      title: 'Plutus datum',
      results: [
        `CBOR: ${DATUM_CBOR_HEX}`,
        `Hash: ${hashPlutusDataCborHex(DATUM_CBOR_HEX)}`,
        `Decoded: ${decodePlutusDataCborHex(DATUM_CBOR_HEX)}`,
      ],
    });
  } catch (error) {
    sections.push({title: 'Plutus datum', results: [], error: String(error)});
  }

  return sections;
}

export default function Index() {
  const [sections, setSections] = useState<ExampleSection[]>([]);

  useEffect(() => {
    setSections(collectCmlExamples());
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CML Mobile Bridge Demo</Text>
        <Text style={styles.subtitle}>Address, value, and datum operations</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => setSections(collectCmlExamples())}
        >
          <Text style={styles.refreshButtonText}>Refresh examples</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{section.error}</Text>
              </View>
            ) : (
              section.results.map((result) => (
                <View key={result} style={styles.resultContainer}>
                  <Text style={styles.resultText}>{result}</Text>
                </View>
              ))
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
