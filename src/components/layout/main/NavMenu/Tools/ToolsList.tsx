"use client";

import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { useSearchParams } from "next/navigation";
import ToolsListItem from "./ToolsListItem";
import { Tool } from "@/types/Tool";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import ErrorToast from "@/components/common/ErrorToast";

type Props = {
  query: {
    nameLike?: string;
  };
};

export default function ToolsList({ query }: Props) {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const selectedToolID = searchParams.get("tool_id");

  const { user } = useUser();

  const {
    data: tools,
    error,
    refetch,
  } = useQuery<Tool[], Error>(["get-thread-list", user?.id], async () => {
    const res = await fetch(`/api/tools?user_id=${user?.id || ""}`);
    const data = await res.json();
    return data as Tool[];
  });

  const subscribeToolChanges = () => {
    // 変更を購読する
    supabase
      .channel("tools-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Tools",
          filter: `user_id=eq.${user?.id}`,
        },
        (payload) => {
          console.log("payload:", payload);
          refetch();
        }
      )
      .subscribe();
  };

  useEffect(() => {
    refetch();
    subscribeToolChanges();
    return () => {
      supabase.channel("tool-list").unsubscribe();
    };
  }, [query]);

  if (error) {
    <ErrorToast />;
  }

  if (!tools) {
    return (
      <div className="pt-5 text-gray-400 dark:text-gray-600 text-center text-xs">
        Fetching Tools...
      </div>
    );
  }

  return (
    <>
      {tools &&
        tools.map((tool) => (
          <ToolsListItem
            key={tool.id}
            tool={tool}
            isSelected={tool.id === selectedToolID}
          />
        ))}
    </>
  );
}
