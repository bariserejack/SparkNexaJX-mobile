import { Theme } from './Theme';

// simple color lookup used by Themed components (Text/View)
// we only keep the minimal fields needed by the generated helpers.
// values are derived from the main Theme so they stay in sync.

export default {
  light: {
    text: Theme.light.text,
    background: Theme.light.background,
    tint: Theme.brand.primary,
    tabIconDefault: '#ccc',
    tabIconSelected: Theme.brand.primary,
  },
  dark: {
    text: Theme.dark.text,
    background: Theme.dark.background,
    tint: Theme.brand.primary,
    tabIconDefault: '#ccc',
    tabIconSelected: Theme.brand.primary,
  },
};
