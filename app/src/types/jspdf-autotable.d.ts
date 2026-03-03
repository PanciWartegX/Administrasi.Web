declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    [key: string]: any;
  }
  
  function autoTable(doc: jsPDF, options: AutoTableOptions): void;
  
  export = autoTable;
}
