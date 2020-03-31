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
            startCreateWallPoints.append([[i, j]]);
        }
    }

    while(startCreateWallPoints.length != 0){
        let randIndex = Math.floor(Math.random()*startCreateWallPoints.length); //0 ~ startCreateWallPoints.length - 1
        let startCreateWallPoint = startCreateWallPoints.pop(randIndex);
        if(BINARY_ARRAY[startCreateWallPoint[0]][startCreateWallPoint[1]] == 0){
            BINARY_ARRAY[startCreateWallPoint[0]][startCreateWallPoint[1]] = 1;
            let currentCreatingWall = [startCreateWallPoint];
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
