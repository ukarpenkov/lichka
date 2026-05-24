#!/usr/bin/env node
/**
 * Removes AI co-author trailers from git commit messages.
 * Used by .githooks/commit-msg
 */
import fs from 'node:fs';

const commitMsgFile = process.argv[2];
if (!commitMsgFile) {
  process.exit(0);
}

const original = fs.readFileSync(commitMsgFile, 'utf8');
const filtered = original
  .split(/\r?\n/)
  .filter((line) => {
    if (/^Co-Authored-By:\s*.+(Claude|anthropic)/i.test(line)) return false;
    if (/Generated with Claude Code/i.test(line)) return false;
    if (/🤖\s*Generated with/i.test(line)) return false;
    return true;
  });

while (filtered.length > 0 && filtered[filtered.length - 1].trim() === '') {
  filtered.pop();
}

const next = filtered.length === 0 ? '' : `${filtered.join('\n')}\n`;
if (next !== original) {
  fs.writeFileSync(commitMsgFile, next, 'utf8');
}
