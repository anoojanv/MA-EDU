// Canadian coins. Diameters in mm are real, so coins draw at true relative size.
export const COINS = {
  nickel: { name: 'nickel', value: 5, d: 21.2, metal: 'silver', label: '5¢', worth: '5 cents', fact: 'It is bigger than a dime but worth less.' },
  dime: { name: 'dime', value: 10, d: 18.0, metal: 'silver', label: '10¢', worth: '10 cents', fact: 'It is the smallest coin.' },
  quarter: { name: 'quarter', value: 25, d: 23.9, metal: 'silver', label: '25¢', worth: '25 cents', fact: 'Four quarters make one loonie.' },
  loonie: { name: 'loonie', value: 100, d: 26.5, metal: 'gold', sides: 11, label: '$1', worth: 'one dollar', fact: 'It has 11 sides and a loon on it.' },
  toonie: { name: 'toonie', value: 200, d: 28.0, metal: 'bi', label: '$2', worth: 'two dollars', fact: 'It has two colours: silver outside, gold inside.' },
}

export const COIN_KINDS = Object.keys(COINS)

/** 35 → "35¢", 235 → "$2.35". */
export const money = (cents) => (cents >= 100 ? `$${(cents / 100).toFixed(2)}` : `${cents}¢`)
