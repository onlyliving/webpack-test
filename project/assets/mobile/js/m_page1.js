// m_page2.js

'use strict';
import {common} from '../../../assets/js/common.js';
import '../css/reset.css';
import '../css/m_page1.css';
import _ from 'lodash';

function component() {
  let element = document.createElement('div');

  element.innerHTML = _.join(['m_page1'], ' ');

  return element;
}

document.body.appendChild(component());
common;