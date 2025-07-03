import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Globe, User, X, RotateCcw } from "lucide-react";
import { SUPPORTED_LANGUAGES, validateNameInput } from "@/lib/transliterationMaps";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  sourceLanguage: z.string().min(2, "Please select a language"),
});

type FormData = z.infer<typeof formSchema>;

interface LanguageConverterProps {
  onConvert: (data: FormData) => void;
  isLoading?: boolean;
}

export function LanguageConverter({ onConvert, isLoading }: LanguageConverterProps) {
  const [inputValue, setInputValue] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sourceLanguage: "auto",
    },
  });

  const handleSubmit = (data: FormData) => {
    const validation = validateNameInput(data.name);
    if (!validation.isValid) {
      form.setError("name", { message: validation.error });
      return;
    }
    
    onConvert(data);
  };

  const clearInput = () => {
    setInputValue("");
    form.setValue("name", "");
    form.clearErrors("name");
  };

  const resetForm = () => {
    form.reset();
    setInputValue("");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border border-gray-200">
      <CardContent className="p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Language Selection */}
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="sourceLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                        <Globe className="w-4 h-4 mr-2" />
                        Source Language
                      </FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUPPORTED_LANGUAGES.map((lang) => (
                              <SelectItem key={lang.code} value={lang.code}>
                                <span className="flex items-center space-x-2">
                                  <span>{lang.flag}</span>
                                  <span>{lang.name}</span>
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>



              {/* Name Input */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-sm font-medium text-gray-700">
                        <User className="w-4 h-4 mr-2" />
                        Your Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            value={inputValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              setInputValue(value);
                              field.onChange(value);
                            }}
                            placeholder="Enter your name here..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors pr-12"
                          />
                          {inputValue && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={clearInput}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors h-auto p-1"
                              title="Clear input"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports special characters and diacritics
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors inline-flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Convert to Korean</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="px-6 py-3 font-medium"
              >
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
