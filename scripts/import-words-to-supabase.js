#!/usr/bin/env node

/**
 * Script to import vocabulary words from JSON files to Supabase
 * 
 * Usage:
 *   node scripts/import-words-to-supabase.js
 * 
 * This script reads:
 *   - src/data/fallbackVocabulary.ro.json
 *   - src/data/fallbackUrbanisme.ro.json
 *   - src/data/fallbackRegionalisme.ro.json
 * 
 * And generates SQL INSERT statements for the cuvinteziCuvinte table
 */

const fs = require('fs');
const path = require('path');

// Helper function to escape SQL strings
function escapeSqlString(str) {
  if (!str) return 'NULL';
  return "'" + str.replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

// Helper function to convert array to JSONB
function arrayToJsonb(arr) {
  if (!arr || !Array.isArray(arr)) return "'[]'::jsonb";
  return escapeSqlString(JSON.stringify(arr));
}

// Read and parse JSON file
function readJsonFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return [];
  }
}

// Generate SQL INSERT statement for a word
function generateInsertStatement(word) {
  const id = escapeSqlString(word.id);
  const title = escapeSqlString(word.title);
  const grammar_block = escapeSqlString(word.grammar_block || null);
  const definition = escapeSqlString(word.definition);
  const image = escapeSqlString(word.image || null);
  const tags = arrayToJsonb(word.tags);
  const examples = arrayToJsonb(word.examples);

  return `INSERT INTO public."cuvinteziCuvinte" (
  id,
  title,
  grammar_block,
  definition,
  image,
  tags,
  examples
) VALUES (
  ${id},
  ${title},
  ${grammar_block},
  ${definition},
  ${image},
  ${tags},
  ${examples}
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  grammar_block = EXCLUDED.grammar_block,
  definition = EXCLUDED.definition,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  examples = EXCLUDED.examples,
  updated_at = now()`;
}

// Main function
function main() {
  console.log('📚 Starting vocabulary import script...\n');

  // Read all JSON files
  const vocabulary = readJsonFile('src/data/fallbackVocabulary.ro.json');
  const urbanisme = readJsonFile('src/data/fallbackUrbanisme.ro.json');
  const regionalisme = readJsonFile('src/data/fallbackRegionalisme.ro.json');

  console.log(`📖 Found ${vocabulary.length} vocabulary words`);
  console.log(`🏙️  Found ${urbanisme.length} urbanisme words`);
  console.log(`🗺️  Found ${regionalisme.length} regionalisme words`);
  console.log(`📊 Total: ${vocabulary.length + urbanisme.length + regionalisme.length} words\n`);

  // Combine all words
  const allWords = [...vocabulary, ...urbanisme, ...regionalisme];

  // Generate SQL statements
  const sqlStatements = allWords.map(word => generateInsertStatement(word));

  // Create the SQL file
  const sqlContent = `-- Auto-generated SQL import script
-- Generated from: fallbackVocabulary.ro.json, fallbackUrbanisme.ro.json, fallbackRegionalisme.ro.json
-- Total words: ${allWords.length}
-- Generated at: ${new Date().toISOString()}

-- Begin transaction
BEGIN;

${sqlStatements.join(';\n\n')};

-- Commit transaction
COMMIT;

-- Verify import
SELECT COUNT(*) as total_words FROM public."cuvinteziCuvinte";
SELECT COUNT(*) as vocabulary_words FROM public."cuvinteziCuvinte" WHERE id LIKE '%-%' AND id NOT LIKE 'urb-%' AND id NOT LIKE 'reg-%';
SELECT COUNT(*) as urbanisme_words FROM public."cuvinteziCuvinte" WHERE id LIKE 'urb-%';
SELECT COUNT(*) as regionalisme_words FROM public."cuvinteziCuvinte" WHERE id LIKE 'reg-%';
`;

  // Write SQL file
  const outputPath = path.join(__dirname, '..', 'supabase_scripts', 'supabase_cuvinte_import.sql');
  fs.writeFileSync(outputPath, sqlContent, 'utf8');

  console.log(`✅ Generated SQL import script: ${outputPath}`);
  console.log(`\n📝 Next steps:`);
  console.log(`   1. Open Supabase Dashboard → SQL Editor`);
  console.log(`   2. Copy and paste the contents of: supabase_scripts/supabase_cuvinte_import.sql`);
  console.log(`   3. Run the script`);
  console.log(`   4. Verify the import with the SELECT statements at the end\n`);
}

// Run the script
main();

