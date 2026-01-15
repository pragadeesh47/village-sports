
export interface AppSettings {
    id: number;
    villageName: string;
    gangName: string;
    isSetupComplete: boolean;
  }
  
  export interface AgeGroup {
    id?: number;
    name: string;
    minAge: number;
    maxAge: number;
  }
  
  export interface Participant {
    id?: number;
    name: string;
    ageGroupId: number;
    badgeCount: number;
    points: number;
  }
  
  export enum GameStatus {
    NOT_STARTED = 'NOT_STARTED',
    ONGOING = 'ONGOING',
    COMPLETED = 'COMPLETED'
  }
  
  export interface Game {
    id?: number;
    name: string;
    ageGroupId: number;
    status: GameStatus;
    startTime?: number; // timestamp
    endTime?: number;   // timestamp
    isLocked: boolean;
  }
  
  export interface GameParticipant {
    id?: number;
    gameId: number;
    participantId: number;
    position?: number; // 1, 2, 3...
  }
  
  export interface EditHistory {
    id?: number;
    gameId?: number;
    actionType: 'EDIT' | 'UNLOCK' | 'RELOCK' | 'START' | 'END' | 'CREATE';
    performedBy: string;
    reason: string;
    changes: string; // JSON string or description
    timestamp: number;
  }
  
  export interface LeaderboardEntry {
    participantId: number;
    name: string;
    points: number;
    wins: number;
    badges: number;
  }
  