import { ExpandableCodeBlock } from '@/components/guide/ExpandableCodeBlock';

export function createExpandableCodeBlock(
  code: string,
  language: string = 'bash',
  previewLength: number = 300
) {
  // This is a utility for generating the JSX structure
  // In actual usage, you'd import and use ExpandableCodeBlock directly
  return `<ExpandableCodeBlock code="${code.replace(/"/g, '\\"')}" language="${language}" previewLength={${previewLength}} />`;
}

export function formatCommandForGuide(
  command: string,
  description?: string,
  language: string = 'bash'
): string {
  const escapedCommand = command.replace(/`/g, '\\`').replace(/\$/g, '\\$');
  let result = '';

  if (description) {
    result += `${description}\n\n`;
  }

  result += `\`\`\`${language}\n${escapedCommand}\n\`\`\``;

  return result;
}

// Example usage in markdown:
/*
import { ExpandableCodeBlock } from '@/components/guide/ExpandableCodeBlock';

<ExpandableCodeBlock
  code={`# Long command that would normally take up lots of space
echo "This is a very long command with many lines..."
echo "More commands here..."
echo "Even more commands..."
# ... many more lines`}
  language="bash"
  previewLength={300}
/>
*/
