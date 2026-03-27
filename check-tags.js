import fs from 'fs';

const content = fs.readFileSync('src/app/(dashboard)/dashboard/purchases/page.tsx', 'utf8');

const tags = [];
const regex = /<(\/?[a-zA-Z0-9]+)(\s|>)/g;
let match;

while ((match = regex.exec(content)) !== null) {
  const tag = match[1];
  if (tag.startsWith('/')) {
    const opening = tag.substring(1);
    if (tags.length === 0) {
      console.log(`Error: Closing tag ${tag} found with no open tags`);
    } else {
      const top = tags.pop();
      if (top !== opening) {
        console.log(`Error: Mismatched tags. Expected </${top}>, found <${tag}> near: ${content.substring(match.index - 50, match.index + 50).replace(/\n/g, ' ')}`);
        // Put back the opening tag to try to recover
        // tags.push(top);
      }
    }
  } else if (!content.substring(match.index, content.indexOf('>', match.index) + 1).endsWith('/>')) {
    // Exclude self-closing tags
    // Some components might not be self-closing but we treat them as such if they don't have children in this logic?
    // Actually, let's keep it simple: if it's not self-closing, push it.
    const fullTag = content.substring(match.index, content.indexOf('>', match.index) + 1);
    if (!fullTag.endsWith('/>') && !['Input', 'Button', 'Plus', 'Trash2', 'TrendingUp', 'TrendingDown', 'AlertTriangle', 'ChevronRight', 'Calculator', 'Calendar', 'User', 'Check', 'AlertCircle', 'ArrowRight', 'PurchaseHistory', 'EmptyProductState', 'ComboboxInput', 'ComboboxEmpty'].includes(tag)) {
       tags.push(tag);
    }
  }
}

console.log('Unclosed tags:', tags);
