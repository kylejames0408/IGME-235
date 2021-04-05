"use strict";

window.onload = function() {
    GeneratePhrases();
};

// Fields
let phrases = ["Sorry to deny you a moment of primate triumph, but you'll have to go elsewhere to sound your barbaric yawp.",
    "You see that you and I are of a different stripe, don't you? We don't have to <em>dream</em> that we're important. We <em>are</em>.",
    "Success depends on forethought, dispassionate calculation of probabilities, accounting for every stray variable.",
    "Nothing to impede progress. If you want to see the fate of democracies, look out the windows.",
    "I like to think you have enough sense to do the right thing. The rewards for doing so are immense... as are the punishments for not doing so.",
    "To your untrained eyes, it may look as though mankind is making a comeback. In the NCR, you have something that resembles a nation state. Savage as it is, in Caesar's Legion, you have an organized society. But neither of these offer a future. They're regurgitations of the past.",
    "From what I hear, I'd want to eat at the Gourmand every night... if I were ambulatory.",
    "But autocracy? Firm control in the hands of a technological and economic visionary? Yes, that Vegas shall have.",
    "I offer many benefits, but vacation time isn't one of them.",
    "You don't see them raiding hospitals to cart away Auto-Docs or armfuls of prosthetic organs. No, they greatly prefer the sort of technology that <em>puts</em> people in hospitals. Or graves, rather, since hospitals went the way of the Dodo.",
    "We're talking about a coterie of bulging-eyed fanatics who think all Pre-War technology belongs to them.",
    "Because they're ridiculous! Because they galavant around the Mojave pretending to be Knights of Yore. The world has no use for emotionally unstable techno-fetishists. Just wipe them out, will you?",
    "Ideological purity and shiny power armor don't count for much when you're outnumbered 15:1.",
    "Goodbye? Is that some kind of joke? You barely understand what I want you to accomplish down there.",
    "I can't reach through this monitor and compel you to follow instructions, but know this - if you disappoint me, you will pay for it.",
    "Are you a child? The Platinum Chip was taken from you, obviously.",
    "You laid the foundation for my victory, so fine - I'll permit some latitude in how you schedule your work.",
    "Absolutely not! Caesar is of great use to me. I don't want you harming a hair on that man's head - assuming you can find one.",
    "I much prefer working with robots...",
    "What of it? I enjoy them. There's something about a little diorama set inside a glass dome that I... find pleasing.",
    "Until you do this, consider yourself suspended... without pay.",
    "Marvelous work ethic, bravo.",
    "Kimball may be a grandstanding boor, but I want him protected.",
    "An opinion you expressed with supreme subtlety and finesse. Moving on...",
    "Do you have any idea how prodigious is the opportunity you're casting aside here?",
    "Why would I want to go to war against the NCR? They're my best customers.",
    "Not interested? Not interested? You have an interest in this even if you're too stupid to know it. If you have an interest in breathing, you have an interest in this.",
    "I haven't shown my hand - I've shown one card. I've given my enemies a single, provocative datum upon which to fixate. They have no idea what other cards I'm holding. It's a strong hand, believe me - I dealt it to myself.",
    "Consequently, I have to 'wait and see' what happens. It's... grotesque.",
    "You're making me question your usefulness, you realize.",
    "Had I used an armed caravan to transport the Chip, I might as well have been announcing to the world 'this is important. Attack this!'",
    "You are the first person to step foot inside the Lucky 38 in over 200 years. It was not an invitation I made lightly.",
    "I'm not offering you an incentive as crude as money - though there'll be plenty of that. What I'm offering you is a ground-floor opportunity in the most important enterprise on Earth. What I'm offering is a future - for you, and for what remains of the human race.",
    "If you find Caesar's Legion so frightening at this remove, imagine them rampaging across the Strip. We have a chance to see them destroyed, to see New Vegas become the harbinger of a new age.",
    "Don't let the video screens and computer terminals fool you. I'm flesh and blood, not silicon.",
    "You needn't be afraid of me. It's my Securitrons that are going to kill you.",
    "By the time I was 30 years old, I was a billionaire 30 times over. I founded and ran a vast economic empire. Do you really think I'm going to let an upstart come into my home and ransom my property to me? I spent two centuries searching for the Platinum Chip. It's my invention, my property - mine. Now be a good courier and deliver it!",
    "I invite you to think carefully about what you do next... standing alone before me, surrounded by my heavily-armed Securitron guards.",
    "I'm sure the assassins will wait for you to show up.",
    "New Vegas is more than a city - it's the remedy to mankind's derailment."];
let phrase1 = document.querySelector("#dynamic1");
let phrase2 = document.querySelector("#dynamic2");
let button = document.querySelector("#newPhrase");

// Function to generate two phrases
function GeneratePhrases() {
    // Generate two random values that are different.
    let random1 = Math.floor(Math.random() * phrases.length);
    let random2 = Math.floor(Math.random() * phrases.length);
    while (random2 == random1 || random2 == NaN) {
        random2 = Math.floor(Math.random() * phrases.length);
    }

    // Fill the paragraphs with the phrases
    phrase1.innerHTML = phrases[random1];
    phrase2.innerHTML = phrases[random2];
};

// Events
button.onclick = function(e) {
    GeneratePhrases();
}