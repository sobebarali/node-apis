const { generateCodeWithParsedTypes } = require('./dist/services/two-phase-generator.service');
const path = require('path');

async function regenerateBookServices() {
  console.log('🔄 Regenerating book services with enhanced types...\n');
  
  try {
    const moduleName = 'book';
    const modulePath = path.join(__dirname, 'src/apis/book');
    const apiType = { type: 'crud' };
    
    const result = await generateCodeWithParsedTypes({
      moduleName,
      modulePath,
      apiType,
      appendMode: false
    });
    
    console.log('✅ Services regenerated successfully!');
    console.log('📄 Generated files:', result.map(f => f.filePath));
    
  } catch (error) {
    console.error('❌ Failed to regenerate services:', error);
  }
}

regenerateBookServices();
