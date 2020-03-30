"use strict";
require("dotenv").config();
const Discord = require("discord.js");
const axios = require("axios");
const nodeHtmlToImage = require("node-html-to-image");
const fs = require("fs");
const path = require("path");
const best = require("./best");
const worst = require("./worst");
const utils = require("./utils");
// TODO: Move functions to Utilies.js ifle

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
      
      utils.FormatDataBeforeRender(
        best_3_attackers,
        best_3_defenders,
        worst_attacker,
        worst_defender,
        user_stats
      );

      nodeHtmlToImage({
        output: "./image.png",
        html: `
        <html>
        <head>
            <style>
                ${fs.readFileSync(
                  path.resolve("styles", "mini-default.min.css"),
                  "utf8"
                )}
            </style>
            <style>
                ${fs.readFileSync(path.resolve("styles", "index.css"), "utf8")}
            </style>
        </head>
        
        <body>
            ${fs.readFileSync(
              path.resolve("components", "header.handlebars"),
              "utf8"
            )}
            <div class="row">
                <div class="col-sm">
                    <div class="card fluid" style="background: rgba(255,255,255,0.6);">
                        <table class="striped">
                            <caption class="small-font m-0">Best of Attackers</caption>
                            ${fs.readFileSync(
                              path.resolve("components", "thead.handlebars"),
                              "utf8"
                            )}
                            ${fs.readFileSync(
                              path.resolve(
                                "components",
                                "best_attackers_tbody.handlebars"
                              ),
                              "utf8"
                            )}
                        </table>
                    </div>
                </div>
                <div class="col-sm">
                    <div class="card fluid" style="background: rgba(255,255,255,0.6);">
                        <table class="striped">
                            <caption class="small-font m-0">Best of Defenders</caption>
                            ${fs.readFileSync(
                              path.resolve("components", "thead.handlebars"),
                              "utf8"
                            )}
                            ${fs.readFileSync(
                              path.resolve(
                                "components",
                                "best_defenders_tbody.handlebars"
                              ),
                              "utf8"
                            )}
                        </table>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-sm">
                    <div class="card fluid" style="background: rgba(255,255,255,0.6);">
                        <table class="striped">
                            <caption class="small-font m-0">Worst Attacker</caption>
                            ${fs.readFileSync(
                              path.resolve("components", "thead.handlebars"),
                              "utf8"
                            )}
                            ${fs.readFileSync(
                              path.resolve(
                                "components",
                                "worst_attacker_tbody.handlebars"
                              ),
                              "utf8"
                            )}
                        </table>
                    </div>
                </div>
                <div class="col-sm">
                    <div class="card fluid" style="background: rgba(255,255,255,0.6);">
                        <table class="striped">
                            <caption class="small-font m-0">Worst Defender</caption>
                            ${fs.readFileSync(
                              path.resolve("components", "thead.handlebars"),
                              "utf8"
                            )}
                            ${fs.readFileSync(
                              path.resolve(
                                "components",
                                "worst_defender_tbody.handlebars"
                              ),
                              "utf8"
                            )}
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
        console.log(`The image was created successfully for ${username}!`);
        message.channel
          .send(`Here are ${username} stats`, {
            files: ["./image.png"]
          })
          .then(() => {
            try {
              fs.unlinkSync("./image.png");
              //file removed
            } catch (err) {
              console.error(err);
            }
          });
      });
    } catch (err) {
      console.log(err);
      message.channel.send(`${username} does not exist`);
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
