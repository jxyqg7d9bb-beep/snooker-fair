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
 * Calculate score-based gains/losses
 * For Pot 波: higher score wins (positive gain)
 * For 啤珠: lower score wins (positive gain)
 */
export function calculateScoreGainLoss(
  players: Player[],
  settings: GameSettings
): Record<string, number> {
  const scoreGainLoss: Record<string, number> = {};

  // Initialize all players with 0
  players.forEach((p) => {
    scoreGainLoss[p.id] = 0;
  });

  // Compare each pair of players
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const player1 = players[i];
      const player2 = players[j];

      let scoreDiff = player2.score - player1.score;

      // For 啤珠 (pearl), lower score wins, so reverse the logic
      if (settings.mode === 'pearl') {
        scoreDiff = -scoreDiff;
      }

      const amount = Math.abs(scoreDiff) * settings.scoreMultiplier;

      if (scoreDiff > 0) {
        // player2 wins against player1
        scoreGainLoss[player2.id] += amount;
        scoreGainLoss[player1.id] -= amount;
      } else if (scoreDiff < 0) {
        // player1 wins against player2
        scoreGainLoss[player1.id] += amount;
        scoreGainLoss[player2.id] -= amount;
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

  // Score-based transactions
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const player1 = players[i];
      const player2 = players[j];

      let scoreDiff = player2.score - player1.score;
      if (settings.mode === 'pearl') {
        scoreDiff = -scoreDiff;
      }

      const amount = Math.abs(scoreDiff) * settings.scoreMultiplier;

      if (scoreDiff > 0) {
        transactions.push({
          from: player1.id,
          to: player2.id,
          amount,
          reason: 'score',
        });
      } else if (scoreDiff < 0) {
        transactions.push({
          from: player2.id,
          to: player1.id,
          amount,
          reason: 'score',
        });
      }
    }
  }

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
