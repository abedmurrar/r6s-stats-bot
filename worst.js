const { mean } = require("./utils");

/**
 * Sort for the best by focusing on the positive values (kills, wins, playtime)
 * that nominate an operator for the best instead of
 * focusing on ratios, and by eliminating the negative values (losses, deaths)
 * , then filter the operators only by the positive values
 * @param {Array} array
 */
function sort_and_filter_for_worst(array) {
  // ascending
  // aktar 5asa2er b aktar playtime
  return array
    .sort(
      (a, b) =>
        // a has more kills
        (a.kills - b.kills) / mean(array, "kills") +
        // a has more wins
        (a.wins - b.wins) / mean(array, "wins") +
        // a has more playtime
        (a.playtime - b.playtime) / mean(array, "playtime") +
        // b has more losses
        (b.losses - a.losses) / mean(array, "losses") +
        // b has more deaths
        (b.deaths - a.deaths) / mean(array, "deaths") +
        // a has more wl
        (a.wl - b.wl)
    )
    .filter(
      op =>
        op.losses > 1 && op.wl < mean(array, "wl") && op.kd < mean(array, "kd")
    );
}

function worst(operators) {
  return sort_and_filter_for_worst(operators)[0];
}

module.exports = worst;
