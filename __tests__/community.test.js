const { mockClient } = require('@supabase/supabase-js');
import { fetchPublicWorkouts, fetchLeaderboard, fetchMyWorkouts } from '../src/utils/community';

beforeEach(() => jest.clearAllMocks());

const mockWorkouts = [
  { id: 'w1', name: 'Push Day', creator_id: 'user1', display_name: 'Jake W', is_public: true, play_count: 42, clap_count: 8, moves: [], fitness_level: 'beginner' },
  { id: 'w2', name: 'Core Blast', creator_id: 'user2', display_name: 'Anna S', is_public: true, play_count: 15, clap_count: 3, moves: [], fitness_level: 'any' },
];

const makeChain = (finalVal) => {
  // A chainable mock that also resolves as a Promise (for terminal .order()/.limit() calls)
  const thenable = { ...finalVal, then: (resolve) => resolve(finalVal) };
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnValue({ ...thenable, limit: jest.fn().mockResolvedValue(finalVal) }),
    limit: jest.fn().mockResolvedValue(finalVal),
    single: jest.fn().mockResolvedValue(finalVal),
    maybeSingle: jest.fn().mockResolvedValue(finalVal),
    delete: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue(finalVal),
    upsert: jest.fn().mockResolvedValue(finalVal),
  };
  return chain;
};

describe('fetchPublicWorkouts', () => {
  test('returns public workouts', async () => {
    mockClient.from.mockReturnValue(makeChain({ data: mockWorkouts, error: null }));
    const result = await fetchPublicWorkouts({ orderBy: 'play_count' });
    expect(result).toEqual(mockWorkouts);
    expect(mockClient.from).toHaveBeenCalledWith('workouts');
  });

  test('returns empty array when data is null', async () => {
    mockClient.from.mockReturnValue(makeChain({ data: null, error: null }));
    const result = await fetchPublicWorkouts();
    expect(result).toEqual([]);
  });

  test('throws when Supabase returns error', async () => {
    mockClient.from.mockReturnValue(makeChain({ data: null, error: { message: 'DB error' } }));
    await expect(fetchPublicWorkouts()).rejects.toBeDefined();
  });
});

describe('fetchMyWorkouts', () => {
  test('queries by creator_id', async () => {
    const chain = makeChain({ data: [mockWorkouts[0]], error: null });
    mockClient.from.mockReturnValue(chain);
    const result = await fetchMyWorkouts('user1');
    expect(chain.eq).toHaveBeenCalledWith('creator_id', 'user1');
    expect(result).toHaveLength(1);
  });

  test('returns empty array when no workouts', async () => {
    mockClient.from.mockReturnValue(makeChain({ data: [], error: null }));
    const result = await fetchMyWorkouts('user-nobody');
    expect(result).toEqual([]);
  });
});

describe('fetchLeaderboard', () => {
  test('returns workouts ordered by metric', async () => {
    const chain = makeChain({ data: mockWorkouts, error: null });
    mockClient.from.mockReturnValue(chain);
    const result = await fetchLeaderboard({ metric: 'clap_count' });
    expect(chain.order).toHaveBeenCalledWith('clap_count', expect.any(Object));
    expect(result).toEqual(mockWorkouts);
  });

  test('filters by fitness level when provided', async () => {
    const chain = makeChain({ data: mockWorkouts, error: null });
    mockClient.from.mockReturnValue(chain);
    await fetchLeaderboard({ fitnessLevel: 'beginner' });
    expect(chain.in).toHaveBeenCalledWith('fitness_level', ['beginner', 'any']);
  });

  test('does not filter when fitnessLevel is any', async () => {
    const chain = makeChain({ data: mockWorkouts, error: null });
    mockClient.from.mockReturnValue(chain);
    await fetchLeaderboard({ fitnessLevel: 'any' });
    expect(chain.in).not.toHaveBeenCalled();
  });

  test('does not filter when fitnessLevel is not provided', async () => {
    const chain = makeChain({ data: mockWorkouts, error: null });
    mockClient.from.mockReturnValue(chain);
    await fetchLeaderboard();
    expect(chain.in).not.toHaveBeenCalled();
  });

  test('throws on error', async () => {
    mockClient.from.mockReturnValue(makeChain({ data: null, error: { message: 'fail' } }));
    await expect(fetchLeaderboard()).rejects.toBeDefined();
  });
});
