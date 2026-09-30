import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import type { AcademicPaper } from '../types/paper.ts';
import { downloadBibTeXFile, generateBatchBibTeX } from '../utils/bibtex.ts';

interface BibTeXModalProps {
  papers: AcademicPaper[];
  onClose: () => void;
}

export const BibTeXModal: React.FC<BibTeXModalProps> = ({ papers, onClose }) => {
  const [copied, setCopied] = useState(false);
  const bibtexContent = generateBatchBibTeX(papers);

  const handleCopy = () => {
    navigator.clipboard.writeText(bibtexContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadBibTeXFile(bibtexContent, 'researchscout_references.bib');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl flex flex-col rounded-xl border border-neutral-850 bg-neutral-900 shadow-2xl overflow-hidden max-h-[85vh] text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-850 px-5 py-3.5 bg-neutral-950/80">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-100">
              BibTeX References
            </h3>
            <span className="font-mono text-[10px] text-neutral-400 bg-neutral-850 px-1.5 py-0.5 rounded border border-neutral-800">
              {papers.length} {papers.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Copy All'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-950 hover:bg-white transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .bib</span>
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-neutral-950 font-mono text-[11px] text-neutral-300 leading-relaxed">
          <pre className="whitespace-pre-wrap">{bibtexContent}</pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-850 px-5 py-3 text-neutral-500 bg-neutral-950/60">
          <span>Ready to import into Overleaf, Zotero, or LaTeX.</span>
          <button
            onClick={onClose}
            className="rounded-md bg-neutral-800 px-3 py-1 font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
