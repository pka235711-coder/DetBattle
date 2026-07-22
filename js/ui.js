import { Util } from './util.js';

export class UI {
  constructor(root) {
    this.root = root;
    this.timerId = null;
  }

  clearTimer() {
    if (this.timerId !== null) clearInterval(this.timerId);
    this.timerId = null;
  }

  renderTitle(onStart) {
    this.clearTimer();
    this.root.innerHTML = `<section><h1>Det Battle</h1><p class="subtitle">行列式を誰よりも速く、正確に。</p><button id="startButton" type="button">ゲーム開始</button></section>`;
    this.root.querySelector('#startButton').addEventListener('click', onStart);
  }

  renderSettings(settings, onSubmit, onBack) {
    this.clearTimer();
    this.root.innerHTML = `<section><h2>ゲーム設定</h2><p class="rule-summary">2人対戦</p>
      <form id="settingsForm" class="settings" novalidate>
        <label class="field"><span>ラウンド数</span><input name="rounds" type="number" min="1" max="100" step="1" value="${settings.rounds}"><span class="help">1〜100の整数</span></label>
        <label class="field"><span>行列サイズ</span><select name="matrixSize">${[2, 3, 4, 5].map((size) => `<option value="${size}" ${size === settings.matrixSize ? 'selected' : ''}>${size} × ${size}</option>`).join('')}</select></label>
        <div class="field"><span>誤答ペナルティ倍率</span><div class="weight-fields"><input name="weightInteger" type="number" min="0" max="99" step="1" value="${Math.floor(settings.penaltyWeightHundredths / 100)}" aria-label="倍率の整数部分" required><span>.</span><input name="weightDecimal" class="decimal-input" type="text" inputmode="numeric" maxlength="2" value="${String(settings.penaltyWeightHundredths % 100).padStart(2, '0')}" aria-label="倍率の小数部分" required></div><span class="help">0.00〜99.99（小数部分は2桁）</span></div>
        <div class="field"><span>要素の範囲</span><div class="range-fields"><input name="minElement" type="number" step="1" value="${settings.minElement}" aria-label="要素の最小値"><span>〜</span><input name="maxElement" type="number" step="1" value="${settings.maxElement}" aria-label="要素の最大値"></div><p class="help">最小値と最大値を整数で入力してください。</p></div>
        <p id="settingsError" class="error" role="alert"></p><div class="actions"><button type="submit">この設定で開始</button><button id="backButton" class="secondary" type="button">戻る</button></div>
      </form></section>`;
    const form = this.root.querySelector('#settingsForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const weightIntegerText = form.elements.weightInteger.value.trim();
      const weightInteger = Number(weightIntegerText);
      const weightDecimalText = form.elements.weightDecimal.value.trim();
      const values = { rounds: Number(form.elements.rounds.value), matrixSize: Number(form.elements.matrixSize.value), minElement: Number(form.elements.minElement.value), maxElement: Number(form.elements.maxElement.value), weightIntegerText, weightInteger, weightDecimalText, penaltyWeightHundredths: weightInteger * 100 + Number(weightDecimalText) };
      const error = this.validateSettings(values);
      this.root.querySelector('#settingsError').textContent = error;
      if (!error) onSubmit(values);
    });
    this.root.querySelector('#backButton').addEventListener('click', onBack);
  }

  validateSettings({ rounds, matrixSize, minElement, maxElement, weightIntegerText, weightInteger, weightDecimalText, penaltyWeightHundredths }) {
    if (!Number.isInteger(rounds) || rounds < 1 || rounds > 100) return 'ラウンド数は1〜100の整数にしてください。';
    if (![2, 3, 4, 5].includes(matrixSize)) return '行列サイズを選択してください。';
    if (!Number.isInteger(minElement) || !Number.isInteger(maxElement)) return '要素の範囲には整数を入力してください。';
    if (minElement > maxElement) return '最小値は最大値以下にしてください。';
    if (minElement === maxElement) return '最小値と最大値には異なる値を指定してください。';
    if (!/^\d{1,2}$/.test(weightIntegerText) || Number(weightIntegerText) !== weightInteger || !Number.isInteger(weightInteger) || weightInteger < 0 || weightInteger > 99 || !/^\d{2}$/.test(weightDecimalText) || !Number.isInteger(penaltyWeightHundredths) || penaltyWeightHundredths < 0 || penaltyWeightHundredths > 9999) return '誤答ペナルティ倍率は、整数部0〜99・小数部2桁で入力してください。';
    return '';
  }

  renderProblem(state, onSubmit, onSelectPlayer, onAdvance, onBack) {
    this.clearTimer();
    const { settings, currentRound } = state;
    const cells = state.matrix.flatMap((row) => row.map((value) => `<span>${value}</span>`)).join('');
    const playerButtons = state.players.map((player) => `<button class="player-button ${player.id === state.activePlayerId ? 'active' : ''} ${player.solved ? 'solved' : ''}" type="button" data-player-id="${player.id}" ${player.solved || state.roundComplete ? 'disabled' : ''}>${player.name}${player.solved ? ' ✓' : ''}</button>`).join('');
    const scoreRows = state.players.map((player) => {
      if (!state.roundComplete) {
        const previousTotal = player.totalScore - (player.roundScore ?? 0n);
        return `<tr><th>${player.name}</th><td>${player.solved ? '正解済み' : '挑戦中'}</td><td>${player.errors}回</td><td>${Util.formatHundredths(previousTotal)}</td></tr>`;
      }
      const timePoints = Util.formatHundredths(BigInt(player.timeSeconds) * 100n);
      const penaltyPoints = Util.formatHundredths(Util.calculatePenalty(player.errorPenalty, settings.penaltyWeightHundredths));
      return `<tr><th>${player.name}</th><td>${timePoints}</td><td>${penaltyPoints}</td><td>${Util.formatHundredths(player.roundScore)}</td><td>${Util.formatHundredths(player.totalScore)}</td></tr>`;
    }).join('');
    const feedback = state.feedback ? `<p id="answerFeedback" class="answer-feedback ${state.feedback.type}" role="status">${state.feedback.message}</p>` : '<p id="answerFeedback" class="answer-feedback" role="status"></p>';
    const roundAction = state.roundComplete ? `<button id="advanceButton" type="button">${currentRound < settings.rounds ? '次のラウンドへ' : '最終結果を見る'}</button>` : '';
    const activePlayer = state.players.find((player) => player.id === state.activePlayerId);

    const scoreHead = state.roundComplete
      ? '<tr><th>プレイヤー</th><th>秒数</th><th>ペナルティ</th><th>今回</th><th>合計</th></tr>'
      : '<tr><th>プレイヤー</th><th>状態</th><th>誤答</th><th>前回まで</th></tr>';
    const histories = state.roundComplete ? `<div class="history-list">${state.players.map((player) => {
      const rows = (player.attempts ?? []).map((attempt, index) => `<tr><td>${index + 1}回目</td><td>${attempt.answer}</td><td>${attempt.difference}</td><td>${attempt.correct ? '正解' : '誤答'}</td></tr>`).join('');
      return `<section class="history-item"><button class="history-toggle secondary" type="button" aria-expanded="false" aria-controls="history-${player.id}" data-player-name="${player.name}">${player.name}の回答記録を見る</button><div id="history-${player.id}" class="answer-history"><div class="history-inner"><table class="history-table"><thead><tr><th>回数</th><th>回答値</th><th>正解との差</th><th>結果</th></tr></thead><tbody>${rows}</tbody></table></div></div></section>`;
    }).join('')}</div>` : '';
    this.root.innerHTML = `<section class="game-screen">
      <header class="game-header">
        <p class="round-label">ラウンド ${currentRound} / ${settings.rounds}</p>
        <p id="timer" class="timer">0秒</p>
        <p class="weight-label">誤答 ×${Util.formatHundredths(settings.penaltyWeightHundredths)}</p>
      </header>
      <div class="play-grid">
        <div class="matrix-panel"><div class="matrix-wrap" aria-label="計算する行列"><div class="matrix" style="--matrix-size:${settings.matrixSize}">${cells}</div></div></div>
        <div class="answer-panel">
          <div class="player-selector" aria-label="回答するプレイヤー">${playerButtons}</div>
          <form id="answerForm" class="answer-form" novalidate><label for="answerInput">${state.roundComplete ? '両プレイヤー正解' : `${activePlayer.name} の回答`}</label><div class="answer-controls"><input id="answerInput" name="answer" type="text" inputmode="numeric" autocomplete="off" aria-describedby="answerFeedback" ${state.roundComplete ? 'disabled' : 'autofocus'}><button id="answerButton" type="submit" ${state.roundComplete ? 'disabled' : ''}>回答する</button></div>${feedback}</form>
        </div>
      </div>
      <div class="score-table-wrap"><table class="score-table"><thead>${scoreHead}</thead><tbody>${scoreRows}</tbody></table></div>
      ${histories}
      <div class="actions game-actions">${roundAction}<button id="changeSettingsButton" class="secondary" type="button">ゲームを終了</button></div>
    </section>`;

    const form = this.root.querySelector('#answerForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      onSubmit(form.elements.answer.value);
    });
    this.root.querySelectorAll('.player-button').forEach((button) => button.addEventListener('click', () => onSelectPlayer(Number(button.dataset.playerId))));
    this.root.querySelector('#advanceButton')?.addEventListener('click', onAdvance);
    this.root.querySelector('#changeSettingsButton').addEventListener('click', onBack);
    this.root.querySelectorAll('.history-toggle').forEach((button) => button.addEventListener('click', () => {
      const panel = this.root.querySelector(`#${button.getAttribute('aria-controls')}`);
      const isOpen = panel.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
      button.textContent = `${button.dataset.playerName}の回答記録を${isOpen ? '閉じる' : '見る'}`;
    }));
    this.startTimer(state.roundStartedAt, state.roundComplete);
    if (!state.roundComplete) this.root.querySelector('#answerInput').focus();
  }

  showAnswerError(message) {
    const feedback = this.root.querySelector('#answerFeedback');
    feedback.textContent = message;
    feedback.className = 'answer-feedback input-error';
    this.root.querySelector('#answerInput').focus();
  }

  startTimer(startedAt, stopped) {
    const timer = this.root.querySelector('#timer');
    const update = () => { timer.textContent = `${Math.floor((Date.now() - startedAt) / 1000)}秒`; };
    update();
    if (!stopped) this.timerId = setInterval(update, 250);
  }

  renderResults(state, onSettings, onRematch) {
    this.clearTimer();
    const ranking = [...state.players].sort((left, right) => left.totalScore < right.totalScore ? -1 : left.totalScore > right.totalScore ? 1 : 0);
    const isDraw = ranking[0].totalScore === ranking[1].totalScore;
    const headline = isDraw ? '引き分け！' : `${ranking[0].name} の勝利！`;
    const rows = ranking.map((player, index) => `<tr><td>${isDraw ? '—' : index + 1}</td><th>${player.name}</th><td>${Util.formatHundredths(player.totalScore)}</td></tr>`).join('');
    this.root.innerHTML = `<section><h2>${headline}</h2><p class="subtitle">${state.settings.rounds}ラウンドの最終結果</p><table class="score-table results-table"><thead><tr><th>順位</th><th>プレイヤー</th><th>合計点</th></tr></thead><tbody>${rows}</tbody></table><p class="help">合計点が低いほど上位です。</p><div class="actions"><button id="rematchButton" type="button">もう一度遊ぶ</button><button id="settingsButton" class="secondary" type="button">設定へ戻る</button></div></section>`;
    this.root.querySelector('#rematchButton').addEventListener('click', onRematch);
    this.root.querySelector('#settingsButton').addEventListener('click', onSettings);
  }
}
