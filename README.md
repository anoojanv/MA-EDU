# Maanu Learning

A guided, playful learning app for **Aiden** (Grade 1) and **Aliya** (JK), built around their own year plans.

Each child opens to **Today**: three short on-screen steps and one activity to do together off the screen. Aiden runs the bases of a baseball diamond. Aliya's butterfly makes a garden bloom. After five days, a unit moves on to the next one.

## What's in it

| | Aiden — Grade 1 | Aliya — JK |
|---|---|---|
| Curriculum | Ontario Grade 1 Mathematics (2020) and Language (2023) | Ontario Kindergarten Program (2016) |
| Daily session | ~15 min | ~10 min, everything read aloud |
| Units | Adding to 10 → Tens and ones → Add/take away to 20 → Counting patterns → Canadian coins → Greater/less → Ballpark story problems | Letters in my name (A L I Y) → Counting to 5 → s a t p i n → Counting to 10 → m d g o c k → More and fewer → The whole alphabet |
| Trail | Baseball diamond: 1st, 2nd, 3rd, home | Flower garden: four blooms |

**13 skills** generate endless questions that get harder as the child's Star Meter (0–100) climbs: Pop the letter, Big and little, First sounds, How many?, More or fewer, Ten-frame adding, Add and take away, Tens and ones, Greater or less, Skip counting, Canadian coins, Sight words and Baseball math.

A wrong answer opens **Let's figure it out**: a worked visual (count-along, number-line hops, tens-and-ones blocks, running coin totals) with the answer read aloud.

**Grown-ups** shows the year as a timeline: each unit's goal, curriculum strand, activity idea, tip, and progress. A parent can move a child to any unit.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

Progress is saved in the browser (localStorage), per device.

## Where things live

```
src/data/curriculum.js   year plans for each child: units, steps, activities, tips
src/data/skills.js       the 13 skill generators (questions, choices, help)
src/screens/             Who, Today, Practice, Off-screen, Skills (free play), Plan (grown-ups)
src/components/          Trail, Visuals, Inputs (choices, balloons, keypad), Pip the mascot, confetti
src/lib/                 Star Meter scoring, read-aloud and sound effects, storage
```

### Add a unit

Add an object to a plan's `units` in `src/data/curriculum.js`. Each step is a skill id, optional `params` that narrow it (for example `{ letters: 'SATPIN' }`, `{ max: 5 }`, `{ ops: '+' }`, `{ set: 2 }`), and `n`, the number of questions.

### Add a skill

Add an entry to `SKILLS` in `src/data/skills.js` with a `generate({ score, name, params })` function that returns a prompt, a visual, an input type (`choice`, `balloons` or `keypad`), choices, the answer and a help visual.

## Deploy

`netlify.toml` builds with `npm run build` and publishes `dist/`.

No sound files, images or trackers: speech uses the browser's built-in voice, sound effects are synthesised, and drawings are SVG.
