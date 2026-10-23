import { useCallback, useEffect, useState } from "react";
import adminApi from "./adminApi";
import { apiError } from "./utils";

/** List + create/update/delete for one admin API collection. */
export function useResource<T extends { _id: string }>(path: string, params: Record<string, unknown>, label: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const paramsKey = JSON.stringify(params);
  const load = useCallback(() => {
    setLoading(true);
    setError("");
    adminApi
      .get(path, { params: JSON.parse(paramsKey) })
      .then((res) => setItems(res.data?.data ?? []))
      .catch((err) => setError(apiError(err, `Could not load ${label}.`)))
      .finally(() => setLoading(false));
  }, [path, paramsKey, label]);

  useEffect(load, [load]);

  const save = useCallback(
    async (body: unknown, id?: string | null, config?: Record<string, unknown>) => {
      if (id) await adminApi.put(`${path}/${id}`, body, config);
      else await adminApi.post(path, body, config);
      load();
    },
    [path, load],
  );

  const remove = useCallback(
    async (id: string) => {
      await adminApi.delete(`${path}/${id}`);
      setItems((list) => list.filter((item) => item._id !== id));
    },
    [path],
  );

  return { items, loading, error, load, save, remove };
}
