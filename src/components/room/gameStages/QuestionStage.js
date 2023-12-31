import React, { useEffect, useState } from 'react'
import { useRoom } from '..'
import { Box, Center, Chip, createStyles, Grid, Image, Radio, Stack, Title } from '@mantine/core'
import Counter from '../../counter'
import Input from '../../input'
import ImageWin from '../../../assets/images/george_correct.jpg'
import ImageLose from '../../../assets/images/george_lose.jpg'
import ImageQuestion from '../../../assets/images/george_think.jpg'

const useStyles = createStyles(theme => ({
  
  image: {
    width: 250,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      width: '50vw',
      maxWidth: 250
    }
  }
}))

const QuestionStage = () => {
  const { classes } = useStyles()
  const { data: room, me } = useRoom()
  const { game } = room
  const { question, answer } = game
  const [sound, setSound] = useState('question.mp3')
  const [georgeImage, setGeorgeImage] = useState(ImageQuestion)

  useEffect(() => {
    if (Boolean(answer)) {
      if (String(me.answer) === String(answer.id)) {
        setSound('correct_answer.mp3')
        setGeorgeImage(ImageWin)
      }
      else {
        if (!me.hasLost) {
          setSound('wrong_answer.mp3')
          setGeorgeImage(ImageLose)
        }
      }
    }
    else {
      setSound('new_round.mp3')
      setTimeout(() => {
        setSound('question.mp3')
      }, [4000])
      setGeorgeImage(ImageQuestion)
    }
  }, [answer, me.answer, me.hasLost])

  return (
    <Stack>
      <audio src={`/audio/${sound}`} autoPlay />
      <Center>
        <Counter count={game.counter} withWarning />
      </Center>
      <Center>
        <Chip variant="filled">{question.category}</Chip>
      </Center>
      <Box className="question-box">
        <Title order={5}>{question.text}</Title>
      </Box>
      {question.image ? <Image src={question.image} alt={question.text} className={classes.image} /> : null}
      {question.chars ? <Title order={3}>{question.chars.map(c => ` ${c} `).join(' ')}</Title> : null}
      {question.options ? <RadioOptions /> : <TextInput />}
      <Center>
        <Image src={georgeImage} width={300} height={200} />
      </Center>
    </Stack>
  )
}

const TextInput = () => {
  const { me, socket } = useRoom()
  const [answer, setAnswer] = React.useState('')

  const handleOnSubmit = () => {
    // prevent onEnter if player answer was already submitted
    if (me.hasAnswered) return false

    // send answer
    socket.emit('submitAnswer', answer)

    // clear answer text input
    setAnswer('')
  }

  return (
    <Input
      name="answer"
      label="Type your answer"
      value={answer}
      onChange={text => setAnswer(text)}
      onEnter={handleOnSubmit}
      disabled={me.hasAnswered}
      size="lg"
    />
  )
}

const RadioOptions = () => {
  const { data: room, me, socket } = useRoom()
  const { question, answer } = room.game

  const handleOnChange = (answer) => {
    // send selected answer
    socket.emit('submitAnswer', answer)
  }

  const getAnswerStyle = (option) => {
    let className = 'answer-box'

    if (answer) {      
      if (String(option.id) === String(answer.id)) {
        className += ' correct'
      }
      else {
        if (me.answer) {
          if (String(me.answer) === String(option.id)) {
            className += ' wrong'
          }
        }  
      }
    }
    else {
      if (me.answer) {
        if (String(me.answer) === String(option.id)) {
          className += ' active'
        }
      }
    }

    return className
  }

  return (
    <Radio.Group
      name="answer"
      // onChange={handleOnChange}
      value={me.answer}
      orientation="vertical"
    >
      <Grid gutter="xs" align="center">
        {question.options.map(option => (
          <Grid.Col md={6}>
            <Box className={getAnswerStyle(option)} onClick={() => handleOnChange(option.id)}>
              <Radio
                value={option.id}
                label={option.text}
                disabled={me.hasAnswered || me.hasLost}
              />
            </Box>
          </Grid.Col>
        ))}
      </Grid>
    </Radio.Group>
  )
}

export default QuestionStage