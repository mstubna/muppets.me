import 'typeface-montserrat'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  makeStyles,
  ThemeProvider,
  duration,
  createMuiTheme,
  responsiveFontSizes,
} from '@material-ui/core/styles'
import DownloadIcon from '@material-ui/icons/GetAppTwoTone'

import { Helmet } from 'react-helmet'
import {
  Button,
  CircularProgress,
  CssBaseline,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Slider,
  Slide,
  TextField,
  Typography,
} from '@material-ui/core'
import { useDropzone } from 'react-dropzone'
import { header, icon } from '../images'
import '../index.css'
import { resizeImage, compositeText, uploadImage, downloadImage } from '../utilities'

const theme = responsiveFontSizes(
  createMuiTheme({
    typography: {
      fontSize: 20,
      fontFamily: "'Montserrat', 'Helvetica', 'Arial', sans-serif",
      useNextVariants: true,
    },
    palette: {
      background: { default: '#f5f5f5' },
      primary: { main: '#263238' },
      secondary: { main: '#0d47a1' },
      action: {
        disabled: '#263238e1',
      },
    },
    shape: {
      borderRadius: 4,
    },
    shadows: ['none'],
    overrides: {},
  })
)

const useStyles = makeStyles({
  header: {
    width: '100%',
    marginTop: 20,
  },
  radioLabel: {
    marginBottom: 20,
  },
  inputContainer: {},
  textInput: {
    marginTop: 20,
    marginBottom: 20,
  },
  transitionContainer: {
    minHeight: 240,
  },
  slideContainer: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  sliderLabel: {
    fontSize: '1rem',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.3rem',
    },
    marginTop: 40,
    marginBottom: -20,
  },
  slider: {
    marginTop: 20,
    marginBottom: 40,
  },
  sliderMark: {
    fontSize: 12,
  },
  dragAndDrop: {
    width: '100%',
    border: `4px dashed ${theme.palette.secondary.main}`,
    borderRadius: theme.shape.borderRadius,
    textAlign: 'center',
    outline: 'none',
  },
  resultImage: {
    width: '90%',
    maxWidth: 500,
  },
  imageUploading: {
    position: 'relative',
    width: '90%',
    maxWidth: 500,
  },
  imageUploadingImage: {
    width: '100%',
  },
  loaderContainer: {
    background: '#0000004d',
    position: 'absolute',
    top: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  error: {
    width: '80%',
    textAlign: 'center',
  },
  actionButtonGroup: {
    marginTop: -20,
    marginBottom: 10,
  },
  buttonGroup: {
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    marginLeft: 14,
    marginRight: 14,
    marginBottom: 8,
    paddingRight: 30,
    paddingLeft: 30,
    minWidth: 100,
    [theme.breakpoints.up('sm')]: {
      minWidth: 180,
    },
  },
  linkGroup: {
    marginTop: 40,
    marginBottom: 30,
  },
  linkFont: {
    fontSize: 10,
    [theme.breakpoints.up('sm')]: {
      fontSize: 12,
    },
  },
  link: {
    textDecoration: 'none',
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.secondary.main,
    },
  },
  span: {
    marginLeft: 6,
  },
})

// hook for tracking the previous value of a stateful variable
const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const Dropzone = ({ className, disabled, onLoad }) => {
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()

      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.onload = () => {
        const str = reader.result
        if (onLoad) {
          resizeImage(str, onLoad)
        }
      }
      reader.readAsDataURL(file)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: 'image/*',
    disabled,
  })

  return (
    <div className={className} {...getRootProps()}>
      <input {...getInputProps()} />
      <p>
        {disabled ? (
          <span>
            Image selected,
            <br />
            tap Next
          </span>
        ) : (
          <span>
            Drag and drop
            <br />
            or tap to select image
          </span>
        )}
      </p>
    </div>
  )
}

const IndexPage = (props) => {
  const classes = useStyles()
  const [step, setStep] = useState(0)
  const prevStep = usePrevious(step)
  const [choice, setChoice] = useState('')
  const [text, setText] = useState('')
  const [image, setImage] = useState('')
  const [green, setGreen] = useState(0)
  const [red, setRed] = useState(0)
  const [blue, setBlue] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [result, setResult] = useState('')

  const handleTextChange = (e) => {
    setText(e.target.value)
  }

  const directionForStepIndex = (stepIndex) => {
    return (step === stepIndex && prevStep === stepIndex - 1) ||
      prevStep === undefined ||
      (step === stepIndex - 1 && prevStep === stepIndex)
      ? 'left'
      : 'right'
  }

  const handleChoice = ({ target: { value } }) => {
    setChoice(value)
  }

  const handleReset = () => {
    setChoice('')
    setText('')
    setImage('')
    setGreen(0)
    setRed(0)
    setBlue(0)
    setStep(0)
    setResult('')
    setErrorMessage('')
    setUploading(false)
  }

  const handleBack = () => {
    if (step === 0) {
      return
    }
    setImage('')
    setResult('')
    setStep(step - 1)
  }

  const handleNext = () => {
    if (step === 1) {
      if (choice === 'text') {
        compositeText({ green, blue, red }, text, (data) => {
          setImage(data)
          handleImageUpload(data)
        })
      } else {
        handleImageUpload(image)
      }
      setStep(step + 1)
      return
    }
    if (step < 2) {
      setStep(step + 1)
      return
    }
    handleReset()
  }

  const handleImageUpload = async (data) => {
    try {
      setUploading(true)
      setErrorMessage('')
      const newImage = await uploadImage(data)
      setResult(newImage)
    } catch (err) {
      console.error(err)
      setErrorMessage('There was a problem creating your image, please try again 😢')
    } finally {
      setUploading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>Muppets.me</title>
        <meta property='og:title' content='Muppets.me' />
        <meta property='og:description' content='Muppets mosaic generator' />
        <meta property='og:image' content={`https://muppets.me${icon}`} />
        <meta property='og:url' content='https://muppets.me' />
        <meta name='twitter:title' content='Muppets.me' />
        <meta name='twitter:description' content='Muppets mosaic generator' />
        <meta name='twitter:image' content={`https://muppets.me${icon}`} />
        <meta name='twitter:card' content='summary' />
      </Helmet>
      <CssBaseline />
      <div style={{ overflow: 'hidden' }}>
        <Grid container justify='center' alignItems='center'>
          <Grid item container xs={6} sm={5} md={4}>
            <a href='/'>
              <img src={header} className={classes.header} alt='Muppets.me' />
            </a>
          </Grid>
        </Grid>
        <Grid
          className={classes.transitionContainer}
          item
          container
          direction='column'
          justify='center'
          alignItems='center'
          xs={12}
        >
          <Slide
            key='choice'
            className={classes.slideContainer}
            direction={directionForStepIndex(0)}
            in={step === 0}
            timeout={!prevStep && step === 0 ? 0 : duration.standard}
            mountOnEnter
            unmountOnExit
            exit={false}
          >
            <Grid
              className={classes.inputContainer}
              container
              direction='column'
              justify='center'
              alignItems='center'
              item
              xs={10}
              sm={8}
              md={6}
              lg={5}
            >
              <Typography className={classes.radioLabel} variant='body1'>
                Muppets me using ...
              </Typography>
              <RadioGroup name='choice' value={choice} onChange={handleChoice}>
                <FormControlLabel value='text' control={<Radio />} label='My name' />
                <FormControlLabel value='image' control={<Radio />} label='My face' />
              </RadioGroup>
            </Grid>
          </Slide>

          <Slide
            key='text'
            className={classes.slideContainer}
            direction={directionForStepIndex(1)}
            in={step === 1 && choice === 'text'}
            mountOnEnter
            unmountOnExit
            exit={false}
          >
            <Grid
              className={classes.inputContainer}
              container
              direction='row'
              justify='center'
              alignItems='center'
              item
              xs={10}
              sm={8}
              md={6}
              lg={5}
            >
              <TextField
                className={classes.textInput}
                fullWidth
                color='primary'
                type='text'
                variant='outlined'
                placeholder='Your text'
                value={text}
                onChange={handleTextChange}
              />
              <Typography className={classes.sliderLabel} variant='body2' color='primary'>
                How Kermit are you?
              </Typography>

              <Slider
                className={classes.slider}
                classes={{ markLabel: classes.sliderMark }}
                defaultValue={0}
                step={1}
                marks={[
                  { value: 0, label: '🟢' },
                  { value: 1, label: '🟢🟢' },
                  { value: 2, label: '🟢🟢🟢' },
                  { value: 3, label: '🟢🟢🟢🟢' },
                ]}
                min={0}
                max={3}
                value={green}
                onChange={(e, value) => setGreen(value)}
              />

              <Typography className={classes.sliderLabel} variant='body2' color='primary'>
                How Gonzo are you?
              </Typography>
              <Slider
                className={classes.slider}
                classes={{ markLabel: classes.sliderMark }}
                defaultValue={0}
                step={1}
                marks={[
                  { value: 0, label: '🔵' },
                  { value: 1, label: '🔵🔵' },
                  { value: 2, label: '🔵🔵🔵' },
                  { value: 3, label: '🔵🔵🔵🔵' },
                ]}
                min={0}
                max={3}
                value={blue}
                onChange={(e, value) => setBlue(value)}
              />

              <Typography className={classes.sliderLabel} variant='body2' color='primary'>
                How Animal are you?
              </Typography>
              <Slider
                className={classes.slider}
                classes={{ markLabel: classes.sliderMark }}
                defaultValue={0}
                step={1}
                marks={[
                  { value: 0, label: '🔴' },
                  { value: 1, label: '🔴🔴' },
                  { value: 2, label: '🔴🔴🔴' },
                  { value: 3, label: '🔴🔴🔴🔴' },
                ]}
                min={0}
                max={3}
                value={red}
                onChange={(e, value) => setRed(value)}
              />
            </Grid>
          </Slide>

          <Slide
            key='image'
            className={classes.slideContainer}
            direction={directionForStepIndex(1)}
            in={step === 1 && choice === 'image'}
            mountOnEnter
            unmountOnExit
            exit={false}
          >
            <Grid
              className={classes.inputContainer}
              container
              direction='row'
              justify='center'
              alignItems='center'
              item
              xs={10}
              sm={8}
              md={6}
              lg={5}
            >
              <Dropzone className={classes.dragAndDrop} onLoad={setImage} disabled={!!image} />
            </Grid>
          </Slide>

          <Slide
            key='result'
            className={classes.slideContainer}
            direction={directionForStepIndex(2)}
            in={step === 2}
            mountOnEnter
            unmountOnExit
            exit={false}
          >
            <Grid container direction='row' justify='center' alignItems='center' spacing={0}>
              <Grid
                container
                item
                direction='column'
                justify='center'
                alignItems='center'
                xs={12}
                spacing={0}
              >
                {errorMessage && <p className={classes.error}>{errorMessage}</p>}
                {uploading && image && (
                  <>
                    <p>Processing...</p>
                    <div className={classes.imageUploading}>
                      <img className={classes.imageUploadingImage} src={image} alt='Me' />
                      <div className={classes.loaderContainer}>
                        <CircularProgress color='secondary' size={140} thickness={4} />
                      </div>
                    </div>
                  </>
                )}
                {result && (
                  <>
                    <p>Your Muppets me:</p>
                    <img className={classes.resultImage} src={result} alt='Muppet me' />
                  </>
                )}
              </Grid>
            </Grid>
          </Slide>
        </Grid>
        {step === 2 && result && (
          <Grid
            className={classes.actionButtonGroup}
            item
            container
            direction='row'
            justify='center'
            alignItems='center'
            xs={12}
          >
            <Button
              className={classes.button}
              color='secondary'
              variant='text'
              size='small'
              onClick={() => downloadImage(result)}
            >
              <DownloadIcon />
              &nbsp;Download mosaic
            </Button>
          </Grid>
        )}
        <Grid
          className={classes.buttonGroup}
          item
          container
          direction='row'
          justify='center'
          alignItems='center'
          xs={12}
        >
          {step > 0 && (
            <Button
              className={classes.button}
              color='secondary'
              variant='contained'
              size='small'
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          <Button
            className={classes.button}
            color='secondary'
            variant='contained'
            size='small'
            disabled={(step === 0 && !choice) || (step === 1 && choice === 'image' && !image)}
            onClick={handleNext}
          >
            {step === 2 ? 'Start over' : 'Next'}
          </Button>
        </Grid>
        {(step === 0 || step === 2) && (
          <Grid
            className={classes.linkGroup}
            item
            xs={10}
            container
            direction='row'
            justify='flex-end'
          >
            <Typography
              className={classes.linkFont}
              variant='body1'
              color='textSecondary'
              align='right'
            >
              <span>
                Questions? Watch the{' '}
                <a className={classes.link} href='https://twitter.com/GLucasTalkShow'>
                  George Lucas Talk Show
                </a>
              </span>
              <br />
              Past shows:
              <span className={classes.span}>
                <a className={classes.link} href='https://studio60.me'>
                  Studio60.me
                </a>
              </span>
              <span className={classes.span}>
                <a className={classes.link} href='https://biglake.me'>
                  BigLake.me
                </a>
              </span>
              <span className={classes.span}>
                <a className={classes.link} href='https://1600penn.me'>
                  1600Penn.me
                </a>
              </span>
              <span className={classes.span}>
                <a className={classes.link} href='https://arliss.me'>
                  Arliss.me
                </a>
              </span>
              <br />
              {step === 2 && (
                <>
                  <span>
                    Muppet images courtesy of{' '}
                    <a
                      className={classes.link}
                      href='https://muppet.fandom.com/wiki/Category:The_Muppets_Characters'
                    >
                      The Muppet Wiki
                    </a>
                  </span>
                  <br />
                </>
              )}
              <span>
                <a className={classes.link} href='https://github.com/mstubna/muppets.me'>
                  Source
                </a>
              </span>
            </Typography>
          </Grid>
        )}
      </div>
    </ThemeProvider>
  )
}

export default IndexPage
