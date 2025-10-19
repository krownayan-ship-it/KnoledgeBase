import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { insertArticleSchema, type InsertArticle, type Category, type Tag, type ArticleWithRelations } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Save, FileText, X } from "lucide-react";
import { Link } from "wouter";

export default function ArticleEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/articles/:id");
  const { toast } = useToast();
  const isEdit = params?.id && params.id !== "new";
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: article, isLoading: articleLoading } = useQuery<ArticleWithRelations>({
    queryKey: ["/api/articles", params?.id, "?edit=true"],
    enabled: isEdit,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: tags } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const form = useForm<InsertArticle>({
    resolver: zodResolver(insertArticleSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      coverImage: "",
      status: "draft",
      categoryId: "",
      authorId: "",
      tagIds: [],
    },
  });

  // Load article data when editing
  useEffect(() => {
    if (article && isEdit) {
      form.reset({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || "",
        coverImage: article.coverImage || "",
        status: article.status,
        categoryId: article.categoryId || "",
        authorId: article.authorId,
      });
      setSelectedTags(article.tags.map(t => t.id));
    }
  }, [article, isEdit, form]);

  const createMutation = useMutation({
    mutationFn: (data: InsertArticle) =>
      apiRequest("POST", "/api/articles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Article created",
        description: "Your article has been created successfully.",
      });
      setLocation("/articles");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create article",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<InsertArticle>) =>
      apiRequest("PATCH", `/api/articles/${params?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles", params?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Article updated",
        description: "Your article has been updated successfully.",
      });
      setLocation("/articles");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update article",
        description: error.message,
      });
    },
  });

  const onSubmit = (data: InsertArticle) => {
    const submitData = {
      ...data,
      tagIds: selectedTags,
      categoryId: data.categoryId || undefined,
    };
    
    if (isEdit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handlePublish = () => {
    form.setValue("status", "published");
    form.handleSubmit(onSubmit)();
  };

  const handleSaveDraft = () => {
    form.setValue("status", "draft");
    form.handleSubmit(onSubmit)();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (isEdit && articleLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Card className="p-6 space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-96 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/articles">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold" data-testid="text-editor-title">
              {isEdit ? "Edit Article" : "Create New Article"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit ? "Update your article content" : "Write and publish your knowledge"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="p-6 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter article title..."
                        className="text-lg"
                        data-testid="input-article-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Excerpt</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Brief summary of your article..."
                        className="resize-none"
                        rows={2}
                        data-testid="input-article-excerpt"
                      />
                    </FormControl>
                    <FormDescription>
                      A short description that appears in article previews
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write your article content here...

You can use plain text or markdown formatting:
# Heading 1
## Heading 2
**bold text**
*italic text*
- bullet point
1. numbered list
[link text](https://example.com)
"
                        className="min-h-[400px] font-mono text-sm"
                        data-testid="input-article-content"
                      />
                    </FormControl>
                    <FormDescription>
                      Write your article content. Supports markdown formatting for headings, bold, italic, lists, and links.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ""}
                        placeholder="https://example.com/image.jpg"
                        data-testid="input-cover-image"
                      />
                    </FormControl>
                    <FormDescription>
                      Paste an image URL to add a cover image to your article
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="border rounded-md p-3 min-h-[42px] flex flex-wrap gap-2">
                    {selectedTags.length === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        Select tags below
                      </span>
                    ) : (
                      selectedTags.map((tagId) => {
                        const tag = tags?.find((t) => t.id === tagId);
                        return tag ? (
                          <Badge
                            key={tagId}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag.name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => toggleTag(tagId)}
                            />
                          </Badge>
                        ) : null;
                      })
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags?.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                        className="cursor-pointer hover-elevate"
                        onClick={() => toggleTag(tag.id)}
                        data-testid={`badge-tag-${tag.id}`}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                  <FormDescription>
                    Click tags to add or remove them
                  </FormDescription>
                </FormItem>
              </div>
            </Card>

            <div className="flex flex-wrap gap-4 justify-end">
              <Link href="/articles">
                <Button variant="outline" type="button" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button
                variant="secondary"
                type="button"
                onClick={handleSaveDraft}
                disabled={isPending}
                data-testid="button-save-draft"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={handlePublish}
                disabled={isPending}
                data-testid="button-publish"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isEdit ? "Update & Publish" : "Publish Article"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
