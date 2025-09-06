#!/usr/bin/env node

/**
 * CLI entry point for the API Generator
 */

const { main } = require('../dist/index.js');

// Run the main CLI function
main().catch((error) => {
  console.error('An unexpected error occurred:', error.message);
  process.exit(1);
});
