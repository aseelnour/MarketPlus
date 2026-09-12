
import { useState, useEffect } from "react";
import { api } from "../services/api";

export function useFetch<T = any>(url: string, options?: any) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(url, options);
        setData(res.data.data);
        setError(null);
      } catch (err) {
        setError(err as Error);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]); 

  return { data, loading, error };
}
