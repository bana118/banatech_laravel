@extends('base.base')

@section('title', 'はこぐちゃ')
@section('description', 'JavaScript、anime.js、を用いたパズルゲーム。ブロックを回転させ同じ色のブロックを4つそろえよう')
@include('base.head')
<script src="{{ asset('js/scripts.js') }}"></script>
@section('content')
<div class="uk-container uk-container-center uk-background-default" style="touch-action: manipulation;">
    <div class="uk-container" style="width: 290px;">
        <audio src="" id="startSoundEffect"></audio>
        <audio src="" id="overSoundEffect"></audio>
        <audio src="" id="countDownSoundEffect"></audio>
        <audio src="" id="moveSoundEffect"></audio>
        <audio src="" id="rotateSoundEffect"></audio>
        <audio src="" id="scoreSoundEffect"></audio>
        <audio src="" id="BGM"></audio>
        <div class="uk-card uk-card-default">
            <div class="uk-card-body uk-text-center">
                <div class="uk-grid uk-flex-center">
                    <div class="uk-width-1-2">
                        <div class="uk-text-left" id="score">score: </div>
                    </div>
                    <div class="uk-width-1-2">
                        <div class="uk-text-right" id="time">time: </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="blockBox uk-flex uk-flex-center" style="position: relative;">
            <canvas id="controller" width="96px" height="96px" style="position: absolute; top:0px; left: 0px;"></canvas>
            @for ($block = 0; $block < 36; $block++)
            @if ($block % 6 == 0)
            <div class="blockColumn uk-flex uk-flex-column">
            @endif
                <canvas class="block" style="margin : 4px" id="b-{{ $block }}" width="40px" height="40px"></canvas>
            @if ($block % 6 == 5)
            </div>
            @endif
            @endfor
            <canvas id="screen" width="290px" height="290px" style="position: absolute; top:0px; left: 0px;" onClick="gameStart();"></canvas>
        </div>
        <div class="uk-grid">
            <div class="uk-width-1-6 uk-padding-remove"></div>
            <button class="uk-width-1-4 uk-padding-remove uk-button-danger fas fa-angle-up fa-3x fa-fw" onClick="buttonUp();"></button>
        </div>
        <div class="uk-grid">
            <button class="uk-width-1-4 uk-padding-remove uk-button-primary fas fa-angle-left fa-3x fa-fw" onClick="buttonLeft();"></button>
            <button class="uk-width-1-4 uk-padding-remove uk-button-primary fas fa-angle-right fa-3x fa-fw" onClick="buttonRight();"></button>
            <div class="uk-width-1-6"></div>
            <button class="uk-width-1-6 uk-padding-remove uk-button-secondary fas fa-undo fa-2x fa-fw" onClick="buttonCounterClockwise();"></button>
            <button class="uk-width-1-6 uk-padding-remove uk-button-default fas fa-redo fa-2x fa-fw" onClick="buttonClockwise();"></button>
        </div>
        <div class="uk-grid">
            <div class="uk-width-1-6"></div>
            <button class="uk-width-1-4 uk-padding-remove uk-button-danger fas fa-angle-down fa-3x fa-fw" onClick="buttonDown();"></button>
        </div>
    </div>
    <br>
    <p class="uk-text-center">
        音量調整：
        <input type="range" value="100" id="volume" min="0" max="100" step="1" onchange="setVolume(this.value)">
    </p>
    <p class="uk-text-center">音量：<span id="outputVolume"></span></p>
    <br>
    <h1>くるくる</h1>
    <p>ルール：カーソルを操作して同じ色のブロックを4つ正方形に並べよう。連続で消していくとスコアアップ！
        スペースキーかゲーム画面クリックで最初の画面からゲームスタートしたりゲームオーバー画面から最初の画面に戻ることができます。</p>
    <p>うまく動作しない場合は一度更新すると音楽や画像がキャッシュに入り、動くかもしれません。またGoogle Chromeだと動くかもしれません。</p>
    <p>制作記事：<a href="/blog/15">anime.jsを使ったブラウザパズルゲーム</a></p>
    <p>操作方法（キーボード）</p>
    <pre>       wキー：カーソル上移動</pre>
    <pre>       aキー：カーソル左移動</pre>
    <pre>       sキー：カーソル下移動</pre>
    <pre>       dキー：カーソル右移動</pre>
    <pre>       右キー：カーソル内のブロックを時計回りに回転</pre>
    <pre>       左キー：カーソル内のブロックを反時計回りに回転</pre>
    <p>操作方法（ボタン）</p>
    <pre>       上ボタン：カーソル上移動</pre>
    <pre>       左ボタン：カーソル左移動</pre>
    <pre>       下ボタン：カーソル下移動</pre>
    <pre>       右ボタン：カーソル右移動</pre>
    <pre>       右回りボタン：カーソル内のブロックを時計回りに回転</pre>
    <pre>       左回りボタン：カーソル内のブロックを反時計回りに回転</pre>
    <p>効果音：魔王魂様</p>
    <p>BGM：mozell様</p>
</div>
<script>
    var controller; //サークル型コントローラー
    var board; //ゲームの盤面を2次元配列で記録
    var score; //ゲームのスコア
    var time; //ゲームの制限時間
    var scoreTime; //スコアアップ時のtimeを記録する用
    var mode; //ゲームをスタートしているかどうか 1:ゲーム中 0:ゲーム開始前 -1:ゲームオーバー
    var count; //ゲームスタート時のカウントダウン用

    onload = function () {
        controller = new Controller();
        board = new Board();
        document.getElementById("outputVolume").innerHTML = 100;
        var startSoundEffect = document.getElementById("startSoundEffect");
        startSoundEffect.src = "{{ asset('/music/kurukuru/gamestart.mp3') }}";
        startSoundEffect.load();
        var countDownSoundEffect = document.getElementById("countDownSoundEffect");
        countDownSoundEffect.src = "{{ asset('/music/kurukuru/countdown.mp3') }}";
        countDownSoundEffect.load();
        var overSoundEffect = document.getElementById("overSoundEffect");
        overSoundEffect.src = "{{ asset('/music/kurukuru/gameover.mp3') }}";
        overSoundEffect.load();
        var scoreSoundEffect = document.getElementById("scoreSoundEffect");
        scoreSoundEffect.src = "{{ asset('/music/kurukuru/scoreup.mp3') }}";
        scoreSoundEffect.load();
        var moveSoundEffect = document.getElementById("moveSoundEffect");
        moveSoundEffect.src = "{{ asset('/music/kurukuru/move.mp3') }}";
        moveSoundEffect.load();
        var rotateSoundEffect = document.getElementById("rotateSoundEffect");
        rotateSoundEffect.src = "{{ asset('/music/kurukuru/rotate.mp3') }}";
        rotateSoundEffect.load();
        var BGM = document.getElementById("BGM");
        BGM.src = "{{ asset('/music/kurukuru/mozegaku_09_idance.mp3') }}";
        BGM.load();
        reset();
    };

    const size = 40; //ブロックのサイズ
    const margin = 4; //ブロックのマージン
    const backgroundSize = size * 6 + margin * 12 + 2; //背景のサイズ
    const controllerSize = size * 2 + margin * 4; //コントローラーのサイズ
    const spanSize = 40; //コントローラーの隙間のサイズ

    //音量変更
    function setVolume(value) {
        var startSoundEffect = document.getElementById("startSoundEffect");
        var moveSoundEffect = document.getElementById("moveSoundEffect");
        var rotateSoundEffect = document.getElementById("rotateSoundEffect");
        var scoreSoundEffect = document.getElementById("scoreSoundEffect");
        var countDownSoundEffect = document.getElementById("countDownSoundEffect");
        var overSoundEffect = document.getElementById("overSoundEffect");
        var BGM = document.getElementById("BGM");
        var volume = value / 100;
        startSoundEffect.volume = volume;
        moveSoundEffect.volume = volume;
        rotateSoundEffect.volume = volume;
        scoreSoundEffect.volume = volume;
        countDownSoundEffect.volume = volume;
        overSoundEffect.voleme = volume;
        BGM.volume = volume;
        document.getElementById("outputVolume").innerHTML = value;
    }

    function initScreen() {
        var screen = document.getElementById("screen");
        var ctx = screen.getContext("2d");
        var img = new Image();
        img.src = "{{ asset('/img/kurukuru/gamestart.png') }}";
        img.onload = function () {
            ctx.drawImage(img, 0, 0, backgroundSize, backgroundSize);
        }
    }

    //ゲームの制限時間をはかる
    function countDown() {
        var timer = setInterval(function () {
            time--;
            document.getElementById("time").innerHTML = "time: " + time;
            if (time < 1) {
                clearInterval(timer);
                gameOver();
            }
        }, 1000);
    }

    function gameStart() {
        if (mode == 0) {
            var countDownSoundEffect = document.getElementById("countDownSoundEffect");
            var screen = document.getElementById("screen");
            var ctx = screen.getContext("2d");
            var img = new Image();
            var BGM = document.getElementById("BGM");
            BGM.src = "{{ asset('/music/kurukuru/mozegaku_09_idance.mp3') }}";
            BGM.load();
            var startSoundEffect = document.getElementById("startSoundEffect");
            startSoundEffect.src = "{{ asset('/music/kurukuru/gamestart.mp3') }}";
            startSoundEffect.load();
            BGM.currentTime = 0;
            if (count == 3) {
                countDownSoundEffect.play();
                img.src = "{{ asset('/img/kurukuru/three.png') }}";
                img.onload = function () {
                    ctx.drawImage(img, 0, 0, backgroundSize, backgroundSize);
                    count--;
                    setTimeout("gameStart()", 1000);
                }
            } else if (count == 2) {
                countDownSoundEffect.play();
                img.src = "{{ asset('/img/kurukuru/two.png') }}";
                img.onload = function () {
                    ctx.drawImage(img, 0, 0, backgroundSize, backgroundSize);
                    count--;
                    setTimeout("gameStart()", 1000);
                }
            } else if (count == 1) {
                countDownSoundEffect.play();
                img.src = "{{ asset('/img/kurukuru/one.png') }}";
                img.onload = function () {
                    ctx.drawImage(img, 0, 0, backgroundSize, backgroundSize);
                    count--;
                    setTimeout("gameStart()", 1000);
                }
            } else if (count == 0) {
                if (BGM.readyState === 4) {
                    BGM.play();
                    mode = 1;
                    ctx.clearRect(0, 0, backgroundSize, backgroundSize);
                    countDown();
                    startSoundEffect.play();
                } else {
                    BGM.addEventListener('canplaythrough', function (e) {
                        BGM.removeEventListener('canplaythrough', arguments.callee);
                        BGM.play();
                        mode = 1;
                        ctx.clearRect(0, 0, backgroundSize, backgroundSize);
                        countDown();
                        startSoundEffect.play();
                    });
                }
            }
        } else if (mode == -1) { //ゲームオーバー画面から初期画面への移動]
            var countDownSoundEffect = document.getElementById("countDownSoundEffect");
            countDownSoundEffect.play();
            mode = 0;
            reset();
            initScreen();
        }
    }

    //ゲームオーバー処理
    function gameOver() {
        var BGM = document.getElementById("BGM");
        BGM.pause();
        var overSoundEffect = document.getElementById("overSoundEffect");
        overSoundEffect.play();
        mode = -1;
        var screen = document.getElementById("screen");
        var ctx = screen.getContext("2d");
        var img = new Image();
        img.src = "{{ asset('/img/kurukuru/gameover.png') }}";
        img.onload = function () {
            ctx.drawImage(img, 0, 0, backgroundSize, backgroundSize);
        }
    }

    //初期状態に戻す
    function reset() {
        mode = 0;
        controller.reset();
        board.reset();
        board.paint();
        score = 0;
        document.getElementById("score").innerHTML = "score: " + score;
        time = 100;
        scoreTime = 100;
        count = 3;
        document.getElementById("time").innerHTML = "time: " + time;
        initScreen();
    }

    //スコア加算
    function scoreUp() {
        var scoreSoundEffect = document.getElementById("scoreSoundEffect");
        scoreSoundEffect.play();
        score += (100 - (scoreTime - time)) * 4 + 100; //スコア変動100~500
        scoreTime = time;
        document.getElementById("score").innerHTML = "score: " + score;
    }

    //ボタンからの操作
    function buttonRight() {
        if (mode == 1) {
            controller.moveRight();
        }

    }

    function buttonLeft() {
        if (mode == 1) {
            controller.moveLeft();
        }
    }

    function buttonUp() {
        if (mode == 1) {
            controller.moveUp();
        }
    }

    function buttonDown() {
        if (mode == 1) {
            controller.moveDown();
        }
    }

    function buttonClockwise() {
        if (mode == 1) {
            blockClockwise(controller.x, controller.y);
        }
    }

    function buttonCounterClockwise() {
        if (mode == 1) {
            blockCounterClockwise(controller.x, controller.y);
        }
    }

    document.onkeydown = keydown;

    function keydown(event) {
        if (event.key == " ") {
            gameStart();
            return false; //画面スクロールを無効
        }
        if (mode == 1) {
            if (event.key == "d") {
                controller.moveRight();
            } else if (event.key == "a") {
                controller.moveLeft();
            } else if (event.key == "w") {
                controller.moveUp();
            } else if (event.key == "s") {
                controller.moveDown();
            } else if (event.key == "ArrowRight") {
                blockClockwise(controller.x, controller.y);
            } else if (event.key == "ArrowLeft") {
                blockCounterClockwise(controller.x, controller.y);
            }
        }
    }

    function blockClockwise(controllerX, controllerY) {
        var rotateSoundEffect = document.getElementById("rotateSoundEffect");
        rotateSoundEffect.src =  "{{ asset('/music/kurukuru/rotate.mp3') }}";
        rotateSoundEffect.play();
        board.boardClockwise(controllerX, controllerY);
        board.judge();
        board.paint();
        anime({
            targets: controller.controller,
            rotate: [-90, 0],
            duration: 500,
        });

    }

    function blockCounterClockwise(controllerX, controllerY) {
        var rotateSoundEffect = document.getElementById("rotateSoundEffect");
        rotateSoundEffect.src =  "{{ asset('/music/kurukuru/rotate.mp3') }}";
        rotateSoundEffect.play();
        board.boardCounterClockwise(controllerX, controllerY);
        board.judge();
        board.paint();
        anime({
            targets: controller.controller,
            rotate: [90, 0],
            duration: 500,
        });


    }

    class Board {
        constructor() {
            /* 縦横逆なことに注意 */
            this.array = [
                [1, 2, 3, 4, 5, 1],
                [2, 3, 4, 5, 1, 2],
                [3, 4, 5, 1, 2, 3],
                [4, 5, 1, 2, 3, 4],
                [5, 1, 2, 3, 4, 5],
                [1, 2, 3, 4, 5, 1]
            ];
        }

        //初期状態に戻す
        reset() {
            this.array = [
                [1, 2, 3, 4, 5, 1],
                [2, 3, 4, 5, 1, 2],
                [3, 4, 5, 1, 2, 3],
                [4, 5, 1, 2, 3, 4],
                [5, 1, 2, 3, 4, 5],
                [1, 2, 3, 4, 5, 1]
            ];
            this.paint();
        }

        //ブロックが4つそろっているか判定
        judge() {
            var i, j;
            for (i = 0; i < 5; i++) {
                for (j = 0; j < 5; j++) {
                    if (this.array[i][j] == this.array[i][j + 1] && this.array[i][j] == this.array[i + 1][j] &&
                        this.array[i][j] == this.array[i + 1][j + 1]) {
                        this.array[i][j] = 0;
                        this.array[i][j + 1] = 0;
                        this.array[i + 1][j] = 0;
                        this.array[i + 1][j + 1] = 0;
                        scoreUp();
                    }
                }
            }

        }

        //盤面を画面に反映
        paint() {
            for (var i = 0; i < 6; i++) {
                for (var j = 0; j < 6; j++) {
                    var block = document.getElementById("b-" + (6 * i + j));
                    if (this.array[i][j] == 1) {
                        fillRed(block);
                    } else if (this.array[i][j] == 2) {
                        fillBlue(block);
                    } else if (this.array[i][j] == 3) {
                        fillGreen(block);
                    } else if (this.array[i][j] == 4) {
                        fillYellow(block);
                    } else if (this.array[i][j] == 5) {
                        fillPurple(block);
                    } else if (this.array[i][j] == 0) {
                        fillReset(i, j);
                    }
                }
            }
        }

        boardClockwise(controllerX, controllerY) {
            var temp = this.array[controllerX][controllerY];
            this.array[controllerX][controllerY] = this.array[controllerX][controllerY + 1];
            this.array[controllerX][controllerY + 1] = this.array[controllerX + 1][controllerY + 1];
            this.array[controllerX + 1][controllerY + 1] = this.array[controllerX + 1][controllerY];
            this.array[controllerX + 1][controllerY] = temp;
        }

        boardCounterClockwise(controllerX, controllerY) {
            var temp = this.array[controllerX][controllerY];
            this.array[controllerX][controllerY] = this.array[controllerX + 1][controllerY];
            this.array[controllerX + 1][controllerY] = this.array[controllerX + 1][controllerY + 1];
            this.array[controllerX + 1][controllerY + 1] = this.array[controllerX][controllerY + 1];
            this.array[controllerX][controllerY + 1] = temp;
        }
    }
    class Controller {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.controller = document.getElementById('controller');
            this.ctx = this.controller.getContext('2d');
            this.position();
        }

        //初期状態に戻す
        reset() {
            this.x = 0;
            this.y = 0;
            this.controller.style.left = this.x * (size + margin * 2) + "px";
            this.controller.style.top = this.y * (size + margin * 2) + "px";
            this.position();
        }

        position() {
            this.ctx.beginPath();
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(1, 1, controllerSize - 2, controllerSize - 2);
            this.ctx.clearRect(controllerSize / 2 - spanSize / 2, 0, spanSize, controllerSize);
            this.ctx.clearRect(0, controllerSize / 2 - spanSize / 2, controllerSize, spanSize);
        }

        moveRight() {
            if (this.x < 4) {
                this.x = this.x + 1;
                this.controller.style.left = this.x * (size + margin * 2) + "px";
                var moveSoundEffect = document.getElementById("moveSoundEffect");
                moveSoundEffect.src =  "{{ asset('/music/kurukuru/move.mp3') }}";
                moveSoundEffect.play();
            }
        }

        moveLeft() {
            if (this.x > 0) {
                this.x = this.x - 1;
                this.controller.style.left = this.x * (size + margin * 2) + "px";
                var moveSoundEffect = document.getElementById("moveSoundEffect");
                moveSoundEffect.src = "{{ asset('/music/kurukuru/move.mp3') }}";
                moveSoundEffect.play();
            }
        }

        moveUp() {
            if (this.y > 0) {
                this.y = this.y - 1;
                this.controller.style.top = this.y * (size + margin * 2) + "px";
                var moveSoundEffect = document.getElementById("moveSoundEffect");
                moveSoundEffect.src = "{{ asset('/music/kurukuru/move.mp3') }}";
                moveSoundEffect.play();
            }
        }

        moveDown() {
            if (this.y < 4) {
                this.y = this.y + 1;
                this.controller.style.top = this.y * (size + margin * 2) + "px";
                var moveSoundEffect = document.getElementById("moveSoundEffect");
                moveSoundEffect.src = "{{ asset('/music/kurukuru/move.mp3') }}";
                moveSoundEffect.play();
            }
        }
    }

    //色を四方とかぶらないようにセット
    function fillReset(i, j) {
        var block = document.getElementById("b-" + (6 * i + j));
        var colorList = [1, 2, 3, 4, 5]; //この中から色を選ぶ
        //四方との重複を削除
        if (i == 0) {
            colorList = colorList.filter(n => n !== board.array[i + 1][j]);
        } else if (i == 5) {
            colorList = colorList.filter(n => n !== board.array[i - 1][j]);
        } else {
            colorList = colorList.filter(n => n !== board.array[i + 1][j]);
            colorList = colorList.filter(n => n !== board.array[i - 1][j]);
        }
        if (j == 0) {
            colorList = colorList.filter(n => n !== board.array[i][j + 1]);
        } else if (j == 5) {
            colorList = colorList.filter(n => n !== board.array[i][j - 1]);
        } else {
            colorList = colorList.filter(n => n !== board.array[i][j + 1]);
            colorList = colorList.filter(n => n !== board.array[i][j - 1]);
        }
        //リストからランダムで選ぶ
        var color = colorList[Math.floor(Math.random() * colorList.length)];
        board.array[i][j] = color;
        if (color == 1) {
            fillRed(block);
        } else if (color == 2) {
            fillBlue(block);
        } else if (color == 3) {
            fillGreen(block);
        } else if (color == 4) {
            fillYellow(block);
        } else if (color == 5) {
            fillPurple(block);
        }
        anime({
            targets: block,
            scale: [0, 1],
            duration: 1000,
        });
    }

    function fillRed(block) {
        if (!block || !block.getContext) {
            return false;
        }
        var ctx = block.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, size, size);
    }

    function fillBlue(block) {
        if (!block || !block.getContext) {
            return false;
        }
        var ctx = block.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, size, size);
    }

    function fillGreen(block) {
        if (!block || !block.getContext) {
            return false;
        }
        var ctx = block.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, size, size);
    }

    function fillYellow(block) {
        if (!block || !block.getContext) {
            return false;
        }
        var ctx = block.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = 'yellow';
        ctx.fillRect(0, 0, size, size);
    }

    function fillPurple(block) {
        if (!block || !block.getContext) {
            return false;
        }
        var ctx = block.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = 'purple';
        ctx.fillRect(0, 0, size, size);
    }
</script>
@endsection
