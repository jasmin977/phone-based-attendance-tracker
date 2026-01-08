module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-worklets/plugin", // ADD THIS
      // REMOVE 'react-native-reanimated/plugin' if it's there
    ],
  };
};
