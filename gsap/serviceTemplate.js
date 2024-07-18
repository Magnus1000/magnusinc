// /gsap/serviceTemplate.js
function executeServiceTemplateScript() {
  console.log("DOM fully loaded and parsed");

  // Register the SplitText and ScrollTrigger plugins
  gsap.registerPlugin(SplitText, ScrollTrigger);
  console.log("SplitText and ScrollTrigger plugins registered");

  // Split text into spans
  document.querySelectorAll("[text-split]").forEach((element, index) => {
      console.log(`Splitting text for element ${index}`);
      new SplitText(element, { type: "words, chars", charsClass: "char", wordsClass: "word" });
  });

  // Function to create ScrollTrigger for animations
  function createScrollTrigger(triggerElement, timeline) {
      console.log("Creating ScrollTrigger for element:", triggerElement);

      ScrollTrigger.create({
          trigger: triggerElement,
          start: "top bottom",
          onLeaveBack: () => {
              console.log("Leaving view (bottom), resetting timeline");
              timeline.progress(0);
              timeline.pause();
          }
      });

      ScrollTrigger.create({
          trigger: triggerElement,
          start: "top 60%",
          onEnter: () => {
              console.log("Entering view (60% from top), playing timeline");
              timeline.play();
          }
      });
  }

  // Letters fade-in animations
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

  // Scrub each word animation
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

  // GSAP timeline swap subheaders
  function splitText(element) {
      let text = element.innerText;
      element.innerHTML = text.split("").map(char => `<span>${char}</span>`).join("");
  }

  // Apply splitText to each header
  const header1 = document.getElementById("header1");
  const header2 = document.getElementById("header2");

  splitText(header1);
  splitText(header2);

  // GSAP animation for headers
  const tl = gsap.timeline({ repeat: -1 });

  function animateHeader(header) {
      return gsap.timeline()
          .fromTo(header.children, { opacity: 0 }, { opacity: 1, stagger: 0.05, duration: 1, ease: "power1.inOut" })
          .to(header.children, { opacity: 0, stagger: 0.05, duration: 1, ease: "power1.inOut" }, "+=3");
  }

  tl.add(animateHeader(header1))
    .add(animateHeader(header2), "-=2");

  // Batch reveal for service-template-stat-item
  ScrollTrigger.batch(".service-template-stat-item", {
      start: "top 80%",
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, stagger: 0.1, overwrite: true }),
      onLeaveBack: (batch) => gsap.set(batch, { autoAlpha: 0, overwrite: true })
  });
  
  // New social proof image list animation
  console.log("Setting up social proof image list animation");
  const items = gsap.utils.toArray('.social-proof-image-item');

  const socialProofTl = gsap.timeline({
      scrollTrigger: {
          trigger: ".social-proof-image-list",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onEnter: () => console.log("Entering social proof image list trigger"),
          onLeave: () => console.log("Leaving social proof image list trigger"),
          onEnterBack: () => console.log("Entering back social proof image list trigger"),
          onLeaveBack: () => console.log("Leaving back social proof image list trigger")
      }
  });

  items.forEach((item, index) => {
      const progress = index / (items.length - 1);
      const startScale = 0.82;
      const endScale = 0.97;
      const scale = startScale + (endScale - startScale) * progress;

      socialProofTl.to(item, {
          scale: scale,
          ease: "none",
          duration: 1
      }, 0);
  });

  // Draw borders around elements
  const subserviceItems = document.querySelectorAll('.service-template-subservice-item');

  if (subserviceItems.length > 0) {
      subserviceItems.forEach(item => {
          // Create and append border elements
          ["top", "right", "bottom", "left"].forEach(position => {
              const border = document.createElement('div');
              border.classList.add('border', position);
              item.appendChild(border);
          });
      });

      let tl = gsap.timeline({
          scrollTrigger: {
              trigger: ".service-template-subservice-wrapper",
              start: "top 80%",
              end: "bottom 20%",
              scrub: 1
          }
      });

      subserviceItems.forEach((item, index) => {
          ["top", "right", "bottom", "left"].forEach(position => {
              tl.to(item.querySelector(`.border.${position}`), {
                  [position === "top" || position === "bottom" ? "width" : "height"]: "100%",
                  duration: 0.25
              });
          });

          if (index < subserviceItems.length - 1) {
              tl.to({}, { duration: 0.2 });
          }
      });
  } else {
      console.warn("No .service-template-subservice-item elements found");
  }
}

executeServiceTemplateScript();