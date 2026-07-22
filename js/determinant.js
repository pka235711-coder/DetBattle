export class DeterminantCalculator {
  calculate(matrix) {
    this.validateMatrix(matrix);
    const size = matrix.length;
    if (size === 0) return 1n;

    const work = matrix.map((row) => row.map((value) => BigInt(value)));
    let sign = 1n;
    let previousPivot = 1n;

    for (let pivotIndex = 0; pivotIndex < size - 1; pivotIndex += 1) {
      let pivotRow = pivotIndex;
      while (pivotRow < size && work[pivotRow][pivotIndex] === 0n) pivotRow += 1;
      if (pivotRow === size) return 0n;

      if (pivotRow !== pivotIndex) {
        [work[pivotIndex], work[pivotRow]] = [work[pivotRow], work[pivotIndex]];
        sign *= -1n;
      }

      const pivot = work[pivotIndex][pivotIndex];
      for (let row = pivotIndex + 1; row < size; row += 1) {
        for (let column = pivotIndex + 1; column < size; column += 1) {
          work[row][column] = (
            work[row][column] * pivot
            - work[row][pivotIndex] * work[pivotIndex][column]
          ) / previousPivot;
        }
      }
      previousPivot = pivot;
    }

    return sign * work[size - 1][size - 1];
  }

  validateMatrix(matrix) {
    if (!Array.isArray(matrix) || matrix.length === 0) {
      throw new TypeError('空でない正方行列を指定してください。');
    }
    const size = matrix.length;
    const isValid = matrix.every((row) =>
      Array.isArray(row)
      && row.length === size
      && row.every((value) => Number.isSafeInteger(value) || typeof value === 'bigint'),
    );
    if (!isValid) throw new TypeError('整数のみからなる正方行列を指定してください。');
  }
}
