import { describe, it, expect, beforeAll } from 'vitest';
import { JavaParser } from '../parsers/java-parser';
import { Language } from '../types/language';
import { initializeParsers } from '../parsers/parser-factory';

describe('JavaParser', () => {
  let parser: JavaParser;

  beforeAll(async () => {
    await initializeParsers();
    parser = new JavaParser();
    await parser.initialize();
  });

  it('should have correct language and extensions', () => {
    expect(parser.language).toBe(Language.Java);
    expect(parser.extensions).toContain('.java');
  });

  it('should handle .java files', () => {
    expect(parser.canHandle('test.java')).toBe(true);
    expect(parser.canHandle('test.ts')).toBe(false);
  });

  it('should return Java naming conventions', () => {
    const conventions = parser.getNamingConventions();
    expect(conventions.classPattern.test('MyClass')).toBe(true);
    expect(conventions.functionPattern.test('myMethod')).toBe(true);
    expect(conventions.variablePattern.test('myVariable')).toBe(true);
    expect(conventions.constantPattern.test('MAX_VALUE')).toBe(true);
  });

  describe('Import Extraction', () => {
    it('should extract simple imports', () => {
      const code = 'import java.util.List;\nimport java.util.ArrayList;';
      const result = parser.parse(code, 'Test.java');
      expect(result.imports).toHaveLength(2);
      expect(result.imports[0].source).toBe('java.util.List');
      expect(result.imports[0].specifiers).toContain('List');
    });

    it('should handle wildcard imports', () => {
      const code = 'import java.util.*;';
      const result = parser.parse(code, 'Test.java');
      expect(result.imports).toHaveLength(1);
      expect(result.imports[0].source).toBe('java.util.*');
      expect(result.imports[0].specifiers).toContain('*');
    });

    it('should handle static imports', () => {
      const code =
        'import static java.lang.Math.PI;\nimport static java.lang.Math.*;';
      const result = parser.parse(code, 'Test.java');
      expect(result.imports).toHaveLength(2);
      expect(result.imports[0].source).toBe('java.lang.Math.PI');
      expect(result.imports[1].source).toBe('java.lang.Math.*');
    });
  });

  describe('Export Extraction', () => {
    it('should extract public classes', () => {
      const code = 'public class MyClass {\n}';
      const result = parser.parse(code, 'MyClass.java');
      const classExport = result.exports.find((e) => e.name === 'MyClass');
      expect(classExport).toBeDefined();
      expect(classExport?.type).toBe('class');
      expect(classExport?.visibility).toBe('public');
    });

    it('should extract interfaces', () => {
      const code = 'public interface MyInterface {\n}';
      const result = parser.parse(code, 'MyInterface.java');
      const interfaceExport = result.exports.find(
        (e) => e.name === 'MyInterface'
      );
      expect(interfaceExport).toBeDefined();
      expect(interfaceExport?.type).toBe('interface');
    });

    it('should extract public methods', () => {
      const code = `
        public class MyService {
          public void doSomething(String input, int count) {
          }
          private void internal() {}
        }
      `;
      const result = parser.parse(code, 'MyService.java');
      const methodExport = result.exports.find((e) => e.name === 'doSomething');
      expect(methodExport).toBeDefined();
      expect(methodExport?.type).toBe('function');
      expect(methodExport?.parentClass).toBe('MyService');
      expect(methodExport?.parameters).toContain('input');
      expect(methodExport?.parameters).toContain('count');

      const privateMethod = result.exports.find((e) => e.name === 'internal');
      expect(privateMethod).toBeUndefined();
    });
  });

  it('should parse real-world Java code', () => {
    const code = `
      package com.example;
      import java.util.List;
      import java.util.ArrayList;

      /**
       * A sample service
       */
      public class UserService {
        private List<String> users = new ArrayList<>();

        public void addUser(String name) {
          users.add(name);
        }

        public List<String> getUsers() {
          return users;
        }
      }
    `;
    const result = parser.parse(code, 'UserService.java');
    expect(result.language).toBe(Language.Java);
    expect(result.imports).toHaveLength(2);
    expect(result.exports.map((e) => e.name)).toContain('UserService');
    expect(result.exports.map((e) => e.name)).toContain('addUser');
    expect(result.exports.map((e) => e.name)).toContain('getUsers');
  });
});
