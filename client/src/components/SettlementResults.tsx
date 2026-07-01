/**
 * SettlementResults Component
 * Displays the final settlement calculation results
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GameSettings, SettlementResult } from '@/lib/settlement';
import { ArrowLeft, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface SettlementResultsProps {
  settings: GameSettings;
  result: SettlementResult;
  onBack: () => void;
}

export function SettlementResults({ settings, result, onBack }: SettlementResultsProps) {
  const [copied, setCopied] = useState(false);

  const modeLabel = settings.mode === 'pot' ? 'Pot 波' : '啤珠';

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount).toFixed(2);
    if (amount > 0) {
      return <span className="amount-positive">+${absAmount}</span>;
    } else if (amount < 0) {
      return <span className="amount-negative">-${absAmount}</span>;
    } else {
      return <span className="amount-neutral">$0.00</span>;
    }
  };

  const copyToClipboard = () => {
    const text = result.players
      .map((p) => {
        const amount = p.finalAmount.toFixed(2);
        if (p.finalAmount > 0) {
          return `${p.name} 收 $${amount}`;
        } else if (p.finalAmount < 0) {
          return `${p.name} 付 $${Math.abs(p.finalAmount).toFixed(2)}`;
        } else {
          return `${p.name} 平手`;
        }
      })
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('已複製到剪貼板');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6 animate-slide-up">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">結算結果</CardTitle>
          <CardDescription>
            {modeLabel} · {settings.playerCount} 人 · 波鐘 ${settings.pot.toFixed(2)}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Summary Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">總水數</div>
            <div className="text-2xl font-bold text-slate-900">{result.totalWater}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">剩餘波鐘</div>
            <div className="text-2xl font-bold text-slate-900">${result.remainingPot.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600 mb-1">每人平分</div>
            <div className="text-2xl font-bold text-slate-900">${result.perPlayerShare.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">各玩家結算明細</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">玩家</TableHead>
                  <TableHead className="text-right">分數</TableHead>
                  <TableHead className="text-right">水數</TableHead>
                  <TableHead className="text-right">水錢負擔</TableHead>
                  <TableHead className="text-right">分數損益</TableHead>
                  <TableHead className="text-right font-bold">最終結算</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.players.map((player, idx) => (
                  <TableRow key={player.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold text-slate-900">{player.name}</TableCell>
                    <TableCell className="text-right text-slate-600">{player.score}</TableCell>
                    <TableCell className="text-right text-slate-600">{player.water}</TableCell>
                    <TableCell className="text-right text-slate-600">
                      ${player.waterCost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={player.scoreGainLoss >= 0 ? 'amount-positive' : 'amount-negative'}>
                        {player.scoreGainLoss >= 0 ? '+' : '-'}${Math.abs(player.scoreGainLoss).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-bold">{formatAmount(player.finalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Settlement Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">結算摘要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {result.players.map((player) => (
              <div key={player.id} className="flex justify-between items-center p-2 rounded hover:bg-slate-50">
                <span className="font-semibold text-slate-900">{player.name}</span>
                <div className="text-right">
                  {player.finalAmount > 0 ? (
                    <div>
                      <span className="amount-positive">收 ${player.finalAmount.toFixed(2)}</span>
                    </div>
                  ) : player.finalAmount < 0 ? (
                    <div>
                      <span className="amount-negative">付 ${Math.abs(player.finalAmount).toFixed(2)}</span>
                    </div>
                  ) : (
                    <div>
                      <span className="amount-neutral">平手</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-11"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          重新計算
        </Button>
        <Button
          type="button"
          onClick={copyToClipboard}
          className="flex-1 h-11 text-base font-semibold bg-emerald-600 hover:bg-emerald-700"
        >
          <Copy className="w-4 h-4 mr-2" />
          {copied ? '已複製' : '複製結果'}
        </Button>
      </div>
    </div>
  );
}
