import { create } from 'zustand';
import { createScenarioSlice } from './scenarioSlice';
import { createBlockSlice } from './blockSlice';
import { createSyncSlice } from './syncSlice';

export const useDateStore = create((set, get) => ({
    ...createScenarioSlice(set, get),
    ...createBlockSlice(set, get),
    ...createSyncSlice(set, get),
}));