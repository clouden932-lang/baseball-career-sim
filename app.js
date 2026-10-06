const SKILLS = ["contact", "power", "speed", "coordination", "endurance", "iq"];

const SIDE_MISSIONS = [
  {
    id: "batting-cage",
    title: "Batting Cage Work",
    description: "Work on swing decisions against live-speed pitches.",
    focus: "contact",
    difficulty: 1,
    xpReward: 3,
    statBonus: "contact"
  },
  {
    id: "speed-drills",
    title: "Base Running Drills",
    description: "Sharpen first-step burst and base awareness.",
    focus: "speed",
    difficulty: 2,
    xpReward: 5,
    statBonus: "speed"
  },
  {
    id: "film-room",
    title: "Film Review",
    description: "Break down pitch selection and approach.",
    focus: "iq",
    difficulty: 2,
    xpReward: 5,
    statBonus: "iq"
  },
  {
    id: "conditioning",
    title: "Conditioning Block",
    description: "Push stamina and durability limits.",
    focus: "endurance",
    difficulty: 2,
    xpReward: 5,
    statBonus: "endurance"
  },
  {
    id: "power-session",
    title: "Power Development",
    description: "Work on bat speed and launch angle.",
    focus: "power",
    difficulty: 3,
    xpReward: 8,
    statBonus: "power"
  },
  {
    id: "coordination-work",
    title: "Coordination Drills",
    description: "Improve hand-eye rhythm and timing consistency.",
    focus: "coordination",
    difficulty: 2,
    xpReward: 5,
    statBonus: "coordination"
  }
];

const TRIVIA = [
  "Contact is often the most valuable everyday skill for a young hitter.",
  "Elite speed can change how often a player reaches base without a hit.",
  "Power is useful, but plate discipline and contact create consistency.",
  "A disciplined approach often matters more than raw power in the draft process.",
  "The best prospect profiles often blend contact and IQ before pure power."
];

const COLLEGE_SCHOOLS = [
  {
    key: "northern-state",
    name: "Northern State U",
    tag: "Analytical baseball IQ",
    bonus: { iq: 2, coordination: 1 },
    draftBonus: 5,
    summary: "A high-academic program that rewards discipline and game understanding."
  },
  {
    key: "central-u",
    name: "Central U",
    tag: "Speed-first development",
    bonus: { speed: 2, endurance: 1 },
    draftBonus: 5,
    summary: "Built for athletes who thrive in chaos and pressure with elite baserunning."
  },
  {
    key: "west-valley-state",
    name: "West Valley State",
    tag: "Contact and plate discipline",
    bonus: { contact: 2, iq: 1 },
    draftBonus: 5,
    summary: "A player-friendly program that turns good hitters into dependable starters."
  },
  {
    key: "south-tech",
    name: "South Tech",
    tag: "Conditioning and stamina",
    bonus: { endurance: 2, power: 1 },
    draftBonus: 5,
    summary: "The program is famous for turning raw talent into durable, everyday contributors."
  },
  {
    key: "riverside-u",
    name: "Riverside U",
    tag: "Defense and coordination",
    bonus: { coordination: 2, speed: 1 },
    draftBonus: 5,
    summary: "A balanced school with a premium on smooth defensive play and athleticism."
  },
  {
    key: "midwest-tech",
    name: "Midwest Tech",
    tag: "Power development",
    bonus: { power: 2, contact: 1 },
    draftBonus: 6,
    summary: "A slugger factory that raises raw power into true draft-level threats."
  }
];

const state = {
  player: null,
  schedule: [],
  scheduleIndex: 0,
  gameLog: [],
  bonusPoints: 10,
  selectedCollege: null,
  missionOptions: []
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

function getGamesPerSeasonForPlayer(player = state.player) {
  if (!player) return 0;

  if (player.careerPath === "high-school") return 10;
  if (player.careerPath === "college") return 40;
  if (player.organizationLevel === "Double-A") return 40;
  if (player.organizationLevel === "Triple-A") return 80;
  if (player.careerPath === "professional") return 160;

  return 40;
}

function createPlayer(name, year, team) {
  const player = {
    name: name || "Rookie",
    year,
    team,
    season: 1,
    age: 18,
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
    college: null,
    draftStock: 0,
    draftTier: "Undecided",
    collegeBonus: 0,
    organizationLevel: "High School Playoffs"
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

function getDraftTier(score) {
  if (score >= 90) return "Elite / Top 5";
  if (score >= 80) return "1st Round";
  if (score >= 70) return "Day 2";
  if (score >= 60) return "Late Round";
  return "Undrafted";
}

function evaluateDraftStock(player = state.player) {
  if (!player) return 0;

  const weights = {
    contact: 1.7,
    iq: 1.5,
    power: 1.5,
    speed: 1.2,
    coordination: 1.1,
    endurance: 1.0
  };

  const weightedSkillScore = Object.entries(weights).reduce((sum, [skill, weight]) => {
    return sum + player[skill] * weight;
  }, 25);

  const seasonBoost = Math.max(0, player.season - 1) * 3;
  const schoolBoost = player.collegeBonus || 0;

  return Math.round(weightedSkillScore + seasonBoost + schoolBoost);
}

function renderCollegeSelection() {
  const panel = document.getElementById("college-selection-panel");
  if (!panel) return;

  panel.innerHTML = `
    <h2>College Decision</h2>
    <div class="college-grid">
      ${COLLEGE_SCHOOLS.map((school) => `
        <button class="college-choice-btn" data-school="${school.key}">
          <span class="school-name">${school.name}</span>
          <span class="school-tag">${school.tag}</span>
          <span class="school-summary">${school.summary}</span>
          <span class="school-bonus">Bonus: +${school.draftBonus} draft stock</span>
        </button>
      `).join("")}
    </div>
  `;

  panel.querySelectorAll(".college-choice-btn").forEach((button) => {
    button.addEventListener("click", () => {
      chooseCollegeSchool(button.dataset.school);
    });
  });
}

function chooseCollegeSchool(schoolKey) {
  if (!state.player) return;

  const school = COLLEGE_SCHOOLS.find((entry) => entry.key === schoolKey);
  if (!school) return;

  state.player.college = school.name;
  state.player.collegeBonus = school.draftBonus;
  state.selectedCollege = school;

  Object.keys(school.bonus).forEach((skill) => {
    if (state.player[skill] !== undefined) {
      state.player[skill] += school.bonus[skill];
    }
  });

  state.player.draftStock = evaluateDraftStock(state.player);
  state.player.draftTier = getDraftTier(state.player.draftStock);
  state.player.careerPath = "college";
  state.player.organizationLevel = "College";

  logMessage(`${state.player.name} committed to ${school.name}. ${school.tag}.`);
  logMessage(`${state.player.name}'s draft stock rises to ${state.player.draftStock} (${state.player.draftTier}).`);

  const panel = document.getElementById("college-selection-panel");
  if (panel) {
    panel.innerHTML = `
      <h2>College Decision</h2>
      <div class="college-choice-confirmation">
        <strong>${school.name}</strong>
        <span>Draft stock: ${state.player.draftStock}</span>
        <span>Tier: ${state.player.draftTier}</span>
      </div>
    `;
  }

  updatePlayerDisplay();
}

function generateSideMissionOptions() {
  const shuffled = [...SIDE_MISSIONS].sort(() => Math.random() - 0.5);
  state.missionOptions = shuffled.slice(0, 3);
  renderSideMissions();
}

function renderSideMissions() {
  const panel = document.getElementById("side-missions-panel");
  if (!panel) return;

  if (!state.missionOptions.length) {
    panel.innerHTML = "<h2>Side Missions</h2><p>No missions available yet.</p>";
    return;
  }

  panel.innerHTML = `
    <h2>Side Missions</h2>
    <div class="mission-grid">
      ${state.missionOptions.map((mission) => `
        <div class="mission-card">
          <div class="mission-title">${mission.title}</div>
          <div class="mission-focus">Focus: ${mission.focus}</div>
          <div class="mission-description">${mission.description}</div>
          <div class="mission-reward">Reward: +${mission.xpReward} XP</div>
          <button class="mission-btn" data-mission-id="${mission.id}">Take Mission</button>
        </div>
      `).join("")}
    </div>
  `;

  panel.querySelectorAll(".mission-btn").forEach((button) => {
    button.addEventListener("click", () => completeSideMission(button.dataset.missionId));
  });
}

function completeSideMission(missionId) {
  if (!state.player) return;

  const mission = state.missionOptions.find((entry) => entry.id === missionId);
  if (!mission) return;

  state.player.xp += mission.xpReward;

  if (state.player[mission.statBonus] !== undefined) {
    state.player[mission.statBonus] += 1;
  }

  while (state.player.xp >= 100) {
    state.player.xp -= 100;
    state.player.level += 1;
    state.player.skillPoints += 1;
  }

  state.missionOptions = state.missionOptions.filter((entry) => entry.id !== missionId);
  logMessage(`${state.player.name} completed: ${mission.title} (+${mission.xpReward} XP).`);
  awardTrivia();
  renderSideMissions();
  updatePlayerDisplay();
}

function awardTrivia() {
  const fact = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
  logMessage(`Trivia: ${fact}`);
}

function chooseCollegePath() {
  if (!state.player) return;

  const draftPanel = document.getElementById("draft-panel");
  if (draftPanel) {
    draftPanel.style.display = "none";
  }

  const collegePanel = document.getElementById("college-selection-panel");
  if (collegePanel) {
    renderCollegeSelection();
    collegePanel.style.display = "block";
  }

  logMessage(`${state.player.name} evaluates college offers.`);
}

function signDraftOffer() {
  if (!state.player) return;

  const player = state.player;
  player.careerPath = "professional";
  player.organizationLevel = "Double-A";
  player.season = 1;

  const draftPanel = document.getElementById("draft-panel");
  if (draftPanel) {
    draftPanel.style.display = "none";
  }

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

  player.gamesPlayed += 1;

  if (wonGame) {
    logMessage(`${player.name} won the playoff game and helped advance the team.`);
  } else {
    logMessage(`${player.name} had a tough playoff game, but his team came up short.`);
  }

  state.player.draftStock = evaluateDraftStock(state.player);
  state.player.draftTier = getDraftTier(state.player.draftStock);
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

  if (state.player.careerPath === "college") {
    logMessage(`${state.player.name} is playing at ${state.player.college}.`);
    return;
  }

  const seasonLength = getGamesPerSeasonForPlayer(state.player);
  if (state.player.gamesPlayed >= seasonLength) {
    logMessage(`${state.player.name} has finished the season. Side missions are now available.`);
    generateSideMissionOptions();
    return;
  }

  if (state.scheduleIndex >= state.schedule.length) {
    logMessage("Season complete. End of schedule.");
    generateSideMissionOptions();
    return;
  }

  const game = state.schedule[state.scheduleIndex];
  state.scheduleIndex += 1;
  state.player.gamesPlayed += 1;

  logMessage(`Game ${state.player.gamesPlayed}: vs ${game.opponent} (${game.home ? "Home" : "Away"})`);
  updatePlayerDisplay();
}

function showDraftDecisionPanel() {
  const panel = document.getElementById("draft-panel");
  const summary = document.getElementById("draft-summary");
  if (!panel || !summary || !state.player) return;

  const player = state.player;
  player.careerPath = "draft-evaluation";
  player.organizationLevel = "Draft Decision";

  player.draftStock = evaluateDraftStock(player);
  player.draftTier = getDraftTier(player.draftStock);

  summary.innerHTML = `
    <div><strong>${player.name}</strong> is projected as a <strong>${player.draftTier}</strong> talent.</div>
    <div>Draft Stock: <strong>${player.draftStock}</strong></div>
    <div>Decision: sign now or choose a college program that fits your style.</div>
  `;

  panel.style.display = "block";
}

function updatePlayerDisplay() {
  const player = state.player;
  const playerInfoEl = document.getElementById("player-info");
  const seasonDetailsEl = document.getElementById("season-details");
  if (!player || !playerInfoEl || !seasonDetailsEl) return;

  player.draftStock = evaluateDraftStock(player);
  player.draftTier = getDraftTier(player.draftStock);

  playerInfoEl.innerHTML = `
    <div><strong>Name:</strong> ${player.name}</div>
    <div><strong>Age:</strong> ${player.age}</div>
    <div><strong>Year:</strong> ${player.year}</div>
    <div><strong>Team:</strong> ${player.team}</div>
    <div><strong>Path:</strong> ${player.careerPath}</div>
    <div><strong>College:</strong> ${player.college || "Undecided"}</div>
    <div><strong>Organization:</strong> ${player.organizationLevel}</div>
    <div><strong>Season:</strong> ${player.season}</div>
    <div><strong>Level:</strong> ${player.level}</div>
    <div><strong>Draft Stock:</strong> ${player.draftStock}</div>
    <div><strong>Draft Tier:</strong> ${player.draftTier}</div>
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
    <div><strong>Games played this season:</strong> ${player.gamesPlayed}</div>
    <div><strong>Singes:</strong> ${player.singles}</div>
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
  document.getElementById("college-selection-panel").style.display = "none";
  player.draftStock = evaluateDraftStock(player);
  player.draftTier = getDraftTier(player.draftStock);
  logMessage(`${player.name} enters his senior playoff run at age 18.`);
  logMessage(`Draft stock is ${player.draftStock} (${player.draftTier}). Choose the right path.`);
  updatePlayerDisplay();
  generateSideMissionOptions();
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
        showDraftDecisionPanel();
        logMessage("High-school playoff draft evaluation complete.");
        return;
      }
      advanceSeason();
      logMessage("Season ended. Prepare for next year.");
      generateSideMissionOptions();
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
  renderSideMissions();
  renderCollegeSelection();
  document.getElementById("college-selection-panel").style.display = "none";
  logMessage("Welcome to Baseball Career Sim. Start by creating your player.");
});
