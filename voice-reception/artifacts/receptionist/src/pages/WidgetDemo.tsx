import { VoiceWidget } from "@/components/VoiceWidget";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Code, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function CopyBlock({ code, testId }: { code: string; testId: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <pre className="bg-secondary p-4 rounded-lg overflow-x-auto text-sm font-mono text-foreground border border-border leading-relaxed">
        <code>{code}</code>
      </pre>
      <Button
        size="sm"
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copy}
        data-testid={testId}
      >
        {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
        {copied ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
}

export default function WidgetDemo() {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
  const widgetUrl = `${base}embed`;
  const loaderUrl = `${base}widget-loader.js`;

  const floatingCode = `<!-- Add once, inside <head> or before </body> -->
<script src="${loaderUrl}" defer></script>`;

  const iframeCode = `<!-- Place wherever you want the widget to appear -->
<iframe
  src="${widgetUrl}"
  width="340"
  height="240"
  style="border:none; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.1);"
  allow="microphone"
  title="Talk to DEVOCEAN">
</iframe>`;

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-foreground">Voice Widget</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Test the live receptionist below, then copy the embed code for the DEVOCEAN Lodge website.
          Deploy this app first to get a permanent URL.
        </p>
      </div>

      <div className="flex justify-center">
        <VoiceWidget />
      </div>

      {/* Option 1 — Floating button (recommended) */}
      <Card className="max-w-3xl mx-auto border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border bg-secondary/30">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <Code className="w-5 h-5 text-primary" />
            Option 1 — Floating button (recommended)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            A terracotta microphone button hovers in the bottom-right corner of every page.
            Clicking it opens Mia in a popup — no layout changes needed on the lodge website.
            Add this single line to the lodge site's <code className="font-mono bg-secondary px-1 rounded text-xs">&lt;head&gt;</code> (or just before <code className="font-mono bg-secondary px-1 rounded text-xs">&lt;/body&gt;</code>):
          </p>
          <CopyBlock code={floatingCode} testId="button-copy-floating" />
          <p className="text-xs text-muted-foreground">
            Requires microphone permission (HTTPS only). The widget loads lazily — no impact on page speed until the button is clicked.
          </p>
        </CardContent>
      </Card>

      {/* Option 2 — Inline iframe */}
      <Card className="max-w-3xl mx-auto border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border bg-secondary/30">
          <CardTitle className="flex items-center gap-2 text-lg font-serif">
            <Code className="w-5 h-5 text-primary" />
            Option 2 — Inline iframe
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Embed the widget in a specific spot on a page — for example, a dedicated "Contact" or
            "Enquiries" section. Paste this where you want it to appear:
          </p>
          <CopyBlock code={iframeCode} testId="button-copy-iframe" />
        </CardContent>
      </Card>
    </div>
  );
}
