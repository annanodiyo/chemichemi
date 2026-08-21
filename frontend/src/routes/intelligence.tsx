import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { sendSandboxRiskAlert } from "@/lib/sms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/intelligence")({
  component: IntelligencePage,
});

function IntelligencePage() {
  const [location, setLocation] = useState("");
  const [level, setLevel] = useState("HIGH");
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await sendSandboxRiskAlert({
        data: { location, level, advice },
      });
      toast.success(response.message);
      // Reset form
      setLocation("");
      setAdvice("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Alert delivery failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md space-y-4 p-4 border rounded-lg"
    >
      <h3 className="font-semibold text-lg">Send Sandbox Risk SMS</h3>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Kisumu"
          required
        />
      </div>

      <div>
        <Label htmlFor="level">Risk Level</Label>
        <Input
          id="level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          placeholder="e.g. HIGH"
          required
        />
      </div>

      <div>
        <Label htmlFor="advice">Advice / Action Plan</Label>
        <Input
          id="advice"
          value={advice}
          onChange={(e) => setAdvice(e.target.value)}
          placeholder="e.g. Move livestock to higher ground."
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Sending..." : "Dispatch SMS"}
      </Button>
    </form>
  );
}
