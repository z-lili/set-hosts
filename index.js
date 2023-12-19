const fs = require('fs')
const net = require('net')
const chalk = require('chalk')

const WINDOWS = process.platform === 'win32'
// 换行符
const EOL = WINDOWS
  ? '\r\n'
  : '\n'

exports.HOSTS = WINDOWS
  ? 'C:/Windows/System32/drivers/etc/hosts'
  : '/etc/hosts'

exports.getFile = function (filePath, preserveFormatting) {
  let lines = []
  fs.readFileSync(filePath, { encoding: 'utf8' }).split(/\r?\n/).forEach(online)
  return lines

  function online(line) {
    // 移除注释
    let lineSansComments = line.replace(/#.*/, '')
    // 正则捕获组[整个匹配的文本,ip,host]
    let matches = /^\s*?(.+?)\s+(.+?)\s*$/.exec(lineSansComments)
    if (matches && matches.length === 3) {
      let ip = matches[1]
      let host = matches[2]
      lines.push([ip, host])
    } else {
      // 匹配失败，说明这一行可能是一个注释、空白行或其他非主机条目
      if (preserveFormatting) {
        lines.push(line)
      }
    }
  }
}

// 修改或添加条目
exports.set = function (ip, host) {
  let didUpdate = false
  let flag = false
  return _set(exports.getFile(exports.HOSTS))

  function _set(lines) {
    lines = lines.map(mapFunc)
    if (!didUpdate) {
      // 无更新 插入最后
      let lastLine = lines[lines.length - 1]
      if (typeof lastLine === 'string' && /\s*/.test(lastLine)) {
        lines.splice(lines.length - 1, 0, [ip, host])
      } else {
        lines.push([ip, host])
      }
    }
    flag || exports.writeFile(lines, host)
  }

  function mapFunc(line) {
    // host相同，更新ip 两个都相同，不执行写入
    if (Array.isArray(line) && line[1] === host && net.isIP(line[0]) !== net.isIP(ip)) {
      line[0] = ip
      didUpdate = true
      return line
    }
    if (Array.isArray(line) && line[1] === host && net.isIP(line[0]) === net.isIP(ip)) {
      flag = true
      didUpdate = true
      return line
    }
    return line
  }
}

// 写入
exports.writeFile = function (lines, host) {
  lines = lines.map(function (line, lineNum) {
    if (Array.isArray(line)) {
      line = line[0] + ' ' + line[1]
    }
    // 在每一行的末尾添加换行符，除了最后一行。
    return line + (lineNum === lines.length - 1 ? '' : EOL)
  })
  let stat = fs.statSync(exports.HOSTS)
  fs.writeFileSync(exports.HOSTS, lines.join(''), { mode: stat.mode })
  console.log(chalk.green('add success ' + host))
  return true
}