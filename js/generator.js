export class MatrixGenerator {
  generate(size, minElement, maxElement) {
    this.validateArguments(size, minElement, maxElement);
    const width = maxElement - minElement + 1;
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => minElement + Math.floor(Math.random() * width)),
    );
  }

  validateArguments(size, minElement, maxElement) {
    if (!Number.isInteger(size) || size < 2 || size > 5) {
      throw new RangeError('行列サイズは2から5の整数にしてください。');
    }
    if (!Number.isSafeInteger(minElement) || !Number.isSafeInteger(maxElement)) {
      throw new RangeError('要素の範囲には安全に扱える整数を指定してください。');
    }
    if (minElement > maxElement) {
      throw new RangeError('要素の最小値は最大値以下にしてください。');
    }
    if (!Number.isSafeInteger(maxElement - minElement + 1)) {
      throw new RangeError('要素の範囲が広すぎます。');
    }
  }
}
