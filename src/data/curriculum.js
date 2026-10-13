// Year plans, built for each child from their age.
//
// A child's level comes from their birth year and the school year, following
// Ontario's cut-off (children start JK in the September of the year they turn 4).
// Each level has a plan of units; a daily session is the unit's three on-screen
// steps plus one off-screen activity to do together. Plans are personalised with
// the child's name (their own letters come first) and their chosen world.

export const LEVEL_INFO = {
  prek: { name: 'Pre-K', long: 'Preschool', program: 'Play-based early learning: letters, counting and shapes', minutes: 8, readAloud: true },
  jk: { name: 'JK', long: 'Junior Kindergarten', program: 'Ontario Kindergarten Program (2016)', minutes: 10, readAloud: true },
  sk: { name: 'SK', long: 'Senior Kindergarten', program: 'Ontario Kindergarten Program (2016)', minutes: 12, readAloud: true },
  g1: { name: 'Grade 1', long: 'Grade 1', program: 'Ontario Grade 1 Mathematics (2020) and Language (2023)', minutes: 15, readAloud: false },
  g2: { name: 'Grade 2', long: 'Grade 2', program: 'Ontario Grade 2 Mathematics (2020) and Language (2023)', minutes: 15, readAloud: false },
  g3: { name: 'Grade 3', long: 'Grade 3', program: 'Ontario Grade 3 Mathematics (2020) and Language (2023)', minutes: 20, readAloud: false },
}

export const LEVEL_ORDER = ['prek', 'jk', 'sk', 'g1', 'g2', 'g3']

/** The school year a date falls in, named by the year it starts (Sept–Aug). */
export function schoolYear(d = new Date()) {
  return d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1
}

/** The age a child turns during this school year. */
const turnsThisYear = (birthDate, now) => schoolYear(now) - Number(String(birthDate).slice(0, 4))

/** Level from a birth date (YYYY-MM-DD): JK the school year they turn 4, Grade 1 the year they turn 6. */
export function levelFor(birthDate, now = new Date()) {
  const turns = turnsThisYear(birthDate, now)
  if (turns <= 3) return 'prek'
  if (turns === 4) return 'jk'
  if (turns === 5) return 'sk'
  if (turns === 6) return 'g1'
  if (turns === 7) return 'g2'
  return 'g3'
}

/** True when a child is past Grade 3, beyond the content we have so far. */
export const beyondContent = (birthDate, now = new Date()) => turnsThisYear(birthDate, now) > 8

export function ageOf(birthDate, now = new Date()) {
  const [y, m, d] = String(birthDate).split('-').map(Number)
  let age = now.getFullYear() - y
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--
  return age
}

export const childLevel = (child) => child.level_override || levelFor(child.birth_date)

/** Up to 5 distinct letters from a name, topped up to at least 3 from s a t p i n. */
export function nameLetters(name) {
  const own = [...new Set(String(name).toUpperCase().replace(/[^A-Z]/g, '').split(''))].slice(0, 5)
  const extra = 'SATPIN'.split('').filter((l) => !own.includes(l))
  return own.concat(extra).slice(0, Math.max(own.length, 3)).join('')
}

const WORLD = {
  diamond: { story: 'Ballpark story problems', storyIcon: '⚾', storyTip: 'Keep score at a game or on TV and add up the runs at the end.' },
  garden: { story: 'Garden story problems', storyIcon: '🌻', storyTip: 'Count seeds, petals or bugs outside and make up a story about them.' },
  space: { story: 'Space story problems', storyIcon: '🚀', storyTip: 'Make up a rocket story: how many stars, planets or astronauts?' },
}

function units(level, child) {
  const name = child.name
  const L = nameLetters(name)
  const w = WORLD[child.theme] || WORLD.diamond
  switch (level) {
    case 'prek':
      return [
        {
          id: 'my-name', when: 'Fall', icon: '🌟', title: 'Letters in my name',
          frame: 'Early literacy', goal: `I can find the letters in ${name}.`,
          steps: [
            { skill: 'letter-pop', params: { letters: L }, n: 4 },
            { skill: 'count', params: { max: 3 }, n: 3 },
            { skill: 'shapes', params: { shapes: ['circle', 'square', 'triangle'] }, n: 3 },
          ],
          offscreen: { icon: '🧂', title: 'Name tray', text: `Pour salt on a tray. Trace the first letter of ${name} with one finger, then shake and try again.` },
          parent: 'Name letters by their names for now. Sounds come later.',
        },
        {
          id: 'count-3', when: 'Fall', icon: '🐞', title: 'One, two, three',
          frame: 'Early numeracy', goal: 'I can count 3 things.',
          steps: [
            { skill: 'count', params: { max: 3 }, n: 4 },
            { skill: 'more-fewer', params: { max: 4 }, n: 3 },
            { skill: 'shapes', params: { shapes: ['circle', 'square', 'triangle'] }, n: 3 },
          ],
          offscreen: { icon: '🧦', title: 'Sock count', text: 'Count socks into the basket together: one, two, three.' },
          parent: 'Touch each thing once as you count. The last number says how many.',
        },
        {
          id: 'shapes', when: 'Winter', icon: '🔺', title: 'Shapes all around',
          frame: 'Early numeracy', goal: 'I can find circles, squares and triangles.',
          steps: [
            { skill: 'shapes', n: 4 },
            { skill: 'count', params: { max: 5 }, n: 3 },
            { skill: 'letter-pop', params: { letters: L }, n: 3 },
          ],
          offscreen: { icon: '🔍', title: 'Shape hunt', text: 'Find something round, something square and something with three corners at home.' },
          parent: 'Use shape words every day: “Pass me the round plate.”',
        },
        {
          id: 'count-5', when: 'Spring', icon: '🖐️', title: 'Counting to 5',
          frame: 'Early numeracy', goal: 'I can count up to 5 things.',
          steps: [
            { skill: 'count', params: { max: 5 }, n: 4 },
            { skill: 'more-fewer', params: { max: 5 }, n: 3 },
            { skill: 'big-little', params: { letters: L }, n: 3 },
          ],
          offscreen: { icon: '🍪', title: 'Snack count', text: 'Put out 5 crackers. Count them, then count again as they get eaten.' },
          parent: 'Five fingers on one hand make a handy counting tool.',
        },
        {
          id: 'big-little', when: 'Summer', icon: '🔠', title: 'Big and little letters',
          frame: 'Early literacy', goal: 'I can match big and little letters.',
          steps: [
            { skill: 'big-little', params: { letters: L }, n: 4 },
            { skill: 'letter-pop', params: { letters: L + 'MO' }, n: 3 },
            { skill: 'shapes', n: 3 },
          ],
          offscreen: { icon: '🎨', title: 'Letter art', text: `Paint the first letter of ${name}, big and little. Turn them into animals.` },
          parent: 'Point out letters from their name on signs and packages.',
        },
      ]

    case 'jk':
      return [
        {
          id: 'my-name', when: 'October', icon: '🦋', title: 'Letters in my name',
          frame: 'Literacy and mathematics behaviours', goal: `I can find the letters in ${name}.`,
          steps: [
            { skill: 'letter-pop', params: { letters: L }, n: 5 },
            { skill: 'big-little', params: { letters: L }, n: 4 },
            { skill: 'count', params: { max: 5 }, n: 4 },
          ],
          offscreen: { icon: '🧂', title: 'Name tray', text: `Pour salt or sugar on a tray. Trace ${name.toUpperCase()} with one finger, then shake and try again.` },
          parent: `Point out the letters of ${name} on signs, books and cereal boxes. Name letters by their names for now; sounds come next.`,
        },
        {
          id: 'count-5', when: 'November', icon: '🐞', title: 'Counting to 5',
          frame: 'Literacy and mathematics behaviours', goal: 'I can count up to 5 things and say how many.',
          steps: [
            { skill: 'count', params: { max: 5 }, n: 5 },
            { skill: 'more-fewer', params: { max: 5 }, n: 4 },
            { skill: 'shapes', params: { shapes: ['circle', 'square', 'triangle', 'rectangle'] }, n: 4 },
          ],
          offscreen: { icon: '🍪', title: 'Snack count', text: 'Put out 5 crackers. Touch and count each one, then count again as they get eaten.' },
          parent: 'One number for each thing, touched once. The last number said is how many.',
        },
        {
          id: 'satpin', when: 'December', icon: '🐍', title: 'First sounds: s a t p i n',
          frame: 'Literacy and mathematics behaviours', goal: 'I can hear the first sound in a word.',
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
          frame: 'Literacy and mathematics behaviours', goal: 'I can count up to 10 things.',
          steps: [
            { skill: 'count', params: { max: 10 }, n: 6 },
            { skill: 'more-fewer', params: { max: 9 }, n: 4 },
            { skill: 'letter-pop', params: { letters: 'SATPIN' + L }, n: 4 },
          ],
          offscreen: { icon: '⛄', title: 'Snow jumps', text: 'Count 10 big jumps in the snow, or 10 stairs on the way to bed.' },
          parent: 'Line objects up in a row of 5 and a row of 5. It makes 10 easier to see.',
        },
        {
          id: 'mdgock', when: 'March', icon: '🐶', title: 'More sounds: m d g o c k',
          frame: 'Literacy and mathematics behaviours', goal: 'I can match big and little letters and hear their sounds.',
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
          frame: 'Problem solving and innovating', goal: 'I can tell which group has more.',
          steps: [
            { skill: 'more-fewer', params: { max: 9 }, n: 6 },
            { skill: 'count', params: { max: 10 }, n: 4 },
            { skill: 'shapes', n: 4 },
          ],
          offscreen: { icon: '🧸', title: 'Toy sort', text: 'Sort toys into two piles. Which pile has more? How can you check?' },
          parent: 'Lining up the two groups side by side shows “more” without counting.',
        },
        {
          id: 'alphabet', when: 'May–June', icon: '🌈', title: 'The whole alphabet',
          frame: 'Literacy and mathematics behaviours', goal: 'I can find any letter, big or little.',
          steps: [
            { skill: 'letter-pop', n: 5 },
            { skill: 'big-little', n: 4 },
            { skill: 'first-sound', n: 4 },
          ],
          offscreen: { icon: '🎵', title: 'Alphabet song', text: 'Sing the alphabet song slowly while pointing to each letter on a chart or book.' },
          parent: 'Ending the song on “zed” keeps the Canadian rhyme with “me”.',
        },
      ]

    case 'sk':
      return [
        {
          id: 'my-name', when: 'September–October', icon: '✏️', title: 'My name and my sounds',
          frame: 'Literacy and mathematics behaviours', goal: `I can hear the sounds in ${name}.`,
          steps: [
            { skill: 'first-sound', params: { letters: L }, n: 5 },
            { skill: 'big-little', params: { letters: L }, n: 4 },
            { skill: 'count', params: { max: 10 }, n: 4 },
          ],
          offscreen: { icon: '🖍️', title: 'Name sign', text: `Write ${name} on a big card. Decorate each letter and say its sound.` },
          parent: 'Ask “What sound does your name start with?” and find other words with that sound.',
        },
        {
          id: 'count-20', when: 'November', icon: '🐜', title: 'Counting to 20',
          frame: 'Literacy and mathematics behaviours', goal: 'I can count up to 20 things.',
          steps: [
            { skill: 'count', params: { max: 20 }, n: 5 },
            { skill: 'more-fewer', params: { max: 10 }, n: 4 },
            { skill: 'letter-pop', params: { letters: 'SATPINMDGOCK' }, n: 4 },
          ],
          offscreen: { icon: '🧱', title: 'Block towers', text: 'Build a tower of 20 blocks. Count up as you build and down as it falls.' },
          parent: 'Teen numbers are tricky. “Fourteen” is ten and four.',
        },
        {
          id: 'add-5', when: 'December', icon: '🖐️', title: 'Putting together to 5',
          frame: 'Literacy and mathematics behaviours', goal: 'I can put two groups together to make 5.',
          steps: [
            { skill: 'ten-frame', params: { max: 5 }, n: 5 },
            { skill: 'count', params: { max: 10 }, n: 4 },
            { skill: 'first-sound', n: 4 },
          ],
          offscreen: { icon: '✋', title: 'Finger fives', text: 'Show 5 fingers. Fold some down. How many up? How many down?' },
          parent: 'Say it both ways: “3 and 2 make 5. 2 and 3 make 5.”',
        },
        {
          id: 'sight-1', when: 'January', icon: '📖', title: 'First words to read',
          frame: 'Literacy and mathematics behaviours', goal: 'I can read words like the, and, I and to.',
          steps: [
            { skill: 'sight-words', params: { set: 1 }, n: 5 },
            { skill: 'first-sound', n: 4 },
            { skill: 'shapes', n: 4 },
          ],
          offscreen: { icon: '📚', title: 'Word hunt', text: 'Read a picture book together. Point to every “the” you find.' },
          parent: 'Sight words are read by look, not sounded out. Short daily practice works best.',
        },
        {
          id: 'add-10', when: 'February–March', icon: '🔟', title: 'Making 10',
          frame: 'Literacy and mathematics behaviours', goal: 'I can add two groups up to 10 on a ten frame.',
          steps: [
            { skill: 'ten-frame', params: { max: 10 }, n: 5 },
            { skill: 'skip-count', params: { steps: [10] }, n: 4 },
            { skill: 'sight-words', params: { set: 1 }, n: 4 },
          ],
          offscreen: { icon: '🥚', title: 'Egg-carton ten', text: 'Fill an egg carton with 10 small toys. How many more to fill it?' },
          parent: 'Ten frames help children see 7 as “5 and 2 more”.',
        },
        {
          id: 'coins', when: 'April', icon: '🪙', title: 'Canadian coins',
          frame: 'Problem solving and innovating', goal: 'I can name the nickel, dime, quarter, loonie and toonie.',
          steps: [
            { skill: 'coins', params: { mode: 'identify' }, n: 5 },
            { skill: 'count', params: { max: 20 }, n: 4 },
            { skill: 'sight-words', params: { set: 1 }, n: 4 },
          ],
          offscreen: { icon: '🐷', title: 'Piggy-bank sort', text: 'Empty a piggy bank and sort the coins into piles by type.' },
          parent: 'Talk about the pictures: the loon on the loonie, the polar bear on the toonie.',
        },
        {
          id: 'count-100', when: 'May–June', icon: '💯', title: 'Counting by 10s to 100',
          frame: 'Literacy and mathematics behaviours', goal: 'I can count by 10s to 100.',
          steps: [
            { skill: 'skip-count', params: { steps: [10] }, n: 5 },
            { skill: 'ten-frame', n: 4 },
            { skill: 'sight-words', params: { set: 2 }, n: 4 },
          ],
          offscreen: { icon: '🥢', title: 'Bundles of 10', text: 'Bundle straws in tens with elastics and count the bundles: 10, 20, 30…' },
          parent: 'Counting by 10s is the start of place value in Grade 1.',
        },
      ]

    case 'g1':
      return [
        {
          id: 'add-10', when: 'October', icon: '🔟', title: 'Adding to 10',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can add two numbers up to 10 using a ten frame.',
          steps: [
            { skill: 'ten-frame', n: 6 },
            { skill: 'sight-words', params: { set: 1 }, n: 5 },
            { skill: 'story', params: { ops: '+' }, n: 3 },
          ],
          offscreen: { icon: '🥚', title: 'Egg-carton toss', text: 'Toss 10 buttons at an egg carton. How many landed in? How many missed? Say it as an addition.' },
          parent: 'After each answer, ask “How do you know?” Explaining is part of the Grade 1 math expectations.',
        },
        {
          id: 'tens-ones', when: 'November', icon: '🧱', title: 'Tens and ones',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can show a number up to 50 as tens and ones.',
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
          frame: 'Number', reading: 'Foundations of language', goal: 'I can add and subtract numbers up to 20.',
          steps: [
            { skill: 'add-sub-20', n: 6 },
            { skill: 'story', n: 3 },
            { skill: 'sight-words', params: { set: 2 }, n: 4 },
          ],
          offscreen: { icon: '🦶', title: 'Floor number line', text: 'Tape 0 to 20 on the floor. Hop forward to add, hop back to take away.' },
          parent: 'Start from the bigger number and count on. It is faster than counting from 1.',
        },
        {
          id: 'patterns', when: 'February', icon: '🦘', title: 'Counting patterns',
          frame: 'Algebra', reading: 'Foundations of language', goal: 'I can count by 2s, 5s and 10s.',
          steps: [
            { skill: 'skip-count', params: { steps: [2, 5, 10] }, n: 6 },
            { skill: 'add-sub-20', n: 4 },
            { skill: 'sight-words', params: { set: 2 }, n: 4 },
          ],
          offscreen: { icon: '🧦', title: 'Count in groups', text: 'Count socks by 2s, fingers by 5s and toes of the whole family by 10s.' },
          parent: 'Skip counting is the bridge to counting money next month.',
        },
        {
          id: 'money', when: 'March', icon: '🪙', title: 'Coins and o’clock',
          frame: 'Financial literacy', reading: 'Foundations of language', goal: 'I can name Canadian coins, count nickels and dimes, and read o’clock.',
          steps: [
            { skill: 'coins', params: { mode: 'identify' }, n: 4 },
            { skill: 'coins', params: { mode: 'count', pool: ['dime', 'nickel'] }, n: 5 },
            { skill: 'clock', params: { step: 60 }, n: 3 },
          ],
          offscreen: { icon: '🏪', title: 'Play store', text: 'Price 3 toys under 50¢. Pay with real nickels and dimes and make change.' },
          parent: 'Canada has no pennies, so cash totals round to the nearest 5¢.',
        },
        {
          id: 'compare', when: 'April', icon: '🐊', title: 'Greater, less, equal',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can compare numbers up to 100 with < = >.',
          steps: [
            { skill: 'compare', n: 6 },
            { skill: 'clock', params: { step: 30 }, n: 4 },
            { skill: 'sight-words', params: { set: 3 }, n: 4 },
          ],
          offscreen: { icon: '🃏', title: 'Card battle', text: 'Each player flips two cards to make a number. Say who wins using “greater than”.' },
          parent: 'Compare the tens first. Only look at the ones if the tens match.',
        },
        {
          id: 'stories', when: 'May–June', icon: w.storyIcon, title: w.story,
          frame: 'Number', reading: 'Comprehension', goal: 'I can solve story problems by adding or taking away.',
          steps: [
            { skill: 'story', n: 6 },
            { skill: 'add-sub-20', n: 4 },
            { skill: 'sight-words', params: { set: 3 }, n: 4 },
          ],
          offscreen: { icon: '📓', title: 'Make up a story', text: w.storyTip },
          parent: `Ask ${name} to tell the story back in their own words before solving it.`,
        },
      ]

    case 'g2':
      return [
        {
          id: 'review-20', when: 'September–October', icon: '🔁', title: 'Number facts to 20',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can add and subtract to 20 quickly.',
          steps: [
            { skill: 'add-sub-20', n: 6 },
            { skill: 'skip-count', params: { steps: [2, 5, 10] }, n: 4 },
            { skill: 'sight-words', params: { set: 4 }, n: 4 },
          ],
          offscreen: { icon: '🎲', title: 'Dice facts', text: 'Roll two dice and add. First to say the total wins the round.' },
          parent: 'Doubles (6 + 6) and near-doubles (6 + 7) are the fastest facts to learn first.',
        },
        {
          id: 'place-value', when: 'November', icon: '🏗️', title: 'Place value to 200',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can read and build numbers to 200.',
          steps: [
            { skill: 'tens-ones', n: 5 },
            { skill: 'place-value', params: { max: 200 }, n: 4 },
            { skill: 'compare', n: 4 },
          ],
          offscreen: { icon: '🥢', title: 'Hundred bundles', text: 'Make a bundle of 10 bundles of 10 straws. That is 100! Build 145.' },
          parent: 'Ask “How many tens are in 145?” There are 14, not 4.',
        },
        {
          id: 'add-100', when: 'December–January', icon: '🧮', title: 'Adding and subtracting to 100',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can add and subtract two-digit numbers.',
          steps: [
            { skill: 'add-sub-100', params: { max: 100 }, n: 6 },
            { skill: 'story', params: { max: 100 }, n: 3 },
            { skill: 'sight-words', params: { set: 4 }, n: 4 },
          ],
          offscreen: { icon: '🛒', title: 'Grocery math', text: 'Add two prices under a dollar on a flyer. Which costs more? By how much?' },
          parent: 'Add the tens, then the ones. 34 + 25 is 50 + 9.',
        },
        {
          id: 'groups', when: 'February', icon: '✖️', title: 'Equal groups',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can count equal groups and rows.',
          steps: [
            { skill: 'times', params: { max: 5 }, n: 6 },
            { skill: 'skip-count', params: { steps: [2, 5, 10] }, n: 4 },
            { skill: 'sight-words', params: { set: 4 }, n: 4 },
          ],
          offscreen: { icon: '🧁', title: 'Muffin tin', text: 'A muffin tin has rows. Count the rows, count one row, then count them all.' },
          parent: '“3 groups of 4” is the idea behind 3 × 4. Saying “groups of” helps it stick.',
        },
        {
          id: 'fractions', when: 'March', icon: '🍕', title: 'Halves and fourths',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can name halves, thirds and fourths.',
          steps: [
            { skill: 'fractions', params: { max: 4 }, n: 6 },
            { skill: 'add-sub-100', params: { max: 100 }, n: 4 },
            { skill: 'sight-words', params: { set: 4 }, n: 4 },
          ],
          offscreen: { icon: '🥪', title: 'Fair shares', text: 'Cut a sandwich into 2 equal parts, then 4. Are all the parts the same size?' },
          parent: 'Fractions are equal parts. Two unequal pieces are not halves.',
        },
        {
          id: 'time-money', when: 'April', icon: '🕒', title: 'Time and money',
          frame: 'Financial literacy', reading: 'Foundations of language', goal: 'I can tell time to the quarter hour and count coins.',
          steps: [
            { skill: 'clock', params: { step: 15 }, n: 5 },
            { skill: 'coins', params: { mode: 'count', pool: ['loonie', 'quarter', 'dime', 'nickel'] }, n: 5 },
            { skill: 'sight-words', params: { set: 4 }, n: 3 },
          ],
          offscreen: { icon: '⏰', title: 'Clock watcher', text: 'Read the kitchen clock at breakfast, lunch and dinner. Write the times down.' },
          parent: 'Quarter past, half past and quarter to all come from splitting the clock into 4.',
        },
        {
          id: 'stories', when: 'May–June', icon: w.storyIcon, title: w.story,
          frame: 'Number', reading: 'Comprehension', goal: 'I can solve two-digit story problems.',
          steps: [
            { skill: 'story', params: { max: 100 }, n: 5 },
            { skill: 'times', params: { max: 5 }, n: 4 },
            { skill: 'sight-words', params: { set: 4 }, n: 4 },
          ],
          offscreen: { icon: '📓', title: 'Make up a story', text: w.storyTip },
          parent: 'Ask: Is the answer going to be bigger or smaller? Why?',
        },
      ]

    default: // g3
      return [
        {
          id: 'place-value', when: 'September–October', icon: '🏗️', title: 'Place value to 1000',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can read and compare numbers to 1000.',
          steps: [
            { skill: 'place-value', n: 6 },
            { skill: 'compare', params: { max: 999 }, n: 4 },
            { skill: 'sight-words', params: { set: 5 }, n: 4 },
          ],
          offscreen: { icon: '📏', title: 'Big numbers hunt', text: 'Find three-digit numbers around the house: page numbers, prices, addresses. Read them aloud.' },
          parent: 'In 456 the 5 means 50. Ask what each digit is worth.',
        },
        {
          id: 'add-1000', when: 'November', icon: '🧮', title: 'Adding and subtracting to 1000',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can add and subtract three-digit numbers.',
          steps: [
            { skill: 'add-sub-100', params: { max: 1000 }, n: 6 },
            { skill: 'story', params: { max: 1000 }, n: 3 },
            { skill: 'sight-words', params: { set: 5 }, n: 4 },
          ],
          offscreen: { icon: '🧾', title: 'Receipt check', text: 'Add up two items on a grocery receipt and check the total.' },
          parent: 'Estimate first: 298 + 405 is about 300 + 400.',
        },
        {
          id: 'times', when: 'December–January', icon: '✖️', title: 'Multiplying to 10 × 10',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can multiply using arrays and skip counting.',
          steps: [
            { skill: 'times', n: 6 },
            { skill: 'skip-count', params: { steps: [3, 4, 25, 100] }, n: 4 },
            { skill: 'sight-words', params: { set: 5 }, n: 4 },
          ],
          offscreen: { icon: '🍫', title: 'Chocolate arrays', text: 'Look at a chocolate bar or egg carton. How many rows? How many in each? Multiply.' },
          parent: '3 × 4 and 4 × 3 are the same array turned sideways.',
        },
        {
          id: 'share', when: 'February', icon: '🍪', title: 'Sharing and dividing',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can share things into equal groups.',
          steps: [
            { skill: 'share', n: 6 },
            { skill: 'times', n: 4 },
            { skill: 'sight-words', params: { set: 5 }, n: 4 },
          ],
          offscreen: { icon: '🃏', title: 'Deal the cards', text: 'Deal 24 cards to 3, 4 or 6 players. How many does each get?' },
          parent: 'Division undoes multiplication: 12 ÷ 3 = 4 because 3 × 4 = 12.',
        },
        {
          id: 'fractions', when: 'March', icon: '🍕', title: 'Fractions to eighths',
          frame: 'Number', reading: 'Foundations of language', goal: 'I can name fractions up to eighths.',
          steps: [
            { skill: 'fractions', n: 6 },
            { skill: 'share', n: 4 },
            { skill: 'sight-words', params: { set: 5 }, n: 4 },
          ],
          offscreen: { icon: '🍕', title: 'Pizza parts', text: 'Cut a pizza or pancake into 8. Eat 3 slices: what fraction is left?' },
          parent: 'The bottom number says how many equal parts; the top says how many we have.',
        },
        {
          id: 'time-money', when: 'April', icon: '🕒', title: 'Time and money',
          frame: 'Financial literacy', reading: 'Foundations of language', goal: 'I can tell time to 5 minutes and count money to $10.',
          steps: [
            { skill: 'clock', params: { step: 5 }, n: 5 },
            { skill: 'coins', params: { mode: 'count', pool: ['toonie', 'loonie', 'quarter', 'dime', 'nickel'] }, n: 5 },
            { skill: 'sight-words', params: { set: 5 }, n: 3 },
          ],
          offscreen: { icon: '🛍️', title: 'Budget a treat', text: 'Give $5 in coins. Plan a treat from a flyer and count out the exact money.' },
          parent: 'Count the biggest coins first, then count on with the smaller ones.',
        },
        {
          id: 'stories', when: 'May–June', icon: w.storyIcon, title: w.story,
          frame: 'Number', reading: 'Comprehension', goal: 'I can solve story problems with big numbers.',
          steps: [
            { skill: 'story', params: { max: 1000 }, n: 5 },
            { skill: 'share', n: 4 },
            { skill: 'sight-words', params: { set: 5 }, n: 4 },
          ],
          offscreen: { icon: '📓', title: 'Make up a story', text: w.storyTip },
          parent: 'Ask which operation the story needs, and why, before solving it.',
        },
      ]
  }
}

/** The year plan for a child at their current level. */
export function planFor(child) {
  const level = childLevel(child)
  const info = LEVEL_INFO[level]
  return {
    level,
    title: `${child.name}’s ${info.long} year`,
    program: info.program,
    minutes: info.minutes,
    readAloud: info.readAloud,
    sessionsPerUnit: 5,
    units: units(level, child),
  }
}
