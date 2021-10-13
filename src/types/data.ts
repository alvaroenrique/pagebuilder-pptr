export interface Feature {
  id: string;
  label?: string;
}

export interface Page {
  id: string;
  name: string;
  uri: string;
  sites: string[];
  featuresList: string[];
}

export interface Template {
  id: string;
  name: string;
  featuresList: string[];
}
