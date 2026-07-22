export class Util {
  static parseIntegerAnswer(rawValue) {
    const normalized = String(rawValue).trim();
    if (!/^[+-]?\d+$/.test(normalized)) {
      throw new TypeError('答えを整数で入力してください。');
    }
    return BigInt(normalized);
  }

  static absoluteDifference(left, right) {
    const difference = BigInt(left) - BigInt(right);
    return difference < 0n ? -difference : difference;
  }

  static calculateScore(elapsedSeconds, errorPenalty, weightHundredths = 100) {
    if (!Number.isInteger(elapsedSeconds) || elapsedSeconds < 0) {
      throw new RangeError('経過時間は0以上の整数にしてください。');
    }
    if (!Number.isInteger(weightHundredths) || weightHundredths < 0 || weightHundredths > 9999) {
      throw new RangeError('誤答ペナルティ倍率が範囲外です。');
    }
    return BigInt(elapsedSeconds) * 100n + this.calculatePenalty(errorPenalty, weightHundredths);
  }

  static calculatePenalty(errorPenalty, weightHundredths = 100) {
    if (!Number.isInteger(weightHundredths) || weightHundredths < 0 || weightHundredths > 9999) {
      throw new RangeError('誤答ペナルティ倍率が範囲外です。');
    }
    return BigInt(errorPenalty) * BigInt(weightHundredths);
  }

  static formatHundredths(value) {
    const amount = BigInt(value);
    const sign = amount < 0n ? '-' : '';
    const absolute = amount < 0n ? -amount : amount;
    return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`;
  }
}
