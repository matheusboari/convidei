import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface LoadingStateProps {
  title?: string;
  description?: string;
  showCards?: boolean;
  showTable?: boolean;
  tableRows?: number;
}

export function LoadingState({
  title,
  description,
  showCards = true,
  showTable = true,
  tableRows = 5,
}: LoadingStateProps) {
  return (
    <div className="space-y-6 animate-pulse">
      {(title || description) && (
        <div className="flex items-center justify-between">
          {title && <div className="h-8 w-48 bg-gray-200 rounded"></div>}
          {description && <div className="h-4 w-48 bg-gray-200 rounded"></div>}
        </div>
      )}

      {showCards && (
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-6 w-32 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showTable && (
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(tableRows)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
