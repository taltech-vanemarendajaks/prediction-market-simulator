import { useEffect, useState } from "react";

type Props = {
  endsAt: string;
  onComplete?: () => void;
};

export function CountdownTimer({ endsAt, onComplete }: Props) {
  const calculateTimeLeft = () => {
    // eslint-disable-next-line react-hooks/purity
    const diff = new Date(endsAt).getTime() - Date.now();

    if (diff <= 0) {
      return "00:00";
    }

    const minutes = Math.floor(diff / 1000 / 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    let completed = false;

    const interval = window.setInterval(() => {
      const nextTimeLeft = calculateTimeLeft();

      setTimeLeft(nextTimeLeft);

      if (nextTimeLeft === "00:00" && !completed) {
        completed = true;
        onComplete?.();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [endsAt, onComplete]);

  return <span>{timeLeft}</span>;
}
