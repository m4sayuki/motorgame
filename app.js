// キャンバス
var c = document.createElement("canvas");
var ctx  = c.getContext("2d");
// キャンバスの大きさを調整
c.width = 1000
c.height = 500;

var size = 15;

// HTMLのbodyに追加
document.body.appendChild(c);

// パラメータというリストを定義
var perm = [];

// パラメータが255の間でランダムに作られる、線形分離と言われるものらしい
while (perm.length < 255) {
  while(perm.includes(val = Math.floor(Math.random() * 255 )));
  perm.push(val);
}

// ここはよくわかりません(ベクトルがどうこうみたいな話)、曲面の調整
var lerp = (a, b, t) => a + (b - a) * (1 - Math.cos(t * Math.PI)) / 2;

// 斜面を描画
var noise = x => {
  // 斜面の角度を調整している
  x = x * 0.01 % 255;
  return lerp(perm[Math.floor(x)], perm[Math.ceil(x)], x - Math.floor(x));
}

var player = new function() {
  this.x = c.width / 2;
  this.y = 0;
  this.ySpeed = 0;
  this.rot = 0;
  this.rSpeed = 0;

  // プレイヤーの画像
  this.img = new Image();
  this.img.src = "images/moto.png";
  // this.img.src = "images/trump.png";

  this.draw = function() {
    var p1 = c.height - noise(t + this.x) * 0.25;
    var p2 = c.height - noise(t + 5 + this.x) * 0.25;

    var grounded = 0

    if(p1 - size > this.y) {
      this.ySpeed += 0.1;
    } else {
      this.ySpeed -= this.y - (p1 - size);
      this.y = p1 - size;

      grounded = 1; 
    }  

    // ゲームオーバーの処理
    if(!playing || grounded && Math.abs(this.rot) > Math.PI * 0.5) {
      playing = false;
      this.rSpeed = 5;
      k.ArrowUp = 1;
      this.x -= speed * 5;
    }

    var angle = Math.atan2((p2 - size) - this.y, (this.x + 5) - this.x);

    this.y += this.ySpeed;

    if(grounded && playing) {
      this.rot -= (this.rot - angle) * 0.5;
      this.rSpeed = this.rSpeed - (angle -this.rot);
    } 

    this.rSpeed += (k.ArrowLeft - k.ArrowRight) * 0.05;
    this.rot -= this.rSpeed * 0.1;

    if(this.rot > Math.PI) this.rot = -Math.PI;
    if(this.rot < -Math.PI) this.rot = Math.PI;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.drawImage(this.img, -size, -size, 30, 30);

    ctx.restore();
  }
}

var t = 0;
var speed = 0;
var  playing = true; 
var k = {ArrowUp:0, ArrowDown:0, ArrowLeft:0, ArrowRight:0};

function loop() {
  // バイク速度の調整
  speed -= (speed - (k.ArrowUp - k.ArrowDown)) * 0.1; // 上矢印でスピードアップ、下矢印でスピードダウン
  t += 10 * speed;
  ctx.fillStyle = "#19f";
  // 長方形を描画
  ctx.fillRect(0, 0, c.width, c.height);
  // 塗りつぶしの色
  ctx.fillStyle = "black";

// 線を描画
  ctx.beginPath();
  ctx.moveTo(0, c.height);

  // 画面隅からどんどん斜面を描画
  for (var i = 0; i <  c.width; i++) {
    // ノイズの高さが変わっていく処理
    ctx.lineTo(i, c.height - noise(t + i) * 0.25);
  }

  ctx.lineTo(c.width, c.height);  

  ctx.fill(); 

  player.draw(); 
  requestAnimationFrame(loop);
} 

// キーを押しているか押していないかを判定する
onkeydown = d => k[d.key] = 1;
onkeyup = d => k[d.key] = 0;

// loopを実行
loop();