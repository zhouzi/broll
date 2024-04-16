/* eslint-disable @next/next/no-img-element, react/no-unescaped-entities */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useReducer } from "react";
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

const FormSchema = z.object({
  videoUrl: z
    .string()
    .url()
    .refine((value) => new URL(value).searchParams.has("v"), {
      message: "Le format de l'URL est invalide",
    }),
  noDuration: z.boolean(),
  noViews: z.boolean(),
  noPublishedAt: z.boolean(),
  progress: z.number().min(0).max(100),
  size: z.number().min(1).max(6),
});

const defaultValues: z.infer<typeof FormSchema> = {
  videoUrl: "https://www.youtube.com/watch?v=XEO3duW1A80",
  noViews: false,
  noDuration: false,
  noPublishedAt: false,
  progress: 100,
  size: 3,
};

function createApiUrl(values: z.infer<typeof FormSchema>) {
  return `/api/thumbnail?${new URLSearchParams(
    Object.entries({ ...values, cacheBuster: Date.now() }).reduce<
      Record<string, string>
    >((acc, [key, value]) => {
      if (typeof value === "boolean") {
        if (value) {
          acc[key] = "true";
        }
      } else if (typeof value === "number") {
        acc[key] = String(value);
      } else {
        acc[key] = value;
      }

      return acc;
    }, {})
  ).toString()}`;
}

type Action =
  | { type: "load"; parameters: z.infer<typeof FormSchema> }
  | { type: "loaded" };

interface State {
  href: string;
  loading: boolean;
}

const initialState: State = {
  href: createApiUrl(defaultValues),
  loading: false,
};

export default function Home() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });
  const [state, dispatch] = useReducer((prevState: State, action: Action) => {
    switch (action.type) {
      case "load":
        return {
          href: createApiUrl(action.parameters),
          loading: true,
        };
      case "loaded":
        return {
          ...prevState,
          loading: false,
        };
      default:
        return prevState;
    }
  }, initialState);

  function onSubmit(parameters: z.infer<typeof FormSchema>) {
    dispatch({ type: "load", parameters });
  }

  return (
    <main className="max-w-[900px] py-6 px-4 m-auto flex flex-col-reverse md:flex-row gap-8">
      <div className="flex-1">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>Personnalisation de la vignette</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
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
                  name="size"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>Taille x{value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={6}
                          step={1}
                          defaultValue={[value]}
                          onValueChange={([newValue]) => onChange(newValue)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="progress"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>Progression de la lecture {value}%</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={1}
                          defaultValue={[value]}
                          onValueChange={([newValue]) => onChange(newValue)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="noDuration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Masquer la durée
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="noViews"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Masquer les vues
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="noPublishedAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Masquer la date de publication
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={state.loading}>
                  {state.loading ? "Génération..." : "Générer"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
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
            href="https://github.com/zhouzi/custom-youtube-thumbnail"
            className="transition-colors hover:text-foreground font-semibold"
          >
            Code source
          </a>
          .
        </p>
      </div>
      <div
        className="py-8 px-4 flex justify-center"
        style={{
          // Source: https://sharkcoder.com/images/background
          background: "#eee",
          backgroundImage:
            "linear-gradient(45deg, rgba(0,0,0,.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,.25) 0), linear-gradient(45deg, rgba(0,0,0,.25) 25%, transparent 0, transparent 75%, rgba(0,0,0,.25) 0)",
          backgroundPosition: "0 0, 25px 25px",
          backgroundSize: "50px 50px",
        }}
      >
        <img
          className="object-contain"
          src={state.href}
          alt=""
          width="450"
          onLoad={() => dispatch({ type: "loaded" })}
        />
      </div>
    </main>
  );
}
