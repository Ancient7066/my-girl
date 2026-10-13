// EDITABLE CONTENT — all on-screen copy lives here.
export const recipientName = 'Aashi';
export const senderName = 'Vikram';

export const copy = {
  pageTitle: `For ${recipientName}, from ${senderName}`,
  pageDescription: `A small, quiet place made with care for ${recipientName}.`,
  brand: 'A little room to breathe',
  loading: 'A quiet place is opening…',
  sound: 'Sound',
  soundOn: 'Turn sound on',
  soundOff: 'Turn sound off',
  soundVolume: 'Sound volume',
  quietMode: 'Quiet mode',
  gentleMode: 'Gentle mode',
  haptics: 'Haptics',
  map: 'Open section map',
  restart: 'Restart',
  close: 'Close',
  continue: 'Continue',
  takeTime: 'Take your time',
  skip: 'Skip this section',
  skipAnimation: 'Skip animation',
  pickUp: 'Pick up where you left off',
  startBeginning: 'Start from the beginning',
  resumeTitle: 'Welcome back, Aashi',
  resumeBody: 'You can pick up where you left off, or begin again. There is no wrong choice.',
  chapter: 'A quiet journey',
  journey: 'The little worlds',
  lowerGlow: 'A soft place to land',
  sectionInstructions: [
    'Come in at your own pace. Nothing is waiting on you.',
    'Tap a star. There is no right one.',
    'Tap the garden to let a little light grow.',
    'If you want to, choose one quiet place to rest your attention.',
    'Watch the light, or simply let it be here.',
    'Open a card. The real memories are yours to fill in.',
    'Choose what feels kindest in this moment. You can switch any time.',
    'There is nothing to win here. Just small things to notice.',
    'Read a little, or leave the words for another time.',
    'Stay for a moment, or leave whenever you like.'
  ],
  sectionNames: ['Welcome', 'Starfield', 'Moonlit garden', 'Sanctuary', 'Breathing garden', 'Memory constellation', 'Choose what you need', 'Gentle play', 'A letter', 'Closing'],
  sectionHeadings: [`For ${recipientName}, from ${senderName}`, 'A few stars for you', 'A small garden of light', "You don't have to be okay right now", 'A little room between moments', 'Memories, held gently', 'What would feel kind?', 'Small things to notice', 'A note for you', `You are loved, ${recipientName}`],
  fallback: 'Use the 2D scene',
  use3d: 'Use the 3D scene',
  starLabel: 'Star',
  flowerLabel: 'Flower',
  memoryLabel: 'Memory card',
  luckyStar: 'Open a lucky star',
  fireflyLabel: 'Gather a firefly',
  nudge: 'Nudge the floating objects',
  closeCard: 'Close card',
  flowerButton: 'Grow a flower',
  chooseMood: 'Choose a feeling of space',
  openCard: 'Open this card',
  firefliesGathered: 'Lights gathered',
  messageCount: 'A note is here when you want it.',
  progressOfTen: 'of 10',
  phaseIn: 'In',
  phaseOut: 'Out',
  breathScale: 'Breathing pace',
  breathDefaultPace: '4 / 6',
  welcome: {
    eyebrow: 'A small place made with care',
    heading: `For ${recipientName}, from ${senderName}`,
    body: 'You do not have to explain. You can just be here for a bit.',
    enter: 'Step inside',
    skip: 'Go to the stars'
  },
  starNotes: [
    'You do not have to pretend you are okay here.',
    'You can set the day down for a little while.',
    'You are allowed to feel exactly what you feel.',
    'No explanation is needed. I am here with care.',
    'You deserve gentleness, even on the difficult days.',
    'You can take up space without making things easier for anyone.',
    'Rest does not need to be earned.',
    'You do not have to solve tonight right now.',
    'Being quiet is enough. Being here is enough.',
    'You can leave the words unsaid for now.',
    'I care about you, with no need for you to perform.',
    'There is room for the whole of you here.',
    'You may pause. The world can wait a moment.',
    'You do not owe anyone a brighter version of yourself.',
    'A small breath of space is still space.',
    'You can simply exist for a while. That is enough.'
  ],
  flowerMessages: [
    'A little softness belongs to you.', 'You can rest without having the right words.',
    'You are cared for, even in the quiet.', 'You may put down what feels heavy for a moment.',
    'Nothing needs to be decided right now.', 'There is no test to pass tonight.',
    'You can be gentle with yourself at your own pace.', 'You are more than what this moment asks of you.',
    'It is okay if all you can do is be here.', 'You deserve a place where you can exhale.',
    'You are not a burden for having a hard day.', 'I am glad you are here, just as you are.'
  ],
  groundingPrompts: [
    'If you want to: notice your feet resting on the floor.',
    'If you want to: let your shoulders soften by one small degree.',
    'If you want to: find one color in the room around you.',
    'If you want to: listen for the farthest sound you can hear.',
    'If you want to: notice the support beneath you.',
    'Or choose: “I would rather just sit here.”'
  ],
  breath: {
    title: 'A little room between moments',
    body: 'You can watch the light move, or leave it still. There is no right way to use this space.',
    guided: 'Begin gentle guide',
    stop: 'Stop the guide',
    free: 'Free mode',
    pace: 'Pace',
    slower: 'Slower',
    faster: 'A little quicker',
    inhale: 'In',
    exhale: 'Out',
    resting: 'Resting light'
  },
  // EDITABLE MEMORY CARDS — replace these placeholders with memories only you both know.
  memoryCards: [
    { title: 'A memory for later', body: `A memory only the two of you know. ${senderName}, write it here.` },
    { title: 'Something small and true', body: `A detail you want ${recipientName} to remember. ${senderName}, write it here.` },
    { title: 'A place you can return to', body: `A shared moment belongs here. ${senderName}, write it here.` }
  ],
  needs: [
    { id: 'comfort', title: 'Comfort', line: 'A few steady, gentle words.', color: 'rose', messages: ['You do not need to be easy to care for.', 'I can sit beside you in the quiet.', 'You are allowed to have a tender day.'] },
    { id: 'distraction', title: 'Distraction', line: 'A small change of scene.', color: 'blue', messages: ['Imagine a tiny moon keeping watch over a sleepy garden.', 'Somewhere, a cat has just chosen the least comfortable cushion.', 'A cloud is taking the long way home tonight.'] },
    { id: 'encouragement', title: 'Encouragement', line: 'Kindness without a demand.', color: 'gold', messages: ['You have made it through this moment, at your own pace.', 'You can do less and still be worthy of care.', 'One small pause is plenty for now.'] },
    { id: 'quiet', title: 'Quiet', line: 'Less to look at. More room.', color: 'quiet', messages: ['We can let the silence be soft.', 'Nothing is required from you here.', 'I will leave a little light on.'] },
    { id: 'smile', title: 'A little smile', line: 'A tiny, low-pressure bit of whimsy.', color: 'lilac', messages: ['A firefly has appointed itself assistant moon. It is taking the job very seriously.', 'The clouds are drifting at the speed of a very sleepy snail.', 'A lantern just did a small wobble. It says that was on purpose.'] }
  ],
  playNotes: [
    'A small light can be enough for one moment.', 'You can take a pause whenever you want.',
    'No need to hurry through this night.', 'You are allowed to rest here.'
  ],
  // VIKRAM: EDIT HERE — this tender placeholder contains no invented shared memories.
  letter: `Dear ${recipientName},\n\nYou do not have to explain how you are feeling to me. You do not have to make it smaller, or turn it into something easier to hear.\n\nI care about you as you are, including on the days when everything feels like too much. You do not need to be cheerful for me. You do not need to find the right words.\n\nIf quiet is what you need, I can leave room for quiet. If you want company, I am here. There is no need to answer this letter or feel better before you deserve kindness.\n\nFor now, I hope this little place gives you one soft corner to rest in. Take all the time you need.\n\nWith care,\n${senderName}`,
  closing: {
    title: recipientName,
    message: 'You are loved. You do not owe anyone a performance. You can simply be here, exactly as you are.',
    replay: 'Visit again',
    map: 'Back to any section',
    finish: 'Stay in the quiet'
  },
  feedback: {
    selected: 'A gentle note for you:',
    flower: 'Your little garden is growing.',
    firefly: 'One small light, gathered gently.',
    takeTime: 'There is no hurry. This place will wait quietly.',
    hapticsUnsupported: 'Haptics are not available here.'
  }
};
