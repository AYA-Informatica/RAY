import { useEffect, useState } from 'react'
import NetInfo from '@react-native-community/netinfo'

export function useOffline() {
  const [isOffline, setOffline] = useState(false)
  
  useEffect(() => {
    return NetInfo.addEventListener((state) => {
      setOffline(!(state.isConnected && state.isInternetReachable))
    })
  }, [])
  
  return isOffline
}
