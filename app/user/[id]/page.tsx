import React from "react";

import { GetUser } from "@/utils/getuser";
import { redirect } from "next/navigation";
import HomePage from "@/components/user/HomePage";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await GetUser();

  //so the user can't enter any wrong id
  if (user?.id != id) {
    redirect(`/user/${user?.id}`);
  }
  return <HomePage user={user} />;
}
