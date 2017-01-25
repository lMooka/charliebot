const Discord = require("discord.js");
const bot = new Discord.Client();

const cleverbot = require("cleverbot.io");
const cbot = new cleverbot("PeqXvwvC51SvHIwm", "J3OZO2rJXGT9A65RyDNVkz7Kiu4yGPKl");

const translate = require('google-translate-api-plus')('com');

cbot.create(function (err, session) {
  console.log(`new cleverbot session '${session}' set.`);
  cbot.setNick(session);
});

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.username}#${bot.user.discriminator}`);
});

bot.on(`presenceUpdate`, (o, n) => {
  var game = n.presence.game;

  if(game != null && game.streaming) {
    n.guild.defaultChannel.sendMessage(`${n.user} está streamando! ${game.name} - ${game.url}`);
  }
});

bot.on('message', msg => {
  if(msg.mentions.users.first() === bot.user) {
    var txt = msg.content.split("<@256210606112243720> ");

    if(txt.length > 1) {

      if(txt[1].includes("quantos") && txt[1].includes("membros")) {
        msg.reply(`nós temos atualmente ${msg.guild.memberCount} membros.`);
        return;
      }

      translate(txt[1], {from: 'pt', to: 'en'}).then(res => {
          console.log(`ask [${txt[1]}], translation [${res.text}]`);

          //cbot.setNick(msg.author.username);
          cbot.ask(res.text, function (err, response) {
            if(!err) {
              translate(response, {from: 'en', to: 'pt'}).then(res2 => {
              console.log(`response [${response}], translation [${res2.text}]`);
              msg.reply(res2.text);
            }).catch(err => {
              console.log('error 1 - {}');
              //console.error(err);
            });
          } else {
              console.log(`error 2 - ${res.text} / ${response}`);
            }
          });
      }).catch(err => {
          console.log('error 3');
      });
    } else {
      msg.reply("you should ask me something.");
    }
  }
});

bot.on('guildMemberAdd', member => {
  console.log(`New User "${member.user.username}" has joined "${member.guild.name}"` );
  member.guild.defaultChannel.sendMessage(`Bem vindo, ${member.user}! http://i.imgur.com/Evwbyzj.png`);
    //guildMember.client.channels.first().sendMessage('Bem vindo! @' + guildMember.nickname);
});

bot.login('MjU2MjEwNjA2MTEyMjQzNzIw.Cyo2PQ.kx0bTzyJCYpIfUomBMVDS3v9ft4');
