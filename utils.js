/**
 * Calculate mean for an attribute for operators
 * @param {Array} operators
 * @param {String} attribute
 */
function mean(operators, attribute) {
  let n = operators.length;
  let sum = 0;

  for (let index = 0; index < n; index++) {
    sum += operators[index][attribute];
  }
  return sum / n;
}

function convertSecondsToPlaytime(playtime){
  var result = "";
  console.log(playtime);
  var hours = Math.floor(playtime / 3600);
  var minutes = Math.floor(playtime % 3600 / 60);
  if(hours >= 24){
      var days = hours / 24;
      days = Math.floor(days);
      result = days.toString() + "D";
      hours = hours -  days * 24;
      result = result + hours.toString() + "H";
      return result;
  }
  result = result + hours.toString() + "H";
  result = result + minutes.toString() + "M";
  return result;
}

function FormatOperatorData(operator){
  operator.kd = (Math.round(operator.kd * 100) / 100).toFixed(2);
  operator.wl = (Math.round(operator.wl * 100) / 100).toFixed(2);
  operator.playtime = convertSecondsToPlaytime(operator.playtime);

}

function FormatUserData(user_stats) {
user_stats.stats[0].general.kd = (
  Math.round(user_stats.stats[0].general.kd * 100) / 100
).toFixed(2);
user_stats.stats[0].general.wl = (
  Math.round(user_stats.stats[0].general.wl * 100) / 100
).toFixed(2);
}

function FormatDataBeforeRender(best_3_attackers,best_3_defenders,worst_attacker,worst_defender,user_stats) {
//Format User Data
FormatUserData(user_stats);
//Format Shown Operators Data
best_3_attackers.forEach(attacker => FormatOperatorData(attacker));
best_3_defenders.forEach(defender => FormatOperatorData(defender));
FormatOperatorData(worst_attacker);
FormatOperatorData(worst_defender);
}


module.exports = { mean, convertSecondsToPlaytime, FormatOperatorData, FormatUserData, FormatDataBeforeRender };
