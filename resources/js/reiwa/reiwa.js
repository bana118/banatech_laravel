window.onload = function() {
    const penguinImg = document.getElementById("penguinImg");
    console.log(penguinImg);
    penguinImg.addEventListener("click", () => {
        const bgroup = document.getElementById("bgroup");
        bgroup.style.display = "inline-block";
    });
};
