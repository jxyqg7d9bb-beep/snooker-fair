/**
 * i18n - Internationalization module
 * Provides Chinese and English translations for the app
 */

export type Language = 'zh' | 'en';

export const translations = {
  zh: {
    // Header
    appTitle: '🎱 Snooker Fair',
    appSubtitle: '遊戲計數結算工具',
    step1: '第 1 步：遊戲設定',
    step2: '第 2 步：玩家資料',
    step3: '第 3 步：結算結果',

    // Game Setup Form
    gameSetupTitle: '遊戲設定',
    gameSetupDescription: '選擇遊戲模式並設定基本參數',
    gameMode: '遊戲模式',
    potMode: 'Pot 波 🙋🏼‍♂️🆚🙋🏼‍♂️🆚🙋🏼‍♂️',
    potModeDesc: '分數高者為贏家',
    pearlMode: '啤珠 🃏🎱',
    pearlModeDesc: '分數低者為贏家',
    scoreMultiplier: '分數倍數',
    scoreMultiplierHint: '每 1 分相當於多少金額',
    penaltyMultiplier: '水倍數',
    penaltyMultiplierHint: '每 1 水相當於多少金額',
    playerCount: '遊戲人數',
    selectPlayerCount: '選擇人數',
    playerCountRange: '最少 {min} 人，最多 {max} 人',
    tableRate: '波鐘（總彩池）',
    tableRateHint: '遊戲結束後填寫的總金額',
    nextButton: '下一步：輸入玩家資料',

    // Validation Errors
    playerCountError: '遊戲人數必須在 {min}-{max} 人之間',
    scoreMultiplierError: '分數倍數必須大於 0',
    penaltyMultiplierError: '水倍數必須大於 0',
    tableRateError: '波鐘必須大於 0',

    // Player Data Form
    playerDataTitle: '玩家資料',
    playerName: '玩家名稱',
    playerNamePlaceholder: '例如：小明',
    score: '分數',
    penalty: '水數',
    backButton: '返回',
    calculateButton: '計算結果',

    // Settlement Results
    settlementResultsTitle: '結算結果',
    totalPenalty: '總水數',
    remainingPool: '剩餘波鐘',
    perPlayerShare: '每人平分',
    playerSettlementDetails: '各玩家結算明細',
    player: '玩家',
    penaltyCost: '水錢負擔',
    scoreGainLoss: '分數損益',
    finalSettlement: '最終結算',
    settlementSummary: '結算摘要',
    recalculateButton: '重新計算',
    copyResultsButton: '複製結果',
    copiedButton: '已複製',
    copiedToClipboard: '已複製到剪貼板',
    receive: '收',
    pay: '付',
    draw: '平手',

    // Footer
    footerText: 'Snooker Fair © 2026 · 專為棋牌遊戲結算設計',
  },
  en: {
    // Header
    appTitle: '🎱 Snooker Fair',
    appSubtitle: 'Game Settlement Calculator',
    step1: 'Step 1: Game Setup',
    step2: 'Step 2: Player Data',
    step3: 'Step 3: Settlement Results',

    // Game Setup Form
    gameSetupTitle: 'Game Setup',
    gameSetupDescription: 'Select game mode and set basic parameters',
    gameMode: 'Game Mode',
    potMode: 'Three-player competition 🙋🏼‍♂️🆚🙋🏼‍♂️🆚🙋🏼‍♂️',
    potModeDesc: 'High Score Wins',
    pearlMode: 'Poker Pool 🃏🎱',
    pearlModeDesc: 'Low Score Wins',
    scoreMultiplier: 'Score Multiplier',
    scoreMultiplierHint: 'Amount per 1 point',
    penaltyMultiplier: 'Penalty Multiplier',
    penaltyMultiplierHint: 'Amount per 1 penalty',
    playerCount: 'Number of Players',
    selectPlayerCount: 'Select players',
    playerCountRange: '{min}-{max} players',
    tableRate: 'Table Rate (Total Pool)',
    tableRateHint: 'Total amount at end of game',
    nextButton: 'Next: Enter Player Data',

    // Validation Errors
    playerCountError: 'Number of players must be between {min}-{max}',
    scoreMultiplierError: 'Score Multiplier must be greater than 0',
    penaltyMultiplierError: 'Penalty Multiplier must be greater than 0',
    tableRateError: 'Table Rate must be greater than 0',

    // Player Data Form
    playerDataTitle: 'Player Data',
    playerName: 'Player Name',
    playerNamePlaceholder: 'e.g.: John',
    score: 'Score',
    penalty: 'Penalty',
    backButton: 'Back',
    calculateButton: 'Calculate',

    // Settlement Results
    settlementResultsTitle: 'Settlement Results',
    totalPenalty: 'Total Penalty',
    remainingPool: 'Remaining Pool',
    perPlayerShare: 'Per Player Share',
    playerSettlementDetails: 'Player Settlement Details',
    player: 'Player',
    penaltyCost: 'Penalty Cost',
    scoreGainLoss: 'Score Gain/Loss',
    finalSettlement: 'Final Settlement',
    settlementSummary: 'Settlement Summary',
    recalculateButton: 'Recalculate',
    copyResultsButton: 'Copy Results',
    copiedButton: 'Copied',
    copiedToClipboard: 'Copied to clipboard',
    receive: 'Receive',
    pay: 'Pay',
    draw: 'Draw',

    // Footer
    footerText: 'Snooker Fair © 2026 · Designed for card game settlements',
  },
};

export function t(key: keyof typeof translations.zh, lang: Language = 'zh', params?: Record<string, string | number>): string {
  const langDict = translations[lang];
  let text = (langDict[key as keyof typeof langDict] as string) || translations.zh[key];
  
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(`{${paramKey}}`, String(value));
    });
  }
  
  return text;
}
