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
        <div class="field"><span>要素の範囲</span><div class="range-fields"><input name="minElement" type="number" step="1" value="${settings.minElement}" aria-label="要素の最小値"><span>〜</span><input name="maxElement" type="number" step="1" value="${settings.maxElement}" aria-label="要素の最大値"></div><p class="help">最小値と最大値を整数で入力してください。</p></div>
        <p id="settingsError" class="error" role="alert"></p><div class="actions"><button type="submit">この設定で開始</button><button id="backButton" class="secondary" type="button">戻る</button></div>
      </form></section>`;
    const form = this.root.querySelector('#settingsForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = { rounds: Number(form.elements.rounds.value), matrixSize: Number(form.elements.matrixSize.value), minElement: Number(form.elements.minElement.value), maxElement: Number(form.elements.maxElement.value) };
      const error = this.validateSettings(values);
      this.root.querySelector('#settingsError').textContent = error;
      if (!error) onSubmit(values);
    });
    this.root.querySelector('#backButton').addEventListener('click', onBack);
  }

  validateSettings({ rounds, matrixSize, minElement, maxElement }) {
    if (!Number.isInteger(rounds) || rounds < 1 || rounds > 100) return 'ラウンド数は1〜100の整数にしてください。';
    if (![2, 3, 4, 5].includes(matrixSize)) return '行列サイズを選択してください。';
    if (!Number.isInteger(minElement) || !Number.isInteger(maxElement)) return '要素の範囲には整数を入力してください。';
    if (minElement > maxElement) return '最小値は最大値以下にしてください。';
    if (minElement === maxElement) return '最小値と最大値には異なる値を指定してください。';
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
        return `<tr><th>${player.name}</th><td>${player.solved ? '正解済み' : '挑戦中'}</td><td>${player.errors}回</td><td>${previousTotal}</td></tr>`;
      }
      return `<tr><th>${player.name}</th><td>${player.timeSeconds}秒</td><td>${player.errorPenalty}</td><td>${player.roundScore}</td><td>${player.totalScore}</td></tr>`;
    }).join('');
    const feedback = state.feedback ? `<p id="answerFeedback" class="answer-feedback ${state.feedback.type}" role="status">${state.feedback.message}</p>` : '<p id="answerFeedback" class="answer-feedback" role="status"></p>';
    const roundAction = state.roundComplete ? `<button id="advanceButton" type="button">${currentRound < settings.rounds ? '次のラウンドへ' : '最終結果を見る'}</button>` : '';
    const activePlayer = state.players.find((player) => player.id === state.activePlayerId);

    const scoreHead = state.roundComplete
      ? '<tr><th>プレイヤー</th><th>時間</th><th>誤差合計</th><th>今回</th><th>合計</th></tr>'
      : '<tr><th>プレイヤー</th><th>状態</th><th>誤答</th><th>前回まで</th></tr>';
    this.root.innerHTML = `<section><div class="game-header"><p>ラウンド ${currentRound} / ${settings.rounds}</p><p id="timer">0秒</p></div><h2>この行列式を計算</h2><div class="matrix-wrap" aria-label="計算する行列"><div class="matrix" style="--matrix-size:${settings.matrixSize}">${cells}</div></div><div class="player-selector" aria-label="回答するプレイヤー">${playerButtons}</div><form id="answerForm" class="answer-form" novalidate><label for="answerInput">${state.roundComplete ? '両プレイヤー正解' : `${activePlayer.name} の回答`}</label><div class="answer-controls"><input id="answerInput" name="answer" type="text" inputmode="numeric" autocomplete="off" aria-describedby="answerFeedback" ${state.roundComplete ? 'disabled' : 'autofocus'}><button id="answerButton" type="submit" ${state.roundComplete ? 'disabled' : ''}>回答する</button></div>${feedback}</form><div class="score-table-wrap"><table class="score-table"><thead>${scoreHead}</thead><tbody>${scoreRows}</tbody></table></div><div class="actions">${roundAction}<button id="changeSettingsButton" class="secondary" type="button">ゲームを終了</button></div></section>`;

    const form = this.root.querySelector('#answerForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      onSubmit(form.elements.answer.value);
    });
    this.root.querySelectorAll('.player-button').forEach((button) => button.addEventListener('click', () => onSelectPlayer(Number(button.dataset.playerId))));
    this.root.querySelector('#advanceButton')?.addEventListener('click', onAdvance);
    this.root.querySelector('#changeSettingsButton').addEventListener('click', onBack);
    this.startTimer(state.roundStartedAt, state.roundComplete);
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
    const rows = ranking.map((player, index) => `<tr><td>${isDraw ? '—' : index + 1}</td><th>${player.name}</th><td>${player.totalScore}</td></tr>`).join('');
    this.root.innerHTML = `<section><h2>${headline}</h2><p class="subtitle">${state.settings.rounds}ラウンドの最終結果</p><table class="score-table results-table"><thead><tr><th>順位</th><th>プレイヤー</th><th>合計点</th></tr></thead><tbody>${rows}</tbody></table><p class="help">合計点が低いほど上位です。</p><div class="actions"><button id="rematchButton" type="button">もう一度遊ぶ</button><button id="settingsButton" class="secondary" type="button">設定へ戻る</button></div></section>`;
    this.root.querySelector('#rematchButton').addEventListener('click', onRematch);
    this.root.querySelector('#settingsButton').addEventListener('click', onSettings);
  }
}
