const SKILLS = ["contact", "power", "speed", "coordination", "endurance", "iq"];

const state = {
  player: null,
  schedule: [],
  scheduleIndex: 0,
  gameLog: [],
  bonusPoints: 10,
  collegeMode: false,
  draftRound: null
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createPlayer(name, year, team) {
  const player = {
    name: name || "Rookie",
    year,
    team,
    age: 18,
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
    iq: getBaseSkillValue(),
    careerPath: "high-school",
    playoffWins: 0,
    playoffGames: 0,
    playoffRound: 1,
    draftStock: 0,
    draftTier: "Undecided",
    collegeYears: 0,
    organizationLevel: "High School Playoffs",
    signingBonus: 0,
    draftRound: null,
    draftPick: null
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

function advanceSeason() {
  if (!state.player) return;

  state.player.season += 1;
  state.player.skillPoints += 2;
  logMessage(`Season ${state.player.season} begins.`);
  updatePlayerDisplay();
}

function getToolsScore(player) {
  const values = SKILLS.map((skill) => player[skill]);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return (average / 45) * 35;
}

function getPerformanceScore(player) {
  const totalPa = Math.max(1, player.atBats + player.walks + player.singles + player.doubles + player.triples + player.homeRuns);
  const avg = (player.singles + player.doubles + player.triples + player.homeRuns) / totalPa;
  return clamp((avg * 120) + (player.homeRuns * 3) + (player.walks * 0.5) + (player.playoffWins * 4), 0, 45);
}

function getPotentialScore(player) {
  const age = Number(player.age) || 18;
  const room = clamp(15 - ((age - 18) * 1.2), 0, 15);
  return room;
}

function getContextScore(player) {
  let score = 2;
  if (player.playoffWins >= 2) score += 1;
  if (player.homeRuns >= 2) score += 1;
  if (player.playoffRound >= 3) score += 1;
  return clamp(score, 0, 5);
}

function computeDraftStock(player) {
  const performanceScore = getPerformanceScore(player);
  const toolsScore = getToolsScore(player);
  const potentialScore = getPotentialScore(player);
  const contextScore = getContextScore(player);

  return clamp(performanceScore + toolsScore + potentialScore + contextScore, 0, 100);
}

function getDraftTierFromScore(score) {
  if (score >= 90) return "Elite / Top of draft";
  if (score >= 82) return "1st round";
  if (score >= 74) return "Rounds 2–3";
  if (score >= 66) return "Rounds 4–7";
  if (score >= 58) return "Late-round pick";
  if (score >= 50) return "Fringe draft candidate";
  return "Undrafted";
}

function getSigningBonusLabel(score) {
  if (score >= 90) return "$1,500,000+";
  if (score >= 82) return "$600,000–$1,200,000";
  if (score >= 74) return "$250,000–$500,000";
  if (score >= 66) return "$100,000–$250,000";
  if (score >= 58) return "$50,000–$100,000";
  if (score >= 50) return "$20,000–$50,000";
  return "$0–$20,000";
}

function generateDraftResultForTier(score) {
  if (score >= 90) {
    const round = 1;
    const pick = Math.floor(Math.random() * 10) + 1;
    return { round, pick };
  }
  if (score >= 82) {
    const round = Math.floor(Math.random() * 2) + 1;
    const pick = Math.floor(Math.random() * 30) + 1;
    return { round, pick };
  }
  if (score >= 74) {
    const round = Math.floor(Math.random() * 2) + 2;
    const pick = Math.floor(Math.random() * 60) + 1;
    return { round, pick };
  }
  if (score >= 66) {
    const round = Math.floor(Math.random() * 4) + 4;
    const pick = Math.floor(Math.random() * 120) + 1;
    return { round, pick };
  }
  if (score >= 58) {
    const round = Math.floor(Math.random() * 6) + 10;
    const pick = Math.floor(Math.random() * 200) + 1;
    return { round, pick };
  }
  if (score >= 50) {
    const round = Math.floor(Math.random() * 6) + 15;
    const pick = Math.floor(Math.random() * 200) + 1;
    return { round, pick };
  }
  return { round: null, pick: null };
}

function evaluateDraftStock() {
  if (!state.player) return;

  const player = state.player;
  player.draftStock = computeDraftStock(player);
  player.draftTier = getDraftTierFromScore(player.draftStock);
  player.careerPath = "draft-evaluation";
  player.organizationLevel = "Draft Decision";

  const draftResult = generateDraftResultForTier(player.draftStock);
  player.draftRound = draftResult.round;
  player.draftPick = draftResult.pick;
  player.signingBonus = getSigningBonusLabel(player.draftStock);

  logMessage(`${player.name}'s draft stock is ${player.draftStock.toFixed(1)} (${player.draftTier}).`);
  logMessage(`${player.name} is projected to land around ${draftResult.round ? `Round ${draftResult.round}` : "undrafted"}.`);
  showDraftDecisionPanel();
  updatePlayerDisplay();
}

function showDraftDecisionPanel() {
  const panel = document.getElementById("draft-panel");
  const summary = document.getElementById("draft-summary");
  if (!panel || !summary || !state.player) return;

  const player = state.player;
  summary.innerHTML = `
    <div><strong>${player.name}</strong> is projected as a <strong>${player.draftTier}</strong> talent.</div>
    <div>Draft Stock: <strong>${player.draftStock.toFixed(1)}</strong></div>
    <div>Estimated draft range: <strong>${player.draftRound ? `Round ${player.draftRound}` : "Undrafted"}</strong></div>
    <div>Estimated signing bonus: <strong>${player.signingBonus}</strong></div>
    <div>Decision: sign now or return to college and improve your value.</div>
  `;

  panel.style.display = "block";
}

function chooseCollegePath() {
  if (!state.player) return;

  const player = state.player;
  player.careerPath = "college";
  player.collegeYears = 1;
  player.organizationLevel = "College";
  document.getElementById("draft-panel").style.display = "none";
  logMessage(`${player.name} opts to attend college and develop before turning pro.`);
  updatePlayerDisplay();
}

function signDraftOffer() {
  if (!state.player) return;

  const player = state.player;
  player.careerPath = "professional";
  player.organizationLevel = "Double-A";
  player.season = 1;
  document.getElementById("draft-panel").style.display = "none";
  logMessage(`${player.name} signs and begins the professional path in Double-A.`);
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

function simulateHighSchoolPlayoffGame() {
  if (!state.player) return;

  const player = state.player;
  const gameLength = 4;

  for (let i = 0; i < gameLength; i += 1) {
    const actionPool = ["contact", "power", "walk", "contact"];
    const randomAction = actionPool[Math.floor(Math.random() * actionPool.length)];
    resolveAtBat(randomAction);
  }

  const playerProduction = player.homeRuns * 4 + player.singles + player.doubles * 2 + player.triples * 3 + player.walks;
  const wonGame = playerProduction >= 9 || player.homeRuns >= 2;

  player.playoffGames += 1;
  player.playoffRound += 1;

  if (wonGame) {
    player.playoffWins += 1;
    logMessage(`${player.name} won the playoff game and helped advance the team.`);
  } else {
    logMessage(`${player.name} had a tough playoff game, but his team came up short.`);
  }

  if (player.playoffWins >= 4 || player.playoffGames >= 4) {
    logMessage(`${player.name} finished his high-school playoff run.`);
    evaluateDraftStock();
  }

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

  if (state.player.careerPath === "draft-evaluation") {
    logMessage("Draft decision pending. Sign or decline before continuing.");
    return;
  }

  if (state.player.careerPath === "high-school") {
    simulateHighSchoolPlayoffGame();
    return;
  }

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
    <div><strong>Age:</strong> ${player.age}</div>
    <div><strong>Team:</strong> ${player.team}</div>
    <div><strong>Path:</strong> ${player.careerPath}</div>
    <div><strong>Organization:</strong> ${player.organizationLevel}</div>
    <div><strong>Year:</strong> ${player.year}</div>
    <div><strong>Season:</strong> ${player.season}</div>
    <div><strong>Level:</strong> ${player.level}</div>
    <div><strong>XP:</strong> ${player.xp}/100</div>
    <div><strong>Draft Stock:</strong> ${player.draftStock ? player.draftStock.toFixed(1) : "N/A"}</div>
    <div><strong>Draft Tier:</strong> ${player.draftTier || "Not evaluated yet"}</div>
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
    <div><strong>Playoff games:</strong> ${player.playoffGames}</div>
    <div><strong>Playoff wins:</strong> ${player.playoffWins}</div>
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
  player.careerPath = "high-school";
  player.organizationLevel = "High School Playoffs";
  loadScheduleForYear(player.year, player.team);
  document.getElementById("character-creation-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  document.getElementById("next-game-btn").style.display = "inline-block";
  document.getElementById("end-season-btn").style.display = "inline-block";
  document.getElementById("skill-upgrade-panel").style.display = "block";
  document.getElementById("draft-panel").style.display = "none";
  logMessage(`${player.name} enters his senior playoff run at age 18.`);
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
      if (state.player.careerPath === "draft-evaluation") {
        logMessage("Draft decision pending. Sign or decline before playing more.");
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
      if (state.player && state.player.careerPath === "high-school") {
        evaluateDraftStock();
        logMessage("High-school playoff evaluation complete.");
        return;
      }
      advanceSeason();
      logMessage("Season ended. Prepare for next year.");
    });
  }

  const collegeBtn = document.getElementById("go-college-btn");
  if (collegeBtn) {
    collegeBtn.addEventListener("click", chooseCollegePath);
  }

  const signDraftBtn = document.getElementById("sign-draft-btn");
  if (signDraftBtn) {
    signDraftBtn.addEventListener("click", signDraftOffer);
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
