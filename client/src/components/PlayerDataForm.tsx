/**
 * PlayerDataForm Component
 * Handles input for each player's score and water number
 * Mobile-optimized: compact grid layout, all players visible without excessive scrolling
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GameSettings, Player } from '@/lib/settlement';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface PlayerDataFormProps {
  settings: GameSettings;
  onSubmit: (players: Player[]) => void;
  onBack: () => void;
  initialPlayers?: Player[] | null;
}

export function PlayerDataForm({ settings, onSubmit, onBack, initialPlayers }: PlayerDataFormProps) {
  const { language } = useLanguage();
  const [players, setPlayers] = useState<Player[]>(
    initialPlayers && initialPlayers.length === settings.playerCount
      ? initialPlayers
      : Array.from({ length: settings.playerCount }, (_, i) => ({
          id: `player-${i}`,
          name: String.fromCharCode(65 + i), // A, B, C, ...
          score: 0,
          water: 0,
        }))
  );
  const [errors, setErrors] = useState<string[]>([]);

  const handlePlayerChange = (index: number, field: keyof Player, value: string) => {
    const newPlayers = [...players];
    if (field === 'name') {
      newPlayers[index].name = value;
    } else if (field === 'score') {
      newPlayers[index].score = parseFloat(value) || 0;
    } else if (field === 'water') {
      newPlayers[index].water = parseFloat(value) || 0;
    }
    setPlayers(newPlayers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    players.forEach((player, index) => {
      if (!player.name || player.name.trim() === '') {
        newErrors.push(`${t('playerName', language)} ${index + 1} ${language === 'zh' ? '不能為空' : 'cannot be empty'}`);
      }
    });

    // Pot 波: scores must sum to zero (they are relative scores)
    if (settings.mode === 'pot') {
      const scoreSum = players.reduce((sum, p) => sum + p.score, 0);
      if (Math.abs(scoreSum) > 0.01) {
        newErrors.push(
          language === 'zh'
            ? `Pot 波分數總和必須為 0（現在是 ${scoreSum > 0 ? '+' : ''}${scoreSum}），請調整分數後重試`
            : `Pot mode scores must sum to 0 (currently ${scoreSum > 0 ? '+' : ''}${scoreSum}). Please adjust scores.`
        );
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    onSubmit(players);
  };

  const modeLabel = settings.mode === 'pot'
    ? (language === 'zh' ? 'Pot 波（高分贏）' : 'Three-player competition')
    : (language === 'zh' ? '啤珠（低分贏）' : 'Poker Pool');

  return (
    <Card className="w-full animate-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">{t('playerDataTitle', language)}</CardTitle>
        <CardDescription className="text-xs">
          {modeLabel} · {settings.playerCount}{language === 'zh' ? '人' : 'P'} · ×{settings.scoreMultiplier} / ×{settings.waterMultiplier}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Column headers */}
          <div className="grid grid-cols-[2fr_3fr_2fr] gap-1.5 px-2">
            <div className="text-xs font-semibold text-slate-500 text-center">{t('playerName', language)}</div>
            <div className="text-xs font-semibold text-slate-500 text-center">{t('score', language)}</div>
            <div className="text-xs font-semibold text-slate-500 text-center">{t('penalty', language)}</div>
          </div>

          {/* Player rows - compact single-line per player */}
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="grid grid-cols-[2fr_3fr_2fr] gap-1.5 items-center bg-slate-50 rounded-lg px-2 py-2 border border-slate-200"
              >
                {/* Player Name */}
                <Input
                  id={`name-${index}`}
                  type="text"
                  placeholder={String.fromCharCode(65 + index)}
                  value={player.name}
                  onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                  className="h-9 bg-white text-sm text-center px-2"
                />

                {/* Score - with +/− toggle button for mobile */}
                <div className="flex gap-1 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const newPlayers = [...players];
                      newPlayers[index].score = -newPlayers[index].score;
                      setPlayers(newPlayers);
                    }}
                    className="h-9 w-8 flex-shrink-0 rounded-md border border-slate-300 bg-white text-slate-600 text-base font-bold hover:bg-slate-100 active:scale-95 transition-transform flex items-center justify-center"
                    title="切換正負"
                  >
                    ±
                  </button>
                  <Input
                    id={`score-${index}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={player.score === 0 ? '' : String(player.score)}
                    onChange={(e) => handlePlayerChange(index, 'score', e.target.value)}
                    className="h-9 bg-white text-sm text-center px-1 min-w-0"
                  />
                </div>

                {/* Penalty / Water */}
                <Input
                  id={`water-${index}`}
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={player.water === 0 ? '' : player.water}
                  onChange={(e) => handlePlayerChange(index, 'water', e.target.value)}
                  className="h-9 bg-white text-sm text-center px-2"
                />
              </div>
            ))}
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 h-11"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backButton', language)}
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 text-base font-semibold bg-slate-900 hover:bg-slate-800"
            >
              {t('calculateButton', language)}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
