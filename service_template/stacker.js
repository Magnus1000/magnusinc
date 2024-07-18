function executeStackerScript() {
    // Handle proof markers
    const proofMarkers = document.querySelectorAll('div.proof-marker');
    proofMarkers.forEach(marker => {
      const leftValue = marker.getAttribute('data-left');
      if (leftValue !== null) {
        marker.style.left = `${leftValue}%`;
        console.log(`Set left of proof marker with data-left="${leftValue}" to ${leftValue}%`);
      } else {
        console.warn(`Proof marker is missing "data-left" attribute`);
      }
    });
  
    // Handle social proof image items
    const socialProofItems = document.querySelectorAll('div.social-proof-image-item');
    socialProofItems.forEach(item => {
      const stickyTopValue = item.getAttribute('data-sticky-top');
      if (stickyTopValue !== null) {
        const stickyTopNumber = parseInt(stickyTopValue, 10);
        const newTopValue = 7 + stickyTopNumber;
        item.style.top = `${newTopValue}rem`;
        console.log(`Set top of social proof item with data-sticky-top="${stickyTopValue}" to ${newTopValue}rem`);
      }
    });
}