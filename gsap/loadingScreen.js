document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
  
    const tl = gsap.timeline();
    const loadingScreen = document.querySelector(".loading-screen");
    const loadingText = document.querySelector(".loading-text-small");
    const homeHeaderDiv = document.querySelector(".home-header-div");
    const homeHeaderImage = homeHeaderDiv.querySelector(".home-header-image");
    const loadingImageWrapper = document.querySelector(".loading-image-wrapper");
  
    const initialTextDuration = 3; // Adjust this value to change the wait time
  
    if (!homeHeaderImage) {
      console.error('Home header image not found. Check the selector.');
      return;
    }
  
    // Move the original image to the loading screen
    loadingImageWrapper.appendChild(homeHeaderImage);
  
    // Set initial states
    gsap.set(loadingScreen, { autoAlpha: 1 });
    gsap.set(homeHeaderImage, { autoAlpha: 0, scale: 0.8 });
  
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
    }, `+=${initialTextDuration}`)
    .to(homeHeaderImage, {
      autoAlpha: 1,
      scale: 1,
      duration: 1.5,
      ease: "back.out(1.7)"
    }, "-=0.5");
  
    function hideLoadingScreen() {
      const loadingImageRect = homeHeaderImage.getBoundingClientRect();
      const finalRect = homeHeaderDiv.getBoundingClientRect();
  
      gsap.to(loadingScreen, {
        autoAlpha: 0,
        duration: 1,
        ease: "power2.inOut"
      });
  
      gsap.to(homeHeaderImage, {
        x: finalRect.left - loadingImageRect.left,
        y: finalRect.top - loadingImageRect.top,
        width: finalRect.width,
        height: finalRect.height,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
          // Move the image back to its original container
          homeHeaderDiv.appendChild(homeHeaderImage);
          // Reset any inline styles added by GSAP
          gsap.set(homeHeaderImage, { clearProps: "all" });
          loadingScreen.style.display = "none";
          console.log('Transition complete');
        }
      });
    }
  
    // Call this when your content is ready
    window.addEventListener('load', () => {
      console.log('Window loaded');
      // Delay hiding the loading screen to ensure a minimum display time
      setTimeout(hideLoadingScreen, (initialTextDuration + 4) * 1000);
    });
  
    // Set a maximum time for the loading screen
    setTimeout(hideLoadingScreen, (initialTextDuration + 8) * 1000);
});