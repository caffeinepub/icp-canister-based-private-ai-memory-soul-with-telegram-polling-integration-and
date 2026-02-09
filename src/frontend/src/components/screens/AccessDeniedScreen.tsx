import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export function AccessDeniedScreen() {
  const { login, identity, isLoggingIn } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            {isAuthenticated
              ? 'You do not have permission to access this application. Only authorized administrators can view this content.'
              : 'This application requires authentication. Please sign in to continue.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAuthenticated && (
            <p className="text-center text-sm text-muted-foreground">
              Sign in with Internet Identity to verify your access permissions.
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!isAuthenticated && (
            <Button onClick={login} disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in...' : 'Sign In'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
