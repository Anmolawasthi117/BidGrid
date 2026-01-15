import { useSelector, useDispatch } from "react-redux";
import { increment, decrement, incrementByAmount } from "../store/slices/counterSlice";

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col items-center justify-center mt-10 space-y-4">
      <h2 className="text-2xl font-semibold">Redux Counter</h2>
      <div className="flex gap-4">
        <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => dispatch(decrement())}>-</button>
        <span className="text-xl">{count}</span>
        <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={() => dispatch(increment())}>+</button>
      </div>
      <button className="px-4 py-2 bg-indigo-500 text-white rounded" onClick={() => dispatch(incrementByAmount(5))}>
        +5
      </button>
    </div>
  );
}

export default Counter;
