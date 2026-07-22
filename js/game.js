import { UI } from './ui.js';

const DEFAULT_SETTINGS = Object.freeze({ players: 2, rounds: 10, matrixSize: 4, minElement: -9, maxElement: 9 });

export class Game {
  constructor() {
    this.ui = new UI(document.getElementById('app'));
    this.state = { screen: 'title', settings: { ...DEFAULT_SETTINGS }, currentRound: 0 };
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
    this.state = { screen: 'game', settings: { ...DEFAULT_SETTINGS, ...settings }, currentRound: 1 };
    this.ui.renderGamePlaceholder(this.state, () => this.showSettings());
  }
}
