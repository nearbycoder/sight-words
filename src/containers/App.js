import React, { Component } from 'react';
import styled from 'styled-components';
import { words } from '../lib';
import shuffle from 'lodash/shuffle';
import Confetti from 'react-confetti';
import { Grid, Cell } from 'styled-css-grid';
import { lighten } from 'polished';

const Word = styled.div`
  @import url('https://fonts.googleapis.com/css?family=Roboto');
  font-family: 'Roboto', sans-serif;
  display: inline-block;
  width: 100%;
  font-size: 30px;
  background-color: #29b6f6;
  border-radius: 5px;
  text-align: center;
  padding: 20px 0;
  color: white;
  cursor: pointer;
  &:active {
    background-color: #d32f2f;
  }
  &:hover {
    background-color: ${lighten(0.2, '#29b6f6')};
    ${props =>
      props.actualWord &&
      `
      background-color: ${lighten(0.2, '#d32f2f')};
    `};
  }
`;

export default class App extends Component {
  defaultState = {
    words: words.slice(0, 20),
    voices: [],
    activeVoiceIndex: 0,
    wordTarget: null,
    score: 0,
    tries: 3,
    addedPoint: false,
    easyMode: false
  };
  state = this.defaultState;

  constructor() {
    super();

    speechSynthesis.onvoiceschanged = () => {
      const voices = speechSynthesis.getVoices();
      this.setState({ voices });
    };
  }

  handleVoiceChange = e => {
    this.setState({ activeVoiceIndex: e.target.value });
  };

  handleWinOrLose = word => {
    if (this.state.wordTarget === word) {
      if (this.state.easyMode) {
        this.sayWord('No Confetti for you');
      } else {
        this.sayWord('Your a winner');
      }

      this.setState(
        {
          words: shuffle(this.state.words),
          score: this.state.score + 1,
          wordTarget: this.randomWord
        },
        () => {
          this.changeWord;
        }
      );
    } else {
      this.setState({ tries: this.state.tries - 1 }, () => {
        if (this.state.tries <= 0) {
          this.sayWord('Game Over');
        } else {
          this.sayWord(
            `Please Try Again You have ${this.state.tries} tries left`
          );
        }
      });
    }
  };

  get randomWord() {
    return this.state.words[
      Math.floor(Math.random() * this.state.words.length)
    ];
  }

  handleToggleEasyMode = () => {
    this.setState({ easyMode: !this.state.easyMode });
  };

  componentWillMount = () => {
    this.setState(
      {
        wordTarget: this.randomWord
      },
      () => {
        this.changeWord;
      }
    );
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevState.score !== this.state.score &&
      this.state.addedPoint !== true &&
      !this.state.easyMode
    ) {
      this.setState({ addedPoint: true });
      setTimeout(() => {
        this.setState({ addedPoint: false });
      }, 6000);
    } else if (prevState.tries !== this.state.tries) {
      this.setState({ addedPoint: false });
    }
  };

  sayWord = word => {
    const message = new SpeechSynthesisUtterance(word);
    message.voice = this.state.voices[this.state.activeVoiceIndex];
    speechSynthesis.speak(message);
  };

  get changeWord() {
    this.sayWord(`The next word is ... ${this.state.wordTarget}`);
  }

  reset = () => {
    this.setState(
      {
        ...this.defaultState,
        activeVoiceIndex: this.state.activeVoiceIndex,
        wordTarget: this.randomWord,
        voices: this.state.voices
      },
      () => {
        this.changeWord;
      }
    );
  };

  render() {
    const {
      voices,
      wordTarget,
      score,
      tries,
      addedPoint,
      easyMode
    } = this.state;

    if (tries <= 0) {
      return (
        <div>
          You Lost, <button onClick={this.reset}>Play Again</button>
        </div>
      );
    }
    return (
      <div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}>
          {addedPoint && (
            <Confetti
              recycle={false}
              width={window.innerWidth}
              height={window.innerHeight}
            />
          )}
        </div>
        {easyMode && <div>Easy Mode</div>}
        <div>Tries Left {tries}</div>
        <div>Your Current Score is {score}</div>
        <button onClick={this.handleToggleEasyMode}>Toggle Easy Mode</button>
        <button onClick={() => this.sayWord(wordTarget)}>Repeats Word</button>
        <select onChange={this.handleVoiceChange}>
          {voices.map((voice, index) => (
            <option value={index} key={index}>
              {voice.name}
            </option>
          ))}
        </select>
        <Grid
          style={{ padding: '20px' }}
          columns="repeat(auto-fill, minmax(150px, 1fr))">
          {this.state.words.map((word, index) => (
            <Cell key={index} width={1}>
              <Word
                actualWord={easyMode && word === wordTarget}
                onClick={() => this.handleWinOrLose(word)}>
                {word}
              </Word>
            </Cell>
          ))}
        </Grid>
      </div>
    );
  }
}
