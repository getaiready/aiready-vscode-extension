import { describe, it, expect, beforeEach } from 'vitest';
import { CSharpParser } from '../parsers/csharp-parser';
import { Language } from '../types/language';

describe('CSharpParser', () => {
  let parser: CSharpParser;

  beforeEach(async () => {
    parser = new CSharpParser();
    await parser.initialize();
  });

  it('should identify C# language and extensions', () => {
    expect(parser.language).toBe(Language.CSharp);
    expect(parser.extensions).toContain('.cs');
    expect(parser.canHandle('test.cs')).toBe(true);
    expect(parser.canHandle('test.java')).toBe(false);
  });

  it('should extract namespaces and classes', () => {
    const code = `
      namespace MyNamespace.SubNamespace {
        public class MyClass {
        }
      }
    `;
    const result = parser.parse(code, 'test.cs');
    expect(result.exports).toContainEqual(
      expect.objectContaining({
        name: 'MyNamespace.SubNamespace.MyClass',
        type: 'class',
      })
    );
  });

  it('should extract using directives', () => {
    const code = `
      using System;
      using System.Collections.Generic;
      using Net = System.Net;
      using static System.Math;
      
      namespace Test {
        public class C {}
      }
    `;
    const result = parser.parse(code, 'test.cs');
    const sources = result.imports.map((i) => i.source);
    expect(sources).toContain('System');
    expect(sources).toContain('System.Collections.Generic');
    expect(sources).toContain('System.Net');
    expect(sources).toContain('System.Math');
  });

  it('should extract methods and properties with visibility', () => {
    const code = `
      public class MyClass {
        public void PublicMethod() {}
        protected string ProtectedProperty { get; set; }
        private void PrivateMethod() {}
      }
    `;
    const result = parser.parse(code, 'test.cs');
    const exports = result.exports.map((e) => e.name);
    expect(exports).toContain('PublicMethod');
    expect(exports).toContain('ProtectedProperty');
    expect(exports).not.toContain('PrivateMethod');

    const publicMethod = result.exports.find((e) => e.name === 'PublicMethod');
    expect(publicMethod?.visibility).toBe('public');

    const protectedProp = result.exports.find(
      (e) => e.name === 'ProtectedProperty'
    );
    expect(protectedProp?.visibility).toBe('protected');
  });

  it('should handle file-scoped namespaces (C# 10+)', () => {
    const code = `
      namespace MyNamespace;
      public class MyClass {}
    `;
    const result = parser.parse(code, 'test.cs');
    expect(result.exports).toContainEqual(
      expect.objectContaining({
        name: 'MyNamespace.MyClass',
      })
    );
  });

  it('should extract parameters from methods', () => {
    const code = `
      public class MyClass {
        public void MyMethod(string name, int age) {}
      }
    `;
    const result = parser.parse(code, 'test.cs');
    const method = result.exports.find((e) => e.name === 'MyMethod');
    expect(method?.parameters).toContain('name');
    expect(method?.parameters).toContain('age');
  });

  it('should follow C# naming conventions', () => {
    const conventions = parser.getNamingConventions();
    expect('MyClass').toMatch(conventions.classPattern);
    expect('MyMethod').toMatch(conventions.functionPattern);
    expect('myVariable').toMatch(conventions.variablePattern);
    expect('MY_CONSTANT').toMatch(conventions.constantPattern);
  });
});
