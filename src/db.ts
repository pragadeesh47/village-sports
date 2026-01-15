// Use default import for Dexie to ensure inherited members like 'version' are correctly recognized by the type system.
import Dexie, { type Table } from 'dexie';
import type {
    AppSettings,
    AgeGroup,
    Participant,
    Game,
    GameParticipant,
    EditHistory
} from './types';

export class FestivalDatabase extends Dexie {
  settings!: Table<AppSettings>;
  ageGroups!: Table<AgeGroup>;
  participants!: Table<Participant>;
  games!: Table<Game>;
  gameParticipants!: Table<GameParticipant>;
  history!: Table<EditHistory>;

  constructor() {
    super('VillageFestivalDB');
    // Defining the database schema version and store structure using this.version().
    // Inherited method 'version' is now correctly recognized via default import of Dexie.
    this.version(1).stores({
      settings: '++id',
      ageGroups: '++id, name',
      participants: '++id, name, ageGroupId',
      games: '++id, name, ageGroupId, status',
      gameParticipants: '++id, gameId, participantId, position',
      history: '++id, gameId, timestamp'
    });
  }
}

export const db = new FestivalDatabase();