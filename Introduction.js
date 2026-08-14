document.addEventListener("DOMContentLoaded", () => {

    const card = document.getElementById("card");

    const playBtn = document.getElementById("playBtn");

    const playSection = document.getElementById("playSection");

    const videoWrapper = document.getElementById("videoWrapper");

    const video = document.getElementById("welcomeVideo");

    const progressFill = document.getElementById("progressFill");

    const submitSection = document.getElementById("submitSection");

    const submitBtn = document.getElementById("submitBtn");


    /* =====================================================
       3D CARD TILT EFFECT
    ===================================================== */

    document.addEventListener("mousemove", (event) => {

        const x = event.clientX / window.innerWidth;

        const y = event.clientY / window.innerHeight;

        const rotateY = (x - 0.5) * 10;

        const rotateX = (0.5 - y) * 8;

        card.style.transform = `
            perspective(1200px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateZ(10px)
        `;

    });


    /* Reset card when mouse leaves */

    document.addEventListener("mouseleave", () => {

        card.style.transform = `
            perspective(1200px)
            rotateX(0deg)
            rotateY(0deg)
            translateZ(0)
        `;

    });


    /* =====================================================
       PLAY VIDEO
    ===================================================== */

    playBtn.addEventListener("click", async () => {

        playBtn.disabled = true;

        playSection.style.opacity = "0";

        playSection.style.transform = "translateY(-15px)";

        setTimeout(() => {

            playSection.style.display = "none";

            videoWrapper.style.display = "block";

        }, 300);


        try {

            await video.play();

        } catch (error) {

            console.log("Video playback requires user interaction.");

        }

    });


    /* =====================================================
       VIDEO PROGRESS
    ===================================================== */

    video.addEventListener("timeupdate", () => {

        if (!video.duration) return;

        const percentage =
            (video.currentTime / video.duration) * 100;

        progressFill.style.width = `${percentage}%`;

    });


    /* =====================================================
       VIDEO PLAY / PAUSE EFFECT
    ===================================================== */

    video.addEventListener("play", () => {

        card.classList.add("video-playing");

    });


    video.addEventListener("pause", () => {

        card.classList.remove("video-playing");

    });


    /* =====================================================
       VIDEO ENDED
    ===================================================== */

    video.addEventListener("ended", () => {

        videoWrapper.style.animation =
            "videoReveal 0.5s reverse forwards";


        setTimeout(() => {

            videoWrapper.style.display = "none";

            submitSection.style.display = "block";

        }, 400);

    });


    /* =====================================================
       CONTINUE BUTTON
    ===================================================== */

    submitBtn.addEventListener("click", () => {

        submitBtn.disabled = true;

        submitBtn.innerHTML = `
            <span>Loading...</span>
        `;

        submitBtn.style.opacity = "0.7";

        setTimeout(() => {

            window.location.href = "index.html";

        }, 500);

    });


    /* =====================================================
       MOBILE 3D TILT
    ===================================================== */

    if (window.DeviceOrientationEvent) {

        window.addEventListener("deviceorientation", (event) => {

            if (window.innerWidth > 700) return;

            const gamma = event.gamma || 0;
            const beta = event.beta || 0;

            const rotateY =
                Math.max(-5, Math.min(5, gamma));

            const rotateX =
                Math.max(-5, Math.min(5, beta - 45));

            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
            `;

        });

    }

});