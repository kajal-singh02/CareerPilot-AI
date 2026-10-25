import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Preset palettes
export const PRESET_PALETTES = {
  redNoir: {
    tubes: ['#ef233c', '#d90429', '#ffffff'],
    lights: ['#ef233c', '#ff2a4a', '#8d0801', '#ffffff'],
  },
  careerpilot: {
    tubes: ['#ef233c', '#8d0801', '#ffffff'],
    lights: ['#ef233c', '#d90429', '#b5179e', '#ffffff'],
  },
};

const RED_NOIR_TUBES = [
  '#ef233c', '#d90429', '#8d0801', '#ff4d6d', '#ffffff',
  '#c1121f', '#780000', '#f72585', '#7209b7', '#480ca8', '#3a0ca3'
];

const RED_NOIR_LIGHTS = [
  '#ef233c', '#ff2a4a', '#8d0801', '#ffffff', '#b5179e',
  '#f72585', '#c1121f', '#ff758f', '#a4133c'
];

function getRandomRedNoir(array: string[], count = 3): string[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
  initialPalette?: keyof typeof PRESET_PALETTES;
  customTubesColors?: string[];
  customLightsColors?: string[];
  lightsIntensity?: number;
  showShuffleBadge?: boolean;
}

export const TubesBackground: React.FC<TubesBackgroundProps> = ({
  children,
  className,
  enableClickInteraction = true,
  initialPalette = 'redNoir',
  customTubesColors,
  customLightsColors,
  lightsIntensity = 240,
  showShuffleBadge = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tubesRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const initTubes = useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      // Load remote module dynamically at runtime
      const importRemote = new Function('url', 'return import(url)');
      const module = await importRemote('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
      const TubesCursor = module.default;

      if (!canvasRef.current) return;

      const palette = PRESET_PALETTES[initialPalette] || PRESET_PALETTES.careerpilot;
      const tubesColors = customTubesColors || palette.tubes;
      const lightsColors = customLightsColors || palette.lights;

      const app = TubesCursor(canvasRef.current, {
        tubes: {
          colors: tubesColors,
          lights: {
            intensity: lightsIntensity,
            colors: lightsColors,
          },
        },
        // Autonomous elegant fluid drift across screen
        sleepRadiusX: 280,
        sleepRadiusY: 140,
        sleepTimeScale1: 0.8,
        sleepTimeScale2: 1.2,
      });

      // KEY FIX: Prevent the background from moving according to cursor position!
      // Overwrite the render loop target so it always glides smoothly and autonomously,
      // regardless of cursor movement over the window.
      if (app && app.three) {
        const origOnBeforeRender = app.three.onBeforeRender;
        app.three.onBeforeRender = function (clock: any) {
          if (app.tubes && app.options) {
            const three = app.three;
            const size = three.size;
            const options = app.options;
            const ratio = (size.wWidth || 1) / (size.width || 1);
            const n = (options.sleepRadiusX || 280) * ratio;
            const a = (options.sleepRadiusY || 140) * ratio;
            // Autonomous mathematical trajectory without cursor following
            app.tubes.target.x = n * Math.cos(clock.elapsed * (options.sleepTimeScale1 || 0.8));
            app.tubes.target.y = a * Math.sin(clock.elapsed * (options.sleepTimeScale2 || 1.2));
            app.tubes.update(clock);
          } else if (origOnBeforeRender) {
            origOnBeforeRender.call(this, clock);
          }
        };
      }

      tubesRef.current = app;
      setIsLoaded(true);
    } catch (error) {
      console.warn('Could not initialize 3D Tubes background:', error);
      setIsLoaded(false);
    }
  }, [initialPalette, customTubesColors, customLightsColors, lightsIntensity]);

  useEffect(() => {
    initTubes();

    return () => {
      try {
        if (tubesRef.current && typeof tubesRef.current.dispose === 'function') {
          tubesRef.current.dispose();
        }
      } catch {
        // ignore
      }
      tubesRef.current = null;
    };
  }, [initTubes]);

  const randomizeColors = useCallback(() => {
    if (!tubesRef.current || !tubesRef.current.tubes) return;
    setIsShuffling(true);
    const newTubes = getRandomRedNoir(RED_NOIR_TUBES, 3);
    const newLights = getRandomRedNoir(RED_NOIR_LIGHTS, 4);

    try {
      tubesRef.current.tubes.setColors(newTubes);
      tubesRef.current.tubes.setLightsColors(newLights);
    } catch (e) {
      console.warn('Failed to randomize tube colors:', e);
    }

    setTimeout(() => setIsShuffling(false), 300);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (!enableClickInteraction) return;
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, textarea, select, [role="button"]')) {
      return;
    }
    randomizeColors();
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full min-h-[420px] overflow-hidden bg-black', className)}
      onClick={handleClick}
    >
      {/* 3D WebGL Canvas (pointer-events-none ensures cursor doesn't hijack background) */}
      <canvas
        ref={canvasRef}
        className={cn(
          'absolute inset-0 w-full h-full block pointer-events-none transition-opacity duration-1000',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{ touchAction: 'none' }}
      />

      {/* Red Noir Ambient Glow Underlay */}
      <div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[520px] h-[520px] bg-red-600/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-10 right-1/4 w-[420px] h-[420px] bg-[#ef233c]/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Interactive Shuffle Badge (optional) */}
      {showShuffleBadge && isLoaded && (
        <div className="absolute bottom-6 right-6 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              randomizeColors();
            }}
            className={cn(
              'group flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-[#ef233c]/40 text-white text-xs font-mono transition-all shadow-lg shadow-black/50',
              isShuffling ? 'scale-95' : 'hover:scale-105'
            )}
            title="Randomize 3D Neon Aura"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ef233c] animate-spin" style={{ animationDuration: '4s' }} />
            <span className="font-semibold tracking-wider">NEON AURA</span>
            <RefreshCw className={cn('w-3 h-3 text-zinc-400 transition-transform', isShuffling && 'rotate-180')} />
          </button>
        </div>
      )}

      {/* Foreground Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default TubesBackground;
