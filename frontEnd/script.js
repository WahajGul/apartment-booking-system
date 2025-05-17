document.querySelector(".customersBtn").onclick = function() {
    setLiActive(".customersLi");
    showSec(".customers");
};

document.querySelector(".dashboardBtn").onclick = function() {
    setLiActive(".dashboardLi");
    showSec(".dashboard");
};

document.querySelector(".apartmentsBtn").onclick = function() {
    setLiActive(".apartmentsLi");
    showSec(".apartments");
};

document.querySelector(".installmentsBtn").onclick = function() {
    setLiActive(".installmentsLi");
    showSec(".installments");
};

const setLiActive = (navID) => {
    document.querySelectorAll(".side-panel ul li").forEach((l) => {
        l.classList.remove("active");

        setTimeout(document.querySelector(navID).classList.add("active"), 50);
    });
};

const showSec = (secID) => {
    document.querySelectorAll(".main-content section").forEach((s) => {
        s.style.display = "none";
        s.classList.remove("active-sec");

        setTimeout(() => {
            document.querySelector(secID).classList.add("active-sec");
            document.querySelector(secID).style.display = "block";
        }, 50);
    });
};
