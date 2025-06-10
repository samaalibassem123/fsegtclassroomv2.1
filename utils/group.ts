"use server";
import { GetUser } from "./getuser";
import { createClient } from "./supabase/server";
import { Group, Class, NavGroup } from "./types";

//FIND GROUP BY CLASS ID AND GROUP NUMBER
export const findGroupByNum = async (classId: string, groupNum: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group")
    .select("*")
    .eq("class_id", classId)
    .eq("group_num", groupNum)
    .single();

  if (error) {
    return null;
  }

  if (data) {
    return data as Group;
  }
};

//Creat a group
export const createGroup = async (classId: string, groupNum: string) => {
  const supabase = await createClient();
  const group: Group[] = [
    {
      class_id: classId,
      group_num: groupNum,
    },
  ];
  const { data, error } = await supabase
    .from("group")
    .insert(group)
    .select("*")
    .single();
  if (error) {
    throw error;
  }
  if (data) {
    return data as Group;
  }
};

export const getGroups = async (CLass: Class, ClassType: string) => {
  const user = await GetUser();
  const supabase = await createClient();
  let GROUPS: NavGroup[] = [];
  if (ClassType == "created") {
    //For created classes
    const { data, error } = await supabase
      .from("group")
      .select("*")
      .eq("class_id", CLass.class_id as string)
      .order("group_num", { ascending: true });
    if (error) {
      throw error;
    }

    if (data.length != 0) {
      const groups = data as Group[];

      groups.map((group: Group) => {
        GROUPS.push({
          name: ("Group A0" + group.group_num) as string,
          emoji: "🏫",
          pages: [
            {
              name: "Td Submissions",
              url: `/user/${user?.id}/class/${ClassType}/${
                CLass.class_id as string
              }/${group.group_num as string}/td`,
              emoji: "📔",
            },
            {
              name: "Notes",
              url: `/user/${user?.id}/class/${ClassType}/${
                CLass.class_id as string
              }/${group.group_num as string}/notes`,
              emoji: "🌟",
            },
          ],
        });
      });
      return GROUPS;
    }
    return null;
  } else {
    // for joined class
    //get the Group Num of the user
    const { data, error } = await supabase
      .from("Student_info")
      .select("*")
      .eq("student_id", user?.id as string)
      .single();
    const groupNum = data.group_num as string;
    //get the group by num
    const group = await findGroupByNum(CLass.class_id as string, groupNum);

    if (group)
      GROUPS.push({
        name: ("Group A0" + group.group_num) as string,
        emoji: "🏫",
        pages: [
          {
            name: "Td Submissions",
            url: `/user/${user?.id}/class/${ClassType}/${
              CLass.class_id as string
            }/${group.group_num as string}/td`,
            emoji: "📔",
          },
          {
            name: "Notes",
            url: `/user/${user?.id}/class/${ClassType}/${
              CLass.class_id as string
            }/${group.group_num as string}/notes`,
            emoji: "🌟",
          },
        ],
      });
      return GROUPS
  }
};
