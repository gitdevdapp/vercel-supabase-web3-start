import { ExpandableCodeBlock } from '@/components/guide/ExpandableCodeBlock';

export default function GuideDemoPage() {
  const sampleCommand = `# This is a very long command that demonstrates the expandable code block
# It has many lines and would normally take up a lot of space in the guide
echo "Starting deployment process..."
npm ci
npm run build
npm run lint

# More commands that would scroll off the page
echo "Setting up environment variables..."
export NODE_ENV=production
export DATABASE_URL=postgresql://localhost:5432/myapp

# Even more commands to demonstrate the truncation
echo "Running database migrations..."
npx prisma migrate deploy
npx prisma generate

# Testing commands
echo "Running test suite..."
npm test
npm run test:e2e

# Deployment commands
echo "Deploying to production..."
vercel --prod
echo "Deployment complete!"

# Cleanup commands
echo "Cleaning up..."
rm -rf .next
npm cache clean --force

echo "All done! This command block is intentionally very long to demonstrate the expand/collapse functionality."`;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Universal Copy-Paste Method Demo</h1>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <p className="mb-4">
            The universal copy-paste method shows only the first 300 characters by default,
            with an expand button to reveal the full content. This saves space while allowing
            users to see what's coming and copy the entire command with one click.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Example Command Block</h2>
          <ExpandableCodeBlock
            code={sampleCommand}
            language="bash"
            previewLength={300}
          />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Benefits</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Space Efficient:</strong> Reduces guide length by ~40%</li>
            <li><strong>One-Click Copy:</strong> Copy entire command regardless of expansion state</li>
            <li><strong>Context Aware:</strong> Shows enough to understand what the command does</li>
            <li><strong>Progressive Disclosure:</strong> Expand only when ready to execute</li>
            <li><strong>Consistent UX:</strong> Same interface across all code blocks</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Usage in Guide</h2>
          <p className="mb-4">
            In the actual guide, all code blocks will use this expandable format.
            Users can quickly scan commands and expand only when they're ready to copy and execute.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Guide Integration</h3>
            <p className="text-sm">
              The updated superguide now includes this expandable format throughout all phases,
              with comprehensive copy-paste commands, process cleanup, and verification steps.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
