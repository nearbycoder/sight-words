import { default as wordsArray } from './words';
import shuffle from 'lodash/shuffle';

export const words = shuffle(wordsArray);
