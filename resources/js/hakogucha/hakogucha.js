import anime from 'animejs'
import { Howl, Howler } from 'howler';

var board;
var player;
var score; //ゲームのスコア
var time; //ゲームの制限時間
var combo; //コンボ数
var comboTimeID; //コンボリセット用のID
var mode; //ゲームをスタートしているかどうか 3: ブロック消滅時の硬直 2:行動後の硬直 1:ゲーム中 0:ゲーム開始前 -1:ゲームオーバー
const size = 40; //ブロックのサイズ
const backgroundSize = size * 10;
var pushSoundEffect;
var moveSoundEffect;
var deleteSoundEffect;
var punchSoundEffect;
var startSoundEffect;
var overSoundEffect;
var BGM;

onload = function () {
    board = new Board();
    player = new Player();
    reset();
    pushSoundEffect = new Howl({
        src: [location.origin + "/music/hakogucha/push.mp3"]
    });
    moveSoundEffect = new Howl({
        src: [location.origin + "/music/hakogucha/move.mp3"]
    });
    deleteSoundEffect = new Howl({
        src: [location.origin + "/music/hakogucha/delete.mp3"]
    });
    punchSoundEffect = new Howl({
        src: [location.origin + "/music/hakogucha/punch.mp3"]
    });
    startSoundEffect = new Howl({
        src: [location.origin + "/music/hakogucha/gamestart.mp3"]
    });
    overSoundEffect = new Howl({
        src: [location.origin + "/music/hakogucha/gameover.mp3"]
    });
    BGM = new Howl({
        src: [location.origin + "/music/hakogucha/bgm.mp3"],
        loop: true
    });
    document.getElementById("outputVolume").innerHTML = 100;
};

document.onkeydown = keydown;

function keydown(event) {
    if (event.key == " ") {
        gameStart();
        return false; //画面スクロールを無効
    }
    if (mode == 1) {
        if (event.key == "d") {
            player.moveRight();
        } else if (event.key == "a") {
            player.moveLeft();
        } else if (event.key == "w") {
            player.moveUp();
        } else if (event.key == "s") {
            player.moveDown();
        } else if (event.key == "Enter") {
            player.punch();
        }
    }
}

//ボタンからの操作
window.buttonRight = function () {
    if (mode == 1) {
        player.moveRight();
    }

}

window.buttonLeft = function () {
    if (mode == 1) {
        player.moveLeft();
    }
}

window.buttonUp = function () {
    if (mode == 1) {
        player.moveUp();
    }
}

window.buttonDown = function () {
    if (mode == 1) {
        player.moveDown();
    }
}

window.buttonPunch = function () {
    if (mode == 1) {
        player.punch();
    }
}

function initScreen() {
    var screen = document.getElementById("screen");
    var ctx = screen.getContext("2d");
    var img = new Image();
    img.src = location.origin + "/img/hakogucha/hakogucha.png";
    img.onload = function () {
        ctx.drawImage(img, 0, 0, backgroundSize, backgroundSize);
    }
}

window.gameStart = function () {
    if (mode == 0) {
        var screen = document.getElementById("screen");
        var ctx = screen.getContext("2d");
        ctx.clearRect(0, 0, backgroundSize, backgroundSize);
        ctx.fillStyle = "red";
        ctx.font = "30px 'ＭＳ Ｐゴシック'";
        ctx.fillText("Ready...", 120, 160);
        setTimeout(Go, 1000);
    } else if (mode == -1) { //ゲームオーバー画面から初期画面への移動
        mode = 0;
        reset();
        initScreen();
    }
}

function Go() {
    var screen = document.getElementById("screen");
    var ctx = screen.getContext("2d");
    ctx.clearRect(0, 0, backgroundSize, backgroundSize);
    ctx.fillStyle = "red";
    ctx.font = "30px 'ＭＳ Ｐゴシック'";
    ctx.fillText("Go!!", 120, 160);
    mode = 1;
    board.random_generate(0);
    startSoundEffect.play();
    countDown();
    setTimeout(function () {
        var screen = document.getElementById("screen");
        var ctx = screen.getContext("2d");
        ctx.clearRect(0, 0, backgroundSize, backgroundSize);
        BGM.play();
    }, 500);
}

//ゲームオーバー処理
function gameOver() {
    mode = -1;
    var screen = document.getElementById("screen");
    var ctx = screen.getContext("2d");
    ctx.fillStyle = "red";
    ctx.font = "30px 'ＭＳ Ｐゴシック'";
    ctx.fillText("そこまで！", 120, 160);
    overSoundEffect.play();
    BGM.stop();
    anime({
        targets: player.player,
        translateY: [0, 20],
        scaleY: [1, 0],
        duration: 400,
    });
}

//初期状態に戻す
function reset() {
    mode = 0;
    score = 0;
    document.getElementById("score").innerHTML = "score: " + score;
    time = 60;
    document.getElementById("time").innerHTML = "time: " + time;
    combo = 0;
    board.reset();
    player.reset();
    anime.set(player.player, {
        translateY: 0,
        scaleY: 1,
    });
    ladderSet();
    initScreen();
}

//ゲームの制限時間をはかる
function countDown() {
    time--;
    document.getElementById("time").innerHTML = "time: " + time;
    if (time > -1 && mode != -1) {
        setTimeout(countDown, 1000);
    } else {
        gameOver();
    }
}

//スコア加算
function scoreUp(num) {
    if (combo != 0 && comboTimeID !== null) {
        clearTimeout(comboTimeID);
    }
    score += 100 * num * (2 ** combo);
    combo++;
    document.getElementById("combo").innerHTML = combo + " combo"
    comboTimeID = setTimeout(function () {
        combo = 0;
        document.getElementById("combo").innerHTML = combo + " combo"
    }, 2000);
    document.getElementById("score").innerHTML = "score: " + score;
}

//音量変更
window.setVolume = function (value) {
    var volume = value / 100;
    Howler.volume(volume);
    document.getElementById("outputVolume").innerHTML = value;
}

function ladderSet() {
    for (var i = 0; i < 10; i++) {
        for (var j = 2; j < 9; j++) {
            var ladder = document.getElementById("l-" + (9 * i + j));
            var ctx = ladder.getContext('2d');
            ctx.beginPath();
            ctx.linewidth = 3;
            ctx.strokeStyle = "#8B4513";
            ctx.strokeRect(10, 2, 20, 7);
            ctx.strokeRect(10, 2, 20, 14);
            ctx.strokeRect(10, 2, 20, 21);
            ctx.strokeRect(10, 2, 20, 28);
            ctx.strokeRect(10, 2, 20, 35);
            ctx.strokeRect(10, 2, 20, 40);
        }
    }
}

class Board {
    constructor() {
        /* 縦横逆なことに注意 */
        this.array = [
            [0, 0, 0, 0, 0, 0, 0, 10, 40],
            [0, 0, 0, 0, 0, 0, 0, 20, 30],
            [0, 0, 0, 0, 0, 0, 0, 40, 10],
            [0, 0, 0, 0, 0, 0, 0, 30, 20],
            [0, 0, 0, 0, 0, 0, 0, 10, 40],
            [0, 0, 0, 0, 0, 0, 0, 20, 30],
            [0, 0, 0, 0, 0, 0, 0, 40, 10],
            [0, 0, 0, 0, 0, 0, 0, 30, 20],
            [0, 0, 0, 0, 0, 0, 0, 10, 40],
            [0, 0, 0, 0, 0, 0, 0, 20, 30]
        ];
        this.blockInterval = 70;
    }

    //初期状態に戻す
    reset() {
        this.array = [
            [0, 0, 0, 0, 0, 0, 0, 10, 40],
            [0, 0, 0, 0, 0, 0, 0, 20, 30],
            [0, 0, 0, 0, 0, 0, 0, 40, 10],
            [0, 0, 0, 0, 0, 0, 0, 30, 20],
            [0, 0, 0, 0, 0, 0, 0, 10, 40],
            [0, 0, 0, 0, 0, 0, 0, 20, 30],
            [0, 0, 0, 0, 0, 0, 0, 40, 10],
            [0, 0, 0, 0, 0, 0, 0, 30, 20],
            [0, 0, 0, 0, 0, 0, 0, 10, 40],
            [0, 0, 0, 0, 0, 0, 0, 20, 30]
        ];
        this.paint();
    }

    //空中にあるブロックを集める
    collectAir() {
        var airList = [];
        var count = 0;
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 8; j++) {
                if (this.array[i][j] != 0) {
                    for (var height = j + 1; height < 9; height++) {
                        if (this.array[i][height] == 0) {
                            count++;
                        }
                    }
                    if (count > 0) {
                        airList.push([i, j]);
                    }
                    count = 0;
                }
            }
        }
        return airList;
    }

    //ランダムにブロックを生成
    random_generate(exceptI) {
        var colorList = [11, 21, 31, 41];
        var iList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        if (exceptI != -1) {
            iList.splice(exceptI, 1);
        }
        var color = colorList[Math.floor(Math.random() * colorList.length)];
        var i = iList[Math.floor(Math.random() * iList.length)];
        board.generate(color, i);
    }

    //ブロックを生成
    generate(color, i) {
        if (mode != 3 && mode != -1) {
            var block = document.getElementById("b-" + (9 * i));
            this.array[i][0] = color;
            this.paint();
            anime({
                targets: block,
                translateX: [-10, 10],
                direction: 'alternate',
                loop: 2,
                duration: 300,
                easing: 'easeInOutSine',
                complete: function (anim) {
                    anime.set(this.animatables[0].target, {
                        translateX: 0
                    });
                    board.air([
                        [i, 0]
                    ]);
                    setTimeout(function () {
                        board.random_generate(i);
                    }, board.blockInterval);
                }
            });
        } else if (mode == 3) {
            setTimeout(function () {
                board.random_generate(i);
            }, board.blockInterval);
        }
    }

    //ブロックが空中にあるか判定して落下処理
    air(airList) {
        var tempList = [];
        var nextList = [];
        var countList = [];
        var i;
        var j;
        for (var pair of airList) {
            i = pair[0];
            j = pair[1];
            if (j < 8 && board.array[i][j] != 0) {
                var count = 0;
                for (var height = 8; height > j; height--) {
                    if (board.array[i][height] == 0) {
                        count++;
                    }
                }
                countList.push(count);
                if (count == 0) {
                    if (j < 2) {
                        gameOver();
                    } else {
                        this.judge(i, j);
                    }
                } else {
                    var block = document.getElementById("b-" + (9 * i + j));
                    var temp = this.array[i][j];
                    var next;
                    if (j == 0) {
                        next = 0;
                    } else {
                        next = this.array[i][j - 1];
                    }
                    tempList.push(temp);
                    nextList.push(next);
                }
            } else {
                tempList.push(0);
                nextList.push(0);
                countList.push(0);
            }
        }
        var flg = 0;
        for (var pair of airList) {
            i = pair[0];
            j = pair[1];
            if (j != 8 && board.array[i][j] != 0 && countList[airList.indexOf(pair)] != 0) {
                var block = document.getElementById("b-" + (9 * i + j));
                board.array[i][j + 1] = tempList[airList.indexOf(pair)];
                board.array[i][j] = nextList[airList.indexOf(pair)];
                anime({
                    targets: block,
                    translateY: [0, 40],
                    duration: 200,
                    complete: function (anim) {
                        anime.set(this.animatables[0].target, {
                            translateY: 0
                        });
                        var num = Number(this.animatables[0].target.id.slice(2));
                        var blockP = [Math.floor(num / 9), Math.floor(num) % 9];
                        if (blockP[0] == player.x && blockP[1] + 1 == player.y) {
                            gameOver();
                        }
                        if (flg == 0 && blockP.toString() == airList[0].toString() && mode != -1) {
                            flg = 1;
                            var newAirList = [];
                            for (var x of airList) {
                                newAirList.push([x[0], x[1] + 1]);
                            }
                            board.paint();
                            board.air(newAirList);
                        }
                        if (flg == 0 && blockP.toString() == airList[airList.length - 1]
                            .toString() &&
                            mode != -1) {
                            flg = 1;
                            var newAirList = [];
                            for (var x of airList) {
                                newAirList.push([x[0], x[1] + 1]);
                            }
                            board.paint();
                            board.air(newAirList);
                        }
                    }
                });
            } else if (j == 8) {
                this.judge(i, j);
            }
        }
    }


    judge(i, j) {
        var color = Math.floor(this.array[i][j] / 10);
        var deleteList = [];
        deleteList.push([i, j]);
        this.collect(i, j, -1, -1, color, deleteList);
        if (deleteList.length > 2 && mode != -1) {
            board.delete(deleteList, 0);
        }
    }

    collect(i, j, previousI, previousJ, color, deleteList) {
        if (i < 9 && Math.floor(this.array[i + 1][j] / 10) == color && i + 1 != previousI && deleteList.length < 70) { //苦肉の策
            deleteList.push([i + 1, j]);
            this.collect(i + 1, j, i, j, color, deleteList);
        }
        if (i > 0 && Math.floor(this.array[i - 1][j] / 10) == color && i - 1 != previousI && deleteList.length < 70) {
            deleteList.push([i - 1, j]);
            this.collect(i - 1, j, i, j, color, deleteList);
        }
        if (j < 8 && Math.floor(this.array[i][j + 1] / 10) == color && j + 1 != previousJ && deleteList.length < 70) {
            deleteList.push([i, j + 1]);
            this.collect(i, j + 1, i, j, color, deleteList);
        }
        if (j > 0 && Math.floor(this.array[i][j - 1] / 10) == color && j - 1 != previousJ && deleteList.length < 70) {
            deleteList.push([i, j - 1]);
            this.collect(i, j - 1, i, j, color, deleteList);
        }
    }

    delete(deleteList, airFlg) { //airFlgは空中のブロックを消したかどうか
        if (airFlg == 0) {
            scoreUp(deleteList.length);
        }
        var alreadyIList = [];
        var processList = [];
        for (var pair of deleteList) {
            if (!alreadyIList.includes(pair[0])) {
                alreadyIList.push(pair[0]);
                processList.push(pair.toString());
            }
        }
        var allAirList = [];
        for (var pair of deleteList) {
            for (var y = pair[1] - 1; y > -1; y--) {
                if (board.array[pair[0]][y] == 0) {
                    break;
                }
                allAirList.push([pair[0], y]);
            }
        }
        if (airFlg == 0) {
            deleteSoundEffect.play();
            var airDeleteList = board.collectAir().filter(function (element) {
                var count = 0;
                for (var e of allAirList) {
                    if (e.toString() == element.toString()) {
                        count++;
                    }
                }
                if (count == 0) {
                    return element;
                }
            });
            board.delete(airDeleteList, 1);
        }
        for (var pair of deleteList) {
            var i = pair[0];
            var j = pair[1];
            var block = document.getElementById("b-" + (9 * i + j));
            board.array[i][j] = 0;
            anime({
                targets: block,
                background: ['rgba(0, 0, 0, 1)', 'rgba(255, 255, 0, 1)'],
                duration: 500,
                begin: function (anim) {
                    if (mode != -1) {
                        mode = 3;
                    }
                    this.animatables[0].target.getContext('2d').clearRect(0, 0, size, size);
                },
                complete: function (anim) {
                    var blockI = Math.floor(Number(this.animatables[0].target.id.slice(2)) / 9);
                    var blockJ = Number(this.animatables[0].target.id.slice(2)) % 9;
                    if (mode != -1) {
                        mode = 1;
                    }
                    board.paint();
                    if (processList.includes([blockI, blockJ].toString())) {
                        var airList = [];
                        for (var y = blockJ - 1; y > -1; y--) {
                            if (board.array[blockI][y] == 0) {
                                break;
                            }
                            airList.push([blockI, y]);
                        }
                        board.air(airList);
                    }
                    anime.set(this.animatables[0].target, {
                        background: 'rgba(0, 0, 0, 0)'
                    });
                }
            });
        }
    }

    //盤面を画面に反映
    paint() {
        for (var i = 0; i < 10; i++) {
            for (var j = 0; j < 9; j++) {
                var block = document.getElementById("b-" + (9 * i + j));
                if (Math.floor(this.array[i][j] / 10) == 1) {
                    fillRed(block);
                } else if (Math.floor(this.array[i][j] / 10) == 2) {
                    fillBlue(block);
                } else if (Math.floor(this.array[i][j] / 10) == 3) {
                    fillGreen(block);
                } else if (Math.floor(this.array[i][j] / 10) == 4) {
                    fillGray(block);
                } else if (this.array[i][j] == 0) {
                    fillClear(block);
                }
                if (this.array[i][j] != 0 && this.array[i][j] % 10 == 0) {
                    strokeCross(block);
                }
                if (this.array[i][j] == 42) {
                    strokeCrack1(block);
                }
                if (this.array[i][j] == 43) {
                    strokeCrack2(block);
                }
            }
        }
    }

}

class Player {
    constructor() {
        this.x = 0;
        this.y = 2;
        this.punchDuration = 400; //移動不能時間
        this.moveDuration = 100;
        this.pushDuration = 300;
        this.state = 0; //向いている方向 0:右 1:左 2:下
        this.player = document.getElementById('player');
        this.position();
    }

    reset() {
        this.x = 0;
        this.y = 2;
        this.player.style.left = this.x * size + "px";
        this.player.style.top = this.y * size + "px";
        this.position();
    }

    position() {
        this.player.src = location.origin + "/img/hakogucha/rightwalk.png";
    }

    moveRight() {
        if (this.x < 9 && board.array[this.x + 1][this.y] == 0) {
            this.x = this.x + 1;
            this.player.style.left = this.x * size + "px";
            this.player.src = location.origin + "/img/hakogucha/rightwalk.png";
            moveSoundEffect.play();
            this.moveStop()
        } else if (this.x < 8 && board.array[this.x + 1][this.y] != 0 && board.array[this.x + 2][this.y] == 0) {
            var block = document.getElementById("b-" + ((this.x + 1) * 9 + this.y));
            board.array[this.x + 2][this.y] = board.array[this.x + 1][this.y];
            board.array[this.x + 1][this.y] = 0;
            pushSoundEffect.play();
            anime({
                targets: block,
                translateX: [0, 40],
                duration: player.pushDuration,
                begin: function (anim) {
                    if (mode != -1) {
                        mode = 2;
                    }
                    player.player.src = location.origin + "/img/hakogucha/rightpush.png";
                },
                complete: function (anim) {
                    if (mode != -1) {
                        mode = 1;
                    }
                    var blockI = Math.floor(Number(this.animatables[0].target.id.slice(2)) / 9);
                    var blockJ = Number(this.animatables[0].target.id.slice(2)) % 9;
                    player.player.src = location.origin + "/img/hakogucha/rightwalk.png";
                    anime.set(this.animatables[0].target, {
                        translateX: 0
                    });
                    board.paint();
                    board.air([
                        [blockI + 1, blockJ]
                    ]);
                    var airList = [];
                    for (var y = 0; y < blockJ; y++) {
                        airList.push([blockI, y]);
                    }
                    board.air(airList);
                }
            });
        }
        this.state = 0;
    }

    moveLeft() {
        if (this.x > 0 && board.array[this.x - 1][this.y] == 0) {
            this.x = this.x - 1;
            this.player.style.left = this.x * size + "px";
            this.player.src = location.origin + "/img/hakogucha/leftwalk.png";
            moveSoundEffect.play();
            this.moveStop()
        } else if (this.x > 1 && board.array[this.x - 1][this.y] != 0 && board.array[this.x - 2][this.y] == 0) {
            var block = document.getElementById("b-" + ((this.x - 1) * 9 + this.y));
            board.array[this.x - 2][this.y] = board.array[this.x - 1][this.y];
            board.array[this.x - 1][this.y] = 0;
            pushSoundEffect.play();
            anime({
                targets: block,
                translateX: [0, -40],
                duration: player.pushDuration,
                begin: function (anim) {
                    if (mode != -1) {
                        mode = 2;
                    }
                    player.player.src = location.origin + "/img/hakogucha/leftpush.png";
                },
                complete: function (anim) {
                    if (mode != -1) {
                        mode = 1;
                    }
                    var blockI = Math.floor(Number(this.animatables[0].target.id.slice(2)) / 9);
                    var blockJ = Number(this.animatables[0].target.id.slice(2)) % 9;
                    player.player.src = location.origin + "/img/hakogucha/leftwalk.png";
                    anime.set(this.animatables[0].target, {
                        translateX: 0
                    });
                    board.paint();
                    board.air([
                        [blockI - 1, blockJ]
                    ]);
                    var airList = [];
                    for (var y = 0; y < blockJ; y++) {
                        airList.push([blockI, y]);
                    }
                    board.air(airList);
                }
            });
        }
        this.state = 1;
    }

    moveUp() {
        if (this.y > 2 && board.array[this.x][this.y - 1] == 0) {
            this.y = this.y - 1;
            this.player.style.top = this.y * size + "px";
            this.moveStop()
        }
        this.state = 2;
        this.player.src = location.origin + "/img/hakogucha/ladder.png";
        moveSoundEffect.play();
    }

    moveDown() {
        if (this.y < 8 && board.array[this.x][this.y + 1] == 0) {
            this.y = this.y + 1;
            this.player.style.top = this.y * size + "px";
            this.moveStop()
        }
        this.state = 2;
        this.player.src = location.origin + "/img/hakogucha/ladder.png";
        moveSoundEffect.play();
    }

    moveStop() { //移動時の硬直
        if (mode != -1) {
            mode = 2;
        }
        setTimeout(function () {
            if (mode != -1) {
                mode = 1;
            }
        }, this.moveDuration);
    }

    punch() {
        if (this.x < 9 && this.state == 0 && board.array[this.x + 1][this.y] % 10 != 0) {
            var block = document.getElementById("b-" + ((this.x + 1) * 9 + this.y));
            var ctx = block.getContext('2d');
            if (Math.floor(board.array[this.x + 1][this.y] / 10) == 4 && board.array[this.x + 1][this.y] !=
                43) {
                board.array[this.x + 1][this.y]++;
                punchSoundEffect.play();
                anime({
                    targets: block,
                    duration: player.punchDuration,
                    begin: function (anim) {
                        if (mode != -1) {
                            mode = 2;
                        }
                        player.player.src = location.origin + "/img/hakogucha/rightpush.png";
                    },
                    complete: function (anim) {
                        if (mode != -1) {
                            mode = 1;
                        }
                        player.player.src = location.origin + "/img/hakogucha/rightwalk.png";
                        board.paint();
                    }
                });
            } else {
                board.array[this.x + 1][this.y] = 0;
                score++;
                document.getElementById("score").innerHTML = "score: " + score;
                punchSoundEffect.play();
                anime({
                    targets: block,
                    scale: [1, 5],
                    rotate: [0, 90],
                    duration: player.punchDuration,
                    begin: function (anim) {
                        if (mode != -1) {
                            mode = 2;
                        }
                        player.player.src = location.origin + "/img/hakogucha/rightpush.png";
                        ctx.clearRect(5, 0, size - 10, size);
                        ctx.clearRect(0, 5, size, size - 10);
                    },
                    complete: function (anim) {
                        if (mode != -1) {
                            mode = 1;
                        }
                        var blockI = Math.floor(Number(this.animatables[0].target.id.slice(2)) / 9);
                        var blockJ = Number(this.animatables[0].target.id.slice(2)) % 9;
                        player.player.src = location.origin + "/img/hakogucha/rightwalk.png";
                        anime.set(this.animatables[0].target, {
                            scale: 1,
                            rotate: 0,
                        });
                        board.paint();
                        var airList = [];
                        for (var y = 0; y < blockJ; y++) {
                            airList.push([blockI, y]);
                        }
                        board.air(airList);
                    }
                });
            }

        } else if (this.x > 0 && this.state == 1 && board.array[this.x - 1][this.y] % 10 != 0) {
            var block = document.getElementById("b-" + ((this.x - 1) * 9 + this.y));
            var ctx = block.getContext('2d');
            if ((Math.floor(board.array[this.x - 1][this.y] / 10) == 4 && board.array[this.x - 1][this.y] !=
                43)) {
                board.array[this.x - 1][this.y]++;
                punchSoundEffect.play();
                anime({
                    targets: block,
                    duration: player.punchDuration,
                    begin: function (anim) {
                        if (mode != -1) {
                            mode = 2;
                        }
                        player.player.src = location.origin + "/img/hakogucha/leftpush.png";
                    },
                    complete: function (anim) {
                        if (mode != -1) {
                            mode = 1;
                        }
                        player.player.src = location.origin + "/img/hakogucha/leftwalk.png";
                        board.paint();
                    }
                });
            } else {
                board.array[this.x - 1][this.y] = 0;
                score++;
                document.getElementById("score").innerHTML = "score: " + score;
                punchSoundEffect.play();
                anime({
                    targets: block,
                    scale: [1, 5],
                    rotate: [0, 90],
                    duration: player.punchDuration,
                    begin: function (anim) {
                        if (mode != -1) {
                            mode = 2;
                        }
                        player.player.src = location.origin + "/img/hakogucha/leftpush.png";
                        ctx.clearRect(5, 0, size - 10, size);
                        ctx.clearRect(0, 5, size, size - 10);
                    },
                    complete: function (anim) {
                        if (mode != -1) {
                            mode = 1;
                        }
                        var blockI = Math.floor(Number(this.animatables[0].target.id.slice(2)) / 9);
                        var blockJ = Number(this.animatables[0].target.id.slice(2)) % 9;
                        player.player.src = location.origin + "/img/hakogucha/leftwalk.png";
                        anime.set(this.animatables[0].target, {
                            scale: 1,
                            rotate: 0,
                        });
                        board.paint();
                        var airList = [];
                        for (var y = 0; y < blockJ; y++) {
                            airList.push([blockI, y]);
                        }
                        board.air(airList);
                    }
                });
            }
        } else if (this.y < 8 && this.state == 2 && board.array[this.x][this.y + 1] % 10 != 0) {
            var block = document.getElementById("b-" + (this.x * 9 + this.y + 1));
            var ctx = block.getContext('2d');
            if ((Math.floor(board.array[this.x][this.y + 1] / 10) == 4 && board.array[this.x][this.y + 1] !=
                43)) {
                board.array[this.x][this.y + 1]++;
                punchSoundEffect.play();
                anime({
                    targets: block,
                    duration: player.punchDuration,
                    begin: function (anim) {
                        if (mode != -1) {
                            mode = 2;
                        }
                        player.player.src = location.origin + "/img/hakogucha/punch2.png";
                    },
                    complete: function (anim) {
                        if (mode != -1) {
                            mode = 1;
                        }
                        player.player.src = location.origin + "/img/hakogucha/ladder.png";
                        board.paint();
                    }
                });
            } else {
                board.array[this.x][this.y + 1] = 0;
                score++;
                document.getElementById("score").innerHTML = "score: " + score;
                punchSoundEffect.play();
                anime({
                    targets: block,
                    scale: [1, 5],
                    rotate: [0, 90],
                    duration: player.punchDuration,
                    begin: function (anim) {
                        if (mode != -1) {
                            mode = 2;
                        }
                        player.player.src = location.origin + "/img/hakogucha/punch2.png";
                        ctx.clearRect(5, 0, size - 10, size);
                        ctx.clearRect(0, 5, size, size - 10);
                    },
                    complete: function (anim) {
                        if (mode != -1) {
                            mode = 1;
                        }
                        player.player.src = location.origin + "/img/hakogucha/ladder.png";
                        anime.set(this.animatables[0].target, {
                            scale: 1,
                            rotate: 0,
                        });
                        board.paint();
                    }
                });
            }
        }
    }
}

function strokeCross(block) {
    var ctx = block.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(10, 5);
    ctx.lineTo(5, 10);
    ctx.lineTo(15, 20);
    ctx.lineTo(5, 30);
    ctx.lineTo(10, 35);
    ctx.lineTo(20, 25);
    ctx.lineTo(30, 35);
    ctx.lineTo(35, 30);
    ctx.lineTo(25, 20);
    ctx.lineTo(35, 10);
    ctx.lineTo(30, 5);
    ctx.lineTo(20, 15);
    ctx.fillStyle = 'black';
    ctx.fill();
}

function strokeCrack1(block) {
    var ctx = block.getContext('2d');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(10, 5);
    ctx.lineTo(15, 10);
    ctx.lineTo(0, 20);
    ctx.stroke();
}

function strokeCrack2(block) {
    var ctx = block.getContext('2d');
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(10, 5);
    ctx.lineTo(15, 10);
    ctx.lineTo(0, 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(40, 20);
    ctx.lineTo(30, 25);
    ctx.lineTo(35, 30);
    ctx.lineTo(20, 40);
    ctx.stroke();
}

function fillClear(block) {
    if (!block || !block.getContext) {
        return false;
    }
    var ctx = block.getContext('2d');
    ctx.clearRect(0, 0, size, size);
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

function fillGray(block) {
    if (!block || !block.getContext) {
        return false;
    }
    var ctx = block.getContext('2d');
    ctx.beginPath();
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, size, size);
}
