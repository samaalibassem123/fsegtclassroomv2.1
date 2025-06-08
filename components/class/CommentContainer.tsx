"use client"
import { AvatarIcon } from "@/components/AvatarIcon";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getComments } from "@/utils/comment";
import { formatDate } from "@/utils/date";
import { createClient } from "@/utils/supabase/client";
import { Comment } from "@/utils/types";

import React, { useEffect, useState } from "react";
import DeleteComment from "./DeleteComment";
import { GetUser } from "@/utils/getuser";
import { User } from "@supabase/supabase-js";
import loading from "@/app/loading";

export default function CommentContainer({ courseId }: { courseId: string }) {
  const [user, setUser] = useState<User>()
  const [comments, setComments] = useState<Comment[]>([]);
  const [Loading, setloading] = useState(true)
  useEffect(() => {
    const getUser = async()=>{
      const  USER = await GetUser();
      if(USER) setUser(USER)
    }
    getUser()

    const fetchComments = async () => {
      const Comments = await getComments(courseId);
      if (Comments) {
        setComments(Comments as Comment[]);
      }
      setloading(false)
    };
    fetchComments();
    
    const supabase = createClient();
    const channel = supabase
      .channel("get-all-comments")
      .on(
        "postgres_changes",
        {
          event: "*", // or 'INSERT', 'UPDATE', 'DELETE'
          schema: "public",
          table: "comments",
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          setComments((current) => {
            switch (eventType) {
              case "INSERT":
                return [newRow as Comment, ...current];
              case "UPDATE":
                return current.map((c) =>
                  c.comment_id === (newRow as Comment).comment_id
                    ? (newRow as Comment)
                    : c
                );
              case "DELETE":
                return current.filter(
                  (c) => c.comment_id !== (oldRow as Comment).comment_id
                );
              default:
                return current;
            }
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col">
      {Loading && <span className="text-sm text-gray-700 animate-pulse">Loading Comments... </span>}
      {comments.length != 0 && (
        <ScrollArea className="h-auto max-h-60 overflow-y-auto">
          {comments.map((comment) => (
            <div className="p-1" key={comment.comment_id}>
              <div className="flex items-center gap-1.5 justify-between">
                <div className="flex items-center gap-1.5">
                  <AvatarIcon img={comment.comment_img as string} />
                  <span>{comment.user_name}</span>
                  <span className="text-gray-500">
                    created at:{" "}
                    {formatDate(new Date(comment.created_at as string))}
                  </span>
                </div>
                {/* delete comment */}
                {
                  comment.comment_owner === user?.id &&<DeleteComment CommentId={comment.comment_id as string} />
                }
                
              </div>
              <p className="p-2">{comment.context as string}</p>
              <Separator />
            </div>
          ))}
        </ScrollArea>
      )}
      {comments.length === 0 && Loading === false && (
        <p className="text-sm text-gray-500 block">There is no comments</p>
      )}
    </div>
  );
}
