const Game = require('..')
const gpt = require('../../../services/gpt')


class ChoicesGame extends Game {

  /**
   * is game active?
   * 
   * @type {Boolean}
   */
  static __isActive = true

  /**
   * Init game
   */
  constructor(props) {
    super('choices', 'choose answer from multiple choices', props)
  }

  /**
   * construct questions array
   * 
   * 
   */
  async buildRounds(retry = true) {
    try {
      const data = await gpt.GenerateMultipleChiocesQuestion({ categories: ['Politics', 'Geography'], instructinos: 'extremely hard questions' })

      const q = this.buildQuestion(data)
      this.__questions.push(q)
      return this.__questions
    }
    catch(e) {
      if (retry) {
        this.buildRounds(false)
      }
      else {
        console.log('Failed to generate questions!')
        // throw new Error('Failed to generate questions!')
      }
    }
  }

  /**
   * construct question object
   * 
   * @param {Array} data question data
   * 
   * @return {Object}
   */
  buildQuestion(data) {
    const { question, options, answer, category } = data
    console.log(question, answer, options)

    return {
      text: question,
      options,
      answer,
      category,
    }
  }


  /**
   * complete one more question
   * 
   * 
   */
  async completeQuestions() {
    await this.buildRounds()
    if (this.__questions.length < this.rounds) {
      await this.completeQuestions()
    }
  }

  /**
   * calculate players scoring in current round
   * 
   */
  setPlayersScoreInRound() {
    // get in game players
    this.__roomInstance.getInGamePlayers()

    // filter players that didn't submit an answer
    .filter(p => p.hasAnswered)

    // loop and calculate
    .forEach((player, _, players) => {
      // if he answered right
      if (String(player.__answer) === String(this.answer.id)) {
        // add positive score points
        player.setScoreInRound(1)
      }

      // if he answered wrong
      else {
        // add negative score points
        player.setScoreInRound(-1)
      }

      // clear player answer
      player.clearAnswer()
    })
  }
}


module.exports = ChoicesGame