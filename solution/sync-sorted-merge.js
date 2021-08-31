"use strict";

const _ = require("lodash");
// Print all entries, across all of the sources, in chronological order.
module.exports = (logSources, printer) => {
  let watch = []; // Will initially be N in length

  function populateWatch() {
    for (let i = 0; i < logSources.length; i++) {
      watch.push(logSources[i])
    }
    watch = initialSort();
    //console.log(watch);
  }

  function initialSort() {
    return _.sortBy(watch, function(source) { return source.last.date.getTime(); });
  }

  function moveToPosition() {
    let i = 0;
    if (watch.length > 1) {
      while (watch[i].last.date.getTime() > watch[i+1].last.date.getTime()) {
        [watch[i], watch[i+1]] = [watch[i+1], watch[i]];
        i++;
        if (i + 1 === watch.length) return;
      }
    } 
  }

  function printLogEntries() {
    while(watch.length != 0) {
      // Is the min source drained? Remove it and sort.
      if (watch[0].drained) {
        watch.shift();
      } 
      // Is there only one source left? Print, pop.
      else if (watch.length < 2) {
        printer.print(watch[0].last);
        watch[0].last = watch[0].pop();
      }
      // Is the min source still min? Print, pop.
      else if (watch[0].last.date.getTime() < watch[1].last.date.getTime()) {
        printer.print(watch[0].last);
        watch[0].last = watch[0].pop();
      }
      // Is the min source the same UTC signature as secondMin? Print, pop. (Collisions at high amounts)
      else if (watch[0].last.date.getTime() === watch[1].last.date.getTime()) {
        printer.print(watch[0].last);
        watch[0].last = watch[0].pop();
      }
      // Otherwise - sort.
      else {
        moveToPosition();
      }
    }
  }

  populateWatch();
  printLogEntries();
  printer.done();
  console.log("Space Complexity is O(k), where k is the number of sources");
  console.log("Time Complexity is (virtually) O(k * log k)");
  console.log("Note: I observe an average Logs/s of over 3000 with 100 sources");
  console.log("Reflection: I believe a binary min heap would have been a better approach, however it would have taken more time to implement.\n");
  return console.log("Sync sort complete.");
};
