const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ejs = require('ejs');

const root = path.join(__dirname, '..');

// CPUの手を固定し、実際のapp5.jsのルートを全組み合わせで検証する。
function play(query, cpuIndex) {
  const routes = {};
  const app = { set() {}, use() {}, get(url, handler) { routes[url] = handler; }, listen() {} };
  const express = () => app;
  express.static = () => {};
  const math = Object.create(Math);
  math.random = () => (cpuIndex + 0.5) / 3;
  vm.runInNewContext(fs.readFileSync(path.join(root, 'app5.js'), 'utf8'), {
    require: () => express, __dirname: root, Math: math, console
  });
  const result = { statusCode: 200 };
  const res = {
    status(code) { result.statusCode = code; return this; },
    send(message) { result.message = message; },
    render(view, data) {
      result.data = data;
      result.html = ejs.render(fs.readFileSync(path.join(root, 'views', view + '.ejs'), 'utf8'), data);
    }
  };
  routes['/janken2']({ query }, res);
  return result;
}

const hands = ['グー', 'チョキ', 'パー'];
const expected = [['あいこ', '勝ち', '負け'], ['負け', 'あいこ', '勝ち'], ['勝ち', '負け', 'あいこ']];
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    test(`${hands[i]} 対 ${hands[j]}：${expected[i][j]}`, () => {
      const result = play({ hand: hands[i], win: '2', total: '5' }, j);
      assert.equal(result.statusCode, 200);
      assert.equal(result.data.judgement, expected[i][j]);
      assert.equal(result.data.your, hands[i]);
      assert.equal(result.data.cpu, hands[j]);
      const wins = expected[i][j] === '勝ち' ? 3 : 2;
      assert.equal(result.data.win, wins);
      assert.equal(result.data.total, 6);
      assert.match(result.html, new RegExp(`name="win" value="${wins}"`));
      assert.match(result.html, /name="total" value="6"/);
      assert.equal((result.html.match(/type="radio" name="hand"/g) || []).length, 3);
    });
  }
}

test('手と成績が不正な場合は対戦せず400を返す', () => {
  for (const query of [
    {}, { hand: '不正' }, { hand: ['グー', 'パー'] },
    { hand: 'グー', win: '-1', total: '0' },
    { hand: 'グー', win: '3', total: '2' },
    { hand: 'グー', win: 'abc', total: '5' },
    { hand: 'グー', win: '0', total: '1.5' }
  ]) assert.equal(play(query, 0).statusCode, 400);
});

test('成績未指定なら0から開始する', () => {
  const result = play({ hand: 'グー' }, 1);
  assert.equal(result.data.win, 1);
  assert.equal(result.data.total, 1);
});
