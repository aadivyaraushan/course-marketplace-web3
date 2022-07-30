import { useEffect, useState } from "react";
import { useEthPrice } from "../components/hooks/useEthPrice";

const useCounter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);
  }, []);

  //   console.log("Calling useCounter");

  return count;
};

const SimpleComponent = () => {
  //   const count = useCounter();
  const { ethPrice } = useEthPrice();
  return <h1>Simple Component - {ethPrice}</h1>;
};

export default function Hooks() {
  //   const count = useCounter();
  const { ethPrice } = useEthPrice();
  return (
    <>
      <h1>Hello World - {ethPrice}</h1>
      <SimpleComponent />
    </>
  );
}
// whenever you call Hooks SimpleComponent is also called because SimpleComponent is a part of Hooks
