/**
 * Home Page - Main Settlement Calculator
 * Orchestrates the three-step flow: Setup → Input → Results
 * Preserves form data when navigating back
 */

import { GameSetupForm } from '@/components/GameSetupForm';
import { PlayerDataForm } from '@/components/PlayerDataForm';
import { SettlementResults } from '@/components/SettlementResults';
import { calculateSettlement, GameSettings, Player, SettlementResult } from '@/lib/settlement';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

type Step = 'setup' | 'input' | 'results';

export default function Home() {
  const [step, setStep] = useState<Step>('setup');
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [result, setResult] = useState<SettlementResult | null>(null);

  const handleSetupSubmit = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setStep('input');
  };

  const handlePlayerSubmit = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    if (settings) {
      const settlementResult = calculateSettlement(newPlayers, settings);
      setResult(settlementResult);
      setStep('results');
    }
  };

  const handleBack = () => {
    if (step === 'input') {
      setStep('setup');
    } else if (step === 'results') {
      setStep('input');
    }
  };

  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('appTitle', language)}</h1>
              <p className="text-sm text-slate-600">{t('appSubtitle', language)}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs text-slate-500">
                {step === 'setup' && t('step1', language)}
                {step === 'input' && t('step2', language)}
                {step === 'results' && t('step3', language)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={language === 'zh' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('zh')}
                  className="h-8 px-3 text-xs"
                >
                  中文
                </Button>
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('en')}
                  className="h-8 px-3 text-xs"
                >
                  English
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-2xl mx-auto">
          {step === 'setup' && <GameSetupForm onSubmit={handleSetupSubmit} initialSettings={settings} />}

          {step === 'input' && settings && (
            <PlayerDataForm 
              settings={settings} 
              onSubmit={handlePlayerSubmit} 
              onBack={handleBack}
              initialPlayers={players}
            />
          )}

          {step === 'results' && settings && result && (
            <SettlementResults settings={settings} result={result} onBack={handleBack} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm mt-12">
        <div className="container py-6">
          <div className="text-center text-sm text-slate-600">
            <p>{t('footerText', language)}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
