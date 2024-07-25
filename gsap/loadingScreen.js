document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
  
    const tl = gsap.timeline();
    const loadingScreen = document.querySelector(".loading-screen");
    const loadingText = document.querySelector(".loading-text-small");
    const homeHeaderDiv = document.querySelector(".home-header-div");
    const homeHeaderImage = homeHeaderDiv.querySelector(".home-header-image");
    const loadingImageWrapper = document.querySelector(".loading-image-wrapper");
  
    // Move the home-header-image to the loading screen
    loadingImageWrapper.appendChild(homeHeaderImage.cloneNode(true));
    const loadingImage = loadingImageWrapper.querySelector(".home-header-image");
  
    console.log('Loading Screen:', loadingScreen);
    console.log('Loading Text:', loadingText);
    console.log('Loading Image:', loadingImage);
    console.log('Home Header Div:', homeHeaderDiv);
    console.log('Home Header Image:', homeHeaderImage);
  
    if (!loadingImage) {
      console.error('Loading image not found. Check the selector.');
      return;
    }
  
    // Set initial states
    gsap.set(loadingScreen, { autoAlpha: 1 });
    gsap.set(loadingImage, { autoAlpha: 0, scale: 0.8 });
    gsap.set(homeHeaderImage, { autoAlpha: 0 }); // Hide the original image initially
  
    console.log('Initial states set');
  
    // Initial animations
    tl.from(loadingText, {
      opacity: 0,
      y: 20,
      duration: 1.5,
      ease: "power2.out",
      onComplete: () => console.log('Loading text animation complete')
    });
  
    tl.to(loadingImage, {
      autoAlpha: 1,
      scale: 1,
      duration: 1.5,
      ease: "back.out(1.7)",
      onStart: () => console.log('Starting loading image animation'),
      onComplete: () => console.log('Loading image animation complete')
    }, "-=1");
  
    function hideLoadingScreen() {
      console.log('Hiding loading screen');
  
      const loadingImageRect = loadingImage.getBoundingClientRect();
      const homeImageRect = homeHeaderImage.getBoundingClientRect();
  
      console.log('Loading Image Rect:', loadingImageRect);
      console.log('Home Image Rect:', homeImageRect);
  
      tl.to(loadingScreen, {
        autoAlpha: 0,
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => console.log('Loading screen fade out complete')
      });
  
      tl.to(loadingImage, {
        x: homeImageRect.left - loadingImageRect.left,
        y: homeImageRect.top - loadingImageRect.top,
        width: homeImageRect.width,
        height: homeImageRect.height,
        duration: 1.5,
        ease: "power2.inOut",
        onStart: () => console.log('Starting image transition'),
        onComplete: () => {
          console.log('Image transition complete');
          loadingScreen.style.display = "none";
          gsap.set(homeHeaderImage, { autoAlpha: 1 }); // Show the original image
          loadingImage.remove(); // Remove the cloned image
        }
      }, "-=1");
    }
  
    // Call this when your content is ready
    window.addEventListener('load', () => {
      console.log('Window loaded');
      // Delay hiding the loading screen to ensure a minimum display time
      setTimeout(hideLoadingScreen, 2000);
    });
  
    // Set a maximum time for the loading screen
    setTimeout(hideLoadingScreen, 5000);
});