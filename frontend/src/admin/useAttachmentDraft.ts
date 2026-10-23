import { useCallback, useRef, useState } from "react";
import type { Attachment } from "@/features/attachments/attachments";
import adminApi from "./adminApi";

/**
 * Keeps the attachment list for an editor and remembers which files were
 * uploaded in this session, so they can be deleted again if the editor is
 * cancelled or a fresh file is removed before saving.
 */
export function useAttachmentDraft() {
  const [list, setList] = useState<Attachment[]>([]);
  const fresh = useRef(new Set<string>());

  const drop = useCallback((a: Attachment) => {
    if (!fresh.current.has(a.url)) return;
    fresh.current.delete(a.url);
    void adminApi.delete("/uploads", { data: { publicId: a.publicId, resourceType: a.resourceType } }).catch(() => {});
  }, []);

  return {
    list,
    setList,
    markFresh: (a: Attachment) => fresh.current.add(a.url),
    drop,
    /** Start editing a record (or a blank one). */
    reset: (initial: Attachment[] = []) => {
      fresh.current.clear();
      setList(initial);
    },
    /** Editor closed without saving: remove files uploaded meanwhile. */
    discard: () => {
      [...fresh.current].forEach((url) => {
        const a = list.find((x) => x.url === url);
        if (a) drop(a);
      });
      fresh.current.clear();
    },
    /** Saved: the server now owns the files. */
    commit: () => fresh.current.clear(),
  };
}


export type AttachmentDraft = ReturnType<typeof useAttachmentDraft>;
