import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ✅ Squat 상태 타입 정의
// store/squatSlice.ts
export interface SquatState {  
  totalSquats: number;
  todayCount: number;
  dailyGoal: number;
  bestStreak: number;
  streak: number;
  lastSessionDate: string | null;
}


// ✅ 오늘 날짜 가져오기 함수
const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

// ✅ 로컬 스토리지에서 기존 데이터 불러오기
const loadState = (): SquatState => {
  try {
    const savedState = localStorage.getItem('squatState');
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error('❌ 로컬 스토리지에서 상태 불러오기 실패:', error);
  }

  return {
    totalSquats: 0,
    todayCount: 0,
    dailyGoal: 30, // 기본 목표 설정
    bestStreak: 0,
    streak: 0,
    lastSessionDate: null,
  };
};

// ✅ 로컬 스토리지 저장 함수
const saveState = (state: SquatState) => {
  try {
    localStorage.setItem('squatState', JSON.stringify(state));
  } catch (error) {
    console.error('❌ 로컬 스토리지 저장 실패:', error);
  }
};

// ✅ 초기 상태 설정
const initialState: SquatState = loadState();

const squatSlice = createSlice({
  name: 'squats',
  initialState,
  reducers: {
    // ✅ Squat 횟수 업데이트 (운동 기록 증가)
    updateSquatCount: (state, action: PayloadAction<number>) => {
      const today = getTodayDate();

      if (state.lastSessionDate !== today) {
        state.todayCount = 0;
      }

      state.totalSquats += action.payload;
      state.todayCount += action.payload;
      state.lastSessionDate = today;
      saveState(state);
    },

    // ✅ 목표 설정
    setDailyGoal: (state, action: PayloadAction<number>) => {
      state.dailyGoal = action.payload;
      saveState(state);
    },

    // ✅ 목표 달성 처리 (스트릭 및 최고 기록 갱신)
    completeChallenge: (state) => {
      const today = getTodayDate();
      
      if (state.lastSessionDate !== today) {
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
      }

      state.lastSessionDate = today;
      saveState(state);
    },

    // ✅ 서버에서 불러온 데이터 반영
    setDashboardData: (state, action: PayloadAction<Partial<SquatState>>) => {
      Object.assign(state, action.payload);
      saveState(state);
    },

    // ✅ 하루 운동 기록 초기화
    resetDailyCount: (state) => {
      state.todayCount = 0;
      saveState(state);
    },
  },
});

export const { updateSquatCount, completeChallenge, setDailyGoal, setDashboardData, resetDailyCount } =
  squatSlice.actions;
export default squatSlice.reducer;
