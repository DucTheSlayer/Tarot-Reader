export type YesNoAnswer = 'yes' | 'no' | 'maybe' | 'uncertain'

export interface TarotCard {
  id: string
  number: number
  name: string
  image: string
  meaning: string
  advice: string
  yesNo: YesNoAnswer
  yesNoMeaning: string
}

export const CARDS: TarotCard[] = [
  {
    id: 'fool',
    number: 0,
    name: 'The Fool',
    image: '/cards/fool.svg',
    meaning: 'A blank page and a leap of faith — a new journey begins with an open heart.',
    advice: 'Trust the path before you and take that first step, even without all the answers.',
    yesNo: 'maybe',
    yesNoMeaning:
      'A new beginning rarely carries a fixed answer — the outcome depends on the step you take.'
  },
  {
    id: 'magician',
    number: 1,
    name: 'The Magician',
    image: '/cards/magician.svg',
    meaning: 'You hold all the tools you need. Focus your will and turn intention into action.',
    advice: 'Use your skills and resources deliberately — now is the time to make it happen.',
    yesNo: 'yes',
    yesNoMeaning:
      'You already hold everything needed — the energy supports moving forward with focus.'
  },
  {
    id: 'high-priestess',
    number: 2,
    name: 'The High Priestess',
    image: '/cards/high-priestess.svg',
    meaning: 'Quiet wisdom hides beneath the surface. Listen to your intuition and inner voice.',
    advice: 'Pause, go inward, and let your instincts guide you before you act.',
    yesNo: 'uncertain',
    yesNoMeaning:
      'The answer is hidden below the surface for now — trust your intuition rather than forcing a clear yes or no.'
  },
  {
    id: 'empress',
    number: 3,
    name: 'The Empress',
    image: '/cards/empress.svg',
    meaning: 'Growth, abundance, and nurturing energy surround you. Let beauty and care flourish.',
    advice: 'Be patient and generous — create with love and let things ripen naturally.',
    yesNo: 'yes',
    yesNoMeaning:
      'Growth, abundance and nurturing energy back your wish — the answer is a quiet yes.'
  },
  {
    id: 'emperor',
    number: 4,
    name: 'The Emperor',
    image: '/cards/emperor.svg',
    meaning: 'Structure, authority, and steady leadership. Build on solid ground with discipline.',
    advice: 'Take charge with a clear plan; firm boundaries bring lasting stability.',
    yesNo: 'yes',
    yesNoMeaning:
      'Structure, authority and steady discipline stand behind a confident yes.'
  },
  {
    id: 'hierophant',
    number: 5,
    name: 'The Hierophant',
    image: '/cards/hierophant.svg',
    meaning: 'Tradition and trusted guidance offer a reliable path. Learn from what has come before.',
    advice: 'Follow established wisdom and seek counsel from those you trust.',
    yesNo: 'yes',
    yesNoMeaning:
      'Tradition and trusted guidance point to a reliable yes — lean on what has already proven itself.'
  },
  {
    id: 'lovers',
    number: 6,
    name: 'The Lovers',
    image: '/cards/lovers.svg',
    meaning: 'A meaningful bond or an important choice. Follow what your heart truly values.',
    advice: 'Choose with honesty and alignment — connection deepens when you are sincere.',
    yesNo: 'yes',
    yesNoMeaning:
      'Your heart and values are aligned here — the answer is yes, especially when you choose with honesty.'
  },
  {
    id: 'chariot',
    number: 7,
    name: 'The Chariot',
    image: '/cards/chariot.svg',
    meaning: 'Willpower and momentum carry you forward. Stay focused and you will prevail.',
    advice: 'Keep your eyes on the goal and steer with confidence through every obstacle.',
    yesNo: 'yes',
    yesNoMeaning:
      'Willpower and momentum are on your side — a focused yes, provided you stay committed.'
  },
  {
    id: 'strength',
    number: 8,
    name: 'Strength',
    image: '/cards/strength.svg',
    meaning: 'True power is gentle — patience, courage, and compassion tame any challenge.',
    advice: 'Lead with calm strength; a soft hand is often the strongest one.',
    yesNo: 'yes',
    yesNoMeaning:
      'Gentle courage and patient resolve make this a yes — lead with calm, not force.'
  },
  {
    id: 'hermit',
    number: 9,
    name: 'The Hermit',
    image: '/cards/hermit.svg',
    meaning: 'Time to step back and seek inner clarity. Solitude now brings deeper answers.',
    advice: 'Turn inward, reflect, and let the quiet reveal what you truly need.',
    yesNo: 'no',
    yesNoMeaning:
      'Not yet — the card asks you to step back and find inner clarity before acting.'
  },
  {
    id: 'wheel-of-fortune',
    number: 10,
    name: 'Wheel of Fortune',
    image: '/cards/wheel-of-fortune.svg',
    meaning: 'Fortune turns and cycles shift. What changes now is part of a larger rhythm.',
    advice: 'Ride the tide with flexibility — embrace the turn, good or otherwise.',
    yesNo: 'maybe',
    yesNoMeaning:
      'Fortune is turning — the result depends on how you ride the change rather than a fixed yes or no.'
  },
  {
    id: 'justice',
    number: 11,
    name: 'Justice',
    image: '/cards/justice.svg',
    meaning: 'Truth and fairness carry the day. Cause and effect now come into balance.',
    advice: 'Act with honesty and weigh both sides; the scales will settle fairly.',
    yesNo: 'maybe',
    yesNoMeaning:
      'The scales are still weighing — the fair answer depends on the facts and your honesty.'
  },
  {
    id: 'hanged-man',
    number: 12,
    name: 'The Hanged Man',
    image: '/cards/hanged-man.svg',
    meaning: 'A necessary pause. Release control and see the situation from a new angle.',
    advice: 'Stop pushing — surrender to the moment and let a fresh perspective arrive.',
    yesNo: 'no',
    yesNoMeaning:
      'Pause is needed first — forcing this now would only hold back a clearer answer.'
  },
  {
    id: 'death',
    number: 13,
    name: 'Death',
    image: '/cards/death.svg',
    meaning: 'An ending clears the way for renewal. Release what has served its time.',
    advice: 'Let go without regret; a profound transformation is opening a new door.',
    yesNo: 'no',
    yesNoMeaning:
      'An ending is clearing the way — the current path is closing so a new one can begin.'
  },
  {
    id: 'temperance',
    number: 14,
    name: 'Temperance',
    image: '/cards/temperance.svg',
    meaning: 'Balance and patience bring harmony. Blend opposites with grace.',
    advice: 'Move in moderation and keep your cool — steady steps reach the destination.',
    yesNo: 'yes',
    yesNoMeaning:
      'Balance and patience bring harmony — a measured yes, taken one steady step at a time.'
  },
  {
    id: 'devil',
    number: 15,
    name: 'The Devil',
    image: '/cards/devil.svg',
    meaning: 'Beware of attachment, temptation, or a binding pattern. Recognize the chains.',
    advice: 'Name what holds you and reclaim your freedom — the chain only binds if you allow it.',
    yesNo: 'no',
    yesNoMeaning:
      'Attachment or a binding pattern stands in the way — not yet, until the chain is named and broken.'
  },
  {
    id: 'tower',
    number: 16,
    name: 'The Tower',
    image: '/cards/tower.svg',
    meaning: 'Sudden change shatters the false and reveals the truth. What falls was never meant to stand.',
    advice: 'Welcome the shake-up; out of the rubble a clearer foundation can be built.',
    yesNo: 'no',
    yesNoMeaning:
      'Sudden change is shattering the old — the ground must settle before a steady yes is possible.'
  },
  {
    id: 'star',
    number: 17,
    name: 'The Star',
    image: '/cards/star.svg',
    meaning: 'Hope, healing, and quiet inspiration renew your spirit after the storm.',
    advice: 'Trust the light ahead and keep believing — your wishes are within reach.',
    yesNo: 'yes',
    yesNoMeaning:
      'Hope and quiet renewal point to yes — trust the light ahead and keep your wish alive.'
  },
  {
    id: 'moon',
    number: 18,
    name: 'The Moon',
    image: '/cards/moon.svg',
    meaning: 'Illusion and uncertainty blur the way. Trust your intuition, not appearances.',
    advice: 'Slow down and look deeper; clarity will come when the fog lifts.',
    yesNo: 'uncertain',
    yesNoMeaning:
      'Illusion and uncertainty blur the way — the answer is unclear until you look beneath appearances.'
  },
  {
    id: 'sun',
    number: 19,
    name: 'The Sun',
    image: '/cards/sun.svg',
    meaning: 'Joy, success, and radiant clarity. Everything is bright and full of life.',
    advice: 'Celebrate and shine — positive energy attracts the outcomes you desire.',
    yesNo: 'yes',
    yesNoMeaning:
      'Joy and radiant clarity confirm a bright yes — everything is working in your favour.'
  },
  {
    id: 'judgement',
    number: 20,
    name: 'Judgement',
    image: '/cards/judgement.svg',
    meaning: 'A call to rise, renew, and be honest with yourself. A verdict of awakening.',
    advice: 'Answer the call with courage; forgive the past and step into your next chapter.',
    yesNo: 'yes',
    yesNoMeaning:
      'A call to rise and renew — yes, especially once you forgive the past and answer honestly.'
  },
  {
    id: 'world',
    number: 21,
    name: 'The World',
    image: '/cards/world.svg',
    meaning: 'Completion and fulfillment — a cycle closes in perfect wholeness.',
    advice: 'Celebrate what you have achieved; the door is open to a wider world.',
    yesNo: 'yes',
    yesNoMeaning:
      'Completion and wholeness mark this as a fulfilled yes — the cycle closes in your favour.'
  }
]
