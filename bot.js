const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
require('./util/eventLoader')(client);

var prefix = ayarlar.prefix;

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const youtube = new YouTube('AIzaSyDSiyHBWZI9dDZBWXloNVhrHbpzTTfa0L8');
const queue = new Map();
var prefix = ayarlar.prefix;
client.on('message', message => {
if (message.content === `o!ping`) {
  let Ping = client.ping
 message.channel.sendEmbed(new Discord.RichEmbed()
                           .addField('Müzik Pingi:',client.ping))
}
});
client.on("message", async message => {
  var args = message.content.substring(prefix.length).split(" ");
    if (!message.content.startsWith(prefix)) return;
  var searchString = args.slice(1).join(' ');
  var url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
  var serverQueue = queue.get(message.guild.id);
    switch (args[0].toLowerCase()) {
      case "oynat":
    var voiceChannel = message.member.voiceChannel;
    const voiceChannelAdd = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Hata`)
    .setDescription(`Lütfen herhangi bir sesli kanala katılınız.`)
    if (!voiceChannel) return message.channel.send(voiceChannelAdd);
    var permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT')) {
      const warningErr = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`Hata`)
      .setDescription(`Herhangi bir sesli kanala katılabilmek için yeterli iznim yok.`)
      return message.channel.send(warningErr);
    }
    if (!permissions.has('SPEAK')) {
      const musicErr = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`Hata`)
      .setDescription(`Müzik açamıyorum/şarkı çalamıyorum çünkü kanalda konuşma iznim yok veya mikrofonum kapalı.`)
      return message.channel.send(musicErr);
    }
      if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      var playlist = await youtube.getPlaylist(url);
      var videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        var video2 = await youtube.getVideoByID(video.id);
        await handleVideo(video2, message, voiceChannel, true);
      }
      const PlayingListAdd = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`Oynatma Listesi:`)
      .setDescription(`? **${playlist.title}** İsimli şarkı oynatma listesine Eklendi.`)
      return message.channel.send(PlayingListAdd);
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          var index = 0;
          const embed = new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle(`___**Şarkı Seçimi**___`)
          .setDescription(`${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')} \n\n**Lütfen hangi şarkıyı seçmek istiyorsan \`1\` ile \`10\` arası bir sayı yaz.**`)
          .setFooter(`Şarkı seçimi "10" saniye içinde iptal edilecektir.`)
          message.channel.send({embed})
          try {
            var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
              maxMatches: 1,
              time: 10000,
              errors: ['time']
            });
          } catch (err) {
            console.error(err);
            const NoNumber = new Discord.RichEmbed()
            .setColor("RANDOM")
            .setTitle(`Hata`)
            .setDescription(`Hiç bir değer girilmedi şarkı seçimi iptal edildi.`) 
            return message.channel.send(NoNumber);
          }
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          const songNope = new Discord.RichEmbed()
          .setColor("RANDOM")
          .setTitle(`Hata`)
          .setDescription(`Aradığınız isimde bir şarkı bulamadım.`) 
          return message.channel.send(songNope);
        }
      }
      return handleVideo(video, message, voiceChannel);
    }
    break;
      case "geç":
      const err0 = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`Hata`)
      .setDescription(`Bir sesli kanalda değilsin.`) 
    if (!message.member.voiceChannel) return message.channel.send(err0);
    const err05 = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Hata`)
    .setDescription(`Şuanda herhangi bir şarkı çalmıyor.`)
    if (!serverQueue) return message.channel.send(err05);
    const songSkip = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Şarkı Geçildi`)
    .setDescription(`Şarkı başarıyla geçildi. :white_check_mark: `)
    serverQueue.connection.dispatcher.end('g');
    message.channel.send(songSkip)
    return undefined;
break;
      case "durdur":
    const err1 = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Hata`)
    .setDescription(`Bir sesli kanalda değilsin.`)  
    if (!message.member.voiceChannel) return message.channel.send(err1);
    const err2 = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Hata`)
    .setDescription(`Şuanda herhangi bir şarkı çalmıyor.`)
    if (!serverQueue) return message.channel.send(err2);
    serverQueue.songs = [];
    const songEnd = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Şarkı Kapatıldı`)
    .setDescription(`Şarkı başarıyla durduruldu.`)
    serverQueue.connection.dispatcher.end('d');
    message.channel.send(songEnd)
    return undefined;
break;
      case "ses":
      const asd1 = new Discord.RichEmbed()
      .setColor("RANDOM")
      .setTitle(`Hata`)
      .setDescription(`Bir sesli kanalda değilsin.`)  
    if (!message.member.voiceChannel) return message.channel.send(asd1);
    const asd2 = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Hata`)
    .setDescription(`Şuanda herhangi bir şarkı çalmıyor.`)
    if (!serverQueue) return message.channel.send(asd2);
    
    let number = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"]
    const yaziolmazamk = new Discord.RichEmbed ()
    .setColor ("RANDOM")
    .setTitle ('HATA')
    .setDescription('Ses Seviyesi Sayı olmalıdır')
  //  if (!args[1] === number) return message.channel.send (yaziolmazamk)
    const volumeLevel = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Ses Seviyesi`)
    .setDescription(`Şuanki Ses Seviyesi: **${serverQueue.volume}**`)
    if(!args [1] === number) return;
    if (!args[1]) return message.channel.send(volumeLevel);
    serverQueue.volume = args[1];
    if (args[1] > 15) return message.channel.send(`Ses seviyesi en fazla \`15\` olarak ayarlanabilir.`)
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
    const volumeLevelEdit = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Ses Seviyesi`)
    .setDescription(`Ayarlanan Ses Seviyesi: **${args[1]}**`)
    return message.channel.send(volumeLevelEdit);
break;
      case "oynatılan":
    if (!serverQueue) return message.channel.send('Hiçbirşey Çalmıyor');
		return message.channel.send(`?? Şu Anda Oynatılan: **${serverQueue.songs[0].title}**`);
break;
      case "kuyruk":
      var siralama = 0;
    if (!serverQueue) return message.channel.send('Şuanda herhangi bir şarkı çalmıyor.');
    const songList10 = new Discord.RichEmbed()
    .setColor("RANDOM")
    .addField(`?? | Şuanda Oynatılan`, `${serverQueue.songs[0].title}`)
    .addField(`? | Şarkı Kuyruğu`, `${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}`)
    return message.channel.send(songList10);
break;
case "duraklat":
      if (serverQueue && serverQueue.playing) {
        serverQueue.playing = false;
        serverQueue.connection.dispatcher.pause();
        const asjdhsaasjdha = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Şarkı Duraklatıldı`)
    .setDescription(`Şarkı başarıyla duraklatıldı.`)
      return message.channel.send(asjdhsaasjdha);
    }
    return message.channel.send('Şuanda herhangi bir şarkı çalmıyor.');
break;
      case "devamet":
      if (serverQueue && !serverQueue.playing) {
        serverQueue.playing = true;
        serverQueue.connection.dispatcher.resume();
        const asjdhsaasjdhaadssad = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Şarkı Devam Ettiriliyor`)
    .setDescription(`Şarkı başarıyla devam ettiriliyor...`)
      return message.channel.send(asjdhsaasjdhaadssad);
    }
    return message.channel.send('Şuanda herhangi bir şarkı çalmıyor.');
  
  return undefined;
break;
}
async function handleVideo(video, message, voiceChannel, playlist = false) {
  var serverQueue = queue.get(message.guild.id);
  //console.log(video);
  var song = {
    id: video.id,
    title: video.title,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
    requester: message.author.id,
  };
  if (!serverQueue) {
    var queueConstruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };
    queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);
    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0]);
    } catch (error) {
      console.error(`Ses kanalına giremedim HATA: ${error}`);
      queue.delete(message.guild.id);
      return message.channel.send(`Ses kanalına giremedim HATA: ${error}`);
    }
  } else {
    serverQueue.songs.push(song);
    //console.log(serverQueue.songs);
    if (playlist) return undefined;
    const songListBed = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setTitle(`Kuyruğa Eklendi`)
    .setDescription(`**${song.title}** adlı şarkı kuyruğa eklendi.`)
    return message.channel.send(songListBed);
  }
  return undefined;
}
  function play(guild, song) {
  var serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  //console.log(serverQueue.songs);
  const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
    .on('end', reason => {
      /*if (reason === 'İnternetten kaynaklı bir sorun yüzünden şarkılar kapatıldı.');
      else console.log(reason);*/
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on('error', error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    
  const playingBed = new Discord.RichEmbed()
  .setColor("RANDOM")
  .setAuthor(`Şarkı Oynatılıyor...`, `http://icons.iconarchive.com/icons/dakirby309/simply-styled/256/YouTube-icon.png`)
  .setDescription(`[${song.title}](${song.url})[<@${song.requester}>]`)
  serverQueue.textChannel.send(playingBed);
}
}); 


client.on('message', msg => {
  if (msg.content.toLowerCase() === 'sa') {
    msg.reply('Aleyküm Selam Knk Hoşgeldin');
  }
});

client.on('message', msg => {
  if (msg.content.toLowerCase() === 'Delta') {
    msg.reply('Delta Force <3');
  }
});

client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.login(ayarlar.token);