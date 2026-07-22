import assert from 'node:assert/strict';
import { UI } from '../js/ui.js';

class FakeRoot {
  constructor() { this.innerHTML = ''; }
  querySelector(selector) {
    if (selector === '#answerForm') return { elements: { answer: { value: '' } }, addEventListener() {} };
    if (selector === '#timer') return { textContent: '' };
    return { addEventListener() {}, focus() {} };
  }
  querySelectorAll() { return []; }
}

const root = new FakeRoot();
const ui = new UI(root);
assert.equal(ui.validateSettings({ rounds: 1, matrixSize: 2, minElement: -9, maxElement: 9 }), '');
assert.equal(ui.validateSettings({ rounds: 100, matrixSize: 5, minElement: -9, maxElement: 9 }), '');
assert.match(ui.validateSettings({ rounds: 0, matrixSize: 2, minElement: -9, maxElement: 9 }), /ラウンド数/);
assert.match(ui.validateSettings({ rounds: 1.5, matrixSize: 2, minElement: -9, maxElement: 9 }), /ラウンド数/);
const secretPenalty = 987654321n;
const state = {
  settings: { rounds: 3, matrixSize: 2 },
  currentRound: 1,
  matrix: [[1, 2], [3, 4]],
  activePlayerId: 1,
  roundStartedAt: Date.now(),
  roundComplete: false,
  feedback: { type: 'incorrect', message: 'Player 1：不正解です。誤差が加算されました。' },
  players: [
    { id: 1, name: 'Player 1', solved: false, errors: 1, errorPenalty: secretPenalty, timeSeconds: null, roundScore: null, totalScore: 0n },
    { id: 2, name: 'Player 2', solved: false, errors: 0, errorPenalty: 0n, timeSeconds: null, roundScore: null, totalScore: 0n },
  ],
};

ui.renderProblem(state, () => {}, () => {}, () => {}, () => {});
ui.clearTimer();
assert.doesNotMatch(root.innerHTML, /987654321/);
assert.match(root.innerHTML, /1回/);

state.roundComplete = true;
state.players[0].solved = true;
state.players[0].timeSeconds = 12;
state.players[0].roundScore = secretPenalty + 12n;
state.players[0].totalScore = secretPenalty + 12n;
state.players[1].solved = true;
state.players[1].timeSeconds = 10;
state.players[1].roundScore = 10n;
state.players[1].totalScore = 10n;
ui.renderProblem(state, () => {}, () => {}, () => {}, () => {});
assert.match(root.innerHTML, /987654321/);

console.log('Score privacy tests passed.');
