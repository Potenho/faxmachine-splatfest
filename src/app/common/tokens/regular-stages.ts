import { InjectionToken } from '@angular/core';
import { version } from '../../../../package.json';

export const REGULAR_STAGES = new InjectionToken<{ id: number; name: string }[]>('REGULAR_STAGES', {
  factory: () => [
    { 
      id: 0,
      name: 'Urchin Underpass',
    },
    {
      id: 1,
      name: 'Walleye Warehouse',
    },
    {
      id: 2,
      name: 'Saltspray Rig',
    },
    {
      id: 3,
      name: 'Arowana Mall',
    },
    {
      id: 4,
      name: 'Blackbelly Skatepark',
    },
    {
      id: 5,
      name: 'Camp Triggerfish',
    },
    {
      id: 6,
      name: 'Port Mackerel',
    },
    {
      id: 7,
      name: 'Kelp Dome',
    },
    {
      id: 8,
      name: 'Moray Towers',
    },
    {
      id: 9,
      name: 'Bluefin Depot',
    },
    {
      id: 10,
      name: 'Hammerhead Bridge',
    },
    {
      id: 11,
      name: 'Flounder Heights',
    },
    {
      id: 12,
      name: "Museum D'Alfonsino",
    },
    {
      id: 13,
      name: 'Ancho-V Games',
    },
    {
      id: 14,
      name: 'Piranha Pit',
    },
    {
      id: 15, 
      name: 'Mahi-Mahi Resort',
    }
  ],
});
