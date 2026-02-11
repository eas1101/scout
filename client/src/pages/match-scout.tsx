import { useState } from "react";
import { useApp, ScoringItem } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Minus, RotateCcw } from "lucide-react";

export default function MatchScout() {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  
  const [matchNumber, setMatchNumber] = useState("");
  const [teamNumber, setTeamNumber] = useState("");
  const [alliance, setAlliance] = useState<"red" | "blue">("blue");
  const [scoutName, setScoutName] = useState("");
  
  // Initialize form data based on schema
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    state.schema.forEach(item => {
      if (item.type === "boolean") initial[item.id] = false;
      if (item.type === "score") initial[item.id] = item.min || 0;
      if (item.type === "grade") initial[item.id] = "C";
      if (item.type === "text") initial[item.id] = "";
    });
    return initial;
  });

  const handleReset = () => {
    setMatchNumber("");
    setTeamNumber("");
    const resetData: Record<string, any> = {};
    state.schema.forEach(item => {
      if (item.type === "boolean") resetData[item.id] = false;
      if (item.type === "score") resetData[item.id] = item.min || 0;
      if (item.type === "grade") resetData[item.id] = "C";
      if (item.type === "text") resetData[item.id] = "";
    });
    setFormData(resetData);
  };

  const handleSave = () => {
    if (!matchNumber || !teamNumber) {
      toast({
        title: "Missing Info",
        description: "Please enter Match Number and Team Number",
        variant: "destructive"
      });
      return;
    }

    const newRecord = {
      id: crypto.randomUUID(),
      matchNumber,
      teamNumber,
      alliance,
      scoutName,
      data: formData,
      timestamp: Date.now()
    };

    dispatch({ type: "ADD_MATCH_RECORD", payload: newRecord });
    
    toast({
      title: "Data Saved",
      description: `Match ${matchNumber} - Team ${teamNumber} saved successfully.`,
    });
    
    // Optional: Reset only team number for next match
    setTeamNumber("");
    // setMatchNumber((prev) => (parseInt(prev) + 1).toString()); // Auto increment
  };

  const updateField = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-primary">MATCH SCOUTING</h1>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>

      {/* Pre-Match Info */}
      <Card className="tech-border bg-card/50">
        <CardHeader>
          <CardTitle className="font-display text-sm tracking-wider text-muted-foreground">PRE-MATCH INFO</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Scout Name</Label>
            <Input 
              value={scoutName} 
              onChange={(e) => setScoutName(e.target.value)} 
              placeholder="Your Name"
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label>Match Number</Label>
            <Input 
              type="number" 
              value={matchNumber} 
              onChange={(e) => setMatchNumber(e.target.value)} 
              placeholder="#"
              className="bg-background/50 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Team Number</Label>
            <Input 
              type="number"
              value={teamNumber} 
              onChange={(e) => setTeamNumber(e.target.value)} 
              placeholder="####"
              className="bg-background/50 font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label>Alliance</Label>
            <div className="flex bg-background/50 rounded-md p-1 border border-input">
              <button
                onClick={() => setAlliance("blue")}
                className={`flex-1 rounded-sm text-sm font-bold py-1.5 transition-colors ${
                  alliance === "blue" ? "bg-blue-600 text-white" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                BLUE
              </button>
              <button
                onClick={() => setAlliance("red")}
                className={`flex-1 rounded-sm text-sm font-bold py-1.5 transition-colors ${
                  alliance === "red" ? "bg-red-600 text-white" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                RED
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Form */}
      <div className="space-y-4">
        {state.schema.sort((a, b) => a.order - b.order).map((item) => (
          <Card key={item.id} className="tech-border bg-card/30 hover:bg-card/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <Label className="text-lg font-display text-foreground/90">{item.label}</Label>
                
                {item.type === "score" && (
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-12 w-12 rounded-full border-primary/50 hover:bg-primary/20"
                      onClick={() => updateField(item.id, Math.max((item.min || 0), (formData[item.id] || 0) - 1))}
                    >
                      <Minus className="w-6 h-6" />
                    </Button>
                    <div className="flex-1 text-center font-mono text-4xl font-bold text-primary">
                      {formData[item.id]}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-12 w-12 rounded-full border-primary/50 hover:bg-primary/20"
                      onClick={() => updateField(item.id, Math.min((item.max || 99), (formData[item.id] || 0) + 1))}
                    >
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>
                )}

                {item.type === "boolean" && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">{formData[item.id] ? "COMPLETED" : "NOT COMPLETED"}</span>
                    <Switch 
                      checked={formData[item.id]}
                      onCheckedChange={(c) => updateField(item.id, c)}
                    />
                  </div>
                )}

                {item.type === "grade" && (
                  <RadioGroup 
                    value={formData[item.id]} 
                    onValueChange={(v) => updateField(item.id, v)}
                    className="flex justify-between gap-2"
                  >
                    {["S", "A", "B", "C", "D", "E", "F"].map((grade) => (
                      <div key={grade} className="flex flex-col items-center">
                        <RadioGroupItem value={grade} id={`${item.id}-${grade}`} className="peer sr-only" />
                        <Label
                          htmlFor={`${item.id}-${grade}`}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary font-bold font-mono transition-all"
                        >
                          {grade}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {item.type === "text" && (
                  <Textarea 
                    value={formData[item.id]}
                    onChange={(e) => updateField(item.id, e.target.value)}
                    placeholder="Enter notes here..."
                    className="bg-background/50 min-h-[100px]"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button 
        size="lg" 
        className="w-full h-14 text-lg font-display tracking-widest gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.4)]"
        onClick={handleSave}
      >
        <Save className="w-5 h-5" /> SAVE MATCH DATA
      </Button>
    </div>
  );
}
