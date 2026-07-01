/**
 * GameSetupForm Component
 * Handles initial game configuration: mode, player count, multipliers, and pot
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GameMode, GameSettings } from '@/lib/settlement';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface GameSetupFormProps {
  onSubmit: (settings: GameSettings) => void;
}

export function GameSetupForm({ onSubmit }: GameSetupFormProps) {
  const [mode, setMode] = useState<GameMode>('pot');
  const [playerCount, setPlayerCount] = useState(3);
  const [scoreMultiplier, setScoreMultiplier] = useState(5);
  const [waterMultiplier, setWaterMultiplier] = useState(10);
  const [pot, setPot] = useState(190);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (playerCount < 2 || playerCount > 10) {
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
      playerCount,
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
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as GameMode)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <RadioGroupItem value="pot" id="mode-pot" />
                <Label htmlFor="mode-pot" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-slate-900">Pot 波</div>
                  <div className="text-sm text-slate-600">分數高者為贏家</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <RadioGroupItem value="pearl" id="mode-pearl" />
                <Label htmlFor="mode-pearl" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-slate-900">啤珠</div>
                  <div className="text-sm text-slate-600">分數低者為贏家</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Player Count */}
          <div className="space-y-2">
            <Label htmlFor="playerCount" className="text-base font-semibold">
              遊戲人數
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="playerCount"
                type="number"
                min="2"
                max="10"
                value={playerCount}
                onChange={(e) => setPlayerCount(parseInt(e.target.value) || 2)}
                className="w-24"
              />
              <span className="text-slate-600">人</span>
            </div>
            <p className="text-xs text-slate-500">最少 2 人，最多 10 人</p>
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
              value={scoreMultiplier}
              onChange={(e) => setScoreMultiplier(parseFloat(e.target.value) || 1)}
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
              value={waterMultiplier}
              onChange={(e) => setWaterMultiplier(parseFloat(e.target.value) || 1)}
              className="w-full"
            />
            <p className="text-xs text-slate-500">每 1 水相當於多少金額</p>
          </div>

          {/* Pot Amount */}
          <div className="space-y-2">
            <Label htmlFor="pot" className="text-base font-semibold">
              波鐘（總彩池）
            </Label>
            <Input
              id="pot"
              type="number"
              min="0"
              step="1"
              value={pot}
              onChange={(e) => setPot(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
            <p className="text-xs text-slate-500">遊戲開始時的總金額</p>
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
