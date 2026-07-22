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
const validSettings = { rounds: 1, matrixSize: 2, minElement: -9, maxElement: 9, weightIntegerText: '1', weightInteger: 1, weightDecimalText: '00', penaltyWeightHundredths: 100 };
assert.equal(ui.validateSettings(validSettings), '');
assert.equal(ui.validateSettings({ ...validSettings, rounds: 100, matrixSize: 5 }), '');
assert.match(ui.validateSettings({ ...validSettings, rounds: 0 }), /ラウンド数/);
assert.match(ui.validateSettings({ ...validSettings, rounds: 1.5 }), /ラウンド数/);
assert.equal(ui.validateSettings({ ...validSettings, weightIntegerText: '0', weightInteger: 0, weightDecimalText: '00', penaltyWeightHundredths: 0 }), '');
assert.equal(ui.validateSettings({ ...validSettings, weightIntegerText: '99', weightInteger: 99, weightDecimalText: '99', penaltyWeightHundredths: 9999 }), '');
assert.match(ui.validateSettings({ ...validSettings, weightDecimalText: '5', penaltyWeightHundredths: 105 }), /倍率/);
assert.match(ui.validateSettings({ ...validSettings, weightIntegerText: '' }), /倍率/);
const secretPenalty = 987654321n;
const state = {
  settings: { rounds: 3, matrixSize: 2, penaltyWeightHundredths: 100 },
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
assert.doesNotMatch(root.innerHTML, /この行列式を計算/);
assert.match(root.innerHTML, /class="timer"/);
assert.match(root.innerHTML, /class="play-grid"/);

state.roundComplete = true;
state.players[0].solved = true;
state.players[0].timeSeconds = 12;
state.players[0].roundScore = secretPenalty * 100n + 1200n;
state.players[0].totalScore = secretPenalty * 100n + 1200n;
state.players[1].solved = true;
state.players[1].timeSeconds = 10;
state.players[1].roundScore = 1000n;
state.players[1].totalScore = 1000n;
ui.renderProblem(state, () => {}, () => {}, () => {}, () => {});
assert.match(root.innerHTML, /987654333\.00/);

console.log('Score privacy tests passed.');
