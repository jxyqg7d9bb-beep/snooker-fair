/**
 * PlayerDataForm Component
 * Handles input for each player's score and water number
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

    // Validate all players
    players.forEach((player, index) => {
      if (!player.name || player.name.trim() === '') {
        newErrors.push(`${t('playerName', language)} ${index + 1} ${language === 'zh' ? '不能為空' : 'cannot be empty'}`);
      }
      if (typeof player.score !== 'number' || isNaN(player.score)) {
        newErrors.push(`${t('player', language)} ${player.name} ${t('score', language)} ${language === 'zh' ? '必須是有效的數字' : 'must be a valid number'}`);
      }
      if (typeof player.water !== 'number' || isNaN(player.water)) {
        newErrors.push(`${t('player', language)} ${player.name} ${t('penalty', language)} ${language === 'zh' ? '必須是有效的數字' : 'must be a valid number'}`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    onSubmit(players);
  };

  const modeLabel = settings.mode === 'pot' ? (language === 'zh' ? 'Pot 波（高分贏）' : 'Three-player competition (High Score Wins)') : (language === 'zh' ? '啤珠（低分贏）' : 'Poker Pool (Low Score Wins)');

  return (
    <Card className="w-full animate-slide-up">
      <CardHeader>
        <CardTitle className="text-2xl">{t('playerDataTitle', language)}</CardTitle>
        <CardDescription>
          {modeLabel} · {settings.playerCount} {language === 'zh' ? '人' : 'players'} · {t('scoreMultiplier', language)} {settings.scoreMultiplier} · {t('penaltyMultiplier', language)} {settings.waterMultiplier}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Player Input Grid */}
          <div className="space-y-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3 hover:bg-slate-100 transition-colors"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Player Name */}
                  <div className="space-y-1">
                    <Label htmlFor={`name-${index}`} className="text-sm font-semibold">
                      {t('playerName', language)}
                    </Label>
                    <Input
                      id={`name-${index}`}
                      type="text"
                      placeholder={t('playerNamePlaceholder', language)}
                      value={player.name}
                      onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  {/* Score */}
                  <div className="space-y-1">
                    <Label htmlFor={`score-${index}`} className="text-sm font-semibold">
                      {t('score', language)}
                    </Label>
                    <Input
                      id={`score-${index}`}
                      type="number"
                      placeholder="0"
                      value={player.score || ''}
                      onChange={(e) => handlePlayerChange(index, 'score', e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  {/* Penalty */}
                  <div className="space-y-1">
                    <Label htmlFor={`water-${index}`} className="text-sm font-semibold">
                      {t('penalty', language)}
                    </Label>
                    <Input
                      id={`water-${index}`}
                      type="number"
                      placeholder="0"
                      value={player.water || ''}
                      onChange={(e) => handlePlayerChange(index, 'water', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
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
          <div className="flex gap-3 pt-4">
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
