import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHAPES, newTetris, stepTetris, fits, clearLines, rotateMatrix } from '../src/js/tetris.js';
const empty = () => Array.from({ length: 20 }, () => Array(10).fill(null));
test('blocks cannot move through a wall or an occupied square', () => {
  const board = empty(),
    piece = { matrix: SHAPES.O, x: 0, y: 10 };
  assert.equal(fits(board, piece, -1, 10), false);
  board[10][1] = 'I';
  assert.equal(fits(board, piece), false);
});
test('four clockwise rotations restore the piece', () => {
  let matrix = SHAPES.J.map((r) => r.slice());
  for (let i = 0; i < 4; i++) matrix = rotateMatrix(matrix);
  assert.deepEqual(matrix, SHAPES.J);
});
test('completed rows disappear and the rows above shift down', () => {
  const board = empty();
  board[19] = Array(10).fill('I');
  board[18][3] = 'T';
  const result = clearLines(board);
  assert.equal(result.lines, 1);
  assert.equal(result.board[19][3], 'T');
  assert.equal(result.board.length, 20);
  assert.equal(board[19][0], 'I');
});
test('hard drop locks a piece and preserves the previous state', () => {
  const initial = newTetris(() => 0.3),
    next = stepTetris(initial, 'drop', () => 0.3);
  assert.equal(initial.board.flat().filter(Boolean).length, 0);
  assert.equal(next.board.flat().filter(Boolean).length, 4);
  assert.ok(next.score > 0);
});
test('pause prevents gravity and movement until resumed', () => {
  const a = stepTetris(
    newTetris(() => 0.5),
    'pause'
  );
  const b = stepTetris(a, 'tick');
  assert.equal(b.piece.y, a.piece.y);
  assert.equal(stepTetris(a, 'pause').paused, false);
});
