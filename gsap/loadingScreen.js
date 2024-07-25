document.addEventListener('DOMContentLoaded', function() {
    const tl = gsap.timeline();
    const loadingScreen = document.querySelector(".loading-screen");
    const loadingText = document.querySelector(".loading-text-small");
    const loadingImage = document.querySelector(".loading-image-wrapper .home-header-image");
    const homeHeaderDiv = document.querySelector(".home-header-div");
    const homeHeaderImage = homeHeaderDiv.querySelector(".home-header-image");
  
    // Set initial states
    gsap.set(loadingScreen, { autoAlpha: 1 });
    gsap.set(loadingImage, { autoAlpha: 0, scale: 0.8 });
    gsap.set(homeHeaderImage, { autoAlpha: 0 }); // Hide the original image initially
  
    // Initial animations
    tl.from(loadingText, {
      opacity: 0,
      y: 20,
      duration: 1.5,
      ease: "power2.out"
    });
  
    tl.to(loadingImage, {
      autoAlpha: 1,
      scale: 1,
      duration: 1.5,
      ease: "back.out(1.7)"
    }, "-=1");
  
    function hideLoadingScreen() {
      const loadingImageRect = loadingImage.getBoundingClientRect();
      const homeImageRect = homeHeaderImage.getBoundingClientRect();
  
      tl.to(loadingScreen, {
        autoAlpha: 0,
        duration: 1,
        ease: "power2.inOut"
      });
  
      tl.to(loadingImage, {
        x: homeImageRect.left - loadingImageRect.left,
        y: homeImageRect.top - loadingImageRect.top,
        width: homeImageRect.width,
        height: homeImageRect.height,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          loadingScreen.style.display = "none";
          gsap.set(homeHeaderImage, { autoAlpha: 1 }); // Show the original image
        }
      }, "-=1");
    }
  
    // Call this when your content is ready
    window.addEventListener('load', () => {
      // Delay hiding the loading screen to ensure a minimum display time
      setTimeout(hideLoadingScreen, 2000);
    });
  
    // Set a maximum time for the loading screen
    setTimeout(hideLoadingScreen, 5000);
});