export const PLAY_STORE_DEMO_SEED_KEY = 'play_store_demo_seeded';

export type DemoPastMessage = {
  type: 'simple' | 'reminder' | 'alarm';
  body: string;
  daysAgo: number;
  hour: number;
  minute: number;
};

export type DemoFutureMessage = {
  type: 'reminder' | 'alarm';
  body: string;
  daysFromNow: number;
  hour: number;
  minute: number;
};

export type DemoPeriodic = {
  body: string;
  intervalMinutes: number;
  createdDaysAgo: number;
};

export type DemoChat = {
  id: string;
  title: string;
  icon: string;
  past: readonly DemoPastMessage[];
  future: readonly DemoFutureMessage[];
  periodics: readonly DemoPeriodic[];
};

export const DEMO_CHATS: readonly DemoChat[] = [
  {
    id: 'demo-midnight-fridge',
    title: 'Midnight Fridge',
    icon: 'food-drink-pizza',
    past: [
      {
        type: 'simple',
        body: 'Opened the fridge for water. Left with a plot twist and no water.',
        daysAgo: 8,
        hour: 22,
        minute: 11,
      },
      {
        type: 'alarm',
        body: "3:07 AM. The cheese is louder than your conscience.",
        daysAgo: 8,
        hour: 3,
        minute: 7,
      },
      {
        type: 'reminder',
        body: "Eat a vegetable that isn't ketchup. Ketchup is lobbying hard.",
        daysAgo: 7,
        hour: 19,
        minute: 30,
      },
      {
        type: 'simple',
        body: 'Ketchup is a vegetable. I have sources. The sources are me.',
        daysAgo: 7,
        hour: 20,
        minute: 15,
      },
      {
        type: 'reminder',
        body: 'Lunch is not three handfuls of cereal over the sink. Allegedly.',
        daysAgo: 6,
        hour: 12,
        minute: 4,
      },
      {
        type: 'alarm',
        body: 'THE YOGURT EXPIRES TODAY. This is a hostage situation.',
        daysAgo: 6,
        hour: 6,
        minute: 45,
      },
      {
        type: 'simple',
        body: 'Named the leftover takeout. His name is Gary. Gary has rights.',
        daysAgo: 5,
        hour: 23,
        minute: 40,
      },
      {
        type: 'reminder',
        body: 'Do not negotiate with Gary. Eat Gary. History will understand.',
        daysAgo: 5,
        hour: 18,
        minute: 0,
      },
      {
        type: 'simple',
        body: 'Made coffee. Declared it a complete breakfast. Science blinked first.',
        daysAgo: 4,
        hour: 8,
        minute: 20,
      },
      {
        type: 'alarm',
        body: 'STOP STARING INTO THE LIGHT. The fridge is not a portal.',
        daysAgo: 4,
        hour: 1,
        minute: 12,
      },
      {
        type: 'reminder',
        body: 'Close the door. Your electricity bill just wrote a sad poem.',
        daysAgo: 3,
        hour: 21,
        minute: 0,
      },
      {
        type: 'simple',
        body: 'Closed it. Opened it again. The poem got a sequel.',
        daysAgo: 3,
        hour: 21,
        minute: 5,
      },
      {
        type: 'reminder',
        body: "Drink water. Pretend it's a craft beverage called H2-Whoa.",
        daysAgo: 2,
        hour: 13,
        minute: 40,
      },
      {
        type: 'alarm',
        body: "BAKERY WINDOW. Croissants don't wait for the unprepared.",
        daysAgo: 2,
        hour: 7,
        minute: 10,
      },
      {
        type: 'simple',
        body: 'Snack inventory complete. Morale: excellent. Nutrition: in hiding.',
        daysAgo: 1,
        hour: 22,
        minute: 50,
      },
      {
        type: 'reminder',
        body: 'The bananas are becoming sentient. Smoothie them before they unionize.',
        daysAgo: 1,
        hour: 9,
        minute: 15,
      },
      {
        type: 'simple',
        body: 'Toast landed butter-side up. I do not trust it.',
        daysAgo: 0,
        hour: 8,
        minute: 2,
      },
      {
        type: 'alarm',
        body: 'You are not hungry. You are bored with extra steps.',
        daysAgo: 0,
        hour: 0,
        minute: 18,
      },
    ],
    future: [
      {
        type: 'reminder',
        body: 'Buy milk. The carton has been performing jazz for two days.',
        daysFromNow: 1,
        hour: 10,
        minute: 0,
      },
      {
        type: 'alarm',
        body: 'FARMERS MARKET. Get there before the nice tomatoes join a cult.',
        daysFromNow: 2,
        hour: 7,
        minute: 45,
      },
    ],
    periodics: [
      {
        body: "Hourly snack census. Raise your hand if it was 'just one more'.",
        intervalMinutes: 60,
        createdDaysAgo: 4,
      },
      {
        body: 'Daily check: drink water or slowly become a raisin. Your call.',
        intervalMinutes: 1440,
        createdDaysAgo: 6,
      },
    ],
  },
  {
    id: 'demo-gym-allegedly',
    title: 'Gym? Allegedly',
    icon: 'ecology-growth-plant',
    past: [
      {
        type: 'simple',
        body: 'I stretched. Reaching for the remote counts. I checked.',
        daysAgo: 2,
        hour: 20,
        minute: 14,
      },
    ],
    future: [
      {
        type: 'reminder',
        body: 'Go to the gym, or at least dramatically sigh near your sneakers.',
        daysFromNow: 0,
        hour: 18,
        minute: 30,
      },
      {
        type: 'alarm',
        body: "LEG DAY. Or as you call it: walking to the kettle.",
        daysFromNow: 1,
        hour: 7,
        minute: 0,
      },
      {
        type: 'reminder',
        body: 'Lay out the workout clothes. That is 40% of the workout.',
        daysFromNow: 3,
        hour: 21,
        minute: 0,
      },
    ],
    periodics: [],
  },
  {
    id: 'demo-cat-diplomacy',
    title: 'Cat Diplomacy',
    icon: 'pet-animals-cat',
    past: [
      {
        type: 'simple',
        body: 'Treaty of the 3am zoomies: we lost. Casualties: one plant.',
        daysAgo: 1,
        hour: 3,
        minute: 22,
      },
    ],
    future: [
      {
        type: 'alarm',
        body: 'CAT TAX. 2am zoomies incoming. Wear a helmet.',
        daysFromNow: 1,
        hour: 2,
        minute: 0,
      },
      {
        type: 'reminder',
        body: 'Refill the bowl. The ambassador is drafting sanctions.',
        daysFromNow: 1,
        hour: 8,
        minute: 0,
      },
      {
        type: 'reminder',
        body: 'Buy the expensive treats. Peace in our time has a SKU.',
        daysFromNow: 4,
        hour: 19,
        minute: 0,
      },
    ],
    periodics: [],
  },
  {
    id: 'demo-adulting-dlc',
    title: 'Adulting DLC',
    icon: 'money-payments-cash-payment-coin',
    past: [
      {
        type: 'simple',
        body: 'Paid a bill on time. Still waiting for the parade.',
        daysAgo: 3,
        hour: 11,
        minute: 8,
      },
    ],
    future: [
      {
        type: 'reminder',
        body: "Reply to that email. It's been fermenting. It has notes now.",
        daysFromNow: 1,
        hour: 11,
        minute: 0,
      },
      {
        type: 'alarm',
        body: 'OPEN THE TAX FOLDER. The paperclips have formed a government.',
        daysFromNow: 5,
        hour: 9,
        minute: 0,
      },
    ],
    periodics: [],
  },
  {
    id: 'demo-open-tabs',
    title: 'Open Tabs',
    icon: 'coding-apps-websites-programming-hold-code',
    past: [
      {
        type: 'simple',
        body: 'Closed 12 tabs. Opened 14. Economists call this growth.',
        daysAgo: 1,
        hour: 16,
        minute: 40,
      },
    ],
    future: [
      {
        type: 'reminder',
        body: 'Pick a tab. Any tab. The oldest one is writing a memoir.',
        daysFromNow: 1,
        hour: 16,
        minute: 0,
      },
      {
        type: 'alarm',
        body: "INBOX ZERO. We'll also accept inbox 'I tried'.",
        daysFromNow: 3,
        hour: 9,
        minute: 30,
      },
    ],
    periodics: [],
  },
];
