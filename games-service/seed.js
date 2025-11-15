require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const Game = require('./models/Game');
const TriviaQuestion = require('./models/TriviaQuestion');
const Exercise = require('./models/Exercise');
const MemorySet = require('./models/MemorySet');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/games';

// Game definitions - Points assigned based on difficulty and engagement
const games = [
  {
    gameId: 'trivia-001',
    name: 'Cultural Trivia',
    type: 'trivia',
    description: 'Test your knowledge of history and culture',
    points: 10,
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
    points: 20,
    difficulty: 'easy'
  },
  {
    gameId: 'recipe-001',
    name: 'Share a Recipe',
    type: 'recipe',
    description: 'Post your favorite family recipe',
    points: 15,
    difficulty: 'easy'
  },
  {
    gameId: 'tower-001',
    name: 'Stack Tower',
    type: 'tower',
    description: 'Stack blocks perfectly to build a tall tower!',
    points: 15,
    difficulty: 'easy'
  }
];

// Trivia questions - Expanded collection for variety
const triviaQuestions = [
  // History Questions
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
    question: 'Who wrote the famous play "Romeo and Juliet"?',
    options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Jane Austen'],
    correctAnswer: 1,
    fact: 'William Shakespeare wrote Romeo and Juliet around 1594-1596, one of his most famous tragedies.',
    category: 'history',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'What year did Singapore gain independence?',
    options: ['1959', '1963', '1965', '1967'],
    correctAnswer: 2,
    fact: 'Singapore became independent on August 9, 1965, after separating from Malaysia.',
    category: 'history',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'Who was the first person to fly solo across the Atlantic Ocean?',
    options: ['Amelia Earhart', 'Charles Lindbergh', 'Orville Wright', 'Howard Hughes'],
    correctAnswer: 1,
    fact: 'Charles Lindbergh completed the first solo transatlantic flight in 1927 in the Spirit of St. Louis.',
    category: 'history',
    difficulty: 'medium'
  },
  {
    questionId: uuidv4(),
    question: 'In what year did the Berlin Wall fall?',
    options: ['1985', '1987', '1989', '1991'],
    correctAnswer: 2,
    fact: 'The Berlin Wall fell on November 9, 1989, marking the end of the Cold War era.',
    category: 'history',
    difficulty: 'medium'
  },

  // Geography Questions
  {
    questionId: uuidv4(),
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Rome'],
    correctAnswer: 2,
    fact: 'Paris, known as the City of Light, has been the capital of France since the 12th century.',
    category: 'geography',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'Which is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean'],
    correctAnswer: 2,
    fact: 'The Pacific Ocean covers more than 60 million square miles and is larger than all land areas combined.',
    category: 'geography',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'What is the tallest mountain in the world?',
    options: ['K2', 'Kilimanjaro', 'Mount Everest', 'Denali'],
    correctAnswer: 2,
    fact: 'Mount Everest stands at 29,032 feet (8,849 meters) above sea level on the Nepal-Tibet border.',
    category: 'geography',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'Which river is the longest in the world?',
    options: ['Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River'],
    correctAnswer: 1,
    fact: 'The Nile River in Africa is approximately 4,135 miles long, flowing through 11 countries.',
    category: 'geography',
    difficulty: 'medium'
  },
  {
    questionId: uuidv4(),
    question: 'How many continents are there?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    fact: 'There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia.',
    category: 'geography',
    difficulty: 'easy'
  },

  // Science & Nature Questions
  {
    questionId: uuidv4(),
    question: 'How many planets are in our solar system?',
    options: ['7', '8', '9', '10'],
    correctAnswer: 1,
    fact: 'There are 8 planets in our solar system since Pluto was reclassified as a dwarf planet in 2006.',
    category: 'science',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'What is the largest land animal?',
    options: ['Giraffe', 'Hippopotamus', 'African Elephant', 'Polar Bear'],
    correctAnswer: 2,
    fact: 'The African Elephant can weigh up to 14,000 pounds and stand 13 feet tall at the shoulder.',
    category: 'science',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'How many days does it take for the Earth to orbit the Sun?',
    options: ['30 days', '100 days', '365 days', '500 days'],
    correctAnswer: 2,
    fact: 'Earth takes approximately 365.25 days to complete one orbit around the Sun, which is why we have leap years.',
    category: 'science',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'What do bees collect from flowers?',
    options: ['Water', 'Nectar', 'Leaves', 'Seeds'],
    correctAnswer: 1,
    fact: 'Bees collect nectar from flowers and transform it into honey, which they store in honeycombs.',
    category: 'science',
    difficulty: 'easy'
  },

  // Entertainment & Culture Questions
  {
    questionId: uuidv4(),
    question: 'Who painted the famous "Mona Lisa"?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
    correctAnswer: 2,
    fact: 'Leonardo da Vinci painted the Mona Lisa between 1503 and 1519. It now hangs in the Louvre Museum in Paris.',
    category: 'culture',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'Which band was known as the "Fab Four"?',
    options: ['The Rolling Stones', 'The Beatles', 'The Beach Boys', 'The Who'],
    correctAnswer: 1,
    fact: 'The Beatles, consisting of John, Paul, George, and Ringo, were nicknamed the "Fab Four" in the 1960s.',
    category: 'culture',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'What is the traditional color worn by brides in Western weddings?',
    options: ['Red', 'White', 'Blue', 'Gold'],
    correctAnswer: 1,
    fact: 'White wedding dresses became popular after Queen Victoria wore white at her wedding in 1840.',
    category: 'culture',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'Which holiday is celebrated on December 25th?',
    options: ['Easter', 'Halloween', 'Christmas', 'Thanksgiving'],
    correctAnswer: 2,
    fact: 'Christmas is celebrated on December 25th to commemorate the birth of Jesus Christ.',
    category: 'culture',
    difficulty: 'easy'
  },

  // Sports & Recreation Questions
  {
    questionId: uuidv4(),
    question: 'How many players are on a soccer team on the field?',
    options: ['9', '10', '11', '12'],
    correctAnswer: 2,
    fact: 'Each soccer team has 11 players on the field, including the goalkeeper.',
    category: 'sports',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'In which sport would you perform a "slam dunk"?',
    options: ['Tennis', 'Basketball', 'Volleyball', 'Baseball'],
    correctAnswer: 1,
    fact: 'A slam dunk is when a basketball player jumps high and scores by pushing the ball down through the basket.',
    category: 'sports',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'What is the maximum score in a single frame of bowling?',
    options: ['10', '20', '30', '100'],
    correctAnswer: 2,
    fact: 'A bowler can score 30 points in a single frame by getting three strikes in a row (a turkey).',
    category: 'sports',
    difficulty: 'medium'
  },

  // Food & Cooking Questions
  {
    questionId: uuidv4(),
    question: 'What type of food is "sushi"?',
    options: ['Italian', 'Chinese', 'Japanese', 'Korean'],
    correctAnswer: 2,
    fact: 'Sushi is a traditional Japanese dish featuring vinegared rice combined with various ingredients like raw fish.',
    category: 'food',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'What fruit is known for keeping the doctor away?',
    options: ['Orange', 'Apple', 'Banana', 'Grape'],
    correctAnswer: 1,
    fact: 'The saying "An apple a day keeps the doctor away" dates back to 1866 and promotes healthy eating.',
    category: 'food',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'What is the main ingredient in bread?',
    options: ['Rice', 'Flour', 'Sugar', 'Salt'],
    correctAnswer: 1,
    fact: 'Flour, usually made from wheat, is the main ingredient in bread along with water, yeast, and salt.',
    category: 'food',
    difficulty: 'easy'
  },

  // General Knowledge Questions
  {
    questionId: uuidv4(),
    question: 'How many sides does a hexagon have?',
    options: ['4', '5', '6', '8'],
    correctAnswer: 2,
    fact: 'A hexagon is a six-sided polygon. Honeycombs are made up of hexagonal cells!',
    category: 'general',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'What color is an emerald?',
    options: ['Red', 'Blue', 'Green', 'Yellow'],
    correctAnswer: 2,
    fact: 'Emeralds are green gemstones that have been prized for thousands of years. Cleopatra was known to love emeralds!',
    category: 'general',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'How many hours are in a day?',
    options: ['12', '24', '36', '48'],
    correctAnswer: 1,
    fact: 'A day has 24 hours, which includes both daytime and nighttime. The Earth takes 24 hours to rotate once.',
    category: 'general',
    difficulty: 'easy'
  },
  {
    questionId: uuidv4(),
    question: 'What season comes after summer?',
    options: ['Spring', 'Winter', 'Autumn', 'Monsoon'],
    correctAnswer: 2,
    fact: 'Autumn (also called fall) comes after summer. It is when leaves change color and fall from trees.',
    category: 'general',
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

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nSummary:');
    console.log(`- Games: ${games.length}`);
    console.log(`- Trivia Questions: ${triviaQuestions.length}`);
    console.log(`- Exercises: ${exercises.length}`);
    console.log(`- Memory Sets: ${memorySets.length}`);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
