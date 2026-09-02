
document.addEventListener("DOMContentLoaded", function () {

    // Buttons
    const loginButton = document.querySelector(".login-btn");
    const startButtons = document.querySelectorAll(".start-btn, .primary-btn");
    const exploreButton = document.querySelector(".secondary-btn");

    // Login button → Login Page
    if (loginButton) {
        loginButton.addEventListener("click", function () {
            window.location.href = "login.html";
        });
    }

    startButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            window.location.href = "login.html";
        });
    });

    if (exploreButton) {
        exploreButton.addEventListener("click", function () {
            document.querySelector("#features").scrollIntoView({
                behavior: "smooth"
            });
        });
    }

    const navigationLinks = document.querySelectorAll(".navbar nav a");

    navigationLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (targetId.startsWith("#")) {
                event.preventDefault();

                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({
                        behavior: "smooth"
                    });
                }
            }
        });
    });

    const featureCards = document.querySelectorAll(".feature-card");

    featureCards.forEach(function (card) {

        card.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-8px)";
        });

        card.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0)";
        });

    });

    const progressBar = document.querySelector(".progress-fill");

    if (progressBar) {

        progressBar.style.width = "0%";

        setTimeout(function () {
            progressBar.style.width = "78%";
        }, 500);

    }

    console.log("StudyFlow loaded successfully 🚀");

});