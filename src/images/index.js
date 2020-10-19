import header from './header.png'
import icon from './icon.png'

const backgrounds = {}
for (const i of [1, 2, 3, 4]) {
  backgrounds[`red${i}`] = require(`./backgroundRed${i}.png`)
  backgrounds[`blue${i}`] = require(`./backgroundBlue${i}.png`)
  backgrounds[`green${i}`] = require(`./backgroundGreen${i}.png`)
}

export { header, icon, backgrounds }
