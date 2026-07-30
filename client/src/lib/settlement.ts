/**
 * Settlement Calculation Engine
 * Handles all game settlement logic for Pot 波 and 啤珠 modes
 */

export type GameMode = 'pot' | 'pearl'; // pot 波 (high score wins), pearl 啤珠 (low score wins)

export interface Player {
  id: string;
  name: string;
  score: number;
  water: number;
}

export interface GameSettings {
  mode: GameMode;
  playerCount: number;
  scoreMultiplier: number;
  waterMultiplier: number;
  pot: number; // 波鐘 - total pot amount
  splitPot?: boolean; // 波鐘平分 — each player pays pot/playerCount, water multiplier ignored
}

export interface SettlementResult {
  players: Array<{
    id: string;
    name: string;
    score: number;
    water: number;
    waterCost: number; // 水錢負擔
    scoreGainLoss: number; // 分數損益
    finalAmount: number; // 最終結算金額 (正數=收, 負數=付)
  }>;
  totalWater: number;
  remainingPot: number;
  perPlayerShare: number;
  transactions: Array<{
    from: string;
    to: string;
    amount: number;
    reason: 'score' | 'water';
  }>;
}

/**
 * Calculate water cost for each player
 * Step 1: Calculate total water
 * Step 2: Calculate remaining pot after water costs
 * Step 3: Distribute remaining pot evenly
 * Step 4: Calculate each player's water cost
 */
export function calculateWaterCosts(
  players: Player[],
  settings: GameSettings
): {
  waterCosts: Record<string, number>;
  totalWater: number;
  remainingPot: number;
  perPlayerShare: number;
} {
  const totalWater = players.reduce((sum, p) => sum + p.water, 0);

  if (settings.splitPot) {
    // 波鐘平分模式: each player pays pot / playerCount, water multiplier is ignored
    const perPlayerShare = settings.pot / players.length;
    const waterCosts: Record<string, number> = {};
    players.forEach((player) => {
      waterCosts[player.id] = perPlayerShare;
    });
    return {
      waterCosts,
      totalWater,
      remainingPot: 0,
      perPlayerShare,
    };
  }

  // Normal mode: deduct water fees from pot, split remainder evenly
  const remainingPot = settings.pot - totalWater * settings.waterMultiplier;
  const perPlayerShare = remainingPot / players.length;

  const waterCosts: Record<string, number> = {};
  players.forEach((player) => {
    waterCosts[player.id] = player.water * settings.waterMultiplier + perPlayerShare;
  });

  return {
    waterCosts,
    totalWater,
    remainingPot,
    perPlayerShare,
  };
}

/**
 * Calculate score-based gains/losses.
 *
 * Pot 波 (high score wins):
 *   Scores already sum to zero (relative scores).
 *   Each player's gain/loss = score × multiplier directly.
 *   Example: A=-320, B=283, C=37 (sum=0)
 *   A=-320×3=-960, B=283×3=+849, C=37×3=+111
 *
 * 啤珠 (low score wins):
 *   Scores do NOT sum to zero (absolute counts e.g. balls potted).
 *   Use pairwise comparison: lower score wins each pair.
 *   Example (multiplier=5, A=1, B=3, C=6):
 *     A vs B: A wins 2 pts → A +10, B -10
 *     A vs C: A wins 5 pts → A +25, C -25
 *     B vs C: B wins 3 pts → B +15, C -15
 *     A=+35, B=+5, C=-40
 */
export function calculateScoreGainLoss(
  players: Player[],
  settings: GameSettings
): Record<string, number> {
  const scoreGainLoss: Record<string, number> = {};
  players.forEach((p) => { scoreGainLoss[p.id] = 0; });

  if (settings.mode === 'pot') {
    // Pot 波: scores sum to zero, direct multiplication
    players.forEach((p) => {
      scoreGainLoss[p.id] = p.score * settings.scoreMultiplier;
    });
  } else {
    // 啤珠: pairwise comparison, lower score wins
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const pi = players[i];
        const pj = players[j];
        if (pi.score === pj.score) continue; // Tie: no money changes hands
        const diff = Math.abs(pi.score - pj.score) * settings.scoreMultiplier;
        // Lower score wins in 啤珠
        if (pi.score < pj.score) {
          scoreGainLoss[pi.id] += diff;
          scoreGainLoss[pj.id] -= diff;
        } else {
          scoreGainLoss[pj.id] += diff;
          scoreGainLoss[pi.id] -= diff;
        }
      }
    }
  }

  return scoreGainLoss;
}

/**
 * Calculate final settlement for all players
 */
export function calculateSettlement(
  players: Player[],
  settings: GameSettings
): SettlementResult {
  const { waterCosts, totalWater, remainingPot, perPlayerShare } =
    calculateWaterCosts(players, settings);
  const scoreGainLoss = calculateScoreGainLoss(players, settings);

  const resultPlayers = players.map((player) => ({
    id: player.id,
    name: player.name,
    score: player.score,
    water: player.water,
    waterCost: waterCosts[player.id],
    scoreGainLoss: scoreGainLoss[player.id],
    finalAmount: scoreGainLoss[player.id] - waterCosts[player.id],
  }));

  // Generate transactions for clarity
  const transactions: SettlementResult['transactions'] = [];

  // Score-based transactions (simplified: just show net gain/loss)
  // In a real scenario, you'd need more complex logic to determine who pays whom
  players.forEach((player) => {
    const gainLoss = scoreGainLoss[player.id];
    if (gainLoss > 0) {
      // This player is a winner, but we don't specify who pays them
      // In a multi-player game, it's typically split among losers
    }
  });

  return {
    players: resultPlayers,
    totalWater,
    remainingPot,
    perPlayerShare,
    transactions,
  };
}

/**
 * Validate game settings
 */
export function validateGameSettings(settings: GameSettings): string[] {
  const errors: string[] = [];

  if (settings.playerCount < 2) {
    errors.push('遊戲人數必須至少 2 人');
  }
  if (settings.playerCount > 10) {
    errors.push('遊戲人數不能超過 10 人');
  }
  if (settings.scoreMultiplier <= 0) {
    errors.push('分數倍數必須大於 0');
  }
  if (settings.waterMultiplier <= 0) {
    errors.push('水倍數必須大於 0');
  }
  if (settings.pot <= 0) {
    errors.push('波鐘必須大於 0');
  }

  return errors;
}

/**
 * Validate player data
 */
export function validatePlayers(players: Player[]): string[] {
  const errors: string[] = [];

  if (players.length === 0) {
    errors.push('至少需要一個玩家');
  }

  players.forEach((player, index) => {
    if (!player.name || player.name.trim() === '') {
      errors.push(`玩家 ${index + 1} 的名稱不能為空`);
    }
    if (typeof player.score !== 'number' || isNaN(player.score)) {
      errors.push(`玩家 ${player.name} 的分數必須是有效的數字`);
    }
    if (typeof player.water !== 'number' || isNaN(player.water)) {
      errors.push(`玩家 ${player.name} 的水數必須是有效的數字`);
    }
  });

  return errors;
}
