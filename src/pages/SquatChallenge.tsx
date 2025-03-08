import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { updateSquatCount, completeChallenge } from "../store/squatSlice";
import { saveExerciseRecord, getExerciseHistory } from "../services/apiService"; 
import styled from "styled-components";

// ✅ Styled Components
const Container = styled.div`
  text-align: center;
  padding: 20px;
`;

const Button = styled.button`
  background-color: ${(props) => props.theme.colors.primary};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 10px;
  &:hover {
    background-color: ${(props) => props.theme.colors.primaryHover};
  }
`;

const SquatChallenge: React.FC = () => {
  const dispatch = useDispatch();
  const { todayCount, dailyGoal, bestStreak, streak } = useSelector(
    (state: RootState) => state.squats
  );
  const walletAddress = useSelector((state: RootState) => state.auth.walletAddress);
  const [squatCount, setSquatCount] = useState(0);

  useEffect(() => {
    if (walletAddress) {
      fetchExerciseHistory(walletAddress);
    }
  }, [walletAddress]);

  // ✅ 사용자 운동 기록 불러오기
  const fetchExerciseHistory = async (userId: string) => {
    try {
      const data = await getExerciseHistory(userId);
      console.log("✅ 운동 기록 불러오기 성공:", data);
    } catch (error) {
      console.error("❌ 운동 기록 불러오기 실패:", error);
    }
  };

  // ✅ Squat 횟수 기록 API 호출
  const handleSaveSquat = async () => {
    if (squatCount > 0 && walletAddress) {
      try {
        await saveExerciseRecord(walletAddress, squatCount);  // ✅ 인자를 올바르게 전달
        dispatch(updateSquatCount(squatCount));
        setSquatCount(0);
        alert("✅ 운동 기록이 저장되었습니다!");
      } catch (error) {
        console.error("❌ 운동 기록 저장 실패:", error);
      }
    }
  };

  // ✅ 목표 달성 API 호출
  const handleCompleteChallenge = () => {
    dispatch(completeChallenge());
    alert("✅ 목표 달성 완료! 스트릭이 증가했습니다.");
  };

  // ✅ 버튼 클릭 핸들러
  const handleSquatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSquatCount(Number(e.target.value));
  };

  return (
    <Container>
      <h1>🏋️ Squat Challenge</h1>
      <p>오늘 목표: {dailyGoal}개</p>
      <p>현재 진행: {todayCount}개</p>
      <p>연속 수행일: {streak}일</p>
      <p>최고 스트릭 기록: {bestStreak}일</p>

      <div>
        <input
          type="number"
          value={squatCount}
          onChange={handleSquatInputChange}
          placeholder="운동 횟수 입력"
        />
        <Button onClick={handleSaveSquat}>기록 저장</Button>
      </div>

      <Button onClick={handleCompleteChallenge}>목표 달성</Button>
    </Container>
  );
};

export default SquatChallenge;
