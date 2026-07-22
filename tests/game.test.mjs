import assert from 'node:assert/strict';

globalThis.document = { getElementById: () => ({}) };
const { Game } = await import('../js/game.js');

let resultsRendered = false;
const game = new Game();
game.ui = {
  renderProblem() {},
  renderResults() { resultsRendered = true; },
  showAnswerError(message) { throw new Error(message); },
};

const realNow = Date.now;
let now = 1_000;
Date.now = () => now;

try {
  game.startGame({ matrixSize: 2, minElement: -2, maxElement: 2 });
  assert.equal(game.state.settings.rounds, 3);

  const firstCorrectAnswer = game.state.determinant.toString();
  game.submitAnswer((game.state.determinant + 5n).toString());
  assert.equal(game.state.players[0].errorPenalty, 5n);

  now = game.state.roundStartedAt + 3_900;
  game.submitAnswer(firstCorrectAnswer);
  assert.equal(game.state.players[0].timeSeconds, 3);
  assert.equal(game.state.players[0].roundScore, 8n);
  assert.equal(game.state.activePlayerId, 2);

  now = game.state.roundStartedAt + 5_200;
  game.submitAnswer(firstCorrectAnswer);
  assert.equal(game.state.players[1].roundScore, 5n);
  assert.equal(game.state.roundComplete, true);

  game.advanceRound();
  assert.equal(game.state.currentRound, 2);

  for (const expectedRound of [2, 3]) {
    const answer = game.state.determinant.toString();
    now = game.state.roundStartedAt + 1_100;
    game.submitAnswer(answer);
    now = game.state.roundStartedAt + 2_100;
    game.submitAnswer(answer);
    assert.equal(game.state.roundComplete, true);
    game.advanceRound();
    if (expectedRound < 3) assert.equal(game.state.currentRound, expectedRound + 1);
  }

  assert.equal(game.state.screen, 'results');
  assert.equal(resultsRendered, true);

  resultsRendered = false;
  game.startGame({ rounds: 1, matrixSize: 2, minElement: -2, maxElement: 2 });
  assert.equal(game.state.settings.rounds, 1);
  const oneRoundAnswer = game.state.determinant.toString();
  now = game.state.roundStartedAt + 1_000;
  game.submitAnswer(oneRoundAnswer);
  now = game.state.roundStartedAt + 2_000;
  game.submitAnswer(oneRoundAnswer);
  game.advanceRound();
  assert.equal(game.state.screen, 'results');
  assert.equal(resultsRendered, true);
} finally {
  Date.now = realNow;
}

console.log('Game flow tests passed.');
