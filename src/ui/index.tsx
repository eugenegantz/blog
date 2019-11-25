'use strict';

import React from 'react';
import reactDOM from 'react-dom';
import { PPage } from './components/p-page/p-page';

document.addEventListener('DOMContentLoaded', () => {
	reactDOM.render(<PPage />, document.querySelector('#app'));
}, false);