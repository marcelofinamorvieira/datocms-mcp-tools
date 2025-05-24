#!/usr/bin/env node
/**
 * Script to help automate handler migration to add proper types
 * This script analyzes handlers and suggests type improvements
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MigrationSuggestion {
  file: string;
  line: number;
  issue: string;
  suggestion: string;
}

/**
 * Analyze a handler file for type safety issues
 */
function analyzeHandlerFile(filePath: string): MigrationSuggestion[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const suggestions: MigrationSuggestion[] = [];
  // const fileName = path.basename(filePath);

  lines.forEach((line, index) => {
    // Check for 'any' type usage
    if (line.includes(': any') || line.includes('as any')) {
      suggestions.push({
        file: filePath,
        line: index + 1,
        issue: 'Uses "any" type',
        suggestion: 'Replace with specific type or type guard'
      });
    }

    // Check for missing type annotations in clientAction
    if (line.includes('clientAction: async (client, args)')) {
      suggestions.push({
        file: filePath,
        line: index + 1,
        issue: 'Missing type annotations in clientAction',
        suggestion: 'Add explicit types: clientAction: async (client: DatoCMSClient, args: TypedArgs, context: RequestContext)'
      });
    }

    // Check for untyped success messages
    if (line.includes('successMessage: (result)') || line.includes('successMessage: (item)')) {
      suggestions.push({
        file: filePath,
        line: index + 1,
        issue: 'Untyped parameter in successMessage',
        suggestion: 'Add type annotation: successMessage: (result: SimpleSchemaTypes.SomeType) =>'
      });
    }

    // Check for missing return type
    if (line.includes('clientAction: async') && !line.includes('Promise<')) {
      const nextLines = lines.slice(index, index + 5).join(' ');
      if (!nextLines.includes('Promise<')) {
        suggestions.push({
          file: filePath,
          line: index + 1,
          issue: 'Missing return type annotation',
          suggestion: 'Add return type: ): Promise<SimpleSchemaTypes.SomeType> => {'
        });
      }
    }

    // Check for missing imports
    if (index === 0 && !content.includes('import type { SimpleSchemaTypes }')) {
      suggestions.push({
        file: filePath,
        line: 1,
        issue: 'Missing DatoCMS type imports',
        suggestion: 'Add: import type { SimpleSchemaTypes } from "@datocms/cma-client-node";'
      });
    }
  });

  return suggestions;
}

/**
 * Find all handler files in the project
 */
function findHandlerFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentPath: string) {
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(itemPath);
      } else if (stat.isFile() && item.endsWith('Handler.ts') && !item.includes('_typed')) {
        files.push(itemPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

/**
 * Main function
 */
function main() {
  const projectRoot = path.join(__dirname, '..');
  const toolsDir = path.join(projectRoot, 'src', 'tools');
  
  console.log('🔍 Analyzing handlers for type safety improvements...\n');
  
  const handlerFiles = findHandlerFiles(toolsDir);
  console.log(`Found ${handlerFiles.length} handler files\n`);
  
  const allSuggestions: MigrationSuggestion[] = [];
  
  handlerFiles.forEach(file => {
    const suggestions = analyzeHandlerFile(file);
    if (suggestions.length > 0) {
      allSuggestions.push(...suggestions);
    }
  });
  
  // Group suggestions by file
  const suggestionsByFile = allSuggestions.reduce((acc, suggestion) => {
    const relativePath = path.relative(projectRoot, suggestion.file);
    if (!acc[relativePath]) {
      acc[relativePath] = [];
    }
    acc[relativePath].push(suggestion);
    return acc;
  }, {} as Record<string, MigrationSuggestion[]>);
  
  // Print suggestions
  Object.entries(suggestionsByFile).forEach(([file, suggestions]) => {
    console.log(`📄 ${file}`);
    suggestions.forEach(s => {
      console.log(`  Line ${s.line}: ${s.issue}`);
      console.log(`    💡 ${s.suggestion}`);
    });
    console.log('');
  });
  
  console.log(`\n📊 Summary: Found ${allSuggestions.length} type safety improvements needed across ${Object.keys(suggestionsByFile).length} files`);
  
  // Generate migration priority list
  const priorityFiles = Object.entries(suggestionsByFile)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 10);
    
  console.log('\n🎯 Top 10 files to migrate first (by number of issues):');
  priorityFiles.forEach(([file, suggestions], index) => {
    console.log(`${index + 1}. ${file} (${suggestions.length} issues)`);
  });
}

// Run the script
main();