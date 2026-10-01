const dateDebut = new Date('2026-07-13');
const dateFin = new Date('2026-12-24');
const dateAujourdhui = new Date();

const totalJours = dateFin - dateDebut;
const joursEcoules = dateAujourdhui - dateDebut;
const pourcentage = Math.min(Math.round((joursEcoules / totalJours) * 100), 100);

document.getElementById('barre').style.width = pourcentage + '%';
document.getElementById('pourcentage').textContent = pourcentage + '%';

const conteneurParticules = document.getElementById('particules');
const nombreParticules = 80;

for (let i = 0; i < nombreParticules; i++) {
  const p = document.createElement('div');
  p.classList.add('particule');

  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const dx = (Math.random() * 200 - 100) + 'px';
  const dy = (Math.random() * 200 - 100) + 'px';
  const duree = 4 + Math.random() * 6;
  const delai = -(Math.random() * 6);
  const teinte = Math.floor(i * (360 / nombreParticules));

  p.style.left = x + 'vw';
  p.style.top = y + 'vh';
  p.style.setProperty('--x', dx);
  p.style.setProperty('--y', dy);
  p.style.background = `hsla(${teinte}, 100%, 50%, 0.6)`;
  p.style.animationDuration = duree + 's';
  p.style.animationDelay = delai + 's';

  conteneurParticules.appendChild(p);
}

const barre = document.getElementById('barre');
if (pourcentage <= 20) {
  barre.style.background = 'linear-gradient(90deg, #e52521 40%, #ff6b6b 50%, #e52521 60%)';
} else if (pourcentage <= 50) {
  barre.style.background = 'linear-gradient(90deg, #f5a623 40%, #ffd080 50%, #f5a623 60%)';
} else {
  barre.style.background = 'linear-gradient(90deg, #27ae60 40%, #6ddb97 50%, #27ae60 60%)';
}
barre.style.backgroundSize = '200% auto';

const statut = document.getElementById('statut');
if (pourcentage <= 20) {
  statut.textContent = 'En progression';
  statut.style.color = '#000000';
  statut.style.font = 'Verdana';
  statut.style = 'bold';
} else if (pourcentage <= 50) {
  statut.textContent = '🟡 En progression';
  statut.style.color = '#f5a623';
} else {
  statut.textContent = '🟢 On y est presque, bientôt terminé';
  statut.style.color = '#27ae60';
}

const milestones = document.querySelectorAll('.milestone');
milestones.forEach(m => {
  const seuil = parseInt(m.getAttribute('data-pct'));
  if (pourcentage >= seuil) {
    m.classList.add('atteint');
    const dot = m.querySelector('.dot');
    if (seuil <= 20) dot.style.background = '#e52521';
    else if (seuil <= 50) dot.style.background = '#f5a623';
    else dot.style.background = '#27ae60';
  }
});

