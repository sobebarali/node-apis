const { parseTypePayload, generateFieldDestructuring, generateFieldObject } = require('./dist/services/type-parser.service');

async function testTypeParser() {
  console.log('🧪 Testing Enhanced Type Parser\n');
  
  try {
    // Test parsing the enhanced create.book.ts type file
    const result = await parseTypePayload('./src/apis/book/types/create.book.ts');
    
    console.log('📋 Parsed Type Payload:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔧 Generated Field Destructuring:');
    const destructuring = generateFieldDestructuring(result.fields);
    console.log(destructuring);
    
    console.log('\n🔧 Generated Field Object:');
    const fieldObject = generateFieldObject(result.fields);
    console.log(fieldObject);
    
    console.log('\n✅ Type parser test completed successfully!');
    
  } catch (error) {
    console.error('❌ Type parser test failed:', error);
  }
}

testTypeParser();
