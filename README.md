# PaperPilot

PaperPilot is an AI-powered academic research assistant for discovering, analyzing, comparing, and exploring scientific literature.

## Overview

PaperPilot combines academic search APIs with Google's Gemini models to streamline the research workflow.

The application allows users to:

- Search academic literature across multiple sources
- Optimize research queries using AI
- Generate structured paper summaries
- Compare multiple research papers
- Ask questions about a collection of papers
- Monitor citation counts
- Identify potential research gaps
- Save papers and maintain search history
- Export BibTeX and research reports

## Features

### Academic Search

Searches multiple academic sources including:

- OpenAlex
- arXiv
- Crossref

Search queries are optimized using Gemini before being sent to the academic databases. Results can be filtered by publication year and combined across sources with duplicate detection.

### Paper Analysis

Generate structured analyses covering:

- Research problem
- Motivation
- Proposed approach
- Methodology
- Datasets and benchmarks
- Key results
- Limitations
- Future work
- Important technical concepts
- Relevance to the research topic

### Paper Comparison

Compare multiple papers across:

- Common themes
- Key differences
- Methodology
- Benchmarks and datasets
- Hardware and evaluation environments
- Trade-offs
- Research gaps

### Research Gap Analysis

Analyze a collection of papers to identify:

- Underexplored problems
- Conflicting assumptions
- Evaluation limitations
- Technical trade-offs
- Cross-architecture challenges
- Potential research directions

### Paper Q&A

Ask questions about a selected collection of papers. Responses are generated using the selected papers as context and are designed to remain grounded in the provided literature.

### Citation Monitoring

Citation counts can be checked using OpenAlex and Crossref, with fallback handling when a paper cannot be resolved through a particular source.

### Research Utilities

- Saved papers
- Search history
- BibTeX export
- Research report export
- Citation graphs
- Citation growth visualization

## Architecture

```text
                         React Frontend
                              |
                              v
                       Express Server
                              |
              +---------------+---------------+
              |               |               |
              v               v               v
          OpenAlex          arXiv          Crossref
              |
              +---------------+
                              |
                              v
                         Gemini API
                              |
                              v
                    AI Research Analysis