import { UI } from './ui.js';
import { MatrixGenerator } from './generator.js';
import { DeterminantCalculator } from './determinant.js';

const DEFAULT_SETTINGS = Object.freeze({ players: 2, rounds: 10, matrixSize: 4, minElement: -9, maxElement: 9 });

export class Game {
  constructor() {
    this.ui = new UI(document.getElementById('app'));
    this.generator = new MatrixGenerator();
    this.calculator = new DeterminantCalculator();
    this.state = { screen: 'title', settings: { ...DEFAULT_SETTINGS }, currentRound: 0, matrix: null, determinant: null };
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
    this.state = { screen: 'game', settings: { ...DEFAULT_SETTINGS, ...settings }, currentRound: 1, matrix: null, determinant: null };
    this.prepareRound();
  }

  prepareRound() {
    const { matrixSize, minElement, maxElement } = this.state.settings;
    this.state.matrix = this.generator.generate(matrixSize, minElement, maxElement);
    this.state.determinant = this.calculator.calculate(this.state.matrix);
    this.ui.renderProblem(this.state, () => this.prepareRound(), () => this.showSettings());
  }
}
