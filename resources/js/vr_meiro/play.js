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
    const OBJECT_ELEMENTS = setObjects(SCENE_ELEMENT, MAZE_ARRAY, SIZE);
    gameStart(RIG_ELEMENT, CAMERA_ELEMENT, OBJECT_ELEMENTS, SIZE);
};

function gameStart(rigElement, cameraElement, objectElements, size) {
    const GOAL_ELEMENT = objectElements[0];
    const RED_KEY_ELEMENT = objectElements[1];
    const BLUE_KEY_ELEMENT = objectElements[2];
    const GOAL_POSITION = GOAL_ELEMENT.object3D.position;
    AFRAME.registerComponent('position-reader', {
        tick: function () {
            // `this.el` is the element.
            // `object3D` is the three.js object.
            // `position` is a three.js Vector3.
            let cameraPosition = this.el.object3D.position;
            if (Math.pow(cameraPosition.x - GOAL_POSITION.x, 2) +
                Math.pow(cameraPosition.z - GOAL_POSITION.z, 2) < 1) {
                gameClear(rigElement, cameraElement);
            }
        }
    });
    rigElement.setAttribute("position-reader", "");
}

function gameClear(rigElement, cameraElement) {
    if (!cameraElement.hasChildNodes()) {
        let textElement = document.createElement("a-text");
        textElement.setAttribute("value", "Game Clear!");
        textElement.setAttribute("position", "-0.012 0.005 -0.02");
        textElement.setAttribute("width", "0.1");
        textElement.setAttribute("hight", "0.1");
        textElement.setAttribute("color", "red");
        cameraElement.appendChild(textElement);
        // let buttonElement = document.createElement("a-box");
        // buttonElement.id = "retry-button";
        // buttonElement.setAttribute("color","blue");
        // buttonElement.setAttribute("position","0 0 -0.6");
        // buttonElement.setAttribute("width", "0.04");
        // buttonElement.setAttribute("height", "0.02");
        // cameraElement.appendChild(buttonElement);
        // let buttonTextElement = document.createElement("a-text");
        // buttonTextElement.setAttribute("value", "Retry");
        // buttonTextElement.setAttribute("position", "-0.0028 0 -0.02");
        // buttonTextElement.setAttribute("width", "0.05");
        // buttonTextElement.setAttribute("hight", "0.05");
        // buttonTextElement.setAttribute("color", "red");
        // cameraElement.appendChild(buttonTextElement);
    }
    if (rigElement.hasAttribute("movement-controls")) {
        rigElement.removeAttribute("movement-controls");
    }
    if (cameraElement.hasAttribute("look-controls")) {
        cameraElement.removeAttribute("look-controls");
    }
}

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

function setObjects(sceneElement, mazeArray, size) {
    let pathIndex = [];
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (mazeArray[i][j] == 0) {
                pathIndex.push([i, j]);
            }
        }
    }
    // const START_CAMERA_POSITION_INDEX = Math.floor(Math.random() * pathIndex.length);
    // const START_CAMERA_POSITION = pathIndex[START_CAMERA_POSITION_INDEX];
    // cameraElement.setAttribute("position", `${START_CAMERA_POSITION[0] + 0.5} 0.3 ${START_CAMERA_POSITION[1] + 0.5}`);
    const GOAL_POSITIONS = [[size - 1, size - 2], [1, size - 1], [size - 2, 0]];
    const GOAL_POSITION_INDEX = Math.floor(Math.random() * GOAL_POSITIONS.length);
    const GOAL_POSITION = GOAL_POSITIONS[GOAL_POSITION_INDEX];
    const GOAL_ELEMENT = document.getElementById(`wall-${GOAL_POSITION[0]}-${GOAL_POSITION[1]}`);
    GOAL_ELEMENT.setAttribute("src", "#gate-close-asset");
    GOAL_ELEMENT.setAttribute("repeat", "1 2");

    const RED_KEY_ELEMENT = document.createElement("a-image");
    RED_KEY_ELEMENT.id = `red-key`;
    RED_KEY_ELEMENT.setAttribute("width", "0.2");
    RED_KEY_ELEMENT.setAttribute("depth", "0.2");
    RED_KEY_ELEMENT.setAttribute("height", "0.2");
    RED_KEY_ELEMENT.setAttribute("src", "#red-key-asset");
    const BLUE_KEY_ELEMENT = document.createElement("a-image");
    BLUE_KEY_ELEMENT.id = `blue-key`;
    BLUE_KEY_ELEMENT.setAttribute("width", "0.2");
    BLUE_KEY_ELEMENT.setAttribute("depth", "0.2");
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
    ZOMBI_ELEMENT.setAttribute("position", "1 0.01 1");
    ZOMBI_ELEMENT.setAttribute("scale", "0.005 0.005 0.005");
    ZOMBI_ELEMENT.setAttribute("animation-mixer", "");
    sceneElement.appendChild(ZOMBI_ELEMENT);

    const ELEMENTS = [GOAL_ELEMENT, RED_KEY_ELEMENT, BLUE_KEY_ELEMENT];
    return ELEMENTS;
}
