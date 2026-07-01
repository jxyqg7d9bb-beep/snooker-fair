/**
 * GameSetupForm Component
 * Handles initial game configuration: mode, multipliers, player count, and pot
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GameMode, GameSettings } from '@/lib/settlement';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface GameSetupFormProps {
  onSubmit: (settings: GameSettings) => void;
  initialSettings?: GameSettings | null;
}

export function GameSetupForm({ onSubmit, initialSettings }: GameSetupFormProps) {
  const [mode, setMode] = useState<GameMode>(initialSettings?.mode || 'pot');
  const [scoreMultiplier, setScoreMultiplier] = useState(initialSettings?.scoreMultiplier || 0);
  const [waterMultiplier, setWaterMultiplier] = useState(initialSettings?.waterMultiplier || 0);
  const [playerCount, setPlayerCount] = useState(
    initialSettings?.playerCount.toString() || (initialSettings?.mode === 'pearl' ? '2' : '3')
  );

  // Determine min and max player count based on game mode
  const getPlayerCountRange = () => {
    if (mode === 'pot') {
      return { min: 3, max: 6 };
    } else {
      return { min: 2, max: 6 };
    }
  };

  const playerRange = getPlayerCountRange();

  // Reset player count if it's out of range when mode changes
  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    const newRange = newMode === 'pot' ? { min: 3, max: 6 } : { min: 2, max: 6 };
    const currentCount = parseInt(playerCount);
    if (currentCount < newRange.min) {
      setPlayerCount(newRange.min.toString());
    } else if (currentCount > newRange.max) {
      setPlayerCount(newRange.max.toString());
    }
  };
  const [pot, setPot] = useState(initialSettings?.pot || 0);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];
    const playerCountNum = parseInt(playerCount);

    if (playerCountNum < 2 || playerCountNum > 10) {
      newErrors.push('遊戲人數必須在 2-10 人之間');
    }
    if (scoreMultiplier <= 0) {
      newErrors.push('分數倍數必須大於 0');
    }
    if (waterMultiplier <= 0) {
      newErrors.push('水倍數必須大於 0');
    }
    if (pot <= 0) {
      newErrors.push('波鐘必須大於 0');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    onSubmit({
      mode,
      playerCount: playerCountNum,
      scoreMultiplier,
      waterMultiplier,
      pot,
    });
  };

  return (
    <Card className="w-full animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl">遊戲設定</CardTitle>
        <CardDescription>選擇遊戲模式並設定基本參數</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">遊戲模式</Label>
            <RadioGroup value={mode} onValueChange={(value) => handleModeChange(value as GameMode)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <RadioGroupItem value="pot" id="mode-pot" />
                <Label htmlFor="mode-pot" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-slate-900">Pot 波 🙋🏼‍♂️🆚🙋🏼‍♂️🆚🙋🏼‍♂️</div>
                  <div className="text-sm text-slate-600">分數高者為贏家</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <RadioGroupItem value="pearl" id="mode-pearl" />
                <Label htmlFor="mode-pearl" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-slate-900">啤珠 🃏🎱</div>
                  <div className="text-sm text-slate-600">分數低者為贏家</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Score Multiplier */}
          <div className="space-y-2">
            <Label htmlFor="scoreMultiplier" className="text-base font-semibold">
              分數倍數
            </Label>
            <Input
              id="scoreMultiplier"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="0"
              value={scoreMultiplier || ''}
              onChange={(e) => setScoreMultiplier(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
            <p className="text-xs text-slate-500">每 1 分相當於多少金額</p>
          </div>

          {/* Water Multiplier */}
          <div className="space-y-2">
            <Label htmlFor="waterMultiplier" className="text-base font-semibold">
              水倍數
            </Label>
            <Input
              id="waterMultiplier"
              type="number"
              min="0.1"
              step="0.1"
              placeholder="0"
              value={waterMultiplier || ''}
              onChange={(e) => setWaterMultiplier(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
            <p className="text-xs text-slate-500">每 1 水相當於多少金額</p>
          </div>

          {/* Player Count Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="playerCount" className="text-base font-semibold">
              遊戲人數
            </Label>
            <Select value={playerCount} onValueChange={setPlayerCount}>
              <SelectTrigger id="playerCount">
                <SelectValue placeholder="選擇人數" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: playerRange.max - playerRange.min + 1 }, (_, i) => playerRange.min + i).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} 人
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">最少 {playerRange.min} 人，最多 {playerRange.max} 人</p>
          </div>

          {/* Pot Amount - Moved to end */}
          <div className="space-y-2">
            <Label htmlFor="pot" className="text-base font-semibold">
              波鐘（總彩池）
            </Label>
            <Input
              id="pot"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={pot || ''}
              onChange={(e) => setPot(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
            <p className="text-xs text-slate-500">遊戲結束後填寫的總金額</p>
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
              {errors.map((error, idx) => (
                <div key={idx} className="flex gap-2 text-sm text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            下一步：輸入玩家資料
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
