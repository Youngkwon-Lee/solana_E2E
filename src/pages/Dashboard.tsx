import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setDailyGoal, setDashboardData } from '../store/squatSlice';
import { getExerciseHistory } from "../services/apiService"; 
import ProgressBar from '../components/ProgressBar';
import { SquatState } from "../store/squatSlice"; 

const Container = styled.div`
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: 20px;
`;

const Info = styled.p`
  font-size: 1.1em;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 15px;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 1em;
  width: 80px;
  margin-left: 10px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  border-radius: 5px;
  text-align: center;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: ${(props) => props.theme.colors.primaryHover};
  }
`;

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const walletAddress = useSelector((state: RootState) => state.auth.walletAddress);
  const { totalSquats, todayCount, dailyGoal, bestStreak, lastSessionDate } = useSelector(
    (state: RootState) => state.squats || { totalSquats: 0, todayCount: 0, dailyGoal: 30, bestStreak: 0, lastSessionDate: null }
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState(dailyGoal);

  // ✅ 데이터 로딩 최적화 (async/await 사용)
  const fetchExerciseHistory = async (userId: string) => {
    try {
      if (userId) {  // walletAddress가 null인 경우를 체크합니다.
        const data = await getExerciseHistory(userId);
        console.log("✅ 운동 기록 불러오기 성공:", data);
        dispatch(setDashboardData(data)); // 상태 업데이트
      }
    } catch (error) {
      console.error("❌ 운동 기록 불러오기 실패:", error);
    }
  };
  
  // useEffect에서 호출하는 부분:
  useEffect(() => {
    if (walletAddress) {
      fetchExerciseHistory(walletAddress);  // null을 방지하고 호출
    }
  }, [walletAddress]);
  

  // ✅ 목표 변경 및 Redux & 로컬 스토리지 업데이트
  const handleGoalChange = () => {
    if (newGoal > 0) {
      dispatch(setDailyGoal(newGoal));
      localStorage.setItem('dailyGoal', newGoal.toString());
      alert(`✅ 운동 목표가 ${newGoal}회로 설정되었습니다.`);
    }
  };

  // ✅ 마지막 운동 날짜 변환 (YYYY-MM-DD)
  const formattedLastSessionDate = lastSessionDate ? new Date(lastSessionDate).toISOString().split('T')[0] : '기록 없음';

  return (
    <Container>
      <Title>🏋️‍♂️ 대시보드</Title>

      {/* ✅ API 로딩 상태 표시 */}
      {loading && <p>⏳ 데이터 불러오는 중...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      {/* ✅ 운동 기록 정보 */}
      {!loading && !error && (
        <>
          <Info>🔹 내 지갑 주소: {walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '연결되지 않음'}</Info>
          <Info>🔥 총 운동 횟수: <strong>{totalSquats} 회</strong></Info>
          <Info>🏆 최고 연속 운동 기록: <strong>{bestStreak} 일</strong></Info>
          <Info>📅 마지막 운동 날짜: <strong>{formattedLastSessionDate}</strong></Info>

          {/* ✅ 운동 진행률 ProgressBar */}
          <ProgressBar progress={Math.min((todayCount / dailyGoal) * 100, 100)} />
          <Info>📊 오늘 운동: <strong>{todayCount}/{dailyGoal} 회</strong></Info>

          {/* ✅ 목표 변경 UI */}
          <div>
            <label>
              🎯 목표 설정:
              <Input type="number" value={newGoal} onChange={(e) => setNewGoal(Number(e.target.value))} />
            </label>
            <Button onClick={handleGoalChange}>목표 변경</Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default Dashboard;
