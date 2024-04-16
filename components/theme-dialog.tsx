"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

const FormSchema = z.object({
  cardBackground: z.string(),
  textForegroundMuted: z.string(),
  textForeground: z.string(),
  durationBackground: z.string(),
  progressForeground: z.string(),
});

export type DeserializedTheme = z.infer<typeof FormSchema>;

const defaultValues: z.infer<typeof FormSchema> = {
  cardBackground: "#ffffff",
  textForegroundMuted: "#606060",
  textForeground: "#0f0f0f",
  durationBackground: "#2a2a2a",
  progressForeground: "#ff0000",
};

interface ThemeDialogProps {
  // eslint-disable-next-line no-unused-vars
  onSubmit: (theme: z.infer<typeof FormSchema>) => void;
}

export function ThemeDialog(props: ThemeDialogProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues,
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Créer un thème</DialogTitle>
        <DialogDescription>
          Il sera gardé en mémoire dans ton navigateur.
        </DialogDescription>
        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.stopPropagation();
              form.handleSubmit(props.onSubmit)(event);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="cardBackground"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arrière plan de la carte</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="#ffffff" {...field} />
                    </FormControl>
                    <div
                      className="size-10 border border-input rounded-sm"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="textForegroundMuted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statistiques</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="#ffffff" {...field} />
                    </FormControl>
                    <div
                      className="size-10 border border-input rounded-sm"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="textForeground"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre de la vidéo</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="#ffffff" {...field} />
                    </FormControl>
                    <div
                      className="size-10 border border-input rounded-sm"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationBackground"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Arrière plan durée</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="#ffffff" {...field} />
                    </FormControl>
                    <div
                      className="size-10 border border-input rounded-sm"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="progressForeground"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barre de progression</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="#ffffff" {...field} />
                    </FormControl>
                    <div
                      className="size-10 border border-input rounded-sm"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Créer</Button>
          </form>
        </Form>
      </DialogHeader>
    </DialogContent>
  );
}
