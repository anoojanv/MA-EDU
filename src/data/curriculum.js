// Year plans for each child. Units follow the Ontario Kindergarten Program (2016)
// for Aliya and the Ontario Grade 1 Mathematics (2020) and Language (2023)
// curricula for Aiden. Each daily session is the unit's three on-screen steps
// plus one off-screen activity to do together.

export const LEARNERS = [
  { id: 'aiden', name: 'Aiden', born: 2020, level: 'g1', grade: 'Grade 1', avatar: '⚾', tone: 'blue', plan: 'aiden-g1', theme: 'diamond' },
  { id: 'aliya', name: 'Aliya', born: 2022, level: 'jk', grade: 'JK', avatar: '🦋', tone: 'red', plan: 'aliya-jk', theme: 'garden' },
]

export const PLANS = {
  'aliya-jk': {
    title: 'Aliya’s JK year',
    program: 'Ontario Kindergarten Program (2016)',
    minutes: 10,
    sessionsPerUnit: 5,
    readAloud: true,
    units: [
      {
        id: 'my-name', when: 'October', icon: '🦋', title: 'Letters in my name',
        frame: 'Literacy and mathematics behaviours',
        goal: 'I can find A, L, I and Y.',
        steps: [
          { skill: 'letter-pop', params: { letters: 'ALIY' }, n: 5 },
          { skill: 'big-little', params: { letters: 'ALIY' }, n: 4 },
          { skill: 'count', params: { max: 5 }, n: 4 },
        ],
        offscreen: { icon: '🧂', title: 'Name tray', text: 'Pour salt or sugar on a tray. Trace A-L-I-Y-A with one finger, then shake and try again.' },
        parent: 'Point out A, L, I and Y on signs, books and cereal boxes. Name letters by their names for now; sounds come next.',
      },
      {
        id: 'count-5', when: 'November', icon: '🐞', title: 'Counting to 5',
        frame: 'Literacy and mathematics behaviours',
        goal: 'I can count up to 5 things and say how many.',
        steps: [
          { skill: 'count', params: { max: 5 }, n: 5 },
          { skill: 'more-fewer', params: { max: 5 }, n: 4 },
          { skill: 'letter-pop', params: { letters: 'ALIYM' }, n: 4 },
        ],
        offscreen: { icon: '🍪', title: 'Snack count', text: 'Put out 5 crackers. Touch and count each one, then count again as they get eaten.' },
        parent: 'One number for each thing, touched once. The last number said is how many.',
      },
      {
        id: 'satpin', when: 'December', icon: '🐍', title: 'First sounds: s a t p i n',
        frame: 'Literacy and mathematics behaviours',
        goal: 'I can hear the first sound in a word.',
        steps: [
          { skill: 'letter-pop', params: { letters: 'SATPIN' }, n: 5 },
          { skill: 'first-sound', params: { letters: 'SATPIN' }, n: 4 },
          { skill: 'big-little', params: { letters: 'SATPIN' }, n: 4 },
        ],
        offscreen: { icon: '🔎', title: 'Sound hunt', text: 'Find 3 things at home that start with sss, like socks, a spoon and soap.' },
        parent: 'Stretch the first sound: “sssun”. Pure sounds help: say “sss”, not “suh”.',
      },
      {
        id: 'count-10', when: 'January–February', icon: '❄️', title: 'Counting to 10',
        frame: 'Literacy and mathematics behaviours',
        goal: 'I can count up to 10 things.',
        steps: [
          { skill: 'count', params: { max: 10 }, n: 6 },
          { skill: 'more-fewer', params: { max: 9 }, n: 4 },
          { skill: 'letter-pop', params: { letters: 'SATPINALIY' }, n: 4 },
        ],
        offscreen: { icon: '⛄', title: 'Snow jumps', text: 'Count 10 big jumps in the snow, or 10 stairs on the way to bed.' },
        parent: 'Line objects up in a row of 5 and a row of 5. It makes 10 easier to see.',
      },
      {
        id: 'mdgock', when: 'March', icon: '🐶', title: 'More sounds: m d g o c k',
        frame: 'Literacy and mathematics behaviours',
        goal: 'I can match big and little letters and hear their sounds.',
        steps: [
          { skill: 'letter-pop', params: { letters: 'MDGOCK' }, n: 5 },
          { skill: 'first-sound', params: { letters: 'MDGOCK' }, n: 4 },
          { skill: 'big-little', params: { letters: 'MDGOCK' }, n: 4 },
        ],
        offscreen: { icon: '🎨', title: 'Letter art', text: 'Paint a big M and a little m. Add eyes to make them into monsters.' },
        parent: 'C and K make the same sound in “cat” and “kite”. That is fine to notice together.',
      },
      {
        id: 'more-fewer', when: 'April', icon: '⚖️', title: 'More and fewer',
        frame: 'Problem solving and innovating',
        goal: 'I can tell which group has more.',
        steps: [
          { skill: 'more-fewer', params: { max: 9 }, n: 6 },
          { skill: 'count', params: { max: 10 }, n: 4 },
          { skill: 'first-sound', n: 4 },
        ],
        offscreen: { icon: '🧸', title: 'Toy sort', text: 'Sort toys into two piles. Which pile has more? How can you check?' },
        parent: 'Lining up the two groups side by side shows “more” without counting.',
      },
      {
        id: 'alphabet', when: 'May–June', icon: '🌈', title: 'The whole alphabet',
        frame: 'Literacy and mathematics behaviours',
        goal: 'I can find any letter, big or little.',
        steps: [
          { skill: 'letter-pop', n: 5 },
          { skill: 'big-little', n: 4 },
          { skill: 'first-sound', n: 4 },
        ],
        offscreen: { icon: '🎵', title: 'Alphabet song', text: 'Sing the alphabet song slowly while pointing to each letter on a chart or book.' },
        parent: 'Ending the song on “zed” keeps the Canadian rhyme with “me”.',
      },
    ],
  },

  'aiden-g1': {
    title: 'Aiden’s Grade 1 year',
    program: 'Ontario Grade 1 Mathematics (2020) and Language (2023)',
    minutes: 15,
    sessionsPerUnit: 5,
    readAloud: false,
    units: [
      {
        id: 'add-10', when: 'October', icon: '🔟', title: 'Adding to 10',
        frame: 'Number', reading: 'Foundations of language',
        goal: 'I can add two numbers up to 10 using a ten frame.',
        steps: [
          { skill: 'ten-frame', n: 6 },
          { skill: 'sight-words', params: { set: 1 }, n: 5 },
          { skill: 'baseball', params: { ops: '+' }, n: 3 },
        ],
        offscreen: { icon: '🥚', title: 'Egg-carton toss', text: 'Toss 10 buttons at an egg carton. How many landed in? How many missed? Say it as an addition.' },
        parent: 'After each answer, ask “How do you know?” Explaining is part of the Grade 1 math expectations.',
      },
      {
        id: 'tens-ones', when: 'November', icon: '🧱', title: 'Tens and ones',
        frame: 'Number', reading: 'Foundations of language',
        goal: 'I can show a number up to 50 as tens and ones.',
        steps: [
          { skill: 'tens-ones', params: { max: 50 }, n: 6 },
          { skill: 'skip-count', params: { steps: [10] }, n: 4 },
          { skill: 'sight-words', params: { set: 1 }, n: 4 },
        ],
        offscreen: { icon: '🥢', title: 'Bundle it', text: 'Bundle 10 straws or popsicle sticks with an elastic. Build 34 with bundles and loose sticks.' },
        parent: 'Say numbers both ways: “34 is 3 tens and 4 ones.”',
      },
      {
        id: 'add-sub-20', when: 'December–January', icon: '🐸', title: 'Adding and taking away to 20',
        frame: 'Number', reading: 'Foundations of language',
        goal: 'I can add and subtract numbers up to 20.',
        steps: [
          { skill: 'add-sub-20', n: 6 },
          { skill: 'baseball', n: 3 },
          { skill: 'sight-words', params: { set: 2 }, n: 4 },
        ],
        offscreen: { icon: '🦶', title: 'Floor number line', text: 'Tape 0 to 20 on the floor. Hop forward to add, hop back to take away.' },
        parent: 'Start from the bigger number and count on. It is faster than counting from 1.',
      },
      {
        id: 'patterns', when: 'February', icon: '🦘', title: 'Counting patterns',
        frame: 'Algebra', reading: 'Foundations of language',
        goal: 'I can count by 2s, 5s and 10s.',
        steps: [
          { skill: 'skip-count', params: { steps: [2, 5, 10] }, n: 6 },
          { skill: 'add-sub-20', n: 4 },
          { skill: 'sight-words', params: { set: 2 }, n: 4 },
        ],
        offscreen: { icon: '🧦', title: 'Count in groups', text: 'Count socks by 2s, fingers by 5s and toes of the whole family by 10s.' },
        parent: 'Skip counting is the bridge to counting money next month.',
      },
      {
        id: 'money', when: 'March', icon: '🪙', title: 'Canadian coins',
        frame: 'Financial literacy', reading: 'Foundations of language',
        goal: 'I can name Canadian coins and count nickels and dimes.',
        steps: [
          { skill: 'coins', params: { mode: 'identify' }, n: 4 },
          { skill: 'coins', params: { mode: 'count', pool: ['dime', 'nickel'] }, n: 5 },
          { skill: 'skip-count', params: { steps: [5, 10] }, n: 3 },
        ],
        offscreen: { icon: '🏪', title: 'Play store', text: 'Price 3 toys under 50¢. Pay with real nickels and dimes and make change.' },
        parent: 'Canada has no pennies, so cash totals round to the nearest 5¢.',
      },
      {
        id: 'compare', when: 'April', icon: '🐊', title: 'Greater, less, equal',
        frame: 'Number', reading: 'Foundations of language',
        goal: 'I can compare numbers up to 100 with < = >.',
        steps: [
          { skill: 'compare', n: 6 },
          { skill: 'tens-ones', n: 4 },
          { skill: 'sight-words', params: { set: 3 }, n: 4 },
        ],
        offscreen: { icon: '🃏', title: 'Card battle', text: 'Each player flips two cards to make a number. Say who wins using “greater than”.' },
        parent: 'Compare the tens first. Only look at the ones if the tens match.',
      },
      {
        id: 'ballpark', when: 'May–June', icon: '⚾', title: 'Ballpark story problems',
        frame: 'Number', reading: 'Comprehension',
        goal: 'I can solve story problems by adding or taking away.',
        steps: [
          { skill: 'baseball', n: 6 },
          { skill: 'add-sub-20', n: 4 },
          { skill: 'sight-words', params: { set: 3 }, n: 4 },
        ],
        offscreen: { icon: '📓', title: 'Keep score', text: 'At a baseball game or on TV, keep score in a notebook and add up the runs at the end.' },
        parent: 'Ask him to tell the story back in his own words before solving it.',
      },
    ],
  },
}

export function planFor(learner) {
  return PLANS[learner.plan]
}
