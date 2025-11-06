import { Command } from 'commander';
import { MainConstants } from './constants/main-constants';
import { createCommander } from './cli/cli';

const program = createCommander();

program.parse();
