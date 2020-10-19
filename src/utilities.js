import axios from 'axios'
import FileType from 'file-type/browser'
import { backgrounds } from './images'
const API = 'https://api.muppets.me/muppetsmosaicgenerator'
const MAXSIZE = 500

const resizeImage = (data, onDone) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const image = new Image()
  image.onload = function () {
    const [width, height] = [image.naturalWidth, image.naturalHeight]
    console.log(`original dimensions: ${width}w, ${height}h`)
    const maxDim = Math.max(width, height)
    const scaleFactor = MAXSIZE / maxDim
    const [newWidth, newHeight] = [width * scaleFactor, height * scaleFactor]
    console.log(`new dimensions: ${newWidth}w, ${newHeight}h`)
    canvas.width = newWidth
    canvas.height = newHeight
    ctx.drawImage(image, 0, 0, newWidth, newHeight)
    if (onDone) {
      onDone(canvas.toDataURL('image/jpeg', 90))
    }
  }
  image.src = data
}

const compositeText = ({ green, blue, red }, text, onDone) => {
  const canvas = document.createElement('canvas')
  Object.assign(canvas, { width: MAXSIZE, height: MAXSIZE })
  const ctx = canvas.getContext('2d')

  const addText = () => {
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold 100px sans-serif'
    ctx.fillStyle = '#fff'
    const strs = text.split(/\s/).map((str) => str.trim())
    strs.forEach((str, index) => {
      ctx.fillText(str.toUpperCase(), 250, 320 - 50 * strs.length + 100 * index, 500)
    })
  }

  const image1 = new Image()
  image1.onload = function () {
    ctx.drawImage(image1, 0, 0, MAXSIZE, MAXSIZE)

    const image2 = new Image()
    image2.onload = function () {
      ctx.drawImage(image2, 0, 0, MAXSIZE, MAXSIZE)

      const image3 = new Image()
      image3.onload = function () {
        ctx.drawImage(image3, 0, 0, MAXSIZE, MAXSIZE)

        addText()
        if (onDone) {
          onDone(canvas.toDataURL('image/png', 90))
        }
      }
      image3.src = backgrounds[`blue${blue + 1}`]
    }
    image2.src = backgrounds[`green${green + 1}`]
  }
  image1.src = backgrounds[`red${red + 1}`]
}

const stripPrefixFromImage = (data) => {
  return data.replace(/^data:image\/[a-z]+;base64,/, '')
}

const addPrefixToImage = async (data) => {
  const fileType = await getMimeFromImage(data)
  return `data:${fileType.mime};base64,${data}`
}

const getMimeFromImage = async (data) => {
  const imageData = stripPrefixFromImage(data)
  return FileType.fromBuffer(Buffer.from(imageData, 'base64'))
}

const uploadImage = async (data) => {
  // await new Promise((resolve) => setTimeout(resolve, 2000000))
  // return data
  const image = stripPrefixFromImage(data)
  const response = await axios.post(API, { image })
  return addPrefixToImage(response.data.image)
}

const downloadImage = async (data) => {
  const fileType = await getMimeFromImage(data)
  var a = document.createElement('a')
  a.href = data
  a.download = `Muppetsme.${fileType.ext}`
  a.click()
}

const isValidEmail = (str) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(str).toLowerCase())
}

const sendEmail = async (data, email) => {
  const image = stripPrefixFromImage(data)
  await axios.post(API, { image, email })
}

export { resizeImage, compositeText, uploadImage, downloadImage, isValidEmail, sendEmail }
