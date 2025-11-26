'use client';

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { Tool, TOOL_INFO, Tile } from '@/types/game';
import {
  PlayIcon,
  PauseIcon,
  FastForwardIcon,
  CloseIcon,
  RoadIcon,
  TreeIcon,
  FireIcon,
  PowerIcon,
  WaterIcon,
  PopulationIcon,
  JobsIcon,
  MoneyIcon,
  HappyIcon,
  HealthIcon,
  EducationIcon,
  SafetyIcon,
  EnvironmentIcon,
  ChartIcon,
  TrophyIcon,
  AdvisorIcon,
  AlertIcon,
  InfoIcon,
  BudgetIcon,
  SettingsIcon,
} from './ui/Icons';

// Import shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Isometric tile dimensions
const TILE_WIDTH = 64;
const HEIGHT_RATIO = 0.65;
const TILE_HEIGHT = TILE_WIDTH * HEIGHT_RATIO;

// Convert grid coordinates to screen coordinates (isometric)
function gridToScreen(x: number, y: number, offsetX: number, offsetY: number): { screenX: number; screenY: number } {
  const screenX = (x - y) * (TILE_WIDTH / 2) + offsetX;
  const screenY = (x + y) * (TILE_HEIGHT / 2) + offsetY;
  return { screenX, screenY };
}

// Convert screen coordinates to grid coordinates
function screenToGrid(screenX: number, screenY: number, offsetX: number, offsetY: number): { gridX: number; gridY: number } {
  const adjustedX = screenX - offsetX;
  const adjustedY = screenY - offsetY;
  
  const gridX = (adjustedX / (TILE_WIDTH / 2) + adjustedY / (TILE_HEIGHT / 2)) / 2;
  const gridY = (adjustedY / (TILE_HEIGHT / 2) - adjustedX / (TILE_WIDTH / 2)) / 2;
  
  return { gridX: Math.floor(gridX), gridY: Math.floor(gridY) };
}

const EVENT_ICON_MAP: Record<string, React.ReactNode> = {
  fire: <FireIcon size={16} />,
  chart_up: <ChartIcon size={16} />,
  chart_down: <ChartIcon size={16} />,
  population: <PopulationIcon size={16} />,
  tech: <AdvisorIcon size={16} />,
  education: <EducationIcon size={16} />,
  trophy: <TrophyIcon size={16} />,
  power: <PowerIcon size={16} />,
  water: <WaterIcon size={16} />,
  road: <RoadIcon size={16} />,
  balance: <ChartIcon size={16} />,
  cash: <MoneyIcon size={16} />,
  profit: <MoneyIcon size={16} />,
  tree: <TreeIcon size={16} />,
  shield: <SafetyIcon size={16} />,
  disaster: <AlertIcon size={16} />,
  town: <PopulationIcon size={16} />,
  city: <PopulationIcon size={16} />,
  metropolis: <PopulationIcon size={16} />,
  megacity: <PopulationIcon size={16} />,
  happy: <HappyIcon size={16} />,
  environment: <EnvironmentIcon size={16} />,
  jobs: <JobsIcon size={16} />,
  planning: <AdvisorIcon size={16} />,
};

const ADVISOR_ICON_MAP: Record<string, React.ReactNode> = {
  power: <PowerIcon size={18} />,
  water: <WaterIcon size={18} />,
  cash: <MoneyIcon size={18} />,
  shield: <SafetyIcon size={18} />,
  hospital: <HealthIcon size={18} />,
  education: <EducationIcon size={18} />,
  environment: <EnvironmentIcon size={18} />,
  planning: <AdvisorIcon size={18} />,
  jobs: <JobsIcon size={18} />,
};

// Memoized Sidebar Component
const Sidebar = React.memo(function Sidebar() {
  const { state, setTool, setActivePanel } = useGame();
  const { selectedTool, stats, activePanel } = state;
  
  const toolCategories = useMemo(() => ({
    'TOOLS': ['select', 'bulldoze', 'road'] as Tool[],
    'ZONES': ['zone_residential', 'zone_commercial', 'zone_industrial', 'zone_dezone'] as Tool[],
    'SERVICES': ['police_station', 'fire_station', 'hospital', 'school', 'university', 'park'] as Tool[],
    'UTILITIES': ['power_plant', 'water_tower'] as Tool[],
    'SPECIAL': ['stadium', 'airport'] as Tool[],
  }), []);
  
  return (
    <div className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <span className="text-sidebar-foreground font-bold tracking-tight">ISOCITY</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 py-2">
        {Object.entries(toolCategories).map(([category, tools]) => (
          <div key={category} className="mb-1">
            <div className="px-4 py-2 text-[10px] font-bold tracking-widest text-muted-foreground">
              {category}
            </div>
            <div className="px-2 flex flex-col gap-0.5">
              {tools.map(tool => {
                const info = TOOL_INFO[tool];
                const isSelected = selectedTool === tool;
                const canAfford = stats.money >= info.cost;
                
                return (
                  <Button
                    key={tool}
                    onClick={() => setTool(tool)}
                    disabled={!canAfford && info.cost > 0}
                    variant={isSelected ? 'default' : 'ghost'}
                    className={`w-full justify-start gap-3 px-3 py-2 h-auto text-sm ${
                      isSelected ? 'bg-primary text-primary-foreground' : ''
                    }`}
                    title={`${info.description}${info.cost > 0 ? ` - Cost: $${info.cost}` : ''}`}
                  >
                    <span className="flex-1 text-left truncate">{info.name}</span>
                    {info.cost > 0 && (
                      <span className="text-xs opacity-60">${info.cost}</span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>
      
      <div className="border-t border-sidebar-border p-2">
        <div className="grid grid-cols-5 gap-1">
          {[
            { panel: 'budget' as const, icon: <BudgetIcon size={16} />, label: 'Budget' },
            { panel: 'statistics' as const, icon: <ChartIcon size={16} />, label: 'Statistics' },
            { panel: 'advisors' as const, icon: <AdvisorIcon size={16} />, label: 'Advisors' },
            { panel: 'achievements' as const, icon: <TrophyIcon size={16} />, label: 'Achievements' },
            { panel: 'settings' as const, icon: <SettingsIcon size={16} />, label: 'Settings' },
          ].map(({ panel, icon, label }) => (
            <Button
              key={panel}
              onClick={() => setActivePanel(activePanel === panel ? 'none' : panel)}
              variant={activePanel === panel ? 'default' : 'ghost'}
              size="icon-sm"
              className="w-full"
              title={label}
            >
              {icon}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});

// Memoized TopBar Component
const TopBar = React.memo(function TopBar() {
  const { state, setSpeed, setTaxRate, isSaving } = useGame();
  const { stats, year, month, speed, taxRate, cityName } = state;
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground font-semibold text-sm">{cityName}</h1>
            {isSaving && (
              <span className="text-muted-foreground text-xs italic animate-pulse">Saving...</span>
            )}
          </div>
          <div className="text-muted-foreground text-xs">{monthNames[month - 1]} {year}</div>
        </div>
        
        <div className="flex items-center gap-1 bg-secondary rounded-md p-1">
          {[0, 1, 2, 3].map(s => (
            <Button
              key={s}
              onClick={() => setSpeed(s as 0 | 1 | 2 | 3)}
              variant={speed === s ? 'default' : 'ghost'}
              size="icon-sm"
              className="h-7 w-7"
              title={s === 0 ? 'Pause' : s === 1 ? 'Normal' : s === 2 ? 'Fast' : 'Very Fast'}
            >
              {s === 0 ? <PauseIcon size={14} /> : 
               s === 1 ? <PlayIcon size={14} /> : 
               <FastForwardIcon size={14} />}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <StatBadge icon={<PopulationIcon size={14} />} value={stats.population.toLocaleString()} label="Pop" />
        <StatBadge icon={<JobsIcon size={14} />} value={stats.jobs.toLocaleString()} label="Jobs" />
        <StatBadge 
          icon={<MoneyIcon size={14} />} 
          value={`$${stats.money.toLocaleString()}`} 
          label="Funds"
          variant={stats.money < 0 ? 'destructive' : stats.money < 1000 ? 'warning' : 'success'}
        />
        <Separator orientation="vertical" className="h-8" />
        <StatBadge 
          icon={<span className="text-xs">+/-</span>} 
          value={`$${(stats.income - stats.expenses).toLocaleString()}`} 
          label="/mo"
          variant={stats.income - stats.expenses >= 0 ? 'success' : 'destructive'}
        />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <DemandIndicator label="R" demand={stats.demand.residential} color="text-green-500" />
          <DemandIndicator label="C" demand={stats.demand.commercial} color="text-blue-500" />
          <DemandIndicator label="I" demand={stats.demand.industrial} color="text-amber-500" />
        </div>
        
        <Separator orientation="vertical" className="h-8" />
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Tax</span>
          <Slider
            value={[taxRate]}
            onValueChange={(value) => setTaxRate(value[0])}
            min={0}
            max={20}
            step={1}
            className="w-16"
          />
          <span className="text-foreground text-xs font-mono w-8">{taxRate}%</span>
        </div>
      </div>
    </div>
  );
});

function StatBadge({ icon, value, label, variant = 'default' }: { 
  icon: React.ReactNode; 
  value: string; 
  label: string; 
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}) {
  const colorClass = variant === 'success' ? 'text-green-500' : 
                     variant === 'warning' ? 'text-amber-500' : 
                     variant === 'destructive' ? 'text-red-500' : 'text-foreground';
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <div className={`text-xs font-mono ${colorClass}`}>{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function DemandIndicator({ label, demand, color }: { label: string; demand: number; color: string }) {
  const height = Math.abs(demand) / 2;
  const isPositive = demand >= 0;
  
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-[10px] font-bold ${color}`}>{label}</span>
      <div className="w-3 h-8 bg-secondary relative rounded-sm overflow-hidden">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />
        <div
          className={`absolute left-0 right-0 ${color.replace('text-', 'bg-')}`}
          style={{
            height: `${height}%`,
            top: isPositive ? `${50 - height}%` : '50%',
          }}
        />
      </div>
    </div>
  );
}

// Memoized Stats Panel
const StatsPanel = React.memo(function StatsPanel() {
  const { state } = useGame();
  const { stats } = state;
  
  return (
    <div className="h-8 bg-secondary/50 border-b border-border flex items-center justify-center gap-8 text-xs">
      <MiniStat icon={<HappyIcon size={12} />} label="Happiness" value={stats.happiness} />
      <MiniStat icon={<HealthIcon size={12} />} label="Health" value={stats.health} />
      <MiniStat icon={<EducationIcon size={12} />} label="Education" value={stats.education} />
      <MiniStat icon={<SafetyIcon size={12} />} label="Safety" value={stats.safety} />
      <MiniStat icon={<EnvironmentIcon size={12} />} label="Environment" value={stats.environment} />
    </div>
  );
});

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  const color = value >= 70 ? 'text-green-500' : value >= 40 ? 'text-amber-500' : 'text-red-500';
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono ${color}`}>{Math.round(value)}%</span>
    </div>
  );
}

// Canvas-based Minimap - Memoized
const MiniMap = React.memo(function MiniMap() {
  const { state } = useGame();
  const { grid, gridSize } = state;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 140;
    const scale = size / gridSize;
    
    ctx.fillStyle = '#0b1723';
    ctx.fillRect(0, 0, size, size);
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const tile = grid[y][x];
        let color = '#2d5a3d';
        
        if (tile.building.type === 'water') color = '#0ea5e9';
        else if (tile.building.type === 'road') color = '#6b7280';
        else if (tile.building.type === 'tree') color = '#166534';
        else if (tile.zone === 'residential' && tile.building.type !== 'grass') color = '#22c55e';
        else if (tile.zone === 'residential') color = '#14532d';
        else if (tile.zone === 'commercial' && tile.building.type !== 'grass') color = '#38bdf8';
        else if (tile.zone === 'commercial') color = '#1d4ed8';
        else if (tile.zone === 'industrial' && tile.building.type !== 'grass') color = '#f59e0b';
        else if (tile.zone === 'industrial') color = '#b45309';
        else if (['police_station', 'fire_station', 'hospital', 'school', 'university'].includes(tile.building.type)) {
          color = '#c084fc';
        } else if (tile.building.type === 'power_plant') color = '#f97316';
        else if (tile.building.type === 'water_tower') color = '#06b6d4';
        else if (tile.building.type === 'park') color = '#84cc16';
        else if (tile.building.onFire) color = '#ef4444';
        
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, Math.ceil(scale), Math.ceil(scale));
      }
    }
  }, [grid, gridSize]);
  
  return (
    <Card className="absolute bottom-4 right-4 p-3 shadow-lg bg-card/90 border-border/70">
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-2">
        Minimap
      </div>
      <canvas
        ref={canvasRef}
        width={140}
        height={140}
        className="block rounded-md border border-border/60"
      />
      <div className="mt-2 grid grid-cols-4 gap-1 text-[8px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-sm" />
          <span className="text-muted-foreground">R</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-sm" />
          <span className="text-muted-foreground">C</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-amber-500 rounded-sm" />
          <span className="text-muted-foreground">I</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-pink-500 rounded-sm" />
          <span className="text-muted-foreground">S</span>
        </div>
      </div>
    </Card>
  );
});

// Tile Info Panel
function TileInfoPanel({ 
  tile, 
  services, 
  onClose 
}: { 
  tile: Tile; 
  services: { police: number[][]; fire: number[][]; health: number[][]; education: number[][]; power: boolean[][]; water: boolean[][] };
  onClose: () => void;
}) {
  const { x, y } = tile;
  
  return (
    <Card className="absolute top-4 right-4 w-72">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Tile ({x}, {y})</CardTitle>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <CloseIcon size={14} />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Building</span>
          <span className="capitalize">{tile.building.type.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Zone</span>
          <Badge variant={
            tile.zone === 'residential' ? 'default' :
            tile.zone === 'commercial' ? 'secondary' :
            tile.zone === 'industrial' ? 'outline' : 'secondary'
          } className={
            tile.zone === 'residential' ? 'bg-green-500/20 text-green-400' :
            tile.zone === 'commercial' ? 'bg-blue-500/20 text-blue-400' :
            tile.zone === 'industrial' ? 'bg-amber-500/20 text-amber-400' : ''
          }>
            {tile.zone === 'none' ? 'Unzoned' : tile.zone}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Level</span>
          <span>{tile.building.level}/5</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Population</span>
          <span>{tile.building.population}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Jobs</span>
          <span>{tile.building.jobs}</span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Power</span>
          <Badge variant={tile.building.powered ? 'default' : 'destructive'}>
            {tile.building.powered ? 'Connected' : 'No Power'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Water</span>
          <Badge variant={tile.building.watered ? 'default' : 'destructive'} className={tile.building.watered ? 'bg-cyan-500/20 text-cyan-400' : ''}>
            {tile.building.watered ? 'Connected' : 'No Water'}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Land Value</span>
          <span>${tile.landValue}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pollution</span>
          <span className={tile.pollution > 50 ? 'text-red-400' : tile.pollution > 25 ? 'text-amber-400' : 'text-green-400'}>
            {Math.round(tile.pollution)}%
          </span>
        </div>
        
        {tile.building.onFire && (
          <>
            <Separator />
            <div className="flex justify-between text-red-400">
              <span>ON FIRE!</span>
              <span>{Math.round(tile.building.fireProgress)}% damage</span>
            </div>
          </>
        )}
        
        <Separator />
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Service Coverage</div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Police</span>
            <span>{Math.round(services.police[y][x])}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fire</span>
            <span>{Math.round(services.fire[y][x])}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Health</span>
            <span>{Math.round(services.health[y][x])}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Education</span>
            <span>{Math.round(services.education[y][x])}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Budget Panel
function BudgetPanel() {
  const { state, setActivePanel, setBudgetFunding } = useGame();
  const { budget, stats } = state;
  
  const categories = [
    { key: 'police', ...budget.police },
    { key: 'fire', ...budget.fire },
    { key: 'health', ...budget.health },
    { key: 'education', ...budget.education },
    { key: 'transportation', ...budget.transportation },
    { key: 'parks', ...budget.parks },
    { key: 'power', ...budget.power },
    { key: 'water', ...budget.water },
  ];
  
  return (
    <Dialog open={true} onOpenChange={() => setActivePanel('none')}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Budget</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4 pb-4 border-b border-border">
            <div>
              <div className="text-muted-foreground text-xs mb-1">Income</div>
              <div className="text-green-400 font-mono">${stats.income.toLocaleString()}/mo</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1">Expenses</div>
              <div className="text-red-400 font-mono">${stats.expenses.toLocaleString()}/mo</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs mb-1">Net</div>
              <div className={`font-mono ${stats.income - stats.expenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(stats.income - stats.expenses).toLocaleString()}/mo
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {categories.map(cat => (
              <div key={cat.key} className="flex items-center gap-4">
                <Label className="w-28 text-sm">{cat.name}</Label>
                <Slider
                  value={[cat.funding]}
                  onValueChange={(value) => setBudgetFunding(cat.key as keyof typeof budget, value[0])}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="w-12 text-right font-mono text-sm">{cat.funding}%</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Achievements Panel
function AchievementsPanel() {
  const { state, setActivePanel } = useGame();
  const { achievements } = state;
  
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);
  
  return (
    <Dialog open={true} onOpenChange={() => setActivePanel('none')}>
      <DialogContent className="max-w-[500px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Achievements ({unlocked.length}/{achievements.length})</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[450px] pr-4">
          {unlocked.length > 0 && (
            <div className="mb-6">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Unlocked</div>
              <div className="grid grid-cols-2 gap-2">
                {unlocked.map(a => (
                  <Card key={a.id} className="p-3 border-l-2 border-l-primary">
                    <div className="text-foreground text-sm font-medium">{a.name}</div>
                    <div className="text-muted-foreground text-xs mt-1">{a.description}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Locked</div>
            <div className="grid grid-cols-2 gap-2">
              {locked.map(a => (
                <Card key={a.id} className="p-3 opacity-60">
                  <div className="text-foreground text-sm font-medium">{a.name}</div>
                  <div className="text-muted-foreground text-xs mt-1">{a.requirement}</div>
                  {a.progress !== undefined && a.target && (
                    <div className="mt-2">
                      <Progress value={(a.progress / a.target) * 100} className="h-1" />
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {a.progress.toLocaleString()} / {a.target.toLocaleString()}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// Statistics Panel
function StatisticsPanel() {
  const { state, setActivePanel } = useGame();
  const { history, stats } = state;
  const [activeTab, setActiveTab] = useState<'population' | 'money' | 'happiness'>('population');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    
    ctx.fillStyle = '#1a1f2e';
    ctx.fillRect(0, 0, width, height);
    
    let data: number[] = [];
    let color = '#10b981';
    const formatValue = (v: number) => v.toLocaleString();
    
    switch (activeTab) {
      case 'population':
        data = history.map(h => h.population);
        color = '#10b981';
        break;
      case 'money':
        data = history.map(h => h.money);
        color = '#f59e0b';
        break;
      case 'happiness':
        data = history.map(h => h.happiness);
        color = '#ec4899';
        break;
    }
    
    if (data.length < 2) return;
    
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;
    
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - padding * 2) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const stepX = (width - padding * 2) / (data.length - 1);
    
    data.forEach((val, i) => {
      const x = padding + i * stepX;
      const y = padding + (height - padding * 2) * (1 - (val - minVal) / range);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
  }, [history, activeTab]);
  
  return (
    <Dialog open={true} onOpenChange={() => setActivePanel('none')}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>City Statistics</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <Card className="p-3">
              <div className="text-muted-foreground text-xs mb-1">Population</div>
              <div className="font-mono font-semibold text-green-400">{stats.population.toLocaleString()}</div>
            </Card>
            <Card className="p-3">
              <div className="text-muted-foreground text-xs mb-1">Jobs</div>
              <div className="font-mono font-semibold text-blue-400">{stats.jobs.toLocaleString()}</div>
            </Card>
            <Card className="p-3">
              <div className="text-muted-foreground text-xs mb-1">Treasury</div>
              <div className="font-mono font-semibold text-amber-400">${stats.money.toLocaleString()}</div>
            </Card>
            <Card className="p-3">
              <div className="text-muted-foreground text-xs mb-1">Monthly</div>
              <div className={`font-mono font-semibold ${stats.income - stats.expenses >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${(stats.income - stats.expenses).toLocaleString()}
              </div>
            </Card>
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="population">Population</TabsTrigger>
              <TabsTrigger value="money">Money</TabsTrigger>
              <TabsTrigger value="happiness">Happiness</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Card className="p-4">
            {history.length < 2 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                Not enough data yet. Keep playing to see historical trends.
              </div>
            ) : (
              <canvas ref={canvasRef} width={536} height={200} className="w-full rounded-md" />
            )}
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Settings Panel
function SettingsPanel() {
  const { state, setActivePanel, setDisastersEnabled, newGame } = useGame();
  const { disastersEnabled, cityName, gridSize } = state;
  const [newCityName, setNewCityName] = useState(cityName);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);
  
  return (
    <Dialog open={true} onOpenChange={() => setActivePanel('none')}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Game Settings</div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <Label>Disasters</Label>
                <p className="text-muted-foreground text-xs">Enable random fires and disasters</p>
              </div>
              <Switch
                checked={disastersEnabled}
                onCheckedChange={setDisastersEnabled}
              />
            </div>
          </div>
          
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">City Information</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>City Name</span>
                <span className="text-foreground">{cityName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Grid Size</span>
                <span className="text-foreground">{gridSize} x {gridSize}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Auto-Save</span>
                <span className="text-green-400">Enabled</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Controls</div>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Pan</span><span className="text-foreground">Alt + Drag / Middle Click</span></div>
              <div className="flex justify-between"><span>Zoom</span><span className="text-foreground">Scroll Wheel</span></div>
              <div className="flex justify-between"><span>Place Multiple</span><span className="text-foreground">Click + Drag</span></div>
              <div className="flex justify-between"><span>View Tile Info</span><span className="text-foreground">Select Tool + Click</span></div>
            </div>
          </div>
          
          <Separator />
          
          {!showNewGameConfirm ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowNewGameConfirm(true)}
            >
              Start New Game
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm text-center">Are you sure? This will reset all progress.</p>
              <Input
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                placeholder="New city name..."
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewGameConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    newGame(newCityName || 'New City', gridSize);
                    setActivePanel('none');
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Advisors Panel
function AdvisorsPanel() {
  const { state, setActivePanel } = useGame();
  const { advisorMessages, stats } = state;
  
  const avgRating = (stats.happiness + stats.health + stats.education + stats.safety + stats.environment) / 5;
  const grade = avgRating >= 90 ? 'A+' : avgRating >= 80 ? 'A' : avgRating >= 70 ? 'B' : avgRating >= 60 ? 'C' : avgRating >= 50 ? 'D' : 'F';
  const gradeColor = avgRating >= 70 ? 'text-green-400' : avgRating >= 50 ? 'text-amber-400' : 'text-red-400';
  
  return (
    <Dialog open={true} onOpenChange={() => setActivePanel('none')}>
      <DialogContent className="max-w-[500px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle>City Advisors</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="flex items-center gap-4 p-4">
            <div 
              className={`w-16 h-16 flex items-center justify-center text-3xl font-black rounded-md ${gradeColor} bg-secondary`}
            >
              {grade}
            </div>
            <div>
              <div className="text-foreground font-semibold">Overall City Rating</div>
              <div className="text-muted-foreground text-sm">Based on happiness, health, education, safety & environment</div>
            </div>
          </Card>
          
          <ScrollArea className="max-h-[350px]">
            <div className="space-y-3 pr-4">
              {advisorMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AdvisorIcon size={32} className="mx-auto mb-3 opacity-50" />
                  <div className="text-sm">No urgent issues to report!</div>
                  <div className="text-xs mt-1">Your city is running smoothly.</div>
                </div>
              ) : (
                advisorMessages.map((advisor, i) => (
                  <Card key={i} className={`p-3 ${
                    advisor.priority === 'critical' ? 'border-l-2 border-l-red-500' :
                    advisor.priority === 'high' ? 'border-l-2 border-l-amber-500' :
                    advisor.priority === 'medium' ? 'border-l-2 border-l-yellow-500' : ''
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg text-muted-foreground">
                        {ADVISOR_ICON_MAP[advisor.icon] || <InfoIcon size={18} />}
                      </span>
                      <span className="text-foreground font-medium text-sm">{advisor.name}</span>
                      <Badge 
                        variant={
                          advisor.priority === 'critical' ? 'destructive' :
                          advisor.priority === 'high' ? 'destructive' : 'secondary'
                        }
                        className="ml-auto text-[10px]"
                      >
                        {advisor.priority}
                      </Badge>
                    </div>
                    {advisor.messages.map((msg, j) => (
                      <div key={j} className="text-muted-foreground text-sm leading-relaxed">{msg}</div>
                    ))}
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type OverlayMode = 'none' | 'power' | 'water';

// Image cache for building sprites
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Preload building images
const BUILDING_IMAGES: Record<string, string> = {
  residential: '/assets/buildings/residential.png',
  commercial: '/assets/buildings/commercial.png',
  industrial: '/assets/buildings/industrial.png',
  fire_station: '/assets/buildings/fire_station.png',
  hospital: '/assets/buildings/hospital.png',
  park: '/assets/buildings/park.png',
  police_station: '/assets/buildings/police_station.png',
  school: '/assets/buildings/school.png',
  university: '/assets/buildings/university.png',
  water_tower: '/assets/buildings/watertower.png',
  power_plant: '/assets/buildings/powerplant.png',
  stadium: '/assets/buildings/stadium.png',
  tree: '/assets/buildings/trees.png',
};

// Canvas-based Isometric Grid - HIGH PERFORMANCE
function CanvasIsometricGrid({ overlayMode, selectedTile, setSelectedTile }: { 
  overlayMode: OverlayMode; 
  selectedTile: { x: number; y: number } | null; 
  setSelectedTile: (tile: { x: number; y: number } | null) => void;
}) {
  const { state, placeAtTile } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 620, y: 160 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [lastPlacedTile, setLastPlacedTile] = useState<{ x: number; y: number } | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [dragStartTile, setDragStartTile] = useState<{ x: number; y: number } | null>(null);
  const [dragEndTile, setDragEndTile] = useState<{ x: number; y: number } | null>(null);
  
  const { grid, gridSize, selectedTool } = state;
  
  const supportsDrag = ['zone_residential', 'zone_commercial', 'zone_industrial', 'zone_dezone'].includes(selectedTool);
  
  // Load all building images on mount
  useEffect(() => {
    Promise.all(Object.values(BUILDING_IMAGES).map(src => loadImage(src)))
      .then(() => setImagesLoaded(true))
      .catch(console.error);
  }, []);
  
  // Update canvas size on resize with high-DPI support
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Set display size
        canvasRef.current.style.width = `${rect.width}px`;
        canvasRef.current.style.height = `${rect.height}px`;
        
        // Set actual size in memory (scaled for DPI)
        setCanvasSize({
          width: Math.round(rect.width * dpr),
          height: Math.round(rect.height * dpr),
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Main render function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imagesLoaded) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    
    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f1419');
    gradient.addColorStop(0.5, '#141c24');
    gradient.addColorStop(1, '#1a2a1f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    // Scale for device pixel ratio first, then apply zoom
    ctx.scale(dpr * zoom, dpr * zoom);
    ctx.translate(offset.x / zoom, offset.y / zoom);
    
    // Calculate visible tile range for culling (account for DPR in canvas size)
    const viewWidth = canvas.width / (dpr * zoom);
    const viewHeight = canvas.height / (dpr * zoom);
    const viewLeft = -offset.x / zoom - TILE_WIDTH;
    const viewTop = -offset.y / zoom - TILE_HEIGHT * 2;
    const viewRight = viewWidth - offset.x / zoom + TILE_WIDTH;
    const viewBottom = viewHeight - offset.y / zoom + TILE_HEIGHT * 2;
    
    // Draw tiles in isometric order (back to front)
    for (let sum = 0; sum < gridSize * 2 - 1; sum++) {
      for (let x = Math.max(0, sum - gridSize + 1); x <= Math.min(sum, gridSize - 1); x++) {
        const y = sum - x;
        if (y < 0 || y >= gridSize) continue;
        
        const { screenX, screenY } = gridToScreen(x, y, 0, 0);
        
        // Viewport culling
        if (screenX + TILE_WIDTH < viewLeft || screenX > viewRight ||
            screenY + TILE_HEIGHT * 4 < viewTop || screenY > viewBottom) {
          continue;
        }
        
        const tile = grid[y][x];
        const isHovered = hoveredTile?.x === x && hoveredTile?.y === y;
        const isSelected = selectedTile?.x === x && selectedTile?.y === y;
        
        // Check if tile is in drag selection rectangle
        const isInDragRect = dragStartTile && dragEndTile && 
          x >= Math.min(dragStartTile.x, dragEndTile.x) &&
          x <= Math.max(dragStartTile.x, dragEndTile.x) &&
          y >= Math.min(dragStartTile.y, dragEndTile.y) &&
          y <= Math.max(dragStartTile.y, dragEndTile.y);
        
        // Draw base tile
        drawIsometricTile(ctx, screenX, screenY, tile, !!(isHovered || isSelected || isInDragRect));
        
        // Draw building if present
        if (tile.building.type !== 'grass' && tile.building.type !== 'empty') {
          drawBuilding(ctx, screenX, screenY, tile);
        }
        
        // Draw overlay
        if (overlayMode !== 'none' && tile.building.type !== 'grass' && tile.building.type !== 'water' && tile.building.type !== 'road') {
          const hasService = overlayMode === 'power' ? tile.building.powered : tile.building.watered;
          ctx.fillStyle = hasService ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath();
          ctx.moveTo(screenX + TILE_WIDTH / 2, screenY);
          ctx.lineTo(screenX + TILE_WIDTH, screenY + TILE_HEIGHT / 2);
          ctx.lineTo(screenX + TILE_WIDTH / 2, screenY + TILE_HEIGHT);
          ctx.lineTo(screenX, screenY + TILE_HEIGHT / 2);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    
    ctx.restore();
  }, [grid, gridSize, offset, zoom, hoveredTile, selectedTile, overlayMode, imagesLoaded, canvasSize, dragStartTile, dragEndTile]);
  
  // Draw isometric tile base
  function drawIsometricTile(ctx: CanvasRenderingContext2D, x: number, y: number, tile: Tile, highlight: boolean) {
    const w = TILE_WIDTH;
    const h = TILE_HEIGHT;
    
    // Determine tile colors (top face and shading)
    let topColor = '#4a7c3f'; // grass
    let leftColor = '#3d6634';
    let rightColor = '#5a8f4f';
    let strokeColor = '#2d4a26';
    
    // Check if this is a building (not grass, empty, water, road, or tree)
    const isBuilding = tile.building.type !== 'grass' && 
                       tile.building.type !== 'empty' && 
                       tile.building.type !== 'water' && 
                       tile.building.type !== 'road' && 
                       tile.building.type !== 'tree';
    
    if (tile.building.type === 'water') {
      topColor = '#2563eb';
      leftColor = '#1d4ed8';
      rightColor = '#3b82f6';
      strokeColor = '#1e3a8a';
    } else if (tile.building.type === 'road') {
      topColor = '#4a4a4a';
      leftColor = '#3a3a3a';
      rightColor = '#5a5a5a';
      strokeColor = '#333';
    } else if (isBuilding) {
      // White tiles for all buildings
      topColor = '#ffffff';
      leftColor = '#e5e5e5';
      rightColor = '#f5f5f5';
      strokeColor = '#cccccc';
    } else if (tile.zone === 'residential') {
      if (tile.building.type !== 'grass' && tile.building.type !== 'empty') {
        topColor = '#3d7c3f';
        leftColor = '#2d6634';
        rightColor = '#4d8f4f';
      } else {
        topColor = '#2d5a2d';
        leftColor = '#1d4a1d';
        rightColor = '#3d6a3d';
      }
      strokeColor = '#22c55e';
    } else if (tile.zone === 'commercial') {
      if (tile.building.type !== 'grass' && tile.building.type !== 'empty') {
        topColor = '#3a5c7c';
        leftColor = '#2a4c6c';
        rightColor = '#4a6c8c';
      } else {
        topColor = '#2a4a6a';
        leftColor = '#1a3a5a';
        rightColor = '#3a5a7a';
      }
      strokeColor = '#3b82f6';
    } else if (tile.zone === 'industrial') {
      if (tile.building.type !== 'grass' && tile.building.type !== 'empty') {
        topColor = '#7c5c3a';
        leftColor = '#6c4c2a';
        rightColor = '#8c6c4a';
      } else {
        topColor = '#6a4a2a';
        leftColor = '#5a3a1a';
        rightColor = '#7a5a3a';
      }
      strokeColor = '#f59e0b';
    }
    
    // Draw the isometric diamond (top face)
    ctx.fillStyle = topColor;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w / 2, y + h);
    ctx.lineTo(x, y + h / 2);
    ctx.closePath();
    ctx.fill();
    
    // Draw grid lines (always)
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    
    // Draw zone border with dashed line
    if (tile.zone !== 'none') {
      ctx.strokeStyle = tile.zone === 'residential' ? '#22c55e' : 
                        tile.zone === 'commercial' ? '#3b82f6' : '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Highlight on hover/select
    if (highlight) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  
  // Helper function to check if a tile has a road
  function hasRoad(gridX: number, gridY: number): boolean {
    if (gridX < 0 || gridX >= gridSize || gridY < 0 || gridY >= gridSize) return false;
    return grid[gridY][gridX].building.type === 'road';
  }
  
  // Draw road with proper adjacency and markings
  function drawRoad(ctx: CanvasRenderingContext2D, x: number, y: number, gridX: number, gridY: number) {
    const w = TILE_WIDTH;
    const h = TILE_HEIGHT;
    const cx = x + w / 2;
    const cy = y + h / 2;
    
    // Check adjacency (in isometric coordinates)
    const north = hasRoad(gridX - 1, gridY);  // top-left edge
    const east = hasRoad(gridX, gridY - 1);   // top-right edge
    const south = hasRoad(gridX + 1, gridY);  // bottom-right edge
    const west = hasRoad(gridX, gridY + 1);   // bottom-left edge
    
    // Road width
    const roadW = w * 0.15;
    const roadH = h * 0.15;
    
    // Draw road segments to connected edges
    ctx.fillStyle = '#4a4a4a';
    
    // North segment (to top-left)
    if (north) {
      ctx.beginPath();
      ctx.moveTo(cx - roadW * 0.7, cy - roadH * 0.7);
      ctx.lineTo(x + w * 0.25 - roadW * 0.5, y + h * 0.25 - roadH * 0.5);
      ctx.lineTo(x + w * 0.25 + roadW * 0.5, y + h * 0.25 + roadH * 0.5);
      ctx.lineTo(cx + roadW * 0.7, cy + roadH * 0.7);
      ctx.closePath();
      ctx.fill();
    }
    
    // East segment (to top-right)
    if (east) {
      ctx.beginPath();
      ctx.moveTo(cx + roadW * 0.7, cy - roadH * 0.7);
      ctx.lineTo(x + w * 0.75 + roadW * 0.5, y + h * 0.25 - roadH * 0.5);
      ctx.lineTo(x + w * 0.75 - roadW * 0.5, y + h * 0.25 + roadH * 0.5);
      ctx.lineTo(cx - roadW * 0.7, cy + roadH * 0.7);
      ctx.closePath();
      ctx.fill();
    }
    
    // South segment (to bottom-right)
    if (south) {
      ctx.beginPath();
      ctx.moveTo(cx + roadW * 0.7, cy + roadH * 0.7);
      ctx.lineTo(x + w * 0.75 + roadW * 0.5, y + h * 0.75 + roadH * 0.5);
      ctx.lineTo(x + w * 0.75 - roadW * 0.5, y + h * 0.75 - roadH * 0.5);
      ctx.lineTo(cx - roadW * 0.7, cy - roadH * 0.7);
      ctx.closePath();
      ctx.fill();
    }
    
    // West segment (to bottom-left)
    if (west) {
      ctx.beginPath();
      ctx.moveTo(cx - roadW * 0.7, cy + roadH * 0.7);
      ctx.lineTo(x + w * 0.25 - roadW * 0.5, y + h * 0.75 + roadH * 0.5);
      ctx.lineTo(x + w * 0.25 + roadW * 0.5, y + h * 0.75 - roadH * 0.5);
      ctx.lineTo(cx + roadW * 0.7, cy - roadH * 0.7);
      ctx.closePath();
      ctx.fill();
    }
    
    // Center intersection (always drawn)
    const centerSize = roadW * 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - centerSize);
    ctx.lineTo(cx + centerSize, cy);
    ctx.lineTo(cx, cy + centerSize);
    ctx.lineTo(cx - centerSize, cy);
    ctx.closePath();
    ctx.fill();
    
    // Draw road markings (yellow dashed lines)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    
    // North marking (toward top-left)
    if (north) {
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy - 3);
      ctx.lineTo(x + w * 0.25 - 3, y + h * 0.25 - 3);
      ctx.stroke();
    }
    
    // East marking (toward top-right)
    if (east) {
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy - 3);
      ctx.lineTo(x + w * 0.75 + 3, y + h * 0.25 - 3);
      ctx.stroke();
    }
    
    // South marking (toward bottom-right)
    if (south) {
      ctx.beginPath();
      ctx.moveTo(cx + 3, cy + 3);
      ctx.lineTo(x + w * 0.75 + 3, y + h * 0.75 + 3);
      ctx.stroke();
    }
    
    // West marking (toward bottom-left)
    if (west) {
      ctx.beginPath();
      ctx.moveTo(cx - 3, cy + 3);
      ctx.lineTo(x + w * 0.25 - 3, y + h * 0.75 + 3);
      ctx.stroke();
    }
    
    ctx.setLineDash([]);
  }
  
  // Draw building sprite
  function drawBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, tile: Tile) {
    const buildingType = tile.building.type;
    const w = TILE_WIDTH;
    const h = TILE_HEIGHT;
    
    // Handle roads separately with adjacency
    if (buildingType === 'road') {
      drawRoad(ctx, x, y, tile.x, tile.y);
      return;
    }
    
    // Map building types to images
    let imageSrc: string | null = null;
    let sizeMultiplier = 1.8; // Default size for buildings
    
    if (['house_small', 'house_medium', 'apartment_low', 'apartment_high', 'mansion'].includes(buildingType)) {
      imageSrc = BUILDING_IMAGES.residential;
    } else if (['shop_small', 'shop_medium', 'office_low', 'office_high', 'mall'].includes(buildingType)) {
      imageSrc = BUILDING_IMAGES.commercial;
    } else if (['factory_small', 'factory_medium', 'factory_large', 'warehouse'].includes(buildingType)) {
      imageSrc = BUILDING_IMAGES.industrial;
    } else if (BUILDING_IMAGES[buildingType]) {
      imageSrc = BUILDING_IMAGES[buildingType];
      // Larger buildings need bigger sprites
      if (buildingType === 'power_plant') sizeMultiplier = 2.5;
      else if (buildingType === 'stadium') sizeMultiplier = 3.5;
      else if (buildingType === 'university') sizeMultiplier = 2.8;
      else if (buildingType === 'hospital') sizeMultiplier = 1.65; // Scaled down 25% from 2.2
      else if (buildingType === 'fire_station') sizeMultiplier = 1.35; // Scaled down 25% from 1.8
      else if (buildingType === 'police_station') sizeMultiplier = 1.35; // Scaled down 25% from 1.8
      else if (buildingType === 'park') sizeMultiplier = 1.134; // Scaled down 40% total (30% + 10%) from 1.8
    }
    
    if (imageSrc && imageCache.has(imageSrc)) {
      const img = imageCache.get(imageSrc)!;
      const imgSize = w * sizeMultiplier;
      
      // Calculate position to center building on tile
      const drawX = x + w / 2 - imgSize / 2;
      const drawY = y - imgSize + h + imgSize * 0.15;
      
      // Draw with crisp rendering
      ctx.drawImage(
        img,
        Math.round(drawX),
        Math.round(drawY),
        Math.round(imgSize),
        Math.round(imgSize)
      );
    }
    
    // Draw fire effect
    if (tile.building.onFire) {
      const fireX = x + w / 2;
      const fireY = y - 10;
      
      // Outer glow
      ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(fireX, fireY, 18, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Inner flame
      ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
      ctx.beginPath();
      ctx.ellipse(fireX, fireY + 5, 10, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Core
      ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
      ctx.beginPath();
      ctx.ellipse(fireX, fireY + 8, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      e.preventDefault();
      return;
    }
    
    if (e.button === 0) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = (e.clientX - rect.left) / zoom;
        const mouseY = (e.clientY - rect.top) / zoom;
        const { gridX, gridY } = screenToGrid(mouseX, mouseY, offset.x / zoom, offset.y / zoom);
        
        if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
          if (selectedTool === 'select') {
            setSelectedTile({ x: gridX, y: gridY });
          } else if (supportsDrag) {
            // Start drag rectangle selection
            setDragStartTile({ x: gridX, y: gridY });
            setDragEndTile({ x: gridX, y: gridY });
            setIsDragging(true);
          } else {
            // Single placement for non-drag tools
            placeAtTile(gridX, gridY);
          }
        }
      }
    }
  }, [offset, gridSize, selectedTool, placeAtTile, zoom, supportsDrag, setSelectedTile]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = (e.clientX - rect.left) / zoom;
      const mouseY = (e.clientY - rect.top) / zoom;
      const { gridX, gridY } = screenToGrid(mouseX, mouseY, offset.x / zoom, offset.y / zoom);
      
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        setHoveredTile({ x: gridX, y: gridY });
        
        // Update drag rectangle end point
        if (isDragging && supportsDrag && dragStartTile) {
          setDragEndTile({ x: gridX, y: gridY });
        }
      } else {
        setHoveredTile(null);
      }
    }
  }, [isPanning, isDragging, dragStart, offset, gridSize, zoom, supportsDrag, dragStartTile]);
  
  const handleMouseUp = useCallback(() => {
    // Fill the drag rectangle when mouse is released
    if (isDragging && dragStartTile && dragEndTile && supportsDrag) {
      const minX = Math.min(dragStartTile.x, dragEndTile.x);
      const maxX = Math.max(dragStartTile.x, dragEndTile.x);
      const minY = Math.min(dragStartTile.y, dragEndTile.y);
      const maxY = Math.max(dragStartTile.y, dragEndTile.y);
      
      // Place at all tiles in the rectangle
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          placeAtTile(x, y);
        }
      }
    }
    
    setIsPanning(false);
    setIsDragging(false);
    setLastPlacedTile(null);
    setDragStartTile(null);
    setDragEndTile(null);
  }, [isDragging, dragStartTile, dragEndTile, supportsDrag, placeAtTile]);
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom(z => Math.max(0.3, Math.min(2, z + delta)));
  }, []);
  
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ 
        cursor: isPanning ? 'grabbing' : isDragging ? 'crosshair' : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="block"
      />
      
      {selectedTile && selectedTool === 'select' && (
        <TileInfoPanel
          tile={grid[selectedTile.y][selectedTile.x]}
          services={state.services}
          onClose={() => setSelectedTile(null)}
        />
      )}
      
      {hoveredTile && selectedTool !== 'select' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/90 border border-border px-4 py-2 rounded-md text-sm">
          {isDragging && dragStartTile && dragEndTile ? (
            <>
              {TOOL_INFO[selectedTool].name} - {Math.abs(dragEndTile.x - dragStartTile.x) + 1}x{Math.abs(dragEndTile.y - dragStartTile.y) + 1} area
              {TOOL_INFO[selectedTool].cost > 0 && ` - $${TOOL_INFO[selectedTool].cost * (Math.abs(dragEndTile.x - dragStartTile.x) + 1) * (Math.abs(dragEndTile.y - dragStartTile.y) + 1)}`}
            </>
          ) : (
            <>
              {TOOL_INFO[selectedTool].name} at ({hoveredTile.x}, {hoveredTile.y})
              {TOOL_INFO[selectedTool].cost > 0 && ` - $${TOOL_INFO[selectedTool].cost}`}
              {supportsDrag && ' - Drag to zone area'}
            </>
          )}
        </div>
      )}
      
      <Badge variant="secondary" className="absolute bottom-4 left-4 font-mono">
        {Math.round(zoom * 100)}%
      </Badge>
    </div>
  );
}

// Overlay Mode Toggle
const OverlayModeToggle = React.memo(function OverlayModeToggle({ 
  overlayMode, 
  setOverlayMode 
}: { 
  overlayMode: OverlayMode; 
  setOverlayMode: (mode: OverlayMode) => void;
}) {
  return (
    <Card className="absolute top-4 left-4 p-2 shadow-lg bg-card/90 border-border/70 z-50">
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-2">
        View Overlay
      </div>
      <div className="flex gap-1">
        <Button
          variant={overlayMode === 'none' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setOverlayMode('none')}
          className="h-8 px-3"
          title="No Overlay"
        >
          <CloseIcon size={14} />
        </Button>
        
        <Button
          variant={overlayMode === 'power' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setOverlayMode('power')}
          className={`h-8 px-3 ${overlayMode === 'power' ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
          title="Power Grid"
        >
          <PowerIcon size={14} />
        </Button>
        
        <Button
          variant={overlayMode === 'water' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setOverlayMode('water')}
          className={`h-8 px-3 ${overlayMode === 'water' ? 'bg-cyan-500 hover:bg-cyan-600' : ''}`}
          title="Water Supply"
        >
          <WaterIcon size={14} />
        </Button>
      </div>
    </Card>
  );
});

// Main Game Component
export default function Game() {
  const { state, setTool, setActivePanel } = useGame();
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('none');
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  
  useEffect(() => {
    if (state.selectedTool === 'power_plant') {
      setOverlayMode('power');
    } else if (state.selectedTool === 'water_tower') {
      setOverlayMode('water');
    }
  }, [state.selectedTool]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.activePanel !== 'none') {
          setActivePanel('none');
        } else if (selectedTile) {
          setSelectedTile(null);
        } else if (state.selectedTool !== 'select') {
          setTool('select');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.activePanel, state.selectedTool, selectedTile, setActivePanel, setTool]);
  
  return (
    <TooltipProvider>
      <div className="w-full h-full min-h-[720px] overflow-hidden bg-background flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <TopBar />
          <StatsPanel />
          <div className="flex-1 relative">
            <CanvasIsometricGrid overlayMode={overlayMode} selectedTile={selectedTile} setSelectedTile={setSelectedTile} />
            <OverlayModeToggle overlayMode={overlayMode} setOverlayMode={setOverlayMode} />
            <MiniMap />
          </div>
        </div>
        
        {state.activePanel === 'budget' && <BudgetPanel />}
        {state.activePanel === 'achievements' && <AchievementsPanel />}
        {state.activePanel === 'statistics' && <StatisticsPanel />}
        {state.activePanel === 'advisors' && <AdvisorsPanel />}
        {state.activePanel === 'settings' && <SettingsPanel />}
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-muted-foreground text-xs pointer-events-none">
          Alt+Drag or Middle-click to pan • Scroll to zoom • Drag zones to create areas • Auto-saves to browser
        </div>
      </div>
    </TooltipProvider>
  );
}
