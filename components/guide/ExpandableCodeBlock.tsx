'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableCodeBlockProps {
  code: string;
  language?: string;
  previewLength?: number;
  className?: string;
  requiresBrowser?: boolean;
  successCriteria?: string;
}

export function ExpandableCodeBlock({
  code,
  language = 'bash',
  previewLength = 300,
  className = '',
  requiresBrowser = false,
  successCriteria
}: ExpandableCodeBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const shouldShowExpand = code.length > previewLength;
  const displayCode = isExpanded ? code : code.slice(0, previewLength);
  const isTruncated = !isExpanded && shouldShowExpand;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Indicator and Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {language && (
            <span className="text-xs text-muted-foreground uppercase font-mono font-semibold tracking-wider">
              {language}
            </span>
          )}
          {requiresBrowser && (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
              🌐 Requires Cursor Browser
            </span>
          )}
        </div>
        {shouldShowExpand && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-7 px-2 text-xs hover:bg-primary/10"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand
              </>
            )}
          </Button>
        )}
      </div>

      {/* Code Block */}
      <div className="relative">
        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm border border-border">
          <code className={`language-${language}`}>
            {displayCode}
            {isTruncated && (
              <span className="text-muted-foreground">
                {'\n'}... ({code.length - previewLength} more characters)
              </span>
            )}
          </code>
        </pre>

        {/* Bright Copy Button - Positioned Top Right */}
        <Button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 h-9 px-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:brightness-110 text-white font-semibold rounded-md transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 dark:from-cyan-500 dark:to-blue-600"
        >
          <Copy className="h-4 w-4" />
          <span className="text-sm font-semibold">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </Button>
      </div>

      {/* Success Criteria */}
      {successCriteria && (
        <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm">
          <p className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ Expected Result</p>
          <p className="text-muted-foreground text-xs">{successCriteria}</p>
        </div>
      )}
    </div>
  );
}
