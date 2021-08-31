"use strict";

// Print all entries, across all of the *async* sources, in chronological order.

const _ = require("lodash");

module.exports = (logSources, printer) => {
  return new Promise((resolve, reject) => {
    let watch = []; // Will initially be N in length

    function populateWatch() {
      for (let i = 0; i < logSources.length; i++) {
        watch.push(logSources[i])
      }
      watch = initialSort();
      //console.log(watch);
    }

    function initialSort() {
      return _.sortBy(watch, function (source) { return source.last.date.getTime(); });
    }

    function moveToPosition() {
      let i = 0;
      if (watch.length > 1) {
        while (watch[i].last.date.getTime() > watch[i + 1].last.date.getTime()) {
          [watch[i], watch[i + 1]] = [watch[i + 1], watch[i]];
          i++;
          if (i + 1 === watch.length) return;
        }
      }
    }

    async function printLogEntries() {
      while (watch.length != 0) {
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
          watch[0].last = await watch[0].popAsync();
        }
        // Is the min source the same UTC signature as secondMin? Print, pop. (Collisions at high amounts)
        else if (watch[0].last.date.getTime() === watch[1].last.date.getTime()) {
          printer.print(watch[0].last);
          watch[0].last = await watch[0].popAsync();
        }
        // Otherwise - sort.
        else {
          moveToPosition();
        }
      }
    }

    populateWatch();
    printLogEntries().then(() => {
      printer.done();
      console.log("Space Complexity is O(k), where k is the number of sources");
      console.log("Time Complexity is (virtually) O(k * log k * delay)");
      console.log("Note: This is extremely slow... Very slow.");
      console.log("Reflection: In the README it is noted that we do NOT want to read into memory due to potentially large sizes.\n");
      console.log("- However, we might see benefit by 'building' each source list in parallel into it's own binary min heap, then sorting the head of the heaps\n");
      resolve(console.log("Async sort complete."));
    });
  });
};
