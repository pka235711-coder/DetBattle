export class Util {
  static parseIntegerAnswer(rawValue) {
    const normalized = String(rawValue).trim();
    if (!/^[+-]?\d+$/.test(normalized)) {
      throw new TypeError('答えを整数で入力してください。');
    }
    return BigInt(normalized);
  }
}
