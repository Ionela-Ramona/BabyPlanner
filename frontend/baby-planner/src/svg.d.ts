/**
 * `import x from './ceva.svg'` da continutul fisierului ca text (loader-ul ".svg":
 * "text" din angular.json). Folosit pentru ilustratiile puse inline in pagina.
 */
declare module '*.svg' {
  const content: string;
  export default content;
}
