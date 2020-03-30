const axios = require("axios");
const best = require("./best");
const worst = require("./worst");
(async function() {
  let username = "Sapphire._.";
  const res_user = await axios.get(
    `https://r6stats.com/api/player-search/${username}/pc`
  );

  console.log(res_user.data);

  /**
   * to get more information of player
   * and operators stats
   */
  const res_user_stats = await axios.get(
    `https://r6stats.com/api/stats/${res_user.data[0].ubisoft_id}`
  );
  const user_stats = res_user_stats.data;

  const attackers = res_user_stats.data.operators.filter(op => {
    return op.operator.role == "attacker";
  });

  // filter all operators by defenders
  const defenders = res_user_stats.data.operators.filter(op => {
    return op.operator.role == "defender";
  });

  best(defenders)
    .splice(0, 3)
    .forEach(op => console.log(op.operator.name));
  console.log();
  best(attackers).forEach(op => console.log(op.operator.name));
  console.log();
  console.log();
  worst(attackers);
  console.log();
  console.log();
  worst(defenders);
})();
