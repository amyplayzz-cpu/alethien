import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { insertAssessmentSchema } from "@shared/schema";
import { AssessmentType, StakeLevel, TimeUnit } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Extend the insert schema to add client-side validation
const assessmentFormSchema = insertAssessmentSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  weight: z.coerce.number().min(0, "Weight must be non-negative").max(100, "Weight cannot exceed 100%"),
  prepTimeAmount: z.coerce.number().min(1, "Prep time must be at least 1"),
  prepTimeUnit: z.enum(["minutes", "hours", "days", "weeks"] as const),
});

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>;

interface AssessmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultValues?: Partial<AssessmentFormValues>;
  isEditing?: boolean;
  assessmentId?: number;
}

const ASSESSMENT_TYPES: { value: AssessmentType; label: string }[] = [
  { value: "quiz", label: "Quiz" },
  { value: "test", label: "Test" },
  { value: "exam", label: "Exam" },
  { value: "project", label: "Project" },
  { value: "presentation", label: "Presentation" },
  { value: "essay", label: "Essay" },
  { value: "lab_report", label: "Lab Report" },
  { value: "final_exam", label: "Final Exam" },
];

const TIME_UNITS: { value: TimeUnit; label: string }[] = [
  { value: "minutes", label: "minutes" },
  { value: "hours", label: "hours" },
  { value: "days", label: "days" },
  { value: "weeks", label: "weeks" },
];

export function AssessmentForm({
  onSuccess,
  onCancel,
  defaultValues,
  isEditing = false,
  assessmentId,
}: AssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      title: "",
      type: "quiz",
      date: new Date().toISOString().split("T")[0],
      weight: 10,
      stakes: "low",
      prepTimeAmount: 30,
      prepTimeUnit: "minutes",
      notes: "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: AssessmentFormValues) {
    setIsSubmitting(true);
    
    try {
      // Transform form values to API format
      const apiData = {
        ...values,
        prepTime: {
          amount: values.prepTimeAmount,
          unit: values.prepTimeUnit,
        },
      };
      
      // Remove the separate prep time fields that are not in the schema
      const { prepTimeAmount, prepTimeUnit, ...submitData } = apiData;
      
      if (isEditing && assessmentId) {
        await apiRequest("PATCH", `/api/assessments/${assessmentId}`, submitData);
        toast({
          title: "Assessment updated",
          description: "The assessment has been successfully updated.",
        });
      } else {
        await apiRequest("POST", "/api/assessments", submitData);
        toast({
          title: "Assessment created",
          description: "The new assessment has been successfully created.",
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      
      // Call success callback
      if (onSuccess) onSuccess();
      
      // Reset form if not editing
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "There was an error saving the assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-poppins text-lg">
          {isEditing ? "Edit Assessment" : "Add New Assessment"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Math Quiz: Fractions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ASSESSMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        max="100" 
                        placeholder="e.g., 15" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stakes"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Stakes Level</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="low" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Low
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="medium" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Medium
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="high" />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            High
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <FormField
                  control={form.control}
                  name="prepTimeAmount"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Estimated Prep Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          placeholder="e.g., 2" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prepTimeUnit"
                  render={({ field }) => (
                    <FormItem className="flex-1 pt-8">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIME_UNITS.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes/Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any specific requirements or flexibility in scheduling"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-2">
              <div className="flex justify-end space-x-3 w-full">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className="bg-primary text-white">
                  {isSubmitting ? "Saving..." : isEditing ? "Update Assessment" : "Save Assessment"}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
