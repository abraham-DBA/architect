import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JIM_ROHN_QUOTES = [
  "Success is not to be pursued; it is to be attracted by the person you become.",
  "Discipline is the bridge between goals and accomplishment.",
  "You are the average of the five people you spend the most time with.",
  "Don't wish it were easier; wish you were better.",
  "Work harder on yourself than you do on your job.",
  "If you don't design your own life plan, chances are you'll fall into someone else's plan.",
  "Either you run the day, or the day runs you.",
  "Motivation is what gets you started. Habit is what keeps you going.",
  "Formal education will make you a living; self-education will make you a fortune.",
  "Don't let your learning lead to knowledge. Let your learning lead to action.",
  "Happiness is not something you postpone for the future; it is something you design for the present.",
  "If you are not willing to risk the unusual, you will have to settle for the ordinary.",
  "Take care of your body. It's the only place you have to live.",
  "The major reason for setting a goal is for what it makes of you to accomplish it.",
  "We must all suffer from one of two pains: the pain of discipline or the pain of regret.",
  "Success is doing ordinary things extraordinarily well.",
  "The few who do are the envy of the many who only watch.",
  "Days are expensive. When you spend a day you have one less day to spend.",
  "Without a sense of urgency, desire loses its value.",
  "Give whatever you are doing and whoever you are with the gift of your attention.",
  "Character isn't something you were born with and can't change. It's something you weren't born with and must take responsibility for forming.",
  "The challenge of leadership is to be strong, but not rude; be kind, but not weak.",
  "Learn how to be happy with what you have while you pursue all that you want.",
  "If you really want to do something, you'll find a way. If you don't, you'll find an excuse.",
  "Miss a meal if you have to, but don't miss a book.",
  "You cannot change your destination overnight, but you can change your direction overnight.",
  "The walls we build around us to keep sadness out also keep out the joy.",
  "Time is more valuable than money. You can get more money, but you cannot get more time.",
  "The more you know, the less you need to say.",
  "Profits are better than wages. Wages make you a living; profits make you a fortune.",
  "Don't join an easy crowd; you won't grow. Go where the expectations and the demands to perform are high.",
  "Let others lead small lives, but not you. Let others argue over small things, but not you.",
  "The difficulties you meet will resolve themselves as you advance. Proceed, and light will dawn.",
  "You must take personal responsibility. You cannot change the circumstances, the seasons, or the wind, but you can change yourself.",
  "Goals. There's no telling what you can do when you get inspired by them.",
  "Affirmation without discipline is the beginning of delusion.",
  "The ultimate reason for setting goals is to entice you to become the person it takes to achieve them.",
  "Don't borrow someone else's plan. Develop your own philosophy.",
  "Your family and your love must be cultivated like a garden. Time, effort, and imagination must be summoned.",
  "The best way to predict your future is to create it.",
  "Excuses are the nails used to build a house of failure.",
  "We get paid for bringing value to the marketplace.",
  "It isn't what the book costs; it's what it will cost you if you don't read it.",
  "Don't just read the easy stuff. You may be entertained by it, but you will never grow from it.",
  "The major value in life is not what you get. The major value in life is what you become.",
  "Learning is the beginning of wealth. Learning is the beginning of health. Learning is the beginning of spirituality.",
  "Poor people have big TV's. Rich people have big libraries.",
  "How long should you try? Until.",
  "Don't say, 'If I could, I would.' Say, 'If I can, I will.'",
  "Make measurable progress in reasonable time.",
  "Ideas can be life-changing. Sometimes all you need to open the door is just one more good idea.",
  "Effective communication is 20% what you know and 80% how you feel about what you know.",
  "The challenge of life is to become all that you can become.",
  "Life is not just the passing of time. Life is the collection of experiences and their intensity.",
  "Whoever would acquire self-knowledge, let him apply himself to the study of his own actions.",
  "Success is neither magical nor mysterious. Success is the natural consequence of consistently applying basic fundamentals.",
  "For things to change, you have to change.",
  "For things to get better, you have to get better.",
  "It is the set of the sails, not the direction of the wind that determines which way we will go.",
  "Giving is better than receiving because giving is the beginning of receiving.",
  "Labor gives birth to ideas.",
  "The good life is not an amount; it's an attitude, an act, an idea, a discovery, a search.",
];

async function main() {
  const count = await prisma.quote.count();
  if (count >= 50) {
    console.log(`Quotes already seeded (${count} found).`);
    return;
  }

  await prisma.quote.createMany({
    data: JIM_ROHN_QUOTES.map((text) => ({ text })),
    skipDuplicates: true,
  });

  console.log(`Seeded ${JIM_ROHN_QUOTES.length} Jim Rohn quotes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
