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
import { t } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface GameSetupFormProps {
  onSubmit: (settings: GameSettings) => void;
  initialSettings?: GameSettings | null;
}

export function GameSetupForm({ onSubmit, initialSettings }: GameSetupFormProps) {
  const { language } = useLanguage();
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

    const minPlayers = mode === 'pot' ? 3 : 2;
    const maxPlayers = 6;
    if (playerCountNum < minPlayers || playerCountNum > maxPlayers) {
      newErrors.push(t('playerCountError', language, { min: minPlayers, max: maxPlayers }));
    }
    if (scoreMultiplier <= 0) {
      newErrors.push(t('scoreMultiplierError', language));
    }
    if (waterMultiplier <= 0) {
      newErrors.push(t('penaltyMultiplierError', language));
    }
    if (pot <= 0) {
      newErrors.push(t('tableRateError', language));
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
        <CardTitle className="text-2xl">{t('gameSetupTitle', language)}</CardTitle>
        <CardDescription>{t('gameSetupDescription', language)}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Game Mode Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">{t('gameMode', language)}</Label>
            <RadioGroup value={mode} onValueChange={(value) => handleModeChange(value as GameMode)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <RadioGroupItem value="pot" id="mode-pot" />
                <Label htmlFor="mode-pot" className="flex-1 cursor-pointer min-w-0">
                  <div className="font-semibold text-slate-900">
                    {language === 'zh' ? 'Pot 波' : 'Three-player competition'}{' '}
                    <span>🙋🏼‍♂️🆚🙋🏼‍♂️🆚🙋🏼‍♂️</span>
                  </div>
                  <div className="text-sm text-slate-600">{t('potModeDesc', language)}</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <RadioGroupItem value="pearl" id="mode-pearl" />
                <Label htmlFor="mode-pearl" className="flex-1 cursor-pointer">
                  <div className="font-semibold text-slate-900">{language === 'zh' ? '啤珠 🃏🎱' : 'Poker Pool 🃏🎱'}</div>
                  <div className="text-sm text-slate-600">{t('pearlModeDesc', language)}</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Score Multiplier */}
          <div className="space-y-2">
            <Label htmlFor="scoreMultiplier" className="text-base font-semibold">
              {t('scoreMultiplier', language)}
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
            <p className="text-xs text-slate-500">{t('scoreMultiplierHint', language)}</p>
          </div>

          {/* Penalty Multiplier */}
          <div className="space-y-2">
            <Label htmlFor="waterMultiplier" className="text-base font-semibold">
              {t('penaltyMultiplier', language)}
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
            <p className="text-xs text-slate-500">{t('penaltyMultiplierHint', language)}</p>
          </div>

          {/* Player Count Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="playerCount" className="text-base font-semibold">
              {t('playerCount', language)}
            </Label>
            <Select value={playerCount} onValueChange={setPlayerCount}>
              <SelectTrigger id="playerCount">
                <SelectValue placeholder={t('selectPlayerCount', language)} />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: playerRange.max - playerRange.min + 1 }, (_, i) => playerRange.min + i).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {language === 'zh' ? '人' : 'player'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">{t('playerCountRange', language, { min: playerRange.min, max: playerRange.max })}</p>
          </div>

          {/* Table Rate - Moved to end */}
          <div className="space-y-2">
            <Label htmlFor="pot" className="text-base font-semibold">
              {language === 'zh' ? '波鐘' : 'Table Rate'}
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
            <p className="text-xs text-slate-500">{t('tableRateHint', language)}</p>
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
            {t('nextButton', language)}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
