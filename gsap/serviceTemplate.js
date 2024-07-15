document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
  
    // Register the SplitText and ScrollTrigger plugins
    gsap.registerPlugin(SplitText, ScrollTrigger);
    console.log("SplitText and ScrollTrigger plugins registered");
  
    // Split text into spans
    document.querySelectorAll("[text-split]").forEach((element, index) => {
      console.log(`Splitting text for element ${index}`);
      new SplitText(element, { type: "words, chars", charsClass: "char", wordsClass: "word" });
    });
  
    // Link timelines to scroll position
    function createScrollTrigger(triggerElement, timeline) {
      console.log("Creating ScrollTrigger for element:", triggerElement);
  
      // Reset tl when scroll out of view past bottom of screen
      ScrollTrigger.create({
        trigger: triggerElement,
        start: "top bottom",
        onLeaveBack: () => {
          console.log("Leaving view (bottom), resetting timeline");
          timeline.progress(0);
          timeline.pause();
        }
      });
  
      // Play tl when scrolled into view (60% from top of screen)
      ScrollTrigger.create({
        trigger: triggerElement,
        start: "top 60%",
        onEnter: () => {
          console.log("Entering view (60% from top), playing timeline");
          timeline.play();
        }
      });
    }
  
    document.querySelectorAll("[letters-fade-in]").forEach((element, index) => {
      console.log(`Setting up letters-fade-in animation for element ${index}`);
      let tl = gsap.timeline({ paused: true });
      tl.from(element.querySelectorAll(".char"), { opacity: 0, duration: 0.2, ease: "power1.out", stagger: { amount: 0.8 } });
      createScrollTrigger(element, tl);
    });
  
    document.querySelectorAll("[letters-fade-in-random]").forEach((element, index) => {
      console.log(`Setting up letters-fade-in-random animation for element ${index}`);
      let tl = gsap.timeline({ paused: true });
      tl.from(element.querySelectorAll(".char"), { opacity: 0, duration: 0.05, ease: "power1.out", stagger: { amount: 0.4, from: "random" } });
      createScrollTrigger(element, tl);
    });
  
    document.querySelectorAll("[scrub-each-word]").forEach((element, index) => {
      console.log(`Setting up scrub-each-word animation for element ${index}`);
      let tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start: "top 90%",
          end: "top center",
          scrub: true,
          onEnter: () => console.log("Entering scrub-each-word trigger"),
          onLeave: () => console.log("Leaving scrub-each-word trigger"),
          onEnterBack: () => console.log("Entering back scrub-each-word trigger"),
          onLeaveBack: () => console.log("Leaving back scrub-each-word trigger")
        }
      });
      tl.from(element.querySelectorAll(".word"), { opacity: 0.2, duration: 0.2, ease: "power1.out", stagger: { each: 0.4 } });
    });
  
    // Avoid flash of unstyled content
    gsap.set("[text-split]", { opacity: 1 });
    console.log("Set initial opacity for text-split elements");
  
    // Batch reveal for service-template-stat-item
    function addBatch() {
      ScrollTrigger.batch(".service-template-stat-item", {
        start: "top 80%", // Adjust this value to change when the animation starts
        onEnter: (batch) => gsap.to(batch, { 
          autoAlpha: 1, 
          stagger: 0.1,
          overwrite: true
        }),
        onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, overwrite: true }),
        markers: true
      });
    }
    addBatch();
  
    console.log("Script initialization complete");
});