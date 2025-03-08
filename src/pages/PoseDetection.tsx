import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as posedetection from '@tensorflow-models/pose-detection';

const PoseDetection = () => {
  const [model, setModel] = useState<posedetection.PoseDetector | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [squatCount, setSquatCount] = useState(0);
  const [isSquatting, setIsSquatting] = useState(false);

  // 모델 로드
  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const detector = await posedetection.createDetector(posedetection.SupportedModels.MoveNet, {
        runtime: 'tfjs', 
        modelType: 'lite', 
      });
      setModel(detector);
    };
    loadModel();
  }, []);

  // 카메라 스트림 및 포즈 분석
  useEffect(() => {
    const videoElement = videoRef.current;

    const startVideo = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    };

    if (videoElement) {
      startVideo();
    }

    const detectPose = async () => {
      if (model && videoElement && videoElement.readyState === 4) {
        const poses = await model.estimatePoses(videoElement);
        const keypoints = poses[0]?.keypoints || [];

        // 여기서 스쿼트 감지 로직을 작성
        // 예: 무릎과 엉덩이, 발목의 상대적인 위치를 분석하여 스쿼트 자세인지 확인

        if (isInSquatPosition(keypoints)) {
          if (!isSquatting) {
            setIsSquatting(true);
            setSquatCount(squatCount + 1);
          }
        } else {
          setIsSquatting(false);
        }
      }
      requestAnimationFrame(detectPose);
    };

    detectPose();

  }, [model, squatCount, isSquatting]);

  // 스쿼트 자세 감지
  const isInSquatPosition = (keypoints: posedetection.Keypoint[]) => {
    const knee = keypoints.find((kp) => kp.name === 'leftKnee' || kp.name === 'rightKnee');
    const hip = keypoints.find((kp) => kp.name === 'leftHip' || kp.name === 'rightHip');
    const ankle = keypoints.find((kp) => kp.name === 'leftAnkle' || kp.name === 'rightAnkle');

    if (knee && hip && ankle) {
      // 무릎과 엉덩이, 발목의 각도나 위치를 계산하여 스쿼트인지 판단
      const kneeAngle = Math.abs(knee.y - hip.y);
      const squatThreshold = 0.2; // 예시 값

      if (kneeAngle < squatThreshold) {
        return true;
      }
    }
    return false;
  };

  return (
    <div>
      <video ref={videoRef} width="640" height="480" autoPlay muted></video>
      <div>
        <h2>스쿼트 횟수: {squatCount}</h2>
      </div>
    </div>
  );
};

export default PoseDetection;
