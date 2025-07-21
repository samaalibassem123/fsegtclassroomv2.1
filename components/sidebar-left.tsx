"use client";
import * as React from "react";
import {
  FileSearch,
  FileSearch2Icon,
  Home,
  LogOutIcon,
  Presentation,
  Sparkles,
  Users,
  Video,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";

import { NavGroups } from "@/components/NavGroups";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { User } from "@supabase/supabase-js";

import { usePathname } from "next/navigation";
import { NavUser } from "./nav-user";

import { Button } from "./ui/button";
import Link from "next/link";
import { Class, Group, NavGroup, Teacher } from "@/utils/types";
import { formatDate } from "@/utils/date";

import { Separator } from "./ui/separator";
import ShowCode from "./class/ShowCode";
import { getGroups } from "@/utils/group";

export function SidebarLeft({
  classType = "created",
  CLass,
  User,
  teacher,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  classType?: string;
  CLass: Class;
  User: User | null;
  teacher?: Teacher;
}) {
  const USER = {
    name: User?.user_metadata.full_name as string,
    email: User?.email as string,
    avatar: User?.user_metadata.avatar_url as string,
  };
  const pathname = usePathname();
  // Function to check if a link is active
  const ActiveLink = (href: string) => pathname === href;

  const data = {
    navMain: [
      {
        title: "Ask AI",
        url: `/user/${User?.id}/class/${classType}/${CLass.class_id}/ai/`,
        icon: Sparkles,
        isActive: ActiveLink(
          `/user/${User?.id}/class/${classType}/${CLass.class_id}/ai`
        ),
      },
      {
        title: "Home",
        url: `/user/${User?.id}/class/${classType}/${CLass.class_id}/`,
        icon: Home,
        isActive: ActiveLink(
          `/user/${User?.id}/class/${classType}/${CLass.class_id}`
        ),
      },
      {
        title: "Board",
        url: `/user/${User?.id}/class/${classType}/${CLass.class_id}/draw/`,
        icon: Presentation,
        isActive: ActiveLink(
          `/user/${User?.id}/class/${classType}/${CLass.class_id}/draw`
        ),
      },
      {
        title: "Course Documents",
        url: `/user/${User?.id}/class/${classType}/${CLass.class_id}/courseDocs/`,
        icon: FileSearch2Icon,
        badge: "10",
        isActive: ActiveLink(
          `/user/${User?.id}/class/${classType}/${CLass.class_id}/courseDocs`
        ),
      },
      {
        title: "TD Documents",
        url: `/user/${User?.id}/class/${classType}/${CLass.class_id}/TdDocs/`,
        icon: FileSearch,
        badge: "10",
        isActive: ActiveLink(
          `/user/${User?.id}/class/${classType}/${CLass.class_id}/TdDocs`
        ),
      },
      {
        title: "Meet",
        url: `/user/${User?.id}/class/${classType}/${CLass.class_id}/meet/`,
        icon: Video,
        badge: "10",
        isActive: ActiveLink(
          `/user/${User?.id}/class/${classType}/${CLass.class_id}/meet`
        ),
      },
      {
        title: "students",
        url: `/user/${User?.id}/class/${classType}/${CLass.class_id}/students/`,
        icon: Users,
        badge: "10",
        isActive: ActiveLink(
          `/user/${User?.id}/class/${classType}/${CLass.class_id}/students`
        ),
      },
    ],
  };
  //GET GROUPS
  const [groups, setGroups] = React.useState<NavGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = React.useState(true);
  React.useEffect(() => {
    const Groups = async () => {
      const gps = await getGroups(CLass, classType);
      if (gps) setGroups(gps);
    };
    Groups();
    setLoadingGroups(false);
  }, []);

  const { isMobile } = useSidebar();

  const date = new Date();
  const DATE = formatDate(date);

  return (
    <Sidebar className="border-r-0 " {...props}>
      <SidebarHeader>
        {isMobile && (
          <h1 className="text-black text-xl  p-2 bg-white dark:bg-black rounded-md">
            <div className="flex">
              <span className="font-semibold  dark:text-white">Fsegt</span>
              <span className="text-blue-400 font-semibold">Classroom</span>
            </div>
          </h1>
        )}

        <NavMain items={data.navMain} />
      </SidebarHeader>
      <SidebarContent>
        {loadingGroups ? (
          <span className="text-xs text-gray-500 p-4"> loadingGroups </span>
        ) : (
          <NavGroups groups={groups} />
        )}
      </SidebarContent>
      <SidebarRail />
      <Separator />
      <SidebarFooter className="lg:hidden">
        <div className="sm:hidden w-full text-sm space-y-2">
          {classType === "joined" && (
            <>
              {" "}
              <p className="font-semibold">👨‍🏫 Teacher Name:</p>
              <p className=" capitalize select-all px-2">
                {teacher?.teacher_name}
              </p>
              <Separator />
              <p className="font-semibold">📨 Teacher Mail:</p>
              <p className="text-nowrap select-all px-2">
                {teacher?.teacher_mail}
              </p>
              <Separator />
            </>
          )}
          <div className=" flex gap-1.5 items-center">
            <span className="font-semibold text-sm">ClassCode:</span>
            <ShowCode Code={CLass.class_id} />
          </div>
          <Separator />
          <p className="text-gray-500 text-center">{DATE}</p>
        </div>
        <Separator />

        <NavUser user={USER} />
        <Button asChild className="text-start">
          <Link href={"/"}>
            Go back To home <LogOutIcon />
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
