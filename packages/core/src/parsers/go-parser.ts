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
 * Go Parser implementation using tree-sitter
 */
export class GoParser implements LanguageParser {
  readonly language = Language.Go;
  readonly extensions = ['.go'];
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

      const possiblePaths = [
        path.join(
          process.cwd(),
          'node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-go.wasm'
        ),
        path.join(
          __dirname,
          '../../node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-go.wasm'
        ),
        path.join(
          __dirname,
          '../../../node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-go.wasm'
        ),
        path.join(
          __dirname,
          '../../../../node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-go.wasm'
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
          `Go WASM not found. Tried paths: ${possiblePaths.join(', ')}`
        );
        return;
      }

      const Go = await Parser.Language.load(wasmPath);
      this.parser.setLanguage(Go);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize tree-sitter-go:', error);
    }
  }

  parse(code: string, filePath: string): ParseResult {
    if (!this.initialized || !this.parser) {
      throw new ParseError(
        `GoParser not initialized for ${filePath}`,
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
        language: Language.Go,
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

    const findImports = (node: Parser.Node) => {
      if (node.type === 'import_spec') {
        const pathNode = node.children.find(
          (c) => c.type === 'interpreted_string_literal'
        );
        if (pathNode) {
          const source = pathNode.text.replace(/"/g, '');
          imports.push({
            source,
            specifiers: [source.split('/').pop() || source],
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

      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) findImports(child);
      }
    };

    findImports(rootNode);
    return imports;
  }

  private extractExportsAST(rootNode: Parser.Node): ExportInfo[] {
    const exports: ExportInfo[] = [];

    const isExported = (name: string) => {
      return /^[A-Z]/.test(name);
    };

    const traverse = (node: Parser.Node) => {
      if (
        node.type === 'function_declaration' ||
        node.type === 'method_declaration'
      ) {
        const nameNode =
          node.childForFieldName('name') ||
          node.children.find((c) => c.type === 'identifier');
        if (nameNode && isExported(nameNode.text)) {
          exports.push({
            name: nameNode.text,
            type: 'function',
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
            visibility: 'public',
            parameters: this.extractParameters(node),
          });
        }
      } else if (node.type === 'type_spec') {
        const nameNode =
          node.childForFieldName('name') ||
          node.children.find((c) => c.type === 'type_identifier');
        if (nameNode && isExported(nameNode.text)) {
          const type = node.children.some((c) => c.type === 'struct_type')
            ? 'class'
            : 'interface';
          exports.push({
            name: nameNode.text,
            type: type as any,
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
            visibility: 'public',
          });
        }
      } else if (node.type === 'var_spec' || node.type === 'const_spec') {
        // var ( a, B = 1, 2 ) -> multiple identifiers possible
        const identifiers = node.children.filter(
          (c) => c.type === 'identifier'
        );
        for (const idNode of identifiers) {
          if (isExported(idNode.text)) {
            exports.push({
              name: idNode.text,
              type: 'variable',
              loc: {
                start: {
                  line: idNode.startPosition.row + 1,
                  column: idNode.startPosition.column,
                },
                end: {
                  line: idNode.endPosition.row + 1,
                  column: idNode.endPosition.column,
                },
              },
              visibility: 'public',
            });
          }
        }
      }

      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) traverse(child);
      }
    };

    traverse(rootNode);
    return exports;
  }

  private extractParameters(node: Parser.Node): string[] {
    const params: string[] = [];
    const parameterList =
      node.childForFieldName('parameters') ||
      node.children.find((c) => c.type === 'parameter_list');
    if (parameterList) {
      for (const param of parameterList.children) {
        if (param.type === 'parameter_declaration') {
          const names = param.children.filter((c) => c.type === 'identifier');
          names.forEach((n) => params.push(n.text));
        }
      }
    }
    return params;
  }

  getNamingConventions(): NamingConvention {
    return {
      variablePattern: /^[a-zA-Z][a-zA-Z0-9]*$/,
      functionPattern: /^[a-zA-Z][a-zA-Z0-9]*$/,
      classPattern: /^[a-zA-Z][a-zA-Z0-9]*$/,
      constantPattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
    };
  }

  canHandle(filePath: string): boolean {
    return filePath.toLowerCase().endsWith('.go');
  }
}
