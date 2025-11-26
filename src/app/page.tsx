'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { GameProvider } from '@/context/GameContext';
import Game from '@/components/Game';
import Image from 'next/image';

const STORAGE_KEY = 'isocity-game-state';

// Building assets to display
const BUILDINGS = [
  'residential.png',
  'commercial.png',
  'industrial.png',
  'park.png',
  'school.png',
  'hospital.png',
  'police_station.png',
  'fire_station.png',
  'powerplant.png',
  'watertower.png',
  'university.png',
  'stadium.png',
  'airport.png',
  'trees.png',
];

// Check if there's a saved game in localStorage
function hasSavedGame(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.grid && parsed.gridSize && parsed.stats;
    }
  } catch (e) {
    return false;
  }
  return false;
}

export default function HomePage() {
  const [showGame, setShowGame] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check for saved game after mount (client-side only)
  useEffect(() => {
    setIsChecking(false);
    if (hasSavedGame()) {
      setShowGame(true);
    }
  }, []);

  if (isChecking) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white/60">Loading...</div>
      </main>
    );
  }

  if (showGame) {
    return (
      <GameProvider>
        <main className="h-screen w-screen overflow-hidden">
          <Game />
        </main>
      </GameProvider>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left - Title and Start Button */}
        <div className="flex flex-col items-center lg:items-start justify-center space-y-12">
          <h1 className="text-8xl font-light tracking-wider text-white/90">
            IsoCity
          </h1>
          <Button 
            onClick={() => setShowGame(true)}
            className="px-12 py-8 text-2xl font-light tracking-wide bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-none transition-all duration-300"
          >
            Start
          </Button>
        </div>

        {/* Right - Building Gallery */}
        <div className="grid grid-cols-4 gap-4">
          {BUILDINGS.map((building, index) => (
            <div 
              key={building}
              className="aspect-square bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition-all duration-300 group"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="w-full h-full relative opacity-70 group-hover:opacity-100 transition-opacity">
                <Image
                  src={`/assets/buildings/${building}`}
                  alt={building.replace('.png', '').replace('_', ' ')}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
