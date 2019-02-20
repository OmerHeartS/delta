const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const fs = require("fs");
exports.run = (client, message, params) => {
var Random = [
'**Acele ile menzil alýnmaz.**',
'**Acý söz insaný dininden çýkarýr, tatlý söz yýlaný deliðinden çýkarýr.**',
'**Akýllý sýr saklar; aptal sýr verir.**', '**Baba oðluna bir bað baðýþlamýþ, oðul babaya bir salkým üzüm vermemiþ.**',
'**Bað dua deðil, çapa dua ister.**',
'**Leyleði kuþtan mý sayarsýn, yazýn gelir, kýþýn gider.**',
'**Var ne bilsin yokun halinden.**',
'**Ne karanlýkta yat, ne kara düþ gör.**',
'**Ne kaa (kadar) ekmek, o kaa (kadar) köfte.**'
];
var sözver = Math.floor(Math.random()*Random.length);
const söz = new Discord.RichEmbed()
.setDescription(`${Random[sözver]}`)
.setColor(0xe2ff00)
.setTimestamp()
message.channel.send(söz)
};
exports.conf = {
enabled: true,
guildOnly: false,
aliases: [],
permLevel: 0
};
exports.help = {
name: 'atasözü',
description: 'atasözü',
usage: 'atasözü'
};
