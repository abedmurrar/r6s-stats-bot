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

module.exports = { mean };
