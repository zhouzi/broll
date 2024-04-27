import { type DefaultSession } from "next-auth";
import { type ComponentProps } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserAvatarProps extends ComponentProps<typeof Avatar> {
  user: NonNullable<DefaultSession["user"]>;
}

export function UserAvatar({ user }: UserAvatarProps) {
  const initials = user.name
    ?.split(" ", 2)
    .map((s) => s[0].toUpperCase())
    .join("");
  return (
    <Avatar>
      <AvatarImage src={user.image ?? undefined} alt={user.name ?? undefined} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
