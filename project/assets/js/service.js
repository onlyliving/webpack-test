// service.js

'use strict';

import {common} from './common.js';
import Swiper from 'swiper';
// import 'swiper/dist/css/swiper.min.css'
import '../css/reset.css';
import '../css/service.css';

function component() {
  let element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());
common;

var swiper = new Swiper('.swiper-container');
