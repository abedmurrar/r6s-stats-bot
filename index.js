"use strict";
require("dotenv").config();
const Discord = require("discord.js");
const axios = require("axios");
const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const best = require("./best");
const worst = require("./worst");

// TODO: Move functions to Utilies.js ifle
function convertSecondsToPlaytime(playtime) {
  var date = new Date(null);
  date.setSeconds(playtime);
  var result = date.toISOString().substr(11, 5);
  return result;
}

function FormatOperatorData(operator) {
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

function FormatDataBeforeRender(
  best_3_attackers,
  best_3_defenders,
  worst_attacker,
  worst_defender,
  user_stats
) {
  //Format User Data
  FormatUserData(user_stats);

  //Format Shown Operators Data
  best_3_attackers.forEach(attacker => FormatOperatorData(attacker));
  best_3_defenders.forEach(defender => FormatOperatorData(defender));
  FormatOperatorData(worst_attacker);
  FormatOperatorData(worst_defender);
}

// Create an instance of a Discord client
const client = new Discord.Client();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on("ready", () => {
  console.log("I am ready!");
});

// Create an event listener for messages
client.on("message", async message => {
  if (message.content.toLowerCase().startsWith("!r6s")) {
    // example: !r6s <username>
    let username = message.content.split(" ")[1];

    try {
      /**
       * get user data
       *
       * this is a response message, to get the data out of the response
       * you invoke response.data
       * https://github.com/axios/axios#response-schema
       */
      const res_user = await axios.get(
        `https://r6stats.com/api/player-search/${username}/pc`
      );

      /**
       * to get more information of player
       * and operators stats
       */
      const res_user_stats = await axios.get(
        `https://r6stats.com/api/stats/${res_user.data[0].ubisoft_id}`
      );
      const user_stats = res_user_stats.data;

      // filter all operators by attackers
      const attackers = res_user_stats.data.operators.filter(op => {
        return op.operator.role == "attacker";
      });

      // filter all operators by defenders
      const defenders = res_user_stats.data.operators.filter(op => {
        return op.operator.role == "defender";
      });

      let best_3_attackers = best(attackers).splice(0, 3);
      let best_3_defenders = best(defenders).splice(0, 3);

      let worst_attacker = worst(attackers);
      let worst_defender = worst(defenders);

      FormatDataBeforeRender(
        best_3_attackers,
        best_3_defenders,
        worst_attacker,
        worst_defender,
        user_stats
      );

      nodeHtmlToImage({
        output: "./image.png",
        html: `<html>
      <head>
          <style>
          ${fs.readFileSync("mini-default.min.css", "utf8")}
          </style>
          <style>
              html,
              body {
                  width: 600px;
                  height: 400px;
              }
      
              body {
                  background: url('https://i.imgur.com/0sSEHGN.jpg') no-repeat !important;
                  background-size: contain;
                  background-size: 100% 100%;
      
              }
      
              .d-flex {
                  display: flex;
              }
      
              .align-items-center {
                  align-items: center;
              }
      
              .justify-content-center {
                  justify-content: center;
              }
      
              header {
                  background: rgba(255, 255, 255, 0.1);
                  border: none;
              }
      
              .level {
                  width: 50px;
                  height: 50px;
                  background-color: grey;
                  font-weight: bold;
              }
      
              .user-image {
                  width: 50px;
                  height: 50px;
                  background: url('{{player_avatar}}');
                  font-weight: bold;
                  background-size: contain;
              }
      
              .player-name {
                  max-width: 200px;
                  margin-right: auto;
              }
      
              .stats-container {
                  max-width: 70px;
                  margin-right: 10px;
              }
      
              .overflow-hidden {
                  overflow: hidden;
              }
      
              .m-0 {
                  margin: 0;
              }
      
              .p-0 {
                  padding: 0;
              }
      
              .xx-small-font {
                  font-size: xx-small !important;
              }
      
              .x-small-font {
                  font-size: x-small !important;
              }
      
              .small-font {
                  font-size: small !important;
              }
      
              .stats-text {
                  word-wrap: break-word;
                  width: 45px;
                  margin-top: 3px;
              }
      
              .operator-logo {
                  width: 70%;
              }
          </style>
      </head>
      
      <body>
          <header class="d-flex align-items-center">
              <span class="rounded circular user-image d-flex justify-content-center align-items-center"></span>
      
              <span class="rounded circular level d-flex justify-content-center align-items-center">{{player_level}}</span>
              <div class="player-name">
                  <p style="overflow: hidden;"><mark class="inline-block" style="font-size: 100%;word-wrap: break-word;">
                          {{player_name}}</mark></p>
              </div>
              <div class="stats-container">
                  <p class="m-0 overflow-hidden"><mark class="inline-block m-0 xx-small-font stats-text">
                          K/D {{player_general_kd}}</mark></p>
                  <p class="m-0 overflow-hidden"><mark class="inline-block"
                          style="font-size: xx-small;word-wrap: break-word; margin:0; width:45px; margin-top:3px;">
                          W/L {{player_general_wl}}</mark></p>
              </div>
              <div class="stats-container">
                  <p class="m-0 overflow-hidden"><mark class="inline-block tertiary m-0 xx-small-font stats-text">
                          Kills {{player_general_kills}}</mark></p>
                  <p class="m-0 overflow-hidden"><mark class="inline-block secondary m-0 xx-small-font stats-text">
                          Deaths {{player_general_deaths}}</mark></p>
              </div>
              <div style="max-width: 70px; margin-right: 10px;">
                  <p class="m-0 overflow-hidden"><mark class="inline-block tertiary m-0 xx-small-font stats-text">
                          Wins {{player_general_wins}}</mark></p>
                  <p class="m-0 overflow-hidden"><mark class="inline-block secondary m-0 xx-small-font stats-text">
                          Losses {{player_general_losses}}</mark></p>
              </div>
      
          </header>
          <div class="row">
              <div class="col-sm">
                  <div class="card fluid" style="background: rgba(255,255,255,0.6);">
                      <table class="striped">
                          <caption class="small-font m-0">Best of Attackers</caption>
                          <thead style="background: rgba(255,255,255,0.6);">
                              <tr style="background: rgba(255,255,255,0.0);">
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      style="background: rgba(255,255,255,0.2);margin: 5px;">Operator</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">K/D</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">W/L</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">
                                      Playtime</th>
                              </tr>
                          </thead>
                          <tbody>
                          {{#each player_best_attackers}}
                              <tr>
                                  <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      data-label="Operator"><img src="{{this.operator.images.badge}}"
                                          class="operator-logo" /></td>
                                  <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      data-label="K/D">{{this.kd}}</td>
                                  <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      data-label="W/L">{{this.wl}}</td>
                                  <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      data-label="Playtime">{{this.playtime}}</td>
                              </tr>
                              {{/each}}
                          </tbody>
                      </table>
                  </div>
              </div>
              <div class="col-sm">
                  <div class="card fluid" style="background: rgba(255,255,255,0.6);">
                      <table class="striped">
                          <caption class="small-font m-0">Best of Defenders</caption>
                          <thead style="background: rgba(255,255,255,0.6);">
                              <tr style="background: rgba(255,255,255,0.0);">
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      style="background: rgba(255,255,255,0.2);margin: 5px;">Operator</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">K/D</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">W/L</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">
                                      Playtime</th>
                              </tr>
                          </thead>
                          <tbody>
                          {{#each player_best_defenders}}
                                <tr>
                                    <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                        data-label="Operator"><img src="{{this.operator.images.badge}}"
                                            class="operator-logo" /></td>
                                    <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                        data-label="K/D">{{this.kd}}</td>
                                    <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                        data-label="W/L">{{this.wl}}</td>
                                    <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                        data-label="Playtime">{{this.playtime}}</td>
                                </tr>
                              {{/each}}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
          <div class="row">
              <div class="col-sm">
                  <div class="card fluid" style="background: rgba(255,255,255,0.6);">
                      <table class="striped">
                          <caption class="small-font m-0">Worst Attacker</caption>
                          <thead style="background: rgba(255,255,255,0.6);">
                              <tr style="background: rgba(255,255,255,0.0);">
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      style="background: rgba(255,255,255,0.2);margin: 5px;">Operator</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">K/D</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">W/L</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">
                                      Playtime</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr>
                                  <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      data-label="Operator"><img src="{{player_worst_attacker.operator.images.badge}}"
                                          class="operator-logo" /></td>
                                  <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      data-label="K/D">{{player_worst_attacker.kd}}</td>
                                  <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      data-label="W/L">{{player_worst_attacker.wl}}</td>
                                  <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      data-label="Playtime">{{player_worst_attacker.playtime}}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
              <div class="col-sm">
                  <div class="card fluid" style="background: rgba(255,255,255,0.6);">
                      <table class="striped">
                          <caption class="small-font m-0">Worst Defender</caption>
                          <thead style="background: rgba(255,255,255,0.6);">
                              <tr style="background: rgba(255,255,255,0.0);">
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                                      style="background: rgba(255,255,255,0.2);margin: 5px;">Operator</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">K/D</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">W/L</th>
                                  <th class="m-0 p-0 d-flex justify-content-center align-items-center small-font">
                                      Playtime</th>
                              </tr>
                          </thead>
                          <tbody>
                          <tr>
                          <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                              data-label="Operator"><img src="{{player_worst_defender.operator.images.badge}}"
                                  class="operator-logo" /></td>
                          <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                              data-label="K/D">{{player_worst_defender.kd}}</td>
                          <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                              data-label="W/L">{{player_worst_defender.wl}}</td>
                          <td class="m-0 p-0 d-flex justify-content-center align-items-center small-font"
                              data-label="Playtime">{{player_worst_defender.playtime}}</td>
                      </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </body>
      
      </html>
      `,
        puppeteerArgs: {
          headless: false,
          defaultViewport: {
            width: 1920,
            height: 1080
          }
        },
        content: {
          player_avatar: user_stats.avatar_url_146,
          player_level: user_stats.progression.level,
          player_name: user_stats.username,
          player_general_kd: user_stats.stats[0].general.kd,
          player_general_wl: user_stats.stats[0].general.wl,
          player_general_kills: user_stats.stats[0].general.kills,
          player_general_losses: user_stats.stats[0].general.losses,
          player_general_deaths: user_stats.stats[0].general.deaths,
          player_general_wins: user_stats.stats[0].general.wins,
          player_best_attackers: best_3_attackers,
          player_worst_attacker: worst_attacker,
          player_best_defenders: best_3_defenders,
          player_worst_defender: worst_defender
        }
      }).then(() => {
        console.log("The image was created successfully!");
        message.channel.send("Here are your stats", {
          files: ["./image.png"]
        });
      });
    } catch (err) {
      console.log(err);
      message.channel.send(`${username} does not exist`);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
