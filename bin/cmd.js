#!/usr/bin/env node

const net = require('net')
const hostile = require('../')
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2))

const command = argv._[0]
if (command === 'set') {
  set(argv._[1], argv._[2])
}

function set(ip, host) {
  if (!ip || !host) {
    return error('Invalid syntax: hostile set <ip> <host>')
  }

  if (ip === 'local' || ip === 'localhost') {
    ip = '127.0.0.1'
  } else if (!net.isIP(ip)) {
    return error('Invalid IP address')
  }

  try {
    hostile.set(ip, host)
  } catch (err) {
    return error('Error: ' + err.message + '. Are you running as root?')
  }
}

module.exports = {
  set
}