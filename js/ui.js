export class UI {
  constructor(root) { this.root = root; }
  renderTitle(onStart) {
    this.root.innerHTML = `<section><h1>Det Battle</h1><p class="subtitle">行列式を誰よりも速く、正確に。</p><button id="startButton" type="button">ゲーム開始</button></section>`;
    this.root.querySelector('#startButton').addEventListener('click', onStart);
  }
  renderSettings(settings, onSubmit, onBack) {
    this.root.innerHTML = `<section><h2>ゲーム設定</h2><p class="rule-summary">2人・全10ラウンド</p>
      <form id="settingsForm" class="settings" novalidate>
        <label class="field"><span>行列サイズ</span><select name="matrixSize">${[2, 3, 4, 5].map((size) => `<option value="${size}" ${size === settings.matrixSize ? 'selected' : ''}>${size} × ${size}</option>`).join('')}</select></label>
        <div class="field"><span>要素の範囲</span><div class="range-fields"><input name="minElement" type="number" step="1" value="${settings.minElement}" aria-label="要素の最小値"><span>〜</span><input name="maxElement" type="number" step="1" value="${settings.maxElement}" aria-label="要素の最大値"></div><p class="help">最小値と最大値を整数で入力してください。</p></div>
        <p id="settingsError" class="error" role="alert"></p><div class="actions"><button type="submit">この設定で開始</button><button id="backButton" class="secondary" type="button">戻る</button></div>
      </form></section>`;
    const form = this.root.querySelector('#settingsForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = { matrixSize: Number(form.elements.matrixSize.value), minElement: Number(form.elements.minElement.value), maxElement: Number(form.elements.maxElement.value) };
      const error = this.validateSettings(values);
      this.root.querySelector('#settingsError').textContent = error;
      if (!error) onSubmit(values);
    });
    this.root.querySelector('#backButton').addEventListener('click', onBack);
  }
  validateSettings({ matrixSize, minElement, maxElement }) {
    if (![2, 3, 4, 5].includes(matrixSize)) return '行列サイズを選択してください。';
    if (!Number.isInteger(minElement) || !Number.isInteger(maxElement)) return '要素の範囲には整数を入力してください。';
    if (minElement > maxElement) return '最小値は最大値以下にしてください。';
    if (minElement === maxElement) return '最小値と最大値には異なる値を指定してください。';
    return '';
  }
  renderGamePlaceholder(state, onBack) {
    const { settings, currentRound } = state;
    this.root.innerHTML = `<section><h2>ゲーム準備完了</h2><p class="subtitle">次のコミットで問題を生成・表示します。</p><div class="status-card"><dl><dt>プレイヤー</dt><dd>${settings.players}人</dd><dt>ラウンド</dt><dd>${currentRound} / ${settings.rounds}</dd><dt>行列</dt><dd>${settings.matrixSize} × ${settings.matrixSize}</dd><dt>要素</dt><dd>${settings.minElement} 〜 ${settings.maxElement}</dd></dl></div><div class="actions"><button id="changeSettingsButton" class="secondary" type="button">設定に戻る</button></div></section>`;
    this.root.querySelector('#changeSettingsButton').addEventListener('click', onBack);
  }
}
