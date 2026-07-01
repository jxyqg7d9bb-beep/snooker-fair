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
        <div className="container py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 whitespace-nowrap">{t('appTitle', language)}</h1>
                <p className="text-xs text-slate-500 whitespace-nowrap">{t('appSubtitle', language)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-xs text-slate-500 text-right hidden sm:block">
                {step === 'setup' && t('step1', language)}
                {step === 'input' && t('step2', language)}
                {step === 'results' && t('step3', language)}
              </div>
              <div className="flex gap-1.5">
                <Button
                  variant={language === 'zh' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('zh')}
                  className="h-7 px-2.5 text-xs"
                >
                  中文
                </Button>
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('en')}
                  className="h-7 px-2.5 text-xs"
                >
                  EN
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
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
