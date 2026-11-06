const express = require("express");
const app = express();

app.set('view engine', 'ejs');
app.use("/public", express.static(__dirname + "/public"));

app.get("/hello1", (req, res) => {
  const message1 = "Hello world";
  const message2 = "Bon jour";
  res.render('show', { greet1:message1, greet2:message2});
});

app.get("/hello2", (req, res) => {
  res.render('show', { greet1:"Hello world", greet2:"Bon jour"});
});

app.get("/icon", (req, res) => {
  res.render('icon', { filename:"./public/Apple_logo_black.svg", alt:"Apple Logo"});
});

app.get("/omikuji1", (req, res) => {
  const num = Math.floor( Math.random() * 6 + 1 );
  let luck = '';
  if( num==1 ) luck = '大吉';
  else if( num==2 ) luck = '中吉';

  res.send( '今日の運勢は' + luck + 'です' );
});

app.get("/omikuji2", (req, res) => {
  const num = Math.floor( Math.random() * 6 + 1 );
  let luck = '';
  if( num==1 ) luck = '大吉';
  else if( num==2 ) luck = '中吉';

  res.render( 'omikuji2', {result:luck} );
});

app.get("/janken", (req, res) => {
  let hand = req.query.hand;
  let win = Number( req.query.win );
  let total = Number( req.query.total );
  console.log( {hand, win, total});
  const num = Math.floor( Math.random() * 3 + 1 );
  let cpu = '';
  let judgement = '';
  if( num==1 ) cpu = 'グー';
  else if( num==2 ) cpu = 'チョキ';
  else cpu = 'パー';
  // ここに勝敗の判定を入れる
  // 以下の数行は人間の勝ちの場合の処理なので，
  // 判定に沿ってあいこと負けの処理を追加する
  judgement = '勝ち';
  win += 1;
  total += 1;
  const display = {
    your: hand,
    cpu: cpu,
    judgement: judgement,
    win: win,
    total: total
  }
  res.render( 'janken', display );
});

// 第7回：元の /janken を残し、ラジオボタン版を追加する。
app.get("/janken2", (req, res) => {
  const hand = req.query.hand;
  const hands = ['グー', 'チョキ', 'パー'];
  if (!hands.includes(hand)) {
    return res.status(400).send('グー・チョキ・パーから手を選んでください。');
  }

  // GETで届く値は文字列なので、計算の前に数値にする。
  let win = Number(req.query.win ?? 0);
  let total = Number(req.query.total ?? 0);
  if (!Number.isSafeInteger(win) || !Number.isSafeInteger(total) ||
      win < 0 || total < win || total >= Number.MAX_SAFE_INTEGER) {
    return res.status(400).send('勝利数と対戦数が正しくありません。');
  }

  const cpu = hands[Math.floor(Math.random() * 3)];
  let judgement;
  if (hand === cpu) {
    judgement = 'あいこ';
  } else if ((hand === 'グー' && cpu === 'チョキ') ||
             (hand === 'チョキ' && cpu === 'パー') ||
             (hand === 'パー' && cpu === 'グー')) {
    judgement = '勝ち';
    win += 1;
  } else {
    judgement = '負け';
  }
  total += 1;
  res.render('janken2', { your: hand, cpu, judgement, win, total });
});

app.listen(8080, () => console.log("Example app listening on port 8080!"));
