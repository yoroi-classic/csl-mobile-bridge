import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ExampleSection } from './types';
import { styles } from './styles';

// Import all example classes
import BigNumExamples from './examples/BigNumExamples';
import AddressExamples from './examples/AddressExamples';
import TransactionExamples from './examples/TransactionExamples';
import ValueExamples from './examples/ValueExamples';
import ProtocolParametersExamples from './examples/ProtocolParametersExamples';
import CryptographyExamples from './examples/CryptographyExamples';
import MetadataExamples from './examples/MetadataExamples';
import HeaderBodyExamples from './examples/HeaderBodyExamples';
import PoolParamsExamples from './examples/PoolParamsExamples';
import SingleHostAddrExamples from './examples/SingleHostAddrExamples';
import SingleHostNameExamples from './examples/SingleHostNameExamples';
import TransactionBodyExamples from './examples/TransactionBodyExamples';

export default function Index() {
  const [sections, setSections] = useState<ExampleSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAllExamples();
  }, []);

  const runAllExamples = async () => {
    setLoading(true);
    const newSections: ExampleSection[] = [];

    try {
      // Run all example classes
      newSections.push(await BigNumExamples.run());
      newSections.push(await AddressExamples.run());
      newSections.push(await TransactionExamples.run());
      newSections.push(await ValueExamples.run());
      newSections.push(await ProtocolParametersExamples.run());
      newSections.push(await CryptographyExamples.run());
      newSections.push(await MetadataExamples.run());
      newSections.push(await HeaderBodyExamples.run());
      newSections.push(await PoolParamsExamples.run());
      newSections.push(await SingleHostAddrExamples.run());
      newSections.push(await SingleHostNameExamples.run());
      newSections.push(await TransactionBodyExamples.run());
      
    } catch (error) {
      console.error("Error running examples:", error);
      newSections.push({
        title: "Global Error",
        results: [],
        error: error instanceof Error ? error.message : String(error)
      });
    }

    setSections(newSections);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CSL Mobile Bridge Demo</Text>
        <Text style={styles.subtitle}>Comprehensive Examples & Testing</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={runAllExamples}>
          <Text style={styles.refreshButtonText}>🔄 Refresh Examples</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Running examples...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {sections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{section.error}</Text>
                </View>
              ) : (
                section.results.map((result, resultIndex) => (
                  <View key={resultIndex} style={styles.resultContainer}>
                    <Text style={styles.resultText}>{result}</Text>
                  </View>
                ))
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
