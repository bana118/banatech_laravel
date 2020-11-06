window.onload = function() {
    const mazeImg = document.getElementById("mazeImg");
    mazeImg.addEventListener("click", () => {
        const bgroup = document.getElementById("bgroup");
        bgroup.style.display = "inline-block";
    });
};
