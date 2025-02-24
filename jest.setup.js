// Import globals from '@jest/globals' and assign to global
import * as globs from "@jest/globals";
global.expect = globs.expect;

import "react-native-gesture-handler/jestSetup";
// Import the extended matchers using require() so it loads synchronously
require("@testing-library/jest-native/extend-expect");

jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});

global.fetch = require("jest-fetch-mock");
