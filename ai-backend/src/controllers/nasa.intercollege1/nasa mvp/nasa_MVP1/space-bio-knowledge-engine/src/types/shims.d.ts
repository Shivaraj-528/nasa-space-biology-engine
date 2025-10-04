declare module 'd3' {
  const content: any;
  export = content;
}

declare module 'pdf-parse' {
  type PdfResult = { text: string };
  function pdfParse(data: Buffer | Uint8Array | ArrayBuffer): Promise<PdfResult>;
  export default pdfParse;
}

declare module 'xml2js' {
  export function parseStringPromise(xml: string): Promise<any>;
}
