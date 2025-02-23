
import 'react-native-gesture-handler/jestSetup';
import * as jestNative from '@testing-library/jest-native';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

global.fetch = require('jest-fetch-mock');

expect.extend(jestNative.matchers);
