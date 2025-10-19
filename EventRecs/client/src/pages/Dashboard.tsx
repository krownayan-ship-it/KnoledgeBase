import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Eye, FolderOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ArticleWithRelations } from "@shared/schema";

type DashboardStats = {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalEmployees: number;
  totalViews: number;
  totalCategories: number;
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentArticles, isLoading: articlesLoading } = useQuery<
    ArticleWithRelations[]
  >({
    queryKey: ["/api/articles/recent"],
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your knowledge base platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Articles
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-articles">
                  {stats?.totalArticles || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.publishedArticles || 0} published, {stats?.draftArticles || 0} drafts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-employees">
                  {stats?.totalEmployees || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active contributors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-views">
                  {stats?.totalViews || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Article engagement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-categories">
                  {stats?.totalCategories || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Content organized
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Articles</h2>
          <Link href="/articles">
            <a className="text-sm text-primary hover:underline" data-testid="link-view-all-articles">
              View all →
            </a>
          </Link>
        </div>

        {articlesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : recentArticles && recentArticles.length > 0 ? (
          <div className="space-y-4">
            {recentArticles.map((article) => (
              <Card key={article.id} className="hover-elevate">
                <Link href={`/articles/${article.id}`}>
                  <a>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          {article.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(article.author.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{article.author.fullName}</span>
                            </div>
                            <span>•</span>
                            <span>{formatDate(article.createdAt.toString())}</span>
                            {article.category && (
                              <>
                                <span>•</span>
                                <Badge variant="secondary" className="text-xs">
                                  {article.category.name}
                                </Badge>
                              </>
                            )}
                            <span>•</span>
                            <Badge
                              variant={article.status === "published" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {article.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </a>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No articles yet. Start creating content!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
