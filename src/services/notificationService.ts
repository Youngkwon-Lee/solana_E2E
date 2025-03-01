// src/services/notificationService.ts
import { getNextAlarm, loadAlarmSchedule, saveAlarmSchedule } from '../utils/alarmScheduler';

// 브라우저 알림 권한 요청
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };
  
  // 스쿼트 알림 보내기
  export const sendSquatNotification = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      // 알림 권한이 없으면 앱 내 알림으로 대체
      console.log('스쿼트 시간입니다!');
      return;
    }
    
    const notification = new Notification('스쿼트 챌린지 시간!', {
      body: '10번의 스쿼트를 할 시간입니다. 지금 바로 시작하세요!',
      icon: '/logo192.png', // 앱 로고 경로
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      // 스쿼트 챌린지 페이지로 이동
      window.location.href = '/squat-challenge';
    };
  };
  
  // 알람 체크 및 알림 발송
export const checkAlarms = () => {
    const nextAlarm = getNextAlarm();
    if (!nextAlarm) return;
    
    const now = new Date();
    const timeDiff = nextAlarm.getTime() - now.getTime();
    
    // 1분 이내로 알람 시간이 다가왔다면 알림 발송
    if (timeDiff <= 60000 && timeDiff > 0) {
      setTimeout(() => {
        sendSquatNotification();
        
        // 알람 목록에서 이 알람 제거
        const alarms = loadAlarmSchedule().filter((a: Date) => a.getTime() !== nextAlarm.getTime());
        saveAlarmSchedule(alarms);
      }, timeDiff);
    }
  };
  
  