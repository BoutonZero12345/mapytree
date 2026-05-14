import { create } from 'zustand';
import { createScenarioSlice } from './scenarioSlice';
import { createBlockSlice } from './blockSlice';
import { createSyncSlice } from './syncSlice';
import { createFavoriteSlice } from './favoriteSlice';

export const useDateStore = create((set, get) => ({
    ...createScenarioSlice(set, get),
    ...createBlockSlice(set, get),
    ...createSyncSlice(set, get),
    ...createFavoriteSlice(set, get),
}));