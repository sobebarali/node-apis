const fs = require('fs');

// Read the create.book.ts file and debug the parsing
const filePath = './src/apis/book/types/create.book.ts';
const content = fs.readFileSync(filePath, 'utf-8');

console.log('📄 File content:');
console.log(content);
console.log('\n' + '='.repeat(50));

// Extract the interface body
const interfaceMatch = content.match(/export type typePayload = \{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s);
if (interfaceMatch) {
  const interfaceBody = interfaceMatch[1];
  console.log('🔍 Interface body:');
  console.log(interfaceBody);
  console.log('\n' + '='.repeat(50));
  
  // Parse each line
  const lines = interfaceBody.split('\n');
  console.log('📋 Lines to parse:');
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    console.log(`${index}: "${trimmed}"`);
    
    if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
      const fieldMatch = trimmed.match(/^(\w+)(\?)?:\s*([^;]+);?/);
      if (fieldMatch) {
        const [, name, optional, type] = fieldMatch;
        console.log(`  ✅ Matched: name="${name}", optional="${optional}", type="${type}"`);
      } else {
        console.log(`  ❌ No match for: "${trimmed}"`);
      }
    }
  });
}
