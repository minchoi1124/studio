"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Download } from "lucide-react";
import { saveAs } from "file-saver";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useTimer } from "@/hooks/use-timer";
import { generateDocx } from "@/app/actions";

const RichTextEditor = dynamic(() => import("./rich-text-editor"), { ssr: false });


const formSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  serviceDate: z.date({
    required_error: "A date is required.",
  }),
  thanksgiving: z.string().min(1, "This field is required."),
  whatYouHeard: z.string().min(1, "This field is required."),
  reflection: z.string().min(1, "This field is required."),
  prayer: z.string().min(1, "This field is required."),
  challenges: z.string().min(1, "This field is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReflectionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const { sectionTimes } = useTimer();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      serviceDate: new Date(),
      thanksgiving: "",
      whatYouHeard: "",
      reflection: "",
      prayer: "",
      challenges: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const result = await generateDocx(values);
      if (result) {
        const byteCharacters = atob(result.buffer);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        saveAs(blob, result.filename);
        toast({
          title: "Export Successful",
          description: "Your reflection has been downloaded.",
        });
      }
    } catch (error) {
      console.error("Failed to generate document:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "There was an error creating your document.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionTimeText = (time: number | null) => {
    if (time === null) return "";
    if (time < 1) return "<1 min";
    return `${Math.round(time)} min`;
  };

  return (
    <Card className="w-full shadow-2xl rounded-xl border-2 border-primary/20 mt-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
             <CardTitle className="font-headline text-2xl text-accent">Your Details</CardTitle>
             <CardDescription>Start by entering your name and the date.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-accent">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-accent">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="font-headline text-accent">Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full md:w-1/2 justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6">
              {isClient && (
                <>
                  <FormField
                    control={form.control}
                    name="thanksgiving"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-lg text-accent">
                          Thanksgiving ({getSectionTimeText(sectionTimes.thanksgiving)})
                        </FormLabel>
                        <FormControl>
                          <RichTextEditor
                            placeholder="Reflect on what you're grateful for..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatYouHeard"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-lg text-accent">MBS | What did you hear? ({getSectionTimeText(sectionTimes.whatYouHeard)})</FormLabel>
                        <FormDescription>Outline main points, sub points, and short descriptions of illustrations.</FormDescription>
                        <FormControl>
                          <RichTextEditor
                            placeholder="Summarize the key points of the message..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reflection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-lg text-accent">MBS | Reflection ({getSectionTimeText(sectionTimes.reflection)})</FormLabel>
                        <FormDescription>
                          Utilizing the 4 Key Elements to Message Reflection Handout (about God, life, ministry, yourself).
                        </FormDescription>
                        <FormControl>
                          <RichTextEditor
                            placeholder="What are your personal reflections on the message?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prayer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-lg text-accent">Write out a prayer ({getSectionTimeText(sectionTimes.prayer)})</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            placeholder="Write a prayer based on your reflections..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="challenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-headline text-lg text-accent">Current Challenges or Prayer Requests: Personal ({getSectionTimeText(sectionTimes.challenges)})</FormLabel>
                        <FormControl>
                          <RichTextEditor
                            placeholder="List any personal challenges or prayer requests..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export to Word Document
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
