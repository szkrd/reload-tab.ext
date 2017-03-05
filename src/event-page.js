const BADGE_REG_COLOR = [120, 120, 120, 255];
const BADGE_ACTIVE_COLOR = [179, 161, 66, 255];
const NOCACHE = true;

let hasAlarm;
let tabStore = {}; // schema: { time, current, reloaded }

// create a single alarm with the lowest possible value (one minute, according to the docs)
// Chrome is quite picky about alarms, so even this single one may be throttled down, hurray!
function initAlarm () {
  if (hasAlarm) {
    return;
  }
  hasAlarm = true;
  chrome.alarms.create('main', { periodInMinutes: 1 });
}

// remove alarm
function destroyAlarm () {
  if (!hasAlarm) {
    return;
  }
  hasAlarm = false;
  chrome.alarms.clear('main');
}

// register a tab into the tabStore object
function register (id, time) {
  if (!hasAlarm) {
    initAlarm();
  }
  let rule = tabStore[id] = tabStore[id] || { current: 0 }; // current is the current tick count
  if (time !== rule.time) {
    rule.time = time; // time is the desired reload at time
    rule.reloaded = 0; // reloaded is the count how many it has been reloaded
    updateBadge(id);
  }
}

// remove a tab from the tabStore object
function deregister (id) {
  delete tabStore[id];
  updateBadge(id);
  if (Object.keys(tabStore).length === 0) {
    destroyAlarm();
  }
}

// is this tab id in the store?
function getTabRegisteredTime (tabId) {
  return (tabStore[tabId] || {}).time || 0;
}

// how many times has it been reloaded by us?
function getTabReloadCount (tabId) {
  return (tabStore[tabId] || {}).reloaded || 0;
}

// show the default timeout as a badge for this tab, gray for initial, yellow for reloaded
function updateBadge (tabId) {
  let tab = tabStore[tabId];
  if (!tab) {
    chrome.browserAction.setBadgeText({ text: '' });
    return;
  }
  chrome.browserAction.setBadgeText({
    text: String(tab.time)
    // will not work: `tabId: realTab.id`
  });
  chrome.browserAction.setBadgeBackgroundColor({
    color: tab.reloaded ? BADGE_ACTIVE_COLOR : BADGE_REG_COLOR
  });
}

// on tab change / select
function onTabActivated (data) {
  updateBadge(data.tabId);
}

// on alarm iterate through the registered tab ids and reload the tabs if needed
function onTick () {
  Object.keys(tabStore).forEach(id => {
    id = parseInt(id, 10); // feels like good old rhino
    let tab = tabStore[id];
    tab.current++;
    if (tab.current >= tab.time) {
      tab.current = 0;
      chrome.tabs.get(id, realTab => {
        if (realTab) {
          tab.reloaded++;
          chrome.tabs.reload(id, { bypassCache: NOCACHE }, () => {
            updateBadge(realTab.id); // this will be wiped out at reload end, heck
          });
        } else {
          deregister(id);
        }
      });
    }
  });
}

// on tab removal delet it from the store
function onTabRemoved (tabId) {
  if (tabStore[tabId]) {
    deregister(tabId);
  }
}

// deal with messages from the popup
function onMessage (request, sender, sendResponse) {
  if (request.message === 'register') {
    register(request.id, request.time);
    sendResponse({success: true});
  }
  if (request.message === 'deregister') {
    deregister(request.id);
    sendResponse({success: true});
  }
  if (request.message === 'getRegisteredTime') {
    sendResponse({time: getTabRegisteredTime(request.id), success: true});
  }
  if (request.message === 'getReloadCount') {
    sendResponse({count: getTabReloadCount(request.id), success: true});
  }
}

// ---

chrome.alarms.onAlarm.addListener(onTick);
chrome.runtime.onMessage.addListener(onMessage);
chrome.tabs.onRemoved.addListener(onTabRemoved);
chrome.tabs.onActivated.addListener(onTabActivated);
