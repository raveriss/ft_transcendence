(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const jwt = urlParams.get('jwt');
  if (jwt) {
    const container = document.querySelector('.container');
    if (container) {
      localStorage.setItem('jwt', jwt);
    }
  }
})();
