/**
 * Extract JSON from mixed output (CLI may output console messages before JSON)
 */
export function extractJSON(output: string): string {
  // Try to find JSON object start
  const jsonStart = output.lastIndexOf('{');
  if (jsonStart === -1) {
    return output; // No JSON found, return as-is
  }

  // Find matching closing brace
  let depth = 0;
  let jsonEnd = -1;
  for (let i = jsonStart; i < output.length; i++) {
    if (output[i] === '{') depth++;
    if (output[i] === '}') depth--;
    if (depth === 0) {
      jsonEnd = i + 1;
      break;
    }
  }

  if (jsonEnd === -1) {
    return output; // Malformed JSON, return as-is
  }

  return output.slice(jsonStart, jsonEnd);
}
