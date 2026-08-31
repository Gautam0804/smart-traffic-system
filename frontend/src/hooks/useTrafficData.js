import {
  useCallback,
  useEffect,
  useState,
} from "react";

/*
=========================================================
NODE BACKEND
=========================================================
*/

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";


/*
=========================================================
DEFAULT TRAFFIC
=========================================================
*/

const DEFAULT_TRAFFIC = {
  north: 0,
  south: 0,
  east: 0,
  west: 0,
};


/*
=========================================================
HOOK
=========================================================
*/

export default function useTrafficData() {

  const [traffic, setTraffic] =
    useState(DEFAULT_TRAFFIC);

  const [online, setOnline] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState(null);


  /*
  =======================================================
  FETCH TRAFFIC
  =======================================================
  */

  const fetchTraffic = useCallback(
    async () => {

      try {

        setLoading(true);

        const url =
          `${API_URL}/traffic/live`;

        console.log(
          "🚦 Traffic API:",
          url
        );


        const response =
          await fetch(url);


        if (!response.ok) {

          throw new Error(
            `Traffic API failed: ${response.status}`
          );

        }


        const result =
          await response.json();


        console.log(
          "🚦 Traffic response:",
          result
        );


        const liveTraffic =
          result?.traffic ||
          DEFAULT_TRAFFIC;


        setTraffic({

          north: Number(
            liveTraffic.north ?? 0
          ),

          south: Number(
            liveTraffic.south ?? 0
          ),

          east: Number(
            liveTraffic.east ?? 0
          ),

          west: Number(
            liveTraffic.west ?? 0
          ),

        });


        /*
        =================================================
        BACKEND IS ONLINE
        =================================================
        */

        setOnline(true);


        /*
        =================================================
        LAST UPDATE
        =================================================
        */

        setLastUpdated(

          result?.lastUpdate
            ? new Date(
                result.lastUpdate
              )
            : new Date()

        );

      }

      catch (error) {

        console.error(
          "❌ Traffic API Error:",
          error
        );


        setOnline(false);

      }

      finally {

        setLoading(false);

      }

    },
    []
  );


  /*
  =======================================================
  INITIAL LOAD + POLLING
  =======================================================
  */

  useEffect(() => {

    fetchTraffic();


    const interval =
      setInterval(
        fetchTraffic,
        2000
      );


    return () => {

      clearInterval(interval);

    };

  }, [fetchTraffic]);


  /*
  =======================================================
  RETURN
  =======================================================
  */

  return {

    traffic,

    online,

    loading,

    refresh:
      fetchTraffic,

    lastUpdated,

  };

}