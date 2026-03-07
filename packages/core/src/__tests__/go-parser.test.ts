import { describe, it, expect, beforeEach } from 'vitest';
import { GoParser } from '../parsers/go-parser';
import { Language } from '../types/language';

describe('GoParser', () => {
  let parser: GoParser;

  beforeEach(async () => {
    parser = new GoParser();
    await parser.initialize();
  });

  it('should identify Go language and extensions', () => {
    expect(parser.language).toBe(Language.Go);
    expect(parser.extensions).toContain('.go');
    expect(parser.canHandle('test.go')).toBe(true);
    expect(parser.canHandle('test.js')).toBe(false);
  });

  it('should extract imports from single and block declarations', () => {
    const code = `
      package main
      import "fmt"
      import (
        "os"
        "net/http"
      )
    `;
    const result = parser.parse(code, 'test.go');
    const sources = result.imports.map((i) => i.source);
    expect(sources).toContain('fmt');
    expect(sources).toContain('os');
    expect(sources).toContain('net/http');
  });

  it('should extract exported functions and their parameters', () => {
    const code = `
      package test
      func ExportedFunc(a string, b int) error { return nil }
      func internalFunc() {}
    `;
    const result = parser.parse(code, 'test.go');
    const exports = result.exports.filter((e) => e.type === 'function');
    expect(exports.map((e) => e.name)).toContain('ExportedFunc');
    expect(exports.map((e) => e.name)).not.toContain('internalFunc');

    const func = exports.find((e) => e.name === 'ExportedFunc');
    expect(func?.parameters).toContain('a');
    expect(func?.parameters).toContain('b');
  });

  it('should extract exported types (structs and interfaces)', () => {
    const code = `
      package test
      type MyStruct struct { Field int }
      type MyInterface interface { Method() }
      type internalStruct struct {}
    `;
    const result = parser.parse(code, 'test.go');
    const names = result.exports.map((e) => e.name);
    expect(names).toContain('MyStruct');
    expect(names).toContain('MyInterface');
    expect(names).not.toContain('internalStruct');

    expect(result.exports.find((e) => e.name === 'MyStruct')?.type).toBe(
      'class'
    );
    expect(result.exports.find((e) => e.name === 'MyInterface')?.type).toBe(
      'interface'
    );
  });

  it('should extract exported variables and constants', () => {
    const code = `
      package test
      var ExportedVar = 1
      const ExportedConst = 2
      var internalVar = 3
    `;
    const result = parser.parse(code, 'test.go');
    const names = result.exports.map((e) => e.name);
    expect(names).toContain('ExportedVar');
    expect(names).toContain('ExportedConst');
    expect(names).not.toContain('internalVar');
  });

  it('should follow Go naming conventions', () => {
    const conventions = parser.getNamingConventions();
    expect('MyFunc').toMatch(conventions.functionPattern);
    expect('myFunc').toMatch(conventions.functionPattern);
    expect('MyVar').toMatch(conventions.variablePattern);
    expect('my_var').not.toMatch(conventions.variablePattern);
  });
});
