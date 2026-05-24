"use client";

import type { CommunityFeedPost } from "@/lib/api-data";

const COMMUNITY_POSTS_KEY = "lingtour-community-posts";
const COMMUNITY_POSTS_EVENT = "lingtour-community-posts";

export function readSyncedCommunityPosts(): CommunityFeedPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMMUNITY_POSTS_KEY);
    return raw ? (JSON.parse(raw) as CommunityFeedPost[]) : [];
  } catch {
    return [];
  }
}

export function mergeCommunityPosts<T extends { id: string }>(posts: T[]): T[] {
  const seen = new Set<string>();
  return posts.filter((post) => {
    if (seen.has(post.id)) return false;
    seen.add(post.id);
    return true;
  });
}

export function writeSyncedCommunityPosts(posts: CommunityFeedPost[]) {
  if (typeof window === "undefined") return;
  const nextPosts = mergeCommunityPosts(posts);
  window.localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(nextPosts));
  window.dispatchEvent(new Event(COMMUNITY_POSTS_EVENT));
}

export function appendSyncedCommunityPost(post: CommunityFeedPost) {
  const current = readSyncedCommunityPosts();
  writeSyncedCommunityPosts([post, ...current]);
}

export function subscribeSyncedCommunityPosts(
  callback: (posts: CommunityFeedPost[]) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const sync = () => callback(readSyncedCommunityPosts());
  const handleStorage = (event: StorageEvent) => {
    if (!event.key || event.key === COMMUNITY_POSTS_KEY) {
      sync();
    }
  };

  window.addEventListener(COMMUNITY_POSTS_EVENT, sync);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(COMMUNITY_POSTS_EVENT, sync);
    window.removeEventListener("storage", handleStorage);
  };
}
