import { useEffect, useState } from "react";

type Props = {
  endsAt: string;
};

export function CountdownTimer({ endsAt }: Props) {
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
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  return <span>{timeLeft}</span>;
}
