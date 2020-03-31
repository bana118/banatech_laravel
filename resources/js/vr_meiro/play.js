require('aframe');

window.onload = function () {
    const SIZE = 21; //SIZE must be odd;
    const MAZE_ARRAY = createMaze(SIZE);
    const MAZE_ELEMENT = document.getElementById("maze");
    showMaze(MAZE_ELEMENT, MAZE_ARRAY, SIZE);
};

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
                if (BINARY_ARRAY[x - 1][y] == 0 && !currentCreatingWallEvenPoints.includes([x - 2, y])) {
                    extendDirection.push("left");
                }
                if (BINARY_ARRAY[x + 1][y] == 0 && !currentCreatingWallEvenPoints.includes([x + 2, y])) {
                    extendDirection.push("right");
                }
                if (BINARY_ARRAY[x][y - 1] == 0 && !currentCreatingWallEvenPoints.includes([x, y - 2])) {
                    extendDirection.push("down");
                }
                if (BINARY_ARRAY[x][y + 1] == 0 && !currentCreatingWallEvenPoints.includes([x, y + 2])) {
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
                let blockElement = document.createElement("a-box");
                blockElement.setAttribute("class", "collidable");
                blockElement.setAttribute("position", `${i} 0 ${j}`);
                blockElement.setAttribute("width", "1");
                blockElement.setAttribute("height", "2");
                blockElement.setAttribute("depth", "1");
                blockElement.setAttribute("color", "#4CC3D9");
                mazeElement.appendChild(blockElement);
            }
        }
    }
}
