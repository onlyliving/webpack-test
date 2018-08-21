// index.js

'use strict';

import {common} from './common.js';
import '../css/reset.css';
import '../css/index.css';
import _ from 'lodash';

function component() {
  let element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());
common;