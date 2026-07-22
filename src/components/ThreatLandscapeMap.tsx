'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, Crosshair, Radio } from 'lucide-react';

interface AttackSource {
  id: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  threatType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  active: boolean;
  lastSeen: number;
}

interface AttackArc {
  id: string;
  source: AttackSource;
  progress: number;
  opacity: number;
  startTime: number;
}

const KINEXYS_HQ = { lat: 40.7128, lng: -74.006, label: 'KINEXYS NYC' };

const ATTACK_SOURCES: Omit<AttackSource, 'active' | 'lastSeen'>[] = [
  { id: 'moscow', city: 'Moscow', country: 'RU', lat: 55.7558, lng: 37.6173, threatType: 'DDoS Amplification', severity: 'CRITICAL' },
  { id: 'beijing', city: 'Beijing', country: 'CN', lat: 39.9042, lng: 116.4074, threatType: 'APT Exfiltration', severity: 'CRITICAL' },
  { id: 'pyongyang', city: 'Pyongyang', country: 'KP', lat: 39.0392, lng: 125.7625, threatType: 'Lazarus Group C2', severity: 'CRITICAL' },
  { id: 'tehran', city: 'Tehran', country: 'IR', lat: 35.6892, lng: 51.389, threatType: 'SWIFT Exploit Probe', severity: 'HIGH' },
  { id: 'lagos', city: 'Lagos', country: 'NG', lat: 6.5244, lng: 3.3792, threatType: 'BEC Campaign', severity: 'HIGH' },
  { id: 'saopaulo', city: 'S\u00e3o Paulo', country: 'BR', lat: -23.5505, lng: -46.6333, threatType: 'Credential Spray', severity: 'MEDIUM' },
  { id: 'mumbai', city: 'Mumbai', country: 'IN', lat: 19.076, lng: 72.8777, threatType: 'API Abuse', severity: 'MEDIUM' },
  { id: 'bucharest', city: 'Bucharest', country: 'RO', lat: 44.4268, lng: 26.1025, threatType: 'Ransomware Beacon', severity: 'HIGH' },
  { id: 'shanghai', city: 'Shanghai', country: 'CN', lat: 31.2304, lng: 121.4737, threatType: 'Supply Chain Probe', severity: 'HIGH' },
  { id: 'kiev', city: 'Kyiv', country: 'UA', lat: 50.4501, lng: 30.5234, threatType: 'Wiper Malware', severity: 'CRITICAL' },
  { id: 'singapore', city: 'Singapore', country: 'SG', lat: 1.3521, lng: 103.8198, threatType: 'Man-in-the-Middle', severity: 'MEDIUM' },
  { id: 'berlin', city: 'Berlin', country: 'DE', lat: 52.52, lng: 13.405, threatType: 'DNS Tunneling', severity: 'MEDIUM' },
];

const WORLD_MAP_PATHS = `M 153 61 L 155 57 L 163 56 L 169 59 L 166 64 L 159 65 Z
M 118 68 L 125 62 L 133 62 L 141 57 L 152 56 L 153 61 L 159 65 L 155 71 L 148 74 L 139 72 L 131 75 L 124 73 Z
M 160 54 L 172 48 L 187 50 L 196 48 L 199 44 L 210 42 L 218 39 L 230 38 L 242 35 L 252 38 L 260 37 L 268 38 L 271 42 L 275 41 L 282 44 L 280 48 L 275 50 L 268 48 L 261 50 L 256 53 L 248 52 L 240 54 L 232 53 L 224 56 L 216 55 L 208 58 L 200 56 L 192 58 L 184 56 L 176 58 L 168 57 Z
M 118 74 L 127 76 L 133 78 L 139 76 L 148 78 L 153 76 L 160 78 L 160 84 L 156 90 L 148 92 L 140 95 L 132 94 L 125 90 L 120 84 Z
M 148 80 L 156 78 L 162 80 L 170 78 L 178 80 L 185 78 L 192 80 L 194 86 L 190 92 L 182 94 L 174 92 L 168 88 L 160 87 L 155 84 Z
M 194 80 L 200 76 L 210 78 L 218 76 L 226 78 L 234 76 L 240 78 L 246 82 L 250 88 L 248 94 L 242 98 L 234 96 L 226 94 L 218 92 L 210 90 L 204 86 Z
M 62 56 L 70 52 L 80 50 L 90 48 L 100 50 L 108 54 L 115 56 L 116 62 L 108 66 L 100 68 L 92 70 L 84 72 L 76 70 L 70 66 L 64 62 Z
M 40 62 L 48 58 L 56 56 L 62 58 L 60 64 L 52 66 L 44 68 Z
M 94 74 L 100 72 L 108 74 L 114 76 L 112 82 L 106 86 L 98 88 L 92 84 L 90 78 Z
M 260 80 L 268 76 L 276 78 L 284 76 L 290 80 L 296 84 L 298 90 L 302 96 L 306 102 L 304 108 L 298 112 L 290 110 L 282 106 L 276 100 L 270 94 L 264 88 Z
M 296 116 L 302 112 L 308 116 L 312 122 L 316 128 L 318 136 L 314 142 L 308 146 L 300 144 L 294 138 L 290 130 L 292 124 Z`;

function latLngToXY(lat: number, lng: number, width: number, height: number): [number, number] {
  const x = ((lng + 180) / 360) * width;
  const y = ((90 - lat) / 180) * height;
  return [x, y];
}

export default function ThreatLandscapeMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const arcsRef = useRef<AttackArc[]>([]);
  const sourcesRef = useRef<AttackSource[]>(
    ATTACK_SOURCES.map(s => ({ ...s, active: false, lastSeen: 0 }))
  );
  const [activeAttacks, setActiveAttacks] = useState(0);
  const [totalBlocked, setTotalBlocked] = useState(12847);
  const [latestAttack, setLatestAttack] = useState<AttackSource | null>(null);
  const tickRef = useRef(0);
  const blockedRef = useRef(12847);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    const spawnArc = () => {
      const available = sourcesRef.current.filter(s => !arcsRef.current.some(a => a.source.id === s.id));
      if (available.length === 0) return;
      const src = available[Math.floor(Math.random() * available.length)];
      src.active = true;
      src.lastSeen = Date.now();
      arcsRef.current.push({
        id: `${src.id}-${Date.now()}`,
        source: src,
        progress: 0,
        opacity: 1,
        startTime: Date.now(),
      });
      setLatestAttack({ ...src });
    };

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      tickRef.current++;
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Background gradient
      const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.7);
      bgGrad.addColorStop(0, 'rgba(230,57,70,0.03)');
      bgGrad.addColorStop(1, 'rgba(10,10,10,0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = 'rgba(252,250,249,0.03)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Map paths
      ctx.save();
      const mapScale = W / 350;
      const mapOffsetY = (H - 180 * mapScale) / 2;
      ctx.translate(0, mapOffsetY);
      ctx.scale(mapScale, mapScale);

      const paths = WORLD_MAP_PATHS.split('\n');
      paths.forEach(pathStr => {
        const commands = pathStr.trim().split(/(?=[MLZ])/);
        ctx.beginPath();
        commands.forEach(cmd => {
          const parts = cmd.trim().split(/\s+/);
          const type = parts[0];
          if (type === 'M' && parts.length >= 3) {
            ctx.moveTo(parseFloat(parts[1]), parseFloat(parts[2]));
          } else if (type === 'L' && parts.length >= 3) {
            ctx.lineTo(parseFloat(parts[1]), parseFloat(parts[2]));
          } else if (type === 'Z') {
            ctx.closePath();
          }
        });
        ctx.fillStyle = 'rgba(252,250,249,0.04)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(252,250,249,0.08)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
      ctx.restore();

      // HQ marker
      const [hqX, hqY] = latLngToXY(KINEXYS_HQ.lat, KINEXYS_HQ.lng, W, H);
      const pulseRadius = 4 + Math.sin(tickRef.current * 0.05) * 2;
      ctx.beginPath();
      ctx.arc(hqX, hqY, pulseRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16,185,129,0.05)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hqX, hqY, pulseRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16,185,129,0.1)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(hqX, hqY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // HQ label
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(16,185,129,0.7)';
      ctx.textAlign = 'left';
      ctx.fillText(KINEXYS_HQ.label, hqX + 8, hqY + 3);

      // Crosshair rings around HQ
      ctx.strokeStyle = 'rgba(16,185,129,0.08)';
      ctx.lineWidth = 0.5;
      [20, 40, 60].forEach(r => {
        ctx.beginPath();
        ctx.arc(hqX, hqY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Attack arcs
      arcsRef.current.forEach(arc => {
        const elapsed = (Date.now() - arc.startTime) / 2500;
        arc.progress = Math.min(elapsed, 1);
        if (arc.progress >= 1) {
          arc.opacity = Math.max(0, arc.opacity - 0.02);
        }

        const [srcX, srcY] = latLngToXY(arc.source.lat, arc.source.lng, W, H);
        const t = arc.progress;

        // Quadratic bezier control point (arched)
        const midX = (srcX + hqX) / 2;
        const midY = Math.min(srcY, hqY) - Math.abs(srcX - hqX) * 0.25 - 20;

        // Draw trail
        const segments = 40;
        const trailStart = Math.max(0, t - 0.3);
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
          const st = trailStart + (i / segments) * (t - trailStart);
          if (st > t) break;
          const bx = (1 - st) * (1 - st) * srcX + 2 * (1 - st) * st * midX + st * st * hqX;
          const by = (1 - st) * (1 - st) * srcY + 2 * (1 - st) * st * midY + st * st * hqY;
          if (i === 0) ctx.moveTo(bx, by);
          else ctx.lineTo(bx, by);
        }

        const arcColor = arc.source.severity === 'CRITICAL' ? '#E63946' :
          arc.source.severity === 'HIGH' ? '#F59E0B' : '#6B6B6B';

        ctx.strokeStyle = arcColor;
        ctx.globalAlpha = arc.opacity * 0.6;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Glow trail
        ctx.strokeStyle = arcColor;
        ctx.globalAlpha = arc.opacity * 0.15;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Leading dot
        if (t < 1) {
          const dotX = (1 - t) * (1 - t) * srcX + 2 * (1 - t) * t * midX + t * t * hqX;
          const dotY = (1 - t) * (1 - t) * srcY + 2 * (1 - t) * t * midY + t * t * hqY;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = arcColor;
          ctx.shadowColor = arcColor;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Source dot
        ctx.beginPath();
        ctx.arc(srcX, srcY, 2, 0, Math.PI * 2);
        ctx.fillStyle = arcColor;
        ctx.globalAlpha = 0.6 + Math.sin(tickRef.current * 0.1) * 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Source ring
        if (arc.source.severity === 'CRITICAL') {
          ctx.beginPath();
          ctx.arc(srcX, srcY, 5 + Math.sin(tickRef.current * 0.08) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = `${arcColor}40`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      // Clean up completed arcs
      arcsRef.current = arcsRef.current.filter(a => a.opacity > 0.01);

      // Update source active states
      const now = Date.now();
      sourcesRef.current.forEach(s => {
        if (s.active && now - s.lastSeen > 4000) {
          s.active = false;
        }
      });

      // Draw inactive source dots
      sourcesRef.current.forEach(s => {
        if (s.active) return;
        const [sx, sy] = latLngToXY(s.lat, s.lng, W, H);
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(107,107,107,0.3)';
        ctx.fill();
      });

      // Impact flash at HQ
      const impactArcs = arcsRef.current.filter(a => a.progress >= 0.98 && a.progress < 1.02);
      impactArcs.forEach(() => {
        const impactR = 12 + Math.random() * 8;
        ctx.beginPath();
        ctx.arc(hqX, hqY, impactR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(230,57,70,0.08)';
        ctx.fill();
        blockedRef.current++;
      });
      setTotalBlocked(blockedRef.current);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    // Spawn arcs at intervals
    const spawnInterval = setInterval(() => {
      const count = Math.random() > 0.6 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        setTimeout(() => spawnArc(), i * 300);
      }
      setActiveAttacks(arcsRef.current.filter(a => a.progress < 1).length);
    }, 2500 + Math.random() * 2000);

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(spawnInterval);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="bg-obsidian-card border border-obsidian-border rounded-lg overflow-hidden">
      <div className="h-[2px] vermilion-gradient" />

      <div className="px-4 py-3 border-b border-obsidian-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-vermilion" />
            <h3 className="text-[11px] font-mono text-off-white tracking-wider font-medium">THREAT LANDSCAPE MAP</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-vermilion animate-pulse" />
              <span className="text-[9px] font-mono text-off-white-dim">{activeAttacks} ACTIVE</span>
            </div>
            <span className="text-[9px] font-mono text-off-white-dim hidden sm:inline">{totalBlocked.toLocaleString()} BLOCKED</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full aspect-[2.2/1] min-h-[180px]">
        <canvas ref={canvasRef} className="absolute inset-0" />

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
          {[
            { color: 'bg-vermilion', label: 'CRITICAL' },
            { color: 'bg-amber', label: 'HIGH' },
            { color: 'bg-off-white-dim', label: 'MEDIUM' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-[7px] font-mono text-off-white-dim/60">{label}</span>
            </div>
          ))}
        </div>

        {/* Latest attack info */}
        {latestAttack && (
          <div className="absolute top-2 right-2 bg-obsidian/90 border border-obsidian-border rounded px-2.5 py-1.5 max-w-[200px]">
            <div className="flex items-center gap-1.5 mb-1">
              <Crosshair className={`w-3 h-3 shrink-0 ${
                latestAttack.severity === 'CRITICAL' ? 'text-vermilion' :
                latestAttack.severity === 'HIGH' ? 'text-amber' : 'text-off-white-dim'
              }`} />
              <span className="text-[9px] font-mono text-off-white truncate">{latestAttack.city}, {latestAttack.country}</span>
            </div>
            <span className="text-[8px] font-mono text-off-white-dim truncate block">{latestAttack.threatType}</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-obsidian-border/50 flex items-center justify-between">
        <span className="text-[7px] font-mono text-off-white-dim/40 tracking-widest">TLM v1.0 \u00b7 GLOBAL THREAT INTELLIGENCE</span>
        <div className="flex items-center gap-1">
          <Radio className="w-3 h-3 text-vermilion/40" />
          <span className="text-[7px] font-mono text-off-white-dim/40">LIVE FEED</span>
        </div>
      </div>
    </div>
  );
}
