import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  GitCompare,
  Bookmark,
  ExternalLink,
  BookOpen,
  Users,
  Quote,
  Maximize2,
  Minimize2,
  Filter,
  Info,
  Calendar,
  Activity,
} from 'lucide-react';
import type { AcademicPaper } from '../types/paper.ts';

interface CitationGraphProps {
  papers: AcademicPaper[];
  selectedPaperIds: Set<string>;
  savedPaperIds: Set<string>;
  monitoredPaperIds?: Set<string>;
  onToggleSelect: (paperId: string) => void;
  onToggleSave: (paper: AcademicPaper) => void;
  onToggleMonitor?: (paper: AcademicPaper) => void;
  onSummarize: (paper: AcademicPaper) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  paper: AcademicPaper;
  radius: number;
  color: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'coauthorship' | 'thematic';
  label: string;
}

export const CitationGraph: React.FC<CitationGraphProps> = ({
  papers,
  selectedPaperIds,
  savedPaperIds,
  monitoredPaperIds,
  onToggleSelect,
  onToggleSave,
  onToggleMonitor,
  onSummarize,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activePaper, setActivePaper] = useState<AcademicPaper | null>(null);
  const [showThematicEdges, setShowThematicEdges] = useState(true);
  const [showCoauthorEdges, setShowCoauthorEdges] = useState(true);
  const [sizingMode, setSizingMode] = useState<'citations' | 'relevance'>('citations');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Compute graph data (nodes & edges)
  const { nodes, links, authorConnectionsCount } = useMemo(() => {
    if (!papers || papers.length === 0) {
      return { nodes: [], links: [], authorConnectionsCount: 0 };
    }

    // Determine citation scale bounds
    const citationCounts = papers.map((p) => p.citationCount || 0);
    const minCites = Math.min(...citationCounts);
    const maxCites = Math.max(...citationCounts, 1);

    // Color scale based on publication year
    const years = papers.map((p) => p.year || 2022);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years, minYear + 1);

    const yearColorScale = d3
      .scaleSequential()
      .domain([minYear, maxYear])
      .interpolator(d3.interpolateCool);

    // Build Nodes
    const graphNodes: GraphNode[] = papers.map((paper) => {
      let radius = 20;
      if (sizingMode === 'citations') {
        const cites = paper.citationCount || 0;
        // logarithmic scaling from 16 to 40
        radius = 16 + (Math.log10(cites + 1) / Math.log10(maxCites + 2)) * 24;
      } else {
        radius = 16 + (paper.relevanceScore / 100) * 20;
      }

      return {
        id: paper.id,
        paper,
        radius: Math.round(radius),
        color: yearColorScale(paper.year || 2022),
      };
    });

    const graphLinks: GraphLink[] = [];
    let coauthorLinksCount = 0;

    // Helper to normalize author names (e.g. "J. Doe" or "John Doe")
    const normalizeAuthor = (name: string) => {
      return name.toLowerCase().replace(/[^a-z]/g, '');
    };

    // Build Links
    for (let i = 0; i < papers.length; i++) {
      for (let j = i + 1; j < papers.length; j++) {
        const p1 = papers[i];
        const p2 = papers[j];

        // 1. Co-authorship detection
        const p1AuthorsNorm = p1.authors.map(normalizeAuthor);
        const p2AuthorsNorm = p2.authors.map(normalizeAuthor);

        const sharedAuthors = p1.authors.filter((a1) =>
          p2AuthorsNorm.includes(normalizeAuthor(a1))
        );

        if (sharedAuthors.length > 0) {
          coauthorLinksCount++;
          graphLinks.push({
            source: p1.id,
            target: p2.id,
            type: 'coauthorship',
            label: `Shared Author(s): ${sharedAuthors.join(', ')}`,
          });
          continue; // Prioritize co-authorship as primary edge
        }

        // 2. Thematic / Shared concepts link
        if (p1.fieldsOfStudy && p2.fieldsOfStudy) {
          const sharedFields = p1.fieldsOfStudy.filter((f) =>
            p2.fieldsOfStudy?.includes(f)
          );
          if (sharedFields.length > 0) {
            graphLinks.push({
              source: p1.id,
              target: p2.id,
              type: 'thematic',
              label: `Thematic: ${sharedFields.slice(0, 2).join(', ')}`,
            });
          }
        } else if (p1.venue && p2.venue && p1.venue === p2.venue) {
          graphLinks.push({
            source: p1.id,
            target: p2.id,
            type: 'thematic',
            label: `Same Venue: ${p1.venue}`,
          });
        }
      }
    }

    return {
      nodes: graphNodes,
      links: graphLinks,
      authorConnectionsCount: coauthorLinksCount,
    };
  }, [papers, sizingMode]);

  // Active filtered links based on user toggles
  const activeLinks = useMemo(() => {
    return links.filter((l) => {
      if (l.type === 'coauthorship' && !showCoauthorEdges) return false;
      if (l.type === 'thematic' && !showThematicEdges) return false;
      return true;
    });
  }, [links, showCoauthorEdges, showThematicEdges]);

  // Store zoom behavior ref for external controls
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Initialize and update D3 Force Directed Simulation
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 550;

    svg.selectAll('*').remove();

    // Container group for pan/zoom
    const g = svg.append('g').attr('class', 'graph-container');

    // Setup Zoom Behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Arrow markers for links if needed
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'arrow-coauthor')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#38bdf8');

    // Create deep copies for D3 simulation to mutate
    const simNodes = nodes.map((d) => ({ ...d }));
    const simLinks = activeLinks.map((d) => ({ ...d }));

    // Force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(simNodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(simLinks)
          .id((d) => d.id)
          .distance((d) => (d.type === 'coauthorship' ? 90 : 140))
          .strength((d) => (d.type === 'coauthorship' ? 0.7 : 0.25))
      )
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide<GraphNode>().radius((d) => d.radius + 18)
      );

    // Draw Links
    const link = g
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', (d) => (d.type === 'coauthorship' ? '#38bdf8' : '#334155'))
      .attr('stroke-width', (d) => (d.type === 'coauthorship' ? 2.5 : 1.2))
      .attr('stroke-dasharray', (d) => (d.type === 'coauthorship' ? 'none' : '4,3'))
      .attr('stroke-opacity', (d) => (d.type === 'coauthorship' ? 0.85 : 0.45));

    // Draw Link hitboxes for hover inspection
    link
      .append('title')
      .text((d) => d.label);

    // Draw Node Groups
    const node = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-group cursor-pointer')
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node outer ring / halo for selected papers
    node
      .append('circle')
      .attr('r', (d) => d.radius + 6)
      .attr('fill', 'transparent')
      .attr('stroke', (d) => (selectedPaperIds.has(d.id) ? '#6366f1' : 'transparent'))
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '3,3')
      .attr('class', 'selection-halo');

    // Node Main Circle
    node
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => {
        if (selectedPaperIds.has(d.id)) return '#4f46e5';
        if (savedPaperIds.has(d.id)) return '#d97706';
        return d.color || '#3b82f6';
      })
      .attr('stroke', (d) => (selectedPaperIds.has(d.id) ? '#c7d2fe' : '#1e293b'))
      .attr('stroke-width', 2)
      .attr('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4))')
      .transition()
      .duration(500)
      .attr('r', (d) => d.radius);

    // Node Inner Citation Count Badge or Year
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', (d) => Math.max(9, Math.round(d.radius * 0.45)))
      .attr('font-weight', '700')
      .attr('fill', '#ffffff')
      .attr('pointer-events', 'none')
      .text((d) => (d.paper.citationCount !== null ? `${d.paper.citationCount}` : `${d.paper.year || ''}`));

    // Node Label (Shortened title underneath)
    node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 14)
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('fill', '#94a3b8')
      .attr('pointer-events', 'none')
      .text((d) => {
        const title = d.paper.title;
        return title.length > 24 ? title.slice(0, 24) + '…' : title;
      });

    // Interactivity: Click to inspect paper
    node.on('click', (_event, d) => {
      setActivePaper(d.paper);
    });

    // Interactivity: Hover Tooltip
    node
      .on('mouseenter', (event, d) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setTooltipPos({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }
        setHoveredNode(d);

        // Highlight connected links
        link
          .attr('stroke-opacity', (l: any) =>
            l.source.id === d.id || l.target.id === d.id ? 1 : 0.15
          )
          .attr('stroke-width', (l: any) =>
            l.source.id === d.id || l.target.id === d.id ? 3 : 1
          );
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        setTooltipPos(null);
        link
          .attr('stroke-opacity', (l) => (l.type === 'coauthorship' ? 0.85 : 0.45))
          .attr('stroke-width', (l) => (l.type === 'coauthorship' ? 2.5 : 1.2));
      });

    // Tick simulation
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Initial center zoom
    svg.transition().duration(600).call(
      zoom.transform,
      d3.zoomIdentity.translate(0, 0).scale(1)
    );

    return () => {
      simulation.stop();
    };
  }, [nodes, activeLinks, selectedPaperIds, savedPaperIds]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
    }
  };

  const handleResetZoom = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      d3.select(svgRef.current).transition().duration(400).call(
        zoomBehaviorRef.current.transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-sm transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col bg-neutral-950/98' : 'h-[620px]'
      }`}
    >
      {/* Top Floating Control Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Metrics & Toggles */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto bg-neutral-900/95 backdrop-blur-md rounded-lg border border-neutral-800 p-1.5 shadow-sm text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-neutral-200 font-semibold border-r border-neutral-800">
            <Quote className="h-3.5 w-3.5 text-neutral-400" />
            <span>Citation & Co-Authorship Graph</span>
            <span className="rounded bg-neutral-800 px-1.5 py-0.2 text-[10px] text-neutral-300 font-mono">
              {nodes.length} nodes
            </span>
          </div>

          {/* Sizing toggle */}
          <div className="flex items-center gap-1 text-[11px] text-neutral-400">
            <span className="text-neutral-500 font-medium">Node Size:</span>
            <button
              onClick={() => setSizingMode('citations')}
              className={`rounded px-2 py-0.5 transition-colors ${
                sizingMode === 'citations'
                  ? 'bg-neutral-800 font-semibold text-neutral-100'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Citations
            </button>
            <button
              onClick={() => setSizingMode('relevance')}
              className={`rounded px-2 py-0.5 transition-colors ${
                sizingMode === 'relevance'
                  ? 'bg-neutral-800 font-semibold text-neutral-100'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Relevance
            </button>
          </div>

          {/* Co-authorship edge toggle */}
          <label className="flex items-center gap-1 cursor-pointer px-2 py-0.5 text-[11px] text-neutral-300 hover:text-white border-l border-neutral-800 select-none">
            <input
              type="checkbox"
              checked={showCoauthorEdges}
              onChange={(e) => setShowCoauthorEdges(e.target.checked)}
              className="h-3 w-3 rounded text-neutral-100 focus:ring-0"
            />
            <span>Co-Authors ({authorConnectionsCount})</span>
          </label>

          {/* Thematic edge toggle */}
          <label className="flex items-center gap-1 cursor-pointer px-2 py-0.5 text-[11px] text-neutral-400 hover:text-neutral-200 select-none">
            <input
              type="checkbox"
              checked={showThematicEdges}
              onChange={(e) => setShowThematicEdges(e.target.checked)}
              className="h-3 w-3 rounded text-neutral-600 focus:ring-0"
            />
            <span>Thematic Links</span>
          </label>
        </div>

        {/* Right: Zoom & Fullscreen buttons */}
        <div className="flex items-center gap-1 pointer-events-auto bg-neutral-900/95 backdrop-blur-md rounded-lg border border-neutral-800 p-1.5 shadow-sm">
          <button
            onClick={handleZoomIn}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            title="Reset Pan & Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors border-l border-neutral-800 pl-1.5"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main SVG Visualization Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating Hover Tooltip */}
      {hoveredNode && tooltipPos && (
        <div
          className="pointer-events-none absolute z-20 max-w-xs rounded-lg border border-neutral-750 bg-neutral-900/98 p-3 text-xs text-neutral-200 shadow-xl backdrop-blur-md"
          style={{
            left: `${Math.min(tooltipPos.x + 15, (containerRef.current?.clientWidth || 800) - 260)}px`,
            top: `${Math.max(tooltipPos.y - 70, 20)}px`,
          }}
        >
          <p className="font-medium text-neutral-100 leading-snug line-clamp-2">
            {hoveredNode.paper.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
            <span>{hoveredNode.paper.year || 'N/A'}</span>
            <span>•</span>
            <span className="text-neutral-300 font-mono font-medium">
              {hoveredNode.paper.citationCount ?? 0} cites
            </span>
            <span>•</span>
            <span className="text-neutral-400 font-mono">
              {hoveredNode.paper.relevanceScore}% rel
            </span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500 line-clamp-1">
            {hoveredNode.paper.authors.slice(0, 3).join(', ')}
          </p>
        </div>
      )}

      {/* Node Inspector Side Card (when a paper node is clicked) */}
      {activePaper && (
        <div className="absolute right-4 bottom-4 top-16 z-20 w-80 sm:w-96 rounded-xl border border-neutral-800 bg-neutral-900/98 p-4 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                PAPER DETAILS
              </span>
              <button
                onClick={() => setActivePaper(null)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <h3 className="text-sm font-semibold text-neutral-100 leading-snug">
              {activePaper.title}
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              {activePaper.year && (
                <span className="font-mono text-neutral-300">{activePaper.year}</span>
              )}
              {activePaper.citationCount !== null && (
                <span className="font-mono text-neutral-300">
                  {activePaper.citationCount.toLocaleString()} citations
                </span>
              )}
              <span className="font-mono text-neutral-500">
                {activePaper.relevanceScore}% relevance
              </span>
            </div>

            <div className="mt-2 text-xs text-neutral-400 space-y-1">
              <p>
                <span className="text-neutral-500">Authors:</span>{' '}
                {activePaper.authors.join(', ')}
              </p>
              {activePaper.venue && (
                <p className="text-neutral-400 truncate">
                  <span className="text-neutral-500">Venue:</span>{' '}
                  {activePaper.venue}
                </p>
              )}
            </div>

            {/* Abstract snippet */}
            <div className="mt-3 rounded-md border border-neutral-800 bg-neutral-950/80 p-3 text-xs text-neutral-300 leading-relaxed font-['Newsreader'] max-h-36 overflow-y-auto">
              {activePaper.abstract}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 pt-3 border-t border-neutral-850 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onToggleSelect(activePaper.id)}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                  selectedPaperIds.has(activePaper.id)
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <GitCompare className="h-3.5 w-3.5" />
                <span>
                  {selectedPaperIds.has(activePaper.id) ? 'Selected' : 'Select'}
                </span>
              </button>

              <button
                onClick={() => onToggleSave(activePaper)}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors ${
                  savedPaperIds.has(activePaper.id)
                    ? 'border border-neutral-700 bg-neutral-800 text-neutral-200'
                    : 'border border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>
                  {savedPaperIds.has(activePaper.id) ? 'Saved' : 'Save'}
                </span>
              </button>
            </div>

            {onToggleMonitor && (
              <button
                onClick={() => onToggleMonitor(activePaper)}
                className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors border ${
                  monitoredPaperIds?.has(activePaper.id)
                    ? 'border-emerald-800/80 bg-emerald-950/40 text-emerald-300'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>
                  {monitoredPaperIds?.has(activePaper.id) ? 'Tracking Citations' : 'Monitor Citations'}
                </span>
              </button>
            )}

            <button
              onClick={() => onSummarize(activePaper)}
              className="flex items-center justify-center gap-1.5 rounded-md bg-neutral-100 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-white transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate AI Summary</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Legend */}
      <div className="absolute bottom-3 left-4 z-10 hidden sm:flex items-center gap-4 bg-neutral-900/90 backdrop-blur-md rounded-lg border border-neutral-800 px-3 py-1.5 text-[11px] text-neutral-400 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-neutral-300" />
          <span>Paper Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-neutral-100 border border-neutral-400" />
          <span>Selected for Compare</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-sky-400" />
          <span>Co-Authorship Edge</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 border-b border-dashed border-neutral-600" />
          <span>Thematic / Venue Link</span>
        </div>
      </div>
    </div>
  );
};
