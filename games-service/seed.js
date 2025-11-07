require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const Game = require('./models/Game');
const TriviaQuestion = require('./models/TriviaQuestion');
const Exercise = require('./models/Exercise');
const MemorySet = require('./models/MemorySet');
const StackTower = require('./models/StackTower');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/games';

// Game definitions
const games = [
  {
    gameId: 'trivia-001',
    name: 'Cultural Trivia',
    type: 'trivia',
    description: 'Test your knowledge of history and culture',
    points: 15,
    difficulty: 'easy'
  },
  {
    gameId: 'memory-001',
    name: 'Memory Match',
    type: 'memory',
    description: 'Find all matching pairs of fruit',
    points: 15,
    difficulty: 'easy'
  },
  {
    gameId: 'stretch-001',
    name: 'Morning Stretch',
    type: 'stretch',
    description: '5 gentle exercises to start your day',
    points: 10,
    difficulty: 'easy'
  }
];

// Trivia questions (from CulturalTrivia.tsx)
const triviaQuestions = [
  {
    questionId: uuidv4(),
    question: 'What year did the first person land on the moon?',
    options: ['1965', '1969', '1972', '1975'],
    correctAnswer: 1,
    fact: 'Neil Armstrong and Buzz Aldrin landed on the moon on July 20, 1969!',
    category: 'history',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'Which famous ship sank in 1912?',
    options: ['Lusitania', 'Titanic', 'Britannic', 'Olympic'],
    correctAnswer: 1,
    fact: 'The RMS Titanic sank on its maiden voyage after hitting an iceberg.',
    category: 'history',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'Who was the first president of the United States?',
    options: ['Thomas Jefferson', 'John Adams', 'George Washington', 'Benjamin Franklin'],
    correctAnswer: 2,
    fact: 'George Washington served as the first U.S. President from 1789 to 1797.',
    category: 'history',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'In which year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswer: 2,
    fact: 'World War II ended in 1945 with the surrender of Germany in May and Japan in August.',
    category: 'history',
    difficulty: 'medium'
  },
  {
    questionId: uuidv4(),
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Rome'],
    correctAnswer: 2,
    fact: 'Paris, known as the City of Light, has been the capital of France since the 12th century.',
    category: 'geography',
    difficulty: 'easy'
  }
];

// Exercises (from MorningStretch.tsx)
const exercises = [
  {
    exerciseId: uuidv4(),
    name: 'Neck Rolls',
    description: 'Slowly roll your head in a circle, first clockwise, then counter-clockwise',
    duration: 30,
    image: '🙆',
    videoUrl: '/videos/neck-rolls.mp4',
    order: 1,
    difficulty: 'easy'
  },
  {
    exerciseId: uuidv4(),
    name: 'Shoulder Shrugs',
    description: 'Lift your shoulders up towards your ears, hold for 3 seconds, then release',
    duration: 30,
    image: '💪',
    videoUrl: '/videos/shoulder-shrugs.mp4',
    order: 2,
    difficulty: 'easy'
  },
  {
    exerciseId: uuidv4(),
    name: 'Arm Circles',
    description: 'Extend your arms out to the sides and make small circles',
    duration: 30,
    image: '🤸',
    videoUrl: '/videos/arm-circles.mp4',
    order: 3,
    difficulty: 'easy'
  },
  {
    exerciseId: uuidv4(),
    name: 'Seated Twist',
    description: 'Sit up straight and gently twist your torso to the left, then to the right',
    duration: 30,
    image: '🧘',
    videoUrl: '/videos/seated-twist.mp4',
    order: 4,
    difficulty: 'easy'
  },
  {
    exerciseId: uuidv4(),
    name: 'Ankle Rolls',
    description: 'Lift one foot and rotate your ankle in circles, then switch feet',
    duration: 30,
    image: '🦶',
    videoUrl: '/videos/ankle-rolls.mp4',
    order: 5,
    difficulty: 'easy'
  }
];

// Memory card sets (from MemoryQuiz.tsx)
const memorySets = [
  {
    setId: uuidv4(),
    name: 'Fruit Memory',
    cards: ['🍎', '🍌', '🍇', '🍓', '🍊', '🍋', '🥝', '🍒'],
    theme: 'fruits',
    difficulty: 'easy'
  },
  {
    setId: uuidv4(),
    name: 'Animal Memory',
    cards: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    theme: 'animals',
    difficulty: 'easy'
  },
  {
    setId: uuidv4(),
    name: 'Nature Memory',
    cards: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀'],
    theme: 'nature',
    difficulty: 'medium'
  }
];

// Stack Tower configurations (from StackTower.tsx)
const stackTowers = [
  {
    towerId: uuidv4(),
    name: 'Easy Tower',
    targetBlocks: 5,
    difficulty: 'easy',
    settings: {
      initialSpeed: 2,
      speedIncrement: 0.2,
      initialWidth: 100
    }
  },
  {
    towerId: uuidv4(),
    name: 'Medium Tower',
    targetBlocks: 8,
    difficulty: 'medium',
    settings: {
      initialSpeed: 3,
      speedIncrement: 0.3,
      initialWidth: 80
    }
  },
  {
    towerId: uuidv4(),
    name: 'Hard Tower',
    targetBlocks: 12,
    difficulty: 'hard',
    settings: {
      initialSpeed: 4,
      speedIncrement: 0.4,
      initialWidth: 60
    }
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Game.deleteMany({});
    await TriviaQuestion.deleteMany({});
    await Exercise.deleteMany({});
    await MemorySet.deleteMany({});
    await StackTower.deleteMany({});
    console.log('Existing data cleared');

    // Insert games
    console.log('Inserting games...');
    await Game.insertMany(games);
    console.log(`Inserted ${games.length} games`);

    // Insert trivia questions
    console.log('Inserting trivia questions...');
    await TriviaQuestion.insertMany(triviaQuestions);
    console.log(`Inserted ${triviaQuestions.length} trivia questions`);

    // Insert exercises
    console.log('Inserting exercises...');
    await Exercise.insertMany(exercises);
    console.log(`Inserted ${exercises.length} exercises`);

    // Insert memory sets
    console.log('Inserting memory sets...');
    await MemorySet.insertMany(memorySets);
    console.log(`Inserted ${memorySets.length} memory sets`);

    // Insert stack towers
    console.log('Inserting stack tower configurations...');
    await StackTower.insertMany(stackTowers);
    console.log(`Inserted ${stackTowers.length} stack tower configurations`);

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Games: ${games.length}`);
    console.log(`- Trivia Questions: ${triviaQuestions.length}`);
    console.log(`- Exercises: ${exercises.length}`);
    console.log(`- Memory Sets: ${memorySets.length}`);
    console.log(`- Stack Towers: ${stackTowers.length}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
