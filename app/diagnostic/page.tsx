"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function DiagnosticPage() {
  const [results, setResults] = useState<{
    origin: string
    baseUrl: string
    backendReachable: boolean | null
    corsEnabled: boolean | null
    errorMessage?: string
    corsHeaders?: Record<string, string | null>
  }>({
    origin: typeof window !== "undefined" ? window.location.origin : "",
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5105",
    backendReachable: null,
    corsEnabled: null,
  })
  const [isLoading, setIsLoading] = useState(false)

  async function testConnection() {
    setIsLoading(true)
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5105"
    const origin = window.location.origin

    console.log("[v0] Testing connection to:", baseUrl)
    console.log("[v0] From origin:", origin)

    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "test@test.com", password: "test" }),
      })

      console.log("[v0] Response status:", response.status)

      const corsHeaders = {
        allowOrigin: response.headers.get("Access-Control-Allow-Origin"),
        allowMethods: response.headers.get("Access-Control-Allow-Methods"),
        allowHeaders: response.headers.get("Access-Control-Allow-Headers"),
        allowCredentials: response.headers.get("Access-Control-Allow-Credentials"),
      }

      console.log("[v0] CORS headers:", corsHeaders)

      const corsEnabled = corsHeaders.allowOrigin !== null

      setResults({
        origin,
        baseUrl,
        backendReachable: true,
        corsEnabled,
        corsHeaders,
        errorMessage: !corsEnabled ? "No Access-Control-Allow-Origin header found" : undefined,
      })
    } catch (error) {
      console.error("[v0] Connection test failed:", error)
      setResults({
        origin,
        baseUrl,
        backendReachable: false,
        corsEnabled: false,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function copyOrigin() {
    navigator.clipboard.writeText(results.origin)
    toast({
      title: "Copied!",
      description: "Origin copied to clipboard",
    })
  }

  function copyConfig() {
    const config = `"Cors": {
  "AllowedOrigins": [
    "${results.origin}"
  ]
}`
    navigator.clipboard.writeText(config)
    toast({
      title: "Copied!",
      description: "Configuration copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>CORS Diagnostic Tool</CardTitle>
          <CardDescription>Test connection to your backend API and check CORS configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">Frontend Origin:</span>
                <Button variant="ghost" size="sm" onClick={copyOrigin}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <code className="text-sm bg-muted px-3 py-2 rounded block break-all">{results.origin}</code>
            </div>

            <div className="space-y-1">
              <span className="font-medium">Backend URL:</span>
              <code className="text-sm bg-muted px-3 py-2 rounded block break-all">{results.baseUrl}</code>
            </div>
          </div>

          <Button onClick={testConnection} disabled={isLoading} className="w-full">
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>

          {results.backendReachable !== null && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Backend Reachable:</span>
                <Badge variant={results.backendReachable ? "default" : "destructive"}>
                  {results.backendReachable ? "Yes ✓" : "No ✗"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium">CORS Enabled:</span>
                <Badge variant={results.corsEnabled ? "default" : "destructive"}>
                  {results.corsEnabled ? "Yes ✓" : "No ✗"}
                </Badge>
              </div>

              {results.corsHeaders && (
                <div className="space-y-2">
                  <span className="font-medium text-sm">CORS Headers:</span>
                  <div className="bg-muted p-3 rounded text-xs space-y-1">
                    <div>
                      Allow-Origin: <code>{results.corsHeaders.allowOrigin || "Not set"}</code>
                    </div>
                    <div>
                      Allow-Methods: <code>{results.corsHeaders.allowMethods || "Not set"}</code>
                    </div>
                    <div>
                      Allow-Headers: <code>{results.corsHeaders.allowHeaders || "Not set"}</code>
                    </div>
                  </div>
                </div>
              )}

              {results.errorMessage && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive font-medium">Error:</p>
                  <p className="text-sm text-destructive/80 mt-1">{results.errorMessage}</p>
                </div>
              )}

              {!results.corsEnabled && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-md space-y-3">
                  <p className="text-sm font-medium">⚠️ CORS Configuration Required</p>
                  <p className="text-sm text-muted-foreground">Add this origin to your backend appsettings.json:</p>
                  <div className="relative">
                    <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                      {`"Cors": {
  "AllowedOrigins": [
    "${results.origin}"
  ]
}`}
                    </pre>
                    <Button variant="ghost" size="sm" className="absolute top-1 right-1" onClick={copyConfig}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">After updating, redeploy your backend on Render.com</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
