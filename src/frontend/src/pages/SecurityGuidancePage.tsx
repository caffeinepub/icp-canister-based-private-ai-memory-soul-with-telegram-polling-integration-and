import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, Key, MessageSquare, Database, AlertTriangle } from 'lucide-react';

export default function SecurityGuidancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security & Privacy Guidance</h2>
        <p className="text-sm text-muted-foreground">Best practices for running this system securely</p>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertDescription>
          This system is designed for maximum privacy. Follow these guidelines to maintain security and protect sensitive data.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Token Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium mb-1">Obtaining a Bot Token</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Open Telegram and search for @BotFather</li>
              <li>Send the command /newbot and follow the prompts</li>
              <li>Copy the token provided (format: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11)</li>
              <li>Never share this token publicly or commit it to source control</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-1">Token Rotation</h4>
            <p className="text-muted-foreground">
              Rotate your bot token regularly and immediately if compromised. Use @BotFather's /token command to generate a new token.
              The old token will be invalidated automatically.
            </p>
          </div>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The token shared in the initial chat (8051900184:AAETh5fG0m3bdsUnvQpeBoINZBcjfmnlrtw) is compromised. Revoke it
              immediately via @BotFather before deploying this system.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Finding Your Chat ID
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium mb-1">Method 1: Using getUpdates</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Send a message to your bot on Telegram</li>
              <li>Visit: https://api.telegram.org/bot[YOUR_TOKEN]/getUpdates</li>
              <li>Look for the "chat" object and find the "id" field</li>
              <li>This number is your chat ID (can be positive or negative)</li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-1">Method 2: Using @userinfobot</h4>
            <p className="text-muted-foreground">
              Search for @userinfobot on Telegram, start a chat, and it will display your user ID. Note: This only works for personal
              chats, not groups.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Storage & Polling
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium mb-1">What Data is Stored</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Thread metadata: title, participants, timestamps</li>
              <li>Events: message content, sender, timestamp, event type</li>
              <li>User profiles: name and optional Telegram username</li>
              <li>Bot token: stored in volatile memory only (not persisted across upgrades)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">How Polling Works</h4>
            <p className="text-muted-foreground">
              The canister uses HTTPS outcalls to poll Telegram's getUpdates endpoint at regular intervals. Messages are fetched,
              processed, and stored as events in threads. The system tracks the last processed update ID to avoid duplicates.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Privacy Considerations</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>All data is stored on-chain in the ICP canister</li>
              <li>Only authorized admin principals can access the data</li>
              <li>Message content is not logged in debug output</li>
              <li>Use the delete/redact functions to remove sensitive content</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Admin Principal Hygiene
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-medium mb-1">Access Control</h4>
            <p className="text-muted-foreground">
              Only principals with admin role can access this console. The first admin is set during canister initialization. Additional
              admins can be added via the backend's access control functions.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Best Practices</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use Internet Identity for authentication (never share your seed phrase)</li>
              <li>Limit the number of admin principals to those who absolutely need access</li>
              <li>Regularly audit who has admin access</li>
              <li>Use separate identities for different security contexts</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
