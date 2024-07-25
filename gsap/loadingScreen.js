// Create the loading screen HTML
const loadingScreenHTML = `
  <div id="loading-screen" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #f0f0f0; z-index: 9999;">
    <div class="loading-text-wrapper">
      <div class="loading-text-small">Magnus Inc builds digital solutions that are...</div>
    </div>
    <div class="loading-image-wrapper">
      <img src="https://cdn.prod.website-files.com/66622a9748f9ccb21e21b57e/66a2a34adc4f07bb92e3fa6e_prett_and_smart_flat.svg" width="150" alt="Pretty and Smart" class="loading-image">
    </div>
  </div>
`;

// Insert the loading screen into the DOM
document.body.insertAdjacentHTML('afterbegin', loadingScreenHTML);

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
  tl.to("#loading-screen", {
    y: "-100%",
    duration: 1,
    ease: "power2.inOut",
    onComplete: () => {
      document.getElementById("loading-screen").remove();
    }
  });
}

// Call this when your content is ready
window.addEventListener('load', hideLoadingScreen);

// Optionally, set a maximum time for the loading screen
setTimeout(hideLoadingScreen, 5000); // 5 seconds maximum