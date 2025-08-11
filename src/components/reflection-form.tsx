"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Download } from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import htmlToDocx from "html-to-docx";

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
import RichTextEditor from "./rich-text-editor";

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

const createParagraphsFromHtml = async (html: string) => {
  if (!html || html === '<p><br></p>') return [new Paragraph('')];
  const fileBuffer = await htmlToDocx(html);
  // We are creating a temporary doc to extract its content
  const tempDoc = await Packer.toDefaultJson(fileBuffer as Buffer);
  return tempDoc.sections[0].children;
};


export default function ReflectionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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
      const {
        firstName,
        lastName,
        serviceDate,
        thanksgiving,
        whatYouHeard,
        reflection,
        prayer,
        challenges,
      } = values;

      const formattedDate = format(serviceDate, "yyyyMMdd");
      const filename = `${formattedDate}_${firstName.replace(/\s/g, "")}${lastName.replace(/\s/g, "")}_CPIWR.docx`;
      
      const thanksgivingParas = await createParagraphsFromHtml(thanksgiving);
      const whatYouHeardParas = await createParagraphsFromHtml(whatYouHeard);
      const reflectionParas = await createParagraphsFromHtml(reflection);
      const prayerParas = await createParagraphsFromHtml(prayer);
      const challengesParas = await createParagraphsFromHtml(challenges);


      const doc = new Document({
        creator: "Weekly Reflection App",
        title: `Reflection for ${format(serviceDate, "yyyy-MM-dd")}`,
        description: "Weekly Reflection Document",
        sections: [
          {
            children: [
              new Paragraph({ text: `Weekly Reflection`, heading: HeadingLevel.TITLE }),
              new Paragraph({ text: `${firstName} ${lastName} - ${format(serviceDate, "MMMM d, yyyy")}`, heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
              
              new Paragraph({ text: "Thanksgiving (10 Min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
              ...thanksgivingParas,
              
              new Paragraph({ text: "MBS | What did you hear? (20 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
              ...whatYouHeardParas,

              new Paragraph({ text: "MBS | Reflection (20 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
              ...reflectionParas,

              new Paragraph({ text: "Prayer (5 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
              ...prayerParas,

              new Paragraph({ text: "Current Challenges or Prayer Requests (5 min)", heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 } }),
              ...challengesParas,
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, filename);

      toast({
        title: "Export Successful",
        description: "Your reflection has been downloaded.",
      });

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

  return (
    <Card className="w-full shadow-2xl rounded-xl border-2 border-primary/20">
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
              <FormField
                control={form.control}
                name="thanksgiving"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-headline text-lg text-accent">Thanksgiving (10 Min)</FormLabel>
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
                    <FormLabel className="font-headline text-lg text-accent">MBS | What did you hear? (20 min)</FormLabel>
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
                    <FormLabel className="font-headline text-lg text-accent">MBS | Reflection (20 min)</FormLabel>
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
                    <FormLabel className="font-headline text-lg text-accent">Write out a prayer (5 min)</FormLabel>
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
                    <FormLabel className="font-headline text-lg text-accent">Current Challenges or Prayer Requests: Personal (5 min)</FormLabel>
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
