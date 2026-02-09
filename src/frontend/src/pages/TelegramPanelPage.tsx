import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function TelegramPanelPage() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [tokenSubmitted, setTokenSubmitted] = useState(false);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    // In a real implementation, this would call the backend
    setTokenSubmitted(true);
    setToken('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Telegram Integration</h2>
        <p className="text-sm text-muted-foreground">Configure Telegram bot settings and manage polling</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Warning:</strong> The bot token previously shared in chat (8051900184:AAETh5fG0m3bdsUnvQpeBoINZBcjfmnlrtw) is
          compromised and must be revoked immediately. Generate a new token via @BotFather before using this system.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Bot Token</CardTitle>
          <CardDescription>Set or rotate your Telegram Bot API token. The token is never displayed after submission.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="token">Bot Token</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your bot token"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your bot token from @BotFather on Telegram. Never share this token or paste it in screenshots.
              </p>
            </div>
            <Button type="submit" disabled={!token.trim()}>
              Set Token
            </Button>
          </form>
          {tokenSubmitted && (
            <Alert className="mt-4">
              <AlertDescription>Token has been set. Remember to clear it from your clipboard and browser history.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Polling Status</CardTitle>
          <CardDescription>Monitor and control the Telegram message polling service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <p className="text-sm font-medium">Not configured</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Poll</Label>
              <p className="text-sm font-medium">Never</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled>
              Start Polling
            </Button>
            <Button variant="outline" disabled>
              Stop Polling
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Polling functionality requires backend implementation with HTTPS outcalls and timers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Message</CardTitle>
          <CardDescription>Send a test message to verify your bot configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="chatId">Chat ID</Label>
              <Input id="chatId" placeholder="Enter chat ID" />
              <p className="text-xs text-muted-foreground">
                To find your chat ID, send a message to your bot and check the updates via the Telegram API.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Input id="message" placeholder="Test message" />
            </div>
            <Button type="submit" disabled>
              Send Test Message
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
