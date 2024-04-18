/* eslint-disable @next/next/no-img-element, react/no-unescaped-entities */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useReducer } from "react";
import { useForm } from "react-hook-form";

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
import * as queryString from "@/lib/query-string";
import * as schema from "@/lib/schema";

function createApiUrl(values: schema.Message, cacheBuster?: number) {
  return `/api/thumbnail?${queryString.stringify(
    cacheBuster ? { ...values, cacheBuster } : values
  )}`;
}

type Action = { type: "load"; message: schema.Message } | { type: "loaded" };

interface State {
  href: string;
  loading: boolean;
}

const defaultValues = schema.message.parse({
  theme: {
    card: schema.card.parse({}),
    duration: schema.duration.parse({}),
    progressBar: schema.progressBar.parse({}),
    options: schema.options.parse({}),
  },
});

const initialState: State = {
  href: createApiUrl(defaultValues),
  loading: false,
};

export default function Home() {
  const form = useForm<schema.Message>({
    resolver: zodResolver(schema.message),
    defaultValues,
  });
  const [state, dispatch] = useReducer((prevState: State, action: Action) => {
    switch (action.type) {
      case "load":
        return {
          href: createApiUrl(action.message, Date.now()),
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

  function onSubmit(message: schema.Message) {
    dispatch({ type: "load", message });
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
                          <FormLabel>Progression de lecture {value}%</FormLabel>
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
                    </>
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
                  name="theme.card.borderRadius"
                  render={({ field: { value, onChange } }) => (
                    <FormItem>
                      <FormLabel>Arrondis {Math.round(value * 100)}%</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
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
                  name="theme.card.background"
                  render={({ field }) => (
                    <FormItem className="space-y-0 flex items-center">
                      <FormLabel className="flex-1">
                        Arrière plan carte
                      </FormLabel>
                      <FormControl className="w-16">
                        <Input type="color" placeholder="#ffffff" {...field} />
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
                        <Input type="color" placeholder="#ffffff" {...field} />
                      </FormControl>
                      <FormMessage />
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
