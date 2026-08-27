"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { ExpenseFilters } from "../expense-query";
import {
  createExpense,
  deleteExpense,
  fetchExpense,
  fetchExpenses,
  fetchUpcomingRecurring,
  payInstallment,
  payRecurringOccurrence,
  updateExpense,
  type CreateExpenseInput,
  type UpdateExpenseInput,
} from "../api/expenses";

const EXPENSES_KEY = ["expenses"] as const;
const UPCOMING_RECURRING_KEY = ["expenses", "recurring", "upcoming"] as const;

export function useExpenses(filters: ExpenseFilters) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = session?.user?.email;

  return useQuery({
    queryKey: [...EXPENSES_KEY, identity, filters],
    queryFn: () => fetchExpenses(filters, token),
    enabled: Boolean(token),
    placeholderData: (previous) => previous,
  });
}

export function useExpense(id: string | undefined) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = session?.user?.email;

  return useQuery({
    queryKey: [...EXPENSES_KEY, identity, id],
    queryFn: () => fetchExpense(id!, token),
    enabled: Boolean(token) && Boolean(id),
  });
}

export function useUpcomingRecurring(withinDays?: number) {
  const { data: session } = useSession();
  const token = session?.accessToken;
  const identity = session?.user?.email;

  return useQuery({
    queryKey: [...UPCOMING_RECURRING_KEY, identity, withinDays],
    queryFn: () => fetchUpcomingRecurring(withinDays, token),
    enabled: Boolean(token),
  });
}

export function useCreateExpense() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateExpenseInput) =>
      createExpense(input, session?.accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
    },
  });
}

export function useUpdateExpense() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateExpenseInput }) =>
      updateExpense(id, input, session?.accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
    },
  });
}

export function useDeleteExpense() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id, session?.accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
    },
  });
}

export function usePayInstallment() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      installmentNumber,
      paidAmount,
    }: {
      id: string;
      installmentNumber: number;
      paidAmount?: number;
    }) =>
      payInstallment(id, installmentNumber, paidAmount, session?.accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
    },
  });
}

export function usePayRecurringOccurrence() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      payRecurringOccurrence(id, session?.accessToken),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_KEY });
      void queryClient.invalidateQueries({ queryKey: UPCOMING_RECURRING_KEY });
    },
  });
}
