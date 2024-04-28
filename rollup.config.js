import resolve from '@rollup/plugin-node-resolve';

export default {
  input: './model-viewer.js',
  output: [
    {
      format: 'esm',
      file: './model-viewer-bundle.js'
    },
  ],
  plugins: [
    resolve(),
  ]
};