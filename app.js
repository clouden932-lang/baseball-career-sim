const SKILLS = ["contact", "power", "speed", "coordination", "endurance", "iq"];

const state = {
  player: null,
  schedule: [],
  scheduleIndex: 0,
  gameLog: [],
  bonusPoints: 10
};

function logMessage(message) {
  state.gameLog.unshift(message);
  const logEl = document.getElementById("log");
  if (!logEl) return;
  logEl.innerHTML = state.gameLog
    .slice(0, 20)
    .map((entry) => `<div class="log-entry">${entry}</div>`)
    .join("");
}

function getBaseSkillValue() {
  return 5;
}

function updateBonusPointsDisplay() {
  const bonusPointsEl = document.getElementById("bonus-points-left");
  if (bonusPointsEl) {
    bonusPointsEl.textContent = state.bonusPoints;
  }
}

function resetBonusPoints() {
  state.bonusPoints = 10;
  updateBonusPointsDisplay();
}

function createPlayer(name, year, team) {
  const player = {
    name: name || "Rookie",
    year,
    team,
    season: 1,
    level: 1,
    xp: 0,
    skillPoints: 0,
    freePoints: 0,
    gamesPlayed: 0,
    atBats: 0,
    homeRuns: 0,
    singles: 0,
    doubles: 0,
    triples: 0,
    strikeouts: 0,
    walks: 0,
    contact: getBaseSkillValue(),
    power: getBaseSkillValue(),
    speed: getBaseSkillValue(),
    coordination: getBaseSkillValue(),
    endurance: getBaseSkillValue(),
    iq: getBaseSkillValue()
  };

  state.player = player;
  return player;
}

function setPlayerFromCreation() {
  const nameInput = document.getElementById("player-name-input");
  const yearSelect = document.getElementById("year-select");
  const teamSelect = document.getElementById("team-select");

  const name = nameInput.value.trim() || "Rookie";
  const year = yearSelect.value;
  const team = teamSelect.value;

  const player = createPlayer(name, year, team);

  SKILLS.forEach((skillName) => {
    const valueEl = document.getElementById(`${skillName}-value`);
    if (!valueEl) return;
    const assignedBonus = Number(valueEl.textContent) || 5;
    player[skillName] = assignedBonus;
  });

  player.freePoints = 0;
  player.skillPoints = 0;
  state.bonusPoints = 0;
  updateBonusPointsDisplay();

  return player;
}

function awardXP(amount) {
  if (!state.player) return;

  state.player.xp += amount;

  while (state.player.xp >= 100) {
    state.player.xp -= 100;
    state.player.level += 1;
    state.player.skillPoints += 1;
    logMessage(`${state.player.name} leveled up to ${state.player.level}!`);
  }

  updatePlayerDisplay();
}

function allocateSkill(skillName) {
  if (!state.player) return;

  if (state.bonusPoints <= 0) {
    logMessage("No bonus points left.");
    return;
  }

  state.player[skillName] += 1;
  state.bonusPoints -= 1;
  updateBonusPointsDisplay();
  updatePlayerDisplay();
  logMessage(`${state.player.name} increased ${skillName} to ${state.player[skillName]}.`);
}

function advanceSeason() {
  if (!state.player) return;

  state.player.season += 1;
  state.player.skillPoints += 2;
  logMessage(`Season ${state.player.season} begins.`);
  updatePlayerDisplay();
}

function chooseOutcome(action) {
  if (!state.player) return "out";

  const player = state.player;
  let weights = {
    strikeout: 0.21,
    walk: 0.1,
    single: 0.24,
    double: 0.13,
    triple: 0.07,
    homerun: 0.08,
    out: 0.17
  };

  if (action === "power") {
    weights.homerun += 0.08;
    weights.single -= 0.03;
    weights.strikeout += 0.04;
  }

  if (action === "contact") {
    weights.single += 0.08;
    weights.double += 0.04;
    weights.strikeout -= 0.03;
  }

  if (action === "bunt") {
    weights.single += 0.1;
    weights.out += 0.08;
  }

  if (action === "walk") {
    weights.walk += 0.12;
    weights.strikeout -= 0.04;
  }

  if (player.contact > 5) weights.single += (player.contact - 5) * 0.005;
  if (player.power > 5) weights.homerun += (player.power - 5) * 0.005;
  if (player.speed > 5) weights.triple += (player.speed - 5) * 0.004;
  if (player.coordination > 5) weights.strikeout -= (player.coordination - 5) * 0.004;
  if (player.iq > 5) weights.walk += (player.iq - 5) * 0.004;

  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  let roll = Math.random() * total;
  let current = 0;

  const orderedKeys = Object.keys(weights);
  for (const key of orderedKeys) {
    current += weights[key];
    if (roll <= current) {
      return key;
    }
  }

  return "out";
}

function resolveAtBat(action) {
  if (!state.player) return;

  const result = chooseOutcome(action);
  const player = state.player;
  player.atBats += 1;

  switch (result) {
    case "strikeout":
      player.strikeouts += 1;
      logMessage(`${player.name} struck out.`);
      break;
    case "walk":
      player.walks += 1;
      logMessage(`${player.name} drew a walk.`);
      break;
    case "single":
      player.singles += 1;
      logMessage(`${player.name} singled.`);
      break;
    case "double":
      player.doubles += 1;
      logMessage(`${player.name} doubled.`);
      break;
    case "triple":
      player.triples += 1;
      logMessage(`${player.name} tripled.`);
      break;
    case "homerun":
      player.homeRuns += 1;
      logMessage(`${player.name} hit a home run!`);
      break;
    default:
      logMessage(`${player.name} made an out.`);
      break;
  }

  awardXP(15);
  updatePlayerDisplay();
}

function loadScheduleForYear(year, team) {
  const scheduleLookup = window.MLB_SCHEDULES || {};
  const yearSchedule = scheduleLookup[String(year)] || {};
  const teamSchedule = yearSchedule[team] || [
    { date: "2024-04-01", opponent: "Boston Red Sox", home: true },
    { date: "2024-04-03", opponent: "Toronto Blue Jays", home: false },
    { date: "2024-04-05", opponent: "Tampa Bay Rays", home: true }
  ];

  state.schedule = teamSchedule;
  state.scheduleIndex = 0;
  logMessage(`Loaded ${teamSchedule.length}-game schedule for ${team} in ${year}.`);
}

function nextGame() {
  if (!state.player) return;

  if (state.scheduleIndex >= state.schedule.length) {
    logMessage("Season complete. End of schedule.");
    return;
  }

  const game = state.schedule[state.scheduleIndex];
  state.scheduleIndex += 1;
  state.player.gamesPlayed += 1;

  logMessage(`Game ${state.player.gamesPlayed}: vs ${game.opponent} (${game.home ? "Home" : "Away"})`);
  updatePlayerDisplay();
}

function updatePlayerDisplay() {
  const player = state.player;
  const playerInfoEl = document.getElementById("player-info");
  const seasonDetailsEl = document.getElementById("season-details");
  if (!player || !playerInfoEl || !seasonDetailsEl) return;

  playerInfoEl.innerHTML = `
    <div><strong>Name:</strong> ${player.name}</div>
    <div><strong>Team:</strong> ${player.team}</div>
    <div><strong>Year:</strong> ${player.year}</div>
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

  seasonDetailsEl.innerHTML = `
    <div><strong>Games played:</strong> ${player.gamesPlayed}</div>
    <div><strong>Singles:</strong> ${player.singles}</div>
    <div><strong>Doubles:</strong> ${player.doubles}</div>
    <div><strong>Triples:</strong> ${player.triples}</div>
    <div><strong>Walks:</strong> ${player.walks}</div>
    <div><strong>Strikeouts:</strong> ${player.strikeouts}</div>
  `;

  const skillPointEl = document.getElementById("skill-points-display");
  if (skillPointEl) {
    skillPointEl.textContent = `Skill Points Available: ${player.skillPoints}`;
  }
}

function bindSkillButtons() {
  const skillButtons = document.querySelectorAll(".skill-btn");
  skillButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const skillName = button.dataset.skill;
      const valueEl = document.getElementById(`${skillName}-value`);

      if (!valueEl) return;
      if (state.bonusPoints <= 0) {
        logMessage("No bonus points left to spend.");
        return;
      }

      const currentValue = Number(valueEl.textContent) || 5;
      valueEl.textContent = currentValue + 1;
      state.bonusPoints -= 1;
      updateBonusPointsDisplay();
      logMessage(`${skillName} raised to ${currentValue + 1}.`);
    });
  });

  const skillUpgradeButtons = document.querySelectorAll(".skill-upgrade-btn");
  skillUpgradeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.player) return;
      const skillName = button.dataset.skill;
      if (state.player.skillPoints <= 0) {
        logMessage("No skill points available.");
        return;
      }
      state.player[skillName] += 1;
      state.player.skillPoints -= 1;
      updatePlayerDisplay();
      logMessage(`${state.player.name} increased ${skillName} to ${state.player[skillName]}.`);
    });
  });
}

function startCareer() {
  const player = setPlayerFromCreation();
  loadScheduleForYear(player.year, player.team);
  document.getElementById("character-creation-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("next-game-btn").style.display = "inline-block";
  document.getElementById("end-season-btn").style.display = "inline-block";
  document.getElementById("skill-upgrade-panel").style.display = "block";
  logMessage(`${player.name} is ready to play for the ${player.team}.`);
  updatePlayerDisplay();
}

function bindControls() {
  const newPlayerBtn = document.getElementById("new-player-btn");
  if (newPlayerBtn) {
    newPlayerBtn.addEventListener("click", () => {
      document.getElementById("character-creation-screen").style.display = "block";
      document.getElementById("game-screen").style.display = "none";
      resetBonusPoints();
      logMessage("Create a new player.");
    });
  }

  const startButton = document.getElementById("start-career-btn");
  if (startButton) {
    startButton.addEventListener("click", startCareer);
  }

  const actionButtons = document.querySelectorAll(".action-btn");
  actionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.player) {
        logMessage("Create a player first.");
        return;
      }
      const action = button.dataset.action;
      resolveAtBat(action);
    });
  });

  const nextGameBtn = document.getElementById("next-game-btn");
  if (nextGameBtn) {
    nextGameBtn.addEventListener("click", nextGame);
  }

  const endSeasonBtn = document.getElementById("end-season-btn");
  if (endSeasonBtn) {
    endSeasonBtn.addEventListener("click", () => {
      advanceSeason();
      logMessage("Season ended. Prepare for next year.");
    });
  }
}

function initializeSkillValues() {
  const skillMap = ["contact", "power", "speed", "coordination", "endurance", "iq"];
  skillMap.forEach((skill) => {
    const el = document.getElementById(`${skill}-value`);
    if (el) {
      el.textContent = "5";
    }
  });
  updateBonusPointsDisplay();
}

document.addEventListener("DOMContentLoaded", () => {
  initializeSkillValues();
  bindSkillButtons();
  bindControls();
  resetBonusPoints();
  logMessage("Welcome to Baseball Career Sim. Start by creating your player.");
});
