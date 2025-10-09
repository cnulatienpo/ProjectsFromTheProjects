export default function simpleReactPlugin() {
  return {
    name: 'simple-react-plugin',
    config() {
      return {
        esbuild: {
          jsx: 'automatic',
          jsxImportSource: 'react'
        }
      }
    }
  }
}
