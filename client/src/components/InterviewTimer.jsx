import { useState, useEffect } from 'react';

const InterviewTimer = ({ duration = 60, onTimeUp, isActive = true, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        const newTime = prev - 1;
        onTick?.(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, duration]);

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / duration) * circumference;
  const offset = circumference - progress;

  const getColorClass = () => {
    if (timeLeft <= 10) return 'danger';
    if (timeLeft <= 20) return 'warning';
    return '';
  };

  const colorClass = getColorClass();

  return (
    <div className="timer-container">
      <div className="timer-ring">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle 
            className="timer-ring-bg" 
            cx="40" cy="40" r={radius} 
          />
          <circle 
            className={`timer-ring-progress ${colorClass}`}
            cx="40" cy="40" r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className={`timer-text ${colorClass}`}>
          {timeLeft}s
        </span>
      </div>
    </div>
  );
};

export default InterviewTimer;
