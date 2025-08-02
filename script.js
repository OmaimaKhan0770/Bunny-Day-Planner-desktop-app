const form = document.getElementById('activity-form');
const activityInput = document.getElementById('activity');
const timeInput = document.getElementById('time');
const scheduleList = document.getElementById('schedule-list');
const reminderPopup = document.getElementById('reminder-popup');
const reminderMessage = document.getElementById('reminder-message');
const clock = document.getElementById('clock');
const intro = document.getElementById('intro');
const app = document.getElementById('app');

const okBtn = document.getElementById('ok-btn');
const snoozeBtn = document.getElementById('snooze-btn');
const formButtons = document.getElementById('form-buttons');
const audio = document.getElementById('beep-sound');

let currentTimeoutId = null;
let currentItem = null;
let isEditing = false;
let itemBeingEdited = null;

// Hide intro and show app after 3 seconds
setTimeout(() => {
  intro.classList.add('hidden');
  app.classList.remove('hidden');
}, 3000);

// Form submission (Add or Update)
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const activity = activityInput.value.trim();
  const time = timeInput.value;

  if (!activity || !time) return;

  if (isEditing && itemBeingEdited) {
    // Update logic
    itemBeingEdited.activity = activity;
    itemBeingEdited.time = time;
    itemBeingEdited.li.querySelector('span').textContent = `${time} - ${activity}`;
    form.reset();
    isEditing = false;
    itemBeingEdited = null;
    formButtons.innerHTML = `<button type="submit" id="add-btn">Add</button>`;
  } else {
    // Add new activity
    const item = { activity, time };
    addToList(item);
    scheduleReminder(item);
    form.reset();
  }
});

// Add activity to list with edit/delete buttons
function addToList(item) {
  const li = document.createElement('li');
  li.innerHTML = `
  <span>${item.time} - ${item.activity}</span>
  <div class="action-buttons">
    <button class="edit-btn">Edit</button>
    <button class="delete-btn">Delete</button>
  </div>
`;


  item.li = li;

  // Edit
  li.querySelector('.edit-btn').addEventListener('click', () => {
    activityInput.value = item.activity;
    timeInput.value = item.time;
    isEditing = true;
    itemBeingEdited = item;
    formButtons.innerHTML = `<button type="submit" id="update-btn">Update</button>`;
  });

  // Delete
  li.querySelector('.delete-btn').addEventListener('click', () => {
    li.remove();
    if (item === currentItem) {
      clearTimeout(currentTimeoutId);
      currentTimeoutId = null;
    }
  });

  scheduleList.appendChild(li);
}

// Show the reminder popup and play sound
function showReminder(item) {
  audio.play();
  reminderMessage.textContent = `It's time to: ${item.activity}`;
  reminderPopup.classList.remove('hidden');
  currentItem = item;
}

// Schedule reminder (with optional delay in ms)
function scheduleReminder(item, delay = null) {
  const [hours, minutes] = item.time.split(':');
  const now = new Date();
  const target = new Date();

  if (delay !== null) {
    clearTimeout(currentTimeoutId);
    currentTimeoutId = setTimeout(() => showReminder(item), delay);
  } else {
    target.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const timeout = target.getTime() - now.getTime();
    if (timeout > 0) {
      clearTimeout(currentTimeoutId);
      currentTimeoutId = setTimeout(() => showReminder(item), timeout);
    }
  }

  currentItem = item;
}

// OK button: stop sound and hide popup
okBtn.addEventListener('click', () => {
  reminderPopup.classList.add('hidden');
  audio.pause();
  audio.currentTime = 0;
  clearTimeout(currentTimeoutId);
  currentTimeoutId = null;
});

// Snooze: reschedule after 5 minutes
snoozeBtn.addEventListener('click', () => {
  reminderPopup.classList.add('hidden');
  audio.pause();
  audio.currentTime = 0;
  if (currentItem) {
    scheduleReminder(currentItem, 300000); // 5 minutes = 300,000ms
  }
});

// Live clock
function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
