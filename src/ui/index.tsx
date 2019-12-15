'use strict';

import React from 'react';
import reactDOM from 'react-dom';
import { CTXRouter } from './components/ctx-router/ctx-router';

document.addEventListener('DOMContentLoaded', () => {
	reactDOM.render(<CTXRouter />, document.querySelector('#app'));
}, false);