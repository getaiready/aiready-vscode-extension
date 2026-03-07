import * as Parser from 'web-tree-sitter';
import * as path from 'path';
import * as fs from 'fs';
import {
  Language,
  LanguageParser,
  ParseResult,
  ExportInfo,
  ImportInfo,
  NamingConvention,
  ParseError,
} from '../types/language';

/**
 * Java Parser implementation using tree-sitter
 */
export class JavaParser implements LanguageParser {
  readonly language = Language.Java;
  readonly extensions = ['.java'];
  private parser: Parser.Parser | null = null;
  private initialized = false;

  /**
   * Initialize the tree-sitter parser
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (typeof Parser.Parser.init === 'function') {
        await Parser.Parser.init();
      }
      this.parser = new Parser.Parser();

      // Try to find the wasm file in several common locations
      // Using tree-sitter-wasms package
      const possiblePaths = [
        path.join(
          process.cwd(),
          'node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-java.wasm'
        ),
        path.join(
          __dirname,
          '../../node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-java.wasm'
        ),
        path.join(
          __dirname,
          '../../../node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-java.wasm'
        ),
        path.join(
          __dirname,
          '../../../../node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-java.wasm'
        ),
        path.join(
          process.cwd(),
          'node_modules/tree-sitter-wasms/out/tree-sitter-java.wasm'
        ),
      ];

      let wasmPath = '';
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          wasmPath = p;
          break;
        }
      }

      if (!wasmPath) {
        console.warn(
          `Java WASM not found. Tried paths: ${possiblePaths.join(', ')}`
        );
        return;
      }

      const Java = await Parser.Language.load(wasmPath);
      this.parser.setLanguage(Java);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize tree-sitter-java:', error);
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
    }
  }

  parse(code: string, filePath: string): ParseResult {
    if (!this.initialized || !this.parser) {
      throw new ParseError(
        `JavaParser not initialized for ${filePath}`,
        filePath
      );
    }

    try {
      const tree = this.parser.parse(code);
      if (!tree) throw new Error('Parser.parse(code) returned null');
      const rootNode = tree.rootNode;

      const imports = this.extractImportsAST(rootNode);
      const exports = this.extractExportsAST(rootNode);

      return {
        exports,
        imports,
        language: Language.Java,
        warnings: [],
      };
    } catch (error) {
      throw new ParseError(
        `AST parsing failed for ${filePath}: ${(error as Error).message}`,
        filePath
      );
    }
  }

  private extractImportsAST(rootNode: Parser.Node): ImportInfo[] {
    const imports: ImportInfo[] = [];

    for (const node of rootNode.children) {
      if (node.type === 'import_declaration') {
        let sourceArr: string[] = [];
        let isStatic = false;
        let isWildcard = false;

        // Traverse to find identifier or scoped_identifier
        for (const child of node.children) {
          if (child.type === 'static') isStatic = true;
          if (
            child.type === 'scoped_identifier' ||
            child.type === 'identifier'
          ) {
            sourceArr.push(child.text);
          }
          if (child.type === 'asterisk') isWildcard = true;
        }

        const source = sourceArr.join('.');
        if (source) {
          imports.push({
            source: isWildcard ? `${source}.*` : source,
            specifiers: isWildcard
              ? ['*']
              : [source.split('.').pop() || source],
            loc: {
              start: {
                line: node.startPosition.row + 1,
                column: node.startPosition.column,
              },
              end: {
                line: node.endPosition.row + 1,
                column: node.endPosition.column,
              },
            },
          });
        }
      }
    }

    return imports;
  }

  private extractExportsAST(rootNode: Parser.Node): ExportInfo[] {
    const exports: ExportInfo[] = [];

    for (const node of rootNode.children) {
      if (
        node.type === 'class_declaration' ||
        node.type === 'interface_declaration' ||
        node.type === 'enum_declaration'
      ) {
        // tree-sitter-java doesn't always use named fields reliably,
        // so we find the first identifier as the name
        const nameNode = node.children.find((c) => c.type === 'identifier');
        if (nameNode) {
          const modifiers = this.getModifiers(node);
          exports.push({
            name: nameNode.text,
            type: node.type === 'class_declaration' ? 'class' : 'interface',
            loc: {
              start: {
                line: node.startPosition.row + 1,
                column: node.startPosition.column,
              },
              end: {
                line: node.endPosition.row + 1,
                column: node.endPosition.column,
              },
            },
            visibility: modifiers.includes('public') ? 'public' : 'private',
          });

          this.extractSubExports(node, nameNode.text, exports);
        }
      }
    }

    return exports;
  }

  private getModifiers(node: Parser.Node): string[] {
    const modifiersNode = node.children.find((c) => c.type === 'modifiers');
    if (!modifiersNode) return [];
    return modifiersNode.children.map((c) => c.text);
  }

  private extractSubExports(
    parentNode: Parser.Node,
    parentName: string,
    exports: ExportInfo[]
  ): void {
    const bodyNode = parentNode.children.find((c) => c.type === 'class_body');
    if (!bodyNode) return;

    for (const node of bodyNode.children) {
      if (node.type === 'method_declaration') {
        const nameNode = node.children.find((c) => c.type === 'identifier');
        const modifiers = this.getModifiers(node);

        if (nameNode && modifiers.includes('public')) {
          exports.push({
            name: nameNode.text,
            type: 'function',
            parentClass: parentName,
            visibility: 'public',
            loc: {
              start: {
                line: node.startPosition.row + 1,
                column: node.startPosition.column,
              },
              end: {
                line: node.endPosition.row + 1,
                column: node.endPosition.column,
              },
            },
            parameters: this.extractParameters(node),
          });
        }
      }
    }
  }

  private extractParameters(node: Parser.Node): string[] {
    const paramsNode = node.children.find(
      (c) => c.type === 'formal_parameters'
    );
    if (!paramsNode) return [];

    return paramsNode.children
      .filter((c) => c.type === 'formal_parameter')
      .map((c) => {
        const idNode = c.children.find((child) => child.type === 'identifier');
        return idNode ? idNode.text : 'unknown';
      });
  }

  getNamingConventions(): NamingConvention {
    return {
      variablePattern: /^[a-z][a-zA-Z0-9]*$/,
      functionPattern: /^[a-z][a-zA-Z0-9]*$/,
      classPattern: /^[A-Z][a-zA-Z0-9]*$/,
      constantPattern: /^[A-Z][A-Z0-9_]*$/,
      exceptions: ['main', 'serialVersionUID'],
    };
  }

  canHandle(filePath: string): boolean {
    return filePath.toLowerCase().endsWith('.java');
  }
}
