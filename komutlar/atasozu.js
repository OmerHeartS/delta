const Discord = require('discord.js');
const ayarlar = require('../ayarlar.json');
const fs = require("fs");
exports.run = (client, message, params) => {
var Random = [
'**Acele ile menzil al�nmaz.**',
'**Ac� s�z insan� dininden ��kar�r, tatl� s�z y�lan� deli�inden ��kar�r.**',
'**Ak�ll� s�r saklar; aptal s�r verir.**', '**Baba o�luna bir ba� ba���lam��, o�ul babaya bir salk�m �z�m vermemi�.**',
'**Ba� dua de�il, �apa dua ister.**',
'**Leyle�i ku�tan m� sayars�n, yaz�n gelir, k���n gider.**',
'**Var ne bilsin yokun halinden.**',
'**Ne karanl�kta yat, ne kara d�� g�r.**',
'**Ne kaa (kadar) ekmek, o kaa (kadar) k�fte.**'
];
var s�zver = Math.floor(Math.random()*Random.length);
const s�z = new Discord.RichEmbed()
.setDescription(`${Random[s�zver]}`)
.setColor(0xe2ff00)
.setTimestamp()
message.channel.send(s�z)
};
exports.conf = {
enabled: true,
guildOnly: false,
aliases: [],
permLevel: 0
};
exports.help = {
name: 'atas�z�',
description: 'atas�z�',
usage: 'atas�z�'
};
