import assert from 'node:assert/strict';
import { MatrixGenerator } from '../js/generator.js';
import { DeterminantCalculator } from '../js/determinant.js';

const calculator = new DeterminantCalculator();
assert.equal(calculator.calculate([[1, 2], [3, 4]]), -2n);
assert.equal(calculator.calculate([[0, 1], [1, 0]]), -1n);
assert.equal(calculator.calculate([[1, 2, 3], [4, 5, 6], [7, 8, 9]]), 0n);
assert.equal(calculator.calculate([[2, -1, 0], [3, 4, 5], [1, 2, 1]]), -14n);
assert.equal(calculator.calculate([[1, 0, 0, 0], [0, 2, 0, 0], [0, 0, 3, 0], [0, 0, 0, 4]]), 24n);

const generator = new MatrixGenerator();
const generated = generator.generate(5, -9, 9);
assert.equal(generated.length, 5);
assert.ok(generated.every((row) => row.length === 5));
assert.ok(generated.flat().every((value) => Number.isInteger(value) && value >= -9 && value <= 9));

console.log('All math tests passed.');
