const { mean } = require("./utils");

/**
 * Sort for the best by focusing on the positive values (kills, wins, playtime)
 * that nominate an operator for the best instead of
 * focusing on ratios, and by eliminating the negative values (losses, deaths)
 * , then filter the operators only by the positive values
 * @param {Array} array
 */
function sort_and_filter_for_best(array) {
  // descending
  // aqal 5asa2er
  return array
    .sort(
      (a, b) =>
        // b has more kills
        (b.kills - a.kills) / mean(array, "kills") +
        // b has more wins
        ((b.wins - a.wins) * (b.wl - a.wl)) / mean(array, "wins") +
        //b has more playtime
        (b.playtime - a.playtime) / mean(array, "playtime") +
        // a has more losses
        (a.losses - b.losses) / mean(array, "losses") +
        // a has more deaths
        (a.deaths - b.deaths) / mean(array, "deaths")
    )
    .filter(
      operator =>
        operator.kills >= mean(array, "kills") &&
        operator.wins >= mean(array, "wins") &&
        operator.playtime >= mean(array, "playtime")
    );
}

function best_list(operators) {
  let best_operators = [];

  best_operators = best_operators.concat(sort_and_filter_for_best(operators));
  let nominated_operators = [...operators];
  let was_at = -1;
  while_loop: while (best_operators.length < 3) {
    // if it gets only one, remove that one from all mean equations
    // if it gets only two, remove the first one from all mean equations
    // if it gets only two after removing first one, remove the second one too
    // if it gets zero remove the one with the lowest kills and wins and playtime
    // or divide all means by two
    switch (best_operators.length) {
      case 2:
        was_at = 2;
        /**
         * if best_operators array already has two operators it still needs one,
         * so in order to retrieve more operators after nominated_operators is passed into sort_and_filter_for_best
         * function, remove the one that is already selected in first in best_operators array
         * because by removing it, the mean can go down and select more operators in the range
         */
        nominated_operators = nominated_operators.filter(
          op => op != best_operators[1]
        );
        best_operators = best_operators.concat(
          sort_and_filter_for_best(nominated_operators)[0]
        );
        break;
      case 1:
        if (was_at === 1) {
          /**
           * if the while loop returns to case 1 after it was in case 1 (even remove the first selected element
           * in best_operators did not help), we can help and move the mean by removing the element that has the
           * lowest value from the mean (adjusting mean by removing low values), it allows the higher values to be selected.
           * because if the low values are more than higher values, they have the favor of the mean
           */
          nominated_operators = nominated_operators.filter(
            op =>
              op !=
              nominated_operators.sort(
                //notice the switch between the parameters (b,a) not (a,b) to select the lowest
                (b, a) =>
                  (b.kills - a.kills) / mean(nominated_operators, "kills") +
                  ((b.wins - a.wins) * (b.wl - a.wl)) /
                    mean(nominated_operators, "wins") +
                  (b.playtime - a.playtime) /
                    mean(nominated_operators, "playtime") +
                  (a.losses - b.losses) / mean(nominated_operators, "losses") +
                  (a.deaths - b.deaths) / mean(nominated_operators, "deaths")
              )[0] // notice the array index to select first low element
          );
        }
        /**
         * if best_operators array already has one operator it still needs two,
         * so in order to retrieve more operators after nominated_operators is passed into sort_and_filter_for_best
         * function, remove the one that is already selected in first in best_operators array
         * because by removing it, the mean can go down and select more operators in the range
         */
        was_at = 1;
        nominated_operators = nominated_operators.filter(
          op => op != best_operators[0]
        );
        best_operators = best_operators.concat(
          sort_and_filter_for_best(nominated_operators)
        );
        break;
      case 0:
        // cant be a case with 0, but still here if it ever occured
        break while_loop;
        break;
      default:
        break;
    }
  }

  /**
   * Sort last best array to select top 3 by focusing on
   * two positive values and one ratio
   */
  return best_operators.sort(
    (a, b) =>
      b.kills -
      a.kills +
      (b.wl - a.wl) +
      (b.playtime - a.playtime) / mean(best_operators, "playtime")
  );
}

module.exports = best_list;
