require('aframe');
require('aframe-extras');

window.onload = function () {
    const SIZE = 7; //maze size must be odd;
    const MAZE_ARRAY = createMaze(SIZE);
    const SCENE_ELEMENT = document.getElementById("scene");
    const MAZE_ELEMENT = document.getElementById("maze");
    const RIG_ELEMENT = document.getElementById("rig");
    const CAMERA_ELEMENT = document.getElementById("camera");
    createPath(MAZE_ARRAY, SCENE_ELEMENT);
    showMaze(MAZE_ELEMENT, MAZE_ARRAY, SIZE);
    const OBJECT_ELEMENTS = setObjects(SCENE_ELEMENT, RIG_ELEMENT, MAZE_ARRAY, SIZE);
    gameStart(SIZE, MAZE_ARRAY, SCENE_ELEMENT, RIG_ELEMENT, CAMERA_ELEMENT, OBJECT_ELEMENTS);
};

function gameStart(size, mazeArray, sceneElement, rigElement, cameraElement, objectElements) {
    const GOAL_ELEMENT = objectElements[0];
    const RED_KEY_ELEMENT = objectElements[1];
    const BLUE_KEY_ELEMENT = objectElements[2];
    const ZOMBI_ELEMENT = objectElements[3];
    const GOAL_POSITION = GOAL_ELEMENT.object3D.position;
    const RED_KEY_POSITION = RED_KEY_ELEMENT.object3D.position;
    const BLUE_KEY_POSITION = BLUE_KEY_ELEMENT.object3D.position;
    let hasRedKey = false;
    let hasBlueKey = false;
    let isGameClear = false;
    let isGameOver = false;
    let time = 0;

    const ZOMBI_SPEED = 1;
    let zombiPosition = ZOMBI_ELEMENT.object3D.position;
    let isFound = false;
    ZOMBI_ELEMENT.setAttribute("animation-mixer", "timeScale: 4");
    ZOMBI_ELEMENT.addEventListener("animation-loop", function () {
        if (!isGameOver) {
            //console.log(ZOMBI_ELEMENT.getAttribute("rotation").x);
            //console.log(ZOMBI_ELEMENT.getAttribute("position"));
            zombiPosition = ZOMBI_ELEMENT.object3D.position;
            if (ZOMBI_ELEMENT.getAttribute("rotation").y == 0) {
                //ZOMBI_ELEMENT.setAttribute("rotation", "0 0 0");
                ZOMBI_ELEMENT.setAttribute("position", `${zombiPosition.x} ${zombiPosition.y} ${zombiPosition.z + ZOMBI_SPEED}`);
            } else if (ZOMBI_ELEMENT.getAttribute("rotation").y == 90) {
                //ZOMBI_ELEMENT.setAttribute("rotation", "0 90 0");
                ZOMBI_ELEMENT.setAttribute("position", `${zombiPosition.x + ZOMBI_SPEED} ${zombiPosition.y} ${zombiPosition.z}`);
            } else if (ZOMBI_ELEMENT.getAttribute("rotation").y == 180) {
                ZOMBI_ELEMENT.setAttribute("position", `${zombiPosition.x} ${zombiPosition.y} ${zombiPosition.z - ZOMBI_SPEED}`);
            } else { //ZOMBI_ELEMENT.getAttribute("rotation").y == 270
                ZOMBI_ELEMENT.setAttribute("position", `${zombiPosition.x - ZOMBI_SPEED} ${zombiPosition.y} ${zombiPosition.z}`);
            }

            if (isFound) {

            } else {
                let currentBlockI = Math.floor(zombiPosition.x + 0.5);
                let currentBlockJ = Math.floor(zombiPosition.z + 0.5);
                let rotationYArray = [];
                let currentRotaionY = ZOMBI_ELEMENT.getAttribute("rotation").y;
                if (mazeArray[currentBlockI][currentBlockJ + 1] == 0 &&
                    (currentRotaionY != 180 || (mazeArray[currentBlockI + 1][currentBlockJ] != 0 &&
                        mazeArray[currentBlockI][currentBlockJ - 1] != 0 &&
                        mazeArray[currentBlockI - 1][currentBlockJ] != 0))) {
                    rotationYArray.push(0);
                }
                if (mazeArray[currentBlockI + 1][currentBlockJ] == 0 &&
                    (currentRotaionY != 270 || (mazeArray[currentBlockI][currentBlockJ + 1] != 0 &&
                        mazeArray[currentBlockI][currentBlockJ - 1] != 0 &&
                        mazeArray[currentBlockI - 1][currentBlockJ] != 0))) {
                    rotationYArray.push(90);
                }
                if (mazeArray[currentBlockI][currentBlockJ - 1] == 0 &&
                    (currentRotaionY != 0 || (mazeArray[currentBlockI][currentBlockJ + 1] != 0 &&
                        mazeArray[currentBlockI + 1][currentBlockJ] != 0 &&
                        mazeArray[currentBlockI - 1][currentBlockJ] != 0))) {
                    rotationYArray.push(180);
                }
                if (mazeArray[currentBlockI - 1][currentBlockJ] == 0 &&
                    (currentRotaionY != 90 || (mazeArray[currentBlockI][currentBlockJ + 1] != 0 &&
                        mazeArray[currentBlockI + 1][currentBlockJ] != 0 &&
                        mazeArray[currentBlockI][currentBlockJ - 1] != 0))) {
                    rotationYArray.push(270);
                }
                let rotionYIndex = Math.floor(Math.random() * rotationYArray.length);
                let rotationY = rotationYArray[rotionYIndex];
                ZOMBI_ELEMENT.setAttribute("rotation", `0 ${rotationY} 0`);
            }
        }
    })
    AFRAME.registerComponent('position-reader', {
        tick: function () {
            time += 1;
            // `this.el` is the element.
            // `object3D` is the three.js object.
            // `position` is a three.js Vector3.
            let cameraPosition = this.el.object3D.position;

            if (!hasRedKey &&
                Math.pow(cameraPosition.x - RED_KEY_POSITION.x, 2) +
                Math.pow(cameraPosition.z - RED_KEY_POSITION.z, 2) < 0.1) {
                sceneElement.removeChild(RED_KEY_ELEMENT);
                hasRedKey = true;
                let redKeyInfoElement = document.createElement("a-image");
                redKeyInfoElement.setAttribute("src", "#red-key-asset");
                redKeyInfoElement.setAttribute("position", "-0.001 -0.015 -0.02");
                redKeyInfoElement.setAttribute("width", "0.003");
                redKeyInfoElement.setAttribute("height", "0.003");
                cameraElement.appendChild(redKeyInfoElement);
            }
            if (!hasBlueKey &&
                Math.pow(cameraPosition.x - BLUE_KEY_POSITION.x, 2) +
                Math.pow(cameraPosition.z - BLUE_KEY_POSITION.z, 2) < 0.1) {
                sceneElement.removeChild(BLUE_KEY_ELEMENT);
                hasBlueKey = true;
                let blueKeyInfoElement = document.createElement("a-image");
                blueKeyInfoElement.setAttribute("src", "#blue-key-asset");
                blueKeyInfoElement.setAttribute("position", "0.001 -0.015 -0.02");
                blueKeyInfoElement.setAttribute("width", "0.003");
                blueKeyInfoElement.setAttribute("height", "0.003");
                cameraElement.appendChild(blueKeyInfoElement);
            }
            if (hasRedKey && hasBlueKey) {
                GOAL_ELEMENT.setAttribute("src", "#gate-open-asset");
            }

            if (!isGameClear && !isGameOver && (hasRedKey && hasBlueKey) &&
                Math.pow(cameraPosition.x - GOAL_POSITION.x, 2) +
                Math.pow(cameraPosition.z - GOAL_POSITION.z, 2) < 1) {
                isGameClear = true;
                gameClear(rigElement, cameraElement, time);
            }

            if (!isGameClear && !isGameOver && Math.pow(cameraPosition.x - zombiPosition.x, 2) +
                Math.pow(cameraPosition.z - zombiPosition.z, 2) < 1) {
                isGameOver = true;
                gameOver(rigElement, cameraElement, ZOMBI_ELEMENT);
            }
        }
    });
    rigElement.setAttribute("position-reader", "");
}

function gameClear(rigElement, cameraElement, time) {
    let textElement = document.createElement("a-text");
    textElement.setAttribute("value", "Game Clear!");
    textElement.setAttribute("position", "-0.012 0.005 -0.02");
    textElement.setAttribute("width", "0.1");
    textElement.setAttribute("height", "0.1");
    textElement.setAttribute("color", "red");
    cameraElement.appendChild(textElement);
    rigElement.removeAttribute("movement-controls");
    cameraElement.removeAttribute("look-controls");
    setTimeout(() => {
        postForm("/vr_meiro/game_clear", {
            "time": Math.round(time / 60)
        });
    }, 1000);
}

function gameOver(rigElement, cameraElement, zombiElement) {
    let cameraRotationY = cameraElement.getAttribute("rotation").y;
    let rigPosition = rigElement.getAttribute("position");
    let zombiDistance = 0.6;
    zombiElement.removeAttribute("animation-mixer");
    console.log(zombiElement.object3D.position);
    zombiElement.setAttribute("position",
        `${rigPosition.x - zombiDistance * Math.sin(cameraRotationY * (Math.PI / 180))}
         0.03 ${rigPosition.z - zombiDistance * Math.cos(cameraRotationY * (Math.PI / 180))}`)
    zombiElement.setAttribute("rotation", `0 ${cameraRotationY} 0`);
    console.log(zombiElement.object3D.position);
    console.log(cameraElement.getAttribute("rotation").y);

    let textElement = document.createElement("a-text");
    textElement.setAttribute("value", "Game Over");
    textElement.setAttribute("position", "-0.012 0.005 -0.02");
    textElement.setAttribute("width", "0.1");
    textElement.setAttribute("height", "0.1");
    textElement.setAttribute("color", "red");
    cameraElement.appendChild(textElement);

    rigElement.removeAttribute("movement-controls");
    cameraElement.removeAttribute("look-controls");
    setTimeout(() => {
        window.location.href = "/vr_meiro/game_over";
    }, 1000);
}

function postForm(url, data) {
    var $form = $('<form/>', {
        'action': url,
        'method': 'post',
        'id': 'tempForm'
    });
    for (var key in data) {
        $form.append($('<input/>', {
            'type': 'hidden',
            'name': key,
            'value': data[key]
        }));
    }
    var csrfToken = $('meta[name="csrf-token"]').attr('content');
    $form.append(csrfToken);
    $form.appendTo(document.body);
    $form.submit();
    $("#tempForm").remove();
};

function createPath(mazeArray, sceneElement) {
    AFRAME.registerComponent('maze-path', {
        /**
         * Initial creation and setting of the mesh.
         */
        init: function () {
            let points = [];
            const meshSize = 1;
            let path = [1, 1];
            let isGoArround = false;
            let direction = "up";
            while (!isGoArround) {
                points.push(new THREE.Vector2(path[0] * meshSize - 0.5, path[1] * meshSize * -1 + 0.5));
                if (direction == "up") {
                    if (mazeArray[path[0]][path[1]] == 0) {
                        direction = "right";
                        path[0] = path[0] + 1;
                    } else if (mazeArray[path[0] - 1][path[1]] == 0) {
                        path[1] = path[1] + 1;
                    } else {
                        direction = "left";
                        path[0] = path[0] - 1;
                    }
                } else if (direction == "right") {
                    if (mazeArray[path[0]][path[1] - 1] == 0) {
                        direction = "down";
                        path[1] = path[1] - 1;
                    } else if (mazeArray[path[0]][path[1]] == 0) {
                        path[0] = path[0] + 1;
                    } else {
                        direction = "up";
                        path[1] = path[1] + 1;
                    }
                } else if (direction == "down") {
                    if (mazeArray[path[0] - 1][path[1] - 1] == 0) {
                        direction = "left";
                        path[0] = path[0] - 1;
                    } else if (mazeArray[path[0]][path[1] - 1] == 0) {
                        path[1] = path[1] - 1;
                    } else {
                        direction = "right";
                        path[0] = path[0] + 1;
                    }
                } else { // directon == "left"
                    if (mazeArray[path[0] - 1][path[1]] == 0) {
                        direction = "up";
                        path[1] = path[1] + 1;
                    } else if (mazeArray[path[0] - 1][path[1] - 1] == 0) {
                        path[0] = path[0] - 1;
                    } else {
                        direction = "down";
                        path[1] = path[1] - 1;
                    }
                }
                if (path[0] == 1 && path[1] == 1) {
                    isGoArround = true;
                }
            }
            var heartShape = new THREE.Shape(points);

            var geometry = new THREE.ShapeGeometry(heartShape);
            var material = new THREE.MeshBasicMaterial({
                color: 0x00ff00
            });
            var mesh = new THREE.Mesh(geometry, material);

            this.el.setObject3D('mesh', mesh);
        }
    });
    let pathElement = document.createElement("a-entity");
    pathElement.setAttribute("maze-path", "");
    pathElement.setAttribute("position", "0 0.01 0");
    pathElement.setAttribute("rotation", "-90 0 0");
    pathElement.setAttribute("color", "#00FF00");
    pathElement.setAttribute("nav-mesh", "");
    sceneElement.appendChild(pathElement);
}

// Extend wall to create maze (wall extension method)
function createMaze(size) {
    const BINARY_ARRAY = Array.from(new Array(size), () => new Array(size).fill(0));
    for (let i = 0; i < size; i++) {
        BINARY_ARRAY[0][i] = 1;
        BINARY_ARRAY[size - 1][i] = 1;
        BINARY_ARRAY[i][0] = 1;
        BINARY_ARRAY[i][size - 1] = 1;
    }
    let startCreateWallPoints = [];
    for (let i = 2; i < size - 1; i += 2) {
        for (let j = 2; j < size - 1; j += 2) {
            startCreateWallPoints.push([i, j]);
        }
    }
    while (startCreateWallPoints.length != 0) {
        let randIndex = Math.floor(Math.random() * startCreateWallPoints.length); //0 ~ startCreateWallPoints.length - 1
        let startCreateWallPoint = startCreateWallPoints.pop(randIndex);
        if (BINARY_ARRAY[startCreateWallPoint[0]][startCreateWallPoint[1]] == 0) {
            let currentCreatingWallEvenPoints = [];
            BINARY_ARRAY[startCreateWallPoint[0]][startCreateWallPoint[1]] = 1;
            currentCreatingWallEvenPoints.push(startCreateWallPoint);
            let canExtendWall = true;
            let x = startCreateWallPoint[0];
            let y = startCreateWallPoint[1];
            while (canExtendWall) {
                let extendDirection = [];
                if (BINARY_ARRAY[x - 1][y] == 0 && currentCreatingWallEvenPoints.filter(arr => (arr[0] == x - 2 && arr[1] == y)).length == 0) {
                    extendDirection.push("left");
                }
                if (BINARY_ARRAY[x + 1][y] == 0 && currentCreatingWallEvenPoints.filter(arr => (arr[0] == x + 2 && arr[1] == y)).length == 0) {
                    extendDirection.push("right");
                }
                if (BINARY_ARRAY[x][y - 1] == 0 && currentCreatingWallEvenPoints.filter(arr => (arr[0] == x && arr[1] == y - 2)).length == 0) {
                    extendDirection.push("down");
                }
                if (BINARY_ARRAY[x][y + 1] == 0 && currentCreatingWallEvenPoints.filter(arr => (arr[0] == x && arr[1] == y + 2)).length == 0) {
                    extendDirection.push("up");
                }
                if (extendDirection.length != 0) {
                    let randomDirectionIndex = Math.floor(Math.random() * extendDirection.length);
                    let randomDirection = extendDirection[randomDirectionIndex];
                    if (randomDirection == "left") {
                        canExtendWall = (BINARY_ARRAY[x - 2][y] == 0);
                        BINARY_ARRAY[x - 1][y] = 1;
                        BINARY_ARRAY[x - 2][y] = 1;
                        currentCreatingWallEvenPoints.push([x - 2, y]);
                        if (canExtendWall) {
                            x = x - 2;
                        }
                    } else if (randomDirection == "right") {
                        canExtendWall = (BINARY_ARRAY[x + 2][y] == 0);
                        BINARY_ARRAY[x + 1][y] = 1;
                        BINARY_ARRAY[x + 2][y] = 1;
                        currentCreatingWallEvenPoints.push([x + 2, y]);
                        if (canExtendWall) {
                            x = x + 2;
                        }
                    } else if (randomDirection == "down") {
                        canExtendWall = (BINARY_ARRAY[x][y - 2] == 0);
                        BINARY_ARRAY[x][y - 1] = 1;
                        BINARY_ARRAY[x][y - 2] = 1;
                        currentCreatingWallEvenPoints.push([x, y - 2]);
                        if (canExtendWall) {
                            y = y - 2;
                        }
                    } else { //randomDirection == "up"
                        canExtendWall = (BINARY_ARRAY[x][y + 2] == 0);
                        BINARY_ARRAY[x][y + 1] = 1;
                        BINARY_ARRAY[x][y + 2] = 1;
                        currentCreatingWallEvenPoints.push([x, y + 2]);
                        if (canExtendWall) {
                            y = y + 2;
                        }
                    }
                } else {
                    let previousPoint = currentCreatingWallEvenPoints.pop();
                    x = previousPoint[0];
                    y = previousPoint[1];
                }
            }
        }
    }
    return BINARY_ARRAY;
}

function showMaze(mazeElement, mazeArray, size) {
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (mazeArray[i][j] == 1) {
                let wallElement = document.createElement("a-box");
                wallElement.id = `wall-${i}-${j}`;
                wallElement.setAttribute("position", `${i} 0 ${j}`);
                wallElement.setAttribute("color", "#4CC3D9");
                wallElement.setAttribute("height", "5");
                let width = 1;
                let depth = 1;

                // adjust box size not to see inside of the box
                if ((i == 0 || mazeArray[i - 1][j] == 1) && (i == size - 1 || mazeArray[i + 1][j] == 1)
                    && (j == 0 || mazeArray[i][j - 1] != 1) && (j == size - 1 || mazeArray[i][j + 1] != 1)) {
                    width = 1.1;
                    depth = 0.9;
                } else if ((j == 0 || mazeArray[i][j - 1] == 1) && (j == size - 1 || mazeArray[i][j + 1] == 1)
                    && (i == 0 || mazeArray[i - 1][j] != 1) && (i == size - 1 || mazeArray[i + 1][j] != 1)) {
                    width = 0.9;
                    depth = 1.1;
                } else {
                    width = 0.9;
                    depth = 0.9;
                }
                wallElement.setAttribute("width", width);
                wallElement.setAttribute("depth", depth);
                mazeElement.appendChild(wallElement);
            }
        }
    }
}

function setObjects(sceneElement, rigElement, mazeArray, size) {
    let pathIndex = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (mazeArray[i][j] == 0) {
                pathIndex.push([i, j]);
            }
        }
    }
    const GOAL_POSITIONS = [[size - 1, size - 2], [1, size - 1], [size - 2, 0]];
    const GOAL_POSITION_INDEX = Math.floor(Math.random() * GOAL_POSITIONS.length);
    const GOAL_POSITION = GOAL_POSITIONS[GOAL_POSITION_INDEX];
    const GOAL_ELEMENT = document.getElementById(`wall-${GOAL_POSITION[0]}-${GOAL_POSITION[1]}`);
    GOAL_ELEMENT.setAttribute("src", "#gate-close-asset");
    GOAL_ELEMENT.setAttribute("repeat", "1 2");

    const RED_KEY_ELEMENT = document.createElement("a-image");
    RED_KEY_ELEMENT.id = `red-key`;
    RED_KEY_ELEMENT.setAttribute("width", "0.2");
    RED_KEY_ELEMENT.setAttribute("height", "0.2");
    RED_KEY_ELEMENT.setAttribute("src", "#red-key-asset");
    const BLUE_KEY_ELEMENT = document.createElement("a-image");
    BLUE_KEY_ELEMENT.id = `blue-key`;
    BLUE_KEY_ELEMENT.setAttribute("width", "0.2");
    BLUE_KEY_ELEMENT.setAttribute("height", "0.2");
    BLUE_KEY_ELEMENT.setAttribute("src", "#blue-key-asset");

    if (GOAL_POSITION_INDEX == 0) {
        let redKeyPosition = [0, 0];
        while (mazeArray[redKeyPosition[0]][redKeyPosition[1]] == 1) {
            let redKeyPositionI = Math.floor(Math.random() * ((size - 1) / 2)) + (size - 1) / 2;
            let redKeyPositionJ = Math.floor(Math.random() * ((size - 1) / 2));
            redKeyPosition = [redKeyPositionI, redKeyPositionJ];
        }
        RED_KEY_ELEMENT.setAttribute("position", `${redKeyPosition[0]} 0.5 ${redKeyPosition[1]}`);
        let blueKeyPosition = [0, 0];
        while (mazeArray[blueKeyPosition[0]][blueKeyPosition[1]] == 1) {
            let blueKeyPositionI = Math.floor(Math.random() * ((size - 1) / 2));
            let blueKeyPositionJ = Math.floor(Math.random() * ((size - 1) / 2)) + (size - 1) / 2;
            blueKeyPosition = [blueKeyPositionI, blueKeyPositionJ];
        }
        BLUE_KEY_ELEMENT.setAttribute("position", `${blueKeyPosition[0]} 0.5 ${blueKeyPosition[1]}`);
    } else if (GOAL_POSITION_INDEX == 1) {
        let redKeyPosition = [0, 0];
        while (mazeArray[redKeyPosition[0]][redKeyPosition[1]] == 1) {
            let redKeyPositionI = Math.floor(Math.random() * ((size - 1) / 2)) + (size - 1) / 2;
            let redKeyPositionJ = Math.floor(Math.random() * ((size - 1) / 2)) + (size - 1) / 2;
            redKeyPosition = [redKeyPositionI, redKeyPositionJ];
        }
        RED_KEY_ELEMENT.setAttribute("position", `${redKeyPosition[0]} 0.5 ${redKeyPosition[1]}`);
        let blueKeyPosition = [0, 0];
        while (mazeArray[blueKeyPosition[0]][blueKeyPosition[1]] == 1) {
            let blueKeyPositionI = Math.floor(Math.random() * ((size - 1) / 2)) + (size - 1) / 2;
            let blueKeyPositionJ = Math.floor(Math.random() * ((size - 1) / 2));
            blueKeyPosition = [blueKeyPositionI, blueKeyPositionJ];
        }
        BLUE_KEY_ELEMENT.setAttribute("position", `${blueKeyPosition[0]} 0.5 ${blueKeyPosition[1]}`);
    } else { // GOAL_POSITION_INDEX == 2
        let redKeyPosition = [0, 0];
        while (mazeArray[redKeyPosition[0]][redKeyPosition[1]] == 1) {
            let redKeyPositionI = Math.floor(Math.random() * ((size - 1) / 2));
            let redKeyPositionJ = Math.floor(Math.random() * ((size - 1) / 2)) + (size - 1) / 2;
            redKeyPosition = [redKeyPositionI, redKeyPositionJ];
        }
        RED_KEY_ELEMENT.setAttribute("position", `${redKeyPosition[0]} 0.5 ${redKeyPosition[1]}`);
        let blueKeyPosition = [0, 0];
        while (mazeArray[blueKeyPosition[0]][blueKeyPosition[1]] == 1) {
            let blueKeyPositionI = Math.floor(Math.random() * ((size - 1) / 2)) + (size - 1) / 2;
            let blueKeyPositionJ = Math.floor(Math.random() * ((size - 1) / 2)) + (size - 1) / 2;;
            blueKeyPosition = [blueKeyPositionI, blueKeyPositionJ];
        }
        BLUE_KEY_ELEMENT.setAttribute("position", `${blueKeyPosition[0]} 0.5 ${blueKeyPosition[1]}`);
    }

    sceneElement.appendChild(RED_KEY_ELEMENT);
    sceneElement.appendChild(BLUE_KEY_ELEMENT);

    const ZOMBI_ELEMENT = document.createElement("a-entity");
    ZOMBI_ELEMENT.id = "zombi"
    ZOMBI_ELEMENT.setAttribute("gltf-model", "#zombi-asset");
    ZOMBI_ELEMENT.setAttribute("position", `${(size - 1) / 2} 0.03 ${(size - 1) / 2}`);
    ZOMBI_ELEMENT.setAttribute("scale", "0.005 0.005 0.005");
    sceneElement.appendChild(ZOMBI_ELEMENT);

    const ELEMENTS = [GOAL_ELEMENT, RED_KEY_ELEMENT, BLUE_KEY_ELEMENT, ZOMBI_ELEMENT];
    return ELEMENTS;
}
