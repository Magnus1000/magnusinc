document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
  
    const tl = gsap.timeline();
    const loadingScreen = document.querySelector(".loading-screen");
    const loadingText = document.querySelector(".loading-text-small");
    const homeHeaderDiv = document.querySelector(".home-header-div");
    const homeHeaderImage = homeHeaderDiv.querySelector(".home-header-image");
    const loadingImageWrapper = document.querySelector(".loading-image-wrapper");
  
    console.log('Elements selected');
  
    if (!homeHeaderImage) {
      console.error('Home header image not found. Check the selector.');
      return;
    }
  
    // Clone the home-header-image and place it in the loading screen
    const loadingImage = homeHeaderImage.cloneNode(true);
    loadingImageWrapper.appendChild(loadingImage);
  
    console.log('Image cloned and appended');
  
    // Set initial states
    gsap.set(loadingScreen, { autoAlpha: 1 });
    gsap.set(loadingImage, { autoAlpha: 0, scale: 0.8 });
    gsap.set(homeHeaderImage, { autoAlpha: 0 }); // Hide the original image initially
  
    console.log('Initial states set');
  
    // Animation sequence
    tl.from(loadingText, {
      opacity: 0,
      y: 20,
      duration: 1.5,
      ease: "power2.out"
    })
    .to(loadingText, {
      opacity: 0,
      y: -20,
      duration: 1,
      ease: "power2.in"
    }, "+=1.5") // Wait 2 seconds before fading out text
    .to(loadingImage, {
      autoAlpha: 1,
      scale: 1,
      duration: 1.5,
      ease: "back.out(1.7)"
    }, "-=0.5") // Start slightly before text fade out completes
  
    function hideLoadingScreen() {
      console.log('Hiding loading screen');
  
      const loadingImageRect = loadingImage.getBoundingClientRect();
      const homeImageRect = homeHeaderImage.getBoundingClientRect();
  
      tl.to(loadingScreen, {
        autoAlpha: 0,
        duration: 1,
        ease: "power2.inOut"
      })
      .to(loadingImage, {
        x: homeImageRect.left - loadingImageRect.left,
        y: homeImageRect.top - loadingImageRect.top,
        width: homeImageRect.width,
        height: homeImageRect.height,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(homeHeaderImage, { autoAlpha: 1 }); // Show the original image
          loadingScreen.style.display = "none";
          loadingImage.remove(); // Remove the cloned image
          console.log('Transition complete');
        }
      }, "-=0.5"); // Start slightly before the loading screen fades out
    }
  
    // Call this when your content is ready
    window.addEventListener('load', () => {
      console.log('Window loaded');
      // Delay hiding the loading screen to ensure a minimum display time
      setTimeout(hideLoadingScreen, 6000); // Increased to account for longer animation sequence
    });
  
    // Set a maximum time for the loading screen
    setTimeout(hideLoadingScreen, 10000); // Increased maximum time
  });