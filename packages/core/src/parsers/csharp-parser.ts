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
 * C# Parser implementation using tree-sitter
 */
export class CSharpParser implements LanguageParser {
  readonly language = Language.CSharp;
  readonly extensions = ['.cs'];
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
          'node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-c_sharp.wasm'
        ),
        path.join(
          __dirname,
          '../../node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-c_sharp.wasm'
        ),
        path.join(
          __dirname,
          '../../../node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-c_sharp.wasm'
        ),
        path.join(
          __dirname,
          '../../../../node_modules/@unit-mesh/treesitter-artifacts/wasm/tree-sitter-c_sharp.wasm'
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
          `C# WASM not found. Tried paths: ${possiblePaths.join(', ')}`
        );
        return;
      }

      const CSharp = await Parser.Language.load(wasmPath);
      this.parser.setLanguage(CSharp);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize tree-sitter-c-sharp:', error);
    }
  }

  parse(code: string, filePath: string): ParseResult {
    if (!this.initialized || !this.parser) {
      throw new ParseError(
        `CSharpParser not initialized for ${filePath}`,
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
        language: Language.CSharp,
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

    const findUsings = (node: Parser.Node) => {
      if (node.type === 'using_directive') {
        const nameNode =
          node.childForFieldName('name') ||
          node.children.find(
            (c) => c.type === 'qualified_name' || c.type === 'identifier'
          );
        if (nameNode) {
          const aliasNode = node.childForFieldName('alias');
          imports.push({
            source: nameNode.text,
            specifiers: aliasNode
              ? [aliasNode.text]
              : [nameNode.text.split('.').pop() || nameNode.text],
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
        if (child) findUsings(child);
      }
    };

    findUsings(rootNode);
    return imports;
  }

  private extractExportsAST(rootNode: Parser.Node): ExportInfo[] {
    const exports: ExportInfo[] = [];

    const traverse = (
      node: Parser.Node,
      currentNamespace?: string,
      currentClass?: string
    ) => {
      let nextNamespace = currentNamespace;
      let nextClass = currentClass;

      if (
        node.type === 'namespace_declaration' ||
        node.type === 'file_scoped_namespace_declaration'
      ) {
        const nameNode =
          node.childForFieldName('name') ||
          node.children.find(
            (c) => c.type === 'identifier' || c.type === 'qualified_name'
          );
        if (nameNode) {
          nextNamespace = currentNamespace
            ? `${currentNamespace}.${nameNode.text}`
            : nameNode.text;
        }
      } else if (
        node.type === 'class_declaration' ||
        node.type === 'interface_declaration' ||
        node.type === 'enum_declaration' ||
        node.type === 'struct_declaration' ||
        node.type === 'record_declaration'
      ) {
        const nameNode =
          node.childForFieldName('name') ||
          node.children.find((c) => c.type === 'identifier');
        if (nameNode) {
          const modifiers = this.getModifiers(node);
          const isPublic =
            modifiers.includes('public') || modifiers.includes('protected');

          if (isPublic) {
            const type = node.type.replace('_declaration', '') as any;
            const fullName = nextClass
              ? `${nextClass}.${nameNode.text}`
              : nextNamespace
                ? `${nextNamespace}.${nameNode.text}`
                : nameNode.text;

            exports.push({
              name: fullName,
              type: type === 'record' ? 'class' : type,
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
              visibility: modifiers.includes('public') ? 'public' : 'protected',
            });
            nextClass = fullName;
          }
        }
      } else if (
        node.type === 'method_declaration' ||
        node.type === 'property_declaration'
      ) {
        const nameNode =
          node.childForFieldName('name') ||
          node.children.find((c) => c.type === 'identifier');
        if (nameNode) {
          const modifiers = this.getModifiers(node);
          const isPublic =
            modifiers.includes('public') || modifiers.includes('protected');

          if (isPublic) {
            exports.push({
              name: nameNode.text,
              type:
                node.type === 'method_declaration'
                  ? 'function'
                  : ('property' as any),
              parentClass: currentClass,
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
              visibility: modifiers.includes('public') ? 'public' : 'protected',
              parameters:
                node.type === 'method_declaration'
                  ? this.extractParameters(node)
                  : undefined,
            });
          }
        }
      }

      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child) traverse(child, nextNamespace, nextClass);
      }
    };

    traverse(rootNode);
    return exports;
  }

  private getModifiers(node: Parser.Node): string[] {
    const modifiers: string[] = [];
    for (const child of node.children) {
      if (child.type === 'modifier') {
        modifiers.push(child.text);
      }
    }
    return modifiers;
  }

  private extractParameters(node: Parser.Node): string[] {
    const params: string[] = [];
    const parameterList =
      node.childForFieldName('parameters') ||
      node.children.find((c) => c.type === 'parameter_list');
    if (parameterList) {
      for (const param of parameterList.children) {
        if (param.type === 'parameter') {
          const nameNode =
            param.childForFieldName('name') ||
            param.children.find((c) => c.type === 'identifier');
          if (nameNode) {
            params.push(nameNode.text);
          }
        }
      }
    }
    return params;
  }

  getNamingConventions(): NamingConvention {
    return {
      variablePattern: /^[a-z][a-zA-Z0-9]*$/,
      functionPattern: /^[A-Z][a-zA-Z0-9]*$/,
      classPattern: /^[A-Z][a-zA-Z0-9]*$/,
      constantPattern: /^[A-Z][a-zA-Z0-9_]*$/,
    };
  }

  canHandle(filePath: string): boolean {
    return filePath.toLowerCase().endsWith('.cs');
  }
}
