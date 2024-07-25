// Create and start the initial animations immediately
const tl = gsap.timeline();

tl.from(".loading-text-small", {
  opacity: 0,
  y: 20,
  duration: 1,
  ease: "power2.out"
});

tl.from(".loading-image", {
  opacity: 0,
  scale: 0.8,
  duration: 1,
  ease: "back.out(1.7)"
}, "-=0.5");

// Function to hide the loading screen
function hideLoadingScreen() {
  tl.to(".loading-screen", {
    y: "-100%",
    duration: 1,
    ease: "power2.inOut",
    onComplete: () => {
      document.querySelector(".loading-screen").style.display = "none";
    }
  });
}

// Call this when your content is ready
window.addEventListener('load', hideLoadingScreen);

// Optionally, set a maximum time for the loading screen
setTimeout(hideLoadingScreen, 5000); // 5 seconds maximum