// SeniorCare Database initialisation

var now = new Date();

// define variables for cross db reference
var seniorId1 = UUID().toString();
var seniorId2 = UUID().toString();
var familyId1 = UUID().toString();
var familyId2 = UUID().toString();
var adminId = UUID().toString();

// Game-related ID
var triviaGameId = UUID().toString();
var memoryGameId = UUID().toString();
var stretchGameId = UUID().toString();
var towerGameId = UUID().toString();

var triviaSessionId = UUID().toString();
var memorySessionId = UUID().toString();

var exerciseId1 = UUID().toString();
var exerciseId2 = UUID().toString();
var exerciseId3 = UUID().toString();
var exerciseId4 = UUID().toString();
var exerciseId5 = UUID().toString();

var triviaQ1Id = UUID().toString();
var triviaQ2Id = UUID().toString();
var triviaQ3Id = UUID().toString();
var triviaQ4Id = UUID().toString();
var triviaQ5Id = UUID().toString();

var memorySet1Id = UUID().toString();
var memorySet2Id = UUID().toString();
var memorySet3Id = UUID().toString();

var invitation1Id = UUID().toString();
var invitation2Id = UUID().toString();

// Switch to / Create desired database
db = db.getSiblingDB('senior_care');

// Create Collections
db.createCollection('users');
db.createCollection('relationships');
db.createCollection('engagements');
db.createCollection('games');
db.createCollection('gamesessions');
db.createCollection('exercises');
db.createCollection('triviaquestions');
db.createCollection('memorysets');
db.createCollection('invitations');

// Cloud Seed Data
// ---- Users ----
// All users have password: "password123"
db.users.insertMany([
    {
        userId: seniorId1,
        username: "mary_smith",
        passwordHash: "$2b$10$4rpqad3FJyRil4P8wVLwM.DmAmuzVO/IsqjiK.6N/9QpYx6Wka8zK",
        role: "senior",
        profile: {
            name: "Mary Smith",
            age: 72,
            email: "mary@example.com",
            contact: "+65-9000-1000"
        },
        createdAt: new Date("2025-01-15T10:30:00.000Z"),
        updatedAt: new Date("2025-01-15T10:30:00.000Z"),
    },
    {
        userId: seniorId2,
        username: "joe_tan",
        passwordHash: "$2b$10$4rpqad3FJyRil4P8wVLwM.DmAmuzVO/IsqjiK.6N/9QpYx6Wka8zK",
        role: "senior",
        profile: {
            name: "Joe Tan",
            age: 88,
            email: "joe_tan@example.com",
            contact: "+65-8010-1020"
        },
        createdAt: new Date("2025-01-16T10:30:00.000Z"),
        updatedAt: new Date("2025-01-16T10:30:00.000Z"),
    },
    {
        userId: familyId1,
        username: "anna_smith",
        passwordHash: "$2b$10$4rpqad3FJyRil4P8wVLwM.DmAmuzVO/IsqjiK.6N/9QpYx6Wka8zK",
        role: "family",
        profile: {
            name: "Anna Smith",
            age: 40,
            email: "anna@example.com",
            contact: "+65-8000-2000"
        },
        createdAt: new Date("2025-01-15T10:30:00.000Z"),
        updatedAt: new Date("2025-01-15T10:30:00.000Z"),
    },
    {
        userId: familyId2,
        username: "lucas_tan",
        passwordHash: "$2b$10$4rpqad3FJyRil4P8wVLwM.DmAmuzVO/IsqjiK.6N/9QpYx6Wka8zK",
        role: "family",
        profile: {
            name: "Lucas Tan",
            age: 45,
            email: "lucas@example.com",
            contact: "+65-8020-2020"
        },
        createdAt: new Date("2025-01-16T10:30:00.000Z"),
        updatedAt: new Date("2025-01-16T10:30:00.000Z"),
    },
    {
        userId: adminId,
        username: "admin_main",
        passwordHash: "$2b$10$4rpqad3FJyRil4P8wVLwM.DmAmuzVO/IsqjiK.6N/9QpYx6Wka8zK",
        role: "admin",
        profile: {
            name: "System Admin",
            age: 35,
            email: "admin@example.com",
            contact: "+65-8000-3000"
        },
        createdAt: now,
        updatedAt: now,
    },
]);

// ---- Relationships ----
db.relationships.insertMany([
    {
        seniorId: seniorId1,
        linkAccId: familyId1,
        relation: "daughter",
        createdAt: new Date("2025-01-15T10:30:00.000Z")
    },
    {
        seniorId: seniorId2,
        linkAccId: familyId2,
        relation: "son",
        createdAt: new Date("2025-01-16T10:30:00.000Z")
    },
])

// ---- Engagements ----
db.engagements.insertMany([
    {
        userId: seniorId1,
        date: "2025-11-09",
        checkIn: true,
        tasksCompleted: [
            {type: "trivia", points: 50},
            {type: "stretch", points: 30}
        ],
        totalScore: 80,
        lastActiveAt: new Date("2025-11-09T14:25:00.000Z")
    },
    {
        userId: seniorId1,
        date: "2025-11-10",
        checkIn: true,
        tasksCompleted: [
            {type: "trivia", points: 50},
            {type: "memory", points: 40},
        ],
        totalScore: 90,
        lastActiveAt: new Date("2025-11-10T14:25:00.000Z")
    },
    {
        userId: seniorId2,
        date: "2025-11-09",
        checkIn: true,
        tasksCompleted: [
            {type: "trivia", points: 50},
            {type: "stretch", points: 30}
        ],
        totalScore: 80,
        lastActiveAt: new Date("2025-11-09T14:30:00.000Z")
    },
    {
        userId: seniorId2,
        date: "2025-11-10",
        checkIn: true,
        tasksCompleted: [
            {type: "memory", points: 50},
            {type: "stretch", points: 40},
        ],
        totalScore: 90,
        lastActiveAt: new Date("2025-11-10T14:30:00.000Z")
    }
])

// Games
db.games.insertMany([
    {
        gameId: triviaGameId,
        name: "Brain  Boost Trivia",
        type: "trivia",
        description: "Answer questions to keep your mind sharp.",
        points: 10,
        difficulty: "easy",
        isActive: true,
        createdAt: new Date("2025-11-01T14:30:00.000Z"),
        updatedAt: new Date("2025-11-01T14:30:00.000Z")
    },
    {
        gameId: memoryGameId,
        name: "Fruits Memory Match",
        type: "memory",
        description: "Flip cards and match the fruit pairs.",
        points: 15,
        difficulty: "medium",
        isActive: true,
        createdAt: new Date("2025-11-01T14:30:00.000Z"),
        updatedAt: new Date("2025-11-01T14:30:00.000Z")
    },
    {
        gameId: stretchGameId,
        name: "Morning Stretch Routine",
        type: "stretch",
        description: "Gently stretching exercise to start the day.",
        points: 5,
        difficulty: "easy",
        isActive: true,
        createdAt: new Date("2025-11-01T14:30:00.000Z"),
        updatedAt: new Date("2025-11-01T14:30:00.000Z")
    },
    {
        gameId: towerGameId,
        name: "Stack Tower",
        type: "tower",
        description: "Stack blocks perfectly to build a tall tower!",
        points: 20,
        difficulty: "medium",
        isActive: true,
        createdAt: new Date("2025-11-01T14:30:00.000Z"),
        updatedAt: new Date("2025-11-01T14:30:00.000Z")
    }
])

// Game Sessions
db.gamesessions.insertMany([
  {
    sessionId: triviaSessionId,
    userId: seniorId1,          // links back to users.userId
    gameId: triviaGameId,      // links to games.gameId
    gameType: "trivia",
    startedAt: new Date("2025-11-09T14:20:00.000Z"),
    completedAt: new Date("2025-11-09T14:25:00.000Z"),
    score: 8,
    pointsEarned: 50,
    correctAnswers: 8,
    totalQuestions: 10,
    isCompleted: true,
    metadata: {
      timePerQuestion: [15, 12, 18, 10, 20, 14, 16, 11, 13, 17]
    }
  },
  {
    sessionId: memorySessionId,
    userId: seniorId1,
    gameId: memoryGameId,
    gameType: "memory",
    startedAt: new Date("2025-11-08T09:00:00.000Z"),
    completedAt: new Date("2025-11-08T09:10:00.000Z"),
    score: 120,
    pointsEarned: 30,
    moves: 18,
    isCompleted: true,
    metadata: {
      bestStreak: 4
    }
  }
]);

// Exercises
db.exercises.insertMany([
  {
    exerciseId: exerciseId1,
    name: "Neck Rolls",
    description: "Slowly tilt your head towards each shoulder and hold.",
    duration: 30, // seconds
    image: "🧘",
    videoUrl: "/videos/neck-rolls.mp4",
    order: 1,
    difficulty: "easy",
    isActive: true,
    createdAt: now
  },
  {
    exerciseId: exerciseId2,
    name: 'Shoulder Shrugs',
    description: 'Lift your shoulders up towards your ears, hold for 3 seconds, then release',
    duration: 30,
    image: '💪',
    videoUrl: '/videos/shoulder-shrugs.mp4',
    order: 2,
    difficulty: "medium",
    isActive: true,
    createdAt: now
  },
  {
    exerciseId: exerciseId3,
    name: 'Arm Circles',
    description: 'Extend your arms out to the sides and make small circles',
    duration: 30,
    image: '🤸',
    videoUrl: '/videos/arm-circles.mp4',
    order: 3,
    difficulty: "easy",
    isActive: true,
    createdAt: now
  },
  {
    exerciseId: exerciseId4,
    name: 'Seated Twist',
    description: 'Sit up straight and gently twist your torso to the left, then to the right',
    duration: 30,
    image: '🧘',
    videoUrl: '/videos/seated-twist.mp4',
    order: 4,
    difficulty: "hard",
    isActive: true,
    createdAt: now
  },
  {
    exerciseId: exerciseId5,
    name: 'Ankle Rolls',
    description: 'Lift one foot and rotate your ankle in circles, then switch feet',
    duration: 30,
    image: '🦶',
    videoUrl: '/videos/ankle-rolls.mp4',
    order: 5,
    difficulty: "medium",
    isActive: true,
    createdAt: now
  },
]);

// Trivia Question
db.triviaquestions.insertMany([
  {
    questionId: triviaQ1Id,
    question: 'What year did the first person land on the moon?',
    options: ['1965', '1969', '1972', '1975'],
    correctAnswer: 1,
    fact: 'Neil Armstrong and Buzz Aldrin landed on the moon on July 20, 1969!',
    category: "history",
    difficulty: "easy",
    isActive: true,
    createdAt: now
  },
  {
    questionId: triviaQ2Id,
    question: 'Which famous ship sank in 1912?',
    options: ['Lusitania', 'Titanic', 'Britannic', 'Olympic'],
    correctAnswer: 1,
    fact: 'The RMS Titanic sank on its maiden voyage after hitting an iceberg.',
    category: "history",
    difficulty: "easy",
    isActive: true,
    createdAt: now
  },
  {
    questionId: triviaQ3Id,
    question: 'In which year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correctAnswer: 2,
    fact: 'World War II ended in 1945 with the surrender of Germany in May and Japan in August.',
    category: 'history',
    difficulty: 'medium',
    isActive: true,
    createdAt: now
  },
  {
    questionId: triviaQ4Id,
    question: "Which organ pumps blood around the body?",
    options: ["Lungs", "Brain", "Heart", "Stomach"],
    correctAnswer: 2,
    fact: "The heart pumps blood through a network of arteries and veins.",
    category: "health",
    difficulty: "easy",
    isActive: true,
    createdAt: now
  },
  {
    questionId: triviaQ5Id,
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Rome'],
    correctAnswer: 2,
    fact: 'Paris, known as the City of Light, has been the capital of France since the 12th century.',
    category: 'geography',
    difficulty: 'easy',
    isActive: true,
    createdAt: now
  }
]);

// Memory Set
db.memorysets.insertMany([
  {
    setId: memorySet1Id,
    name: "Fruit Pairs",
    cards: ["🍎", "🍌", "🍇", "🍓", "🍊", "🍋", "🥝", "🍒"],
    grid: { rows: 4, cols: 4 }, 
    theme: "fruits",
    difficulty: "easy",
    isActive: true,
    createdAt: now
  },
  {
    setId: memorySet2Id,
    name: 'Animal Memory',
    cards: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
    theme: 'animals',
    difficulty: 'easy',
    isActive: true,
    createdAt: now
  },
  {
    setId: memorySet3Id,
    name: 'Nature Memory',
    cards: ['🌸', '🌺', '🌻', '🌷', '🌹', '🌼', '🌿', '🍀'],
    theme: 'nature',
    difficulty: 'medium',
    isActive: true,
    createdAt: now
  }
]);

// Invitations
db.invitations.insertMany([
  {
    invitationId: invitation1Id,
    seniorId: seniorId1,
    familyId: familyId1,
    title: "Family Dinner",
    description: "Hi Mom! Would love to have dinner together this Saturday. Miss you! ❤️",
    dateTime: new Date("2025-11-15T18:00:00.000Z"),
    status: "pending",
    createdAt: now
  },
  {
    invitationId: invitation2Id,
    seniorId: seniorId1,
    familyId: familyId1,
    title: "Doctor Appointment",
    description: "Scheduled your checkup with Dr. Lee. I will pick you up at 9:30 AM.",
    dateTime: new Date("2025-11-16T10:00:00.000Z"),
    status: "pending",
    createdAt: now
  }
]);