import type { AcademicPaper } from '../types/paper.ts';

export function generateBibTeX(paper: AcademicPaper): string {
  const firstAuthor = paper.authors[0]
    ? paper.authors[0].split(' ').pop()?.replace(/[^a-zA-Z]/g, '') || 'Author'
    : 'Unknown';
  const year = paper.year || 'recent';
  const firstTitleWord = paper.title.split(' ')[0]?.replace(/[^a-zA-Z]/g, '') || 'Paper';
  const citationKey = `${firstAuthor.toLowerCase()}${year}${firstTitleWord.toLowerCase()}`;

  const authorsString = paper.authors.join(' and ');
  const venue = paper.venue || (paper.source === 'arXiv' ? 'arXiv preprint' : 'Academic Publication');

  let entry = `@article{${citationKey},\n`;
  entry += `  title     = {${paper.title}},\n`;
  entry += `  author    = {${authorsString}},\n`;
  if (paper.year) {
    entry += `  year      = {${paper.year}},\n`;
  }
  entry += `  journal   = {${venue}},\n`;
  if (paper.doi) {
    entry += `  doi       = {${paper.doi}},\n`;
  }
  if (paper.sourceUrl) {
    entry += `  url       = {${paper.sourceUrl}},\n`;
  }
  entry += `}`;

  return entry;
}

export function generateBatchBibTeX(papers: AcademicPaper[]): string {
  return papers.map(generateBibTeX).join('\n\n');
}

export function downloadBibTeXFile(content: string, filename: string = 'references.bib') {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
