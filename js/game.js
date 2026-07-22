import { UI } from './ui.js';
import { MatrixGenerator } from './generator.js';
import { DeterminantCalculator } from './determinant.js';
import { Util } from './util.js';

const DEFAULT_SETTINGS = Object.freeze({ players: 2, rounds: 3, matrixSize: 4, minElement: -9, maxElement: 9, penaltyWeightHundredths: 100 });

export class Game {
  constructor() {
    this.ui = new UI(document.getElementById('app'));
    this.generator = new MatrixGenerator();
    this.calculator = new DeterminantCalculator();
    this.state = { screen: 'title', settings: { ...DEFAULT_SETTINGS }, currentRound: 0, matrix: null, determinant: null, players: [] };
  }
  initialize() { this.showTitle(); }
  showTitle() {
    this.state.screen = 'title';
    this.ui.renderTitle(() => this.showSettings());
  }
  showSettings() {
    this.state.screen = 'settings';
    this.ui.renderSettings(this.state.settings, (settings) => this.startGame(settings), () => this.showTitle());
  }
  startGame(settings) {
    this.state = {
      screen: 'game',
      settings: { ...DEFAULT_SETTINGS, ...settings },
      currentRound: 1,
      matrix: null,
      determinant: null,
      activePlayerId: 1,
      roundStartedAt: 0,
      roundComplete: false,
      feedback: null,
      players: [
        { id: 1, name: 'Player 1', totalScore: 0n },
        { id: 2, name: 'Player 2', totalScore: 0n },
      ],
    };
    this.prepareRound();
  }

  prepareRound() {
    const { matrixSize, minElement, maxElement } = this.state.settings;
    this.state.matrix = this.generator.generate(matrixSize, minElement, maxElement);
    this.state.determinant = this.calculator.calculate(this.state.matrix);
    this.state.roundStartedAt = Date.now();
    this.state.roundComplete = false;
    this.state.feedback = null;
    this.state.activePlayerId = 1;
    this.state.players.forEach((player) => {
      player.solved = false;
      player.errors = 0;
      player.errorPenalty = 0n;
      player.attempts = [];
      player.timeSeconds = null;
      player.roundScore = null;
    });
    this.renderRound();
  }

  submitAnswer(rawAnswer) {
    try {
      const answer = Util.parseIntegerAnswer(rawAnswer);
      const player = this.state.players.find(({ id }) => id === this.state.activePlayerId);
      if (!player || player.solved || this.state.roundComplete) return;
      const difference = Util.absoluteDifference(answer, this.state.determinant);
      player.attempts.push({ answer, difference, correct: difference === 0n });

      if (answer === this.state.determinant) {
        player.solved = true;
        player.timeSeconds = Math.floor((Date.now() - this.state.roundStartedAt) / 1000);
        player.roundScore = Util.calculateScore(player.timeSeconds, player.errorPenalty, this.state.settings.penaltyWeightHundredths);
        player.totalScore += player.roundScore;
        this.state.feedback = { type: 'correct', message: `${player.name}：正解です！` };

        const nextPlayer = this.state.players.find((candidate) => !candidate.solved);
        if (nextPlayer) {
          this.state.activePlayerId = nextPlayer.id;
        } else {
          this.state.roundComplete = true;
        }
      } else {
        player.errors += 1;
        player.errorPenalty += difference;
        this.state.feedback = {
          type: 'incorrect',
          message: `${player.name}：不正解です。誤差が加算されました。`,
        };
      }
      this.renderRound();
    } catch (error) {
      this.ui.showAnswerError(error.message);
    }
  }

  selectPlayer(playerId) {
    const player = this.state.players.find(({ id }) => id === playerId);
    if (!player || player.solved || this.state.roundComplete) return;
    this.state.activePlayerId = playerId;
    this.state.feedback = null;
    this.renderRound();
  }

  renderRound() {
    this.ui.renderProblem(
      this.state,
      (answer) => this.submitAnswer(answer),
      (playerId) => this.selectPlayer(playerId),
      () => this.advanceRound(),
      () => this.showSettings(),
    );
  }

  advanceRound() {
    if (!this.state.roundComplete) return;
    if (this.state.currentRound < this.state.settings.rounds) {
      this.state.currentRound += 1;
      this.prepareRound();
    } else {
      this.state.screen = 'results';
      this.ui.renderResults(this.state, () => this.showSettings(), () => this.startGame(this.state.settings));
    }
  }
}
