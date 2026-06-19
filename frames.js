const frames = {}; // { serverId: { player: base64 } }

function setFrame(serverId, player, data) {
  if (!frames[serverId]) frames[serverId] = {};
  frames[serverId][player] = data;
}

function getFrames(serverId) {
  return frames[serverId] || {};
}

module.exports = {
  setFrame,
  getFrames
};