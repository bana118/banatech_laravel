import UIkit from 'uikit';
import * as tf from '@tensorflow/tfjs';

var can;
var ct;
var ox = 0,
    oy = 0,
    x = 0,
    y = 0;
var mf = false;
var sub = false; //提出状態かどうか
var correctCount = 0; //正解した数
var wrongCount = 0; //間違えた数
var time = 100; //制限時間
var gameState = -1; //ゲームの状態。-1:ロード中:0:スタート待ち、1:ゲーム中、2:ゲームオーバー
var canW, canH;
var gameStartSE, correctSE, wrongSE, bgm; //BGM,SE
var write1Img, write2Img, correctImg, wrongImg;
var writeImgState = 1; //書いている画像のどっちを出すか
onload = function () {
    write1Img = document.getElementById("write1");
    write2Img = document.getElementById("write2");
    correctImg = document.getElementById("correct");
    wrongImg = document.getElementById("wrong");
    can = document.getElementById("can");
    var wrapCanWidth = document.getElementById("wrap-can").clientWidth;
    if (wrapCanWidth*2 + 200 > window.innerHeight) { // 200は適当
        canH = window.innerHeight - 200;
        canW = canH / 2;
    } else {
        canW = wrapCanWidth;
        canH = canW * 2;
    }
    can.width = canW;
    can.height = canH;
    can.style.width = `${canW}px`;
    can.style.height = `${canH}px`;
    var testTensor = tf.fill([1, 32, 32, 3], 0);
    preloadModel();
    async function preloadModel() {
        const model = await tf.loadLayersModel(location.origin + "/other/reiwa/model/model.json");
        const pre = model.predict(testTensor, {
            batchSize: 1
        });
    }
    mam_draw_init();
    music_init();
}

function music_init() {
    ct.font = canW / 9 + "px 'ＭＳ Ｐゴシック'";
    ct.fillStyle = "blue";
    ct.fillText("ロード中...", 0, canH / 2);
    var manifest = [{
        src: location.origin + "/music/reiwa/gamestart.mp3"
    },
    {
        src: location.origin + "/music/reiwa/ariori.mp3"
    },
    {
        src: location.origin + "/music/reiwa/correct.mp3"
    },
    {
        src: location.origin + "/music/reiwa/wrong.mp3"
    }
    ];
    var loadQueue = new createjs.LoadQueue();
    loadQueue.installPlugin(createjs.Sound);
    loadQueue.on("complete", handleComplete, this);
    loadQueue.on("progress", handleProgress, this);
    // 読み込み開始
    loadQueue.loadManifest(manifest);
    var prog = 0;

    function handleProgress(event) {
        // 読み込み率を0.0~1.0で取得
        var progress = event.progress;
        if (progress > prog) {
            prog += 0.05;
            writeImgChange();
        }
    }

    function handleComplete() {
        gameState = 0;
        clearCan();
        ct.font = canW / 9 + "px 'ＭＳ Ｐゴシック'";
        ct.fillStyle = "blue";
        ct.fillText("タッチでスタート！", 0, canH / 2);
        ct.fillText("(音量注意！)", 0, (canH / 2) + (canW / 9));
        gameStartSE = new Music("gamestart", manifest[0].src);
        bgm = new Music("bgm", manifest[1].src);
        correctSE = new Music("correct", manifest[2].src);
        wrongSE = new Music("wrong", manifest[3].src);
    }
}

function gameStart() {
    if (gameState == 0) {
        clearCan();
        gameState = 1;
        correctCountDown();
        gameStartSE.play();
        bgm.play();
    }
}

function gameOver() {
    gameState = 2;
    gameStartSE.play();
    bgm.stop();
    document.getElementById("submitButton").style.display = "none";
    document.getElementById("clearButton").style.display = "none";
    document.getElementById("backButton").style.display = "inline-block";
    var finalScore = document.getElementById("finalScore");
    finalScore.innerHTML = "正解した数：" + correctCount + "\n間違えた数：" + wrongCount;
    var twitterLink = document.getElementById("twitterLink");
    twitterLink.href = "https://twitter.com/share?url=https://banateck.tk/reiwa&text=令和で書き初め！%0a正解した数：" +
        correctCount + "枚%0a間違えた数：" + wrongCount + "枚%0a&hashtags=令和で書き初め,令和,新元号";
    var modalElement = document.getElementById("finishModal");
    UIkit.modal(modalElement).show();
}

//ゲームの制限時間をはかる
function correctCountDown() {
    var timer = setInterval(function () {
        time--;
        document.getElementById("time").innerHTML = time;
        if (time < 1) {
            clearInterval(timer);
            gameOver();
        }
    }, 1000);
}

function mam_draw_init() {
    //初期設定
    can = document.getElementById("can");
    can.addEventListener("touchstart", onDown, false);
    can.addEventListener("touchmove", onMove, false);
    can.addEventListener("touchend", onUp, false);
    can.addEventListener("mousedown", onMouseDown, false);
    can.addEventListener("mousemove", onMouseMove, false);
    can.addEventListener("mouseup", onMouseUp, false);
    can.addEventListener("mouseleave", onMouseUp, false);
    ct = can.getContext("2d");
    ct.strokeStyle = "#000000";
    ct.lineWidth = 7 * can.width / 128;
    ct.lineJoin = "round";
    ct.lineCap = "round";
    clearCan();
}

function writeImgChange() {
    correctImg.style.display = "none";
    wrongImg.style.display = "none";
    if (writeImgState == 1) {
        writeImgState = 2;
        write2Img.style.display = "none";
        write1Img.style.display = "inline-block";
    } else {
        writeImgState = 1;
        write1Img.style.display = "none";
        write2Img.style.display = "inline-block";
    }
}

function correctImgChange() {
    write1Img.style.display = "none";
    write2Img.style.display = "none";
    wrongImg.style.display = "none";
    correctImg.style.display = "inline-block";
}

function wrongImgChange() {
    write1Img.style.display = "none";
    write2Img.style.display = "none";
    correctImg.style.display = "none";
    wrongImg.style.display = "inline-block";
}

function onDown(event) {
    if (!sub && gameState == 1) {
        writeImgChange();
        mf = true;
        ox = event.touches[0].clientX - event.touches[0].target.getBoundingClientRect().left;
        oy = event.touches[0].clientY - event.touches[0].target.getBoundingClientRect().top;
        event.stopPropagation();
    } else if (gameState == 0) {
        writeImgChange();
        gameStart();
    }
}

function onMove(event) {
    if (mf) {
        x = event.touches[0].clientX - event.touches[0].target.getBoundingClientRect().left;
        y = event.touches[0].clientY - event.touches[0].target.getBoundingClientRect().top;
        drawLine();
        ox = x;
        oy = y;
        event.preventDefault();
        event.stopPropagation();
    }
}

function onUp(event) {
    writeImgChange();
    mf = false;
    event.stopPropagation();
}

function onMouseDown(event) {
    if (!sub && gameState == 1) {
        writeImgChange();
        ox = event.clientX - event.target.getBoundingClientRect().left;
        oy = event.clientY - event.target.getBoundingClientRect().top;
        mf = true;
    } else if (gameState == 0) {
        writeImgChange();
        gameStart();
    }
}

function onMouseMove(event) {
    if (mf) {
        x = event.clientX - event.target.getBoundingClientRect().left;
        y = event.clientY - event.target.getBoundingClientRect().top;
        drawLine();
        ox = x;
        oy = y;
    }
}

function onMouseUp(event) {
    writeImgChange();
    mf = false;
}

function drawLine() {
    ct.beginPath();
    ct.moveTo(ox, oy);
    ct.lineTo(x, y);
    ct.stroke();
}

function clearCan() {
    if (!sub) {
        ct.fillStyle = "rgb(255,255,255)";
        ct.fillRect(0, 0, can.width, can.height);
    }
}

window.gameClearCan = function () {
    if (gameState == 1) {
        clearCan();
    }
}

function strokeCircle(num) { //num:何文字目か
    var p;
    if (num == 0) {
        p = 0;
    } else {
        p = canW;
    }
    ct.beginPath();
    ct.arc(canW / 2, canW / 2 + p, canW * 3 / 8, 0, Math.PI * 2, false);
    ct.strokeStyle = 'red';
    ct.stroke();
    ct.strokeStyle = 'black';
}

function strokeCross(num) { //num:何文字目か
    var p;
    if (num == 0) {
        p = 0;
    } else {
        p = canW;
    }
    var x = canW / 8;
    ct.beginPath();
    ct.moveTo(x * 2, x + p);
    ct.lineTo(x, x * 2 + p);
    ct.lineTo(x * 3, x * 4 + p);
    ct.lineTo(x, x * 6 + p);
    ct.lineTo(x * 2, x * 7 + p);
    ct.lineTo(x * 4, x * 5 + p);
    ct.lineTo(x * 6, x * 7 + p);
    ct.lineTo(x * 7, x * 6 + p);
    ct.lineTo(x * 5, x * 4 + p);
    ct.lineTo(x * 7, x * 2 + p);
    ct.lineTo(x * 6, x + p);
    ct.lineTo(x * 4, x * 3 + p);
    ct.fillStyle = 'blue';
    ct.fill();
}

window.submit = function () {
    if (sub == false && gameState == 1) {
        sub = true;
        var temp = document.createElement('canvas');
        temp.width = 32;
        temp.height = 64;
        var tempCtx = temp.getContext('2d');
        tempCtx.drawImage(can, 0, 0, temp.width, temp.height);
        var imageData = tempCtx.getImageData(0, 0, temp.width, temp.height);
        for (var i = 0; i < imageData.data.length / 4; i++) {
            var r = imageData.data[i * 4];
            var g = imageData.data[i * 4 + 1];
            var b = imageData.data[i * 4 + 2];
            imageData.data[i * 4] = (r + g + b) / 3;
            imageData.data[i * 4 + 1] = (r + g + b) / 3;
            imageData.data[i * 4 + 2] = (r + g + b) / 3;
        }
        var inputTensor = tf.browser.fromPixels(imageData, 3).toFloat();
        var inputNormTensor = inputTensor.div(tf.scalar(255));
        var [reiTensor, waTensor] = tf.split(inputNormTensor, 2);
        reiTensor = reiTensor.reshape([1, 32, 32, 3]);
        waTensor = waTensor.reshape([1, 32, 32, 3]);
        loadPretrainedModel();
        async function loadPretrainedModel() {
            const model = await tf.loadLayersModel(location.origin + "/other/reiwa/model/model.json");
            const reiPrediction = model.predict(reiTensor, {
                batchSize: 1
            });
            const waPrediction = model.predict(waTensor, {
                batchSize: 1
            });
            const rei1 = reiPrediction.arraySync()[0][0];
            const rei2 = reiPrediction.arraySync()[0][1];
            const wa = waPrediction.arraySync()[0][2];
            if ((rei1 > 0.9 || rei2 > 0.9) && wa > 0.9) {
                correctImgChange();
                correctSE.play();
                correctCount += 1;
                time += 3;
                document.getElementById("correctCount").innerHTML = correctCount;
                strokeCircle(0);
                strokeCircle(1);
            } else {
                wrongImgChange();
                wrongSE.play();
                wrongCount += 1
                document.getElementById("wrongCount").innerHTML = wrongCount;
                if ((rei1 > 0.9 || rei2 > 0.9)) {
                    strokeCircle(0);
                } else {
                    strokeCross(0);
                }
                if (wa > 0.9) {
                    strokeCircle(1);
                } else {
                    strokeCross(1);
                }
            }
            setTimeout(function () {
                sub = false;
                clearCan();
            }, 2000);
        }
    }
}
//効果音
class Music {
    constructor(SOUND_ID, SOUND_PATH) {
        this.SOUND_ID = SOUND_ID;
        this.src = SOUND_PATH;
        createjs.Sound.registerSound({
            id: SOUND_ID,
            src: SOUND_PATH
        });
        this.volume = 1;
        this.instance = createjs.Sound.createInstance(this.SOUND_ID);
    }
    play() {
        this.instance.volume = this.volume;
        this.instance.play({
            loop: 0
        });
    }
    changeVolume(v) {
        this.volume = v / 100;
    }
    stop() {
        this.instance.stop();
    }
}
