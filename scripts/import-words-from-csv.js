#!/usr/bin/env node

/**
 * Script to import words from a CSV file into Supabase cuvinteziCuvinte table
 * 
 * Usage:
 *   node scripts/import-words-from-csv.js <CSV_FILE_PATH>
 * 
 * CSV format (with header row):
 *   title,grammar_block,description,tags
 * 
 * Tags column is optional. If provided, tags should match existing tags in cuvinteziTags table (case-insensitive).
 * Multiple tags can be separated by commas.
 * 
 * Example:
 *   node scripts/import-words-from-csv.js words.csv
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase configuration');
  console.error('   Please set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or EXPO_PUBLIC_SUPABASE_ANON_KEY) in .env');
  process.exit(1);
}

// Initialize Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Normalize Romanian diacritics to ASCII equivalents
 * Converts: ăâîșțĂÂÎȘȚ -> aaisAIS
 */
function normalizeDiacritics(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/Ă/g, 'A')
    .replace(/Â/g, 'A')
    .replace(/Î/g, 'I')
    .replace(/Ș/g, 'S')
    .replace(/Ț/g, 'T');
}

/**
 * Generate slug from title (similar to SQL function)
 */
function generateSlug(title) {
  const normalized = normalizeDiacritics(title.trim());
  const slug = normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  return slug;
}

/**
 * Generate image URL with seed based on word title
 */
function generateImageUrl(title) {
  const seed = generateSlug(title).replace(/-/g, '-');
  return `https://picsum.photos/seed/${seed}/800/600`;
}

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }
  
  // Parse header
  const header = lines[0].split(',').map(h => h.trim());
  const expectedHeaders = ['title', 'grammar_block', 'description'];
  
  // Check if headers match (case-insensitive)
  const headerLower = header.map(h => h.toLowerCase());
  const hasAllHeaders = expectedHeaders.every(h => headerLower.includes(h));
  
  if (!hasAllHeaders) {
    throw new Error(`CSV must have columns: ${expectedHeaders.join(', ')} (tags is optional)`);
  }
  
  // Find column indices
  const titleIdx = headerLower.indexOf('title');
  const grammarIdx = headerLower.indexOf('grammar_block');
  const descIdx = headerLower.indexOf('description');
  const tagsIdx = headerLower.indexOf('tags'); // Optional column
  
  // Parse data rows
  const words = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing (handles quoted fields)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add last value
    
    if (values.length >= 3) {
      const title = values[titleIdx]?.replace(/^"|"$/g, '') || '';
      const grammar_block = values[grammarIdx]?.replace(/^"|"$/g, '') || '';
      const description = values[descIdx]?.replace(/^"|"$/g, '') || '';
      const tags = tagsIdx >= 0 ? (values[tagsIdx]?.replace(/^"|"$/g, '') || '').trim() : '';
      
      if (title && description) {
        // Parse tags (can be comma-separated or single value)
        const tagList = tags 
          ? tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
          : [];
        
        words.push({
          title: title.trim(),
          grammar_block: grammar_block.trim(),
          description: description.trim(),
          tags: tagList,
        });
      }
    }
  }
  
  return words;
}

/**
 * Find existing tags by label (case-insensitive)
 * Returns a map of tag label (lowercase) to tag id
 */
async function findExistingTags(tagLabels) {
  if (!tagLabels || tagLabels.length === 0) {
    return new Map();
  }
  
  try {
    // Fetch all tags and match case-insensitively
    const { data: allTags, error } = await supabase
      .from('cuvinteziTags')
      .select('id, label, slug');
    
    if (error) {
      console.warn(`⚠️  Error fetching tags: ${error.message}`);
      return new Map();
    }
    
    if (!allTags || allTags.length === 0) {
      return new Map();
    }
    
    // Create a map of lowercase label to tag id
    const tagMap = new Map();
    const tagLabelsLower = tagLabels.map(t => t.toLowerCase());
    
    allTags.forEach(tag => {
      const tagLabelLower = tag.label.toLowerCase();
      if (tagLabelsLower.includes(tagLabelLower)) {
        tagMap.set(tagLabelLower, tag.id);
      }
    });
    
    return tagMap;
  } catch (error) {
    console.warn(`⚠️  Error finding tags: ${error.message}`);
    return new Map();
  }
}

/**
 * Create tag relationships for a word
 */
async function createTagRelationships(wordId, tagLabels) {
  if (!tagLabels || tagLabels.length === 0) {
    return { created: 0, skipped: 0 };
  }
  
  try {
    // Find existing tags
    const existingTags = await findExistingTags(tagLabels);
    
    if (existingTags.size === 0) {
      console.log(`   ⚠️  No matching tags found for: ${tagLabels.join(', ')}`);
      return { created: 0, skipped: tagLabels.length };
    }
    
    // Create relationships for matching tags
    const relationships = [];
    const matchedLabels = [];
    
    tagLabels.forEach(tagLabel => {
      const tagLabelLower = tagLabel.toLowerCase();
      const tagId = existingTags.get(tagLabelLower);
      if (tagId) {
        relationships.push({
          word_id: wordId,
          tag_id: tagId,
        });
        matchedLabels.push(tagLabel);
      }
    });
    
    if (relationships.length === 0) {
      return { created: 0, skipped: tagLabels.length };
    }
    
    // Insert relationships (using ON CONFLICT to handle duplicates)
    const { error } = await supabase
      .from('cuvinteziCuvinteTags')
      .upsert(relationships, { onConflict: 'word_id,tag_id' });
    
    if (error) {
      console.warn(`   ⚠️  Error creating tag relationships: ${error.message}`);
      return { created: 0, skipped: tagLabels.length };
    }
    
    const skipped = tagLabels.length - relationships.length;
    return { created: relationships.length, skipped };
  } catch (error) {
    console.warn(`   ⚠️  Error creating tag relationships: ${error.message}`);
    return { created: 0, skipped: tagLabels.length };
  }
}

/**
 * Check if a word already exists (by title or slug)
 */
async function wordExists(title, slug) {
  try {
    // Check by title (exact match)
    const { data: titleMatch, error: titleError } = await supabase
      .from('cuvinteziCuvinte')
      .select('id, title, slug')
      .eq('title', title)
      .limit(1);
    
    if (titleError) {
      console.warn(`⚠️  Error checking title: ${titleError.message}`);
    }
    
    if (titleMatch && titleMatch.length > 0) {
      return { exists: true, reason: 'title', existing: titleMatch[0] };
    }
    
    // Check by slug
    const { data: slugMatch, error: slugError } = await supabase
      .from('cuvinteziCuvinte')
      .select('id, title, slug')
      .eq('slug', slug)
      .limit(1);
    
    if (slugError) {
      console.warn(`⚠️  Error checking slug: ${slugError.message}`);
    }
    
    if (slugMatch && slugMatch.length > 0) {
      return { exists: true, reason: 'slug', existing: slugMatch[0] };
    }
    
    return { exists: false };
  } catch (error) {
    console.warn(`⚠️  Error checking for duplicates: ${error.message}`);
    return { exists: false }; // If check fails, proceed with insert (will fail if duplicate)
  }
}

/**
 * Import words to Supabase
 */
async function importWords(words) {
  console.log(`\n📚 Importing ${words.length} words to Supabase...\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const slug = generateSlug(word.title);
    const image = generateImageUrl(word.title);
    
    const wordData = {
      title: word.title,
      grammar_block: word.grammar_block || null,
      definition: word.description,
      image: image,
      examples: [], // Empty array
      slug: slug,
    };
    
    try {
      // Check for duplicates before inserting
      const duplicateCheck = await wordExists(word.title, slug);
      
      if (duplicateCheck.exists) {
        console.log(`⏭️  [${i + 1}/${words.length}] Skipped (duplicate ${duplicateCheck.reason}): "${word.title}"`);
        console.log(`   Existing word: ID ${duplicateCheck.existing.id}, slug: ${duplicateCheck.existing.slug}`);
        skippedCount++;
        continue;
      }
      
      // Insert the word
      const { data, error } = await supabase
        .from('cuvinteziCuvinte')
        .insert(wordData)
        .select('id, title, slug');
      
      if (error) {
        // Check if it's a duplicate error (race condition or constraint violation)
        if (error.code === '23505') {
          if (error.message.includes('slug')) {
            console.log(`⏭️  [${i + 1}/${words.length}] Skipped (duplicate slug): "${word.title}"`);
            skippedCount++;
          } else if (error.message.includes('title')) {
            console.log(`⏭️  [${i + 1}/${words.length}] Skipped (duplicate title): "${word.title}"`);
            skippedCount++;
          } else {
            console.log(`⏭️  [${i + 1}/${words.length}] Skipped (duplicate): "${word.title}"`);
            skippedCount++;
          }
        } else {
          throw error;
        }
      } else {
        const wordId = data[0]?.id;
        console.log(`✅ [${i + 1}/${words.length}] Imported: "${word.title}" (ID: ${wordId}, slug: ${data[0]?.slug || slug})`);
        
        // Create tag relationships if tags are provided
        if (word.tags && word.tags.length > 0) {
          const tagResult = await createTagRelationships(wordId, word.tags);
          if (tagResult.created > 0) {
            console.log(`   📌 Created ${tagResult.created} tag relationship(s)`);
          }
          if (tagResult.skipped > 0) {
            console.log(`   ⚠️  Skipped ${tagResult.skipped} tag(s) (not found in database)`);
          }
        }
        
        successCount++;
      }
    } catch (error) {
      console.error(`❌ [${i + 1}/${words.length}] Failed to import "${word.title}":`, error.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successfully imported: ${successCount}`);
  console.log(`   ⏭️  Skipped (duplicates): ${skippedCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📝 Total: ${words.length}\n`);
}

/**
 * Main function
 */
async function main() {
  const csvPath = process.argv[2];
  
  if (!csvPath) {
    console.error('❌ Error: CSV file path is required');
    console.error('\nUsage:');
    console.error('   node scripts/import-words-from-csv.js <CSV_FILE_PATH>');
    console.error('\nExample:');
    console.error('   node scripts/import-words-from-csv.js words.csv');
    process.exit(1);
  }
  
  const fullPath = path.isAbsolute(csvPath) ? csvPath : path.join(process.cwd(), csvPath);
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Error: File not found: ${fullPath}`);
    process.exit(1);
  }
  
  try {
    console.log(`📖 Reading CSV file: ${fullPath}`);
    const words = parseCSV(fullPath);
    
    if (words.length === 0) {
      console.error('❌ Error: No words found in CSV file');
      process.exit(1);
    }
    
    console.log(`✅ Found ${words.length} words in CSV`);
    await importWords(words);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

