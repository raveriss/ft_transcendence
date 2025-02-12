document.addEventListener('DOMContentLoaded', function() {
  const mode1v1Button = document.getElementById('1v1-btn');
  const modeTournamentButton = document.getElementById('tournament-btn');


  if (modeTournamentButton) {
    modeTournamentButton.addEventListener('click', () => {
      window.location.href = 'tournament.html';
    });
  }

  if (mode1v1Button) {
    mode1v1Button.addEventListener('click', () => {
      window.location.href = '';
    });
  }
});