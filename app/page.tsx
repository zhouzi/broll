/* eslint-disable react/no-unescaped-entities */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
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
import { Slider } from "@/components/ui/slider";
import * as schema from "@/lib/schema";
import { DownloadStatus, useDownloadPNG } from "@/lib/use-download-png";
import { useVideoDetails } from "@/lib/use-video-details";
import { cn } from "@/lib/utils";

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

const defaultValues = formSchema.parse({
  theme: {
    card: schema.card.parse({}),
    duration: schema.duration.parse({}),
    progressBar: schema.progressBar.parse({}),
    options: schema.options.parse({}),
  },
});

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onBlur",
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const videoDetails = useVideoDetails(form.watch("videoUrl"));
  const theme = form.watch("theme");

  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>("idle");

  const downloadPNG = useDownloadPNG({
    videoDetails,
    theme,
    setDownloadStatus,
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
    const subscription = form.watch((values) => {
      if (!form.formState.isDirty) {
        return;
      }

      localStorage.setItem("theme", JSON.stringify(values.theme));
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
                        {value && (
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
          <div className={cn("max-w-[450px]", roboto.className)}>
            <ThumbnailPreview
              videoDetails={videoDetails}
              theme={theme}
              scale={createScale(theme, 1)}
            />
          </div>
          <div>
            <Button
              onClick={downloadPNG}
              disabled={downloadStatus === "inprogress"}
            >
              {downloadStatus === "inprogress" ? (
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
            BastiUI
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
