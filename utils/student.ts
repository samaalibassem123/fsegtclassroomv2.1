"use server";

import { User } from "@supabase/supabase-js";

import { createClient } from "./supabase/server";
import { Student, SubStudentInfoView } from "./types";
import { GetUser } from "./getuser";

export const AddStudent = async (user: User | null) => {
  const supabase = await createClient();
  await supabase.from("student").insert([
    {
      student_id: user?.id as string,
      student_name: user?.user_metadata.full_name as string,
      student_mail: user?.email as string,
      studentImg: user?.user_metadata.avatar_url as string,
    },
  ]);
};

export const GetStudentById = async (StudentId: string) => {
  const supabase = await createClient();
  const student = await supabase
    .from("Student_info")
    .select("*")
    .eq("student_id", StudentId)
    .single();

  if (student) {
    return student.data as Student;
  }
  return null;
};

export const GetStudents = async (classId: string | null) => {
  const supabase = await createClient();
  //Get the id of the students that joined the class
  const { data } = await supabase
    .from("Student_info")
    .select("*")
    .eq("class_id", classId);

  return data as Student[];
};

export const GetGroupStudents = async (classId: string, tdId: string) => {
  const supabase = await createClient();
  const user = await GetUser();
  const owner = await GetStudentById(user?.id as string);
  const groupNum = owner?.group_num;

  //get students that he can select using the function created in supbase selecstd
  const { data, error } = await supabase.rpc("selecstd", {
    groupnum: groupNum,
    classid: classId,
    tdid: tdId,
  });
  if (error) throw error;

  return data as Student[];
};

export const getSubOwners = async (tdId: string, groupNum: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("SubStudent_info")
    .select("*")
    .eq("td_id", tdId)
    .eq("group_num", groupNum)
    .eq("role", "owner");
  if (error) {
    throw error;
  }
  return data;
};

export const getSubStudents = async (tdsubId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("SubStudent_info")
    .select("*")
    .eq("tdsub_id", tdsubId)
    .eq("role", "others");
  if (error) {
    throw error;
  }
  return data;
};

export const getSubOwner = async (tdsubId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("SubStudent_info")
    .select("*")
    .eq("tdsub_id", tdsubId)
    .eq("role", "owner");
  if (error) {
    throw error;
  }
  return data;
};
