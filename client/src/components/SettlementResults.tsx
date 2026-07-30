/**
 * SettlementResults Component
 * Displays the final settlement calculation results
 * - Compact inline stats row (no oversized cards)
 * - Calculation steps for player verification
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GameSettings, SettlementResult } from '@/lib/settlement';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SettlementResultsProps {
  settings: GameSettings;
  result: SettlementResult;
  onBack: () => void;
}

export function SettlementResults({ settings, result, onBack }: SettlementResultsProps) {
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const zh = language === 'zh';
  const modeLabel = settings.mode === 'pot'
    ? (zh ? 'Pot 波' : 'Three-player competition')
    : (zh ? '啤珠' : 'Poker Pool');

  const fmt = (n: number) => Math.abs(n).toFixed(2);

  const formatAmount = (amount: number) => {
    if (amount > 0) return <span className="amount-positive">+${fmt(amount)}</span>;
    if (amount < 0) return <span className="amount-negative">-${fmt(amount)}</span>;
    return <span className="amount-neutral">$0.00</span>;
  };

  const copyToClipboard = () => {
    const lines = result.players.map((p) => {
      if (p.finalAmount > 0) return `${p.name} ${zh ? '收' : 'receives'} $${fmt(p.finalAmount)}`;
      if (p.finalAmount < 0) return `${p.name} ${zh ? '付' : 'pays'} $${fmt(p.finalAmount)}`;
      return `${p.name} ${zh ? '平手' : 'draw'}`;
    });
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    toast.success(zh ? '已複製到剪貼板' : 'Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Average score for calculation steps
  const avgScore = result.players.reduce((s, p) => s + p.score, 0) / result.players.length;

  return (
    <div className="w-full space-y-4 animate-slide-up">

      {/* Header */}
      <Card>
        <CardHeader className="py-4 px-4">
          <CardTitle className="text-xl">{t('settlementResultsTitle', language)}</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            {modeLabel} · {settings.playerCount}{zh ? '人' : 'P'} · {zh ? '波鐘' : 'Table'} ${settings.pot.toFixed(2)}
          </p>
        </CardHeader>
      </Card>

      {/* Compact Summary Stats — single row of 3 inline chips */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: zh ? '總水數' : 'Total Penalty', value: String(result.totalWater) },
          { label: zh ? '剩餘波鐘' : 'Remaining', value: `$${result.remainingPot.toFixed(2)}` },
          { label: zh ? '每人平分' : 'Per Player', value: `$${result.perPlayerShare.toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-center shadow-sm">
            <div className="text-[10px] text-slate-500 leading-tight">{label}</div>
            <div className="text-base font-bold text-slate-900 mt-0.5 leading-tight">{value}</div>
          </div>
        ))}
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-base">{t('playerSettlementDetails', language)}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-3">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left px-2 text-xs">{t('player', language)}</TableHead>
                  <TableHead className="text-right px-2 text-xs">{t('score', language)}</TableHead>
                  <TableHead className="text-right px-2 text-xs">{t('penalty', language)}</TableHead>
                  <TableHead className="text-right px-2 text-xs">{zh ? '水錢' : 'Penalty$'}</TableHead>
                  <TableHead className="text-right px-2 text-xs">{zh ? '分數損益' : 'Score P&L'}</TableHead>
                  <TableHead className="text-right px-2 text-xs font-bold">{zh ? '最終' : 'Final'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.players.map((player) => (
                  <TableRow key={player.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold text-slate-900 px-2 py-2">{player.name}</TableCell>
                    <TableCell className="text-right text-slate-600 px-2 py-2 text-sm">{player.score}</TableCell>
                    <TableCell className="text-right text-slate-600 px-2 py-2 text-sm">{player.water}</TableCell>
                    <TableCell className="text-right text-slate-600 px-2 py-2 text-sm">${fmt(player.waterCost)}</TableCell>
                    <TableCell className="text-right px-2 py-2 text-sm">
                      <span className={player.scoreGainLoss >= 0 ? 'amount-positive' : 'amount-negative'}>
                        {player.scoreGainLoss >= 0 ? '+' : '-'}${fmt(player.scoreGainLoss)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold px-2 py-2">{formatAmount(player.finalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Settlement Summary */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-base">{t('settlementSummary', language)}</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="space-y-1.5">
            {result.players.map((player) => (
              <div key={player.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                <span className="font-semibold text-slate-900">{player.name}</span>
                <div className="text-right text-sm font-medium">
                  {player.finalAmount > 0 ? (
                    <span className="amount-positive">{zh ? '收' : 'Receive'} ${fmt(player.finalAmount)}</span>
                  ) : player.finalAmount < 0 ? (
                    <span className="amount-negative">{zh ? '付' : 'Pay'} ${fmt(player.finalAmount)}</span>
                  ) : (
                    <span className="amount-neutral">{zh ? '平手' : 'Draw'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calculation Steps — collapsible */}
      <Card>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3 text-left"
          onClick={() => setShowSteps(!showSteps)}
        >
          <span className="text-base font-semibold text-slate-900">
            {zh ? '📐 計算步驟（驗算）' : '📐 Calculation Steps'}
          </span>
          {showSteps ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </button>

        {showSteps && (
          <CardContent className="px-4 pb-4 pt-0 space-y-5 text-sm text-slate-700">

            {/* Step 1: Water costs */}
            <div>
              <div className="font-semibold text-slate-800 mb-2 border-b pb-1">
                {zh ? '第一步：計算水錢' : 'Step 1: Water Costs'}
              </div>
              <div className="space-y-1 text-xs leading-relaxed">
                <div className="text-slate-500">
                  {zh
                    ? `總水數 = ${result.players.map(p => `${p.name}(${p.water})`).join(' + ')} = ${result.totalWater}`
                    : `Total water = ${result.players.map(p => `${p.name}(${p.water})`).join(' + ')} = ${result.totalWater}`}
                </div>
                <div className="text-slate-500">
                  {zh
                    ? `水費總額 = ${result.totalWater} × $${settings.waterMultiplier} = $${(result.totalWater * settings.waterMultiplier).toFixed(2)}`
                    : `Water fees = ${result.totalWater} × $${settings.waterMultiplier} = $${(result.totalWater * settings.waterMultiplier).toFixed(2)}`}
                </div>
                <div className="text-slate-500">
                  {zh
                    ? `剩餘波鐘 = $${settings.pot.toFixed(2)} − $${(result.totalWater * settings.waterMultiplier).toFixed(2)} = $${result.remainingPot.toFixed(2)}`
                    : `Remaining = $${settings.pot.toFixed(2)} − $${(result.totalWater * settings.waterMultiplier).toFixed(2)} = $${result.remainingPot.toFixed(2)}`}
                </div>
                <div className="text-slate-500">
                  {zh
                    ? `每人平分 = $${result.remainingPot.toFixed(2)} ÷ ${settings.playerCount}人 = $${result.perPlayerShare.toFixed(2)}`
                    : `Per player = $${result.remainingPot.toFixed(2)} ÷ ${settings.playerCount} = $${result.perPlayerShare.toFixed(2)}`}
                </div>
                <div className="mt-2 space-y-0.5">
                  {result.players.map(p => (
                    <div key={p.id} className="text-slate-600">
                      {p.name}: {p.water} × ${ settings.waterMultiplier} + ${ result.perPlayerShare.toFixed(2)} = <span className="font-medium">${fmt(p.waterCost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Score gain/loss */}
            <div>
              <div className="font-semibold text-slate-800 mb-2 border-b pb-1">
                {zh ? '第二步：計算分數損益' : 'Step 2: Score Gain/Loss'}
              </div>
              <div className="space-y-1 text-xs leading-relaxed">
                <div className="text-slate-500">
                  {zh
                    ? `平均分 = (${result.players.map(p => p.score).join(' + ')}) ÷ ${settings.playerCount} = ${avgScore.toFixed(2)}`
                    : `Average = (${result.players.map(p => p.score).join(' + ')}) ÷ ${settings.playerCount} = ${avgScore.toFixed(2)}`}
                </div>
                <div className="text-slate-500 text-[10px] italic">
                  {zh
                    ? `分數倍數 ×${settings.scoreMultiplier}${settings.mode === 'pearl' ? '（啤珠：低分為正）' : ''}`
                    : `Score multiplier ×${settings.scoreMultiplier}${settings.mode === 'pearl' ? ' (Pearl: lower is better)' : ''}`}
                </div>
                <div className="mt-1 space-y-0.5">
                  {result.players.map(p => {
                    const rawDiff = settings.mode === 'pearl' ? -(p.score - avgScore) : (p.score - avgScore);
                    return (
                      <div key={p.id} className="text-slate-600">
                        {p.name}: ({p.score} − {avgScore.toFixed(2)}) × {settings.scoreMultiplier}
                        {settings.mode === 'pearl' ? ' × (−1)' : ''} = <span className={`font-medium ${p.scoreGainLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {p.scoreGainLoss >= 0 ? '+' : ''}${p.scoreGainLoss.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Final */}
            <div>
              <div className="font-semibold text-slate-800 mb-2 border-b pb-1">
                {zh ? '第三步：最終結算' : 'Step 3: Final Settlement'}
              </div>
              <div className="space-y-0.5 text-xs">
                <div className="text-slate-500 mb-1">
                  {zh ? '最終 = 分數損益 − 水錢負擔' : 'Final = Score P&L − Water Cost'}
                </div>
                {result.players.map(p => (
                  <div key={p.id} className="text-slate-600">
                    {p.name}: {p.scoreGainLoss >= 0 ? '+' : ''}${p.scoreGainLoss.toFixed(2)} − ${fmt(p.waterCost)} = <span className={`font-bold ${p.finalAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {p.finalAmount >= 0 ? '+' : ''}${p.finalAmount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pb-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-11">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('recalculateButton', language)}
        </Button>
        <Button
          type="button"
          onClick={copyToClipboard}
          className="flex-1 h-11 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
        >
          <Copy className="w-4 h-4 mr-2" />
          {copied ? t('copiedButton', language) : t('copyResultsButton', language)}
        </Button>
      </div>
    </div>
  );
}
