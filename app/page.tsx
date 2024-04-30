/* eslint-disable react/no-unescaped-entities */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import deepEqual from "deep-equal";
import deepMerge from "deepmerge";
import {
  Copy,
  Download,
  Github,
  Linkedin,
  LoaderCircle,
  Twitter,
} from "lucide-react";
import { Roboto } from "next/font/google";
import Link from "next/link";
// import { signIn, signOut, useSession } from "next-auth/react";
import queryString from "qs";
import * as queryTypes from "query-types";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
// import { UserAvatar } from "@/components/user-avatar";
import { YouTubeVideoCard, createScale } from "@/components/youtube-video-card";
import * as schema from "@/lib/schema";
import { type RenderStatus, useRenderPNG } from "@/lib/use-render-png";
import { useVideoDetails } from "@/lib/use-video-details";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
});

const formSchema = z.object({
  videoUrl: z
    .string()
    .url()
    .default("https://www.youtube.com/watch?v=XEO3duW1A80")
    .refine((value) => schema.getVideoId(value) != null, {
      message: "Le format de l'URL est invalide",
    }),
  theme: schema.theme,
});

interface DefaultColorTheme {
  name: string;
  theme: schema.Theme;
}

const defaultColorThemes = {
  light: {
    name: "Clair",
    theme: schema.lightTheme,
  },
  dark: {
    name: "Sombre",
    theme: schema.darkTheme,
  },
} satisfies Record<string, DefaultColorTheme>;

function findColorThemeByThemeId(id: string) {
  return defaultColorThemes[id as keyof typeof defaultColorThemes] as
    | DefaultColorTheme
    | undefined;
}

function pickColorsFromTheme(theme: schema.Theme) {
  return {
    card: {
      background: theme.card.background,
      foreground: theme.card.foreground,
    },
    duration: {
      background: theme.duration.background,
      foreground: theme.duration.foreground,
    },
    progressBar: {
      background: theme.progressBar.background,
      foreground: theme.progressBar.foreground,
    },
  };
}

function findColorThemeIdByTheme(theme: schema.Theme) {
  for (const [id, colorTheme] of Object.entries(defaultColorThemes)) {
    if (
      deepEqual(
        pickColorsFromTheme(colorTheme.theme),
        pickColorsFromTheme(theme),
      )
    ) {
      return id;
    }
  }

  return undefined;
}

const defaultValues = formSchema.parse({
  theme: schema.lightTheme,
});

export default function Home() {
  // const session = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [validValues, setValidValues] = useState(() => ({
    videoId: schema.getVideoId(form.getValues("videoUrl"))!,
    theme: form.getValues("theme"),
  }));
  useEffect(() => {
    const subscription = form.watch((values) => {
      setValidValues((currentValidValues) => {
        const videoId = values.videoUrl
          ? schema.getVideoId(values.videoUrl)
          : undefined;
        const parsedTheme = schema.theme.safeParse(values.theme);
        return {
          videoId: videoId ?? currentValidValues.videoId,
          theme: parsedTheme.success
            ? parsedTheme.data
            : currentValidValues.theme,
        };
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const { loading: loadingVideoDetails, videoDetails } = useVideoDetails(
    validValues.videoId,
  );

  const [renderStatus, setRenderStatus] = useState<RenderStatus>("idle");

  const { downloadPNG, copyPNG } = useRenderPNG({
    videoDetails,
    theme: validValues.theme,
    setRenderStatus,
  });

  useEffect(() => {
    const parsers = [
      () =>
        queryTypes.parseObject(
          queryString.parse(window.location.search.slice(1)),
        ),
      () => ({
        // Legacy URL parameters, theme used to be the only thing stored in the URL
        videoUrl: schema.DEFAULT_VIDEO_URL,
        theme: queryTypes.parseObject(
          queryString.parse(window.location.search.slice(1)),
        ),
      }),
      () => JSON.parse(localStorage.getItem("formValues") ?? "{}") as unknown,
      () => ({
        // Legacy local storage values, theme used to be the only thing stored in local storage
        videoUrl: schema.DEFAULT_VIDEO_URL,
        theme: JSON.parse(localStorage.getItem("theme") ?? "{}") as unknown,
      }),
    ];
    for (const parse of parsers) {
      try {
        const parsedFormValues = formSchema.safeParse(parse());

        if (parsedFormValues.success) {
          form.setValue("videoUrl", parsedFormValues.data.videoUrl, {
            shouldDirty: true,
          });
          form.setValue("theme", parsedFormValues.data.theme, {
            shouldDirty: true,
          });

          // Make sure the URL reflects the current parameters,
          // whether they're loaded from localStorage or a legacy source
          //
          // Using the native history is the documented way of preventing rerenders:
          // https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#windowhistoryreplacestate
          window.history.replaceState(
            undefined,
            "",
            `${location.pathname}?${queryString.stringify(parsedFormValues.data)}`,
          );

          return;
        }
      } catch (err) {}
    }
  }, [form]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const subscription = form.watch((values) => {
      const parsedFormValues = formSchema.safeParse(values);

      if (!parsedFormValues.success) {
        return;
      }

      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        // Using the native history is the documented way of preventing rerenders:
        // https://nextjs.org/docs/app/building-your-application/routing/linking-and-navigating#windowhistoryreplacestate
        window.history.replaceState(
          undefined,
          "",
          `${location.pathname}?${queryString.stringify(parsedFormValues.data)}`,
        );
        localStorage.setItem(
          "formValues",
          JSON.stringify(parsedFormValues.data),
        );
      }, 500);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="m-auto max-w-[900px] px-4 py-6">
      <header className="flex items-center justify-between py-4">
        <div className="inline-flex items-baseline gap-1">
          <Link
            href="/"
            className="group inline-flex items-baseline gap-[0.15rem]"
          >
            <span className="text-2xl font-black group-hover:underline group-hover:underline-offset-2">
              broll
            </span>
            <span className="inline-flex size-2 rounded-full bg-red-600 group-hover:animate-pulse" />
          </Link>
          <a
            href="https://gabin.app"
            className="text-muted-foreground hover:text-foreground"
          >
            gabin.app
          </a>
        </div>
        {
          // <div className="flex gap-2">
          //   {session.status === "authenticated" && session.data.user ? (
          //     <DropdownMenu>
          //       <DropdownMenuTrigger asChild>
          //         <Button
          //           variant="outline"
          //           size="icon"
          //           className="overflow-hidden rounded-full"
          //         >
          //           <UserAvatar user={session.data.user} className="size-9" />
          //         </Button>
          //       </DropdownMenuTrigger>
          //       <DropdownMenuContent align="end">
          //         <DropdownMenuItem onClick={() => signOut()}>
          //           Se déconnecter
          //         </DropdownMenuItem>
          //       </DropdownMenuContent>
          //     </DropdownMenu>
          //   ) : (
          //     <>
          //       <Button variant="ghost" onClick={() => signIn()}>
          //         Se connecter
          //       </Button>
          //       <Button onClick={() => signIn()}>S'inscrire</Button>
          //     </>
          //   )}
          // </div>
        }
      </header>
      <main className="flex flex-col-reverse gap-8 md:flex-row">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
              <CardDescription>Personnalisation de la vignette</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-4">
                  <FormField
                    control={form.control}
                    name="videoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de la vidéo</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="https://www.youtube.com/watch?v=XEO3duW1A80"
                              {...field}
                            />
                            {loadingVideoDetails && (
                              <span className="absolute right-[1px] top-1/2 -translate-y-1/2 bg-background p-2">
                                <LoaderCircle
                                  className="animate-spin"
                                  size={16}
                                />
                              </span>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="theme.options.showDuration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Afficher la durée
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="theme.options.showChannelThumbnail"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Afficher le logo de la chaîne
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="theme.options.showChannelTitle"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Afficher le nom de la chaîne
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="theme.options.showViews"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Afficher les vues
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="theme.options.showPublishedAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Afficher la date de publication
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="theme.options.progressBar"
                    render={({ field: { value, onChange } }) => (
                      <>
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={typeof value === "number"}
                              onCheckedChange={(checked) =>
                                onChange(checked ? 80 : undefined)
                              }
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Afficher la progression de lecture
                          </FormLabel>
                        </FormItem>
                        {typeof value === "number" && (
                          <FormItem>
                            <FormLabel>
                              Progression de lecture {value}%
                            </FormLabel>
                            <FormControl>
                              <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[value]}
                                onValueChange={([newValue]) =>
                                  onChange(newValue)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      </>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="theme.card.fontSize"
                    render={({ field: { value, onChange } }) => (
                      <FormItem>
                        <FormLabel>
                          Taille du texte {Math.round(value * 100)}%
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={[value]}
                            onValueChange={([newValue]) => onChange(newValue)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="theme.card.spacing"
                    render={({ field: { value, onChange } }) => (
                      <FormItem>
                        <FormLabel>
                          Espacements {Math.round(value * 100)}%
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={[value]}
                            onValueChange={([newValue]) => onChange(newValue)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="theme.card.borderRadius"
                    render={({ field: { value, onChange } }) => (
                      <FormItem>
                        <FormLabel>
                          Arrondis {Math.round(value * 100)}%
                        </FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={2}
                            step={0.1}
                            value={[value]}
                            onValueChange={([newValue]) => onChange(newValue)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-4">
                    <Label className="flex-1">Thème</Label>
                    <Select
                      onValueChange={(value) => {
                        const defaultColorTheme =
                          findColorThemeByThemeId(value);

                        if (defaultColorTheme) {
                          form.setValue(
                            "theme",
                            schema.theme.parse(
                              deepMerge(
                                form.getValues("theme"),
                                pickColorsFromTheme(defaultColorTheme.theme),
                              ),
                            ),
                          );
                        }
                      }}
                      value={findColorThemeIdByTheme(form.getValues("theme"))}
                    >
                      <SelectTrigger className="max-w-[160px]">
                        <SelectValue placeholder="Personnalisé" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(defaultColorThemes).map(
                          ([id, theme]) => (
                            <SelectItem key={id} value={id}>
                              {theme.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormField
                    control={form.control}
                    name="theme.card.foreground"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormLabel className="flex-1">Texte</FormLabel>
                        <FormControl className="w-16">
                          <Input
                            type="color"
                            placeholder="#ffffff"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="theme.card.background"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormLabel className="flex-1">Arrière plan</FormLabel>
                        <FormControl className="w-16">
                          <Input
                            type="color"
                            placeholder="#ffffff"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div
          className="relative flex flex-col items-center justify-center gap-4 px-4 py-8"
          style={{
            // Source: https://sharkcoder.com/images/background
            background: "#eee",
            backgroundImage:
              "linear-gradient(45deg, rgba(0,0,0,.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,.25) 0), linear-gradient(45deg, rgba(0,0,0,.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,.25) 0)",
            backgroundPosition: "0 0, 25px 25px",
            backgroundSize: "50px 50px",
          }}
        >
          <div className={roboto.className}>
            <YouTubeVideoCard
              videoDetails={videoDetails}
              theme={validValues.theme}
              scale={createScale(validValues.theme, 1)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadPNG} disabled={renderStatus !== "idle"}>
              {renderStatus === "downloading" ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Téléchargement...
                </>
              ) : (
                <>
                  <Download className="mr-2 size-4" /> Télécharger
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={copyPNG}
              disabled={renderStatus !== "idle"}
            >
              {renderStatus === "copying" ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" /> Copie...
                </>
              ) : (
                <>
                  <Copy className="mr-2 size-4" /> Copier
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      <footer className="flex items-center justify-between py-8">
        <p className="text-sm text-muted-foreground">
          D'après une demande de{" "}
          <a
            href="https://x.com/BastiUi/status/1779866139880755295"
            className="font-semibold transition-colors hover:text-foreground"
          >
            BastiUi
          </a>{" "}
          et un challenge de{" "}
          <a
            href="https://x.com/benjamincode/status/1779876164296937928"
            className="font-semibold transition-colors hover:text-foreground"
          >
            BenjaminCode
          </a>{" "}
          -{" "}
          <a
            href="https://github.com/zhouzi/broll"
            className="font-semibold transition-colors hover:text-foreground"
          >
            Code source
          </a>
          .
        </p>
        <nav>
          <ul className="flex items-center">
            {[
              {
                Icon: Twitter,
                href: "https://go.gabin.app/twitter",
              },
              {
                Icon: Linkedin,
                href: "https://go.gabin.app/linkedin",
              },
              {
                Icon: Github,
                href: "https://go.gabin.app/github",
              },
            ].map(({ Icon, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="inline-flex p-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon size={16} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </footer>
    </div>
  );
}
