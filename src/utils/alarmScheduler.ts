// src/utils/alarmScheduler.ts

// 하루 알람 일정을 생성하는 함수
export const generateDailyAlarms = (): Date[] => {
    const today = new Date();
    const alarms: Date[] = [];
    
    // 오전 10시부터 오후 8시까지의 시간 범위 (밀리초)
    const startTime = new Date(today);
    startTime.setHours(10, 0, 0, 0);
    
    const endTime = new Date(today);
    endTime.setHours(20, 0, 0, 0);
    
    const timeRange = endTime.getTime() - startTime.getTime();
    
    // 3개의 랜덤한 시간 생성
    for (let i = 0; i < 3; i++) {
      // 시간 범위 내에서 랜덤한 시간 선택
      const randomOffset = Math.floor(Math.random() * timeRange);
      const alarmTime = new Date(startTime.getTime() + randomOffset);
      
      // 이미 지난 시간이면 내일로 설정
      if (alarmTime < new Date()) {
        alarmTime.setDate(alarmTime.getDate() + 1);
      }
      
      alarms.push(alarmTime);
    }
    
    // 시간순으로 정렬
    return alarms.sort((a, b) => a.getTime() - b.getTime());
  };
  
  // 알람 스케줄을 로컬 스토리지에 저장
  export const saveAlarmSchedule = (alarms: Date[]) => {
    localStorage.setItem('squatAlarms', JSON.stringify(alarms.map(a => a.toISOString())));
  };
  
  // 알람 스케줄을 로컬 스토리지에서 불러오기
  export const loadAlarmSchedule = (): Date[] => {
    const saved = localStorage.getItem('squatAlarms');
    if (!saved) return [];
    
    try {
      return JSON.parse(saved).map((dateStr: string) => new Date(dateStr));
    } catch (e) {
      console.error('Failed to parse alarm schedule', e);
      return [];
    }
  };
  
  // 다음 알람 시간 확인
  export const getNextAlarm = (): Date | null => {
    const alarms = loadAlarmSchedule();
    const now = new Date();
    
    // 현재 시간 이후의 알람 찾기
    const nextAlarm = alarms.find(alarm => alarm > now);
    return nextAlarm || null;
  };
  
  // 새로운 하루가 시작되면 알람 재설정
  export const resetAlarmsIfNeeded = () => {
    const lastResetDay = localStorage.getItem('lastAlarmResetDay');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastResetDay !== today) {
      const newAlarms = generateDailyAlarms();
      saveAlarmSchedule(newAlarms);
      localStorage.setItem('lastAlarmResetDay', today);
      return true;
    }
    
    return false;
  };
  