export interface ExampleSection {
  title: string;
  results: string[];
  error?: string;
}

export interface ExampleComponentProps {
  onResult: (section: ExampleSection) => void;
}
