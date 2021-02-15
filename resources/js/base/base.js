import "uikit";

// eslint-disable-next-line no-undef
window.onscroll = function () {
    // eslint-disable-next-line no-undef
    const scrollUpElement = document.getElementById("scrollUp");
    // eslint-disable-next-line no-undef
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
