const workoutsData = {
  upper: {
    title: 'Upper Body Workout',
    exercises: [
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
    ]
  },
  lower: {
    title: 'Lower Body Workout',
    exercises: [
      {
        id: 'lower1',
        title: '1. Dumbbell Romanian Deadlift (RDL)',
        desc: '8-10 reps. 3-sec lowering phase. Eccentric overload for hamstrings.',
        sets: 3
      },
      {
        id: 'lower2',
        title: '2. Dumbbell Reverse Lunges',
        desc: '8-10 reps/leg. Controlled step back, explosive drive up. Unilateral stability.',
        sets: 3
      },
      {
        id: 'lower3',
        title: '3. Weighted Glute Bridges',
        desc: '12-15 reps. 2-sec hold at top. Pure hip extension. Wakes up the glutes.',
        sets: 3
      }
    ]
  }
};

let currentWorkoutId = null;
let currentWorkoutData = null;
let totalSets = 0;
let checkedSetsCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Hooks
  document.getElementById('btn-workouts').addEventListener('click', () => showView('view-selection'));
  document.getElementById('btn-history').addEventListener('click', () => {
    renderHistory();
    showView('view-history');
  });
  
  document.querySelectorAll('.nav-back').forEach(btn => {
    btn.addEventListener('click', (e) => {
      showView(e.target.dataset.target);
    });
  });

  document.querySelectorAll('.btn-workout-select').forEach(btn => {
    btn.addEventListener('click', (e) => {
      startWorkout(e.target.dataset.workout);
    });
  });
  
  document.getElementById('finish-btn').addEventListener('click', finishWorkout);
  document.getElementById('reset-btn').addEventListener('click', resetWorkoutConfirm);
  document.getElementById('clear-history-btn').addEventListener('click', clearHistory);

  // Auto-restore last session
  const savedState = localStorage.getItem('currentSession');
  if (savedState) {
    const data = JSON.parse(savedState);
    if(data.workoutId) {
      startWorkout(data.workoutId, false);
      loadProgress();
    }
  } else {
    showView('view-menu');
  }
});

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById(viewId).classList.remove('hidden');
}

function startWorkout(workoutId, saveNewSession = true) {
  currentWorkoutId = workoutId;
  currentWorkoutData = workoutsData[workoutId];
  totalSets = currentWorkoutData.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  checkedSetsCount = 0;

  document.getElementById('workout-title').innerText = currentWorkoutData.title;
  
  renderExercises();
  updateProgressUI();
  showView('view-workout');
  
  if (saveNewSession) {
    localStorage.removeItem('workoutProgress');
    localStorage.setItem('currentSession', JSON.stringify({ workoutId }));
    checkFinishButton();
  }
}

function renderExercises() {
  const container = document.getElementById('exercise-list');
  container.innerHTML = '';

  currentWorkoutData.exercises.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.id = `card-${ex.id}`;
    
    const header = document.createElement('div');
    header.className = 'exercise-header';
    header.innerHTML = `
      <div class="exercise-title">
        <span>${ex.title}</span>
        <span class="status-badge">DONE</span>
      </div>
      <div class="exercise-desc">${ex.desc}</div>
    `;

    const setsContainer = document.createElement('div');
    setsContainer.className = 'sets-container';
    
    setsContainer.innerHTML = `
      <div class="set-header-row">
        <span>Set</span>
        <span>Lbs</span>
        <span>Reps</span>
        <span>Done</span>
      </div>
    `;

    for (let i = 0; i < ex.sets; i++) {
      const setRow = document.createElement('div');
      setRow.className = 'set-row';

      const setNum = document.createElement('span');
      setNum.className = 'set-number';
      setNum.innerText = i + 1;

      const weightInput = document.createElement('input');
      weightInput.type = 'number';
      weightInput.inputMode = 'decimal';
      weightInput.pattern = '[0-9]*';
      weightInput.className = 'set-input weight-input';
      weightInput.placeholder = '0';
      weightInput.dataset.exercise = ex.id;
      weightInput.dataset.setIndex = i;
      weightInput.addEventListener('change', saveProgress);

      const repsInput = document.createElement('input');
      repsInput.type = 'number';
      repsInput.inputMode = 'numeric';
      repsInput.pattern = '[0-9]*';
      repsInput.className = 'set-input reps-input';
      repsInput.placeholder = '0';
      repsInput.dataset.exercise = ex.id;
      repsInput.dataset.setIndex = i;
      repsInput.addEventListener('change', saveProgress);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'set-checkbox';
      checkbox.dataset.exercise = ex.id;
      checkbox.dataset.setIndex = i;
      checkbox.addEventListener('change', handleSetChange);

      setRow.appendChild(setNum);
      setRow.appendChild(weightInput);
      setRow.appendChild(repsInput);
      setRow.appendChild(checkbox);
      
      setsContainer.appendChild(setRow);
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
  checkFinishButton();
}

function updateCardStatus(exId) {
  const card = document.getElementById(`card-${exId}`);
  if(!card) return;
  const checkboxes = card.querySelectorAll('.set-checkbox');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  
  if (allChecked) card.classList.add('completed');
  else card.classList.remove('completed');
}

function updateProgressUI() {
  if (totalSets === 0) return;
  const progressRatio = checkedSetsCount / totalSets;
  const progressPct = Math.round(progressRatio * 100);
  
  document.getElementById('progress-bar').style.width = `${progressPct}%`;
  
  const ring = document.getElementById('progress-circle');
  const offset = 164 - (progressRatio * 164);
  ring.style.strokeDashoffset = offset;
  
  document.getElementById('progress-text').innerText = `${progressPct}%`;
}

function checkFinishButton() {
  const fb = document.getElementById('finish-btn');
  if (checkedSetsCount === totalSets && totalSets > 0) {
    fb.classList.remove('hidden');
  } else {
    fb.classList.add('hidden');
  }
}

function saveProgress() {
  const state = [];
  document.querySelectorAll('.set-row').forEach(row => {
    state.push({
      checked: row.querySelector('.set-checkbox').checked,
      weight: row.querySelector('.weight-input').value,
      reps: row.querySelector('.reps-input').value
    });
  });
  localStorage.setItem('workoutProgress', JSON.stringify({ state, count: checkedSetsCount }));
}

function loadProgress() {
  const saved = localStorage.getItem('workoutProgress');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      const rows = document.querySelectorAll('.set-row');
      
      data.state.forEach((setObj, i) => {
        if (rows[i]) {
          const isObj = typeof setObj === 'object' && setObj !== null;
          rows[i].querySelector('.set-checkbox').checked = isObj ? setObj.checked : setObj;
          if (isObj && setObj.weight) rows[i].querySelector('.weight-input').value = setObj.weight;
          if (isObj && setObj.reps) rows[i].querySelector('.reps-input').value = setObj.reps;
        }
      });
      
      checkedSetsCount = data.count || 0;
      currentWorkoutData.exercises.forEach(ex => updateCardStatus(ex.id));
      updateProgressUI();
      checkFinishButton();
    } catch (e) {
      console.error('Failed to load progress', e);
    }
  }
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function finishWorkout() {
  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
  
  let csvContent = "Exercise,Set,Weight,Reps\n";
  document.querySelectorAll('.exercise-card').forEach(card => {
    const exTitle = card.querySelector('.exercise-title span').innerText.replace(/,/g, '');
    card.querySelectorAll('.set-row').forEach(row => {
      const setNum = row.querySelector('.set-number').innerText;
      const weight = row.querySelector('.weight-input').value || 0;
      const reps = row.querySelector('.reps-input').value || 0;
      csvContent += `${exTitle},${setNum},${weight},${reps}\n`;
    });
  });

  const entry = {
    date: dateStr,
    title: currentWorkoutData.title,
    timestamp: Date.now(),
    csv: csvContent
  };
  
  const hist = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
  hist.unshift(entry);
  localStorage.setItem('workoutHistory', JSON.stringify(hist));
  
  localStorage.removeItem('workoutProgress');
  localStorage.removeItem('currentSession');
  
  downloadCSV(csvContent, `${currentWorkoutData.title.replace(/\s+/g, '_')}_${Date.now()}.csv`);
  
  alert('Workout Completed & CSV Downloaded! Saved to History.');
  showView('view-menu');
}

function resetWorkoutConfirm() {
  if(confirm('Are you sure you want to reset your workout progress?')) {
    localStorage.removeItem('workoutProgress');
    checkedSetsCount = 0;
    document.querySelectorAll('.set-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.weight-input').forEach(input => input.value = '');
    document.querySelectorAll('.reps-input').forEach(input => input.value = '');
    document.querySelectorAll('.exercise-card').forEach(card => card.classList.remove('completed'));
    updateProgressUI();
    checkFinishButton();
  }
}

window.downloadPastCSV = function(timestamp) {
  const hist = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
  const entry = hist.find(e => e.timestamp === timestamp);
  if (entry && entry.csv) {
    downloadCSV(entry.csv, `${entry.title.replace(/\s+/g, '_')}_${entry.timestamp}.csv`);
  }
};

function renderHistory() {
  const container = document.getElementById('history-list');
  const hist = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
  
  if(hist.length === 0) {
    container.innerHTML = '<p class="empty-state">No workouts completed yet.</p>';
    return;
  }
  
  container.innerHTML = hist.map(item => `
    <div class="history-item flex-between">
      <div>
        <div class="history-title">${item.title}</div>
        <div class="history-date">${item.date}</div>
      </div>
      ${item.csv ? `<button class="glass-btn dl-csv-btn" onclick="downloadPastCSV(${item.timestamp})">CSV</button>` : ''}
    </div>
  `).join('');
}

function clearHistory() {
  if(confirm('Are you sure you want to clear all history?')) {
    localStorage.removeItem('workoutHistory');
    renderHistory();
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
