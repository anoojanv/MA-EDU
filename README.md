# MA-learning

Playful, adaptive learning for every kid in the family. A grown-up signs in, says how many kids they have and when each was born, and MA-learning builds a year plan for each child: a few minutes on screen, one activity together, and practice that gets harder as they improve.

It grew out of [Maanu Learning](https://maanu-learning.netlify.app/), a two-child app, and takes cues from skill-based practice sites like IXL: graded skills, a score per skill that rises with steady accuracy, and a progress view for parents.

## How it works

1. **Sign in.** Grown-ups only, with email and password or a one-time email link. Kids never need an account.
2. **Set up the family.** Pick how many kids (1–6, more can be added later), then give each one a first name, a birthday, a buddy and a world: ⚾ Ballpark, 🌷 Garden or 🚀 Space.
3. **Each child gets a plan for their level.** The birthday sets the level, using Ontario's school-year cut-off (JK in the year a child turns 4, Grade 1 in the year they turn 6). A grown-up can override it.

| Level | Plan | Daily session |
|---|---|---|
| Pre-K | Letters in their name, counting to 5, shapes | ~8 min, read aloud |
| JK | Ontario Kindergarten Program: name letters, counting to 10, first sounds | ~10 min, read aloud |
| SK | Sounds, counting to 20, making 10, first sight words, coins | ~12 min, read aloud |
| Grade 1 | Adding to 20, tens and ones, skip counting, coins, o'clock, story problems | ~15 min |
| Grade 2 | Place value to 200, two-digit adding and subtracting, equal groups, fractions, quarter hours | ~15 min |
| Grade 3 | Place value to 1000, multiplying and dividing, fractions to eighths, time to 5 minutes, money to $10 | ~20 min |

**Personalised plans.** The first unit uses the letters of the child's own name. Story problems happen in their chosen world. Off-screen activities and parent tips use their name.

**How it adapts:**
- **Questions.** Every skill has a Star Meter (0–100). As it climbs, numbers get bigger, distractors get closer, and harder variants appear, such as regrouping, quarter hours and subtraction.
- **Units.** A unit normally lasts 5 days. It moves on early, after 3 days, when the unit's skills average 85+. A child still below 40 after 5 days gets extra practice days, up to 8.
- **School years.** Plan progress is stored per level, so a child moves to a fresh plan for their new grade each September.

**Grown-ups** sees the year as a timeline, plus a "This week" panel: questions per day, accuracy, the most-practised skills, and a nudge when one skill is under 70%.

20 skills generate endless questions: Pop the letter, Big and little, First sounds, How many?, More or fewer, Find the shape, Ten-frame adding, Add and take away, Big adding and taking away, Tens and ones, Hundreds tens and ones, Greater or less, Skip counting, Canadian coins, Sight words, Story problems, Equal groups, Sharing equally, Fractions, and Tell the time.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

`.env` holds the Supabase project URL and its publishable key. Both are meant to be public. Row-level security keeps each family's data private.

## Supabase

Project `ma-learning` (ca-central-1). The schema is in `supabase/migrations/`:

- `children`: one row per child. It holds the profile (name, birthday, avatar, world, level override) plus their progress (`stars`, per-skill `progress`, per-level `plan_state`, free-play level).
- `answers`: one row per answered question, for the weekly view.

Both tables only allow a signed-in grown-up to read and write their own family's rows (`family_id = auth.uid()`).

Before going live, in the Supabase dashboard:
- **Authentication → URL Configuration**: set the Site URL and redirect URLs to the deployed site, so confirmation and sign-in links come back to it.
- **Authentication → Emails**: the built-in email sender is rate-limited and meant for testing. Add your own SMTP provider before inviting families.

## Where things live

```
src/data/curriculum.js   levels, age → level, and the per-level year plans
src/data/skills.js       the 20 skill generators (questions, choices, help)
src/lib/family.js        Supabase reads and writes for children and answers
src/screens/             Auth, Setup, Family, Who, Today, Practice, Off-screen, Skills, Plan
src/components/          Trail (3 worlds), Visuals and Shapes (drawings), WeekChart, Inputs, Pip
```

### Add a unit

Add an object to a level's list in `units()` in `src/data/curriculum.js`. Each step is a skill id, optional `params` that narrow it (for example `{ letters: 'SATPIN' }`, `{ max: 100 }`, `{ step: 15 }`), and `n`, the number of questions.

### Add a skill

Add an entry to `SKILLS` in `src/data/skills.js`. It needs the `levels` it belongs to, optional `byLevel` free-play params, and a `generate({ score, name, theme, params })` function. That function returns a prompt, a visual, an input type (`choice`, `balloons` or `keypad`), choices, the answer and a help visual.

## Deploy

`netlify.toml` builds with `npm run build` and publishes `dist/`.

No sound files, images or trackers. Speech uses the browser's built-in voice, sound effects are synthesised, and drawings are SVG.
