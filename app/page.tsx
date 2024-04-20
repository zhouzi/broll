/* eslint-disable react/no-unescaped-entities */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ThumbnailPreview, createScale } from "@/components/thumbnail-preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import * as schema from "@/lib/schema";
import { RenderStatus, useRenderPNG } from "@/lib/use-render-png";
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

const defaultTheme = schema.theme.parse({
  card: schema.card.parse({}),
  duration: schema.duration.parse({}),
  progressBar: schema.progressBar.parse({}),
  options: schema.options.parse({}),
});

interface DefaultColorTheme {
  name: string;
  foreground: string;
  background: string;
}

const defaultColorThemes = {
  light: {
    name: "Clair",
    foreground: defaultTheme.card.foreground,
    background: defaultTheme.card.background,
  },
  dark: {
    name: "Sombre",
    foreground: "#f1f1f1",
    background: "#0f0f0f",
  },
} satisfies Record<string, DefaultColorTheme>;

function findColorThemeByThemeId(id: string) {
  return defaultColorThemes[id as keyof typeof defaultColorThemes] as
    | DefaultColorTheme
    | undefined;
}

function findColorThemeIdByTheme(theme: schema.Theme) {
  for (const [id, colorTheme] of Object.entries(defaultColorThemes)) {
    if (
      colorTheme.foreground === theme.card.foreground &&
      colorTheme.background === theme.card.background
    ) {
      return id;
    }
  }

  return undefined;
}

const defaultValues = formSchema.parse({
  theme: defaultTheme,
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const videoDetails = useVideoDetails(form.watch("videoUrl"));
  const theme = form.watch("theme");

  const [renderStatus, setRenderStatus] = useState<RenderStatus>("idle");

  const { downloadPNG, copyPNG } = useRenderPNG({
    videoDetails,
    theme,
    setRenderStatus,
  });

  useEffect(() => {
    try {
      const localTheme = schema.theme.parse(
        JSON.parse(localStorage.getItem("theme") ?? "{}")
      );
      form.setValue("theme", localTheme, { shouldDirty: true });
    } catch (err) {}
  }, [form]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const subscription = form.watch((values) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        localStorage.setItem("theme", JSON.stringify(values.theme));
      }, 500);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="max-w-[900px] py-6 px-4 m-auto">
      <header className="py-4 flex justify-between items-center">
        <Link href="/" className="inline-flex items-baseline gap-[0.15rem]">
          <span className="text-2xl font-black">broll</span>
          <span className="inline-flex size-2 bg-red-600 rounded-full" />
          <span className="text-muted-foreground">gabin.app</span>
        </Link>
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
      </header>
      <main className="flex flex-col-reverse md:flex-row gap-8">
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
                          <Input
                            placeholder="https://www.youtube.com/watch?v=XEO3duW1A80"
                            {...field}
                          />
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
                                onChange(checked ? 100 : undefined)
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
                            "theme.card.foreground",
                            defaultColorTheme.foreground
                          );
                          form.setValue(
                            "theme.card.background",
                            defaultColorTheme.background
                          );
                        }
                      }}
                      value={findColorThemeIdByTheme(theme)}
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
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <FormField
                    control={form.control}
                    name="theme.card.foreground"
                    render={({ field }) => (
                      <FormItem className="space-y-0 flex items-center">
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
                      <FormItem className="space-y-0 flex items-center">
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
          className="py-8 px-4 flex flex-col gap-4 items-center justify-center relative"
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
            <ThumbnailPreview
              videoDetails={videoDetails}
              theme={theme}
              scale={createScale(theme, 1)}
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
                  <Download className="mr-2 h-4 w-4" /> Télécharger
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={copyPNG}
              disabled={renderStatus !== "idle"}
            >
              {renderStatus === "copying" ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </main>
      <footer className="py-8 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          D'après une demande de{" "}
          <a
            href="https://x.com/BastiUi/status/1779866139880755295"
            className="transition-colors hover:text-foreground font-semibold"
          >
            BastiUi
          </a>{" "}
          et un challenge de{" "}
          <a
            href="https://x.com/benjamincode/status/1779876164296937928"
            className="transition-colors hover:text-foreground font-semibold"
          >
            BenjaminCode
          </a>{" "}
          -{" "}
          <a
            href="https://github.com/zhouzi/broll"
            className="transition-colors hover:text-foreground font-semibold"
          >
            Code source
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
