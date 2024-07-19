document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.menu-button');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuItems = document.querySelectorAll('.menu-item');
    const buttonHome = document.getElementById('buttonHome');
    const buttonClose = document.getElementById('buttonClose');
    const body = document.body;  // Add this line
  
    // Hide home button if on home page
    if (window.location.pathname === '/') {
      buttonHome.style.display = 'none';
    }
  
    // Hide the menu overlay and items initially
    gsap.set(menuOverlay, { autoAlpha: 0, scale: 0, transformOrigin: 'top right' });
    gsap.set(menuItems, { autoAlpha: 0, y: 20, rotateX: -45 });
  
    // Function to get the position of the menu button
    function getMenuButtonPosition() {
      const rect = menuButton.getBoundingClientRect();
      return {
        x: rect.right,
        y: rect.top
      };
    }
  
    // Function to create the opening animation
    function createOpenAnimation() {
      return gsap.timeline()
        .to(menuOverlay, {
          duration: 0.5,
          autoAlpha: 1,
          scale: 1,
          ease: 'elastic.out(1, 0.75)',
          transformOrigin: () => {
            const pos = getMenuButtonPosition();
            return `${pos.x}px ${pos.y}px`;
          }
        })
        .to(menuItems, {
          duration: 0.5,
          autoAlpha: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.1,
          ease: 'back.out(1.7)'
        }, '-=0.25');
    }
  
    // Function to open the menu
    function openMenu() {
      const openTl = createOpenAnimation();
      openTl.play();
      body.classList.add('menu-open');  // Add this line
    }
  
    // Function to close the menu with a "sucking" effect
    function closeMenu() {
      gsap.to(menuOverlay, {
        duration: 0.5,
        scale: 0,
        autoAlpha: 0,
        ease: 'power2.in',
        transformOrigin: () => {
          const pos = getMenuButtonPosition();
          return `${pos.x}px ${pos.y}px`;
        }
      });
  
      gsap.to(menuItems, {
        duration: 0.3,
        autoAlpha: 0,
        y: -20,
        rotateX: 45,
        stagger: 0.05,
        ease: 'power2.in'
      });

      body.classList.remove('menu-open');
    }
  
    // Click event for the Services button
    menuButton.addEventListener('click', function(e) {
      e.preventDefault();
      openMenu();
    });
  
    // Click event for the Close button
    buttonClose.addEventListener('click', function(e) {
      e.preventDefault();
      closeMenu();
    });
  
    // Optional: Close menu when clicking outside
    menuOverlay.addEventListener('click', function(e) {
      if (e.target === this) {
        closeMenu();
      }
    });
  
    // Bonus: Add hover effect to menu items
    menuItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        gsap.to(item, {
          duration: 0.3,
          scale: 1.05,
          color: '#00a8ff',
          ease: 'power1.out'
        });
      });
  
      item.addEventListener('mouseleave', () => {
        gsap.to(item, {
          duration: 0.3,
          scale: 1,
          color: 'inherit',
          ease: 'power1.out'
        });
      });
    });
});