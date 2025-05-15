import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchPlayerState } from "../redux/playerslice";

export const usePlayerSync = () => {
  const dispatch = useAppDispatch();
  const { playerState, notification } = useAppSelector((state) => state.player);

  useEffect(() => {
    dispatch(fetchPlayerState());
    
    const interval = setInterval(() => {
      dispatch(fetchPlayerState());
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return { playerState, notification };
};

export default usePlayerSync;