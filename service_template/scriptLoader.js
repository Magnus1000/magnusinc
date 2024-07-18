(function() {
    const REPO_OWNER = 'Magnus1000';
    const REPO_NAME = 'magnusinc';
    const SCRIPTS = [
      '/service_template/stacker.js',
    ];
    const CACHE_DURATION = 3600000; // 1 hour in milliseconds
  
    function loadExternalScript(url) {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }
  
    async function loadDependencies() {
      try {
        await loadExternalScript('https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/66954f19297e91ebd391e39d_SplitText.min.txt');
        await loadExternalScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js');
        await loadExternalScript('https://uploads-ssl.webflow.com/66622a9748f9ccb21e21b57e/6695710378942661c674b8db_ScrollSmoother.txt');
        await loadExternalScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js');
        console.log('External dependencies loaded successfully');
      } catch (error) {
        console.error('Error loading external dependencies:', error);
      }
    }
  
    async function getLatestCommitSha(branch, useCache = false) {
      if (useCache) {
        const cachedData = JSON.parse(localStorage.getItem('scriptVersionData') || '{}');
        if (cachedData.timestamp && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
          console.log('Using cached commit SHA');
          return cachedData.sha;
        }
      }
  
      try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/${branch}`);
        if (!response.ok) throw new Error('Failed to fetch commit data');
        const data = await response.json();
        
        if (useCache) {
          const newData = { sha: data.sha, timestamp: Date.now() };
          localStorage.setItem('scriptVersionData', JSON.stringify(newData));
          console.log('Cached new commit SHA');
        }
        
        return data.sha;
      } catch (error) {
        console.error('Error fetching latest commit:', error);
        return null;
      }
    }
  
    async function loadScript(url) {
      try {
        console.log(`Fetching ${url}`);
        const response = await fetch(url);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers.get('Content-Type')}`);
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        let scriptContent = await response.text();
        console.log(`First 100 characters of response: ${scriptContent.substring(0, 100)}`);
  
        if (scriptContent.trim().startsWith('<')) {
          throw new Error('Received HTML instead of JavaScript');
        }
  
        if (typeof Babel !== 'undefined' && !url.includes('supabase')) {
          scriptContent = Babel.transform(scriptContent, { presets: ['react'] }).code;
        }
  
        // Execute the script content
        eval(scriptContent);
  
        // Call the function if it exists
        if (typeof executeStackerScript === 'function') {
          executeStackerScript();
        }
  
        console.log(`Loaded and executed: ${url}`);
      } catch (error) {
        console.error(`Error loading script ${url}:`, error);
      }
    }
  
    async function loadScripts() {
      await loadDependencies();
  
      const domain = document.documentElement.getAttribute('data-wf-domain');
      const environment = domain.includes('webflow.io') ? 'staging' : 'production';
      const branch = environment === 'staging' ? 'staging' : 'main';
      const useCache = environment === 'production';
  
      console.log(`Environment: ${environment}, Branch: ${branch}, Using cache: ${useCache}`);
  
      const latestSha = await getLatestCommitSha(branch, useCache);
      if (!latestSha) {
        console.error('Failed to get latest commit SHA. Aborting script loading.');
        return;
      }
  
      console.log(`Latest commit SHA: ${latestSha}`);
  
      for (const script of SCRIPTS) {
        const url = script.startsWith('http') ? script : `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${latestSha}/${script}`;
        await loadScript(url);
      }
    }
  
    // Run the script loader when the DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadScripts);
    } else {
      loadScripts();
    }
})();