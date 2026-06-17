export interface QuizQuestion {
  id: string;
  text: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  paragraph: string;
  category: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizParticipant {
  id: string;
  name: string;
  createdAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  quizCategory: string;
  participantId: string;
  participantName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  date: string;
  answers: { [questionId: string]: string };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "robot";
  text: string;
  timestamp: string;
  type?: "text" | "voice";
  quizSuggestion?: Quiz;
}

export type RobotState = "idle" | "listening" | "speaking" | "thinking";
