import "uikit";

window.onscroll = function() {
    const scrollUpElement = document.getElementById("scrollUp");
    const scrollY = window.pageYOffset;
    if (scrollY > 100) {
        scrollUpElement.style.visibility = "visible";
        scrollUpElement.classList.add("uk-animation-fade");
    } else if (scrollY < 100) {
        scrollUpElement.style.visibility = "hidden";
        if (scrollUpElement.classList.contains("uk-animation-fade")) {
            scrollUpElement.classList.remove("uk-animation-fade");
        }
    }
};
