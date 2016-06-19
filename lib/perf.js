/*
 * SystemJS performance measurement addon
 *
 */
(function() {
function perfEvent(eventName, eventItem) {
  var evt = new ProfileEvent(eventName, eventItem);
  events.push(evt);
  return evt;
};

// we extend the hook function itself to create performance instrumentation per extension
var curHook = hook;

var resolverHooks = ['import', 'normalizeSync', 'decanonicalize', 'normalize'];
var pipelineHooks = ['locate', 'fetch', 'translate', 'instantiate'];
hook = function(name, newHook) {
  // hook information
  var resolver = resolverHooks.indexOf(name) != -1;
  var pipeline = pipelineHooks.indexOf(name) != -1;
  var hookEvtName = name + ':' + newHook.toString().substr(0, 200);

  curHook(name, function(prevHook) {
    return function() {
      // this is called when the hook runs
      var hookItem = resolver ? arguments[0] + ' : ' + arguments[1] + ' : ' + !!arguments[2] : arguments[0] && arguments[0].name;
      var evt = perfEvent(hookEvtName, hookItem);

      // ignore time spent in the old hook
      var fn = newHook(function() {
        evt.pause();
        var output = prevHook.apply(this, arguments);

        if (output && output.toString && output.toString() == '[object Promise]') {
          return Promise.resolve(output)
          .then(function(output) {
            evt.resume();
            return output;
          })
          .catch(function(err) {
            evt.resume()
            throw err;
          });
        }
        else {
          evt.resume();
          return output;
        }
      });

      var output;
      try {
        output = fn.apply(this, arguments);
      }
      catch(e) {
        evt.cancel();
        throw e;
      }

      if (output && output.toString && output.toString() == '[object Promise]') {
        return Promise.resolve(output)
        .then(function(output) {
          evt.done();
          return output;
        })
        .catch(function(err) {
          evt.cancel();
          throw err;
        });
      }
      else {
        evt.done();
        return output;
      }
    };
  });
};

// profiling events
var events = [];

var perf = typeof performance != 'undefined' : performance : Date;

// Performance Event class
function ProfileEvent(name, item) {
  this.name = name;
  this.item = (typeof item == 'function' ? item() : item) || 'default';
  this.start = perf.now();
  this.stop = null;
  this.pauseTime = null;
  this.cancelled = false;
}
ProfileEvent.prototype.rename = function(name, item) {
  this.name = name;
  if (arguments.length > 1)
    this.item = item;
};
ProfileEvent.prototype.done = function() {
  if (this.stop)
    throw new TypeError('Event ' + this.name + ' (' + this.item + ') has already completed.');
  this.stop = perf.now();
};
ProfileEvent.prototype.cancel = function() {
  this.cancelled = true;
};
ProfileEvent.prototype.cancelIfNotDone = function() {
  if (!this.stop)
    this.cancelled = true;
};
ProfileEvent.prototype.pause = function() {
  if (this.stop)
    throw new TypeError('Event ' + this.name + ' (' + this.item + ') cannot be paused as it has finished.');
  if (!this.pauseTime)
    this.pauseTime = perf.now();
};
ProfileEvent.prototype.resume = function() {
  if (!this.pauseTime)
    throw new TypeError('Event ' + this.name + ' (' + this.item + ') is not already paused.');
  this.start += perf.now() - this.pauseTime;
  this.pauseTime = null;
};

var logged = false;
SystemJSLoader.prototype.perfSummary = function(includeEvts) {
  logged = true;
  // create groupings of events by event name to time data
  // filtering out cancelled events
  var groupedEvents = {};
  events.forEach(function(evt) {
    if (includeEvts && !includeEvts(evt))
      return;
    if (evt.cancelled)
      return;
    if (!evt.stop) {
      console.warn('Event ' + evt.name + ' (' + evt.item + ') never completed.');
      return;
    }

    var evtTimes = groupedEvents[evt.name] = groupedEvents[evt.name] || [];
    evtTimes.push({
      time: evt.stop - evt.start,
      item: evt.item
    });
  });

  Object.keys(groupedEvents).forEach(function(evt) {
    var evtTimes = groupedEvents[evt];

    // only one event -> log as a single event
    if (evtTimes.length == 1) {
      console.log(toTitleCase(evt) + (evtTimes[0].item != 'default' ? ' (' + evtTimes[0].item + ')' : ''));
      logStat('Total Time', evtTimes[0].time);
      console.log('');
      return;
    }

    // multiple events, give some stats!
    var evtCount = evtTimes.length;

    console.log(toTitleCase(evt) + ' (' + evtCount + ' events)');

    var totalTime = evtTimes.reduce(function(curSum, evt) {
      return curSum + evt.time;
    }, 0);
    logStat('Cumulative Time', totalTime);

    var mean = totalTime / evtCount;
    logStat('Mean', mean);

    var stdDev = Math.sqrt(evtTimes.reduce(function(curSum, evt) {
      return curSum + Math.pow(evt.time - mean, 2);
    }, 0) / evtCount);

    logStat('Std Deviation', stdDev);

    var withoutOutliers = evtTimes.filter(function(evt) {
      return evt.time > mean - stdDev && evt.time < mean + stdDev;
    });

    logStat('Avg within 2σ', withoutOutliers.reduce(function(curSum, evt) {
      return curSum + evt.time;
    }, 0) / withoutOutliers.length);

    var sorted = evtTimes.sort(function(a, b) {
      return a.time > b.time ? 1 : -1;
    });

    var medianIndex = Math.round(evtCount / 2);
    logStat('Median', sorted[medianIndex].time, sorted[medianIndex].evt);

    logStat('Max', sorted[evtCount - 1].time, sorted[evtCount - 1].item);

    logStat('Min', sorted[0].time, sorted[0].item);

    var duplicates = evtTimes.filter(function(evt) {
      return evtTimes.some(function(dup) {
        return dup !== evt && dup.name == evt.name && dup.item == evt.item;
      });
    });

    logStat('Duplicate Events', duplicates.length, true);

    logStat('Total Duplicated Time', duplicates.reduce(function(duplicateTime, evt) {
      return duplicateTime + evt.time;
    }, 0));

    console.log('');
  });
};

function toTitleCase(title) {
  return title.split('-').map(function(part) {
    return part[0].toUpperCase() + part.substr(1);
  }).join(' ');
}

var titleLen = 25;
function logStat(title, value, item, isNum) {
  if (item === true) {
    item = undefined;
    isNum = true;
  }
  var spaces = Array(titleLen - title.length + 1).join(' ');
  var value = isNum ? value : Math.round(value * 100) / 100 + 'ms';
  console.log('  ' + title + spaces + ': ' + value + (item ? ' (' + item + ')' : ''));
}
})();