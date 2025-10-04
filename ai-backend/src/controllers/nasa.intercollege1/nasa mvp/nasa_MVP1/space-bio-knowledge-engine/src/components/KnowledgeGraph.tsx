"use client";

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';

type Node = {
  id: string;
  type: string;
  label: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type Link = { source: string | Node; target: string | Node };
export default function KnowledgeGraph({ nodes, links }: { nodes: Node[]; links: Link[] }) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current as SVGSVGElement);
    svg.selectAll('*').remove();

    const width = ref.current.clientWidth || 800;
    const height = 500;

    const simulation = d3
      .forceSimulation(nodes as Node[])
      .force(
        'link',
        d3
          .forceLink(links as Link[])
          .id((d: Node) => d.id)
          .distance(80)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append('g')
      .attr('stroke', '#334155')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links as Link[])
      .enter()
      .append('line');

    const color = (d: Node) => (d.type === 'publication' ? '#00d1ff' : '#2b6cb0');

    const node = svg
      .append('g')
      .selectAll('circle')
      .data(nodes as Node[])
      .enter()
      .append('circle')
      .attr('r', 8)
      .attr('fill', (d: any) => color(d as Node))
      .call(
        d3
          .drag()
          .on('start', (event: any, d: Node) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event: any, d: Node) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event: any, d: Node) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    const labels = svg
      .append('g')
      .selectAll('text')
      .data(nodes as Node[])
      .enter()
      .append('text')
      .text((d: any) => (d as Node).label)
      .attr('font-size', 10)
      .attr('fill', '#94a3b8');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => ((d.source as Node).x ?? 0))
        .attr('y1', (d: any) => ((d.source as Node).y ?? 0))
        .attr('x2', (d: any) => ((d.target as Node).x ?? 0))
        .attr('y2', (d: any) => ((d.target as Node).y ?? 0));

      node.attr('cx', (d: any) => (d as Node).x ?? 0).attr('cy', (d: any) => (d as Node).y ?? 0);
      labels
        .attr('x', (d: any) => ((d as Node).x ?? 0) + 10)
        .attr('y', (d: any) => ((d as Node).y ?? 0) + 3);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  return <svg ref={ref} className="w-full h-[500px] bg-slate-900/50 rounded-xl border border-slate-700/60" />;
}
