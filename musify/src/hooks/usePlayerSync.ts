import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { fetchPlayerState } from "../redux/playerslice";

export const usePlayerSync = () => {
  const dispatch = useAppDispatch();
  const { playerState, notification } = useAppSelector((state) => state.player);

  useEffect(() => {
    // Fetch player state immediately on component mount
    dispatch(fetchPlayerState());
    
    // Set up polling interval for continuous updates
    const interval = setInterval(() => {
      dispatch(fetchPlayerState());
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [dispatch]);

  return { playerState, notification };
};

export default usePlayerSync;