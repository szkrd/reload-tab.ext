const TIMER_OFF = 0; // the value when the timer is considered disabled
const TIMER_MIN = 1; // minimum allowed value
const MESSAGE_TIMER = 2 * 1000; // until we show the messages below the input field

const messages = {
  success: 'timer set',
  deregisterSuccess: 'timer removed',
  notAllowed: 'no timer allowed for this tab',
  registerError: 'could not register the timer',
  deregisterError: 'could not remove the timer'
};

let $ = s => document.getElementById(s); // poor man's jQuery
let nop = () => {};
let isLocked = false; // lazy ui lock

function lockUi (state) {
  isLocked = state;
  let el = $('submit');
  if (state) {
    el.disabled = 'disabled';
  } else {
    el.removeAttribute('disabled');
  }
}

// show message in the popup for a very short period
function print (s) {
  let el = $('message');
  el.innerHTML = messages[s] ? messages[s] : s;
  lockUi(true);
  setTimeout(() => {
    el.innerHTML = '';
    lockUi(false);
  }, MESSAGE_TIMER);
}

// colorize number input, lock submit button
function setInputStyle () {
  let input = $('timer');
  let value = parseInt(input.value, 10) || 0;
  if (value <= TIMER_OFF) {
    input.classList.add('off');
    input.classList.remove('warning');
  } else if (value > TIMER_OFF && value < TIMER_MIN) {
    input.classList.remove('off');
    input.classList.add('warning');
  } else {
    input.classList.remove('off');
    input.classList.remove('warning');
  }
}

// get current tab with promise, because getSelected was too logical in Chrome-land
function getCurrentTab () {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      let tab = tabs[0];
      if (!tab || typeof tab.id === 'undefined' || (tab.url || '').startsWith('chrome://')) {
        reject('notAllowed');
      }
      resolve(tab);
    });
  });
}

// on submit button clicked
async function onSubmit () {
  if (isLocked) {
    return;
  }
  try {
    let tab = await getCurrentTab();
    let input = $('timer');
    let value = parseInt(input.value, 10) || 0;
    let isDereg = value === TIMER_OFF;
    let tabId = tab.id;
    if (isDereg) {
      chrome.runtime.sendMessage({message: 'deregister', id: tabId}, response => {
        if (response && response.success) {
          print('deregisterSuccess');
        } else {
          print('deregisterError');
        }
      });
    } else {
      chrome.runtime.sendMessage({message: 'register', id: tabId, time: value}, response => {
        if (response && response.success) {
          print('success');
        } else {
          print('registerError');
        }
      });
    }
  } catch (err) {
    print('notAllowed');
  }
}

// timer input value changed
function onTimerInput () {
  setInputStyle();
}

// app
function run () {
  setInputStyle();
  getCurrentTab().then(tab => {
    chrome.runtime.sendMessage({message: 'getReloadCount', id: tab.id}, response => {
      let count = response.count;
      $('reload-count').innerHTML = count;
      $('reload-count-info').style.display = count ? 'block' : 'none';
    });
    chrome.runtime.sendMessage({message: 'getRegisteredTime', id: tab.id}, response => {
      if (response && response.time) {
        $('timer').value = response.time;
        setInputStyle();
      }
    });
  }, (err) => {
    nop(err); // the ui will check this elsewhere
  });
  $('submit').addEventListener('click', onSubmit);
  $('timer').addEventListener('input', onTimerInput);
}

// ---

document.addEventListener('DOMContentLoaded', run);
