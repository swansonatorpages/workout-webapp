const exercises = [
  {
    id: 'ex1',
    title: 'A. Flat DB/Barbell Bench Press',
    desc: 'Control weight down, explode up. Too easy at 10 reps? Go heavier. (90 sec rest)',
    sets: 3
  },
  {
    id: 'ex2',
    title: 'B. Bent-Over DB/Barbell Rows',
    desc: 'Pull weight to hip crease to engage lats. Squeeze at top.',
    sets: 3
  },
  {
    id: 'ex3',
    title: 'C. Incline Dumbbell Press',
    desc: 'Set bench to 30-deg. Keep continuous tension on upper chest. (60 sec rest)',
    sets: 3
  },
  {
    id: 'ex4',
    title: 'D. Lat Pulldowns (or Pull-ups)',
    desc: 'Full stretch at top. Drive elbows down to the floor.',
    sets: 3
  },
  {
    id: 'ex5',
    title: 'E1. Dumbbell Bicep Curls',
    desc: 'Superset into E2. Keep elbows pinned to sides. (No rest)',
    sets: 3
  },
  {
    id: 'ex6',
    title: 'E2. Overhead Triceps Ext.',
    desc: 'Full lockout at top to maximally contract triceps.',
    sets: 3
  }
];

const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0);
let checkedSetsCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  renderExercises();
  loadProgress();
  updateProgressUI();

  // Reset logic
  document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm('Are you sure you want to reset your workout progress?')) {
      localStorage.removeItem('workoutProgress');
      checkedSetsCount = 0;
      document.querySelectorAll('.set-checkbox').forEach(cb => {
        cb.checked = false;
      });
      document.querySelectorAll('.exercise-card').forEach(card => card.classList.remove('completed'));
      updateProgressUI();
    }
  });
});

function renderExercises() {
  const container = document.getElementById('exercise-list');
  container.innerHTML = '';

  exercises.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.id = `card-${ex.id}`;
    
    // Header section
    const header = document.createElement('div');
    header.className = 'exercise-header';
    header.innerHTML = `
      <div class="exercise-title">
        <span>${ex.title}</span>
        <span class="status-badge">DONE</span>
      </div>
      <div class="exercise-desc">${ex.desc}</div>
    `;

    // Sets container
    const setsContainer = document.createElement('div');
    setsContainer.className = 'sets-container';
    
    for (let i = 0; i < ex.sets; i++) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'set-checkbox';
      checkbox.dataset.exercise = ex.id;
      checkbox.dataset.setIndex = i;
      
      checkbox.addEventListener('change', handleSetChange);
      
      setsContainer.appendChild(checkbox);
    }

    card.appendChild(header);
    card.appendChild(setsContainer);
    container.appendChild(card);
  });
}

function handleSetChange(e) {
  const exId = e.target.dataset.exercise;
  
  const checkboxes = document.querySelectorAll('.set-checkbox');
  checkedSetsCount = Array.from(checkboxes).filter(cb => cb.checked).length;

  updateCardStatus(exId);
  saveProgress();
  updateProgressUI();
}

function updateCardStatus(exId) {
  const card = document.getElementById(`card-${exId}`);
  const checkboxes = card.querySelectorAll('.set-checkbox');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  
  if (allChecked) {
    card.classList.add('completed');
  } else {
    card.classList.remove('completed');
  }
}

function updateProgressUI() {
  const progressRatio = checkedSetsCount / totalSets;
  const progressPct = Math.round(progressRatio * 100);
  
  // Linear Bar Update
  document.getElementById('progress-bar').style.width = `${progressPct}%`;
  
  // Ring Update (stroke-dasharray is 164)
  const ring = document.getElementById('progress-circle');
  const offset = 164 - (progressRatio * 164);
  ring.style.strokeDashoffset = offset;
  
  // Text Update
  document.getElementById('progress-text').innerText = `${progressPct}%`;
}

function saveProgress() {
  const checkboxes = document.querySelectorAll('.set-checkbox');
  const state = Array.from(checkboxes).map(cb => cb.checked);
  localStorage.setItem('workoutProgress', JSON.stringify({ state, count: checkedSetsCount }));
}

function loadProgress() {
  const saved = localStorage.getItem('workoutProgress');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const checkboxes = document.querySelectorAll('.set-checkbox');
      
      data.state.forEach((isChecked, i) => {
        if (checkboxes[i]) {
          checkboxes[i].checked = isChecked;
        }
      });
      
      checkedSetsCount = data.count || 0;
      
      // Update completion classes for all cards
      exercises.forEach(ex => updateCardStatus(ex.id));
    } catch (e) {
      console.error('Failed to load progress', e);
    }
  }
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}
