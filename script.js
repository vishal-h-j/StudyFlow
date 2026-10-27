document.addEventListener("DOMContentLoaded", function () {

    const loginButton = document.querySelector(".login-btn");

    if (loginButton) {
        loginButton.onclick = function () {
            window.location.href = "login.html";
        };
    }

    document.querySelectorAll(".start-btn, .primary-btn").forEach(function (button) {

        button.onclick = function () {
            window.location.href = "login.html";
        };

    });

    const exploreButton = document.querySelector(".secondary-btn");

    if (exploreButton) {

        exploreButton.onclick = function () {

            document.querySelector("#features").scrollIntoView({
                behavior: "smooth"
            });

        };

    }

    document.querySelectorAll(".navbar nav a").forEach(function (link) {

        link.onclick = function (event) {

            const target = this.getAttribute("href");

            if (target.startsWith("#")) {

                event.preventDefault();

                document.querySelector(target).scrollIntoView({
                    behavior: "smooth"
                });

            }

        };

    });

    const featureCards = document.querySelectorAll(".feature-card");

    featureCards.forEach(function (card, index) {

        card.addEventListener("mouseenter", function () {
            this.style.transform = "translateY(-8px)";
        });

        card.addEventListener("mouseleave", function () {
            this.style.transform = "translateY(0)";
        });


        card.addEventListener("click", function () {

            if (index === 0) {
                window.location.href = "courses.html";
            }

            if (index === 1) {
                window.location.href = "materials.html";
            }

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