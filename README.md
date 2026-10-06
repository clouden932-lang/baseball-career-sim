const defaultPlayer = {
  name: 'Rookie #1',
  position: 'CF',
  contact: 25,
  power: 25,
  speed: 25,
  coordination: 25,
  endurance: 25,
  iq: 25,
  level: 1,
  xp: 0,
  skillPoints: 0,
  homeRuns: 0,
  singles: 0,
  doubles: 0,
  triples: 0,
  strikeouts: 0,
  walks: 0,
  atBats: 0,
  season: 1,
  team: 'Rookie Squad'
};

let player = { ...defaultPlayer };

const playerInfoEl = document.getElementById('player-info');
const logEl = document.getElementById('log');
const actionButtons = document.querySelectorAll('.action-btn');

function logMessage(message) {
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.textContent = message;
  logEl.prepend(entry);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updatePlayerDisplay() {
  playerInfoEl.innerHTML = `
    <div><strong>Name:</strong> ${player.name}</div>
    <div><strong>Team:</strong> ${player.team}</div>
    <div><strong>Position:</strong> ${player.position}</div>
    <div><strong>Season:</strong> ${player.season}</div>
    <div><strong>Level:</strong> ${player.level}</div>
    <div><strong>XP:</strong> ${player.xp}/100</div>
    <div><strong>Skill points:</strong> ${player.skillPoints}</div>
    <div class="stat-line"><span>Contact</span><span>${player.contact}</span></div>
    <div class="stat-line"><span>Power</span><span>${player.power}</span></div>
    <div class="stat-line"><span>Speed</span><span>${player.speed}</span></div>
    <div class="stat-line"><span>Coordination</span><span>${player.coordination}</span></div>
    <div class="stat-line"><span>Endurance</span><span>${player.endurance}</span></div>
    <div class="stat-line"><span>IQ</span><span>${player.iq}</span></div>
    <div class="stat-line"><span>AB</span><span>${player.atBats}</span></div>
    <div class="stat-line"><span>HR</span><span>${player.homeRuns}</span></div>
  `;
}

function awardXP(amount) {
  player.xp += amount;
  const xpNeeded = 100;

  while (player.xp >= xpNeeded) {
    player.xp -= xpNeeded;
    player.level += 1;
    player.skillPoints += 1;
    logMessage(`Level up! ${player.name} is now level ${player.level}.`);
  }
}

function getSkillValue(skillName) {
  return player[skillName];
}

function chooseOutcome(action) {
  const roll = Math.random();
  const contact = getSkillValue('contact');
  const power = getSkillValue('power');
  const speed = getSkillValue('speed');
  const coordination = getSkillValue('coordination');
  const iq = getSkillValue('iq');

  let outcomeChance = {
    strikeout: 0.18,
    walk: 0.1,
    single: 0.24,
    double: 0.14,
    triple: 0.08,
    homerun: 0.08,
    out: 0.18
  };

  if (action === 'power') {
    outcomeChance.homeRun += 0.08;
    outcomeChance.single -= 0.04;
    outcomeChance.strikeout += 0.04;
  }

  if (action === 'contact') {
    outcomeChance.single += 0.08;
    outcomeChance.double += 0.04;
    outcomeChance.strikeout -= 0.03;
  }

  if (action === 'bunt') {
    outcomeChance.single += 0.12;
    outcomeChance.out += 0.06;
  }

  if (action === 'walk') {
    outcomeChance.walk += 0.12;
    outcomeChance.strikeout -= 0.04;
  }

  // Skill bonuses
  if (contact > 25) outcomeChance.single += (contact - 25) * 0.004;
  if (power > 25) outcomeChance.homerun += (power - 25) * 0.003;
  if (speed > 25) outcomeChance.triple += (speed - 25) * 0.003;
  if (coordination > 25) outcomeChance.strikeout -= (coordination - 25) * 0.003;
  if (iq > 25) outcomeChance.walk += (iq - 25) * 0.003;

  // Keep values safe
  Object.keys(outcomeChance).forEach((key) => {
    if (outcomeChance[key] < 0.01) outcomeChance[key] = 0.01;
  });

  const total = Object.values(outcomeChance).reduce((sum, value) => sum + value, 0);
  const normalized = {};
  let current = 0;

  Object.keys(outcomeChance).forEach((key) => {
    normalized[key] = { start: current, end: current + (outcomeChance[key] / total) };
    current += outcomeChance[key] / total;
  });

  const finalRoll = Math.random();

  let result = 'out';
  Object.keys(normalized).forEach((key) => {
    if (finalRoll >= normalized[key].start && finalRoll < normalized[key].end) {
      result = key;
    }
  });

  return result;
}

function applyOutcome(result) {
  const xpGain = 15;

  player.atBats += 1;

  switch (result) {
    case 'strikeout':
      player.strikeouts += 1;
      logMessage(`${player.name} struck out.`);
      break;
    case 'walk':
      player.walks += 1;
      logMessage(`${player.name} drew a walk.`);
      break;
    case 'single':
      player.singles += 1;
      logMessage(`${player.name} singles!`);
      break;
    case 'double':
      player.doubles += 1;
      logMessage(`${player.name} doubles!`);
      break;
    case 'triple':
      player.triples += 1;
      logMessage(`${player.name} triples!`);
      break;
    case 'homerun':
      player.homeRuns += 1;
      logMessage(`${player.name} hits a home run!`);
      break;
    default:
      logMessage(`${player.name} makes an out.`);
  }

  awardXP(xpGain);
  updatePlayerDisplay();
}

function createNewPlayer() {
  const name = prompt('Enter player name:', 'Rookie #1');
  if (!name) return;

  player = { ...defaultPlayer, name, team: 'Rookie Squad' };
  logMessage(`${player.name} joins the ${player.team}.`);
  updatePlayerDisplay();
}

function handleActionClick(event) {
  const action = event.currentTarget.dataset.action;

  if (!player.name) {
    logMessage('Create a player first.');
    return;
  }

  const outcome = chooseOutcome(action);
  applyOutcome(outcome);
}

document.getElementById('new-player-btn').addEventListener('click', createNewPlayer);
actionButtons.forEach((button) => {
  button.addEventListener('click', handleActionClick);
});

logMessage('Welcome to Baseball Career Sim. Create your player.');
updatePlayerDisplay();

// Give the default player a start so the screen isn't empty
createNewPlayer();
