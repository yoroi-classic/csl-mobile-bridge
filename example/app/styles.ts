import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'white',
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 8,
  },
  resultContainer: {
    backgroundColor: '#f9fafb',
    padding: 8,
    marginVertical: 2,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    fontFamily: 'monospace',
  },
});
