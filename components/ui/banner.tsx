import { type ReactNode } from "react";

interface BannerProps {
  children: ReactNode;
}

export function Banner(props: BannerProps) {
  return (
    <div className="border bg-card text-card-foreground shadow-sm">
      <div
        className="m-auto flex max-w-[1024px] flex-col items-center gap-4 px-4 py-2 md:flex-row"
        {...props}
      />
    </div>
  );
}

interface BannerMessageProps {
  children: ReactNode;
}

export function BannerMessage(props: BannerMessageProps) {
  return (
    <div
      className="flex flex-1 flex-col items-center gap-2 text-center md:flex-row md:text-left"
      {...props}
    />
  );
}

interface BannerActionsProps {
  children: ReactNode;
}

export function BannerActions(props: BannerActionsProps) {
  return <div className="flex gap-2" {...props} />;
}
