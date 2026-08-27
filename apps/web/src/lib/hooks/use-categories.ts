"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from "../api/categories";
import { sessionIdentity } from "../session-identity";

const CATEGORIES_KEY = ["categories"] as const;

export function useCategories() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = sessionIdentity(session);

  return useQuery({
    queryKey: [...CATEGORIES_KEY, identity],
    queryFn: () => fetchCategories(token),
    enabled: Boolean(token),
  });
}

export function useCreateCategory() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) =>
      createCategory(input, session?.accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useUpdateCategory() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(id, input, session?.accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useDeleteCategory() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id, session?.accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}
