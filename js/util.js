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

  static calculateScore(elapsedSeconds, errorPenalty) {
    if (!Number.isInteger(elapsedSeconds) || elapsedSeconds < 0) {
      throw new RangeError('経過時間は0以上の整数にしてください。');
    }
    return BigInt(elapsedSeconds) + BigInt(errorPenalty);
  }
}
