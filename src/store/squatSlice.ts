import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SquatState {
  totalSquats: number;
  dailyGoal: number;
  bestStreak: number;
  lastSessionDate: string | null;
  todayCount: number;
  lastCompletionDate: string | null;
  streak: number;
  completedDays: string[];
}

const initialState: SquatState = {
  totalSquats: 0,
  dailyGoal: 30,
  bestStreak: 0,
  lastSessionDate: null,
  todayCount: 0,
  lastCompletionDate: null,
  streak: 0,
  completedDays: [],
};

const squatSlice = createSlice({
  name: 'squats',
  initialState,
  reducers: {
    updateSquatCount: (state, action: PayloadAction<number>) => {
      const today = new Date().toISOString().split('T')[0];
      
      // 새로운 날이 시작되었다면 todayCount 리셋
      if (state.lastSessionDate !== today) {
        state.todayCount = 0;
      }
      
      state.totalSquats += action.payload;
      state.todayCount += action.payload;
      state.lastSessionDate = today;
    },
    
    completeChallenge: (state, action: PayloadAction<string>) => {
      const completionDate = action.payload;
      
      // 이미 오늘 완료했다면 중복 처리 방지
      if (state.lastCompletionDate === completionDate) {
        return;
      }
      
      // 완료한 날짜 추가
      state.completedDays.push(completionDate);
      state.lastCompletionDate = completionDate;
      
      // 연속 달성 스트릭 계산
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (state.completedDays.includes(yesterdayStr)) {
        state.streak += 1;
      } else {
        state.streak = 1; // 연속 달성이 끊겼으므로 1로 리셋
      }
      
      // 최고 스트릭 업데이트
      state.bestStreak = Math.max(state.bestStreak, state.streak);
    },
    
    setDailyGoal: (state, action: PayloadAction<number>) => {
      state.dailyGoal = action.payload;
    },
  },
});

export const { updateSquatCount, completeChallenge, setDailyGoal } = squatSlice.actions;
export default squatSlice.reducer;
