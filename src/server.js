// This file is a wrapper for setup.ts to ensure a server.js exists in the build
import { startApp } from './boot/setup.js';

// Start the application
startApp();
