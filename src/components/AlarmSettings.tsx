// src/components/AlarmSettings.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { 
  generateDailyAlarms, 
  saveAlarmSchedule, 
  loadAlarmSchedule,
  resetAlarmsIfNeeded
} from '../utils/alarmScheduler';
import { requestNotificationPermission } from '../services/notificationService';

const AlarmContainer = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
`;

const AlarmTitle = styled.h3`
  margin-top: 0;
  color: ${props => props.theme.colors.primary};
`;

const AlarmList = styled.ul`
  list-style: none;
  padding: 0;
`;

const AlarmItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
`;

const AlarmButton = styled.button`
  background-color: ${props => props.theme.colors.secondary};
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.theme.colors.secondaryHover};
  }
`;

const AlarmSettings: React.FC = () => {
  const [alarms, setAlarms] = useState<Date[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  
  useEffect(() => {
    // 알람 설정 불러오기
    const savedAlarms = loadAlarmSchedule();
    
    // 새 날이 시작되었으면 알람 재설정
    const wasReset = resetAlarmsIfNeeded();
    
    if (wasReset || savedAlarms.length === 0) {
      // 새 알람 생성
      const newAlarms = generateDailyAlarms();
      saveAlarmSchedule(newAlarms);
      setAlarms(newAlarms);
    } else {
      setAlarms(savedAlarms);
    }
    
    // 알림 권한 확인
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);
  
  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
  };
  
  const handleRegenerateAlarms = () => {
    const newAlarms = generateDailyAlarms();
    saveAlarmSchedule(newAlarms);
    setAlarms(newAlarms);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <AlarmContainer>
      <AlarmTitle>스쿼트 알람 설정</AlarmTitle>
      
      {!notificationsEnabled && (
        <div style={{ marginBottom: '15px' }}>
          <p>알람을 받으려면 알림 권한을 허용해주세요.</p>
          <AlarmButton onClick={handleEnableNotifications}>
            알림 활성화
          </AlarmButton>
        </div>
      )}
      
      <p>오늘의 스쿼트 알람 시간 (각 10회씩, 총 30회):</p>
      
      <AlarmList>
        {alarms.map((alarm, index) => (
          <AlarmItem key={index}>
            <span>알람 {index + 1}: {formatTime(alarm)}</span>
            <span>10회 스쿼트</span>
          </AlarmItem>
        ))}
      </AlarmList>
      
      <div style={{ marginTop: '15px' }}>
        <AlarmButton onClick={handleRegenerateAlarms}>
          알람 시간 재설정
        </AlarmButton>
      </div>
    </AlarmContainer>
  );
};

export default AlarmSettings;
